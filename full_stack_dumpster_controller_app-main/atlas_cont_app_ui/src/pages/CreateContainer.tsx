import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createContainer } from '../store/containerSlice';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Varsayılan Leaflet ikonu ayarları (Eğer ikonlar yüklenmezse diye)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Mevcut konteynerler için soluk/farklı ikon
const existingContainerIcon = L.divIcon({
  className: '',
  html: `<div class="container-marker bg-slate-600/50 border border-slate-500 text-slate-300" style="width:24px;height:24px;font-size:10px;">•</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Arama yapıldığında kamerayı uçuracak yardımcı bileşen
const SearchMapController = ({ targetLat, targetLng }: { targetLat: number | null, targetLng: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (targetLat !== null && targetLng !== null) {
      map.flyTo([targetLat, targetLng], 15, { animate: true });
    }
  }, [targetLat, targetLng, map]);
  return null;
};

const CreateContainer = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { containers } = useAppSelector(state => state.containers);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  
  // Arama state'i
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTarget, setSearchTarget] = useState<{lat: number, lng: number} | null>(null);

  // Form UI'da görünecek kısımlar
  const [formData, setFormData] = useState({
    code: `CNT-${Math.floor(Math.random() * 900) + 100}`,
    name: 'Yeni Konteyner',
    district: 'Kadıköy',
    lat: 40.990,
    lng: 29.025,
    dimensions: {
      width: 100,
      height: 120,
      depth: 100,
      max_volume_cm3: 1200000,
      max_weight_kg: 200,
    },
  });

  // Calculate volume whenever dimensions change
  useEffect(() => {
    const vol = formData.dimensions.width * formData.dimensions.height * formData.dimensions.depth;
    if (vol !== formData.dimensions.max_volume_cm3) {
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, max_volume_cm3: vol }
      }));
    }
  }, [formData.dimensions.width, formData.dimensions.height, formData.dimensions.depth, formData.dimensions.max_volume_cm3]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isNumber = type === 'number';
    const finalValue = isNumber ? parseFloat(value) : value;

    if (name.startsWith('dim_')) {
      const field = name.replace('dim_', '');
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [field]: finalValue }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Arka planda id, ai_analysis ve items değerlerini ekleyelim
      const payload: any = {
        ...formData,
        id: Math.floor(Math.random() * 100000000),
        items: [],
        ai_analysis: {
          calculated_fill_rate: 0,
          current_weight_kg: 0,
          status: 'EMPTY',
          estimated_full_time: '> 1 gün',
          packing_efficiency: 95,
          last_ai_scan: 'Henüz taranmadı',
        }
      };
      await dispatch(createContainer(payload)).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Failed to create container:', error);
      alert('Kayıt başarısız. Lütfen verileri kontrol edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Haritada arama yapma fonksiyonu (Nominatim API)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=tr&countrycodes=tr`);
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        
        setSearchTarget({ lat: newLat, lng: newLng });
        setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
        
        // İsmi/Bölgeyi de güncellemeye çalış
        fetchDistrictName(newLat, newLng);
      } else {
        alert('Aradığınız konum bulunamadı.');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Ters Geocoding: Koordinattan İlçe/Mahalle bulma
  const fetchDistrictName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const districtName = addr.suburb || addr.town || addr.city_district || addr.city || addr.county || 'Bilinmiyor';
        setFormData(prev => ({ ...prev, district: districtName }));
      }
    } catch (error) {
      console.error('Reverse Geocoding error:', error);
    }
  };

  // Harita Tıklama ve OSRM Nearest API Bileşeni
  const LocationPicker = () => {
    useMapEvents({
      async click(e) {
        setIsSnapping(true);
        const { lat, lng } = e.latlng;
        try {
          // OSRM Nearest API'den tıklanan noktaya en yakın yolu bul
          const response = await axios.get(
            `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=1`
          );
          if (response.data && response.data.waypoints && response.data.waypoints.length > 0) {
            const snappedPoint = response.data.waypoints[0].location;
            const finalLat = snappedPoint[1];
            const finalLng = snappedPoint[0];
            // OSRM [longitude, latitude] döner
            setFormData(prev => ({
              ...prev,
              lat: finalLat,
              lng: finalLng
            }));
            fetchDistrictName(finalLat, finalLng);
          } else {
            // API'den sonuç dönmezse tıklanan yeri direkt al
            setFormData(prev => ({
              ...prev,
              lat,
              lng
            }));
            fetchDistrictName(lat, lng);
          }
        } catch (error) {
          console.error("OSRM Error:", error);
          setFormData(prev => ({ ...prev, lat, lng }));
        } finally {
          setIsSnapping(false);
        }
      }
    });

    return (
      <Marker position={[formData.lat, formData.lng]} />
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Yeni Konteyner Ekle</h1>
            <p className="text-emerald-300/60">Sisteme yeni bir akıllı çöp konteyneri tanımlayın.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-emerald-900/50 hover:bg-emerald-800/60 text-white rounded-lg transition-colors flex items-center gap-2 border border-emerald-700/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bölüm 1: Temel Bilgiler */}
          <div className="bg-emerald-950/40 backdrop-blur-xl border border-emerald-700/20 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">1</span>
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-1">Konteyner Kodu</label>
                <input required type="text" name="code" value={formData.code} onChange={handleChange} className="w-full bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-1">İsim/Açıklama</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-400/70 mb-1">Bölge/Mahalle (Otomatik)</label>
                <input readOnly type="text" name="district" value={formData.district} className="w-full bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2 text-emerald-300 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-400/70 mb-1">Enlem (Lat - Otomatik)</label>
                <input readOnly step="any" type="number" name="lat" value={formData.lat} className="w-full bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2 text-emerald-300 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-400/70 mb-1">Boylam (Lng - Otomatik)</label>
                <input readOnly step="any" type="number" name="lng" value={formData.lng} className="w-full bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2 text-emerald-300 outline-none cursor-not-allowed" />
              </div>
            </div>

            {/* Harita Arama Motoru (Form yerine Div kullandık çünkü iç içe form yasaktır) */}
            <div className="mt-6 flex gap-2 relative z-10">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Örn: Kadıköy Moda, Ankara Çankaya..." 
                className="flex-1 bg-emerald-950/60 border border-emerald-700/30 rounded-lg px-4 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors"
              />
              <button 
                type="button" 
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                )}
                Ara
              </button>
            </div>

            {/* Harita */}
            <div className="mt-3 rounded-xl overflow-hidden border border-emerald-700/20 relative z-0 h-[300px]">
              {isSnapping && (
                <div className="absolute inset-0 bg-[#06100c]/70 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-emerald-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white text-sm font-medium">Yol bulunuyor (Snap-to-Road)...</span>
                </div>
              )}
              <MapContainer 
                center={[formData.lat, formData.lng]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                />
                
                {/* Mevcut konteynerleri göster */}
                {containers.map(c => (
                  <Marker key={c.id} position={[c.lat, c.lng]} icon={existingContainerIcon}>
                    <Popup>
                      <div className="text-xs text-slate-800">
                        <strong>{c.code}</strong><br/>
                        Önceden eklenmiş konteyner.
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <LocationPicker />
                <SearchMapController targetLat={searchTarget?.lat ?? null} targetLng={searchTarget?.lng ?? null} />
              </MapContainer>
            </div>
            <p className="text-[10px] text-emerald-500/40 mt-2 text-center">
              * Harita üzerine tıklayarak konteynerin konumunu değiştirebilirsiniz. İşaretçi en yakın yol/sokak hattına otomatik sabitlenecektir.
            </p>
          </div>

          {/* Bölüm 2: Fiziksel Boyutlar */}
          <div className="bg-emerald-950/40 backdrop-blur-xl border border-emerald-700/20 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">2</span>
              Fiziksel Boyutlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-1">En (cm)</label>
                <input required min="1" type="number" name="dim_width" value={formData.dimensions.width} onChange={handleChange} className="w-full bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-1">Boy (cm)</label>
                <input required min="1" type="number" name="dim_height" value={formData.dimensions.height} onChange={handleChange} className="w-full bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-1">Derinlik (cm)</label>
                <input required min="1" type="number" name="dim_depth" value={formData.dimensions.depth} onChange={handleChange} className="w-full bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-teal-400/80 mb-1">Max Hacim (cm³) - Otomatik</label>
                <input readOnly type="number" name="dim_max_volume_cm3" value={formData.dimensions.max_volume_cm3} className="w-full bg-teal-900/15 border border-teal-800/30 rounded-lg px-3 py-2 text-teal-200 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/60 mb-1">Max Ağırlık Kapasitesi (kg)</label>
                <input required min="1" type="number" name="dim_max_weight_kg" value={formData.dimensions.max_weight_kg} onChange={handleChange} className="w-full bg-emerald-950/50 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-50 outline-none focus:border-emerald-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-4 pb-12 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Konteyner Kaydediliyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Konteyneri Sisteme Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContainer;

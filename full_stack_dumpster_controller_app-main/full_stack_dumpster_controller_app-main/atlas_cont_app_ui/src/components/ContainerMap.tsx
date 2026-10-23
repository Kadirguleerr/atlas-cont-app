import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectContainer } from '../store/containerSlice';
import type { Container } from '../types/container';

// Özel harita ikonu (marker) oluşturan yardımcı fonksiyon
// Doluluk oranını ve konteynerin durumunu alarak HTML tabanlı dinamik bir ikon döndürür
const createContainerIcon = (fillRate: number, status: string) => {
  return L.divIcon({
    className: '',
    html: `<div class="container-marker status-${status.toLowerCase()}" style="width:36px;height:36px;">%${fillRate}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18], // İkonun haritaya oturduğu merkez noktası (tam ortası)
  });
};

// Harita üzerindeki kamera hareketlerini kontrol eden görünmez fonksiyonel bileşen
const MapController = ({ selectedId, containers }: { selectedId: number | null; containers: Container[] }) => {
  const map = useMap(); // Mevcut Leaflet harita nesnesine erişim sağlar

  useEffect(() => {
    // Eğer listeden veya haritadan bir konteyner seçildiyse, harita kamerasını
    // animasyonlu (flyTo) bir şekilde oraya kaydırır
    if (selectedId) {
      const container = containers.find(c => c.id === selectedId);
      if (container) {
        map.flyTo([container.lat, container.lng], 15, { animate: true });
      }
    }
  }, [selectedId, containers, map]); // Bağımlılıklar (seçim durumu) değiştiğinde tekrar çalışır

  return null; // Görsel olarak haritada hiçbir şey çizmez, sadece arkada kural/mantık çalıştırır
};

// Ana Harita Bileşeni (UI tarafında Map ekranında gördüğümüz her şey)
const ContainerMap = () => {
  const dispatch = useAppDispatch(); // Redux üzerinden eylem (action) tetiklemek için kullanılır
  
  // Redux mağazasından (store) uygulamanın anlık durumlarını çeker: Konteynerler,
  // seçilen durum filtresi, arama metni ve seçili id
  const { containers, filterStatus, searchQuery, selectedContainerId } = useAppSelector((state) => state.containers);

  // Performans optimizasyonu: `useMemo` sayesinde gereksiz render'lar önlenir.
  // Filtrelenmiş liste sadece arama metni, filtre veya konteyner verisi değiştiğinde yeniden hesaplanır.
  const filteredContainers = useMemo(() => {
    return containers.filter(c => {
      // 1. Durum Filtresi: Filtre 'ALL' (Tümü) ise hepsi geçer, değilse sadece durumu eşleşenler geçer.
      const statusMatch = filterStatus === 'ALL' || c.ai_analysis.status === filterStatus;
      
      // 2. Arama Filtresi: İsim, kod veya ilçe içinde kullanıcının aradığı metin varsa eşleşir.
      const searchMatch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase());
        
      return statusMatch && searchMatch;
    });
  }, [containers, filterStatus, searchQuery]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden glass-card relative z-0">
      {/* MapContainer: Leaflet haritasını başlatan en üst sarmalayıcı (wrapper). Başlangıç noktası olarak Ankara belirlenmiş. */}
      <MapContainer
        center={[39.925, 32.86]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={true}
      >
        {/* TileLayer: Haritanın çizimlerini (sokak, yol vs.) çekmek için bir altlık.
            Esri World Dark Gray kullanılıyor — API key gerektirmez, production ortamında (Vercel vb.) sorunsuz çalışır. */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Filtreden geçen her bir konteyner için harita üzerine bir 'Marker' (işaretçi) ekler */}
        {filteredContainers.map(container => (
          <Marker
            key={container.id}
            position={[container.lat, container.lng]} // İşaretçinin koordinatları
            icon={createContainerIcon(container.ai_analysis.calculated_fill_rate, container.ai_analysis.status)} // HTML İkonu
            eventHandlers={{
              // İkona tıklandığında, tıklanan konteyneri Redux state'inde "seçili" duruma getirir
              click: () => dispatch(selectContainer(container.id))
            }}
          >
            {/* Sadece kullanıcının seçtiği/tıkladığı konteynerin üzerinde bilgi balonu (Popup) gösterilir */}
            {selectedContainerId === container.id && (
              <Popup>
                <div className="font-semibold text-slate-800">{container.name}</div>
                <div className="text-sm text-slate-600">{container.code} • {container.district}</div>
                <div className="text-sm font-bold mt-1">Doluluk: %{container.ai_analysis.calculated_fill_rate}</div>
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Haritada bir nokta seçildiğinde, kamerayı oraya götürmekle görevli olan görünmez yardımcı bileşenimiz. */}
        <MapController selectedId={selectedContainerId} containers={containers} />
      </MapContainer>
    </div>
  );
};

export default ContainerMap;

import { type Container } from '../types/container';

/**
 * ATLAS SMART CITY MONITORING SYSTEM - DATA MODEL FORMAT MANUAL
 * 
 * Bu dosya, sistemdeki her bir akıllı çöp konteynırını temsil eden veri modelinin 
 * detaylı şemasını ve alan açıklamalarını içerir. 
 * Sunucu (Backend) veya Yapay Zeka servislerinden gelecek veriler bu formata uygun olmalıdır.
 */

export const sampleContainerFormat: Container = {
  // Benzersiz veritabanı ID'si (Ön yüzde react key'leri ve yönlendirmeler için kullanılır)
  id: 1,

  // Konteynırın fiziksel barkod/kod numarası (Örn: Envanter takibi için)
  code: 'CNT-101',

  // Konteynırın adı veya bulunduğu lokasyonun belirgin tanımı
  name: 'Atatürk Bulvarı Konteyneri',

  // Konteynırın bulunduğu ilçe/semt bilgisi (Filtreleme kolaylığı sağlar)
  district: 'Kızılay',

  // Haritada doğru yere yerleştirilmesi için enlem (latitude) değeri
  lat: 39.9208,

  // Haritada doğru yere yerleştirilmesi için boylam (longitude) değeri
  lng: 32.8541,

  // Konteynırın fiziksel boyutları (Hacim ve doluluk kapasitesi hesaplamaları için kritik)
  dimensions: {
    width: 130,          // Konteynırın iç genişliği (cm cinsinden)
    height: 150,         // Konteynırın iç yüksekliği (cm cinsinden)
    depth: 100,          // Konteynırın iç derinliği (cm cinsinden)
    max_volume_cm3: 1950000, // Toplam iç hacim (Genişlik x Yükseklik x Derinlik = cm³)
    max_weight_kg: 450   // Konteynırın taşıyabileceği maksimum ağırlık kapasitesi (kg)
  },

  // Konteynırın içindeki nesneler (Akıllı kamera veya 3D sensörlerden gelen ham veriler)
  // Bu dizi, AI modeline gönderilen girdi verisidir.
  items: [
    {
      id: 'item-101-1',         // Nesneye ait benzersiz ID
      name: 'Karton Kutu (Büyük)', // AI kamerasının algıladığı nesne tanımı
      category: 'PAPER',        // Nesnenin atık kategorisi (Konteynırın türüyle uyumluluk için)
      width: 50,                // Nesnenin genişliği (cm)
      height: 40,               // Nesnenin yüksekliği (cm)
      depth: 30,                // Nesnenin derinliği (cm)
      volume_cm3: 60000,        // Nesnenin hacmi (En x Boy x Yükseklik = cm³)
      weight_kg: 1.8,           // Nesnenin tahmini ağırlığı (kg)
      confidence: 0.96,         // Yapay zekanın nesneyi doğru tanıma olasılığı (%96)
      detected_at: '6 dk önce'  // Nesnenin konteynıra atıldığı/algılandığı göreceli zaman
    },
    {
      id: 'item-101-2',
      name: 'Plastik Su Şişesi (6-lı)',
      category: 'PLASTIC',
      width: 30,
      height: 25,
      depth: 20,
      volume_cm3: 15000,
      weight_kg: 0.9,
      confidence: 0.98,
      detected_at: '14 dk önce'
    }
  ],

  // Yapay Zeka (AI) tarafından nesneler ve konteynır boyutları analiz edilerek üretilen sonuçlar.
  // Ön yüz bu analiz verilerini görselleştirerek operatörlere sunar.
  ai_analysis: {
    // AI'ın 3D paketleme/istiflenme algoritmasıyla hesapladığı gerçek hacimsel doluluk yüzdesi (0-100)
    calculated_fill_rate: 92,

    // Konteynır içindeki tüm nesnelerin ağırlıkları toplamı (kg)
    current_weight_kg: 342.5,

    // Konteynırın doluluk durumuna göre AI'ın belirlediği alarm seviyesi
    // 'EMPTY' (Boş: 0-24), 'NORMAL' (25-59), 'WARNING' (Uyarı: 60-74), 'CRITICAL' (Kritik: 75+)
    status: 'CRITICAL',

    // AI'ın geçmiş dolma hızlarını analiz ederek ürettiği "tamamen taşma" süresi tahmini
    estimated_full_time: '45 dk',

    // Nesnelerin konteynır içerisine ne kadar verimli yerleştiğinin yüzdesi (Boşluk optimizasyonu)
    packing_efficiency: 88,

    // AI tarama motorunun bu konteynırı en son ne zaman analiz ettiği bilgisi
    last_ai_scan: '5 dk önce'
  }
};

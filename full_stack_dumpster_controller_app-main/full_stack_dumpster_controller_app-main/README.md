# Atlas Cont App

Atlas Cont App, konteyner yönetimi ve izleme için geliştirilmiş bir web uygulamasıdır. Proje iki ana bileşenden oluşur:

- Backend: NestJS + MongoDB
- Frontend: React + Vite + TypeScript

Uygulama kapsamında konteyner oluşturma, silme, simülasyon, çöp ekleme, istatistik takibi ve harita görünümü gibi işlemler yer alır.

---

## Teknoloji Yığını

### Backend
- Node.js
- NestJS
- TypeScript
- MongoDB + Mongoose

### Frontend
- React
- Vite
- TypeScript
- Redux Toolkit
- Leaflet + React Leaflet
- Axios

---

## Proje Yapısı

```text
atlas_cont_app/
├── atlas_cont_app_api/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── atlas_cont_app_ui/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
└── README.md
```

---

## Ön Gereksinimler

Aşağıdaki araçların sisteminizde kurulu olması gerekir:

- Node.js 18+ / 20+
- npm
- MongoDB çalışır durumda olmalı
- Git (opsiyonel)

---

## Kurulum

### 1) Projeyi klonlayın

```bash
git clone <repo-url>
cd atlas_cont_app
```

### 2) Backend bağımlılıklarını kurun

```bash
cd atlas_cont_app_api
npm install
```

### 3) Frontend bağımlılıklarını kurun

```bash
cd ../atlas_cont_app_ui
npm install
```

---

## Çevre Değişkenleri

### Backend için .env örneği

Backend dizininde `.env` dosyası oluşturun:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/atlas_cont_app
PORT=3000
```

`MONGODB_URI` alanı uygulamanın MongoDB bağlantısını sağlar. Eğer farklı bir MongoDB adresi kullanıyorsanız bunu değiştirmeniz yeterlidir.

### Frontend için .env örneği

Frontend dizininde `.env` dosyasına şu satırı ekleyin:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Bu değer, React uygulamasının API isteklerini gideceği backend adresini belirtir.

---

## Çalıştırma

### Backend başlatma

```bash
cd atlas_cont_app_api
npm run start:dev
```

Backend varsayılan olarak şu adreste çalışır:

```text
http://localhost:3000
```

### Frontend başlatma

Yeni bir terminal açıp:

```bash
cd atlas_cont_app_ui
npm run dev
```

Frontend varsayılan olarak şu adreste açılır:

```text
http://localhost:5173
```

---

## Uygulama Özellikleri

- Konteyner listesi görüntüleme
- Yeni konteyner oluşturma
- Konteyner silme
- Konteyner detay görüntüleme
- Simülasyon çalıştırma
- Tüm konteynerleri simüle etme
- Rastgele çöp ekleme
- İstatistik paneli
- Harita tabanlı görünüm
- Redux ile durum yönetimi

---

## Kullanılan Scriptler

### Backend

```bash
npm run build
npm run start
npm run start:dev
npm run test
npm run lint
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Sorun Giderme

### API ile bağlantı kurulamadıysa
- Backend servisinin çalıştığından emin olun.
- `.env` dosyasındaki `MONGODB_URI` ve `PORT` değerlerini kontrol edin.
- Frontend `.env` dosyasındaki `VITE_API_BASE_URL` değerinin backend adresiyle eşleştiğinden emin olun.

### MongoDB bağlantı hatası alıyorsanız
- MongoDB servisinin açık olduğundan emin olun.
- `mongodb://127.0.0.1:27017/atlas_cont_app` adresinin doğru olduğuna bakın.
- Veritabanı adının mevcut olduğundan emin olun.

---

## Geliştirme Notları

Bu proje, backend ve frontend katmanlarını ayrı tutan modern bir yapıdadır. Böylece API mantığı ile UI mantığı birbirinden bağımsız şekilde geliştirilebilir. İhtiyaç halinde backend endpointleri ve frontend bağlantıları kolayca genişletilebilir.

---

## Lisans

Bu proje özel kullanım ve geliştirme amaçlıdır. Lisans bilgisi için repository sahibi ile iletişime geçiniz.

---

## İletişim

Projeyle ilgili geliştirme ve entegrasyon sorularınız için ekip içindeki ilgili geliştiriciyle iletişime geçebilirsiniz.

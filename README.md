# Futbol Grafik Stüdyosu

Profesyonel futbol grafikleri oluşturmak için tasarlanmış web uygulaması. YouTube içerik üreticileri için özel olarak geliştirilmiştir.

## Özellikler

- **Grafik Editörü**: Canvas tabanlı, sürükle-bırak editör
- **Süper Lig Desteği**: 19 takımın renkleri ve bilgileri hazır
- **4K Export**: 3840x2160 çözünürlükte profesyonel çıktı
- **Çoklu Format**: 1:1 (Instagram) ve 16:9 (YouTube) boyutları
- **Takım Renkleri**: Fenerbahçe, Galatasaray ve diğer takımların resmi renkleri

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç
http://localhost:3000
```

## Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın:

```bash
cp .env.example .env.local
```

## Teknolojiler

- **Framework**: Next.js 14
- **UI**: Tailwind CSS
- **Canvas**: HTML5 Canvas API
- **State**: React Hooks
- **Deployment**: Vercel

## Kullanım

1. Ana sayfadan "Yeni Grafik" butonuna tıklayın
2. Şablon kategorisi seçin (Maç Kartı, Kadro, Puan Durumu, Transfer)
3. Canvas üzerinde düzenlemeler yapın
4. İstediğiniz boyutta export edin (4K destekli)

## Lisans

MIT

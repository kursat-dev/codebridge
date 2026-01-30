# CoreBridge Kullanım Kılavuzu

Bu kılavuz, CoreBridge'i GitHub'dan indiren bir geliştiricinin aracı nasıl ve hangi amaçlarla kullanabileceğini adım adım anlatır.

## 🎯 Ne İçin Kullanılır?

CoreBridge şu senaryolar için mükemmeldir:

1.  **Yeni Başlangıç (Greenfield):** Web ve Mobil uygulaması olacak yeni bir projeye başlarken, iş mantığını en baştan ayrıştırarak "clean architecture" kurmak.
2.  **Mevcut Projeyi Dönüştürme:** Sadece Web API'si olan bir Node.js projesine Mobil uygulama eklemek istediğinizde, mevcut iş mantığını "Core" paketine taşıyıp ortaklaştırmak.
3.  **Standartlaşma:** Ekip içinde API standartlarını (OpenAPI) ve kod yapısını (Adapter pattern) otomatize etmek.

---

## 🚀 Örnek Senaryo: "TaskMaster" Uygulaması

Diyelim ki bir "Görev Yönetim Uygulaması" (TaskMaster) yapıyorsunuz. Hem Web paneli olacak hem de iPhone uygulaması.

### Adım 1: Kurulum

CoreBridge CLI'ı global olarak yükleyin veya projenize ekleyin:

```bash
npm install -g corebridge
# veya
npx corebridge --help
```

### Adım 2: Projeyi Başlatma

Boş bir klasör açın ve CoreBridge'i başlatın:

```bash
mkdir task-master-backend
cd task-master-backend
corebridge init
```

Bu komut `corebridge.config.json` dosyasını oluşturur. Bu dosyayı projenize göre düzenleyin:

```json
{
  "domains": ["user", "task"],
  "adapters": ["web", "mobile"],
  "outputDir": "./packages"
}
```

### Adım 3: Paketleri Oluşturma (Scaffolding)

Şimdi CoreBridge'in sizin yerinize kod üretmesini sağlayın:

```bash
corebridge generate
```

Bu komut şunları üretir:
*   `packages/core`: İş mantığınızın (use-case'ler, modeller) yaşayacağı yer.
*   `packages/contracts`: API dokümantasyonunuz (OpenAPI).
*   `packages/adapter-web`: Web siteniz için gereken API katmanı.
*   `packages/adapter-mobile`: Mobil uygulamanız için gereken API katmanı.

### Adım 4: İş Mantığını Doldurma (Sizin Göreviniz)

CoreBridge iskeleti kurdu, şimdi içini doldurmalısınız.

**1. Repository Implementasyonu:**
Veritabanı bağlantısını (`infrastructure` klasöründe) siz yazarsınız. CoreBridge size `IProjectRepository` interface'ini verir, siz bunu Postgres veya MongoDB ile doldurursunuz.

```typescript
// infrastructure/PostgresUserRepository.ts
import { IUserRepository } from '@corebridge/core';

export class PostgresUserRepository implements IUserRepository {
    async findById(id: string) {
        // SQL sorgusu burada çalışır
        return db.query('SELECT * FROM users WHERE id = $1', [id]);
    }
}
```

**2. Web Sunucusunu Ayağa Kaldırma:**
Bir Express sunucusu kurup, adapter'ı kullanın:

```typescript
// server.ts
import express from 'express';
import { createWebAdapter } from '@corebridge/adapter-web';
import { PostgresUserRepository } from './infrastructure/PostgresUserRepository';

const app = express();
const adapter = createWebAdapter({
    userRepository: new PostgresUserRepository(), // Dependency Injection
    // ... diğer servisler
});

app.use('/api', adapter.router);
app.listen(3000);
```

### Adım 5: Kullanım

Artık aynı core mantığı kullanan iki farklı API'niz var:

*   **Web Frontend İsteği:**
    *   Browser `POST /api/projects` atar.
    *   `adapter-web`: Session cookie kontrolü yapar, CSRF token bakar.
    *   `core`: Projeyi oluşturur.

*   **Mobil Uygulama İsteği:**
    *   Mobil App `POST /api/projects` atar.
    *   `adapter-mobile`: Gönderilen `Bearer Token`'ı doğrular, `X-Device-ID` logosunu alır.
    *   `core`: (Aynı kod!) Projeyi oluşturur.
    *   `adapter-mobile`: Cevaba `_offline` bayrakları ekleyip döner.

---

## 🌟 Özet

CoreBridge sizin için **"Tesisatçılık"** yapar:
*   ✅ Klasör yapısını kurar.
*   ✅ TypeScript ayarlarını yapar.
*   ✅ Web ve Mobil için farklı kuralları (Headerlar, Auth tipleri) ayarlar.
*   ✅ API dokümanını (Swagger/OpenAPI) otomatik hazırlar.

Siz sadece **"İşinize"** odaklanırsınız:
*   🏗️ Veritabanı sorguları yazmak.
*   🧠 "Bir proje oluşturulurken isim benzersiz olmalı" gibi iş kurallarını kodlamak.

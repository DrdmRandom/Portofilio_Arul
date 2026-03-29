# Porto Arul

Landing page portfolio React untuk Arul (ILKOM) dengan fokus PR + content creator.

## Jalankan Project

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm dev
```

Jika kamu pakai npm:

```bash
npm install
npm run dev
```

## Struktur CMS Strapi (CMS_Arul)

Karena kamu mau CMS hanya untuk `IG content` dan `Work experience`, setup paling aman:

1. Tetap pakai collection type `CMS_Arul`.
2. Tambahkan field repeatable component atau relation list:
   - `ig_contents` (repeatable)
     - `title` (text)
     - `caption` (text)
     - `platform` (text)
     - `metric` (text)
     - `publishedAt` (date)
     - `postUrl` (text)
     - `thumbnail` (media single image)
   - `work_experiences` (repeatable)
     - `role` (text)
     - `company` (text)
     - `period` (text)
     - `summary` (rich text / text)
     - `highlights` (json array atau repeatable text)
3. Isi minimal 1 entry di `CMS_Arul`.
4. Buka `Settings > Users & Permissions Plugin > Roles > Public`.
5. Aktifkan permission `find` + `findOne` untuk `CMS_Arul`.
6. Simpan lalu test endpoint:
   - `https://strapi.cihuy-familly.my.id/api/cms-aruls?populate=*`

## Integrasi Frontend

- Base URL diatur dari `VITE_STRAPI_URL` (lihat `.env.example`).
- Frontend akan mencoba endpoint kandidat:
  - `/api/cms-aruls?populate=*`
  - `/api/cms-arul?populate=*`
  - `/api/cms_aruls?populate=*`
- Kalau CMS belum siap/public, UI otomatis pakai fallback data lokal supaya landing page tetap tampil.

## Deploy Dengan Podman

File deploy yang sudah disiapkan:
- `Dockerfile`
- `nginx.conf`
- `podman-compose.yml`

Jalankan dari PowerShell:

```powershell
cd "D:\Users\dawwi\Documents\Playground\porto_arul"

# Optional: override URL CMS dan port app
$env:VITE_STRAPI_URL="https://strapi.cihuy-familly.my.id"
$env:APP_PORT="3003"

podman compose -f podman-compose.yml up -d --build
```

Cek container:

```powershell
podman ps
podman logs -f porto_arul_web
```

Stop:

```powershell
podman compose -f podman-compose.yml down
```

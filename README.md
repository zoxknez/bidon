# 🛢️ Bidon - Aplikacija za Praćenje Goriva

Moderna PWA aplikacija za evidenciju i praćenje sipanja goriva iz bidona (rezervoara). Idealna za poljoprivredna gazdinstva, transportne firme i svakoga ko koristi više vozila i mašina.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

## ✨ Funkcionalnosti

### 🛢️ Upravljanje Bidonima
- Više bidona sa prilagođenim imenima
- Animirani prikaz nivoa goriva
- Praćenje dopuna sa cenom po litru
- Automatski proračun troškova u RSD

### 🚗 Upravljanje Vozilima
- Prilagođeni tipovi vozila (traktor, kombajn, automobil, itd.)
- Evidencija registracija
- Povezivanje sa sektorima

### 📊 Izveštaji
- Potrošnja po vozilu
- Potrošnja po sektoru
- Vremenski izveštaji (nedeljno/mesečno/godišnje)
- Prosečna cena goriva po periodima

### 🔐 Autentikacija
- Jednostavna prijava bez registracije
- Zaštićene rute

### 📱 PWA Podrška
- Instalacija na mobilne uređaje
- Rad offline (uskoro)
- Push notifikacije (uskoro)

## 🚀 Brzi Start

### Preduslovi

- Node.js 18+
- npm ili yarn
- Vercel Postgres baza (ili druga PostgreSQL baza)

### Instalacija

1. **Kloniraj repozitorijum:**
```bash
git clone https://github.com/zoxknez/bidon.git
cd bidon
```

2. **Instaliraj zavisnosti:**
```bash
npm install
```

3. **Podesi environment varijable:**

Kreiraj `.env.local` fajl:
```env
# Baza podataka (Vercel Postgres ili druga PostgreSQL)
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# NextAuth.js
NEXTAUTH_SECRET="tvoj-secret-key-generisi-sa-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Inicijalizuj bazu:**
```bash
npm run db:push
npm run db:seed
```

5. **Pokreni development server:**
```bash
npm run dev
```

6. **Otvori u browseru:**
[http://localhost:3000](http://localhost:3000)

### Podrazumevani kredencijali

- **Korisničko ime:** `user`
- **Lozinka:** `pass`

## 🏗️ Tehnologije

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Jezik:** [TypeScript](https://www.typescriptlang.org/)
- **Stilovi:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Komponente:** [shadcn/ui](https://ui.shadcn.com/)
- **Baza:** [Vercel Postgres](https://vercel.com/storage/postgres) + [Drizzle ORM](https://orm.drizzle.team/)
- **Autentikacija:** [NextAuth.js v5](https://authjs.dev/)
- **Animacije:** [Framer Motion](https://www.framer.com/motion/)
- **Grafikoni:** [Recharts](https://recharts.org/)
- **PWA:** [next-pwa](https://github.com/shadowwalker/next-pwa)

## 📁 Struktura Projekta

```
src/
├── app/                    # Next.js App Router stranice
│   ├── (dashboard)/        # Zaštićene stranice
│   │   ├── bidoni/         # Upravljanje bidonima
│   │   ├── vozila/         # Upravljanje vozilima
│   │   ├── sektori/        # Upravljanje sektorima
│   │   ├── tocenje/        # Točenje goriva
│   │   ├── izvestaji/      # Izveštaji
│   │   └── podesavanja/    # Podešavanja
│   ├── login/              # Stranica za prijavu
│   └── api/                # API rute
├── components/             # React komponente
│   ├── ui/                 # shadcn/ui komponente
│   ├── layout/             # Layout komponente
│   └── fuel-bidon.tsx      # Animirani bidon
├── lib/                    # Pomoćne biblioteke
│   ├── db/                 # Drizzle šema i konekcija
│   └── auth.ts             # NextAuth konfiguracija
├── actions/                # Server Actions
└── scripts/                # Skripte (seed, itd.)
```

## 📜 Dostupne Skripte

```bash
npm run dev        # Pokreni development server
npm run build      # Napravi production build
npm run start      # Pokreni production server
npm run lint       # Proveri kod sa ESLint
npm run db:push    # Sinhronizuj šemu sa bazom
npm run db:studio  # Otvori Drizzle Studio
npm run db:seed    # Popuni bazu početnim podacima
```

## 🌐 Deployment na Vercel

1. Pushuj kod na GitHub
2. Poveži repozitorijum sa Vercel-om
3. Dodaj environment varijable u Vercel dashboard
4. Koristi Vercel Postgres kao bazu
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zoxknez/bidon)

## 📄 Licenca

MIT License - slobodno koristite za lične i komercijalne projekte.

## 👨‍💻 Autor

Kreirano sa ❤️ za poljoprivrednike i male firme.

---

⭐ Ako vam se sviđa projekat, ostavite zvezdicu na GitHub-u!

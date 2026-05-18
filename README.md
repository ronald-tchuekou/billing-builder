# Billing Builder

Application personnelle Next.js de création, gestion et envoi de factures.

## Stack

- **Next.js 15** (App Router, front + back)
- **Neon** (PostgreSQL serverless)
- **Drizzle ORM** + drizzle-kit
- **BetterAuth** (email/password)
- **TanStack Query** (appels serveur côté client)
- **Zustand** (state management, brouillon de facture persistant)
- **@react-pdf/renderer** (génération PDF côté serveur)
- **shadcn/ui** + Tailwind CSS
- **Nodemailer** (SMTP, pour l'envoi futur)

## Mise en route

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Variables d'environnement

Copie `.example.env` vers `.env` puis renseigne :

```env
DATABASE_URL="postgres://USER:PASSWORD@HOST/DB?sslmode=require"
BETTER_AUTH_SECRET="<openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Billing Builder"

# SMTP (optionnel, pour envoi d'email)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Ronald <no-reply@example.com>"
```

Crée une base sur [neon.tech](https://neon.tech) et colle l'URL Postgres dans `DATABASE_URL`.

### 3. Migrations Drizzle

Génère et applique le schéma sur Neon :

```bash
pnpm db:generate   # crée les fichiers SQL dans drizzle/
pnpm db:push       # applique directement le schéma (dev)
# ou
pnpm db:migrate    # applique les migrations versionnées
```

Tu peux ouvrir Drizzle Studio :

```bash
pnpm db:studio
```

### 4. Démarrer

```bash
pnpm dev
```

L'app est disponible sur http://localhost:3000.

## Structure

```
src/
├── app/
│   ├── (dashboard)/           # routes protégées
│   │   ├── dashboard/         # accueil tableau de bord
│   │   ├── clients/           # CRUD clients
│   │   ├── invoices/          # CRUD factures + détail
│   │   ├── profile/           # profil utilisateur
│   │   └── settings/          # infos émetteur + coordonnées bancaires
│   ├── auth/                  # login, register, forgot, reset
│   ├── verify/                # vérification email
│   └── api/
│       ├── auth/[...all]/     # handler BetterAuth
│       ├── clients/           # API clients
│       ├── invoices/          # API factures
│       │   └── [id]/pdf       # génération PDF
│       └── me/                # profil utilisateur
├── components/
│   ├── dashboard/             # Sidebar, Topbar
│   ├── providers/             # QueryProvider, Providers
│   └── ui/                    # primitives shadcn
├── features/
│   ├── auth/                  # zod schemas
│   ├── clients/               # form + hooks + schemas
│   ├── invoices/              # form + hooks + schemas + pdf
│   └── profile/               # hooks + schemas
├── lib/
│   ├── auth.ts / auth-client.ts
│   ├── db/                    # drizzle + schemas (auth, clients, invoices)
│   ├── env/                   # validation zod des env vars
│   ├── helpers/               # session, invoice-number, mail
│   ├── stores/                # zustand stores (ui, invoice-draft)
│   └── utils.ts
├── services/                  # fetch wrappers (clients, invoices)
└── types/                     # types partagés
```

## Flow

1. Crée ton compte sur `/auth/register`.
2. Renseigne tes infos émetteur dans `/settings` (raison sociale, IBAN/BIC, banque, etc).
3. Ajoute tes clients dans `/clients`.
4. Crée une facture depuis `/invoices/new` (lignes prestation + acomptes optionnels).
5. Télécharge le PDF depuis la page de détail de la facture.

## À venir (hors MVP)

- Envoi automatique par email (helper Nodemailer déjà présent dans `lib/helpers/mail.ts`)
- Templates de prestations récurrentes
- Multi-devise avec conversion
- Tableau de bord avec statistiques avancées
- Export comptable (CSV)

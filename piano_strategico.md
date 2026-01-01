# Piano Strategico - Didattica STEM
## Da Progetto Locale a Piattaforma Nazionale

**Versione**: 1.0  
**Data**: Gennaio 2026  
**Autore**: Giovanni Ugolini

---

## Executive Summary

Questo documento delinea la strategia per trasformare il progetto Didattica STEM da applicazione React statica su GitHub Pages a piattaforma educativa nazionale con autenticazione, persistenza dati e funzionalità collaborative per studenti e docenti.

**Obiettivo**: Creare una piattaforma didattica interattiva per matematica e fisica, accessibile a scuole di tutta Italia, con tracciamento progressi e strumenti per docenti.

---

## Stato Attuale

| Aspetto | Situazione |
|---------|------------|
| **Stack** | React + TypeScript + Tailwind + KaTeX + Vite |
| **Hosting** | GitHub Pages (statico, gratuito) |
| **Demo** | 18+ demo interattive completate |
| **Autenticazione** | Nessuna |
| **Database** | Nessuno |
| **Costi** | Zero |

**Punti di forza**:
- Codebase solido e ben strutturato
- Componenti riutilizzabili (StepByStep, Latex, Responsive)
- Utility matematiche centralizzate
- Riduzione codice ~35% grazie al refactoring

---

## Architettura Target

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                  React / Next.js (Vercel)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Landing Page│  │ Demo STEM   │  │ Dashboard Docente   │  │
│  │   (SSR)     │  │(Client-side)│  │ Dashboard Studente  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                       Supabase                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │  Database   │  │      Storage        │  │
│  │ Email/Google│  │ PostgreSQL  │  │  File, immagini     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Fasi di Implementazione

### Fase 1: Fondamenta (1-2 settimane)
**Obiettivo**: Aggiungere autenticazione e database mantenendo React attuale

| Task | Dettaglio | Priorità |
|------|-----------|----------|
| Setup Supabase | Creare progetto, configurare auth | 🔴 Alta |
| Integrazione Auth | Context React, login/logout, protezione route | 🔴 Alta |
| Schema Database | Tabelle users, progress, classes | 🔴 Alta |
| Migrazione Vercel | Deploy da GitHub, dominio custom | 🔴 Alta |
| Acquisto dominio | Registrazione dominio .it | 🟡 Media |

**Deliverable**: App con login funzionante, deploy su Vercel

---

### Fase 2: Persistenza Dati (2-3 settimane)
**Obiettivo**: Salvare progressi studenti e creare dashboard base

| Task | Dettaglio | Priorità |
|------|-----------|----------|
| Tracciamento progressi | Salvataggio esercizi completati, punteggi | 🔴 Alta |
| Profilo utente | Pagina profilo con statistiche personali | 🔴 Alta |
| Dashboard studente | Vista progressi, esercizi recenti | 🔴 Alta |
| Ruoli utente | Distinzione studente/docente | 🟡 Media |

**Deliverable**: Studenti possono vedere i propri progressi

---

### Fase 3: Funzionalità Docente (3-4 settimane)
**Obiettivo**: Strumenti per gestione classi e monitoraggio

| Task | Dettaglio | Priorità |
|------|-----------|----------|
| Gestione classi | Creazione classe, codice invito | 🔴 Alta |
| Dashboard docente | Vista progressi classe, statistiche | 🔴 Alta |
| Assegnazione compiti | Assegna demo/quiz con scadenza | 🟡 Media |
| Export dati | CSV/PDF progressi classe | 🟡 Media |
| Notifiche | Email per scadenze, risultati | 🟢 Bassa |

**Deliverable**: Docenti possono gestire classi e monitorare studenti

---

### Fase 4: Migrazione Next.js (2-3 settimane)
**Obiettivo**: Architettura moderna per scalabilità e SEO

| Task | Dettaglio | Priorità |
|------|-----------|----------|
| Setup Next.js | Nuovo progetto, configurazione | 🟡 Media |
| Migrazione componenti | Spostamento UI e utils | 🟡 Media |
| Conversione pagine | Demo come route Next.js | 🟡 Media |
| SSR landing page | Homepage ottimizzata SEO | 🟡 Media |
| API routes | Endpoint per operazioni backend | 🟡 Media |

**Deliverable**: App Next.js completa con SSR dove utile

---

### Fase 5: Scala Nazionale (ongoing)
**Obiettivo**: Crescita utenti e funzionalità avanzate

| Task | Dettaglio | Priorità |
|------|-----------|----------|
| SEO e marketing | Indicizzazione, social, contatti scuole | 🟡 Media |
| Quiz system | Sistema quiz con valutazione automatica | 🟡 Media |
| Contenuti docenti | Docenti creano quiz personalizzati | 🟢 Bassa |
| Gamification | Badge, classifiche, streak | 🟢 Bassa |
| Mobile app | PWA o React Native | 🟢 Bassa |
| SPID (opzionale) | Autenticazione identità digitale | 🟢 Bassa |

---

## Stack Tecnologico Raccomandato

### Frontend
| Tecnologia | Motivazione |
|------------|-------------|
| **React** (ora) / **Next.js** (futuro) | Continuità, SSR quando serve |
| **TypeScript** | Già in uso, type safety |
| **Tailwind CSS** | Già in uso, rapido sviluppo |
| **KaTeX** | Già in uso, formule matematiche |

### Backend e Infrastruttura
| Tecnologia | Motivazione |
|------------|-------------|
| **Supabase** | Auth + DB + Storage in uno, open source, generoso free tier |
| **Vercel** | Deploy automatico, edge functions, ottimo per Next.js |
| **PostgreSQL** (via Supabase) | Relazionale, robusto, query SQL |

### Alternative Considerate

| Opzione | Pro | Contro | Verdetto |
|---------|-----|--------|----------|
| Firebase | Maturo, real-time | Vendor lock-in, NoSQL | ❌ |
| PlanetScale | MySQL serverless | Costo, complessità | ❌ |
| Auth0 | Robusto, SPID | Costoso | ❌ (forse futuro) |
| Railway | Backend custom | Più complesso | ❌ |

---

## Schema Database (PostgreSQL)

```sql
-- Utenti (estende Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    role TEXT CHECK (role IN ('student', 'teacher', 'admin')),
    school TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classi
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE,
    teacher_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Iscrizioni studenti a classi
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id),
    class_id UUID REFERENCES classes(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

-- Progressi esercizi
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    demo_slug TEXT NOT NULL,           -- es. 'limiti/finito-punto-finito'
    exercise_id TEXT,                  -- identificativo esercizio specifico
    score INTEGER,                     -- punteggio 0-100
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_seconds INTEGER
);

-- Compiti assegnati
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    teacher_id UUID REFERENCES profiles(id),
    demo_slug TEXT NOT NULL,
    title TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Stima Costi

### Fase Iniziale (0-1000 utenti)

| Voce | Costo Mensile | Note |
|------|---------------|------|
| Vercel (Hobby) | €0 | 100GB bandwidth |
| Supabase (Free) | €0 | 500MB db, 50k auth users |
| Dominio .it | ~€1 | €12/anno |
| **Totale** | **~€1/mese** | |

### Crescita (1000-10000 utenti)

| Voce | Costo Mensile | Note |
|------|---------------|------|
| Vercel (Pro) | ~€20 | 1TB bandwidth, analytics |
| Supabase (Pro) | ~€25 | 8GB db, backup giornalieri |
| Dominio .it | ~€1 | |
| **Totale** | **~€46/mese** | |

### Scala Nazionale (10000+ utenti)

| Voce | Costo Mensile | Note |
|------|---------------|------|
| Vercel (Pro) | €20-50 | Scaling automatico |
| Supabase (Pro/Team) | €25-100 | Dipende da storage/traffic |
| CDN aggiuntivo | €0-20 | Se necessario |
| **Totale** | **€50-170/mese** | |

---

## Rischi e Mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Supabase downtime | Bassa | Alto | Backup regolari, fallback read-only |
| Costi imprevisti | Media | Medio | Monitoring usage, alert budget |
| Complessità migrazione | Bassa | Medio | Migrazione incrementale, test |
| Adozione lenta | Media | Medio | Focus su qualità, passaparola docenti |
| Problemi GDPR | Bassa | Alto | Privacy policy, consenso esplicito, dati EU |

---

## Metriche di Successo

### Fase 1-2 (Tech)
- [ ] Login funzionante con email e Google
- [ ] Tempo di caricamento < 3 secondi
- [ ] Zero errori critici in produzione

### Fase 3-4 (Adoption)
- [ ] 10 docenti beta tester
- [ ] 100 studenti registrati
- [ ] 5 scuole pilota

### Fase 5 (Scale)
- [ ] 1000+ utenti attivi mensili
- [ ] 50+ scuole
- [ ] Copertura nazionale (Nord/Centro/Sud)

---

## Timeline Stimata

```
2026
├── Gennaio-Febbraio
│   ├── Fase 1: Setup Supabase + Auth
│   └── Fase 2: Progressi e dashboard base
│
├── Marzo-Aprile
│   ├── Fase 3: Funzionalità docente
│   └── Beta testing con scuole pilota
│
├── Maggio-Giugno
│   ├── Fase 4: Migrazione Next.js (se necessario)
│   └── Lancio pubblico
│
└── Luglio+
    └── Fase 5: Crescita e nuove funzionalità
```

---

## Prossimi Passi Immediati

1. **Questa settimana**
    - [ ] Creare account Supabase
    - [ ] Scegliere e registrare dominio .it
    - [ ] Setup progetto Vercel collegato a GitHub

2. **Prossima settimana**
    - [ ] Implementare AuthContext in React
    - [ ] Creare pagine login/register
    - [ ] Schema database iniziale

3. **Entro fine mese**
    - [ ] Protezione route per aree riservate
    - [ ] Salvataggio primo progresso esercizio
    - [ ] Deploy produzione su dominio custom

---

## Appendice A: Struttura File Post-Migrazione (Next.js)

```
app/
├── page.tsx                          # Landing page (SSR)
├── layout.tsx                        # Layout globale
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)/                      # Route protette
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard studente
│   │   └── teacher/page.tsx          # Dashboard docente
│   └── profile/page.tsx
├── demos/
│   ├── page.tsx                      # Indice demo
│   ├── limiti/
│   │   ├── page.tsx                  # Indice limiti
│   │   └── [slug]/page.tsx           # Demo dinamica
│   ├── equazioni/
│   ├── fisica/
│   └── ...
└── api/
    ├── progress/route.ts             # API progressi
    └── classes/route.ts              # API classi

components/
├── ui/                               # Componenti esistenti
├── auth/                             # Componenti autenticazione
└── dashboard/                        # Componenti dashboard

lib/
├── supabase/
│   ├── client.ts                     # Client browser
│   └── server.ts                     # Client server
└── utils/                            # Utility esistenti
```

---

## Appendice B: Checklist GDPR

- [ ] Privacy Policy in italiano
- [ ] Cookie Policy
- [ ] Consenso esplicito per minori (< 14 anni serve consenso genitori)
- [ ] Dati conservati in EU (Supabase region: eu-central-1)
- [ ] Possibilità di export dati utente
- [ ] Possibilità di cancellazione account
- [ ] Data Processing Agreement con Supabase

---

## Note Finali

Questo piano è modulare: ogni fase può essere completata indipendentemente. La chiave è partire con le fondamenta solide (Fase 1-2) e poi espandere in base al feedback degli utenti reali.

Il vantaggio competitivo del progetto non è nella tecnologia, ma nella **qualità didattica delle demo** e nell'**attenzione all'esperienza di apprendimento**. La piattaforma è solo un veicolo per portare questi contenuti a più studenti possibile.

---

*Documento da aggiornare periodicamente con l'evoluzione del progetto.*
# Backend Development - Forma

## Stato Attuale
**Branch:** `feature/backend-supabase`
**Data ultimo aggiornamento:** 22 Gennaio 2026

---

## ✅ Completato

### Setup Supabase Locale
- [x] Supabase CLI installato (`npx supabase`)
- [x] Stack Docker locale funzionante
- [x] Configurazione in `supabase/config.toml`

### Schema Database (migrazione 00001)
- [x] Tabella `profiles` (estende auth.users)
- [x] Tabella `artifacts` (lezioni, demo, quiz, percorsi)
- [x] Tabella `quiz_results`
- [x] Tabella `favorites`
- [x] Tabella `path_items`
- [x] Row Level Security policies
- [x] Trigger auto-create profile
- [x] Trigger updated_at

### Client Frontend
- [x] Client Supabase (`src/lib/supabase/client.ts`)
- [x] Tipi TypeScript (`src/lib/supabase/types.ts`)
- [x] Hook `useAuth` funzionante
- [x] Pagina test auth (`/auth-test`) - verificata

### Ambiente
- [x] Variabili `.env.local` configurate
- [x] Tipi Vite (`src/vite-env.d.ts`)
- [x] Build funzionante

---

## 🔄 In Corso

### CRUD Artifacts (Punto 1)
- [ ] Hook `useArtifacts` (lista, filtri, paginazione)
- [ ] Hook `useArtifact` (singolo artifact)
- [ ] Hook `useCreateArtifact`
- [ ] Hook `useUpdateArtifact`
- [ ] Hook `useDeleteArtifact`

---

## 📋 Prossimi Passi

### Punto 2 - Sistema Preferiti
- [ ] Hook `useFavorites`
- [ ] Componente `FavoriteButton` (cuore)
- [ ] Integrazione nelle demo esistenti

### Punto 3 - Dashboard Utente
- [ ] Pagina `/dashboard`
- [ ] Sezione preferiti
- [ ] Sezione cronologia quiz
- [ ] Sezione artifacts propri (per docenti)

### Punto 4 - Sistema Quiz
- [ ] Componente `QuizRunner`
- [ ] Componente `QuestionCard`
- [ ] Componente `ResultsView`
- [ ] Hook `useQuizResults`
- [ ] Salvataggio risultati in DB

### Punto 5 - Commenti
- [ ] Migrazione: tabella `comments`
- [ ] Hook `useComments`
- [ ] Componente `CommentSection`
- [ ] Moderazione base

---

## 📁 Struttura File Backend
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts      ✅
│       ├── types.ts       ✅
│       └── index.ts       ✅
├── hooks/
│   ├── useAuth.ts         ✅
│   ├── useArtifacts.ts    🔄 (da fare)
│   ├── useFavorites.ts    📋
│   └── useQuizResults.ts  📋
└── pages/
    ├── AuthTest.tsx       ✅
    └── Dashboard.tsx      📋

supabase/
├── config.toml            ✅
└── migrations/
    └── 00001_initial_schema.sql  ✅
```

---

## 🔗 URL Sviluppo Locale

| Servizio | URL |
|----------|-----|
| Frontend | http://localhost:3000/matematica-fisica/ |
| Auth Test | http://localhost:3000/matematica-fisica/\#/auth-test |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit | http://127.0.0.1:54324 |
| API REST | http://127.0.0.1:54321/rest/v1 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

---

## 🗒️ Note

- Il progetto finale si chiamerà **Forma**
- Il frontend attuale (`matematica-fisica`) verrà migrato
- Branch `2026-01-02-new-interactive-lessons` da mergiare dopo backend stabile
- Dopo merge backend, biforcazione: `main` → Forma, `gh-pages-legacy` → statico attuale

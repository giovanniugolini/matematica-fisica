# README.dev – Note per lo sviluppo

Questo documento è rivolto a chi è interessato agli aspetti tecnici e
architetturali del progetto.

Il progetto è una web app React pensata per la didattica STEM, con particolare attenzione
alla **correttezza matematica**, alla **riusabilità del codice** e alla **manutenibilità**.

---

## 🧱 Stack tecnologico

- React + TypeScript
- Vite
- Tailwind CSS
- KaTeX per il rendering matematico
- SVG / Canvas per grafici e animazioni

---

## 🧠 Principi di progettazione

- Separazione netta tra:
    - logica matematica
    - componenti UI
- Centralizzazione delle utility matematiche
- Componenti riutilizzabili e composabili
- Gestione esplicita dei casi limite matematici
- Attenzione a leggibilità e chiarezza del codice

---

## 📁 Struttura generale

- `utils/math/`  
  Utility matematiche condivise (algebra, analisi, fisica, formattazione)

- `components/ui/`  
  Componenti UI riutilizzabili (step, layout, responsive, LaTeX)

- `demos/`  
  Demo disciplinari organizzate per argomento

L’architettura è pensata per permettere:
- estensione graduale
- aggiunta di nuove demo senza duplicazioni
- refactoring controllato

---

## 🎯 Obiettivo tecnico

Costruire una base solida per un **laboratorio digitale di matematica e fisica**
che possa coprire l’intero curricolo delle scuole superiori, mantenendo:

- coerenza visiva
- correttezza concettuale
- semplicità di estensione

---

## 🚧 Linee guida per contributi futuri

- privilegiare componenti generici e riutilizzabili
- evitare logica matematica “hardcoded” nelle demo
- documentare i casi limite
- mantenere separata la visualizzazione dalla logica

---

## 📌 Nota finale

Il progetto nasce in un contesto didattico reale e cresce per iterazioni.
La priorità non è la performance estrema, ma la **chiarezza concettuale** e
l’efficacia educativa.

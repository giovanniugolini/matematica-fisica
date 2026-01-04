# Lesson Markdown DSL — Specifica

**Versione:** 1.0.0  
**Data:** 4 gennaio 2026  
**Stato:** Draft

---

## Indice

1. [Introduzione](#1-introduzione)
2. [Struttura del documento](#2-struttura-del-documento)
3. [Frontmatter](#3-frontmatter)
4. [Sintassi base](#4-sintassi-base)
5. [Slide e transizioni](#5-slide-e-transizioni)
6. [Direttive blocco](#6-direttive-blocco)
7. [Blocchi contenuto](#7-blocchi-contenuto)
8. [Blocchi didattici strutturati](#8-blocchi-didattici-strutturati)
9. [Blocchi interattivi](#9-blocchi-interattivi)
10. [Blocchi multimediali](#10-blocchi-multimediali)
11. [Blocchi avanzati](#11-blocchi-avanzati)
12. [Sequenze](#12-sequenze)
13. [Escape hatch](#13-escape-hatch)
14. [Convenzioni e best practice](#14-convenzioni-e-best-practice)
15. [Errori e warning](#15-errori-e-warning)
16. [Esempi completi](#16-esempi-completi)

---

## 1. Introduzione

### 1.1 Scopo

Questa specifica definisce un linguaggio basato su Markdown per la scrittura di lezioni interattive. Il compilatore converte i file `.md` in JSON conforme allo schema `Lezione` definito in `schema.ts`.

### 1.2 Obiettivi

- **Leggibilità**: il sorgente deve essere comprensibile anche senza rendering
- **Semplicità**: Markdown standard per il 90% dei contenuti
- **Estensibilità**: direttive per blocchi specializzati
- **Compatibilità**: output JSON identico allo schema esistente

### 1.3 Pubblico

- Docenti che scrivono lezioni
- Sviluppatori che mantengono il compilatore
- AI che generano contenuti didattici

---

## 2. Struttura del documento

Un file lezione `.md` ha questa struttura:

```
┌─────────────────────────────────┐
│  Frontmatter YAML (metadati)    │
├─────────────────────────────────┤
│  Slide 1                        │
│  - blocchi contenuto            │
│  - transizioni (opzionali)      │
├─────────────────────────────────┤
│  ---                            │  ← separatore slide
├─────────────────────────────────┤
│  Slide 2                        │
│  - blocchi contenuto            │
├─────────────────────────────────┤
│  ---                            │
├─────────────────────────────────┤
│  Slide N                        │
└─────────────────────────────────┘
```

### 2.1 Mappatura su schema Lezione

| Elemento MD | Campo JSON |
|-------------|------------|
| Frontmatter | `metadati` |
| Prima slide | `introduzione` (se `id: intro`) |
| Slide centrali | `sezioni[].blocchi` |
| Ultima slide | `conclusione` (se `id: conclusione`) |

---

## 3. Frontmatter

Il frontmatter YAML definisce i metadati della lezione. È obbligatorio e deve essere all'inizio del file.

### 3.1 Sintassi

```yaml
---
id: vettori-componenti-cartesiane
title: Componenti cartesiane di un vettore
subtitle: Dalla forma polare alla forma cartesiana    # opzionale
subject: fisica
topic: vettori
level: secondo-biennio

# Campi opzionali
duration: 45                    # minuti
author: Nome Cognome
version: 1.0.0
tags:
  - trigonometria
  - vettori
  - componenti
prerequisites:
  - trigonometria-base
  - concetto-vettore
objectives:
  - Scomporre un vettore nelle componenti cartesiane
  - Ricostruire un vettore dalle componenti
---
```

### 3.2 Campi obbligatori

| Campo | Tipo | Valori |
|-------|------|--------|
| `id` | string | identificatore univoco, kebab-case |
| `title` | string | titolo della lezione |
| `subject` | enum | `matematica`, `fisica` |
| `topic` | enum | vedi schema.ts `Argomento` |
| `level` | enum | `primo-biennio`, `secondo-biennio`, `quinto-anno`, `universita` |

### 3.3 Campi opzionali

| Campo | Tipo | Default | Note |
|-------|------|---------|------|
| `subtitle` | string | - | sottotitolo |
| `duration` | number | - | durata in minuti |
| `author` | string | - | autore |
| `version` | string | - | versione semantica |
| `tags` | string[] | [] | tag per ricerca |
| `prerequisites` | string[] | [] | id lezioni prerequisite |
| `objectives` | string[] | [] | obiettivi didattici |
| `createdAt` | string | - | ISO 8601 |
| `updatedAt` | string | - | ISO 8601 |

---

## 4. Sintassi base

### 4.1 Testo

Il testo semplice diventa `BloccoTesto`. I paragrafi sono separati da righe vuote.

```markdown
Questo è un paragrafo di testo semplice.

Questo è un altro paragrafo.
```

**Output JSON:**
```json
[
  { "tipo": "testo", "contenuto": "Questo è un paragrafo di testo semplice." },
  { "tipo": "testo", "contenuto": "Questo è un altro paragrafo." }
]
```

### 4.2 Heading

Gli heading Markdown diventano `BloccoTitolo`.

```markdown
# Titolo principale (h1 → livello 2)
## Sottotitolo (h2 → livello 3)
### Sotto-sottotitolo (h3 → livello 4)
```

> **Nota**: `h1` diventa `livello: 2` perché il livello 1 è riservato al titolo della lezione.

**Output JSON:**
```json
{ "tipo": "titolo", "livello": 2, "testo": "Titolo principale" }
```

### 4.3 LaTeX

#### Inline

```markdown
Il vettore $\vec{v}$ ha modulo $|\vec{v}|$.
```

Il LaTeX inline rimane nel contenuto testuale come stringa.

#### Display

```markdown
$$v_x = |\vec{v}| \cos\theta$$
```

**Output JSON:**
```json
{ "tipo": "formula", "latex": "v_x = |\\vec{v}| \\cos\\theta", "display": true }
```

#### Display con etichetta

```markdown
$$[eq:componente-x] v_x = |\vec{v}| \cos\theta$$
```

**Output JSON:**
```json
{
  "tipo": "formula",
  "latex": "v_x = |\\vec{v}| \\cos\\theta",
  "display": true,
  "etichetta": "eq:componente-x"
}
```

### 4.4 Liste

#### Lista non ordinata

```markdown
- primo elemento
- secondo elemento
- terzo elemento
```

**Output JSON:**
```json
{ "tipo": "elenco", "ordinato": false, "elementi": ["primo elemento", "secondo elemento", "terzo elemento"] }
```

#### Lista ordinata

```markdown
1. primo passo
2. secondo passo
3. terzo passo
```

**Output JSON:**
```json
{ "tipo": "elenco", "ordinato": true, "elementi": ["primo passo", "secondo passo", "terzo passo"] }
```

### 4.5 Immagini (sintassi breve)

```markdown
![Triangolo rettangolo](/images/lezioni/vettori/triangolo.svg)
```

**Output JSON:**
```json
{ "tipo": "immagine", "src": "/images/lezioni/vettori/triangolo.svg", "alt": "Triangolo rettangolo" }
```

> Per caption, width o assetId, usare la direttiva `::: image`.

---

## 5. Slide e transizioni

### 5.1 Separatore slide

Il separatore `---` su una riga a sé indica l'inizio di una nuova slide (sezione).

```markdown
# Prima slide

Contenuto della prima slide.

---

# Seconda slide

Contenuto della seconda slide.
```

### 5.2 Transizioni (frammenti)

Il marcatore `>>>` indica una transizione interna alla slide. I blocchi successivi appaiono progressivamente.

```markdown
# Scomposizione del vettore

Partiamo da un vettore $\vec{v}$ nel piano.

>>>

Proiettiamolo sull'asse $x$:

$$v_x = |\vec{v}| \cos\theta$$

>>>

E sull'asse $y$:

$$v_y = |\vec{v}| \sin\theta$$
```

**Comportamento:**
- Frammento 1: primo paragrafo
- Frammento 2: + proiezione x
- Frammento 3: + proiezione y

**Output JSON:**
```json
{
  "id": "slide-1",
  "titolo": "Scomposizione del vettore",
  "transitions": [0, 1, 3],
  "blocchi": [
    { "tipo": "testo", "contenuto": "Partiamo da un vettore $\\vec{v}$ nel piano." },
    { "tipo": "testo", "contenuto": "Proiettiamolo sull'asse $x$:" },
    { "tipo": "formula", "latex": "v_x = |\\vec{v}| \\cos\\theta", "display": true },
    { "tipo": "testo", "contenuto": "E sull'asse $y$:" },
    { "tipo": "formula", "latex": "v_y = |\\vec{v}| \\sin\\theta", "display": true }
  ]
}
```

### 5.3 ID slide esplicito

```markdown
---
id: slide-componenti
---

# Componenti cartesiane

...
```

---

## 6. Direttive blocco

### 6.1 Sintassi generale

Le direttive usano la sintassi "container" con `:::`:

```markdown
::: tipo
contenuto
:::
```

Con attributi:

```markdown
::: tipo attributo1=valore1 attributo2=valore2
contenuto
:::
```

Con attributi multilinea (YAML-like):

```markdown
::: tipo
attr1: valore1
attr2: valore2

contenuto del blocco
:::
```

### 6.2 Regole di parsing

1. La riga di apertura inizia con `:::` seguito dal tipo
2. Gli attributi possono essere:
   - Inline: `:::tipo key=value key2="value with spaces"`
   - YAML-like: su righe separate, prima di una riga vuota
3. Il contenuto segue dopo gli attributi (e una riga vuota se YAML-like)
4. La riga di chiusura è `:::` da sola
5. Le direttive possono essere annidate (con più `:`)

### 6.3 Escape dei caratteri speciali

- Per un `:` a inizio riga nel contenuto: `\:`
- Per `:::` letterale nel contenuto: `\:\:\:`

---

## 7. Blocchi contenuto

### 7.1 Note (callout informativi)

```markdown
::: note info
Le componenti sono numeri con segno, non moduli!
:::

::: note warning
Attenzione al segno nel terzo quadrante.
:::

::: note tip
Usa il cerchio trigonometrico per visualizzare.
:::

::: note remember
Il teorema di Pitagora vale sempre.
:::
```

**Varianti:** `info`, `warning`, `tip`, `remember`

**Output JSON:**
```json
{ "tipo": "nota", "variante": "info", "contenuto": "Le componenti sono numeri con segno, non moduli!" }
```

### 7.2 Callout (contesto didattico)

```markdown
::: callout obiettivo
Imparare a scomporre un vettore nelle sue componenti cartesiane.
:::

::: callout prerequisiti
- Funzioni trigonometriche seno e coseno
- Concetto di vettore e modulo
:::

::: callout materiali
- Calcolatrice scientifica
- Foglio a quadretti
:::

::: callout tempo
Durata stimata: 15 minuti
:::
```

**Varianti:** `obiettivo`, `prerequisiti`, `materiali`, `tempo`

**Output JSON:**
```json
{ "tipo": "callout", "variante": "obiettivo", "contenuto": "Imparare a scomporre..." }
```

### 7.3 Citazione

```markdown
::: quote
author: Richard Feynman
source: Lectures on Physics

La matematica è il linguaggio con cui Dio ha scritto l'universo.
:::
```

**Output JSON:**
```json
{
  "tipo": "citazione",
  "testo": "La matematica è il linguaggio con cui Dio ha scritto l'universo.",
  "autore": "Richard Feynman",
  "fonte": "Lectures on Physics"
}
```

### 7.4 Separatore

```markdown
::: separator
:::
```

**Output JSON:**
```json
{ "tipo": "separatore" }
```

---

## 8. Blocchi didattici strutturati

### 8.1 Definizione

```markdown
::: definition
term: Componenti cartesiane

Le componenti cartesiane di un vettore $\vec{v}$ sono le sue proiezioni 
sugli assi coordinati: $v_x$ e $v_y$.

note: Le componenti sono scalari con segno, non moduli.
:::
```

**Campi:**
- `term` (obbligatorio): termine da definire
- contenuto: la definizione
- `note` (opzionale): nota aggiuntiva

**Output JSON:**
```json
{
  "tipo": "definizione",
  "termine": "Componenti cartesiane",
  "definizione": "Le componenti cartesiane di un vettore...",
  "nota": "Le componenti sono scalari con segno, non moduli."
}
```

### 8.2 Teorema

```markdown
::: theorem
name: Teorema di Pitagora vettoriale

statement:
Il modulo di un vettore è legato alle sue componenti dalla relazione:
$$|\vec{v}| = \sqrt{v_x^2 + v_y^2}$$

proof:
Considerando il triangolo rettangolo formato dal vettore e dalle sue 
componenti, per il teorema di Pitagora si ha che l'ipotenusa (il modulo) 
è uguale alla radice della somma dei quadrati dei cateti (le componenti).
:::
```

**Campi:**
- `name` (opzionale): nome del teorema
- `statement` (obbligatorio): enunciato
- `proof` (opzionale): dimostrazione

**Output JSON:**
```json
{
  "tipo": "teorema",
  "nome": "Teorema di Pitagora vettoriale",
  "enunciato": "Il modulo di un vettore è legato...",
  "dimostrazione": "Considerando il triangolo rettangolo..."
}
```

### 8.3 Esempio

```markdown
::: example
title: Calcolo delle componenti

problem:
Un vettore $\vec{v}$ ha modulo 10 e forma un angolo di 30° con l'asse $x$ positivo.
Calcola le componenti $v_x$ e $v_y$.

solution:
Applichiamo le formule:
- $v_x = 10 \cdot \cos 30° = 10 \cdot \frac{\sqrt{3}}{2} \approx 8.66$
- $v_y = 10 \cdot \sin 30° = 10 \cdot \frac{1}{2} = 5$

note: Nota che $v_x > v_y$ perché l'angolo è minore di 45°.
:::
```

**Campi:**
- `title` (opzionale): titolo dell'esempio
- `problem` (obbligatorio): testo del problema
- `solution` (obbligatorio): soluzione
- `note` (opzionale): nota aggiuntiva

### 8.4 Step-by-step

```markdown
::: step-by-step
title: Procedura di scomposizione

1. Identifica il modulo $|\vec{v}|$ del vettore
2. Misura l'angolo $\theta$ rispetto all'asse $x$ positivo
3. Calcola $v_x = |\vec{v}| \cos\theta$
4. Calcola $v_y = |\vec{v}| \sin\theta$
5. Verifica: $\sqrt{v_x^2 + v_y^2}$ deve dare il modulo originale
:::
```

**Output JSON:**
```json
{
  "tipo": "step-by-step",
  "titolo": "Procedura di scomposizione",
  "step": [
    { "titolo": "Passo 1", "contenuto": "Identifica il modulo..." },
    { "titolo": "Passo 2", "contenuto": "Misura l'angolo..." }
  ]
}
```

---

## 9. Blocchi interattivi

### 9.1 Activity

```markdown
::: activity
title: Esercizio guidato

Dato un vettore con modulo 8 e angolo 60°, calcola le componenti 
$v_x$ e $v_y$. Verifica il risultato usando il teorema di Pitagora.

note: Usa la calcolatrice in modalità gradi, non radianti.
:::
```

**Campi:**
- `title` (opzionale): titolo dell'attività
- contenuto: consegna dell'attività
- `note` (opzionale): nota per lo studente

**Output JSON:**
```json
{
  "tipo": "attivita",
  "titolo": "Esercizio guidato",
  "consegna": "Dato un vettore con modulo 8...",
  "nota": "Usa la calcolatrice in modalità gradi..."
}
```

### 9.2 Question

```markdown
::: question
title: Verifica comprensione

question: Perché la componente $v_x$ può assumere valori negativi?

answer:
La componente $v_x = |\vec{v}| \cos\theta$ può essere negativa perché 
il coseno è negativo per angoli compresi tra 90° e 270° (secondo e 
terzo quadrante). Il modulo $|\vec{v}|$ è sempre positivo.

showAnswerLabel: Mostra risposta
hideAnswerLabel: Nascondi risposta
defaultExpanded: false
:::
```

**Campi:**
- `title` (opzionale): titolo
- `question` (obbligatorio): domanda
- `answer` (obbligatorio): risposta
- `showAnswerLabel` (opzionale): testo pulsante mostra
- `hideAnswerLabel` (opzionale): testo pulsante nascondi
- `defaultExpanded` (opzionale): boolean, default false

### 9.3 Brainstorming

```markdown
::: brainstorming
title: Riflessione iniziale
placeholder: Scrivi qui le tue idee sui vettori...
heightPx: 150
persistId: brainstorm-vettori-intro
persistDefault: true
:::
```

**Campi:**
- `title` (obbligatorio): titolo
- `placeholder` (opzionale): testo placeholder
- `heightPx` (opzionale): altezza in pixel
- `persistId` (opzionale): id per persistenza
- `persistDefault` (opzionale): boolean

### 9.4 Quiz

```markdown
::: quiz
difficulty: media

question: Qual è la componente $v_x$ di un vettore con modulo 6 e angolo 60°?

options:
- [ ] $v_x = 6$
- [x] $v_x = 3$
- [ ] $v_x = 3\sqrt{3}$
- [ ] $v_x = 6\sqrt{3}$

explanation:
$v_x = 6 \cdot \cos 60° = 6 \cdot \frac{1}{2} = 3$
:::
```

**Sintassi opzioni:**
- `- [ ]` opzione errata
- `- [x]` opzione corretta

**Campi:**
- `question` (obbligatorio): domanda
- `options` (obbligatorio): lista opzioni
- `explanation` (obbligatorio): spiegazione
- `difficulty` (opzionale): `facile`, `media`, `difficile`

**Output JSON:**
```json
{
  "tipo": "quiz",
  "domanda": "Qual è la componente...",
  "opzioni": [
    { "testo": "$v_x = 6$", "corretta": false },
    { "testo": "$v_x = 3$", "corretta": true },
    { "testo": "$v_x = 3\\sqrt{3}$", "corretta": false },
    { "testo": "$v_x = 6\\sqrt{3}$", "corretta": false }
  ],
  "spiegazione": "$v_x = 6 \\cdot \\cos 60°...",
  "difficolta": "media"
}
```

---

## 10. Blocchi multimediali

### 10.1 Immagine (estesa)

```markdown
::: image
src: /images/lezioni/vettori/triangolo-rettangolo.svg
alt: Triangolo rettangolo formato dal vettore
caption: Il vettore $\vec{v}$ e le sue componenti formano un triangolo rettangolo
width: 80
:::
```

Oppure con assetId:

```markdown
::: image
assetId: vettori/triangolo-rettangolo
alt: Triangolo rettangolo
caption: Il vettore e le sue componenti
:::
```

**Campi:**
- `src` o `assetId` (uno obbligatorio): percorso o id asset
- `alt` (obbligatorio): testo alternativo
- `caption` (opzionale): didascalia
- `width` (opzionale): larghezza percentuale 0-100

### 10.2 Video

```markdown
::: video
src: /videos/lezioni/vettori/scomposizione.mp4
title: Scomposizione animata
caption: Animazione della scomposizione di un vettore
width: 100
height: 400
autoplay: false
:::
```

**Campi:**
- `src` o `assetId` (uno obbligatorio)
- `title` (opzionale): titolo
- `caption` (opzionale): didascalia
- `width` (opzionale): larghezza percentuale, default 100
- `height` (opzionale): altezza in pixel, default 400
- `autoplay` (opzionale): boolean, default false

### 10.3 Demo (componente interattivo)

```markdown
::: demo
component: VectorDecomposition
title: Esplora le componenti
description: Muovi il cursore per cambiare l'angolo del vettore
height: 400

props:
  initialAngle: 45
  showGrid: true
  showLabels: true
:::
```

**Campi:**
- `component` (obbligatorio): nome del componente React
- `title` (opzionale): titolo
- `description` (opzionale): descrizione
- `height` (opzionale): altezza in pixel
- `props` (opzionale): oggetto props per il componente

---

## 11. Blocchi avanzati

### 11.1 Tabella

```markdown
::: table
caption: Valori delle componenti per angoli notevoli

| Angolo θ | cos θ | sin θ | $v_x$ (se $|\vec{v}|=1$) | $v_y$ |
|----------|-------|-------|--------------------------|-------|
| 0°       | 1     | 0     | 1                        | 0     |
| 30°      | √3/2  | 1/2   | 0.87                     | 0.5   |
| 45°      | √2/2  | √2/2  | 0.71                     | 0.71  |
| 60°      | 1/2   | √3/2  | 0.5                      | 0.87  |
| 90°      | 0     | 1     | 0                        | 1     |
:::
```

**Output JSON:**
```json
{
  "tipo": "tabella",
  "intestazione": ["Angolo θ", "cos θ", "sin θ", "$v_x$ (se $|\\vec{v}|=1$)", "$v_y$"],
  "righe": [
    ["0°", "1", "0", "1", "0"],
    ["30°", "√3/2", "1/2", "0.87", "0.5"]
  ],
  "didascalia": "Valori delle componenti per angoli notevoli"
}
```

### 11.2 Codice

```markdown
::: code python
executable: true

import numpy as np

def componenti(modulo, angolo_gradi):
    theta = np.radians(angolo_gradi)
    vx = modulo * np.cos(theta)
    vy = modulo * np.sin(theta)
    return vx, vy

vx, vy = componenti(10, 30)
print(f"vx = {vx:.2f}, vy = {vy:.2f}")
:::
```

**Campi:**
- tipo linguaggio dopo `code` (obbligatorio)
- `executable` (opzionale): boolean
- contenuto: codice

### 11.3 Collegamento

```markdown
::: link
lessonId: trigonometria-base
text: Funzioni trigonometriche
description: Ripassa seno e coseno prima di continuare
:::
```

**Campi:**
- `lessonId` (obbligatorio): id della lezione collegata
- `text` (obbligatorio): testo del link
- `description` (opzionale): descrizione

---

## 12. Sequenze

### 12.1 Sequenza semplice

Per sequenze complesse con step multipli, usare la direttiva `sequence`:

```markdown
::: sequence
title: Costruzione passo-passo
showProgress: true
allowJump: false

== step: Situazione iniziale ==

Consideriamo un vettore $\vec{v}$ nel piano cartesiano.

::: image
src: /images/vettore-iniziale.svg
alt: Vettore nel piano
:::

>>>

Il vettore ha modulo $|\vec{v}|$ e forma un angolo $\theta$ con l'asse $x$.

== step: Prima proiezione ==

Proiettiamo il vettore sull'asse $x$.

$$v_x = |\vec{v}| \cos\theta$$

>>>

Questa è la **componente orizzontale**.

== step: Seconda proiezione ==

Proiettiamo il vettore sull'asse $y$.

$$v_y = |\vec{v}| \sin\theta$$

:::
```

### 12.2 Sintassi step

- `== step: Titolo ==` apre un nuovo step
- `>>>` crea una transizione interna allo step
- I blocchi dentro lo step seguono la sintassi normale

### 12.3 Attributi sequenza

| Attributo | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `title` | string | - | Titolo della sequenza |
| `showProgress` | boolean | true | Mostra indicatore progresso |
| `allowJump` | boolean | true | Permette salto tra step |
| `startAt` | number | 0 | Step iniziale |

---

## 13. Escape hatch

### 13.1 Blocco JSON raw

Per blocchi non ancora supportati o casi edge, è possibile iniettare JSON grezzo:

```markdown
::: json
{
  "tipo": "demo",
  "componente": "CustomWidget",
  "props": {
    "complexConfig": {
      "nested": true,
      "values": [1, 2, 3]
    }
  }
}
:::
```

Il contenuto viene parsato come JSON e inserito direttamente nell'array `blocchi`.

### 13.2 Errori JSON

Se il JSON non è valido, il compilatore emette un errore con:
- Numero di riga nel file `.md`
- Messaggio di errore del parser JSON
- Contesto (prime righe del blocco)

---

## 14. Convenzioni e best practice

### 14.1 Naming

- **ID lezione**: kebab-case, descrittivo (`vettori-componenti-cartesiane`)
- **ID slide**: opzionali, generati automaticamente se omessi
- **AssetId**: path-like (`vettori/triangolo-rettangolo`)

### 14.2 Struttura consigliata

```markdown
---
frontmatter...
---

# Obiettivo

::: callout obiettivo
Cosa impareremo...
:::

::: callout prerequisiti
Cosa serve sapere...
:::

---

# Concetto 1

Spiegazione...

---

# Concetto 2

Spiegazione...

---

# Riepilogo

::: note remember
Punti chiave...
:::
```

### 14.3 Transizioni

- Usare `>>>` con parsimonia (max 3-4 per slide)
- Ogni frammento dovrebbe aggiungere un concetto
- Non spezzare formule correlate

### 14.4 LaTeX

- Inline per variabili e simboli: `$\vec{v}$`
- Display per formule importanti: `$$...$$`
- Usare `\text{}` per testo nelle formule

---

## 15. Errori e warning

### 15.1 Errori (bloccanti)

| Codice | Descrizione |
|--------|-------------|
| `E001` | Frontmatter mancante |
| `E002` | Campo obbligatorio mancante nel frontmatter |
| `E003` | Direttiva non chiusa |
| `E004` | Tipo direttiva sconosciuto |
| `E005` | Campo obbligatorio mancante in direttiva |
| `E006` | JSON non valido in blocco `:::json` |
| `E007` | Sintassi attributi non valida |

### 15.2 Warning (non bloccanti)

| Codice | Descrizione |
|--------|-------------|
| `W001` | AssetId non trovato nel registry |
| `W002` | Lezione prerequisita non trovata |
| `W003` | Collegamento a lezione inesistente |
| `W004` | Immagine senza alt text |
| `W005` | Slide senza titolo |

### 15.3 Formato errori

```
error[E003]: Direttiva non chiusa
  --> lezione.md:45:1
   |
45 | ::: definition
46 | term: Vettore
47 | ...
   |
   = help: Aggiungi `:::` per chiudere la direttiva
```

---

## 16. Esempi completi

### 16.1 Lezione minima

```markdown
---
id: esempio-minimo
title: Lezione di esempio
subject: fisica
topic: vettori
level: secondo-biennio
---

# Introduzione

Questo è un esempio minimo di lezione.

---

# Contenuto

Una formula: $E = mc^2$

::: note info
Una nota informativa.
:::

---

# Conclusione

Fine della lezione.
```

### 16.2 Lezione completa

Vedi file separato: `examples/vettori-componenti-cartesiane.md`

---

## Appendice A: Mappatura tipi

| Direttiva MD | Tipo JSON | Note |
|--------------|-----------|------|
| (paragrafo) | `testo` | automatico |
| `#`, `##`, `###` | `titolo` | livello 2, 3, 4 |
| `$$...$$` | `formula` | display: true |
| `-`, `1.` | `elenco` | ordinato/non ordinato |
| `![]()`| `immagine` | sintassi breve |
| `::: note` | `nota` | varianti: info, warning, tip, remember |
| `::: callout` | `callout` | varianti: obiettivo, prerequisiti, materiali, tempo |
| `::: definition` | `definizione` | |
| `::: theorem` | `teorema` | |
| `::: example` | `esempio` | |
| `::: activity` | `attivita` | |
| `::: question` | `question` | |
| `::: brainstorming` | `brainstorming` | |
| `::: quiz` | `quiz` | |
| `::: image` | `immagine` | sintassi estesa |
| `::: video` | `video` | |
| `::: demo` | `demo` | |
| `::: table` | `tabella` | |
| `::: code` | `codice` | |
| `::: quote` | `citazione` | |
| `::: link` | `collegamento` | |
| `::: step-by-step` | `step-by-step` | |
| `::: sequence` | `sequenza` | |
| `::: separator` | `separatore` | |
| `::: json` | (raw) | escape hatch |

---

## Appendice B: Changelog

### v1.0.0 (2026-01-04)

- Prima versione della specifica
- Copertura completa schema.ts
- Supporto transizioni e sequenze

---
id: vettori-componenti-cartesiane
title: Componenti cartesiane di un vettore
subtitle: Come scomporre un vettore nelle sue componenti x e y
subject: fisica
topic: vettori
level: primo-biennio
duration: 45
author: Prof. Giovanni Ugolini
created: 2025-01-02
modified: 2025-01-02
version: "1.0"
tags:
  - vettori
  - trigonometria
  - componenti
  - seno
  - coseno
prerequisites:
  - Concetto di vettore (modulo, direzione, verso)
  - Funzioni goniometriche base (seno, coseno, tangente)
  - Coordinate cartesiane nel piano
objectives:
  - Comprendere il significato delle componenti cartesiane di un vettore
  - Calcolare le componenti Ax e Ay dato il modulo e l'angolo
  - Calcolare modulo e angolo date le componenti
  - Riconoscere i segni delle componenti nei quattro quadranti
---

# Introduzione

## Perché servono le componenti

In fisica spesso è necessario lavorare con i vettori in modo analitico. Per farlo, è fondamentale saper **scomporre** un vettore nelle sue **componenti cartesiane**.

>>>

:::image
src: images/lezioni/vettori/img.png
alt: Scomposizione di un vettore...
caption: Figura: Sistema di riferimento cartesiano
width: 60
:::

>>>

:::question
title: Quick check
question: Why do we decompose a vector into components?
answer: Because we can analyze motion/forces along each axis independently.
showAnswerLabel: Mostra Risposta
hideAnswerLabel: Nascondi risposta
defaultExpanded: false
:::

## Idea chiave

:::note info
Le componenti cartesiane permettono di trasformare operazioni geometriche sui vettori in semplici operazioni algebriche sui numeri.
:::

---

# Scomposizione di un vettore

## Punto (Ax, Ay)

Consideriamo un vettore $\vec{A}$ con la coda nell'origine degli assi cartesiani. La **punta** del vettore individua un punto di coordinate $(A_x, A_y)$.

:::image
assetId: vettori/scomposizione
alt: Scomposizione di un vettore nelle componenti cartesiane
caption: Figura 1: Scomposizione di un vettore A nelle componenti Ax e Ay
width: 80
:::

:::brainstorming
title: Brainstorming: cosa sappiamo sui vettori?
placeholder: Scrivi qui idee/definizioni/esempi...
persistId: vectors-intro
persistDefault: true
altezzaPx: 280
:::

## Definizione di componenti

:::definition
term: Componenti cartesiane

Le coordinate $A_x$ e $A_y$ della punta del vettore $\vec{A}$ (quando la coda è nell'origine) sono dette **componenti cartesiane** del vettore.

note: Le componenti sono numeri con segno, non vettori!
:::

:::image
assetId: vettori/componenti-xy
alt: Componenti Ax e Ay di un vettore
caption: Figura 2: Le componenti cartesiane Ax e Ay
width: 70
:::

:::activity
title: Attività

Disegna un vettore $\vec{A}$ e indica le sue componenti $A_x$ e $A_y$.

note: Suggerimento: usa un triangolo rettangolo e ragiona con seno/coseno.
:::

## Somma di due contributi perpendicolari

Possiamo esprimere il vettore $\vec{A}$ come somma di due vettori perpendicolari, uno lungo l'asse $x$ e uno lungo l'asse $y$:

## Formula di scomposizione

$$\vec{A} = \vec{A}_x + \vec{A}_y$$

## Attenzione alla notazione

:::note warning
Non confondere le **componenti cartesiane** $A_x$ e $A_y$ (che sono numeri) con i **vettori componenti** $\vec{A}_x$ e $\vec{A}_y$ (che sono vettori).
:::

---

# Le funzioni goniometriche

## Perché entrano seno e coseno

Per calcolare le componenti di un vettore utilizziamo le **funzioni goniometriche**: seno, coseno e tangente.

## Seno

:::definition
term: Seno (sin)

In un triangolo rettangolo, il **seno** di un angolo $\theta$ è il rapporto tra il cateto opposto all'angolo e l'ipotenusa: $\sin\theta = \frac{\text{cateto opposto}}{\text{ipotenusa}}$
:::

:::image
assetId: vettori/triangolo-rettangolo
alt: Triangolo rettangolo formato dal vettore e le componenti
caption: Figura 3: Triangolo rettangolo per definire seno e coseno
width: 65
:::

## Coseno

:::definition
term: Coseno (cos)

In un triangolo rettangolo, il **coseno** di un angolo $\theta$ è il rapporto tra il cateto adiacente all'angolo e l'ipotenusa: $\cos\theta = \frac{\text{cateto adiacente}}{\text{ipotenusa}}$
:::

## Tangente

:::definition
term: Tangente (tan)

In un triangolo rettangolo, la **tangente** di un angolo $\theta$ è il rapporto tra il cateto opposto e il cateto adiacente: $\tan\theta = \frac{\text{cateto opposto}}{\text{cateto adiacente}} = \frac{\sin\theta}{\cos\theta}$
:::

## Promemoria utile

:::note remember
Il seno e il coseno di un angolo sono sempre compresi tra $-1$ e $1$. Inoltre vale sempre l'identità: $\sin^2\theta + \cos^2\theta = 1$
:::

---

# Da modulo e angolo alle componenti

## Dati → obiettivo

Se conosciamo il **modulo** $|\vec{A}| = A$ e l'**angolo** $\theta$ che il vettore forma con l'asse $x$ positivo, possiamo calcolare le componenti usando seno e coseno.

## Formule fondamentali

:::theorem
name: Formule per le componenti

statement:
Date il modulo $A$ e l'angolo $\theta$ di un vettore, le componenti cartesiane sono:

$A_x = A \cdot \cos\theta$

$A_y = A \cdot \sin\theta$
:::

:::image
assetId: vettori/angolo-theta
alt: Angolo theta formato dal vettore con l'asse x
caption: Figura 4: Angolo θ tra il vettore e l'asse x
width: 60
:::

## Esempio svolto

:::example
title: Calcolo delle componenti

problem:
Un vettore $\vec{r}$ ha modulo $r = 1{,}50$ m e forma un angolo $\theta = 25°$ con l'asse $x$ positivo. Calcola le componenti cartesiane.

solution:
Applichiamo le formule:

$r_x = r \cdot \cos\theta = 1{,}50 \text{ m} \cdot \cos(25°) = 1{,}50 \cdot 0{,}9063 = 1{,}36 \text{ m}$

$r_y = r \cdot \sin\theta = 1{,}50 \text{ m} \cdot \sin(25°) = 1{,}50 \cdot 0{,}4226 = 0{,}634 \text{ m}$

note: Sulla calcolatrice, assicurati che sia impostata in modalità DEG (gradi)!
:::

## Prova tu (demo)

:::demo
component: ComponentiCartesianeVettoreDemo
title: Prova tu!
description: Usa gli slider per cambiare modulo e angolo e osserva come variano le componenti.
:::

---

# Dalle componenti a modulo e angolo

## Problema inverso

A volte conosciamo le componenti $A_x$ e $A_y$ e vogliamo trovare il modulo e la direzione del vettore. Questo è il problema **inverso**.

## Formule inverse (Pitagora + arctan)

:::theorem
name: Formule inverse

statement:
Date le componenti $A_x$ e $A_y$, il modulo si calcola con il teorema di Pitagora:

$|\vec{A}| = \sqrt{A_x^2 + A_y^2}$

L'angolo $\theta$ si trova con l'arcotangente:

$\theta = \arctan\left(\frac{|A_y|}{|A_x|}\right)$

proof:
Il modulo segue direttamente dal teorema di Pitagora, dato che il vettore è l'ipotenusa di un triangolo rettangolo con cateti $|A_x|$ e $|A_y|$.

Per l'angolo, dalla definizione di tangente: $\tan\theta = \frac{A_y}{A_x}$, quindi $\theta = \arctan\left(\frac{A_y}{A_x}\right)$.
:::

## Attenzione: il quadrante

:::note warning
L'arcotangente restituisce un angolo acuto (nel primo quadrante). Per trovare l'angolo corretto devi considerare il **quadrante** in cui si trova il vettore, basandoti sui segni di $A_x$ e $A_y$.
:::

## Esempio completo (con quadrante)

:::example
title: Calcolo del modulo e dell'angolo

problem:
Un vettore ha componenti $r_x = 1{,}67$ m e $r_y = -1{,}15$ m. Calcola modulo e direzione.

solution:
**Modulo:**
$r = \sqrt{r_x^2 + r_y^2} = \sqrt{(1{,}67)^2 + (-1{,}15)^2} = \sqrt{2{,}79 + 1{,}32} = 2{,}03 \text{ m}$

**Angolo acuto:**
$\tan\theta = \frac{|r_y|}{|r_x|} = \frac{1{,}15}{1{,}67} = 0{,}689$
$\theta_{acuto} = \arctan(0{,}689) = 35°$

**Quadrante:**
$r_x > 0$ e $r_y < 0$ → IV quadrante

L'angolo rispetto all'asse x positivo è: $\theta = 360° - 35° = 325°$ (oppure $-35°$)

note: Nel IV quadrante, $A_x$ è positivo e $A_y$ è negativo.
:::

---

# I segni nei quattro quadranti

## Idea

I segni delle componenti dipendono dal **quadrante** in cui si trova il vettore:

## Tabella dei quadranti

| Quadrante | $A_x$ | $A_y$ | Angolo $\theta$ |
|-----------|-------|-------|-----------------|
| I | $> 0$ | $> 0$ | $0° < \theta < 90°$ |
| II | $< 0$ | $> 0$ | $90° < \theta < 180°$ |
| III | $< 0$ | $< 0$ | $180° < \theta < 270°$ |
| IV | $> 0$ | $< 0$ | $270° < \theta < 360°$ |

:::image
assetId: vettori/quadranti
alt: Segni delle componenti nei quattro quadranti
caption: Figura 5: I quattro quadranti e i segni delle componenti
width: 70
:::

## Trucco mnemonico

:::note tip
Un trucco per ricordare: nel **I quadrante** entrambe positive, nel **III** entrambe negative. Nel **II** e **IV** hanno segni opposti ("x" e "y" alternati).
:::

---

# Verifica le tue conoscenze

## Quiz 1

:::quiz
difficulty: facile
question: Qual è la formula corretta per calcolare la componente $A_x$ di un vettore?

- [ ] $A_x = A \cdot \sin\theta$
- [x] $A_x = A \cdot \cos\theta$
- [ ] $A_x = A \cdot \tan\theta$
- [ ] $A_x = A / \cos\theta$

explanation: La componente $A_x$ è il cateto **adiacente** all'angolo $\theta$, quindi si calcola con il **coseno**: $A_x = A \cdot \cos\theta$.
:::

## Quiz 2

:::quiz
difficulty: media
question: Se un vettore si trova nel II quadrante, quali sono i segni delle sue componenti?

- [ ] $A_x > 0$ e $A_y > 0$
- [x] $A_x < 0$ e $A_y > 0$
- [ ] $A_x < 0$ e $A_y < 0$
- [ ] $A_x > 0$ e $A_y < 0$

explanation: Nel II quadrante, il vettore punta verso sinistra ($A_x < 0$) e verso l'alto ($A_y > 0$).
:::

## Quiz 3

:::quiz
difficulty: media
question: L'identità $\sin^2\theta + \cos^2\theta = 1$ deriva da:

- [ ] La definizione di tangente
- [x] Il teorema di Pitagora
- [ ] La legge dei seni
- [ ] La proprietà commutativa

explanation: L'identità fondamentale è una conseguenza diretta del **teorema di Pitagora** applicato a un triangolo rettangolo con ipotenusa unitaria (cerchio goniometrico).
:::

---

# Conclusione

## Riepilogo

:::image
assetId: shared/assi-cartesiani
alt: Sistema di assi cartesiani x-y
caption: Sistema di riferimento per lavorare con i vettori
width: 50
:::

## 1) Identifica i dati

Stabilisci se conosci **modulo e angolo** oppure le **componenti**.

## 2) Da modulo/angolo a componenti

Usa le formule: $A_x = A \cos\theta$ e $A_y = A \sin\theta$

## 3) Da componenti a modulo/angolo

Calcola $A = \sqrt{A_x^2 + A_y^2}$ e $\theta_{acuto} = \arctan(|A_y|/|A_x|)$

## 4) Verifica il quadrante

Controlla i segni di $A_x$ e $A_y$ per determinare il quadrante e l'angolo corretto.

:::image
assetId: vettori/quadranti
alt: Segni delle componenti nei quattro quadranti
caption: Ricorda i segni nei quattro quadranti!
width: 60
:::

---

# Risorse

:::risorsa
tipo: libro
titolo: Capitolo 3 - I vettori
descrizione: Libro di testo, paragrafo sulle componenti cartesiane
:::

:::risorsa
tipo: video
titolo: Componenti di un vettore
url: https://www.youtube.com/watch?v=esempio
descrizione: Video esplicativo con esempi
:::

:::risorsa
tipo: sito
titolo: Khan Academy - Vectors
url: https://www.khanacademy.org/math/vectors
descrizione: Esercizi interattivi sui vettori
:::

---
id: vettori-componenti-cartesiane
title: Componenti cartesiane di un vettore
subtitle: Dalla forma polare alla forma cartesiana
subject: fisica
topic: vettori
level: secondo-biennio
duration: 45
author: Prof. Rossi
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
  - Ricostruire un vettore dalle sue componenti
  - Applicare le formule in problemi concreti
---

# Obiettivo della lezione

Imparare a **scomporre un vettore** nelle sue **componenti cartesiane**, 
e a ricostruirlo a partire da esse.

:::callout prerequisiti
- Funzioni trigonometriche seno e coseno
- Concetto di vettore e modulo
- Coordinate cartesiane nel piano
:::

---

# Dal vettore alle componenti

Un vettore $\vec{v}$ nel piano può essere descritto in due modi equivalenti:

- tramite **modulo e direzione** (forma polare)
- tramite le sue **componenti lungo gli assi** (forma cartesiana)

>>>

:::note info
Il passaggio tra le due forme è fondamentale in fisica: 
ci permette di scomporre forze, velocità e altre grandezze vettoriali.
:::

---

# Proiezioni sugli assi

Dato un vettore $\vec{v}$ che forma un angolo $\theta$ con l'asse $x$ positivo, 
le sue componenti sono:

>>>

$$v_x = |\vec{v}| \cos\theta$$

>>>

$$v_y = |\vec{v}| \sin\theta$$

>>>

:::image
src: /images/lezioni/vettori/triangolo-rettangolo.svg
alt: Triangolo rettangolo formato dal vettore
caption: Il vettore e le sue componenti formano un triangolo rettangolo
width: 80
:::

---

# Definizione formale

:::definition
term: Componenti cartesiane

Le **componenti cartesiane** di un vettore $\vec{v}$ sono le sue proiezioni 
ortogonali sugli assi coordinati. Nel piano:
- $v_x = |\vec{v}| \cos\theta$ (componente lungo $x$)
- $v_y = |\vec{v}| \sin\theta$ (componente lungo $y$)

note: Le componenti sono scalari con segno, non moduli!
:::

---

# Esempio di calcolo

:::example
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

---

# Il segno delle componenti

:::note warning
Attenzione al segno! Nel secondo e terzo quadrante $v_x < 0$, 
nel terzo e quarto quadrante $v_y < 0$.
:::

>>>

:::question
title: Verifica comprensione

question: Perché la componente $v_x$ può assumere valori negativi?

answer:
La componente $v_x = |\vec{v}| \cos\theta$ può essere negativa perché 
il coseno è negativo per angoli compresi tra 90° e 270° (secondo e 
terzo quadrante). Il modulo $|\vec{v}|$ è sempre positivo, quindi il 
segno dipende solo dal coseno.
:::

---

# Ricostruire il modulo

Dalle componenti possiamo sempre risalire al modulo del vettore 
usando il **teorema di Pitagora**:

$$|\vec{v}| = \sqrt{v_x^2 + v_y^2}$$

>>>

:::theorem
name: Teorema di Pitagora vettoriale

statement:
Il modulo di un vettore è uguale alla radice quadrata della somma 
dei quadrati delle sue componenti: $|\vec{v}| = \sqrt{v_x^2 + v_y^2}$

proof:
Il vettore e le sue componenti formano un triangolo rettangolo, 
dove il vettore è l'ipotenusa e le componenti sono i cateti. 
Per il teorema di Pitagora: $|\vec{v}|^2 = v_x^2 + v_y^2$
:::

---

# Esercizio guidato

:::activity
title: Applica le formule

Dato un vettore con modulo 8 e angolo 60°, calcola le componenti 
$v_x$ e $v_y$. Verifica il risultato usando il teorema di Pitagora.

note: Usa la calcolatrice in modalità gradi, non radianti!
:::

---

# Quiz di verifica

:::quiz
difficulty: media
question: Qual è la componente $v_x$ di un vettore con modulo 6 e angolo 60°?

- [ ] $v_x = 6$
- [x] $v_x = 3$
- [ ] $v_x = 3\sqrt{3}$
- [ ] $v_x = 6\sqrt{3}$

explanation: $v_x = 6 \cdot \cos 60° = 6 \cdot \frac{1}{2} = 3$
:::

---

# Riepilogo

:::note remember
**Punti chiave della lezione:**

1. $v_x = |\vec{v}| \cos\theta$ e $v_y = |\vec{v}| \sin\theta$
2. Le componenti hanno segno (possono essere negative)
3. Dal teorema di Pitagora: $|\vec{v}| = \sqrt{v_x^2 + v_y^2}$
:::

:::link
lessonId: vettori-somma
text: Prossima lezione: Somma di vettori
description: Impara a sommare vettori usando le componenti
:::

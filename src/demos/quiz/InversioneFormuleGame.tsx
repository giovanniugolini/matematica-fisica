/**
 * InversioneFormuleGame - Isola la variabile
 * 3 livelli + scontro finale. Vinci → Cavaliere delle Formule.
 */

import React, { useState, useMemo } from "react";
import { Latex, useBreakpoint } from "../../components/ui";

// ============ TIPI ============

interface StepChoice { id: string; label: string; }

interface ChallengeStep {
    equationLatex: string;
    choices: StepChoice[];
    correctId: string;
    resultLatex: string;
    explanation: string;
}

interface FormulaChallenge {
    id: string;
    level: 1 | 2 | 3 | "boss";
    description: string;
    targetLatex: string;
    steps: ChallengeStep[];
}

type GamePhase =
    | "start" | "level_intro" | "playing" | "feedback"
    | "formula_solved" | "level_complete" | "boss_intro"
    | "game_over" | "victory";

// ============ COSTANTI ============

const FORMULAS_PER_LEVEL = 5;

const LEVEL_INFO = {
    1: { label: "Livello 1", name: "Facile", color: "#16a34a", bg: "#f0fdf4", border: "#86efac", emoji: "🌱" },
    2: { label: "Livello 2", name: "Intermedio", color: "#d97706", bg: "#fffbeb", border: "#fcd34d", emoji: "⚡" },
    3: { label: "Livello 3", name: "Difficile", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", emoji: "🔥" },
    boss: { label: "BOSS FINALE", name: "Supersolutore", color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd", emoji: "👑" },
} as const;

// ============ SFIDE LIVELLO 1 — Facile (1 passo) ============

const L1: FormulaChallenge[] = [
    {
        id: "l1-ab-b", level: 1, description: "Prodotto di due variabili", targetLatex: "b",
        steps: [{
            equationLatex: "a \\cdot b = c",
            choices: [{ id: "÷a", label: "÷ a" }, { id: "÷b", label: "÷ b" }, { id: "×a", label: "× a" }, { id: "−a", label: "− a" }],
            correctId: "÷a", resultLatex: "b = \\dfrac{c}{a}",
            explanation: "Dividiamo per a: b = c / a",
        }],
    },
    {
        id: "l1-apb-b", level: 1, description: "Somma di due variabili", targetLatex: "b",
        steps: [{
            equationLatex: "a + b = c",
            choices: [{ id: "−a", label: "− a" }, { id: "−b", label: "− b" }, { id: "+c", label: "+ c" }, { id: "÷a", label: "÷ a" }],
            correctId: "−a", resultLatex: "b = c - a",
            explanation: "Sottraiamo a: b = c − a",
        }],
    },
    {
        id: "l1-gmh-g", level: 1, description: "Differenza di variabili", targetLatex: "g",
        steps: [{
            equationLatex: "g - h = k",
            choices: [{ id: "+h", label: "+ h" }, { id: "−h", label: "− h" }, { id: "+k", label: "+ k" }, { id: "÷h", label: "÷ h" }],
            correctId: "+h", resultLatex: "g = k + h",
            explanation: "Aggiungiamo h: g = k + h",
        }],
    },
    {
        id: "l1-mn-n", level: 1, description: "Prodotto di due variabili", targetLatex: "n",
        steps: [{
            equationLatex: "m \\cdot n = p",
            choices: [{ id: "÷m", label: "÷ m" }, { id: "÷n", label: "÷ n" }, { id: "×p", label: "× p" }, { id: "−m", label: "− m" }],
            correctId: "÷m", resultLatex: "n = \\dfrac{p}{m}",
            explanation: "Dividiamo per m: n = p / m",
        }],
    },
    {
        id: "l1-dpg-d", level: 1, description: "Somma di variabili", targetLatex: "d",
        steps: [{
            equationLatex: "d + g = r",
            choices: [{ id: "−g", label: "− g" }, { id: "−d", label: "− d" }, { id: "+r", label: "+ r" }, { id: "÷g", label: "÷ g" }],
            correctId: "−g", resultLatex: "d = r - g",
            explanation: "Sottraiamo g: d = r − g",
        }],
    },
    {
        id: "l1-kq-q", level: 1, description: "Prodotto di variabili", targetLatex: "q",
        steps: [{
            equationLatex: "k \\cdot q = h",
            choices: [{ id: "÷k", label: "÷ k" }, { id: "÷q", label: "÷ q" }, { id: "×h", label: "× h" }, { id: "−k", label: "− k" }],
            correctId: "÷k", resultLatex: "q = \\dfrac{h}{k}",
            explanation: "Dividiamo per k: q = h / k",
        }],
    },
    {
        id: "l1-bmc-b", level: 1, description: "Differenza di variabili", targetLatex: "b",
        steps: [{
            equationLatex: "b - c = a",
            choices: [{ id: "+c", label: "+ c" }, { id: "−c", label: "− c" }, { id: "+a", label: "+ a" }, { id: "÷c", label: "÷ c" }],
            correctId: "+c", resultLatex: "b = a + c",
            explanation: "Aggiungiamo c: b = a + c",
        }],
    },
    {
        id: "l1-3a-a", level: 1, description: "Coefficiente numerico", targetLatex: "a",
        steps: [{
            equationLatex: "3 \\cdot a = b",
            choices: [{ id: "÷3", label: "÷ 3" }, { id: "÷b", label: "÷ b" }, { id: "×3", label: "× 3" }, { id: "−3", label: "− 3" }],
            correctId: "÷3", resultLatex: "a = \\dfrac{b}{3}",
            explanation: "Dividiamo per 3: a = b / 3",
        }],
    },
];

// ============ SFIDE LIVELLO 2 — Intermedio (2 passi) ============

const L2: FormulaChallenge[] = [
    {
        id: "l2-adivb-b", level: 2, description: "Rapporto di variabili", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a}{b} = c",
                choices: [{ id: "×b", label: "× b" }, { id: "÷b", label: "÷ b" }, { id: "÷c", label: "÷ c" }, { id: "−c", label: "− c" }],
                correctId: "×b", resultLatex: "a = c \\cdot b",
                explanation: "Moltiplichiamo per b per toglierlo dal denominatore",
            },
            {
                equationLatex: "a = c \\cdot b",
                choices: [{ id: "÷c", label: "÷ c" }, { id: "÷a", label: "÷ a" }, { id: "÷b", label: "÷ b" }, { id: "−c", label: "− c" }],
                correctId: "÷c", resultLatex: "b = \\dfrac{a}{c}",
                explanation: "Dividiamo per c: b = a / c",
            },
        ],
    },
    {
        id: "l2-abpc-b", level: 2, description: "Formula lineare", targetLatex: "b",
        steps: [
            {
                equationLatex: "a \\cdot b + c = d",
                choices: [{ id: "−c", label: "− c" }, { id: "+c", label: "+ c" }, { id: "÷a", label: "÷ a" }, { id: "−d", label: "− d" }],
                correctId: "−c", resultLatex: "a \\cdot b = d - c",
                explanation: "Sottraiamo c: a·b = d − c",
            },
            {
                equationLatex: "a \\cdot b = d - c",
                choices: [{ id: "÷a", label: "÷ a" }, { id: "÷b", label: "÷ b" }, { id: "×a", label: "× a" }, { id: "÷(d−c)", label: "÷(d−c)" }],
                correctId: "÷a", resultLatex: "b = \\dfrac{d - c}{a}",
                explanation: "Dividiamo per a: b = (d−c) / a",
            },
        ],
    },
    {
        id: "l2-gk-h-g", level: 2, description: "Rapporto con sottrazione", targetLatex: "g",
        steps: [
            {
                equationLatex: "\\dfrac{g}{k} - h = p",
                choices: [{ id: "+h", label: "+ h" }, { id: "−h", label: "− h" }, { id: "×k", label: "× k" }, { id: "+p", label: "+ p" }],
                correctId: "+h", resultLatex: "\\dfrac{g}{k} = p + h",
                explanation: "Aggiungiamo h: g/k = p + h",
            },
            {
                equationLatex: "\\dfrac{g}{k} = p + h",
                choices: [{ id: "×k", label: "× k" }, { id: "÷k", label: "÷ k" }, { id: "÷(p+h)", label: "÷(p+h)" }, { id: "−p", label: "− p" }],
                correctId: "×k", resultLatex: "g = k \\cdot (p + h)",
                explanation: "Moltiplichiamo per k: g = k(p + h)",
            },
        ],
    },
    {
        id: "l2-apb-c-b", level: 2, description: "Somma al numeratore", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a + b}{c} = d",
                choices: [{ id: "×c", label: "× c" }, { id: "÷c", label: "÷ c" }, { id: "×d", label: "× d" }, { id: "−a", label: "− a" }],
                correctId: "×c", resultLatex: "a + b = d \\cdot c",
                explanation: "Moltiplichiamo per c: a + b = d·c",
            },
            {
                equationLatex: "a + b = d \\cdot c",
                choices: [{ id: "−a", label: "− a" }, { id: "+a", label: "+ a" }, { id: "÷d", label: "÷ d" }, { id: "−dc", label: "−d·c" }],
                correctId: "−a", resultLatex: "b = d \\cdot c - a",
                explanation: "Sottraiamo a: b = d·c − a",
            },
        ],
    },
    {
        id: "l2-abpc-c-b", level: 2, description: "Fattore fuori parentesi", targetLatex: "b",
        steps: [
            {
                equationLatex: "a \\cdot (b + c) = d",
                choices: [{ id: "÷a", label: "÷ a" }, { id: "÷b", label: "÷ b" }, { id: "÷c", label: "÷ c" }, { id: "−c", label: "− c" }],
                correctId: "÷a", resultLatex: "b + c = \\dfrac{d}{a}",
                explanation: "Dividiamo per a: b + c = d/a",
            },
            {
                equationLatex: "b + c = \\dfrac{d}{a}",
                choices: [{ id: "−c", label: "− c" }, { id: "+c", label: "+ c" }, { id: "÷c", label: "÷ c" }, { id: "×a", label: "× a" }],
                correctId: "−c", resultLatex: "b = \\dfrac{d}{a} - c",
                explanation: "Sottraiamo c: b = d/a − c",
            },
        ],
    },
    {
        id: "l2-2apb-a", level: 2, description: "Coefficiente numerico + somma", targetLatex: "a",
        steps: [
            {
                equationLatex: "2a + b = c",
                choices: [{ id: "−b", label: "− b" }, { id: "+b", label: "+ b" }, { id: "÷2", label: "÷ 2" }, { id: "−2a", label: "− 2a" }],
                correctId: "−b", resultLatex: "2a = c - b",
                explanation: "Sottraiamo b: 2a = c − b",
            },
            {
                equationLatex: "2a = c - b",
                choices: [{ id: "÷2", label: "÷ 2" }, { id: "×2", label: "× 2" }, { id: "÷(c−b)", label: "÷(c−b)" }, { id: "+b", label: "+ b" }],
                correctId: "÷2", resultLatex: "a = \\dfrac{c - b}{2}",
                explanation: "Dividiamo per 2: a = (c−b)/2",
            },
        ],
    },
    {
        id: "l2-mn-p-n", level: 2, description: "Prodotto con sottrazione", targetLatex: "n",
        steps: [
            {
                equationLatex: "m \\cdot n - p = q",
                choices: [{ id: "+p", label: "+ p" }, { id: "−p", label: "− p" }, { id: "÷m", label: "÷ m" }, { id: "+q", label: "+ q" }],
                correctId: "+p", resultLatex: "m \\cdot n = q + p",
                explanation: "Aggiungiamo p: m·n = q + p",
            },
            {
                equationLatex: "m \\cdot n = q + p",
                choices: [{ id: "÷m", label: "÷ m" }, { id: "÷n", label: "÷ n" }, { id: "×m", label: "× m" }, { id: "÷(q+p)", label: "÷(q+p)" }],
                correctId: "÷m", resultLatex: "n = \\dfrac{q + p}{m}",
                explanation: "Dividiamo per m: n = (q+p)/m",
            },
        ],
    },
    {
        id: "l2-gmh-k-g", level: 2, description: "Differenza al numeratore", targetLatex: "g",
        steps: [
            {
                equationLatex: "\\dfrac{g - h}{k} = p",
                choices: [{ id: "×k", label: "× k" }, { id: "÷k", label: "÷ k" }, { id: "+h", label: "+ h" }, { id: "×p", label: "× p" }],
                correctId: "×k", resultLatex: "g - h = p \\cdot k",
                explanation: "Moltiplichiamo per k: g − h = p·k",
            },
            {
                equationLatex: "g - h = p \\cdot k",
                choices: [{ id: "+h", label: "+ h" }, { id: "−h", label: "− h" }, { id: "÷p", label: "÷ p" }, { id: "+pk", label: "+p·k" }],
                correctId: "+h", resultLatex: "g = p \\cdot k + h",
                explanation: "Aggiungiamo h: g = p·k + h",
            },
        ],
    },
];

// ============ SFIDE LIVELLO 3 — Difficile (3 passi) ============

const L3: FormulaChallenge[] = [
    {
        id: "l3-ab2c-b", level: 3, description: "Quadrato al numeratore", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a \\cdot b^2}{c} = d",
                choices: [{ id: "×c", label: "× c" }, { id: "÷c", label: "÷ c" }, { id: "÷a", label: "÷ a" }, { id: "×d", label: "× d" }],
                correctId: "×c", resultLatex: "a \\cdot b^2 = d \\cdot c",
                explanation: "Moltiplichiamo per c per toglierlo dal denominatore",
            },
            {
                equationLatex: "a \\cdot b^2 = d \\cdot c",
                choices: [{ id: "÷a", label: "÷ a" }, { id: "÷b²", label: "÷ b²" }, { id: "×a", label: "× a" }, { id: "÷dc", label: "÷(dc)" }],
                correctId: "÷a", resultLatex: "b^2 = \\dfrac{d \\cdot c}{a}",
                explanation: "Dividiamo per a: b² = dc/a",
            },
            {
                equationLatex: "b^2 = \\dfrac{d \\cdot c}{a}",
                choices: [{ id: "√", label: "√ (radice)" }, { id: "²", label: "² (quadrato)" }, { id: "÷2", label: "÷ 2" }, { id: "×2", label: "× 2" }],
                correctId: "√", resultLatex: "b = \\sqrt{\\dfrac{d \\cdot c}{a}}",
                explanation: "Estraiamo la radice quadrata: b = √(dc/a)",
            },
        ],
    },
    {
        id: "l3-amb-cpd-a", level: 3, description: "Differenza su somma", targetLatex: "a",
        steps: [
            {
                equationLatex: "\\dfrac{a - b}{c + d} = g",
                choices: [{ id: "×(c+d)", label: "×(c+d)" }, { id: "÷(c+d)", label: "÷(c+d)" }, { id: "+b", label: "+ b" }, { id: "×g", label: "× g" }],
                correctId: "×(c+d)", resultLatex: "a - b = g \\cdot (c + d)",
                explanation: "Moltiplichiamo per (c+d): a − b = g(c+d)",
            },
            {
                equationLatex: "a - b = g \\cdot (c + d)",
                choices: [{ id: "+b", label: "+ b" }, { id: "−b", label: "− b" }, { id: "÷g", label: "÷ g" }, { id: "×b", label: "× b" }],
                correctId: "+b", resultLatex: "a = g \\cdot (c + d) + b",
                explanation: "Aggiungiamo b: a = g(c+d) + b",
            },
        ],
    },
    {
        id: "l3-ab2mc-b", level: 3, description: "Quadrato con offset", targetLatex: "b",
        steps: [
            {
                equationLatex: "a \\cdot b^2 - c = d",
                choices: [{ id: "+c", label: "+ c" }, { id: "−c", label: "− c" }, { id: "÷a", label: "÷ a" }, { id: "+d", label: "+ d" }],
                correctId: "+c", resultLatex: "a \\cdot b^2 = d + c",
                explanation: "Aggiungiamo c: a·b² = d + c",
            },
            {
                equationLatex: "a \\cdot b^2 = d + c",
                choices: [{ id: "÷a", label: "÷ a" }, { id: "÷b²", label: "÷ b²" }, { id: "×a", label: "× a" }, { id: "÷(d+c)", label: "÷(d+c)" }],
                correctId: "÷a", resultLatex: "b^2 = \\dfrac{d + c}{a}",
                explanation: "Dividiamo per a: b² = (d+c)/a",
            },
            {
                equationLatex: "b^2 = \\dfrac{d + c}{a}",
                choices: [{ id: "√", label: "√ (radice)" }, { id: "²", label: "² (quadrato)" }, { id: "÷2", label: "÷ 2" }, { id: "×½", label: "× ½" }],
                correctId: "√", resultLatex: "b = \\sqrt{\\dfrac{d + c}{a}}",
                explanation: "Radice quadrata: b = √((d+c)/a)",
            },
        ],
    },
    {
        id: "l3-k-apb-g-a", level: 3, description: "Variabile al denominatore", targetLatex: "a",
        steps: [
            {
                equationLatex: "\\dfrac{k}{a + b} = g",
                choices: [{ id: "×(a+b)", label: "×(a+b)" }, { id: "÷g", label: "÷ g" }, { id: "×g", label: "× g" }, { id: "+b", label: "+ b" }],
                correctId: "×(a+b)", resultLatex: "k = g \\cdot (a + b)",
                explanation: "Moltiplichiamo per (a+b): k = g(a+b)",
            },
            {
                equationLatex: "k = g \\cdot (a + b)",
                choices: [{ id: "÷g", label: "÷ g" }, { id: "÷k", label: "÷ k" }, { id: "×g", label: "× g" }, { id: "−b", label: "− b" }],
                correctId: "÷g", resultLatex: "\\dfrac{k}{g} = a + b",
                explanation: "Dividiamo per g: k/g = a + b",
            },
            {
                equationLatex: "\\dfrac{k}{g} = a + b",
                choices: [{ id: "−b", label: "− b" }, { id: "+b", label: "+ b" }, { id: "÷b", label: "÷ b" }, { id: "×g", label: "× g" }],
                correctId: "−b", resultLatex: "a = \\dfrac{k}{g} - b",
                explanation: "Sottraiamo b: a = k/g − b",
            },
        ],
    },
    {
        id: "l3-a-bmc-b", level: 3, description: "Variabile al denominatore con diff.", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a}{b - c} = d",
                choices: [{ id: "×(b−c)", label: "×(b−c)" }, { id: "÷d", label: "÷ d" }, { id: "+c", label: "+ c" }, { id: "×d", label: "× d" }],
                correctId: "×(b−c)", resultLatex: "a = d \\cdot (b - c)",
                explanation: "Moltiplichiamo per (b−c): a = d(b−c)",
            },
            {
                equationLatex: "a = d \\cdot (b - c)",
                choices: [{ id: "÷d", label: "÷ d" }, { id: "÷a", label: "÷ a" }, { id: "+c", label: "+ c" }, { id: "−b", label: "− b" }],
                correctId: "÷d", resultLatex: "\\dfrac{a}{d} = b - c",
                explanation: "Dividiamo per d: a/d = b − c",
            },
            {
                equationLatex: "\\dfrac{a}{d} = b - c",
                choices: [{ id: "+c", label: "+ c" }, { id: "−c", label: "− c" }, { id: "÷c", label: "÷ c" }, { id: "×d", label: "× d" }],
                correctId: "+c", resultLatex: "b = \\dfrac{a}{d} + c",
                explanation: "Aggiungiamo c: b = a/d + c",
            },
        ],
    },
    {
        id: "l3-adivb2-b", level: 3, description: "Quadrato al denominatore", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a}{b^2} = c",
                choices: [{ id: "×b²", label: "× b²" }, { id: "÷b²", label: "÷ b²" }, { id: "÷c", label: "÷ c" }, { id: "×c", label: "× c" }],
                correctId: "×b²", resultLatex: "a = c \\cdot b^2",
                explanation: "Moltiplichiamo per b²: a = c·b²",
            },
            {
                equationLatex: "a = c \\cdot b^2",
                choices: [{ id: "÷c", label: "÷ c" }, { id: "÷a", label: "÷ a" }, { id: "÷b²", label: "÷ b²" }, { id: "×c", label: "× c" }],
                correctId: "÷c", resultLatex: "b^2 = \\dfrac{a}{c}",
                explanation: "Dividiamo per c: b² = a/c",
            },
            {
                equationLatex: "b^2 = \\dfrac{a}{c}",
                choices: [{ id: "√", label: "√ (radice)" }, { id: "²", label: "² (quadrato)" }, { id: "÷2", label: "÷ 2" }, { id: "×2", label: "× 2" }],
                correctId: "√", resultLatex: "b = \\sqrt{\\dfrac{a}{c}}",
                explanation: "Radice quadrata: b = √(a/c)",
            },
        ],
    },
];

// ============ SFIDE BOSS — Durissimo (3 passi complessi) ============

const BOSS: FormulaChallenge[] = [
    {
        id: "boss-1", level: "boss", description: "Formula con tre variabili", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a \\cdot (b + c)}{d} = g",
                choices: [{ id: "×d", label: "× d" }, { id: "÷d", label: "÷ d" }, { id: "÷a", label: "÷ a" }, { id: "−c", label: "− c" }],
                correctId: "×d", resultLatex: "a \\cdot (b + c) = g \\cdot d",
                explanation: "Moltiplichiamo per d: a(b+c) = gd",
            },
            {
                equationLatex: "a \\cdot (b + c) = g \\cdot d",
                choices: [{ id: "÷a", label: "÷ a" }, { id: "÷g", label: "÷ g" }, { id: "−c", label: "− c" }, { id: "÷(b+c)", label: "÷(b+c)" }],
                correctId: "÷a", resultLatex: "b + c = \\dfrac{g \\cdot d}{a}",
                explanation: "Dividiamo per a: b+c = gd/a",
            },
            {
                equationLatex: "b + c = \\dfrac{g \\cdot d}{a}",
                choices: [{ id: "−c", label: "− c" }, { id: "+c", label: "+ c" }, { id: "÷c", label: "÷ c" }, { id: "×a", label: "× a" }],
                correctId: "−c", resultLatex: "b = \\dfrac{g \\cdot d}{a} - c",
                explanation: "Sottraiamo c: b = gd/a − c",
            },
        ],
    },
    {
        id: "boss-2", level: "boss", description: "Formula con prodotto e offset", targetLatex: "a",
        steps: [
            {
                equationLatex: "\\dfrac{a \\cdot b - c}{d} = g",
                choices: [{ id: "×d", label: "× d" }, { id: "÷d", label: "÷ d" }, { id: "+c", label: "+ c" }, { id: "÷b", label: "÷ b" }],
                correctId: "×d", resultLatex: "a \\cdot b - c = g \\cdot d",
                explanation: "Moltiplichiamo per d: ab − c = gd",
            },
            {
                equationLatex: "a \\cdot b - c = g \\cdot d",
                choices: [{ id: "+c", label: "+ c" }, { id: "−c", label: "− c" }, { id: "÷b", label: "÷ b" }, { id: "÷g", label: "÷ g" }],
                correctId: "+c", resultLatex: "a \\cdot b = g \\cdot d + c",
                explanation: "Aggiungiamo c: ab = gd + c",
            },
            {
                equationLatex: "a \\cdot b = g \\cdot d + c",
                choices: [{ id: "÷b", label: "÷ b" }, { id: "÷a", label: "÷ a" }, { id: "÷g", label: "÷ g" }, { id: "−c", label: "− c" }],
                correctId: "÷b", resultLatex: "a = \\dfrac{g \\cdot d + c}{b}",
                explanation: "Dividiamo per b: a = (gd+c)/b",
            },
        ],
    },
    {
        id: "boss-3", level: "boss", description: "Quadrato con quattro variabili", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a \\cdot b^2}{c + d} = g",
                choices: [{ id: "×(c+d)", label: "×(c+d)" }, { id: "÷(c+d)", label: "÷(c+d)" }, { id: "÷a", label: "÷ a" }, { id: "×g", label: "× g" }],
                correctId: "×(c+d)", resultLatex: "a \\cdot b^2 = g \\cdot (c + d)",
                explanation: "Moltiplichiamo per (c+d): ab² = g(c+d)",
            },
            {
                equationLatex: "a \\cdot b^2 = g \\cdot (c + d)",
                choices: [{ id: "÷a", label: "÷ a" }, { id: "÷b²", label: "÷ b²" }, { id: "÷g", label: "÷ g" }, { id: "×a", label: "× a" }],
                correctId: "÷a", resultLatex: "b^2 = \\dfrac{g \\cdot (c + d)}{a}",
                explanation: "Dividiamo per a: b² = g(c+d)/a",
            },
            {
                equationLatex: "b^2 = \\dfrac{g \\cdot (c + d)}{a}",
                choices: [{ id: "√", label: "√ (radice)" }, { id: "²", label: "² (quadrato)" }, { id: "÷2", label: "÷ 2" }, { id: "×½", label: "× ½" }],
                correctId: "√", resultLatex: "b = \\sqrt{\\dfrac{g \\cdot (c + d)}{a}}",
                explanation: "Radice quadrata: b = √(g(c+d)/a)",
            },
        ],
    },
];

// ============ UTILITY ============

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getLevelChallenges(level: 1 | 2 | 3): FormulaChallenge[] {
    const pool = level === 1 ? L1 : level === 2 ? L2 : L3;
    return shuffle(pool).slice(0, FORMULAS_PER_LEVEL);
}

// ============ COMPONENTE PRINCIPALE ============

export default function InversioneFormuleGame() {
    const { isMobile } = useBreakpoint();

    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [phase, setPhase] = useState<GamePhase>("start");
    const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | "boss">(1);
    const [levelScore, setLevelScore] = useState(0);   // formule risolte nel livello corrente
    const [challenges, setChallenges] = useState<FormulaChallenge[]>([]);
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [stepIdx, setStepIdx] = useState(0);
    const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);

    const currentChallenge = challenges[challengeIdx] ?? null;
    const currentStep = currentChallenge?.steps[stepIdx] ?? null;
    const isLastStep = currentChallenge ? stepIdx >= currentChallenge.steps.length - 1 : false;

    const shuffledChoices = useMemo(
        () => (currentStep ? shuffle([...currentStep.choices]) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentChallenge?.id, stepIdx]
    );

    function startGame() {
        setLives(3);
        setScore(0);
        setLevelScore(0);
        setCurrentLevel(1);
        setChallenges(getLevelChallenges(1));
        setChallengeIdx(0);
        setStepIdx(0);
        setFeedback(null);
        setPhase("level_intro");
    }

    function handleChoice(choiceId: string) {
        if ((phase !== "playing") || !currentStep) return;
        const correct = choiceId === currentStep.correctId;
        setFeedback({ correct });
        if (!correct) {
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives <= 0) {
                setBestScore(prev => Math.max(prev, score));
                setPhase("game_over");
                return;
            }
        }
        setPhase("feedback");
    }

    function handleContinue() {
        if (!feedback) return;
        if (!feedback.correct) {
            setFeedback(null);
            setPhase("playing");
            return;
        }
        if (isLastStep) {
            const newScore = score + 1;
            const newLevelScore = levelScore + 1;
            setScore(newScore);
            setLevelScore(newLevelScore);
            setFeedback(null);
            setPhase("formula_solved");
        } else {
            setStepIdx(s => s + 1);
            setFeedback(null);
            setPhase("playing");
        }
    }

    function handleNextChallenge() {
        // Livello completato?
        if (levelScore >= FORMULAS_PER_LEVEL) {
            if (currentLevel === 3) {
                // Passa al boss
                setChallenges(BOSS);
                setChallengeIdx(0);
                setStepIdx(0);
                setLevelScore(0);
                setCurrentLevel("boss");
                setPhase("boss_intro");
            } else if (currentLevel === "boss") {
                // Vittoria!
                setBestScore(prev => Math.max(prev, score));
                setPhase("victory");
            } else {
                // Prossimo livello
                const next = (currentLevel + 1) as 1 | 2 | 3;
                setChallenges(getLevelChallenges(next));
                setChallengeIdx(0);
                setStepIdx(0);
                setLevelScore(0);
                setCurrentLevel(next);
                setPhase("level_complete");
            }
        } else {
            // Prossima formula stesso livello
            const nextIdx = (challengeIdx + 1) % challenges.length;
            setChallengeIdx(nextIdx);
            setStepIdx(0);
            setPhase("playing");
        }
    }

    // Quando il boss viene sconfitto (3 formule boss risolte)
    function checkBossVictory() {
        if (currentLevel === "boss" && levelScore >= BOSS.length) {
            setBestScore(prev => Math.max(prev, score));
            setPhase("victory");
        } else {
            const nextIdx = challengeIdx + 1;
            if (nextIdx < BOSS.length) {
                setChallengeIdx(nextIdx);
                setStepIdx(0);
                setPhase("playing");
            } else {
                setBestScore(prev => Math.max(prev, score));
                setPhase("victory");
            }
        }
    }

    // Override handleNextChallenge per boss
    function handleNextAfterFormula() {
        if (currentLevel === "boss") {
            checkBossVictory();
        } else {
            handleNextChallenge();
        }
    }

    const lv = currentLevel !== "boss" ? LEVEL_INFO[currentLevel] : LEVEL_INFO.boss;

    const BackLink = (
        <div style={{ marginBottom: 12 }}>
            <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>← Torna alla home</a>
        </div>
    );

    const Header = (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 14, padding: "10px 14px",
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
        }}>
            <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                    <span key={i} style={{ fontSize: 22, opacity: i < lives ? 1 : 0.18, transition: "opacity 0.3s" }}>❤️</span>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                    fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                    background: lv.bg, color: lv.color, border: `1px solid ${lv.border}`,
                }}>
                    {lv.emoji} {currentLevel === "boss" ? "BOSS" : `Lv.${currentLevel}`}
                </span>
                <span style={{
                    fontSize: 16, fontWeight: 800, color: "#0f172a",
                    background: "#f0fdf4", borderRadius: 8, padding: "4px 12px",
                    border: "1px solid #86efac",
                }}>🏆 {score}</span>
            </div>
        </div>
    );

    // ─── START ───
    if (phase === "start") {
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: isMobile ? "28px 20px" : "40px 32px",
                    background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0",
                }}>
                    <div style={{ fontSize: 56, marginBottom: 6 }}>🎯</div>
                    <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                        Isola la variabile!
                    </h1>
                    <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                        Applica i principi di equivalenza per isolare la variabile evidenziata.
                        Supera i 3 livelli e affronta lo <strong>Scontro Finale</strong> per
                        diventare <strong>🏅 Cavaliere delle Formule</strong>!
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
                        <InfoChip icon="🌱" label="Livello 1 — Facile" color="#16a34a" bg="#f0fdf4" border="#86efac" />
                        <InfoChip icon="⚡" label="Livello 2 — Intermedio" color="#d97706" bg="#fffbeb" border="#fcd34d" />
                        <InfoChip icon="🔥" label="Livello 3 — Difficile" color="#dc2626" bg="#fef2f2" border="#fca5a5" />
                        <InfoChip icon="👑" label="Boss Finale!" color="#7c3aed" bg="#faf5ff" border="#c4b5fd" />
                        <InfoChip icon="❤️❤️❤️" label="3 vite totali" color="#ef4444" bg="#fff1f2" border="#fca5a5" />
                        {bestScore > 0 && <InfoChip icon="⭐" label={`Record: ${bestScore}`} color="#d97706" bg="#fffbeb" border="#fde68a" />}
                    </div>
                    <button onClick={startGame} style={{
                        padding: "14px 44px", background: "#3b82f6", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700,
                        cursor: "pointer",
                    }}>
                        Inizia il gioco →
                    </button>
                </div>
            </div>
        );
    }

    // ─── LEVEL INTRO ───
    if (phase === "level_intro") {
        const lvInfo = LEVEL_INFO[currentLevel as 1 | 2 | 3];
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: "40px 32px",
                    background: lvInfo.bg, borderRadius: 20,
                    border: `2px solid ${lvInfo.border}`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.08)`,
                }}>
                    <div style={{ fontSize: 64, marginBottom: 8 }}>{lvInfo.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: lvInfo.color, letterSpacing: 1, marginBottom: 4 }}>
                        {lvInfo.label.toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
                        {lvInfo.name}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
                        {currentLevel === 1 && "Formule semplici a 1 passo. Riscaldati!"}
                        {currentLevel === 2 && "Formule a 2 passi. Serve più attenzione."}
                        {currentLevel === 3 && "Formule a 3 passi con quadrati. Ci vuole la testa!"}
                    </p>
                    <div style={{
                        display: "flex", justifyContent: "center", gap: 6, marginBottom: 28,
                    }}>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{ fontSize: 22, opacity: i < lives ? 1 : 0.2 }}>❤️</span>
                        ))}
                    </div>
                    <button onClick={() => setPhase("playing")} style={{
                        padding: "14px 44px", background: lvInfo.color, color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
                    }}>
                        Vai! {lvInfo.emoji}
                    </button>
                </div>
            </div>
        );
    }

    // ─── LEVEL COMPLETE ───
    if (phase === "level_complete") {
        const prevLevel = (currentLevel as number) - 1;
        const nextLvInfo = LEVEL_INFO[currentLevel as 1 | 2 | 3];
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: "40px 32px",
                    background: "#fff", borderRadius: 20,
                    border: "2px solid #86efac",
                    boxShadow: "0 4px 24px rgba(22,163,74,0.12)",
                }}>
                    <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", letterSpacing: 1, marginBottom: 4 }}>
                        LIVELLO {prevLevel} SUPERATO!
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
                        Ottimo lavoro!
                    </h2>
                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
                        Preparati per il {nextLvInfo.label} — <strong>{nextLvInfo.name}</strong> {nextLvInfo.emoji}
                    </p>
                    <button onClick={() => setPhase("level_intro")} style={{
                        padding: "14px 44px", background: nextLvInfo.color, color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
                    }}>
                        Prossimo livello →
                    </button>
                </div>
            </div>
        );
    }

    // ─── BOSS INTRO ───
    if (phase === "boss_intro") {
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: "40px 32px",
                    background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
                    borderRadius: 20, border: "2px solid #7c3aed",
                    boxShadow: "0 4px 40px rgba(124,58,237,0.4)",
                }}>
                    <div style={{ fontSize: 72, marginBottom: 8 }}>👑</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c4b5fd", letterSpacing: 2, marginBottom: 4 }}>
                        SCONTRO FINALE
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
                        Il Boss delle Formule!
                    </h2>
                    <p style={{ color: "#ddd6fe", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                        Hai superato tutti e 3 i livelli. Ora affronta <strong>3 formule durissime</strong>.
                        Risolvi tutto senza perdere le ultime vite e diventerai
                        <strong style={{ color: "#fbbf24" }}> 🏅 Cavaliere delle Formule</strong>!
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{ fontSize: 22, opacity: i < lives ? 1 : 0.2 }}>❤️</span>
                        ))}
                    </div>
                    <button onClick={() => setPhase("playing")} style={{
                        padding: "14px 44px", background: "#7c3aed", color: "#fff",
                        border: "2px solid #c4b5fd", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
                    }}>
                        Affronta il Boss! 👑
                    </button>
                </div>
            </div>
        );
    }

    // ─── GAME OVER ───
    if (phase === "game_over") {
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: "40px 32px",
                    background: "#fff", borderRadius: 20, border: "2px solid #fca5a5",
                    boxShadow: "0 4px 32px rgba(239,68,68,0.12)",
                }}>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>💔</div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Partita finita!</h2>
                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Hai esaurito le vite</p>
                    <div style={{
                        display: "inline-block", padding: "16px 40px",
                        background: "#f0fdf4", borderRadius: 16, border: "2px solid #86efac", marginBottom: 24,
                    }}>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 1 }}>FORMULE RISOLTE</div>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "#16a34a", lineHeight: 1.1 }}>{score}</div>
                    </div>
                    <br />
                    <button onClick={startGame} style={{
                        padding: "14px 44px", background: "#3b82f6", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
                    }}>
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    // ─── VICTORY ───
    if (phase === "victory") {
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: "40px 32px",
                    background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #fef9c3 100%)",
                    borderRadius: 20, border: "3px solid #fbbf24",
                    boxShadow: "0 4px 48px rgba(251,191,36,0.35)",
                }}>
                    <div style={{ fontSize: 80, marginBottom: 8 }}>🏅</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#d97706", letterSpacing: 2, marginBottom: 4 }}>
                        CONGRATULAZIONI!
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: "#78350f", marginBottom: 6 }}>
                        Cavaliere delle Formule
                    </h2>
                    <p style={{ color: "#92400e", fontSize: 15, fontStyle: "italic", marginBottom: 24 }}>
                        "Conosce l'arte dell'inversione e piega ogni equazione alla sua volontà."
                    </p>
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: "20px 32px",
                        border: "2px solid #fde68a", marginBottom: 28, display: "inline-block",
                    }}>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 1 }}>FORMULE RISOLTE</div>
                        <div style={{ fontSize: 56, fontWeight: 800, color: "#d97706", lineHeight: 1.1 }}>{score}</div>
                        {bestScore > 0 && score >= bestScore && (
                            <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>🌟 Nuovo record!</div>
                        )}
                    </div>
                    <div style={{
                        display: "flex", justifyContent: "center", gap: 8, marginBottom: 28, flexWrap: "wrap",
                        fontSize: 13, color: "#78350f",
                    }}>
                        <span style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "4px 12px" }}>🌱 Livello 1 ✓</span>
                        <span style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "4px 12px" }}>⚡ Livello 2 ✓</span>
                        <span style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "4px 12px" }}>🔥 Livello 3 ✓</span>
                        <span style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "4px 12px" }}>👑 Boss ✓</span>
                    </div>
                    <button onClick={startGame} style={{
                        padding: "14px 44px", background: "#d97706", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
                    }}>
                        Gioca ancora 🏅
                    </button>
                </div>
            </div>
        );
    }

    if (!currentChallenge || !currentStep) return null;

    const totalSteps = currentChallenge.steps.length;
    const isBoss = currentLevel === "boss";

    // ─── FORMULA ISOLATA ───
    if (phase === "formula_solved" && currentChallenge) {
        const lastResult = currentChallenge.steps[currentChallenge.steps.length - 1].resultLatex;
        const remaining = isBoss ? BOSS.length - levelScore : FORMULAS_PER_LEVEL - levelScore;
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                {Header}
                <div style={{
                    textAlign: "center", padding: isMobile ? "24px 16px" : "32px 28px",
                    background: isBoss ? "#faf5ff" : "#f0fdf4", borderRadius: 20,
                    border: `2px solid ${isBoss ? "#c4b5fd" : "#86efac"}`,
                }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>{isBoss ? "👑" : "✅"}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isBoss ? "#7c3aed" : "#16a34a", marginBottom: 4, letterSpacing: 0.5 }}>
                        VARIABILE ISOLATA!
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                        {currentChallenge.description}
                        {remaining > 0 && (
                            <span style={{ marginLeft: 8, fontWeight: 600 }}>
                                — {remaining} formula{remaining !== 1 ? "e" : ""} rimasta{remaining !== 1 ? "" : ""}
                            </span>
                        )}
                    </div>
                    <div style={{
                        fontSize: isMobile ? 22 : 26, margin: "0 0 24px",
                        padding: "16px", background: "#fff", borderRadius: 12,
                        border: `1px solid ${isBoss ? "#c4b5fd" : "#bbf7d0"}`,
                    }}>
                        <Latex display>{lastResult}</Latex>
                    </div>
                    <button onClick={handleNextAfterFormula} style={{
                        padding: "14px 36px", background: isBoss ? "#7c3aed" : "#16a34a", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                    }}>
                        {isBoss
                            ? (levelScore >= BOSS.length ? "🏅 Scopri il premio!" : "Prossima sfida boss →")
                            : (levelScore >= FORMULAS_PER_LEVEL ? "Avanza al prossimo livello →" : "Prossima formula →")
                        }
                    </button>
                </div>
            </div>
        );
    }

    // ─── FEEDBACK ───
    if (phase === "feedback" && feedback) {
        const { correct } = feedback;
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                {Header}
                <div style={{
                    background: "#fff", borderRadius: 20,
                    border: `2px solid ${correct ? (isBoss ? "#c4b5fd" : "#86efac") : "#fca5a5"}`,
                    padding: isMobile ? "20px 16px" : "28px 24px",
                }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 12 }}>
                        {currentChallenge.description}
                        {totalSteps > 1 && <span style={{ marginLeft: 8 }}>passo {stepIdx + 1}/{totalSteps}</span>}
                    </div>
                    <div style={{
                        padding: "16px", borderRadius: 12,
                        background: correct ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${correct ? "#bbf7d0" : "#fecaca"}`,
                        textAlign: "center", marginBottom: 16,
                    }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: correct ? "#16a34a" : "#dc2626", marginBottom: 6 }}>
                            {correct ? "✅ Corretto!" : "❌ Sbagliato"}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", marginBottom: correct ? 10 : 0 }}>
                            {currentStep.explanation}
                        </div>
                        {correct && (
                            <div style={{ fontSize: isMobile ? 20 : 24, marginTop: 8, padding: "10px", background: "#fff", borderRadius: 8 }}>
                                <Latex display>{currentStep.resultLatex}</Latex>
                            </div>
                        )}
                        {!correct && lives > 0 && (
                            <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                                {lives} {lives === 1 ? "vita rimasta" : "vite rimaste"}
                            </div>
                        )}
                    </div>
                    <button onClick={handleContinue} style={{
                        width: "100%", padding: 14,
                        background: correct ? (isBoss ? "#7c3aed" : "#3b82f6") : "#ef4444",
                        color: "#fff", border: "none", borderRadius: 12,
                        fontSize: 15, fontWeight: 700, cursor: "pointer",
                    }}>
                        {correct
                            ? (isLastStep ? "Formula isolata! 🎉" : "Prossimo passaggio →")
                            : "Riprova questo passaggio"}
                    </button>
                </div>
            </div>
        );
    }

    // ─── PLAYING ───
    return (
        <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
            {BackLink}
            {Header}
            {isBoss && (
                <div style={{
                    textAlign: "center", fontSize: 12, fontWeight: 700, color: "#7c3aed",
                    background: "#faf5ff", border: "1px solid #c4b5fd", borderRadius: 8,
                    padding: "6px 12px", marginBottom: 10, letterSpacing: 0.5,
                }}>
                    👑 SCONTRO FINALE — Formula {challengeIdx + 1} di {BOSS.length}
                </div>
            )}
            <div style={{
                background: "#fff", borderRadius: 20,
                border: isBoss ? "2px solid #c4b5fd" : "1px solid #e2e8f0",
                padding: isMobile ? "18px 14px" : "28px 24px",
                boxShadow: isBoss ? "0 4px 24px rgba(124,58,237,0.12)" : "0 2px 16px rgba(0,0,0,0.06)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                        {currentChallenge.description}
                    </span>
                    {totalSteps > 1 && (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            Passo {stepIdx + 1}/{totalSteps}
                        </span>
                    )}
                </div>

                <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                    padding: "10px 14px",
                    background: isBoss ? "#faf5ff" : "#eff6ff",
                    borderRadius: 10,
                    border: isBoss ? "1px solid #c4b5fd" : "1px solid #bfdbfe",
                }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isBoss ? "#7c3aed" : "#1e40af" }}>
                        Obiettivo: isola
                    </span>
                    <span style={{
                        fontSize: isMobile ? 16 : 18,
                        background: isBoss ? "#ede9fe" : "#dbeafe",
                        borderRadius: 8, padding: "3px 12px", fontWeight: 700,
                        border: isBoss ? "1px solid #c4b5fd" : "1px solid #93c5fd",
                    }}>
                        <Latex>{currentChallenge.targetLatex}</Latex>
                    </span>
                </div>

                <div style={{
                    textAlign: "center", padding: isMobile ? "18px 8px" : "22px 16px",
                    background: "#f8fafc", borderRadius: 14, marginBottom: 20,
                    border: "1px solid #e2e8f0", fontSize: isMobile ? 22 : 28,
                }}>
                    <Latex display>{currentStep.equationLatex}</Latex>
                </div>

                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textAlign: "center", marginBottom: 14 }}>
                    Quale operazione applichi ad <em>entrambi i membri</em>?
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {shuffledChoices.map(choice => (
                        <ChoiceButton
                            key={choice.id}
                            label={choice.label}
                            onClick={() => handleChoice(choice.id)}
                            isMobile={isMobile}
                            isBoss={isBoss}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Componenti ausiliari ───

function ChoiceButton({ label, onClick, isMobile, isBoss }: {
    label: string; onClick: () => void; isMobile: boolean; isBoss: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: isMobile ? "18px 8px" : "20px 12px",
                background: hovered ? (isBoss ? "#ede9fe" : "#eff6ff") : "#fff",
                border: `2px solid ${hovered ? (isBoss ? "#7c3aed" : "#3b82f6") : "#e2e8f0"}`,
                borderRadius: 14, fontSize: isMobile ? 18 : 20,
                fontWeight: 800, cursor: "pointer",
                transition: "all 0.15s ease",
                color: hovered ? (isBoss ? "#5b21b6" : "#1e40af") : "#0f172a",
                textAlign: "center", letterSpacing: 0.5,
            }}
        >
            {label}
        </button>
    );
}

function InfoChip({ icon, label, color, bg, border }: {
    icon: string; label: string; color: string; bg: string; border: string;
}) {
    return (
        <div style={{
            padding: "8px 14px", background: bg, borderRadius: 10,
            border: `1px solid ${border}`, textAlign: "center",
        }}>
            <div style={{ fontSize: 16 }}>{icon}</div>
            <div style={{ fontSize: 12, color, fontWeight: 700, marginTop: 2 }}>{label}</div>
        </div>
    );
}

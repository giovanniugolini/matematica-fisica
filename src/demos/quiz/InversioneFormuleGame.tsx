/**
 * InversioneFormuleGame - Gioco: Isola la variabile
 *
 * Applica i principi di equivalenza (×, ÷, +, −) per isolare
 * la variabile indicata. 3 vite: 3 errori = fine del gioco.
 */

import React, { useState, useMemo } from "react";
import { Latex, useBreakpoint } from "../../components/ui";

// ============ TIPI ============

interface StepChoice {
    id: string;
    label: string;   // testo pulsante, es. "÷ a"
}

interface ChallengeStep {
    equationLatex: string;    // equazione nello stato corrente
    choices: StepChoice[];    // 4 scelte (1 corretta + 3 sbagliate)
    correctId: string;
    resultLatex: string;      // equazione dopo l'operazione corretta
    explanation: string;      // spiegazione del passaggio
}

interface FormulaChallenge {
    id: string;
    category: string;
    description: string;
    targetLatex: string;      // variabile da isolare
    steps: ChallengeStep[];
}

type GamePhase = "start" | "playing" | "feedback" | "formula_solved" | "game_over";

// ============ SFIDE ============

const CHALLENGES: FormulaChallenge[] = [
    // ─── 1 PASSO ───
    {
        id: "F-ma-m", category: "Fisica", description: "2° principio della dinamica", targetLatex: "m",
        steps: [{
            equationLatex: "F = m \\cdot a",
            choices: [
                { id: "÷a", label: "÷ a" }, { id: "÷m", label: "÷ m" },
                { id: "×a", label: "× a" }, { id: "−a", label: "− a" },
            ],
            correctId: "÷a", resultLatex: "m = \\dfrac{F}{a}",
            explanation: "Dividiamo entrambi i membri per a: F/a = m",
        }],
    },
    {
        id: "F-ma-a", category: "Fisica", description: "2° principio della dinamica", targetLatex: "a",
        steps: [{
            equationLatex: "F = m \\cdot a",
            choices: [
                { id: "÷m", label: "÷ m" }, { id: "÷a", label: "÷ a" },
                { id: "×m", label: "× m" }, { id: "−m", label: "− m" },
            ],
            correctId: "÷m", resultLatex: "a = \\dfrac{F}{m}",
            explanation: "Dividiamo entrambi i membri per m: F/m = a",
        }],
    },
    {
        id: "ohm-R", category: "Fisica", description: "Legge di Ohm", targetLatex: "R",
        steps: [{
            equationLatex: "V = I \\cdot R",
            choices: [
                { id: "÷I", label: "÷ I" }, { id: "÷R", label: "÷ R" },
                { id: "×I", label: "× I" }, { id: "−I", label: "− I" },
            ],
            correctId: "÷I", resultLatex: "R = \\dfrac{V}{I}",
            explanation: "Dividiamo entrambi i membri per I: V/I = R",
        }],
    },
    {
        id: "ohm-I", category: "Fisica", description: "Legge di Ohm", targetLatex: "I",
        steps: [{
            equationLatex: "V = I \\cdot R",
            choices: [
                { id: "÷R", label: "÷ R" }, { id: "÷I", label: "÷ I" },
                { id: "×R", label: "× R" }, { id: "−R", label: "− R" },
            ],
            correctId: "÷R", resultLatex: "I = \\dfrac{V}{R}",
            explanation: "Dividiamo entrambi i membri per R: V/R = I",
        }],
    },
    {
        id: "einstein-m", category: "Fisica", description: "Equivalenza massa-energia", targetLatex: "m",
        steps: [{
            equationLatex: "E = m \\cdot c^2",
            choices: [
                { id: "÷c²", label: "÷ c²" }, { id: "÷m", label: "÷ m" },
                { id: "×c²", label: "× c²" }, { id: "−c²", label: "− c²" },
            ],
            correctId: "÷c²", resultLatex: "m = \\dfrac{E}{c^2}",
            explanation: "Dividiamo entrambi i membri per c²: E/c² = m",
        }],
    },
    {
        id: "p-mv-v", category: "Fisica", description: "Quantità di moto", targetLatex: "v",
        steps: [{
            equationLatex: "p = m \\cdot v",
            choices: [
                { id: "÷m", label: "÷ m" }, { id: "÷v", label: "÷ v" },
                { id: "×m", label: "× m" }, { id: "−p", label: "− p" },
            ],
            correctId: "÷m", resultLatex: "v = \\dfrac{p}{m}",
            explanation: "Dividiamo entrambi i membri per m: p/m = v",
        }],
    },
    {
        id: "W-Fd-F", category: "Fisica", description: "Lavoro di una forza", targetLatex: "F",
        steps: [{
            equationLatex: "W = F \\cdot d",
            choices: [
                { id: "÷d", label: "÷ d" }, { id: "÷F", label: "÷ F" },
                { id: "×d", label: "× d" }, { id: "+d", label: "+ d" },
            ],
            correctId: "÷d", resultLatex: "F = \\dfrac{W}{d}",
            explanation: "Dividiamo entrambi i membri per d: W/d = F",
        }],
    },
    {
        id: "s-vt-v", category: "Fisica", description: "Moto rettilineo uniforme", targetLatex: "v",
        steps: [{
            equationLatex: "s = v \\cdot t",
            choices: [
                { id: "÷t", label: "÷ t" }, { id: "÷v", label: "÷ v" },
                { id: "×t", label: "× t" }, { id: "−t", label: "− t" },
            ],
            correctId: "÷t", resultLatex: "v = \\dfrac{s}{t}",
            explanation: "Dividiamo entrambi i membri per t: s/t = v",
        }],
    },
    {
        id: "P-VI-V", category: "Fisica", description: "Potenza elettrica", targetLatex: "V",
        steps: [{
            equationLatex: "P = V \\cdot I",
            choices: [
                { id: "÷I", label: "÷ I" }, { id: "÷V", label: "÷ V" },
                { id: "×I", label: "× I" }, { id: "−I", label: "− I" },
            ],
            correctId: "÷I", resultLatex: "V = \\dfrac{P}{I}",
            explanation: "Dividiamo entrambi i membri per I: P/I = V",
        }],
    },
    {
        id: "pV-nRT-T", category: "Fisica", description: "Legge dei gas perfetti", targetLatex: "T",
        steps: [{
            equationLatex: "p \\cdot V = n \\cdot R \\cdot T",
            choices: [
                { id: "÷nR", label: "÷ (nR)" }, { id: "÷n", label: "÷ n" },
                { id: "÷R", label: "÷ R" },     { id: "×nR", label: "× (nR)" },
            ],
            correctId: "÷nR", resultLatex: "T = \\dfrac{p \\cdot V}{n \\cdot R}",
            explanation: "Dividiamo entrambi i membri per n·R",
        }],
    },
    {
        id: "mat-ab-b", category: "Matematica", description: "Prodotto di due variabili", targetLatex: "b",
        steps: [{
            equationLatex: "a \\cdot b = c",
            choices: [
                { id: "÷a", label: "÷ a" }, { id: "÷b", label: "÷ b" },
                { id: "−a", label: "− a" }, { id: "×a", label: "× a" },
            ],
            correctId: "÷a", resultLatex: "b = \\dfrac{c}{a}",
            explanation: "Dividiamo entrambi i membri per a: c/a = b",
        }],
    },
    {
        id: "mat-a+b-b", category: "Matematica", description: "Somma di due variabili", targetLatex: "b",
        steps: [{
            equationLatex: "a + b = c",
            choices: [
                { id: "−a", label: "− a" }, { id: "−b", label: "− b" },
                { id: "+c", label: "+ c" }, { id: "÷a", label: "÷ a" },
            ],
            correctId: "−a", resultLatex: "b = c - a",
            explanation: "Sottraiamo a da entrambi i membri: b = c − a",
        }],
    },
    {
        id: "mat-a-b-a", category: "Matematica", description: "Differenza di due variabili", targetLatex: "a",
        steps: [{
            equationLatex: "a - b = c",
            choices: [
                { id: "+b", label: "+ b" }, { id: "−b", label: "− b" },
                { id: "+c", label: "+ c" }, { id: "÷b", label: "÷ b" },
            ],
            correctId: "+b", resultLatex: "a = c + b",
            explanation: "Aggiungiamo b ad entrambi i membri: a = c + b",
        }],
    },

    // ─── 2 PASSI ───
    {
        id: "v-st-t", category: "Fisica", description: "Moto rettilineo uniforme", targetLatex: "t",
        steps: [
            {
                equationLatex: "v = \\dfrac{s}{t}",
                choices: [
                    { id: "×t", label: "× t" }, { id: "÷t", label: "÷ t" },
                    { id: "×v", label: "× v" }, { id: "−s", label: "− s" },
                ],
                correctId: "×t", resultLatex: "v \\cdot t = s",
                explanation: "Moltiplichiamo entrambi i membri per t, così t esce dal denominatore",
            },
            {
                equationLatex: "v \\cdot t = s",
                choices: [
                    { id: "÷v", label: "÷ v" }, { id: "÷t", label: "÷ t" },
                    { id: "÷s", label: "÷ s" }, { id: "−v", label: "− v" },
                ],
                correctId: "÷v", resultLatex: "t = \\dfrac{s}{v}",
                explanation: "Dividiamo entrambi i membri per v: t = s/v",
            },
        ],
    },
    {
        id: "s-half-at2-a", category: "Fisica", description: "Moto uniformemente accelerato", targetLatex: "a",
        steps: [
            {
                equationLatex: "s = \\dfrac{1}{2}\\, a \\cdot t^2",
                choices: [
                    { id: "×2", label: "× 2" }, { id: "÷2", label: "÷ 2" },
                    { id: "÷t²", label: "÷ t²" }, { id: "−a", label: "− a" },
                ],
                correctId: "×2", resultLatex: "2s = a \\cdot t^2",
                explanation: "Moltiplichiamo per 2 per eliminare il coefficiente ½",
            },
            {
                equationLatex: "2s = a \\cdot t^2",
                choices: [
                    { id: "÷t²", label: "÷ t²" }, { id: "÷2", label: "÷ 2" },
                    { id: "÷a", label: "÷ a" }, { id: "×t²", label: "× t²" },
                ],
                correctId: "÷t²", resultLatex: "a = \\dfrac{2s}{t^2}",
                explanation: "Dividiamo entrambi i membri per t²: a = 2s/t²",
            },
        ],
    },
    {
        id: "Ek-half-mv2-v2", category: "Fisica", description: "Energia cinetica", targetLatex: "v^2",
        steps: [
            {
                equationLatex: "E_k = \\dfrac{1}{2}\\, m \\cdot v^2",
                choices: [
                    { id: "×2", label: "× 2" }, { id: "÷m", label: "÷ m" },
                    { id: "÷2", label: "÷ 2" }, { id: "−m", label: "− m" },
                ],
                correctId: "×2", resultLatex: "2E_k = m \\cdot v^2",
                explanation: "Moltiplichiamo per 2 per eliminare il coefficiente ½",
            },
            {
                equationLatex: "2E_k = m \\cdot v^2",
                choices: [
                    { id: "÷m", label: "÷ m" }, { id: "÷2", label: "÷ 2" },
                    { id: "÷Ek", label: "÷ Eₖ" }, { id: "×m", label: "× m" },
                ],
                correctId: "÷m", resultLatex: "v^2 = \\dfrac{2E_k}{m}",
                explanation: "Dividiamo entrambi i membri per m: v² = 2Eₖ/m",
            },
        ],
    },
    {
        id: "v2-v02-2as-a", category: "Fisica", description: "Moto uniformemente accelerato", targetLatex: "a",
        steps: [
            {
                equationLatex: "v^2 = v_0^2 + 2as",
                choices: [
                    { id: "−v₀²", label: "− v₀²" }, { id: "+v₀²", label: "+ v₀²" },
                    { id: "÷2s", label: "÷ 2s" },   { id: "−2as", label: "− 2as" },
                ],
                correctId: "−v₀²", resultLatex: "v^2 - v_0^2 = 2as",
                explanation: "Sottraiamo v₀² da entrambi i membri",
            },
            {
                equationLatex: "v^2 - v_0^2 = 2as",
                choices: [
                    { id: "÷2s", label: "÷ 2s" }, { id: "÷2", label: "÷ 2" },
                    { id: "÷s", label: "÷ s" },   { id: "×2s", label: "× 2s" },
                ],
                correctId: "÷2s", resultLatex: "a = \\dfrac{v^2 - v_0^2}{2s}",
                explanation: "Dividiamo entrambi i membri per 2s",
            },
        ],
    },
    {
        id: "F-kq-r2-r2", category: "Fisica", description: "Legge di Coulomb", targetLatex: "r^2",
        steps: [
            {
                equationLatex: "F = \\dfrac{k\\, q_1\\, q_2}{r^2}",
                choices: [
                    { id: "×r²", label: "× r²" }, { id: "÷r²", label: "÷ r²" },
                    { id: "×F", label: "× F" },   { id: "÷F", label: "÷ F" },
                ],
                correctId: "×r²", resultLatex: "F \\cdot r^2 = k\\, q_1\\, q_2",
                explanation: "Moltiplichiamo per r² per toglierlo dal denominatore",
            },
            {
                equationLatex: "F \\cdot r^2 = k\\, q_1\\, q_2",
                choices: [
                    { id: "÷F", label: "÷ F" }, { id: "÷r²", label: "÷ r²" },
                    { id: "÷k", label: "÷ k" }, { id: "×F", label: "× F" },
                ],
                correctId: "÷F", resultLatex: "r^2 = \\dfrac{k\\, q_1\\, q_2}{F}",
                explanation: "Dividiamo entrambi i membri per F",
            },
        ],
    },
    {
        id: "mat-a-over-b-b", category: "Matematica", description: "Rapporto di due variabili", targetLatex: "b",
        steps: [
            {
                equationLatex: "\\dfrac{a}{b} = c",
                choices: [
                    { id: "×b", label: "× b" }, { id: "÷b", label: "÷ b" },
                    { id: "÷c", label: "÷ c" }, { id: "−c", label: "− c" },
                ],
                correctId: "×b", resultLatex: "a = c \\cdot b",
                explanation: "Moltiplichiamo per b per toglierlo dal denominatore",
            },
            {
                equationLatex: "a = c \\cdot b",
                choices: [
                    { id: "÷c", label: "÷ c" }, { id: "÷a", label: "÷ a" },
                    { id: "÷b", label: "÷ b" }, { id: "−c", label: "− c" },
                ],
                correctId: "÷c", resultLatex: "b = \\dfrac{a}{c}",
                explanation: "Dividiamo entrambi i membri per c: b = a/c",
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

// ============ COMPONENTE PRINCIPALE ============

export default function InversioneFormuleGame() {
    const { isMobile } = useBreakpoint();

    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [phase, setPhase] = useState<GamePhase>("start");
    const [challenges, setChallenges] = useState<FormulaChallenge[]>([]);
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [stepIdx, setStepIdx] = useState(0);
    const [feedback, setFeedback] = useState<{ correct: boolean; choiceId: string } | null>(null);

    const currentChallenge = challenges[challengeIdx] ?? null;
    const currentStep = currentChallenge?.steps[stepIdx] ?? null;
    const isLastStep = currentChallenge
        ? stepIdx >= currentChallenge.steps.length - 1
        : false;

    // Shuffle delle scelte una volta per step
    const shuffledChoices = useMemo(
        () => (currentStep ? shuffle([...currentStep.choices]) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentChallenge?.id, stepIdx]
    );

    function startGame() {
        const shuffled = shuffle([...CHALLENGES]);
        setChallenges(shuffled);
        setChallengeIdx(0);
        setStepIdx(0);
        setLives(3);
        setScore(0);
        setFeedback(null);
        setPhase("playing");
    }

    function handleChoice(choiceId: string) {
        if (phase !== "playing" || !currentStep) return;
        const correct = choiceId === currentStep.correctId;
        setFeedback({ correct, choiceId });
        if (!correct) {
            const newLives = lives - 1;
            setLives(newLives);
            if (newLives <= 0) {
                setPhase("game_over");
                setBestScore(prev => Math.max(prev, score));
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
            setScore(s => s + 1);
            setPhase("formula_solved");
        } else {
            setStepIdx(s => s + 1);
            setFeedback(null);
            setPhase("playing");
        }
    }

    function handleNextChallenge() {
        setChallengeIdx(i => (i + 1) % challenges.length);
        setStepIdx(0);
        setFeedback(null);
        setPhase("playing");
    }

    // ─── Link torna alla home ───
    const BackLink = (
        <div style={{ marginBottom: 12 }}>
            <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                ← Torna alla home
            </a>
        </div>
    );

    // ─── Subcomponent: barra vite + punteggio ───
    const Header = (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 14, padding: "10px 14px",
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
        }}>
            <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                    <span key={i} style={{
                        fontSize: 22, opacity: i < lives ? 1 : 0.18,
                        transition: "opacity 0.3s",
                        filter: i < lives ? "none" : "grayscale(1)",
                    }}>❤️</span>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {bestScore > 0 && (
                    <span style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>⭐ {bestScore}</span>
                )}
                <span style={{
                    fontSize: 18, fontWeight: 800, color: "#0f172a",
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
                    background: "#fff", borderRadius: 20,
                    boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0",
                }}>
                    <div style={{ fontSize: 56, marginBottom: 6 }}>🎯</div>
                    <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                        Isola la variabile!
                    </h1>
                    <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
                        Ti viene mostrata una formula. Il tuo obiettivo è <strong>isolare la variabile evidenziata</strong> applicando i principi di equivalenza: moltiplica, dividi, aggiungi o sottrai lo stesso termine su entrambi i membri.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                        <InfoChip icon="❤️❤️❤️" label="3 vite" color="#ef4444" bg="#fef2f2" border="#fecaca" />
                        <InfoChip icon="💥" label="3 errori = fine" color="#dc2626" bg="#fff1f2" border="#fca5a5" />
                        <InfoChip icon="📐" label={`${CHALLENGES.length} formule`} color="#2563eb" bg="#eff6ff" border="#bfdbfe" />
                        {bestScore > 0 && <InfoChip icon="⭐" label={`Record: ${bestScore}`} color="#d97706" bg="#fffbeb" border="#fde68a" />}
                    </div>
                    <button onClick={startGame} style={{
                        padding: "14px 44px", background: "#3b82f6", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700,
                        cursor: "pointer", letterSpacing: 0.3,
                    }}>
                        Inizia il gioco →
                    </button>
                </div>
            </div>
        );
    }

    // ─── GAME OVER ───
    if (phase === "game_over") {
        const isRecord = score > bestScore && bestScore > 0;
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                <div style={{
                    textAlign: "center", padding: isMobile ? "28px 20px" : "40px 32px",
                    background: "#fff", borderRadius: 20,
                    boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "2px solid #fca5a5",
                }}>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>💔</div>
                    <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                        Partita finita!
                    </h2>
                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                        Hai esaurito le 3 vite
                    </p>
                    <div style={{
                        display: "inline-block", padding: "20px 48px",
                        background: "#f0fdf4", borderRadius: 16, border: "2px solid #86efac", marginBottom: 20,
                    }}>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 1 }}>FORMULE RISOLTE</div>
                        <div style={{ fontSize: 52, fontWeight: 800, color: "#16a34a", lineHeight: 1.1 }}>{score}</div>
                    </div>
                    {isRecord && (
                        <div style={{
                            marginBottom: 20, padding: "10px 20px",
                            background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a",
                            color: "#d97706", fontWeight: 700, fontSize: 14,
                        }}>
                            🌟 Nuovo record!
                        </div>
                    )}
                    <br />
                    <button onClick={startGame} style={{
                        padding: "14px 44px", background: "#3b82f6", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
                    }}>
                        Gioca ancora
                    </button>
                </div>
            </div>
        );
    }

    // ─── FORMULA ISOLATA ───
    if (phase === "formula_solved" && currentChallenge) {
        const lastResult = currentChallenge.steps[currentChallenge.steps.length - 1].resultLatex;
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                {Header}
                <div style={{
                    textAlign: "center", padding: isMobile ? "24px 16px" : "32px 28px",
                    background: "#f0fdf4", borderRadius: 20,
                    border: "2px solid #86efac",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.12)",
                }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>
                        VARIABILE ISOLATA!
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                        {currentChallenge.description}
                    </div>
                    <div style={{
                        fontSize: isMobile ? 22 : 26, margin: "0 0 24px",
                        padding: "16px", background: "#fff", borderRadius: 12, border: "1px solid #bbf7d0",
                    }}>
                        <Latex display>{lastResult}</Latex>
                    </div>
                    <button onClick={handleNextChallenge} style={{
                        padding: "14px 36px", background: "#16a34a", color: "#fff",
                        border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer",
                    }}>
                        Prossima formula →
                    </button>
                </div>
            </div>
        );
    }

    if (!currentChallenge || !currentStep) return null;

    const totalSteps = currentChallenge.steps.length;

    // ─── FEEDBACK (corretto o sbagliato) ───
    if (phase === "feedback" && feedback) {
        const { correct } = feedback;
        return (
            <div style={{ maxWidth: 540, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>
                {BackLink}
                {Header}
                <div style={{
                    background: "#fff", borderRadius: 20,
                    border: `2px solid ${correct ? "#86efac" : "#fca5a5"}`,
                    padding: isMobile ? "20px 16px" : "28px 24px",
                    boxShadow: `0 4px 20px ${correct ? "rgba(22,163,74,0.10)" : "rgba(239,68,68,0.10)"}`,
                }}>
                    {/* Categoria */}
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 12 }}>
                        {currentChallenge.category} · {currentChallenge.description}
                        {totalSteps > 1 && (
                            <span style={{ marginLeft: 8, color: "#94a3b8" }}>
                                (passo {stepIdx + 1}/{totalSteps})
                            </span>
                        )}
                    </div>

                    {/* Banner risultato */}
                    <div style={{
                        padding: "16px", borderRadius: 12,
                        background: correct ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${correct ? "#bbf7d0" : "#fecaca"}`,
                        textAlign: "center", marginBottom: 16,
                    }}>
                        <div style={{
                            fontSize: 15, fontWeight: 700,
                            color: correct ? "#16a34a" : "#dc2626", marginBottom: 6,
                        }}>
                            {correct ? "✅ Corretto!" : "❌ Sbagliato"}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", marginBottom: correct ? 10 : 0 }}>
                            {currentStep.explanation}
                        </div>
                        {correct && (
                            <div style={{
                                fontSize: isMobile ? 20 : 24, marginTop: 8,
                                padding: "10px", background: "#fff", borderRadius: 8,
                            }}>
                                <Latex display>{currentStep.resultLatex}</Latex>
                            </div>
                        )}
                        {!correct && lives > 0 && (
                            <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                                {lives} {lives === 1 ? "vita rimasta" : "vite rimaste"}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleContinue}
                        style={{
                            width: "100%", padding: 14,
                            background: correct ? "#3b82f6" : "#ef4444",
                            color: "#fff", border: "none", borderRadius: 12,
                            fontSize: 15, fontWeight: 700, cursor: "pointer",
                        }}
                    >
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

            <div style={{
                background: "#fff", borderRadius: 20,
                border: "1px solid #e2e8f0", padding: isMobile ? "18px 14px" : "28px 24px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}>
                {/* Categoria + progresso passi */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                        {currentChallenge.category} · {currentChallenge.description}
                    </span>
                    {totalSteps > 1 && (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            Passo {stepIdx + 1}/{totalSteps}
                        </span>
                    )}
                </div>

                {/* Obiettivo */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                    padding: "10px 14px", background: "#eff6ff", borderRadius: 10,
                    border: "1px solid #bfdbfe",
                }}>
                    <span style={{ fontSize: 13, color: "#1e40af", fontWeight: 700 }}>Obiettivo: isola</span>
                    <span style={{
                        fontSize: isMobile ? 16 : 18, background: "#dbeafe",
                        borderRadius: 8, padding: "3px 12px", fontWeight: 700,
                        border: "1px solid #93c5fd",
                    }}>
                        <Latex>{currentChallenge.targetLatex}</Latex>
                    </span>
                </div>

                {/* Equazione corrente */}
                <div style={{
                    textAlign: "center", padding: isMobile ? "18px 8px" : "22px 16px",
                    background: "#f8fafc", borderRadius: 14, marginBottom: 20,
                    border: "1px solid #e2e8f0",
                    fontSize: isMobile ? 22 : 28,
                }}>
                    <Latex display>{currentStep.equationLatex}</Latex>
                </div>

                {/* Istruzione */}
                <div style={{
                    fontSize: 13, color: "#64748b", fontWeight: 600,
                    textAlign: "center", marginBottom: 14,
                }}>
                    Quale operazione applichi ad <em>entrambi i membri</em>?
                </div>

                {/* Scelte */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {shuffledChoices.map(choice => (
                        <ChoiceButton
                            key={choice.id}
                            label={choice.label}
                            onClick={() => handleChoice(choice.id)}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Componenti ausiliari ───

function ChoiceButton({ label, onClick, isMobile }: {
    label: string; onClick: () => void; isMobile: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: isMobile ? "18px 8px" : "20px 12px",
                background: hovered ? "#eff6ff" : "#fff",
                border: `2px solid ${hovered ? "#3b82f6" : "#e2e8f0"}`,
                borderRadius: 14, fontSize: isMobile ? 20 : 22,
                fontWeight: 800, cursor: "pointer",
                transition: "all 0.15s ease",
                color: hovered ? "#1e40af" : "#0f172a",
                textAlign: "center",
                letterSpacing: 0.5,
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
            padding: "10px 16px", background: bg, borderRadius: 10,
            border: `1px solid ${border}`, textAlign: "center", minWidth: 90,
        }}>
            <div style={{ fontSize: 18 }}>{icon}</div>
            <div style={{ fontSize: 12, color, fontWeight: 700, marginTop: 4 }}>{label}</div>
        </div>
    );
}

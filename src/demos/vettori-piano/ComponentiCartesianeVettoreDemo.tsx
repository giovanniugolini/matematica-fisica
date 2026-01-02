/**
 * ComponentiCartesianeVettoreDemo
 *
 * Demo interattiva per studiare le componenti cartesiane di un vettore:
 * - Modalità 1: Modulo e angolo → componenti (Aₓ = A·cosθ, Aᵧ = A·senθ)
 * - Modalità 2: Componenti → modulo e angolo (A = √(Aₓ² + Aᵧ²), θ = tan⁻¹(|Aᵧ|/|Aₓ|) + quadrante)
 *
 * Nota didattica (grafico):
 * - Per rendere leggibile il disegno, l’arco viene sempre mostrato come "arco minore":
 *   θ_eff ∈ (-180°, 180°], con θ_eff = θ se θ ≤ 180°, altrimenti θ_eff = θ - 360°.
 * - In modalità "modulo-angolo" usiamo e MOSTRIAMO θ_eff anche dentro sin/cos.
 *
 * Extra:
 * - MiniQuiz integrato a fine pagina (10 domande).
 */

import React, { useMemo, useState } from "react";
import { DemoContainer, useBreakpoint, ResponsiveCard, CollapsiblePanel } from "../../components/ui";
import { Latex, DisplayMath } from "../../components/ui/Latex";
import { CoordinatePlane, PlaneArc, PlaneLine, PlaneVector } from "../../components/ui/CoordinatePlane";

// ============ TIPI ============

type Mode = "modulo-angolo" | "componenti";

type ComputedBase = {
    mode: Mode;
    ax: number;
    ay: number;
    modulo: number;
    quadrante: number;
    thetaDirDeg: number; // direzione 0..360
    thetaEffDeg: number; // (-180..180] per arco minore
    thetaRad: number; // rad di thetaEff
};

type ComputedModuloAngolo = ComputedBase & {
    mode: "modulo-angolo";
};

type ComputedComponenti = ComputedBase & {
    mode: "componenti";
    angoloAcuto: number; // sempre 0..90
};

type Computed = ComputedModuloAngolo | ComputedComponenti;

type QuizOptionKey = "A" | "B" | "C" | "D";

type QuizQuestion = {
    question: string;
    options: Record<QuizOptionKey, string>;
    correct: QuizOptionKey;
    explanation: string;
};

// ============ COSTANTI ============

const VECTOR_COLOR = "#dc2626"; // rosso - vettore principale
const COMP_X_COLOR = "#2563eb"; // blu - componente x
const COMP_Y_COLOR = "#16a34a"; // verde - componente y
const ANGLE_COLOR = "#f59e0b"; // arancione - angolo
const TRIANGLE_COLOR = "#94a3b8"; // grigio - triangolo tratteggiato

// Valori iniziali (Reset)
const INITIAL_MODULO = 4;
const INITIAL_ANGOLO_DEG = 30;

// ============ QUIZ DATA ============

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question:
            "Cosa rappresentano le coordinate Ax e Ay della punta di un vettore A quando la sua coda è nell'origine degli assi?",
        options: {
            A: "Il modulo e il verso",
            B: "Le componenti cartesiane del vettore",
            C: "La pendenza della retta",
            D: "Le funzioni goniometriche del vettore",
        },
        correct: "B",
        explanation:
            "Le coordinate Ax e Ay del punto della punta del vettore A sono chiamate componenti cartesiane del vettore.",
    },
    {
        question: "In un triangolo rettangolo come viene definita la funzione coseno (cos θ)?",
        options: {
            A: "Rapporto tra cateto opposto e ipotenusa",
            B: "Rapporto tra cateto adiacente e ipotenusa",
            C: "Rapporto tra cateto opposto e cateto adiacente",
            D: "Prodotto tra i due cateti",
        },
        correct: "B",
        explanation:
            "Il coseno di un angolo è il rapporto fra la lunghezza del cateto adiacente all'angolo e la lunghezza dell'ipotenusa.",
    },
    {
        question: "Qual è la formula per trovare la componente verticale Ay conoscendo il modulo A e l'angolo θ?",
        options: {
            A: "Ay = A * cos θ",
            B: "Ay = A / sin θ",
            C: "Ay = A * sin θ",
            D: "Ay = A * tg θ",
        },
        correct: "C",
        explanation:
            "Dalla definizione di seno (sen θ = b/a) segue che il cateto opposto (Ay) è uguale all'ipotenusa (A) per il seno dell'angolo.",
    },
    {
        question:
            "Se un vettore si trova nel secondo quadrante del sistema cartesiano quali sono i segni delle sue componenti?",
        options: {
            A: "Ax > 0 e Ay > 0",
            B: "Ax < 0 e Ay < 0",
            C: "Ax < 0 e Ay > 0",
            D: "Ax > 0 e Ay < 0",
        },
        correct: "C",
        explanation:
            "Nel secondo quadrante la componente Ax (asse x) è negativa mentre la componente Ay (asse y) è positiva.",
    },
    {
        question: "Quale relazione lega la tangente di un angolo al seno e al coseno?",
        options: {
            A: "tg θ = cos θ / sen θ",
            B: "tg θ = sen θ * cos θ",
            C: "tg θ = sen θ / cos θ",
            D: "tg θ = sen^2 θ + cos^2 θ",
        },
        correct: "C",
        explanation:
            "Dividendo numeratore e denominatore per l’ipotenusa si ottiene tg θ = sen θ / cos θ.",
    },
    {
        question: "Quale valore non possono mai superare il seno e il coseno di un angolo?",
        options: {
            A: "Sempre minori o uguali a 1",
            B: "Sempre maggiori di 1",
            C: "Sempre pari a 0",
            D: "Sempre uguali alla tangente",
        },
        correct: "A",
        explanation: "Seno e coseno assumono valori compresi tra -1 e 1, quindi in valore assoluto non superano 1.",
    },
    {
        question: "Cosa indica l'identità fondamentale sen^2 θ + cos^2 θ = 1?",
        options: {
            A: "La legge della tangente",
            B: "Il teorema di Pitagora applicato a un triangolo con ipotenusa unitaria",
            C: "La somma dei moduli di due vettori",
            D: "La pendenza di un vettore",
        },
        correct: "B",
        explanation:
            "È una conseguenza del teorema di Pitagora nel cerchio goniometrico (ipotenusa unitaria): sen^2 θ + cos^2 θ = 1.",
    },
    {
        question: "Per calcolare l'angolo conoscendo il valore della tangente quale funzione della calcolatrice si deve usare?",
        options: {
            A: "sin",
            B: "cos",
            C: "tan^-1 (o tasto INV/SHIFT + tan)",
            D: "RAD",
        },
        correct: "C",
        explanation:
            "Se si conosce il valore della tangente e si vuole determinare l'angolo si applica la funzione inversa (tan^-1).",
    },
    {
        question: "Quale impostazione deve essere visibile sulla calcolatrice scientifica per lavorare con gli angoli in gradi?",
        options: {
            A: "RAD",
            B: "GRAD",
            C: "DEG o D",
            D: "FIX",
        },
        correct: "C",
        explanation:
            "Prima di utilizzare le funzioni goniometriche bisogna accertarsi che sulla calcolatrice compaia DEG o D.",
    },
    {
        question: "Dati il modulo A e l'angolo θ la componente Ax è calcolata come?",
        options: {
            A: "Ax = A * sen θ",
            B: "Ax = A * cos θ",
            C: "Ax = A * tg θ",
            D: "Ax = A^2",
        },
        correct: "B",
        explanation:
            "La componente Ax corrisponde al cateto adiacente all'angolo θ e quindi si calcola come ipotenusa per il coseno dell'angolo.",
    },
];

// ============ HELPERS ============

function radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

function formatNumber(n: number, decimals: number = 2): string {
    return n.toFixed(decimals).replace(/\.?0+$/, "");
}

function normalizeAngle360(deg: number): number {
    return ((deg % 360) + 360) % 360; // 0..360
}

// Angolo equivalente per arco minore: (-180..180]
function minorAngleDeg(theta360: number): number {
    const t = normalizeAngle360(theta360);
    return t > 180 ? t - 360 : t;
}

function getQuadrant(ax: number, ay: number): number {
    if (ax >= 0 && ay >= 0) return 1;
    if (ax < 0 && ay >= 0) return 2;
    if (ax < 0 && ay < 0) return 3;
    return 4;
}

function getQuadrantName(q: number): string {
    const names = ["", "I quadrante", "II quadrante", "III quadrante", "IV quadrante"];
    return names[q] ?? "";
}

// ============ MINI QUIZ (INLINE) ============

function MiniQuiz({ questions }: { questions: QuizQuestion[] }) {
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState<QuizOptionKey | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);

    const current = questions[idx];
    const isLast = idx === questions.length - 1;
    const correct = current.correct;

    const resetQuiz = () => {
        setIdx(0);
        setSelected(null);
        setShowAnswer(false);
        setScore(0);
    };

    const pick = (k: QuizOptionKey) => {
        if (showAnswer) return;
        setSelected(k);
    };

    const check = () => {
        if (!selected) return;
        if (showAnswer) return;
        setShowAnswer(true);
        if (selected === correct) setScore((s) => s + 1);
    };

    const next = () => {
        if (!showAnswer) return;
        if (isLast) return;
        setIdx((i) => i + 1);
        setSelected(null);
        setShowAnswer(false);
    };

    const buttonStyle = (k: QuizOptionKey): React.CSSProperties => {
        const base: React.CSSProperties = {
            width: "100%",
            textAlign: "left",
            padding: "12px 12px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#fff",
            cursor: showAnswer ? "default" : "pointer",
            transition: "transform 0.05s ease",
            fontSize: 14,
            lineHeight: 1.2,
        };

        const isSel = selected === k;

        if (!showAnswer) {
            return {
                ...base,
                border: isSel ? "2px solid #3b82f6" : base.border,
                background: isSel ? "#eff6ff" : base.background,
            };
        }

        // showAnswer
        if (k === correct) {
            return { ...base, border: "2px solid #16a34a", background: "#f0fdf4" };
        }
        if (isSel && k !== correct) {
            return { ...base, border: "2px solid #ef4444", background: "#fef2f2" };
        }
        return { ...base, opacity: 0.9 };
    };

    const progressPct = Math.round(((idx + 1) / questions.length) * 100);
    const isCorrect = showAnswer && selected === correct;

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "#475569" }}>
                    Domanda <strong>{idx + 1}</strong> / {questions.length}
                </div>
                <div style={{ fontSize: 13, color: "#475569" }}>
                    Punteggio: <strong>{score}</strong> / {questions.length}
                </div>
            </div>

            <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999 }}>
                <div
                    style={{
                        width: `${progressPct}%`,
                        height: "100%",
                        background: "#3b82f6",
                        borderRadius: 999,
                        transition: "width 0.2s ease",
                    }}
                />
            </div>

            <div style={{ padding: 12, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 10 }}>
                    {current.question}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                    {(["A", "B", "C", "D"] as QuizOptionKey[]).map((k) => (
                        <button key={k} onClick={() => pick(k)} style={buttonStyle(k)}>
                            <strong style={{ marginRight: 10 }}>{k}.</strong> {current.options[k]}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button
                        onClick={check}
                        disabled={!selected || showAnswer}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: !selected || showAnswer ? "#f1f5f9" : "#111827",
                            color: !selected || showAnswer ? "#64748b" : "#fff",
                            cursor: !selected || showAnswer ? "not-allowed" : "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                        }}
                    >
                        Verifica
                    </button>

                    <button
                        onClick={next}
                        disabled={!showAnswer || isLast}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: !showAnswer || isLast ? "#f1f5f9" : "#3b82f6",
                            color: !showAnswer || isLast ? "#64748b" : "#fff",
                            cursor: !showAnswer || isLast ? "not-allowed" : "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                        }}
                    >
                        Prossima
                    </button>

                    <button
                        onClick={resetQuiz}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                        }}
                    >
                        Ricomincia quiz
                    </button>
                </div>

                {showAnswer && (
                    <div style={{ marginTop: 14 }}>
                        <div
                            style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: isCorrect ? "#f0fdf4" : "#fef2f2",
                                border: `1px solid ${isCorrect ? "#bbf7d0" : "#fecaca"}`,
                                color: "#0f172a",
                                fontSize: 13,
                                fontWeight: 600,
                            }}
                        >
                            {isCorrect ? "✅ Risposta corretta!" : `❌ Risposta errata. La risposta corretta è ${correct}.`}
                        </div>

                        <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontWeight: 800, color: "#334155", marginBottom: 6 }}>Spiegazione</div>
                            <div style={{ color: "#334155", fontSize: 13, lineHeight: 1.35 }}>{current.explanation}</div>
                        </div>

                        {isLast && (
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    color: "#0f172a",
                                }}
                            >
                                <div style={{ fontWeight: 900, marginBottom: 4 }}>Quiz completato 🎉</div>
                                <div style={{ fontSize: 13 }}>
                                    Punteggio finale: <strong>{score}</strong> / {questions.length}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function ComponentiCartesianeVettoreDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Modalità
    const [mode, setMode] = useState<Mode>("modulo-angolo");

    // Modalità 1: modulo e angolo (direzione)
    const [modulo, setModulo] = useState(INITIAL_MODULO);
    const [angoloDeg, setAngoloDeg] = useState(INITIAL_ANGOLO_DEG);

    // Modalità 2: componenti
    const [compX, setCompX] = useState(3);
    const [compY, setCompY] = useState(2);

    // Reset: riporta il vettore a modulo/angolo prestabiliti
    const resetVector = () => {
        const mod = INITIAL_MODULO;
        const theta = INITIAL_ANGOLO_DEG;

        setModulo(mod);
        setAngoloDeg(theta);

        // coerenza anche per slider componenti
        const ax = Math.round(mod * Math.cos(degToRad(theta)) * 10) / 10;
        const ay = Math.round(mod * Math.sin(degToRad(theta)) * 10) / 10;
        setCompX(ax);
        setCompY(ay);
    };

    // Calcoli derivati (unione discriminata)
    const computed: Computed = useMemo(() => {
        if (mode === "modulo-angolo") {
            const thetaDirDeg = normalizeAngle360(angoloDeg);
            const thetaEffDeg = minorAngleDeg(thetaDirDeg);
            const thetaRad = degToRad(thetaEffDeg);

            const ax = modulo * Math.cos(thetaRad);
            const ay = modulo * Math.sin(thetaRad);

            return {
                mode,
                ax,
                ay,
                modulo,
                quadrante: getQuadrant(ax, ay),
                thetaDirDeg,
                thetaEffDeg,
                thetaRad,
            };
        }

        // mode === "componenti"
        const ax = compX;
        const ay = compY;

        const mod = Math.sqrt(ax * ax + ay * ay);
        const quadrante = getQuadrant(ax, ay);

        // angolo acuto (0..90)
        let angoloAcuto = 0;
        if (Math.abs(ax) > 1e-6) {
            angoloAcuto = radToDeg(Math.atan(Math.abs(ay) / Math.abs(ax)));
        } else {
            angoloAcuto = 90;
        }

        // direzione 0..360
        let thetaDir = 0;
        if (ax >= 0 && ay >= 0) thetaDir = angoloAcuto; // I
        else if (ax < 0 && ay >= 0) thetaDir = 180 - angoloAcuto; // II
        else if (ax < 0 && ay < 0) thetaDir = 180 + angoloAcuto; // III
        else thetaDir = 360 - angoloAcuto; // IV

        thetaDir = normalizeAngle360(thetaDir);
        const thetaEffDeg = minorAngleDeg(thetaDir);
        const thetaRad = degToRad(thetaEffDeg);

        return {
            mode,
            ax,
            ay,
            modulo: mod,
            quadrante,
            thetaDirDeg: thetaDir,
            thetaEffDeg,
            thetaRad,
            angoloAcuto,
        };
    }, [mode, modulo, angoloDeg, compX, compY]);

    // ============ ELEMENTI GRAFICI ============

    const mainVector: PlaneVector = {
        origin: { x: 0, y: 0 },
        end: { x: computed.ax, y: computed.ay },
        color: VECTOR_COLOR,
        strokeWidth: 3,
        label: "A⃗",
        labelPosition: "end",
    };

    const vectorAx: PlaneVector = {
        origin: { x: 0, y: 0 },
        end: { x: computed.ax, y: 0 },
        color: COMP_X_COLOR,
        strokeWidth: 2,
        label: "Aₓ",
        labelPosition: "middle",
    };

    const vectorAy: PlaneVector = {
        origin: { x: 0, y: 0 },
        end: { x: 0, y: computed.ay },
        color: COMP_Y_COLOR,
        strokeWidth: 2,
        label: "Aᵧ",
        labelPosition: "middle",
    };

    const triangleLines: PlaneLine[] = [
        {
            p1: { x: computed.ax, y: computed.ay },
            p2: { x: computed.ax, y: 0 },
            color: TRIANGLE_COLOR,
            strokeWidth: 1.5,
            style: "dashed",
        },
        {
            p1: { x: computed.ax, y: computed.ay },
            p2: { x: 0, y: computed.ay },
            color: TRIANGLE_COLOR,
            strokeWidth: 1.5,
            style: "dashed",
        },
    ];

    const angleArc: PlaneArc = {
        center: { x: 0, y: 0 },
        radius: Math.min(1.2, computed.modulo * 0.3),
        startAngle: 0,
        endAngle: computed.thetaEffDeg, // può essere negativo → arco minore
        color: ANGLE_COLOR,
        strokeWidth: 2,
        label: "θ",
    };

    const range = Math.max(6, Math.ceil(computed.modulo) + 2);

    // ============ UI: Selettore modalità + Reset ============

    const modeSelector = (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button
                onClick={() => setMode("modulo-angolo")}
                style={{
                    flex: 1,
                    minWidth: 140,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: mode === "modulo-angolo" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                    background: mode === "modulo-angolo" ? "#dbeafe" : "#fff",
                    cursor: "pointer",
                    fontWeight: mode === "modulo-angolo" ? 600 : 400,
                    fontSize: 14,
                }}
            >
                📐 Modulo e Angolo → Componenti
            </button>

            <button
                onClick={() => setMode("componenti")}
                style={{
                    flex: 1,
                    minWidth: 140,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: mode === "componenti" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                    background: mode === "componenti" ? "#dbeafe" : "#fff",
                    cursor: "pointer",
                    fontWeight: mode === "componenti" ? 600 : 400,
                    fontSize: 14,
                }}
            >
                📊 Componenti → Modulo e Angolo
            </button>

            <button
                onClick={resetVector}
                style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
                title="Reset vettore"
            >
                ↺ Reset
            </button>
        </div>
    );

    // ============ PANNELLO INPUT ============

    const inputPanel =
        mode === "modulo-angolo" ? (
            <ResponsiveCard style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: VECTOR_COLOR }}>📥 Input: Modulo e Angolo</div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>
                            Modulo |A⃗| = {formatNumber(modulo, 1)}
                        </label>
                        <input
                            type="range"
                            min={0.5}
                            max={8}
                            step={0.1}
                            value={modulo}
                            onChange={(e) => setModulo(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>
                            Direzione θ = {formatNumber(normalizeAngle360(angoloDeg), 0)}°
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={angoloDeg}
                            onChange={(e) => setAngoloDeg(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </ResponsiveCard>
        ) : (
            <ResponsiveCard style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: VECTOR_COLOR }}>📥 Input: Componenti</div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, color: COMP_X_COLOR, display: "block", marginBottom: 4 }}>
                            Aₓ = {formatNumber(compX, 1)}
                        </label>
                        <input
                            type="range"
                            min={-6}
                            max={6}
                            step={0.1}
                            value={compX}
                            onChange={(e) => setCompX(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: COMP_Y_COLOR, display: "block", marginBottom: 4 }}>
                            Aᵧ = {formatNumber(compY, 1)}
                        </label>
                        <input
                            type="range"
                            min={-6}
                            max={6}
                            step={0.1}
                            value={compY}
                            onChange={(e) => setCompY(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </ResponsiveCard>
        );

    // ============ PANNELLO RISULTATI ============

    const resultsPanel = (
        <ResponsiveCard style={{ background: "#f8fafc" }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#334155" }}>📤 Risultati</div>

            <div style={{ display: "grid", gap: 12 }}>
                <div
                    style={{
                        padding: "8px 12px",
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <span style={{ color: "#6b7280", fontSize: 13 }}>Quadrante: </span>
                    <strong>{getQuadrantName(computed.quadrante)}</strong>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8" }}>
            (Aₓ {computed.ax >= 0 ? "> 0" : "< 0"}, Aᵧ {computed.ay >= 0 ? "> 0" : "< 0"})
          </span>
                </div>

                {computed.mode === "modulo-angolo" && (
                    <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Componenti calcolate:</div>

                        <div style={{ display: "grid", gap: 8 }}>
                            <div>
                                <Latex>{`A_x = A \\cdot \\cos\\theta = ${formatNumber(modulo)} \\cdot \\cos(${formatNumber(
                                    computed.thetaEffDeg,
                                    0
                                )}^\\circ) = `}</Latex>{" "}
                                <strong style={{ color: COMP_X_COLOR }}>{formatNumber(computed.ax, 3)}</strong>
                            </div>

                            <div>
                                <Latex>{`A_y = A \\cdot \\sin\\theta = ${formatNumber(modulo)} \\cdot \\sin(${formatNumber(
                                    computed.thetaEffDeg,
                                    0
                                )}^\\circ) = `}</Latex>{" "}
                                <strong style={{ color: COMP_Y_COLOR }}>{formatNumber(computed.ay, 3)}</strong>
                            </div>

                            {computed.thetaDirDeg > 180 && (
                                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                                    Per disegnare l’arco minore usiamo l’angolo equivalente:{" "}
                                    <strong>
                                        θ_eff = θ − 360° = {formatNumber(computed.thetaEffDeg, 0)}°
                                    </strong>{" "}
                                    (con θ = {formatNumber(computed.thetaDirDeg, 0)}°).
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {computed.mode === "componenti" && (
                    <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Modulo e direzione:</div>

                        <div style={{ display: "grid", gap: 8 }}>
                            <div>
                                <Latex>{`|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} = \\sqrt{(${formatNumber(
                                    computed.ax
                                )})^2 + (${formatNumber(computed.ay)})^2} = `}</Latex>{" "}
                                <strong style={{ color: VECTOR_COLOR }}>{formatNumber(computed.modulo, 3)}</strong>
                            </div>

                            <div>
                                <Latex>{`\\tan\\theta = \\frac{|A_y|}{|A_x|} = \\frac{${formatNumber(
                                    Math.abs(computed.ay)
                                )}}{${formatNumber(Math.abs(computed.ax))}}`}</Latex>
                            </div>

                            <div>
                                <Latex>{`\\theta_{acuto} = \\arctan\\left(\\frac{|A_y|}{|A_x|}\\right) = `}</Latex>{" "}
                                <strong>{formatNumber(computed.angoloAcuto, 1)}°</strong>
                            </div>

                            <div style={{ paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                                <div>
                                    <span>Direzione (0°–360°): </span>
                                    <strong style={{ color: ANGLE_COLOR }}>θ = {formatNumber(computed.thetaDirDeg, 1)}°</strong>
                                </div>
                                {computed.thetaDirDeg > 180 && (
                                    <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                                        Arco minore usato nel grafico: <strong>θ_eff = {formatNumber(computed.thetaEffDeg, 1)}°</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Riepilogo valori */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 13 }}>
                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${VECTOR_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>|A⃗|</div>
                        <strong style={{ color: VECTOR_COLOR }}>{formatNumber(computed.modulo, 2)}</strong>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${ANGLE_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>θ (dir)</div>
                        <strong style={{ color: ANGLE_COLOR }}>{formatNumber(computed.thetaDirDeg, 1)}°</strong>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${COMP_X_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>Aₓ</div>
                        <strong style={{ color: COMP_X_COLOR }}>{formatNumber(computed.ax, 2)}</strong>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${COMP_Y_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>Aᵧ</div>
                        <strong style={{ color: COMP_Y_COLOR }}>{formatNumber(computed.ay, 2)}</strong>
                    </div>
                </div>
            </div>
        </ResponsiveCard>
    );

    // ============ FORMULE ============

    const formulasPanel = (
        <CollapsiblePanel title="📚 Formule" defaultOpen={!isMobile}>
            <div style={{ display: "grid", gap: 16 }}>
                <div style={{ padding: 12, background: "#eff6ff", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#1d4ed8", fontSize: 14 }}>
                        Da modulo e angolo → componenti
                    </div>
                    <div style={{ display: "grid", gap: 4 }}>
                        <DisplayMath>{`A_x = A \\cdot \\cos\\theta`}</DisplayMath>
                        <DisplayMath>{`A_y = A \\cdot \\sin\\theta`}</DisplayMath>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                        Nel grafico usiamo spesso <strong>θ_eff</strong> (angolo equivalente nell’intervallo (-180°, 180°]) per
                        mostrare l’arco minore.
                    </div>
                </div>

                <div style={{ padding: 12, background: "#f0fdf4", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#166534", fontSize: 14 }}>
                        Da componenti → modulo e angolo
                    </div>
                    <div style={{ display: "grid", gap: 4 }}>
                        <DisplayMath>{`|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}`}</DisplayMath>
                        <DisplayMath>{`\\theta = \\arctan\\left(\\frac{|A_y|}{|A_x|}\\right)`}</DisplayMath>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                        ⚠️ L’arcotangente dà l’angolo acuto. Per la direzione completa (0°–360°) bisogna considerare il quadrante.
                    </div>
                </div>

                <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#92400e", fontSize: 14 }}>
                        Segni delle componenti
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                        <div>
                            <strong>I quad:</strong> Aₓ {">"} 0, Aᵧ {">"} 0
                        </div>
                        <div>
                            <strong>II quad:</strong> Aₓ {"<"} 0, Aᵧ {">"} 0
                        </div>
                        <div>
                            <strong>III quad:</strong> Aₓ {"<"} 0, Aᵧ {"<"} 0
                        </div>
                        <div>
                            <strong>IV quad:</strong> Aₓ {">"} 0, Aᵧ {"<"} 0
                        </div>
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );

    // ============ LEGENDA ============

    const legendPanel = (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                padding: 12,
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                marginTop: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: VECTOR_COLOR }} />
                <span>Vettore A⃗</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: COMP_X_COLOR }} />
                <span>Componente Aₓ</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: COMP_Y_COLOR }} />
                <span>Componente Aᵧ</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${ANGLE_COLOR}`, borderRadius: "50%" }} />
                <span>Angolo (arco minore)</span>
            </div>
        </div>
    );

    // ============ GRAFICO ============

    const graphPanel = (
        <ResponsiveCard padding={8}>
            <CoordinatePlane
                width={500}
                height={500}
                xMin={-range}
                xMax={range}
                yMin={-range}
                yMax={range}
                showGrid={true}
                gridOpacity={0.5}
                showArrows={true}
                vectors={[vectorAx, vectorAy, mainVector]}
                lines={triangleLines}
                arcs={computed.modulo > 0.1 ? [angleArc] : []}
                xAxisLabel="x"
                yAxisLabel="y"
                style={{ width: "100%", height: "auto", maxHeight: "60vh" }}
            />
            {legendPanel}
        </ResponsiveCard>
    );

    // ============ QUIZ PANEL ============

    const quizPanel = (
        <ResponsiveCard style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: "#0f172a" }}>🧩 MiniQuiz</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
                Rispondi alle domande per verificare se hai capito bene componenti, seno/coseno e quadranti.
            </div>
            <MiniQuiz questions={QUIZ_QUESTIONS} />
        </ResponsiveCard>
    );

    // ============ LAYOUT RESPONSIVE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Componenti cartesiane di un vettore"
                description="Scomponi un vettore nelle sue componenti x e y"
            >
                {modeSelector}
                {graphPanel}
                {inputPanel}
                {resultsPanel}
                {formulasPanel}
                {quizPanel}
            </DemoContainer>
        );
    }

    if (isTablet) {
        return (
            <DemoContainer
                title="Componenti cartesiane di un vettore"
                description="Scomponi un vettore nelle sue componenti cartesiane o calcola modulo e direzione dalle componenti."
            >
                {modeSelector}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>{graphPanel}</div>
                    <div>
                        {inputPanel}
                        {resultsPanel}
                    </div>
                </div>
                {formulasPanel}
                {quizPanel}
            </DemoContainer>
        );
    }

    return (
        <DemoContainer
            title="Componenti cartesiane di un vettore"
            description="Scomponi un vettore nelle sue componenti cartesiane Aₓ e Aᵧ, oppure calcola modulo e direzione dalle componenti."
        >
            {modeSelector}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>{graphPanel}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {inputPanel}
                    {resultsPanel}
                    {formulasPanel}
                </div>
            </div>
            {quizPanel}
        </DemoContainer>
    );
}

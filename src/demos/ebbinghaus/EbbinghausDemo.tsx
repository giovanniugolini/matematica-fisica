/**
 * EbbinghausDemo - Versione Responsive e Refactorizzata
 * Curva dell'oblio con mini-quiz interattivo
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useMemo, useState, useCallback } from "react";

// Componenti UI
import {
    DemoContainer,
    useBreakpoint,
    ResponsiveCard,
    TouchButton,
    CollapsiblePanel,
} from "../../components/ui";

// Utility
import { clamp, randomInt } from "../../utils/math";

// ============ TIPI ============

interface Point {
    key: string;
    label: string;
    minutes: number;
    retention: number;
}

interface QuizChoice {
    id: string;
    text: string;
}

interface QuizQuestion {
    id: string;
    prompt: string;
    choices: QuizChoice[];
    correctId: string;
    explainOk: string;
    explainNo: string;
}

// ============ HELPERS ============

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function formatTime(p: Point): string {
    if (p.key === "instant") return "Subito";
    if (p.minutes < 60) return `${p.minutes} min`;
    if (p.minutes < 24 * 60) return `${Math.round(p.minutes / 60)} h`;
    if (p.minutes < 7 * 24 * 60) return `${Math.round(p.minutes / (24 * 60))} g`;
    if (p.minutes < 30 * 24 * 60) return `${Math.round(p.minutes / (7 * 24 * 60))} sett`;
    return `~${Math.round(p.minutes / (30 * 24 * 60))} mese`;
}

// ============ DATI ============

const POINTS: Point[] = [
    { key: "instant", label: "Subito", minutes: 0, retention: 100 },
    { key: "20m", label: "20 min", minutes: 20, retention: 60 },
    { key: "1h", label: "1 ora", minutes: 60, retention: 44 },
    { key: "8h", label: "8 ore", minutes: 8 * 60, retention: 35 },
    { key: "1d", label: "1 giorno", minutes: 24 * 60, retention: 30 },
    { key: "2d", label: "2 giorni", minutes: 2 * 24 * 60, retention: 27 },
    { key: "1w", label: "1 sett.", minutes: 7 * 24 * 60, retention: 24 },
    { key: "1m", label: "1 mese", minutes: 30 * 24 * 60, retention: 21 },
];

// ============ GENERATORE QUIZ ============

function generateQuiz(points: Point[]): QuizQuestion[] {
    const usable = points.filter((p) => p.key !== "instant");

    const p1 = usable[randomInt(0, usable.length - 1)];
    const p2 = usable[randomInt(0, usable.length - 1)];

    // Q1: dato un tempo, chiedi la %
    const q1Correct = `${p1.retention}%`;
    const q1Distractors = shuffle(
        usable.filter((p) => p.key !== p1.key).slice(0, 3).map((p) => `${p.retention}%`)
    );

    const q1ChoicesRaw = shuffle([
        { id: "a", text: q1Correct },
        { id: "b", text: q1Distractors[0] ?? "60%" },
        { id: "c", text: q1Distractors[1] ?? "30%" },
        { id: "d", text: q1Distractors[2] ?? "20%" },
    ]);

    const q1CorrectId = q1ChoicesRaw.find((c) => c.text === q1Correct)!.id;

    // Q2: data una %, chiedi il tempo
    const q2Correct = p2.label;
    const q2Distractors = shuffle(
        usable.filter((p) => p.key !== p2.key).slice(0, 3).map((p) => p.label)
    );

    const q2ChoicesRaw = shuffle([
        { id: "a", text: q2Correct },
        { id: "b", text: q2Distractors[0] ?? "1 ora" },
        { id: "c", text: q2Distractors[1] ?? "1 giorno" },
        { id: "d", text: q2Distractors[2] ?? "1 mese" },
    ]);

    const q2CorrectId = q2ChoicesRaw.find((c) => c.text === q2Correct)!.id;

    // Q3: interpretazione
    const q3Choices = shuffle([
        { id: "a", text: "La memoria aumenta col tempo" },
        { id: "b", text: "Senza ripasso si dimentica velocemente" },
        { id: "c", text: "Tutti ricordano sempre il 100%" },
        { id: "d", text: "Il tempo non conta" },
    ]);

    const q3CorrectId = q3Choices.find((c) => c.text.startsWith("Senza ripasso"))!.id;

    return [
        {
            id: "q1",
            prompt: `Dopo ${p1.label}, quanto ricordiamo circa?`,
            choices: q1ChoicesRaw,
            correctId: q1CorrectId,
            explainOk: `Sì: a ${p1.label} l'ordinata è circa ${p1.retention}%.`,
            explainNo: `No: a ${p1.label} il punto è vicino a ${p1.retention}% sull'asse y.`,
        },
        {
            id: "q2",
            prompt: `Se ricordiamo circa il ${p2.retention}%, quale tempo corrisponde?`,
            choices: q2ChoicesRaw,
            correctId: q2CorrectId,
            explainOk: `Sì: ${p2.retention}% si legge circa a ${p2.label}.`,
            explainNo: `No: cerca ~${p2.retention}% sull'asse y e leggi il tempo sull'asse x.`,
        },
        {
            id: "q3",
            prompt: "Qual è l'idea principale della curva?",
            choices: q3Choices,
            correctId: q3CorrectId,
            explainOk: "Esatto: la curva scende molto all'inizio e poi si appiattisce.",
            explainNo: "No: osserva l'andamento: calo rapido all'inizio, poi più graduale.",
        },
    ];
}

// ============ COMPONENTE PRINCIPALE ============

export default function EbbinghausDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Stato grafico
    const [selectedKey, setSelectedKey] = useState<string>("20m");
    const [highlightX, setHighlightX] = useState<boolean>(false);
    const [highlightY, setHighlightY] = useState<boolean>(false);

    const selected = POINTS.find((p) => p.key === selectedKey) ?? POINTS[0];

    // Stato quiz
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [quizSeed, setQuizSeed] = useState(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- quizSeed usato per forzare rigenerazione
    const quiz = useMemo(() => generateQuiz(POINTS), [quizSeed]);

    const choose = useCallback((qid: string, cid: string) => {
        setAnswers((a) => ({ ...a, [qid]: cid }));
    }, []);

    const checkAnswer = useCallback((qid: string) => {
        setChecked((c) => ({ ...c, [qid]: true }));
    }, []);

    const resetQuiz = useCallback(() => {
        setAnswers({});
        setChecked({});
    }, []);

    const newQuiz = useCallback(() => {
        setQuizSeed((s) => s + 1);
        setAnswers({});
        setChecked({});
    }, []);

    // ============ SVG GEOMETRY ============

    const W = 700;
    const H = 340;
    const padL = isMobile ? 50 : 60;
    const padR = 20;
    const padT = 20;
    const padB = isMobile ? 50 : 56;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const xPositions = POINTS.map((_, i) => {
        const t = POINTS.length === 1 ? 0 : i / (POINTS.length - 1);
        return padL + t * plotW;
    });

    const yPos = (ret: number) => {
        const r = clamp(ret, 0, 100);
        return padT + (1 - r / 100) * plotH;
    };

    const coords = POINTS.map((p, i) => ({
        ...p,
        x: xPositions[i],
        y: yPos(p.retention),
    }));

    // Path smooth con cubic bezier
    const pathD = useMemo(() => {
        if (coords.length < 2) return "";
        const tension = 0.22;
        const parts: string[] = [];
        parts.push(`M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`);

        for (let i = 0; i < coords.length - 1; i++) {
            const p0 = coords[Math.max(0, i - 1)];
            const p1 = coords[i];
            const p2 = coords[i + 1];
            const p3 = coords[Math.min(coords.length - 1, i + 2)];

            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;

            parts.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
        }
        return parts.join(" ");
    }, [coords]);

    const selectedCoord = coords.find((c) => c.key === selectedKey) ?? coords[0];

    // ============ STILI ============

    const styles = {
        axisLine: {
            stroke: "#94a3b8",
            strokeWidth: 2,
        },
        axisLineHighlight: {
            stroke: "#3b82f6",
            strokeWidth: 3,
        },
        gridLine: {
            stroke: "#e2e8f0",
            strokeWidth: 1,
        },
        curve: {
            fill: "none",
            stroke: "#8b5cf6",
            strokeWidth: 3,
            strokeLinecap: "round" as const,
        },
        dot: {
            fill: "#8b5cf6",
            stroke: "#fff",
            strokeWidth: 2,
            cursor: "pointer",
        },
        dotSelected: {
            fill: "#7c3aed",
            stroke: "#fff",
            strokeWidth: 3,
        },
        guideLine: {
            stroke: "#8b5cf6",
            strokeWidth: 1.5,
            strokeDasharray: "4 4",
            opacity: 0.6,
        },
        tooltipBox: {
            fill: "#1e293b",
            rx: 8,
        },
        tooltipText: {
            fill: "#fff",
            fontSize: isMobile ? 12 : 14,
            fontWeight: 600,
        },
        tooltipSubtext: {
            fill: "#94a3b8",
            fontSize: isMobile ? 10 : 12,
        },
        axisLabel: {
            fill: "#64748b",
            fontSize: isMobile ? 10 : 12,
        },
        axisLabelHighlight: {
            fill: "#3b82f6",
            fontWeight: 600,
        },
        tickLabel: {
            fill: "#64748b",
            fontSize: isMobile ? 9 : 11,
        },
    };

    // ============ COMPONENTI ============

    const GraphSvg = (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="img"
            aria-label="Grafico della curva di Ebbinghaus"
        >
            {/* Griglia y */}
            {[0, 20, 40, 60, 80, 100].map((v) => {
                const yy = yPos(v);
                return (
                    <g key={v}>
                        <line x1={padL} y1={yy} x2={W - padR} y2={yy} style={styles.gridLine} />
                        <text x={padL - 8} y={yy + 4} textAnchor="end" style={styles.tickLabel}>
                            {v}%
                        </text>
                    </g>
                );
            })}

            {/* Assi */}
            <line
                x1={padL} y1={padT} x2={padL} y2={H - padB}
                style={highlightY ? styles.axisLineHighlight : styles.axisLine}
            />
            <line
                x1={padL} y1={H - padB} x2={W - padR} y2={H - padB}
                style={highlightX ? styles.axisLineHighlight : styles.axisLine}
            />

            {/* Etichette assi */}
            <text
                x={padL - 36}
                y={padT + plotH / 2}
                transform={`rotate(-90 ${padL - 36} ${padT + plotH / 2})`}
                textAnchor="middle"
                style={{ ...styles.axisLabel, ...(highlightY ? styles.axisLabelHighlight : {}) }}
            >
                Memoria (%)
            </text>

            <text
                x={padL + plotW / 2}
                y={H - 8}
                textAnchor="middle"
                style={{ ...styles.axisLabel, ...(highlightX ? styles.axisLabelHighlight : {}) }}
            >
                Tempo trascorso
            </text>

            {/* Curva */}
            <path d={pathD} style={styles.curve} />

            {/* Punti + tick x */}
            {coords.map((c) => {
                const isSel = c.key === selectedKey;
                return (
                    <g key={c.key}>
                        {/* Tick */}
                        <line
                            x1={c.x} y1={H - padB} x2={c.x} y2={H - padB + 6}
                            style={highlightX ? styles.axisLineHighlight : styles.axisLine}
                        />
                        {/* Label - su mobile ruotate */}
                        <text
                            x={c.x}
                            y={H - padB + (isMobile ? 20 : 22)}
                            textAnchor={isMobile ? "end" : "middle"}
                            transform={isMobile ? `rotate(-45 ${c.x} ${H - padB + 20})` : undefined}
                            style={styles.tickLabel}
                        >
                            {c.label}
                        </text>

                        {/* Punto */}
                        <circle
                            cx={c.x}
                            cy={c.y}
                            r={isSel ? (isMobile ? 10 : 8) : (isMobile ? 8 : 6)}
                            style={isSel ? styles.dotSelected : styles.dot}
                            onClick={() => setSelectedKey(c.key)}
                            onMouseEnter={() => !isMobile && setSelectedKey(c.key)}
                        />
                    </g>
                );
            })}

            {/* Linee guida sul punto selezionato */}
            <line x1={selectedCoord.x} y1={selectedCoord.y} x2={selectedCoord.x} y2={H - padB} style={styles.guideLine} />
            <line x1={padL} y1={selectedCoord.y} x2={selectedCoord.x} y2={selectedCoord.y} style={styles.guideLine} />

            {/* Tooltip */}
            {(() => {
                const boxW = isMobile ? 140 : 180;
                const boxH = 50;
                let bx = selectedCoord.x + 12;
                let by = selectedCoord.y - boxH - 10;

                bx = clamp(bx, padL + 5, W - padR - boxW - 5);
                by = clamp(by, padT + 5, H - padB - boxH - 5);

                return (
                    <g>
                        <rect x={bx} y={by} width={boxW} height={boxH} style={styles.tooltipBox} />
                        <text x={bx + 10} y={by + 20} style={styles.tooltipText}>
                            {formatTime(selected)} • {selected.retention}%
                        </text>
                        <text x={bx + 10} y={by + 38} style={styles.tooltipSubtext}>
                            Ricordo stimato
                        </text>
                    </g>
                );
            })()}
        </svg>
    );

    const ReadoutPanel = (
        <div style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            padding: "12px 0",
            flexWrap: "wrap"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: highlightX ? "#dbeafe" : "#f1f5f9",
                borderRadius: 20,
                border: highlightX ? "2px solid #3b82f6" : "1px solid #e2e8f0"
            }}>
                <span style={{ fontWeight: 600, color: "#3b82f6" }}>x</span>
                <span>Tempo: <strong>{selected.label}</strong></span>
            </div>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: highlightY ? "#dbeafe" : "#f1f5f9",
                borderRadius: 20,
                border: highlightY ? "2px solid #3b82f6" : "1px solid #e2e8f0"
            }}>
                <span style={{ fontWeight: 600, color: "#8b5cf6" }}>y</span>
                <span>Memoria: <strong>{selected.retention}%</strong></span>
            </div>
        </div>
    );

    const ControlButtons = (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <TouchButton
                variant={highlightX ? "primary" : "outline"}
                onClick={() => setHighlightX((v) => !v)}
                size={isMobile ? "sm" : "md"}
            >
                {highlightX ? "✓ " : ""}Asse X
            </TouchButton>
            <TouchButton
                variant={highlightY ? "primary" : "outline"}
                onClick={() => setHighlightY((v) => !v)}
                size={isMobile ? "sm" : "md"}
            >
                {highlightY ? "✓ " : ""}Asse Y
            </TouchButton>
        </div>
    );

    const QuizPanel = (
        <ResponsiveCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>🧠 Mini-Quiz</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <TouchButton variant="outline" onClick={newQuiz} size="sm">
                        🎲 Nuovo
                    </TouchButton>
                    <TouchButton variant="ghost" onClick={resetQuiz} size="sm">
                        🔄 Reset
                    </TouchButton>
                </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
                {quiz.map((q) => {
                    const chosen = answers[q.id];
                    const isChecked = !!checked[q.id];
                    const isCorrect = isChecked && chosen === q.correctId;

                    return (
                        <div key={q.id} style={{
                            padding: 16,
                            background: "#f8fafc",
                            borderRadius: 12,
                            borderLeft: isChecked
                                ? `4px solid ${isCorrect ? "#22c55e" : "#ef4444"}`
                                : "4px solid #e2e8f0"
                        }}>
                            <div style={{ fontWeight: 500, marginBottom: 12, fontSize: isMobile ? 14 : 15 }}>
                                {q.prompt}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, marginBottom: 12 }}>
                                {q.choices.map((c) => {
                                    const isChosen = chosen === c.id;
                                    const showResult = isChecked && isChosen;

                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => choose(q.id, c.id)}
                                            disabled={isChecked}
                                            style={{
                                                padding: isMobile ? "12px 16px" : "10px 14px",
                                                borderRadius: 8,
                                                border: isChosen
                                                    ? showResult
                                                        ? `2px solid ${isCorrect ? "#22c55e" : "#ef4444"}`
                                                        : "2px solid #3b82f6"
                                                    : "1px solid #d1d5db",
                                                background: showResult
                                                    ? isCorrect ? "#dcfce7" : "#fef2f2"
                                                    : isChosen ? "#eff6ff" : "#fff",
                                                cursor: isChecked ? "default" : "pointer",
                                                fontSize: isMobile ? 14 : 13,
                                                textAlign: "left",
                                                opacity: isChecked && !isChosen ? 0.6 : 1,
                                            }}
                                        >
                                            {c.text}
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                <TouchButton
                                    variant="primary"
                                    onClick={() => checkAnswer(q.id)}
                                    disabled={!chosen || isChecked}
                                    size="sm"
                                >
                                    Verifica
                                </TouchButton>

                                {isChecked && (
                                    <div style={{
                                        padding: "8px 12px",
                                        background: isCorrect ? "#dcfce7" : "#fef2f2",
                                        borderRadius: 8,
                                        color: isCorrect ? "#166534" : "#991b1b",
                                        fontSize: 13,
                                        flex: 1,
                                    }}>
                                        {isCorrect ? "✓ " : "✗ "}
                                        {isCorrect ? q.explainOk : q.explainNo}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ResponsiveCard>
    );

    const GraphCard = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>📈 Curva dell'oblio</div>
            {GraphSvg}
            {ReadoutPanel}
            <div style={{ marginTop: 8 }}>
                {ControlButtons}
            </div>
            {(highlightX || highlightY) && (
                <div style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#eff6ff",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#1e40af"
                }}>
                    {highlightX && <div><strong>Asse x:</strong> indica quanto tempo è passato.</div>}
                    {highlightY && <div><strong>Asse y:</strong> indica la percentuale di informazioni ricordate.</div>}
                </div>
            )}
        </ResponsiveCard>
    );

    // ============ LAYOUT MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Curva dell'oblio"
                description="Ebbinghaus: memoria nel tempo"
            >
                {/* Grafico grande in primo piano */}
                {GraphCard}

                {/* Quiz sotto */}
                <div style={{ marginTop: 16 }}>
                    {QuizPanel}
                </div>

                <CollapsiblePanel title="💡 Come funziona" defaultOpen={false}>
                    <div style={{ fontSize: 13, color: "#475569" }}>
                        <p style={{ marginBottom: 8 }}>
                            La <strong>curva dell'oblio</strong> di Ebbinghaus mostra come la memoria
                            decade nel tempo senza ripasso.
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>Subito dopo l'apprendimento: 100%</li>
                            <li>Dopo 20 minuti: ~60%</li>
                            <li>Dopo 1 giorno: ~30%</li>
                            <li>Il ripasso rallenta il decadimento!</li>
                        </ul>
                    </div>
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Curva dell'oblio (Ebbinghaus)"
                description="Come la memoria decade nel tempo senza ripasso"
            >
                {GraphCard}

                <div style={{ marginTop: 16 }}>
                    {QuizPanel}
                </div>

                <CollapsiblePanel title="💡 Approfondimento" defaultOpen={false}>
                    <div style={{ fontSize: 14, color: "#475569" }}>
                        <p>
                            Hermann Ebbinghaus (1850-1909) studiò la memoria umana e scoprì che
                            dimentichiamo rapidamente nelle prime ore, poi il decadimento rallenta.
                        </p>
                        <p style={{ marginTop: 8 }}>
                            <strong>Strategia:</strong> il ripasso spaziato (spaced repetition) combatte
                            questa curva, consolidando i ricordi nel tempo.
                        </p>
                    </div>
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT DESKTOP ============

    return (
        <DemoContainer
            title="Curva dell'oblio (Ebbinghaus)"
            description="Esplora come la memoria decade nel tempo senza ripasso. Leggi gli assi: x = tempo, y = % ricordata."
        >
            {/* Grafico grande in primo piano */}
            {GraphCard}

            {/* Quiz sotto */}
            <div style={{ marginTop: 16 }}>
                {QuizPanel}
            </div>

            <ResponsiveCard style={{ marginTop: 16, background: "#f0f9ff" }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: "#0369a1" }}>💡 Cosa ci insegna questa curva?</div>
                <div style={{ fontSize: 14, color: "#0c4a6e" }}>
                    <p style={{ marginBottom: 8 }}>
                        Hermann Ebbinghaus (1850-1909) fu il primo a studiare scientificamente la memoria.
                        Scoprì che <strong>dimentichiamo molto velocemente nelle prime ore</strong>, poi il decadimento rallenta.
                    </p>
                    <p>
                        <strong>Implicazione pratica:</strong> il <em>ripasso spaziato</em> (spaced repetition) è la strategia
                        più efficace per combattere l'oblio. Ripassare poco ma spesso funziona meglio che studiare tutto in una volta!
                    </p>
                </div>
            </ResponsiveCard>
        </DemoContainer>
    );
}
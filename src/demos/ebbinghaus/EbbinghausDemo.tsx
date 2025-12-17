import React, { useMemo, useState } from "react";
import "./ebbinghaus.css";

type Point = {
    key: string;
    label: string; // etichetta sull’asse x
    minutes: number; // solo per ordinare / tooltip
    retention: number; // % in ordinata
};

type QuizChoice = { id: string; text: string };
type QuizQ = {
    id: string;
    prompt: string;
    choices: QuizChoice[];
    correctId: string;
    explainOk: string;
    explainNo: string;
};

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function fmtTime(p: Point) {
    if (p.key === "instant") return "Subito";
    if (p.minutes < 60) return `${p.minutes} min`;
    if (p.minutes < 24 * 60) return `${Math.round(p.minutes / 60)} h`;
    if (p.minutes < 7 * 24 * 60) return `${Math.round(p.minutes / (24 * 60))} g`;
    if (p.minutes < 30 * 24 * 60) return `${Math.round(p.minutes / (7 * 24 * 60))} sett`;
    return `~${Math.round(p.minutes / (30 * 24 * 60))} mese`;
}

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function EbbinghausDemo() {
    // Punti “tipici” (valori approssimati, coerenti con la curva classica)
    const points: Point[] = useMemo(
        () => [
            { key: "instant", label: "Subito", minutes: 0, retention: 100 },
            { key: "20m", label: "20 min", minutes: 20, retention: 60 },
            { key: "1h", label: "1 ora", minutes: 60, retention: 44 },
            { key: "8h", label: "8 ore", minutes: 8 * 60, retention: 35 },
            { key: "1d", label: "1 giorno", minutes: 24 * 60, retention: 30 },
            { key: "2d", label: "2 giorni", minutes: 2 * 24 * 60, retention: 27 },
            { key: "1w", label: "1 sett.", minutes: 7 * 24 * 60, retention: 24 },
            { key: "1m", label: "1 mese", minutes: 30 * 24 * 60, retention: 21 },
        ],
        []
    );

    const [selectedKey, setSelectedKey] = useState<string>("20m");
    const [highlightX, setHighlightX] = useState<boolean>(false);
    const [highlightY, setHighlightY] = useState<boolean>(false);

    const selected = points.find((p) => p.key === selectedKey) ?? points[0];

    // --- Quiz state ---
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [quizSeed, setQuizSeed] = useState(0);

    function choose(qid: string, cid: string) {
        setAnswers((a) => ({ ...a, [qid]: cid }));
    }

    function check(qid: string) {
        setChecked((c) => ({ ...c, [qid]: true }));
    }

    function resetQuiz() {
        setAnswers({});
        setChecked({});
    }

    function newMiniQuiz() {
        setQuizSeed((s) => s + 1); // forza rigenerazione domande
        setAnswers({});
        setChecked({});
    }

    // --- Quiz casuale (3 domande) ---
    const quiz: QuizQ[] = useMemo(() => {
        // evitiamo "Subito" per le domande numeriche
        const usable = points.filter((p) => p.key !== "instant");

        const p1 = usable[randInt(0, usable.length - 1)]; // Q1 (tempo -> %)
        const p2 = usable[randInt(0, usable.length - 1)]; // Q2 (% -> tempo)

        // Q1: dato un tempo, chiedi la %
        const q1Correct = `${p1.retention}%`;
        const q1Distractors = shuffle(
            usable
                .filter((p) => p.key !== p1.key)
                .slice(0, 3)
                .map((p) => `${p.retention}%`)
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
            usable
                .filter((p) => p.key !== p2.key)
                .slice(0, 3)
                .map((p) => p.label)
        );

        const q2ChoicesRaw = shuffle([
            { id: "a", text: q2Correct },
            { id: "b", text: q2Distractors[0] ?? "1 ora" },
            { id: "c", text: q2Distractors[1] ?? "1 giorno" },
            { id: "d", text: q2Distractors[2] ?? "1 mese" },
        ]);

        const q2CorrectId = q2ChoicesRaw.find((c) => c.text === q2Correct)!.id;

        // Q3: interpretazione (scelta corretta, ordine random)
        const q3Choices = shuffle([
            { id: "a", text: "La memoria aumenta col tempo" },
            { id: "b", text: "Senza ripasso si dimentica velocemente" },
            { id: "c", text: "Tutti ricordano sempre il 100%" },
            { id: "d", text: "Il tempo non conta" },
        ]);

        const q3CorrectId = q3Choices.find((c) =>
            c.text.startsWith("Senza ripasso")
        )!.id;

        return [
            {
                id: "q1",
                prompt: `Guardando il grafico: dopo ${p1.label}, quanto ricordiamo circa?`,
                choices: q1ChoicesRaw,
                correctId: q1CorrectId,
                explainOk: `Sì: a ${p1.label} l’ordinata è circa ${p1.retention}%.`,
                explainNo: `No: a ${p1.label} il punto è vicino a ${p1.retention}% sull’asse y.`,
            },
            {
                id: "q2",
                prompt: `Se ricordiamo circa il ${p2.retention}%, quale tempo è più coerente col grafico?`,
                choices: q2ChoicesRaw,
                correctId: q2CorrectId,
                explainOk: `Sì: ${p2.retention}% si legge circa a ${p2.label}.`,
                explainNo: `No: cerca ~${p2.retention}% sull’asse y e leggi il tempo sull’asse x.`,
            },
            {
                id: "q3",
                prompt: "Qual è l’idea principale che si legge dalla curva (senza ripasso)?",
                choices: q3Choices,
                correctId: q3CorrectId,
                explainOk: "Esatto: la curva scende molto all’inizio e poi si appiattisce.",
                explainNo: "No: osserva l’andamento: calo rapido all’inizio, poi più graduale.",
            },
        ];
    }, [points, quizSeed]);

    // --- SVG geometry ---
    const W = 860;
    const H = 380;

    const padL = 64;
    const padR = 24;
    const padT = 22;
    const padB = 56;

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const xPositions = points.map((_, i) => {
        const t = points.length === 1 ? 0 : i / (points.length - 1);
        return padL + t * plotW;
    });

    const yPos = (ret: number) => {
        const r = clamp(ret, 0, 100);
        return padT + (1 - r / 100) * plotH;
    };

    const coords = points.map((p, i) => ({
        ...p,
        x: xPositions[i],
        y: yPos(p.retention),
    }));

    // Path “smooth”: cubic bezier con controllo semplice
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

            parts.push(
                `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(
                    2
                )} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
            );
        }
        return parts.join(" ");
    }, [coords]);

    const selectedCoord = coords.find((c) => c.key === selectedKey) ?? coords[0];

    return (
        <div className="ebb-wrap">
            <div className="ebb-card">
                <div className="ebb-head">
                    <div>
                        <div className="ebb-title">Curva dell’oblio (Ebbinghaus)</div>
                        <div className="ebb-sub">
                            Leggi assi e valori: <span className="ebb-sub-strong">x = tempo</span>,{" "}
                            <span className="ebb-sub-strong">y = % ricordata</span>.
                        </div>
                    </div>

                    <div className="ebb-controls">
                        <button
                            className={"ebb-btn " + (highlightX ? "is-on" : "")}
                            onClick={() => setHighlightX((v) => !v)}
                            type="button"
                            aria-pressed={highlightX}
                        >
                            Evidenzia x
                        </button>
                        <button
                            className={"ebb-btn " + (highlightY ? "is-on" : "")}
                            onClick={() => setHighlightY((v) => !v)}
                            type="button"
                            aria-pressed={highlightY}
                        >
                            Evidenzia y
                        </button>
                    </div>
                </div>

                <div className="ebb-plot">
                    <svg
                        className="ebb-svg"
                        viewBox={`0 0 ${W} ${H}`}
                        role="img"
                        aria-label="Grafico della curva di Ebbinghaus: percentuale di memoria in funzione del tempo"
                    >
                        {/* Griglia y (0..100) */}
                        {[0, 20, 40, 60, 80, 100].map((v) => {
                            const yy = yPos(v);
                            return (
                                <g key={v}>
                                    <line
                                        x1={padL}
                                        y1={yy}
                                        x2={W - padR}
                                        y2={yy}
                                        className="ebb-grid"
                                    />
                                    <text x={padL - 10} y={yy + 4} textAnchor="end" className="ebb-axis-text">
                                        {v}%
                                    </text>
                                </g>
                            );
                        })}

                        {/* Assi */}
                        <line
                            x1={padL}
                            y1={padT}
                            x2={padL}
                            y2={H - padB}
                            className={"ebb-axis " + (highlightY ? "is-hi" : "")}
                        />
                        <line
                            x1={padL}
                            y1={H - padB}
                            x2={W - padR}
                            y2={H - padB}
                            className={"ebb-axis " + (highlightX ? "is-hi" : "")}
                        />

                        {/* Etichette assi */}
                        <text
                            x={padL - 46}
                            y={padT + plotH / 2}
                            transform={`rotate(-90 ${padL - 46} ${padT + plotH / 2})`}
                            className={"ebb-axis-label " + (highlightY ? "is-hi" : "")}
                            textAnchor="middle"
                        >
                            Memoria ricordata (%)
                        </text>

                        <text
                            x={padL + plotW / 2}
                            y={H - 16}
                            className={"ebb-axis-label " + (highlightX ? "is-hi" : "")}
                            textAnchor="middle"
                        >
                            Tempo trascorso
                        </text>

                        {/* Curva */}
                        <path d={pathD} className="ebb-curve" />

                        {/* Punti + tick x */}
                        {coords.map((c) => {
                            const isSel = c.key === selectedKey;
                            return (
                                <g key={c.key}>
                                    <line
                                        x1={c.x}
                                        y1={H - padB}
                                        x2={c.x}
                                        y2={H - padB + 6}
                                        className={"ebb-tick " + (highlightX ? "is-hi" : "")}
                                    />
                                    <text x={c.x} y={H - padB + 24} textAnchor="middle" className="ebb-x-text">
                                        {c.label}
                                    </text>

                                    <circle
                                        cx={c.x}
                                        cy={c.y}
                                        r={isSel ? 6.2 : 4.6}
                                        className={"ebb-dot " + (isSel ? "is-sel" : "")}
                                        onMouseEnter={() => setSelectedKey(c.key)}
                                        onClick={() => setSelectedKey(c.key)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") setSelectedKey(c.key);
                                        }}
                                        aria-label={`${c.label}: circa ${c.retention}%`}
                                    />
                                </g>
                            );
                        })}

                        {/* Linee guida sul punto selezionato */}
                        <line
                            x1={selectedCoord.x}
                            y1={selectedCoord.y}
                            x2={selectedCoord.x}
                            y2={H - padB}
                            className="ebb-guide"
                        />
                        <line
                            x1={padL}
                            y1={selectedCoord.y}
                            x2={selectedCoord.x}
                            y2={selectedCoord.y}
                            className="ebb-guide"
                        />

                        {/* Tooltip */}
                        <g>
                            {(() => {
                                const boxW = 210;
                                const boxH = 56;
                                const margin = 10;
                                let bx = selectedCoord.x + 12;
                                let by = selectedCoord.y - boxH - 10;

                                bx = clamp(bx, padL + margin, W - padR - boxW - margin);
                                by = clamp(by, padT + margin, H - padB - boxH - margin);

                                return (
                                    <g className="ebb-tooltip">
                                        <rect x={bx} y={by} width={boxW} height={boxH} rx={10} className="ebb-tip-box" />
                                        <text x={bx + 12} y={by + 22} className="ebb-tip-title">
                                            {fmtTime(selected)} • {selected.retention}%
                                        </text>
                                        <text x={bx + 12} y={by + 42} className="ebb-tip-sub">
                                            Ricordo stimato a questo tempo
                                        </text>
                                    </g>
                                );
                            })()}
                        </g>
                    </svg>

                    <div className="ebb-readout" aria-live="polite">
                        <div className="ebb-readout-row">
                            <span className="ebb-pill">x</span>
                            <span className="ebb-readout-text">
                Tempo: <strong>{selected.label}</strong>
              </span>
                        </div>
                        <div className="ebb-readout-row">
                            <span className="ebb-pill">y</span>
                            <span className="ebb-readout-text">
                Memoria: <strong>{selected.retention}%</strong>
              </span>
                        </div>
                    </div>

                    {(highlightX || highlightY) && (
                        <div className="ebb-hint">
                            {highlightX && <div>Asse x: indica quanto tempo è passato.</div>}
                            {highlightY && <div>Asse y: indica la percentuale di informazioni ricordate.</div>}
                        </div>
                    )}
                </div>
            </div>

            <div className="ebb-card">
                <div className="ebb-quiz-head">
                    <div className="ebb-title">Mini-quiz</div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="ebb-btn" type="button" onClick={newMiniQuiz}>
                            Nuovo mini-quiz
                        </button>
                        <button className="ebb-btn" type="button" onClick={resetQuiz}>
                            Reset
                        </button>
                    </div>
                </div>

                <div className="ebb-quiz">
                    {quiz.map((q) => {
                        const chosen = answers[q.id];
                        const isChecked = !!checked[q.id];
                        const ok = isChecked && chosen === q.correctId;

                        return (
                            <div key={q.id} className="ebb-q">
                                <div className="ebb-q-prompt">{q.prompt}</div>

                                <div className="ebb-q-choices" role="radiogroup" aria-label={q.prompt}>
                                    {q.choices.map((c) => {
                                        const isChosen = chosen === c.id;
                                        const showState = isChecked && isChosen;
                                        const className =
                                            "ebb-choice " +
                                            (isChosen ? "is-chosen " : "") +
                                            (showState ? (ok ? "is-ok" : "is-no") : "");

                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={className}
                                                onClick={() => choose(q.id, c.id)}
                                                aria-pressed={isChosen}
                                            >
                                                {c.text}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="ebb-q-actions">
                                    <button
                                        className="ebb-btn"
                                        type="button"
                                        onClick={() => check(q.id)}
                                        disabled={!answers[q.id]}
                                        title={!answers[q.id] ? "Seleziona una risposta" : "Controlla"}
                                    >
                                        Controlla
                                    </button>

                                    {isChecked && (
                                        <div className={"ebb-feedback " + (ok ? "is-ok" : "is-no")} aria-live="polite">
                                            {ok ? q.explainOk : q.explainNo}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

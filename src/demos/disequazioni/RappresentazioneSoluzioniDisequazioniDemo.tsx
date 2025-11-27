import React, { useMemo, useState, useRef } from "react";

type RayForm = {
    type: "ray";
    boundary: number;
    op: "<" | "<=" | ">" | ">=";
};

type IntervalForm = {
    type: "interval";
    a: number;
    b: number;
    includeLeft: boolean;
    includeRight: boolean;
};

type TwoRaysForm = {
    type: "twoRays";
    left: number;
    right: number;
    includeLeft: boolean; // x <= left  oppure x < left
    includeRight: boolean; // x >= right oppure x > right
};

type SolutionForm = RayForm | IntervalForm | TwoRaysForm;

const SVG_WIDTH = 800;   // più largo
const SVG_HEIGHT = 200;  // più alto
const X_MIN = -10;
const X_MAX = 10;

function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    let s = n.toFixed(2).replace(/\.?0+$/, "");
    s = s.replace(".", ",");
    return s;
}

// --- helper: ogni tanto genera mezzi (x + 0.5) ---

function maybeHalf(x: number): number {
    // con probabilità 0.4 aggiungo ±0.5 se rimane nel range
    if (Math.random() < 0.4) {
        const delta = Math.random() < 0.5 ? -0.5 : 0.5;
        const y = x + delta;
        if (y >= X_MIN && y <= X_MAX) return y;
    }
    return x;
}

// --- Generazione casuale di una soluzione già risolta ---

function generateRandomSolution(): SolutionForm {
    const kind = randomInt(0, 2); // 0: ray, 1: interval, 2: twoRays

    if (kind === 0) {
        // raggio: confine (a volte con mezzi)
        let boundary = randomInt(-5, 5);
        boundary = maybeHalf(boundary);
        const ops: RayForm["op"][] = ["<", "<=", ">", ">="];
        const op = ops[randomInt(0, ops.length - 1)];
        return { type: "ray", boundary, op };
    }

    if (kind === 1) {
        // intervallo: estremi a e b, ogni tanto "mezzi"
        let a = randomInt(-6, 3);
        let b = randomInt(a + 1, a + 8);
        if (b > 6) b = 6;

        const aHalf = maybeHalf(a);
        const bHalf = maybeHalf(b);
        if (bHalf - aHalf >= 0.5) {
            a = aHalf;
            b = bHalf;
        }

        const includeLeft = Math.random() < 0.5;
        const includeRight = Math.random() < 0.5;
        return { type: "interval", a, b, includeLeft, includeRight };
    }

    // twoRays
    let left = randomInt(-6, 0);
    let right = randomInt(left + 2, left + 8);
    if (right > 6) right = 6;

    const leftHalf = maybeHalf(left);
    const rightHalf = maybeHalf(right);
    if (rightHalf - leftHalf >= 0.5) {
        left = leftHalf;
        right = rightHalf;
    }

    const includeLeft = Math.random() < 0.7;
    const includeRight = Math.random() < 0.7;
    return { type: "twoRays", left, right, includeLeft, includeRight };
}

// --- Forma algebrica ---

function algebraicForm(sol: SolutionForm): string {
    switch (sol.type) {
        case "ray": {
            const a = formatNumber(sol.boundary);
            return `x ${sol.op} ${a}`;
        }
        case "interval": {
            const left = formatNumber(sol.a);
            const right = formatNumber(sol.b);
            const leftOp = sol.includeLeft ? "≤" : "<";
            const rightOp = sol.includeRight ? "≤" : "<";
            return `${left} ${leftOp} x ${rightOp} ${right}`;
        }
        case "twoRays": {
            const left = formatNumber(sol.left);
            const right = formatNumber(sol.right);
            const leftOp = sol.includeLeft ? "≤" : "<";
            const rightOp = sol.includeRight ? "≥" : ">";
            return `x ${leftOp} ${left}  oppure  x ${rightOp} ${right}`;
        }
    }
}

// --- Notazione per intervalli ---

function intervalNotation(sol: SolutionForm): string {
    switch (sol.type) {
        case "ray": {
            const a = formatNumber(sol.boundary);
            if (sol.op === "<") return `(-∞, ${a})`;
            if (sol.op === "<=") return `(-∞, ${a}]`;
            if (sol.op === ">") return `(${a}, +∞)`;
            return `[${a}, +∞)`; // >=
        }
        case "interval": {
            const left = formatNumber(sol.a);
            const right = formatNumber(sol.b);
            const l = sol.includeLeft ? "[" : "(";
            const r = sol.includeRight ? "]" : ")";
            return `${l}${left}, ${right}${r}`;
        }
        case "twoRays": {
            const left = formatNumber(sol.left);
            const right = formatNumber(sol.right);
            const leftPart = sol.includeLeft
                ? `(-∞, ${left}]`
                : `(-∞, ${left})`;
            const rightPart = sol.includeRight
                ? `[${right}, +∞)`
                : `(${right}, +∞)`;
            return `${leftPart} ∪ ${rightPart}`;
        }
    }
}

// --- Supporto grafico ---

function scaleX(x: number): number {
    const t = (x - X_MIN) / (X_MAX - X_MIN);
    return 40 + t * (SVG_WIDTH - 80);
}

type Segment = {
    from: number;
    to: number;
    includeFrom: boolean;
    includeTo: boolean;
    arrowLeft?: boolean;   // per semirette verso -∞
    arrowRight?: boolean;  // per semirette verso +∞
};

function solutionToSegments(sol: SolutionForm): Segment[] {
    switch (sol.type) {
        case "ray": {
            const a = sol.boundary;
            if (sol.op === "<" || sol.op === "<=") {
                return [
                    {
                        from: X_MIN,
                        to: a,
                        includeFrom: false,
                        includeTo: sol.op === "<=",
                        arrowLeft: true,
                        arrowRight: false,
                    },
                ];
            } else {
                return [
                    {
                        from: a,
                        to: X_MAX,
                        includeFrom: sol.op === ">=",
                        includeTo: false,
                        arrowLeft: false,
                        arrowRight: true,
                    },
                ];
            }
        }
        case "interval": {
            return [
                {
                    from: sol.a,
                    to: sol.b,
                    includeFrom: sol.includeLeft,
                    includeTo: sol.includeRight,
                    arrowLeft: false,
                    arrowRight: false,
                },
            ];
        }
        case "twoRays": {
            return [
                {
                    from: X_MIN,
                    to: sol.left,
                    includeFrom: false,
                    includeTo: sol.includeLeft,
                    arrowLeft: true,
                    arrowRight: false,
                },
                {
                    from: sol.right,
                    to: X_MAX,
                    includeFrom: sol.includeRight,
                    includeTo: false,
                    arrowLeft: false,
                    arrowRight: true,
                },
            ];
        }
    }
}

// complementi della soluzione sulla retta (per animare la "cancellazione")
function computeComplementSegments(segments: Segment[]): Segment[] {
    if (!segments.length) {
        return [
            {
                from: X_MIN,
                to: X_MAX,
                includeFrom: false,
                includeTo: false,
            },
        ];
    }

    const clamped = segments
        .map((s) => ({
            from: Math.max(X_MIN, Math.min(X_MAX, s.from)),
            to: Math.max(X_MIN, Math.min(X_MAX, s.to)),
        }))
        .filter((s) => s.to > s.from)
        .sort((a, b) => a.from - b.from);

    if (!clamped.length) {
        return [
            {
                from: X_MIN,
                to: X_MAX,
                includeFrom: false,
                includeTo: false,
            },
        ];
    }

    const merged: { from: number; to: number }[] = [];
    let cur = { ...clamped[0] };
    for (let i = 1; i < clamped.length; i++) {
        const s = clamped[i];
        if (s.from <= cur.to) {
            cur.to = Math.max(cur.to, s.to);
        } else {
            merged.push(cur);
            cur = { ...s };
        }
    }
    merged.push(cur);

    const complement: Segment[] = [];
    let start = X_MIN;
    for (const s of merged) {
        if (s.from > start) {
            complement.push({
                from: start,
                to: s.from,
                includeFrom: false,
                includeTo: false,
            });
        }
        start = s.to;
    }
    if (start < X_MAX) {
        complement.push({
            from: start,
            to: X_MAX,
            includeFrom: false,
            includeTo: false,
        });
    }
    return complement;
}

const RappresentazioneSoluzioniDisequazioniDemo: React.FC = () => {
    const [solution, setSolution] = useState<SolutionForm>(() =>
        generateRandomSolution()
    );
    const [showAlgebraic, setShowAlgebraic] = useState(true);
    const [showInterval, setShowInterval] = useState(true);

    // stato per "pulisci soluzione"
    const [cleanProgress, setCleanProgress] = useState(0); // 0 = niente, 1 = pulito
    const isCleaningRef = useRef(false);

    const segments = useMemo(
        () => solutionToSegments(solution),
        [solution]
    );
    const complementSegments = useMemo(
        () => computeComplementSegments(segments),
        [segments]
    );

    const algebraic = useMemo(
        () => algebraicForm(solution),
        [solution]
    );
    const interval = useMemo(
        () => intervalNotation(solution),
        [solution]
    );

    // punti estremi finiti (per etichettare dopo la pulizia)
    const endpointValues = useMemo(() => {
        const vals: number[] = [];
        const addVal = (v: number) => {
            const rounded = Number(v.toFixed(4));
            if (!vals.some((x) => Math.abs(x - rounded) < 1e-6)) {
                vals.push(rounded);
            }
        };

        segments.forEach((seg) => {
            if (!(seg.arrowLeft && Math.abs(seg.from - X_MIN) < 1e-6)) {
                addVal(seg.from);
            }
            if (!(seg.arrowRight && Math.abs(seg.to - X_MAX) < 1e-6)) {
                addVal(seg.to);
            }
        });

        vals.sort((a, b) => a - b);
        return vals;
    }, [segments]);

    const newSolution = () => {
        setSolution(generateRandomSolution());
        setCleanProgress(0);
        isCleaningRef.current = false;
    };

    const startCleaning = () => {
        if (isCleaningRef.current) return;
        isCleaningRef.current = true;
        setCleanProgress(0);

        const duration = 800;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(1, elapsed / duration);
            setCleanProgress(t);

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                isCleaningRef.current = false;
            }
        };

        requestAnimationFrame(step);
    };

    const axisY = SVG_HEIGHT / 2;
    const showEndpointLabels = cleanProgress > 0.99;

    return (
        <div
            style={{
                padding: "1.5rem",
                maxWidth: "1200px",
                margin: "0 auto",
                fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                Rappresentazione delle soluzioni di una disequazione
            </h1>
            <p style={{ marginBottom: "1rem", lineHeight: 1.4 }}>
                Questa pagina mostra una <strong>soluzione già risolta</strong> di una
                disequazione in tre modi: <strong>forma algebrica</strong>,{" "}
                <strong>rappresentazione grafica sulla retta reale</strong> e{" "}
                <strong>notazione per intervalli</strong>. Con il pulsante{" "}
                <em>&quot;Pulisci soluzione&quot;</em> vengono via via eliminati i
                pezzi di retta che <strong>non</strong> appartengono alla soluzione e
                vengono evidenziati gli <strong>estremi</strong>.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", // più spazio al grafico
                    gap: "1.5rem",
                    alignItems: "flex-start",
                }}
            >
                {/* Grafico sulla retta reale */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "0.75rem",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.1rem",
                            marginBottom: "0.4rem",
                        }}
                    >
                        Rappresentazione grafica sulla retta reale
                    </h2>
                    <svg
                        width={SVG_WIDTH}
                        height={SVG_HEIGHT}
                        style={{ maxWidth: "100%" }}
                    >
                        {/* sfondo a quadretti tipo quaderno */}
                        <defs>
                            <pattern
                                id="graphPaper"
                                x="0"
                                y="0"
                                width="20"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <rect width="20" height="20" fill="#fafafa" />
                                {/* quadretti più marcati ogni 20 px */}
                                <path
                                    d="M20 0 H0 V20"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth={1}
                                />
                                {/* linea centrale per quadretti da 10px */}
                                <path
                                    d="M0 10 H20 M10 0 V20"
                                    fill="none"
                                    stroke="#f0f0f0"
                                    strokeWidth={0.7}
                                />
                            </pattern>
                        </defs>

                        <rect
                            x={0}
                            y={0}
                            width={SVG_WIDTH}
                            height={SVG_HEIGHT}
                            fill="url(#graphPaper)"
                            stroke="#ddd"
                        />

                        {/* retta reale sottostante (molto leggera) */}
                        <line
                            x1={scaleX(X_MIN)}
                            y1={axisY}
                            x2={scaleX(X_MAX)}
                            y2={axisY}
                            stroke="#ccc"
                            strokeWidth={1}
                        />

                        {/* Puntini agli estremi della retta (−∞ e +∞) */}
                        <circle
                            cx={scaleX(X_MIN)}
                            cy={axisY}
                            r={4.5}
                            fill="#777"
                            stroke="#555"
                            strokeWidth={1}
                        />
                        <circle
                            cx={scaleX(X_MAX)}
                            cy={axisY}
                            r={4.5}
                            fill="#777"
                            stroke="#555"
                            strokeWidth={1}
                        />

                        {/* Tacche e numeri interi */}
                        {Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => {
                            const xReal = X_MIN + i;
                            const xSvg = scaleX(xReal);
                            return (
                                <g key={`tick-${xReal}`}>
                                    <line
                                        x1={xSvg}
                                        y1={axisY - 5}
                                        x2={xSvg}
                                        y2={axisY + 5}
                                        stroke="#555"
                                        strokeWidth={1}
                                    />
                                    {xReal % 2 === 0 && (
                                        <text
                                            x={xSvg}
                                            y={axisY + 22}
                                            fontSize={11}
                                            textAnchor="middle"
                                            fill="#333"
                                        >
                                            {xReal}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Pezzi non soluzione (che verranno "cancellati") */}
                        {complementSegments.map((seg, idx) => {
                            const xFrom = scaleX(seg.from);
                            const xTo = scaleX(seg.to);
                            const opacity = 1 - cleanProgress; // da 1 a 0
                            if (opacity <= 0) return null;
                            return (
                                <line
                                    key={`comp-${idx}`}
                                    x1={xFrom}
                                    y1={axisY}
                                    x2={xTo}
                                    y2={axisY}
                                    stroke="#777"
                                    strokeWidth={3}
                                    strokeOpacity={opacity}
                                />
                            );
                        })}

                        {/* Soluzione (segmenti blu) */}
                        {segments.map((seg, idx) => {
                            const xFrom = scaleX(seg.from);
                            const xTo = scaleX(seg.to);

                            const isInfiniteLeftEnd =
                                seg.arrowLeft && Math.abs(seg.from - X_MIN) < 1e-6;
                            const isInfiniteRightEnd =
                                seg.arrowRight && Math.abs(seg.to - X_MAX) < 1e-6;

                            return (
                                <g key={`seg-${idx}`}>
                                    <line
                                        x1={xFrom}
                                        y1={axisY}
                                        x2={xTo}
                                        y2={axisY}
                                        stroke="#1f77b4"
                                        strokeWidth={4}
                                    />

                                    {!isInfiniteLeftEnd && (
                                        <circle
                                            cx={xFrom}
                                            cy={axisY}
                                            r={6}
                                            fill={
                                                seg.includeFrom ? "#1f77b4" : "#ffffff"
                                            }
                                            stroke="#1f77b4"
                                            strokeWidth={2}
                                        />
                                    )}
                                    {!isInfiniteRightEnd && (
                                        <circle
                                            cx={xTo}
                                            cy={axisY}
                                            r={6}
                                            fill={
                                                seg.includeTo ? "#1f77b4" : "#ffffff"
                                            }
                                            stroke="#1f77b4"
                                            strokeWidth={2}
                                        />
                                    )}

                                    {/* linea tratteggiata per le semirette (sopra la retta) */}
                                    {seg.arrowLeft && (
                                        <line
                                            x1={scaleX(X_MIN) + 10}
                                            y1={axisY - 18}
                                            x2={scaleX(X_MIN) + 50}
                                            y2={axisY - 18}
                                            stroke="#1f77b4"
                                            strokeWidth={3}
                                            strokeDasharray="6 6"
                                        />
                                    )}
                                    {seg.arrowRight && (
                                        <line
                                            x1={scaleX(X_MAX) - 50}
                                            y1={axisY - 18}
                                            x2={scaleX(X_MAX) - 10}
                                            y2={axisY - 18}
                                            stroke="#1f77b4"
                                            strokeWidth={3}
                                            strokeDasharray="6 6"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Numeri sugli estremi (dopo pulizia completa) */}
                        {showEndpointLabels &&
                            endpointValues.map((v, i) => {
                                const x = scaleX(v);
                                return (
                                    <text
                                        key={`label-end-${i}`}
                                        x={x}
                                        y={axisY - 22}
                                        fontSize={12}
                                        textAnchor="middle"
                                        fill="#1f77b4"
                                        fontWeight={600}
                                    >
                                        {formatNumber(v)}
                                    </text>
                                );
                            })}
                    </svg>

                    <p
                        style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#555",
                        }}
                    >
                        • I <strong>puntini agli estremi</strong> della retta rappresentano idealmente −∞ e +∞.
                        <br />
                        • I <strong>punti pieni</strong> indicano valori inclusi (
                        <strong>≤</strong> o <strong>≥</strong>).
                        <br />
                        • I <strong>punti vuoti</strong> indicano valori esclusi (
                        <strong>&lt;</strong> o <strong>&gt;</strong>).
                        <br />
                        • Le <strong>linee tratteggiate blu sopra la retta</strong> indicano che la soluzione prosegue come semiretta verso l&apos;infinito (senza pallino sul lato infinito).
                    </p>
                </div>

                {/* Forme algebrica e intervalli + pulsanti */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.9rem",
                    }}
                >
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.1rem",
                                marginBottom: "0.4rem",
                            }}
                        >
                            Rappresentazioni testuali
                        </h2>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                                marginBottom: "0.6rem",
                            }}
                        >
                            <label style={{ fontSize: "0.9rem" }}>
                                <input
                                    type="checkbox"
                                    checked={showAlgebraic}
                                    onChange={(e) =>
                                        setShowAlgebraic(e.target.checked)
                                    }
                                    style={{ marginRight: "0.25rem" }}
                                />
                                Mostra forma algebrica
                            </label>
                            <label style={{ fontSize: "0.9rem" }}>
                                <input
                                    type="checkbox"
                                    checked={showInterval}
                                    onChange={(e) =>
                                        setShowInterval(e.target.checked)
                                    }
                                    style={{ marginRight: "0.25rem" }}
                                />
                                Mostra notazione per intervalli
                            </label>
                        </div>

                        {showAlgebraic && (
                            <div
                                style={{
                                    marginBottom: "0.5rem",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        marginBottom: "0.2rem",
                                    }}
                                >
                                    Forma algebrica
                                </h3>
                                <p
                                    style={{
                                        fontFamily:
                                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                        fontSize: "1.05rem",
                                    }}
                                >
                                    {algebraic}
                                </p>
                            </div>
                        )}

                        {showInterval && (
                            <div>
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        marginBottom: "0.2rem",
                                    }}
                                >
                                    Notazione per intervalli
                                </h3>
                                <p
                                    style={{
                                        fontFamily:
                                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                        fontSize: "1.05rem",
                                    }}
                                >
                                    {interval}
                                </p>
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                            background: "#fafafa",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={newSolution}
                                style={{
                                    padding: "0.35rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                }}
                            >
                                Nuova soluzione casuale
                            </button>
                            <button
                                onClick={startCleaning}
                                style={{
                                    padding: "0.35rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    background:
                                        cleanProgress > 0
                                            ? "rgba(31,119,180,0.12)"
                                            : "white",
                                }}
                            >
                                Pulisci soluzione
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RappresentazioneSoluzioniDisequazioniDemo;

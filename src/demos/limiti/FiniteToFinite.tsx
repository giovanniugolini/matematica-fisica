import React, { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
} from "recharts";

type HoleType = "changed" | "undefined";

type RandomFunction = {
    a: number; // punto verso cui tende x
    c0: number;
    c1: number;
    c2: number;
    holeType: HoleType; // sempre discontinua in a
    limitAtA: number;   // L = g(a)
    valueAtA: number | null; // f(a) se definita, altrimenti null
};

type ChartPoint = {
    x: number;
    y: number | null;
};

const MIN_X_SPAN = 3;
const MAX_X_SPAN = 5;
const STEP = 0.1;

// --- Utilità ---

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCoeff(): number {
    const num = randomInt(-4, 4);
    return num === 0 ? 1 : num;
}

// Genera una funzione con limite finito in a ma discontinuità in a
function generateRandomFunction(): RandomFunction {
    const a = randomInt(-2, 2);
    const c0 = randomInt(-3, 3);
    const c1 = randomCoeff();
    const c2 = Math.random() < 0.5 ? 0 : randomCoeff() * 0.2;

    const baseAtA = c0; // g(a) = c0

    // vogliamo SEMPRE discontinuità in a
    let holeType: HoleType;
    let valueAtA: number | null;

    if (Math.random() < 0.5) {
        // valore definito ma diverso dal limite
        holeType = "changed";
        let newVal = baseAtA;
        while (newVal === baseAtA) {
            newVal = baseAtA + randomInt(-3, 3);
        }
        valueAtA = newVal;
    } else {
        // punto non definito
        holeType = "undefined";
        valueAtA = null;
    }

    return {
        a,
        c0,
        c1,
        c2,
        holeType,
        limitAtA: baseAtA,
        valueAtA,
    };
}

// funzione “di base” continua g(x)
function evaluateBase(fn: RandomFunction, x: number): number {
    const t = x - fn.a;
    return fn.c0 + fn.c1 * t + fn.c2 * t * t;
}

// valore effettivo di f(x) (con discontinuità in a)
function evaluateDisplayed(fn: RandomFunction, x: number): number | null {
    const isA = Math.abs(x - fn.a) < 1e-9;
    if (isA) {
        if (fn.holeType === "undefined") return null;
        return fn.valueAtA!;
    }
    return evaluateBase(fn, x);
}

function buildChartData(fn: RandomFunction): {
    curve: ChartPoint[];
    holePoint: ChartPoint;
    actualPoint: ChartPoint | null;
    xDomain: { min: number; max: number };
    yDomain: { min: number; max: number };
} {
    const span = randomInt(MIN_X_SPAN, MAX_X_SPAN);
    let xMin = fn.a - span;
    let xMax = fn.a + span;

    const curve: ChartPoint[] = [];
    for (let x = xMin; x <= xMax + 1e-9; x += STEP) {
        const roundedX = parseFloat(x.toFixed(2));
        const isA = Math.abs(roundedX - fn.a) < STEP / 2;

        if (isA) {
            curve.push({ x: fn.a, y: evaluateBase(fn, fn.a) });
        } else {
            curve.push({ x: roundedX, y: evaluateBase(fn, roundedX) });
        }
    }

    const holePoint: ChartPoint = {
        x: fn.a,
        y: evaluateBase(fn, fn.a), // valore del limite in a
    };

    let actualPoint: ChartPoint | null = null;
    if (fn.holeType === "changed" && fn.valueAtA !== null) {
        actualPoint = {
            x: fn.a,
            y: fn.valueAtA,
        };
    }

    // dominio X: includo anche 0 così l'asse y è sempre visibile
    const xs = curve.map((p) => p.x);
    xMin = Math.min(...xs, 0, fn.a);
    xMax = Math.max(...xs, 0, fn.a);

    // dominio Y fisso (evita zoom in movimento)
    const ys = [
        ...curve.map((p) => p.y ?? 0),
        holePoint.y ?? 0,
        actualPoint?.y ?? 0,
        fn.limitAtA,
    ];
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);

    const padding = (yMax - yMin || 1) * 0.2;
    yMin -= padding;
    yMax += padding;

    return {
        curve,
        holePoint,
        actualPoint,
        xDomain: { min: xMin, max: xMax },
        yDomain: { min: yMin, max: yMax },
    };
}

// --- Shape personalizzati per i marker sugli assi ---

// Puntino + valore sull'asse x (arancione)
const XAxisMarker: React.FC<any> = ({ cx, cy, payload }) => {
    const xVal: number = payload.x;
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="#e67e22" />
            <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fontSize={12}
                fill="#e67e22"
            >
                {xVal.toFixed(2)}
            </text>
        </g>
    );
};

// Puntino + valore sull'asse y (verde)
const YAxisMarker: React.FC<any> = ({ cx, cy, payload }) => {
    const yVal: number = payload.y;
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="#27ae60" />
            <text
                x={cx + 6}
                y={cy - 6}
                fontSize={12}
                fill="#27ae60"
            >
                {yVal.toFixed(2)}
            </text>
        </g>
    );
};

// Marker fisso per a sull'asse x (rosso)
const AMarker: React.FC<any> = ({ cx, cy, payload }) => {
    const xVal: number = payload.x;
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="#ffffff" stroke="#c0392b" strokeWidth={2} />
            <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                fontSize={12}
                fill="#c0392b"
            >
                a = {xVal.toFixed(2)}
            </text>
        </g>
    );
};

// Marker fisso per L sull'asse y (rosso)
const LMarker: React.FC<any> = ({ cx, cy, payload }) => {
    const yVal: number = payload.y;
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="#ffffff" stroke="#c0392b" strokeWidth={2} />
            <text
                x={cx + 6}
                y={cy + 14}
                fontSize={12}
                fill="#c0392b"
            >
                L = {yVal.toFixed(2)}
            </text>
        </g>
    );
};

const RandomFiniteLimitAxesDemo: React.FC = () => {
    const [fn, setFn] = useState<RandomFunction>(() => generateRandomFunction());

    const { curve, holePoint, actualPoint, xDomain, yDomain } = useMemo(
        () => buildChartData(fn),
        [fn]
    );

    // x corrente: parto da a (più intuitivo)
    const [currentX, setCurrentX] = useState<number>(() => fn.a);

    const currentY = useMemo(
        () => evaluateDisplayed(fn, currentX),
        [fn, currentX]
    );

    const currentBaseY = useMemo(
        () => evaluateBase(fn, currentX),
        [fn, currentX]
    );

    const handleNewFunction = () => {
        const newFn = generateRandomFunction();
        setFn(newFn);
        // dopo aver cambiato funzione, faccio avvicinare la x direttamente a a
        setCurrentX(newFn.a);
    };

    return (
        <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
            <h2>Limite finito per x → a (visualizzato sugli assi)</h2>

            <p style={{ lineHeight: 1.5 }}>
                La funzione generata ha sempre un <strong>limite finito</strong> in un punto{" "}
                <strong>a</strong>, ma è <strong>discontinua in a</strong> (discontinuità eliminabile).
                <br />
                L&apos;idea è di visualizzare:
            </p>
            <ul>
                <li>
                    l&apos;<strong>avvicinamento ad a</strong> solo <strong>sull&apos;asse x</strong>:
                    il puntino arancione si muove lungo l&apos;asse x;
                </li>
                <li>
                    l&apos;<strong>avvicinamento al limite L</strong> solo <strong>sull&apos;asse y</strong>:
                    il puntino verde si muove lungo l&apos;asse y;
                </li>
                <li>
                    accanto a ciascun puntino compare il <strong>valore numerico</strong> corrispondente.
                </li>
            </ul>

            <p>
                Punto di accumulazione: <strong>a = {fn.a}</strong>
                <br />
                Limite per x → a: <strong>L = {fn.limitAtA.toFixed(3)}</strong>
                <br />
                Valore di f(a):{" "}
                <strong>
                    {fn.valueAtA === null ? "non definito" : fn.valueAtA.toFixed(3)}
                </strong>{" "}
                (
                {fn.holeType === "changed"
                    ? "valore definito ma diverso dal limite (discontinuità eliminabile)"
                    : "punto non definito in a (discontinuità eliminabile)"}
                )
            </p>

            {/* Controlli */}
            <div
                style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#fafafa",
                }}
            >
                <label style={{ display: "block", marginBottom: 8 }}>
                    Scegli x vicino ad a con il cursore:
                </label>
                <input
                    type="range"
                    min={xDomain.min}
                    max={xDomain.max}
                    step={0.05}
                    value={currentX}
                    onChange={(e) => setCurrentX(parseFloat(e.target.value))}
                    style={{ width: "100%" }}
                />

                <div style={{ marginTop: 8, fontSize: 16 }}>
                    x = <strong>{currentX.toFixed(2)}</strong> → f(x) ={" "}
                    <strong>
                        {currentY === null || Number.isNaN(currentY)
                            ? "non definita"
                            : currentY.toFixed(3)}
                    </strong>
                </div>

                <button
                    onClick={handleNewFunction}
                    style={{
                        marginTop: 12,
                        padding: "8px 14px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    🔁 Genera una nuova funzione
                </button>
            </div>

            {/* Grafico */}
            <div style={{ width: "100%", height: 380, marginTop: "1.5rem" }}>
                <ResponsiveContainer>
                    <LineChart data={curve}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={[xDomain.min, xDomain.max]}
                            tickCount={9}
                            label={{ value: "x", position: "insideBottomRight", offset: -5 }}
                        />

                        <YAxis
                            dataKey="y"
                            tickCount={9}
                            domain={[yDomain.min, yDomain.max]}
                            label={{ value: "f(x)", angle: -90, position: "insideLeft" }}
                        />

                        {/* Assi cartesiani */}
                        <ReferenceLine x={0} stroke="#888" strokeDasharray="3 3" />
                        <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />

                        {/* Curva della funzione (comportamento intorno ad a) */}
                        <Line
                            type="monotone"
                            dataKey="y"
                            dot={false}
                            isAnimationActive={false}
                            stroke="#3498db"
                        />

                        {/* Buco nel punto a: valore del limite (sulla curva, ma senza etichetta numerica) */}
                        <Scatter
                            data={[holePoint]}
                            fill="#ffffff"
                            stroke="#c0392b"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />

                        {/* Eventuale valore f(a) diverso dal limite (anche sulla curva) */}
                        {actualPoint && (
                            <Scatter
                                data={[actualPoint]}
                                fill="#c0392b"
                                isAnimationActive={false}
                            />
                        )}

                        {/* Marker fisso a sull'asse x */}
                        <Scatter
                            data={[
                                {
                                    x: fn.a,
                                    y: 0,
                                },
                            ]}
                            shape={<AMarker />}
                            isAnimationActive={false}
                        />

                        {/* Marker fisso L sull'asse y */}
                        <Scatter
                            data={[
                                {
                                    x: 0,
                                    y: fn.limitAtA,
                                },
                            ]}
                            shape={<LMarker />}
                            isAnimationActive={false}
                        />

                        {/* Punto mobile sull'asse x (avvicinamento ad a) */}
                        <Scatter
                            data={[
                                {
                                    x: currentX,
                                    y: 0,
                                },
                            ]}
                            shape={<XAxisMarker />}
                            isAnimationActive={false}
                        />

                        {/* Punto mobile sull'asse y (avvicinamento a L) */}
                        <Scatter
                            data={[
                                {
                                    x: 0,
                                    y: currentBaseY,
                                },
                            ]}
                            shape={<YAxisMarker />}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p style={{ marginTop: "1rem", fontSize: 14, color: "#555" }}>
                Lettura didattica: quando sposti il cursore, il puntino arancione mostra come{" "}
                <strong>x si avvicina ad a</strong> sull&apos;asse delle x, mentre il puntino verde mostra
                come <strong>f(x) si avvicina a L</strong> sull&apos;asse delle y. La curva serve solo
                come contesto per vedere la funzione, ma l&apos;idea di limite è rappresentata
                direttamente sugli assi.
            </p>
        </div>
    );
};

export default RandomFiniteLimitAxesDemo;

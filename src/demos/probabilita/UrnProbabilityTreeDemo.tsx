import React, { useMemo, useState } from "react";

type ColorInfo = {
    id: string;
    name: string;
    short: string;
    count: number;
    color: string;
};

type BranchProb = {
    num: number;
    den: number;
    fracString: string;
    decimalString: string;
};

const SVG_WIDTH = 800;
const SVG_HEIGHT = 420;

const COLORS_BASE: Omit<ColorInfo, "count">[] = [
    { id: "R", name: "rosso", short: "R", color: "#e74c3c" },
    { id: "B", name: "blu", short: "B", color: "#3498db" },
    { id: "V", name: "verde", short: "V", color: "#27ae60" },
];

const MAX_COLORS = COLORS_BASE.length;

// --- Utilità matematiche ---

function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a || 1;
}

function makeBranchProb(num: number, den: number): BranchProb {
    if (den === 0 || num === 0) {
        return {
            num: 0,
            den: 1,
            fracString: "0",
            decimalString: "0",
        };
    }
    const d = gcd(num, den);
    const sn = num / d;
    const sd = den / d;
    const fracString = sd === 1 ? `${sn}` : `${sn}/${sd}`;
    const decimal = sn / sd;
    let decimalString: string;

    if (decimal === 0) {
        decimalString = "0";
    } else if (decimal >= 1e-3 && decimal < 1e4) {
        decimalString = decimal
            .toLocaleString("it-IT", { maximumFractionDigits: 4 })
            .replace(/\./g, " ");
    } else {
        decimalString = decimal.toExponential(2).replace(".", ",");
    }

    return { num: sn, den: sd, fracString, decimalString };
}

function formatIntWithSpaces(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// --- Generazione urna casuale ---

function generateRandomUrn(): ColorInfo[] {
    const numColors = 2 + Math.floor(Math.random() * (MAX_COLORS - 1)); // 2 o 3
    const chosen = COLORS_BASE.slice(0, numColors);

    const colors: ColorInfo[] = chosen.map((c) => ({
        ...c,
        count: 1 + Math.floor(Math.random() * 5),
    }));

    return colors;
}

const UrnProbabilityTreeDemo: React.FC = () => {
    const [colors, setColors] = useState<ColorInfo[]>(() => generateRandomUrn());
    const [withReplacement, setWithReplacement] = useState<boolean>(false);

    const totalBalls = useMemo(
        () => colors.reduce((sum, c) => sum + c.count, 0),
        [colors]
    );

    const numColors = colors.length;
    const numLeaves = numColors * numColors;

    // Primo livello
    const firstDrawProbs: BranchProb[] = useMemo(
        () => colors.map((c) => makeBranchProb(c.count, totalBalls)),
        [colors, totalBalls]
    );

    // Secondo livello condizionato
    const secondDrawProbs: BranchProb[][] = useMemo(() => {
        return colors.map((cFirst, i) => {
            if (withReplacement) {
                return colors.map((cSecond) =>
                    makeBranchProb(cSecond.count, totalBalls)
                );
            } else {
                const denom = totalBalls - 1;
                return colors.map((cSecond, j) => {
                    const num =
                        i === j ? Math.max(cSecond.count - 1, 0) : cSecond.count;
                    return makeBranchProb(num, denom);
                });
            }
        });
    }, [colors, totalBalls, withReplacement]);

    // --- Layout albero (2 estrazioni) ---

    const topMargin = 40;
    const bottomMargin = 40;
    const verticalSpace = SVG_HEIGHT - topMargin - bottomMargin;
    const leafSpacing = numLeaves > 1 ? verticalSpace / (numLeaves - 1) : 0;

    const xRoot = 80;
    const xFirst = 280;
    const xSecond = 580;

    const leafYPositions: number[] = [];
    for (let i = 0; i < numLeaves; i++) {
        leafYPositions.push(topMargin + i * leafSpacing);
    }

    const ySecond: number[][] = [];
    for (let i = 0; i < numColors; i++) {
        ySecond[i] = [];
        for (let j = 0; j < numColors; j++) {
            const leafIndex = i * numColors + j;
            ySecond[i][j] = leafYPositions[leafIndex];
        }
    }

    const yFirst: number[] = [];
    for (let i = 0; i < numColors; i++) {
        const ys = ySecond[i];
        const avg = ys.reduce((s, y) => s + y, 0) / ys.length;
        yFirst.push(avg);
    }

    const yRoot =
        leafYPositions.reduce((s, y) => s + y, 0) /
        (leafYPositions.length || 1);

    // --- Handlers per impostazione manuale ---

    const handleNumColorsChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const raw = parseInt(e.target.value || "1", 10);
        const n = Math.min(
            MAX_COLORS,
            Math.max(1, Number.isNaN(raw) ? 1 : raw)
        );

        setColors((prev) => {
            if (n === prev.length) return prev;
            if (n < prev.length) {
                return prev.slice(0, n);
            }
            // n > prev.length
            const newColors = [...prev];
            for (let i = prev.length; i < n; i++) {
                const base = COLORS_BASE[i];
                newColors.push({
                    ...base,
                    count: 1,
                });
            }
            return newColors;
        });
    };

    const handleCountChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const raw = parseInt(e.target.value || "0", 10);
        const value = Math.max(0, Number.isNaN(raw) ? 0 : raw);

        setColors((prev) =>
            prev.map((c, i) =>
                i === index
                    ? {
                        ...c,
                        count: value,
                    }
                    : c
            )
        );
    };

    return (
        <div
            style={{
                padding: "1.5rem",
                maxWidth: "1100px",
                margin: "0 auto",
                fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                Albero di probabilità – estrazioni da un&apos;urna
            </h1>
            <p style={{ marginBottom: "1rem", lineHeight: 1.4 }}>
                Qui puoi impostare un&apos;<strong>urna di palline colorate</strong> e
                visualizzare l&apos;<strong>albero delle probabilità</strong> per{" "}
                <strong>due estrazioni</strong>, con o senza reimmissione. Puoi sia
                generare un problema casuale, sia impostare manualmente il numero di
                colori e le quantità.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                }}
            >
                {/* ALBERO */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "0.75rem",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        overflowX: "auto",
                    }}
                >
                    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
                        <rect
                            x={0}
                            y={0}
                            width={SVG_WIDTH}
                            height={SVG_HEIGHT}
                            fill="#fafafa"
                            stroke="#ddd"
                        />

                        {/* Rami primo livello */}
                        {colors.map((c, i) => {
                            const y1 = yFirst[i];
                            return (
                                <g key={`level1-${c.id}`}>
                                    <line
                                        x1={xRoot}
                                        y1={yRoot}
                                        x2={xFirst}
                                        y2={y1}
                                        stroke="#555"
                                        strokeWidth={1.5}
                                    />
                                    <text
                                        x={(xRoot + xFirst) / 2}
                                        y={(yRoot + y1) / 2 - 6}
                                        fontSize={11}
                                        textAnchor="middle"
                                    >
                                        {firstDrawProbs[i].fracString}
                                    </text>
                                    <text
                                        x={(xRoot + xFirst) / 2}
                                        y={(yRoot + y1) / 2 + 8}
                                        fontSize={9}
                                        textAnchor="middle"
                                        fill="#555"
                                    >
                                        ({firstDrawProbs[i].decimalString})
                                    </text>
                                </g>
                            );
                        })}

                        {/* Rami secondo livello */}
                        {colors.map((c1, i) =>
                            colors.map((c2, j) => {
                                const y1 = yFirst[i];
                                const y2 = ySecond[i][j];
                                const prob = secondDrawProbs[i][j];
                                const key = `level2-${c1.id}-${c2.id}-${i}-${j}`;

                                const isZero = prob.num === 0;

                                return (
                                    <g key={key}>
                                        <line
                                            x1={xFirst}
                                            y1={y1}
                                            x2={xSecond}
                                            y2={y2}
                                            stroke={isZero ? "#bbb" : "#555"}
                                            strokeWidth={isZero ? 1 : 1.5}
                                            strokeDasharray={isZero ? "4 3" : undefined}
                                        />
                                        <text
                                            x={(xFirst + xSecond) / 2}
                                            y={(y1 + y2) / 2 - 6}
                                            fontSize={11}
                                            textAnchor="middle"
                                        >
                                            {prob.fracString}
                                        </text>
                                        <text
                                            x={(xFirst + xSecond) / 2}
                                            y={(y1 + y2) / 2 + 8}
                                            fontSize={9}
                                            textAnchor="middle"
                                            fill="#555"
                                        >
                                            ({prob.decimalString})
                                        </text>
                                    </g>
                                );
                            })
                        )}

                        {/* Nodo radice */}
                        <circle
                            cx={xRoot}
                            cy={yRoot}
                            r={10}
                            fill="#ffffff"
                            stroke="#555"
                            strokeWidth={1.5}
                        />
                        <text
                            x={xRoot}
                            y={yRoot + 4}
                            fontSize={11}
                            textAnchor="middle"
                        >
                            Inizio
                        </text>

                        {/* Nodi primo livello */}
                        {colors.map((c, i) => (
                            <g key={`node1-${c.id}`}>
                                <circle
                                    cx={xFirst}
                                    cy={yFirst[i]}
                                    r={11}
                                    fill="#ffffff"
                                    stroke={c.color}
                                    strokeWidth={2}
                                />
                                <text
                                    x={xFirst}
                                    y={yFirst[i] + 4}
                                    fontSize={12}
                                    textAnchor="middle"
                                    fill={c.color}
                                    fontWeight={600}
                                >
                                    {c.short}
                                </text>
                            </g>
                        ))}

                        {/* Nodi secondo livello */}
                        {colors.map((c1, i) =>
                            colors.map((c2, j) => {
                                const y2 = ySecond[i][j];
                                const leafLabel = `${c1.short}${c2.short}`;
                                const key = `leaf-${c1.id}-${c2.id}-${i}-${j}`;
                                return (
                                    <g key={key}>
                                        <circle
                                            cx={xSecond}
                                            cy={y2}
                                            r={11}
                                            fill="#ffffff"
                                            stroke="#444"
                                            strokeWidth={1.5}
                                        />
                                        <text
                                            x={xSecond}
                                            y={y2 + 4}
                                            fontSize={11}
                                            textAnchor="middle"
                                        >
                                            {leafLabel}
                                        </text>
                                    </g>
                                );
                            })
                        )}
                    </svg>
                </div>

                {/* PANNELLO DI CONTROLLO E SPIEGAZIONI */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.9rem",
                    }}
                >
                    {/* Urna e modalità + impostazione manuale */}
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
                            Problema generato / impostato
                        </h2>

                        <p style={{ marginBottom: "0.4rem", fontSize: "0.95rem" }}>
                            Il numero totale di palline è{" "}
                            <strong>{formatIntWithSpaces(totalBalls)}</strong>.
                        </p>

                        <ul
                            style={{
                                paddingLeft: "1.1rem",
                                marginTop: 0,
                                marginBottom: "0.6rem",
                                fontSize: "0.9rem",
                            }}
                        >
                            {colors.map((c, index) => (
                                <li key={`desc-${c.id}`}>
                  <span
                      style={{
                          display: "inline-block",
                          width: "0.7rem",
                          height: "0.7rem",
                          borderRadius: "999px",
                          background: c.color,
                          marginRight: "0.3rem",
                      }}
                  />
                                    <strong>{c.name}</strong>:{" "}
                                    <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={c.count}
                                        onChange={(e) => handleCountChange(index, e)}
                                        style={{
                                            width: "4rem",
                                            padding: "0.1rem 0.3rem",
                                            marginLeft: "0.2rem",
                                            marginRight: "0.2rem",
                                        }}
                                    />
                                    pallin{c.count === 1 ? "a" : "e"}
                                </li>
                            ))}
                        </ul>

                        <p style={{ fontSize: "0.9rem" }}>
                            Si estraggono <strong>due palline</strong> una dopo l&apos;altra{" "}
                            <strong>
                                {withReplacement
                                    ? "CON reimmissione (dopo ogni estrazione la pallina viene rimessa nell'urna)"
                                    : "SENZA reimmissione (la pallina estratta non viene rimessa nell'urna)"}
                            </strong>
                            .
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                                marginTop: "0.6rem",
                                marginBottom: "0.6rem",
                            }}
                        >
                            <button
                                onClick={() => setColors(generateRandomUrn())}
                                style={{
                                    padding: "0.35rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                }}
                            >
                                Nuovo problema casuale
                            </button>
                            <button
                                onClick={() => setWithReplacement((prev) => !prev)}
                                style={{
                                    padding: "0.35rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Passa a{" "}
                                {withReplacement ? "senza reimmissione" : "con reimmissione"}
                            </button>
                        </div>

                        {/* Impostazione manuale numero di colori */}
                        <div
                            style={{
                                borderTop: "1px solid #eee",
                                paddingTop: "0.6rem",
                                marginTop: "0.4rem",
                                fontSize: "0.9rem",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "0.95rem",
                                    marginBottom: "0.3rem",
                                }}
                            >
                                Impostazione manuale
                            </h3>
                            <label>
                                Numero di colori (1–{MAX_COLORS}):{" "}
                                <input
                                    type="number"
                                    min={1}
                                    max={MAX_COLORS}
                                    step={1}
                                    value={colors.length}
                                    onChange={handleNumColorsChange}
                                    style={{
                                        width: "3.5rem",
                                        marginLeft: "0.3rem",
                                        padding: "0.1rem 0.3rem",
                                    }}
                                />
                            </label>
                            <p
                                style={{
                                    fontSize: "0.8rem",
                                    marginTop: "0.35rem",
                                    color: "#555",
                                }}
                            >
                                Dopo aver scelto il numero di colori, regola il numero di
                                palline per ciascun colore negli input sopra.
                            </p>
                        </div>
                    </div>

                    {/* Spiegazione uso dell'albero */}
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.05rem",
                                marginBottom: "0.35rem",
                            }}
                        >
                            Come leggere l&apos;albero
                        </h2>
                        <ul style={{ paddingLeft: "1.1rem", marginTop: 0 }}>
                            <li>
                                Ogni <strong>ramo in uscita dalla radice</strong> rappresenta il
                                colore della <strong>prima estrazione</strong>.
                            </li>
                            <li>
                                Ogni <strong>ramo del secondo livello</strong> rappresenta il
                                colore della <strong>seconda estrazione</strong>, sapendo com’è
                                andata la prima.
                            </li>
                            <li>
                                La probabilità di una coppia (per esempio{" "}
                                <em>prima R poi B</em>) è il prodotto delle probabilità sui due
                                rami:
                                <br />
                                <span style={{ fontFamily: "monospace" }}>
                  P(R poi B) = P(R alla prima) × P(B alla seconda | R)
                </span>
                                .
                            </li>
                            <li>
                                In modalità <strong>senza reimmissione</strong>, le probabilità
                                del secondo livello cambiano perché l&apos;urna è stata
                                modificata dalla prima estrazione.
                            </li>
                        </ul>
                    </div>

                    {/* Suggerimenti didattici */}
                    <div
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "12px",
                            padding: "0.7rem 1rem",
                            fontSize: "0.85rem",
                            background: "#fafafa",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "0.95rem",
                                marginBottom: "0.3rem",
                            }}
                        >
                            Spunti per esercizi
                        </h3>
                        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                            <li>
                                Calcolare la probabilità di estrarre{" "}
                                <strong>due palline dello stesso colore</strong>.
                            </li>
                            <li>
                                Calcolare la probabilità di estrarre{" "}
                                <strong>due colori diversi</strong>.
                            </li>
                            <li>
                                Confrontare i risultati <strong>con</strong> e{" "}
                                <strong>senza reimmissione</strong>.
                            </li>
                            <li>
                                Fare prima i conti a mano, poi usare l&apos;albero per
                                verificare.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrnProbabilityTreeDemo;

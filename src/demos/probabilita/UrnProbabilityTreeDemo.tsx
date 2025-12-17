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

// --- Badge semitrasparente per le probabilità sui rami ---

type ProbBadgeProps = {
    x: number;
    y: number;
    line1: string;
    line2?: string;
};

const ProbBadge: React.FC<ProbBadgeProps> = ({ x, y, line1, line2 }) => {
    const paddingX = 6;
    const paddingY = 4;
    const lineHeight = 11;

    const maxLen = Math.max(line1.length, line2 ? line2.length : 0);
    const textWidth = Math.max(28, maxLen * 6); // stima ampiezza testo
    const height = line2 ? lineHeight * 2 + paddingY * 2 : lineHeight + paddingY * 2;
    const width = textWidth + paddingX * 2;

    const x0 = x - width / 2;
    const y0 = y - height / 2;

    return (
        <g>
            <rect
                x={x0}
                y={y0}
                width={width}
                height={height}
                rx={8}
                ry={8}
                fill="#ffffffcc"
                stroke="#bbbbbb"
                strokeWidth={0.8}
            />
            <text
                x={x}
                y={y - (line2 ? 2 : 0)}
                fontSize={11}
                textAnchor="middle"
                fill="#333"
            >
                {line1}
            </text>
            {line2 && (
                <text
                    x={x}
                    y={y + 9}
                    fontSize={9}
                    textAnchor="middle"
                    fill="#666"
                >
                    {line2}
                </text>
            )}
        </g>
    );
};

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

    // Probabilità congiunte per la tabella riepilogo
    const jointProbs: BranchProb[][] = useMemo(() => {
        return colors.map((_, i) =>
            colors.map((_, j) => {
                const p1 = firstDrawProbs[i];
                const p2 = secondDrawProbs[i][j];
                const num = p1.num * p2.num;
                const den = p1.den * p2.den;
                return makeBranchProb(num, den);
            })
        );
    }, [colors, firstDrawProbs, secondDrawProbs]);

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

    // dati tabella flat
    const flatRows = useMemo(
        () =>
            colors.flatMap((c1, i) =>
                colors.map((c2, j) => ({
                    id: `row-${i}-${j}`,
                    first: c1.short,
                    firstName: c1.name,
                    second: c2.short,
                    secondName: c2.name,
                    outcome: `${c1.short}${c2.short}`,
                    prob: jointProbs[i][j],
                }))
            ),
        [colors, jointProbs]
    );

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
                {/* ALBERO + RIEPILOGO */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "16px",
                        padding: "0.75rem 0.75rem 1rem",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        background: "white",
                        overflowX: "auto",
                    }}
                >
                    <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
                        {/* sfondo quaderno a quadretti */}
                        <defs>
                            <pattern
                                id="gridPatternProb"
                                width="20"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <rect
                                    width="20"
                                    height="20"
                                    fill="#fdfdfd"
                                />
                                <path
                                    d="M 20 0 L 0 0 0 20"
                                    fill="none"
                                    stroke="#e5e5e5"
                                    strokeWidth={1}
                                />
                            </pattern>
                        </defs>

                        <rect
                            x={0}
                            y={0}
                            width={SVG_WIDTH}
                            height={SVG_HEIGHT}
                            fill="url(#gridPatternProb)"
                            stroke="#d0d0d0"
                        />

                        {/* Rami primo livello (neutri) */}
                        {colors.map((c, i) => {
                            const y1 = yFirst[i];
                            const cx = (xRoot + xFirst) / 2;
                            const cy = (yRoot + y1) / 2;
                            return (
                                <g key={`level1-${c.id}`}>
                                    <line
                                        x1={xRoot}
                                        y1={yRoot}
                                        x2={xFirst}
                                        y2={y1}
                                        stroke="#555"
                                        strokeWidth={1.6}
                                    />
                                    <ProbBadge
                                        x={cx}
                                        y={cy}
                                        line1={firstDrawProbs[i].fracString}
                                        line2={`(${firstDrawProbs[i].decimalString})`}
                                    />
                                </g>
                            );
                        })}

                        {/* Rami secondo livello (neutri, tratteggiati se prob 0) */}
                        {colors.map((c1, i) =>
                            colors.map((c2, j) => {
                                const y1 = yFirst[i];
                                const y2 = ySecond[i][j];
                                const prob = secondDrawProbs[i][j];
                                const isZero = prob.num === 0;
                                const cx = (xFirst + xSecond) / 2;
                                const cy = (y1 + y2) / 2;

                                const key = `level2-${c1.id}-${c2.id}-${i}-${j}`;

                                return (
                                    <g key={key}>
                                        <line
                                            x1={xFirst}
                                            y1={y1}
                                            x2={xSecond}
                                            y2={y2}
                                            stroke={isZero ? "#bbbbbb" : "#555"}
                                            strokeWidth={isZero ? 1.2 : 1.6}
                                            strokeDasharray={isZero ? "5 4" : undefined}
                                        />
                                        <ProbBadge
                                            x={cx}
                                            y={cy}
                                            line1={prob.fracString}
                                            line2={`(${prob.decimalString})`}
                                        />
                                    </g>
                                );
                            })
                        )}

                        {/* Nodo radice */}
                        <g>
                            <circle
                                cx={xRoot}
                                cy={yRoot}
                                r={12}
                                fill="#fff"
                                stroke="#555"
                                strokeWidth={1.8}
                            />
                            <text
                                x={xRoot}
                                y={yRoot + 4}
                                fontSize={11}
                                textAnchor="middle"
                            >
                                Inizio
                            </text>
                        </g>

                        {/* Nodi primo livello: prima estrazione */}
                        {colors.map((c, i) => (
                            <g key={`node1-${c.id}`}>
                                <circle
                                    cx={xFirst}
                                    cy={yFirst[i]}
                                    r={12}
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

                        {/* Nodi secondo livello: seconda pallina + riepilogo ramo */}
                        {colors.map((c1, i) =>
                            colors.map((c2, j) => {
                                const y2 = ySecond[i][j];
                                const leafLabel = `${c1.short}${c2.short}`;
                                const key = `leaf-${c1.id}-${c2.id}-${i}-${j}`;
                                return (
                                    <g key={key}>
                                        {/* pallina della seconda estrazione */}
                                        <circle
                                            cx={xSecond}
                                            cy={y2}
                                            r={12}
                                            fill="#ffffff"
                                            stroke={c2.color}
                                            strokeWidth={2}
                                        />
                                        <text
                                            x={xSecond}
                                            y={y2 + 4}
                                            fontSize={12}
                                            textAnchor="middle"
                                            fill={c2.color}
                                            fontWeight={600}
                                        >
                                            {c2.short}
                                        </text>

                                        {/* riepilogo del ramo (es. RR, RB, ...) alla fine */}
                                        <text
                                            x={xSecond + 40}
                                            y={y2 + 4}
                                            fontSize={12}
                                            textAnchor="start"
                                            fill="#333"
                                            fontFamily="monospace"
                                        >
                                            {leafLabel}
                                        </text>
                                    </g>
                                );
                            })
                        )}
                    </svg>

                    {/* Tabella riepilogo esiti */}
                    <div
                        style={{
                            marginTop: "0.9rem",
                            borderTop: "1px solid #eee",
                            paddingTop: "0.6rem",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.05rem",
                                marginBottom: "0.4rem",
                            }}
                        >
                            Riepilogo esiti e probabilità
                        </h2>
                        <div
                            style={{
                                maxHeight: "220px",
                                overflowY: "auto",
                                borderRadius: "10px",
                                border: "1px solid #eee",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.85rem",
                                }}
                            >
                                <thead
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        background: "#f7f9ff",
                                        zIndex: 1,
                                    }}
                                >
                                <tr>
                                    <th
                                        style={{
                                            padding: "0.4rem 0.5rem",
                                            borderBottom: "1px solid #e0e0e0",
                                            textAlign: "left",
                                        }}
                                    >
                                        Prima
                                    </th>
                                    <th
                                        style={{
                                            padding: "0.4rem 0.5rem",
                                            borderBottom: "1px solid #e0e0e0",
                                            textAlign: "left",
                                        }}
                                    >
                                        Seconda
                                    </th>
                                    <th
                                        style={{
                                            padding: "0.4rem 0.5rem",
                                            borderBottom: "1px solid #e0e0e0",
                                            textAlign: "left",
                                        }}
                                    >
                                        Esito
                                    </th>
                                    <th
                                        style={{
                                            padding: "0.4rem 0.5rem",
                                            borderBottom: "1px solid #e0e0e0",
                                            textAlign: "left",
                                        }}
                                    >
                                        Probabilità
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {flatRows.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        style={{
                                            backgroundColor:
                                                idx % 2 === 0
                                                    ? "#ffffff"
                                                    : "#fafbff",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "0.3rem 0.5rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {row.first} (
                                            <span style={{ fontSize: "0.8rem" }}>
                                                    {row.firstName}
                                                </span>
                                            )
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.3rem 0.5rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {row.second} (
                                            <span style={{ fontSize: "0.8rem" }}>
                                                    {row.secondName}
                                                </span>
                                            )
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.3rem 0.5rem",
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            {row.outcome}
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.3rem 0.5rem",
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            {row.prob.fracString}{" "}
                                            <span
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#555",
                                                }}
                                            >
                                                    (
                                                {row.prob.decimalString}
                                                )
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                            borderRadius: "16px",
                            padding: "0.75rem 1rem",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            background: "white",
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
                                    background:
                                        "linear-gradient(135deg, #fdfbff, #f0f4ff)",
                                }}
                            >
                                Nuovo problema casuale
                            </button>
                            <button
                                onClick={() => setWithReplacement((prev) => !prev)}
                                style={{
                                    padding: "0.35rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "1px solid #ccc",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    background: "#ffffff",
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
                            borderRadius: "16px",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                            background: "white",
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
                            borderRadius: "16px",
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

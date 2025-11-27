import React, { useMemo, useState } from "react";

type BaseUnit = {
    symbol: string;
    label: string;
};

const BASE_UNITS: BaseUnit[] = [
    { symbol: "m", label: "metri (m)" },
    { symbol: "g", label: "grammi (g)" },
    { symbol: "s", label: "secondi (s)" },
];

function formatNormal(value: number): string {
    return formatNumberWithSpaces(value, 6);
}

// formato: spazio per migliaia, virgola come separatore decimale,
// decimali variabili fino a maxDecimals (tagliando gli zeri finali)
function formatNumberWithSpaces(value: number, maxDecimals = 6): string {
    if (!Number.isFinite(value)) return "—";

    const isNegative = value < 0;
    const abs = Math.abs(value);

    // scrivo con punto come separatore decimale, poi converto
    let str = abs.toFixed(maxDecimals); // es: "1234.500000"
    // tolgo gli zeri finali dopo il punto
    str = str.replace(/\.?0+$/, ""); // "1234.5" oppure "1234"

    let [intPart, fracPart] = str.split(".");

    // inserisco spazi per migliaia
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    let result = intPart;
    if (fracPart && fracPart.length > 0) {
        result += "," + fracPart; // virgola come separatore decimale
    }

    if (isNegative) result = "-" + result;
    return result;
}


type SciForm = {
    mantissa: number;
    exponent: number;
    mantissaString: string;
};

function toScientific(value: number, significantDigits = 3): SciForm {
    if (value === 0) {
        return {
            mantissa: 0,
            exponent: 0,
            mantissaString: "0",
        };
    }

    const sign = Math.sign(value);
    const absValue = Math.abs(value);

    let exponent = Math.floor(Math.log10(absValue));
    let mantissa = absValue / Math.pow(10, exponent);

    const factor = Math.pow(10, significantDigits - 1);
    mantissa = Math.round(mantissa * factor) / factor;

    if (mantissa >= 10) {
        mantissa = mantissa / 10;
        exponent += 1;
    }

    mantissa = sign * mantissa;

    const mantissaString = mantissa.toLocaleString("it-IT", {
        maximumFractionDigits: significantDigits - 1,
    });

    return { mantissa, exponent, mantissaString };
}

// genera un valore casuale in un range di ordini di grandezza
function generateRandomValue(): number {
    // esponente tra -6 e +6
    const exp = Math.floor(Math.random() * 13) - 6; // -6..+6
    const mantissa = 1 + Math.random() * 9; // [1,10)
    const sign = 1; // per ora teniamo solo positivi, più chiaro didatticamente
    return sign * mantissa * Math.pow(10, exp);
}

const NotazioneScientificaDemo: React.FC = () => {
    const [baseUnit, setBaseUnit] = useState<BaseUnit>(BASE_UNITS[0]);
    const [value, setValue] = useState<number>(() => generateRandomValue());
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const scientific = useMemo(() => toScientific(value, 3), [value]);

    const explanation = useMemo(() => {
        const { exponent } = scientific;
        if (value === 0) {
            return "Lo zero in notazione scientifica si scrive semplicemente 0 (non è necessario usare potenze di 10).";
        }
        const absExp = Math.abs(exponent);
        if (exponent > 0) {
            const passi = absExp === 1 ? "1 posto" : `${absExp} posti`;
            return `Per ottenere la mantissa abbiamo spostato la virgola di ${passi} verso sinistra (il numero è grande, l'esponente è positivo).`;
        } else if (exponent < 0) {
            const passi = absExp === 1 ? "1 posto" : `${absExp} posti`;
            return `Per ottenere la mantissa abbiamo spostato la virgola di ${passi} verso destra (il numero è piccolo, l'esponente è negativo).`;
        }
        return "In questo caso non abbiamo bisogno di spostare la virgola: l'esponente è 0.";
    }, [scientific, value]);

    const factorText = useMemo(() => {
        const { exponent } = scientific;
        const sign = exponent >= 0 ? "+" : "";
        return `Il numero si scrive come mantissa × 10${sign}${exponent}.`;
    }, [scientific]);

    const newMeasurement = () => {
        setValue(generateRandomValue());
        setShowSolution(false);
    };

    const normalString = formatNormal(value);
    const sci = scientific;
    const sciUnit = baseUnit.symbol;

    const sciFull = `${sci.mantissaString} · 10${
        sci.exponent === 0 ? "⁰" : ""
    }${sci.exponent !== 0 ? superscriptExponent(sci.exponent) : ""}`;

    return (
        <div
            style={{
                padding: "1.5rem",
                maxWidth: "900px",
                margin: "0 auto",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                Notazione scientifica delle misure
            </h1>
            <p style={{ marginBottom: "1rem", lineHeight: 1.4 }}>
                Questa pagina genera una misura casuale e ti chiede di riscriverla in{" "}
                <strong>notazione scientifica</strong>, cioè nella forma{" "}
                <em>a · 10ⁿ</em> con 1 ≤ a &lt; 10. Puoi pensare alla posizione della
                virgola e agli ordini di grandezza.
            </p>

            {/* Scelta unità + generazione */}
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "0.8rem 1rem",
                    marginBottom: "1rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.1rem",
                        marginBottom: "0.5rem",
                    }}
                >
                    1. Scegli l&apos;unità e genera una misura casuale
                </h2>
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginBottom: "0.7rem",
                    }}
                >
                    {BASE_UNITS.map((u) => (
                        <button
                            key={u.symbol}
                            onClick={() => setBaseUnit(u)}
                            style={{
                                padding: "0.3rem 0.7rem",
                                borderRadius: "999px",
                                border:
                                    baseUnit.symbol === u.symbol
                                        ? "2px solid #1f77b4"
                                        : "1px solid #ccc",
                                background:
                                    baseUnit.symbol === u.symbol
                                        ? "rgba(31,119,180,0.1)"
                                        : "white",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                            }}
                        >
                            {u.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={newMeasurement}
                    style={{
                        padding: "0.4rem 0.9rem",
                        borderRadius: "999px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    }}
                >
                    Nuova misura casuale
                </button>
            </div>

            {/* Misura generata */}
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "0.8rem 1rem",
                    marginBottom: "1rem",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.1rem",
                        marginBottom: "0.4rem",
                    }}
                >
                    2. Misura da riscrivere in notazione scientifica
                </h2>
                <p
                    style={{
                        fontSize: "1.4rem",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    }}
                >
                    <strong>
                        {normalString} {sciUnit}
                    </strong>
                </p>
                <p
                    style={{
                        fontSize: "0.9rem",
                        fontStyle: "italic",
                        color: "#555",
                    }}
                >
                    Prova mentalmente a trasformarla in a · 10ⁿ prima di guardare la
                    soluzione.
                </p>
                <button
                    onClick={() => setShowSolution((prev) => !prev)}
                    style={{
                        marginTop: "0.4rem",
                        padding: "0.35rem 0.8rem",
                        borderRadius: "999px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                    }}
                >
                    {showSolution ? "Nascondi soluzione" : "Mostra soluzione"}
                </button>
            </div>

            {/* Soluzione e spiegazione */}
            {showSolution && (
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "0.9rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.7rem",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.1rem",
                            marginBottom: "0.2rem",
                        }}
                    >
                        3. Notazione scientifica e spiegazione
                    </h2>

                    {/* Forma a · 10^n */}
                    <div>
                        <p
                            style={{
                                marginBottom: "0.3rem",
                            }}
                        >
                            In notazione scientifica:
                        </p>
                        <p
                            style={{
                                fontSize: "1.3rem",
                                fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                            }}
                        >
                            <strong>
                                {normalString} {sciUnit} = {sci.mantissaString} · 10
                                {sci.exponent === 0 ? "⁰" : superscriptExponent(sci.exponent)}{" "}
                                {sciUnit}
                            </strong>
                        </p>
                    </div>

                    {/* Testo sul fattore 10^n */}
                    <div
                        style={{
                            fontSize: "0.95rem",
                        }}
                    >
                        <p style={{ marginBottom: "0.25rem" }}>{factorText}</p>
                        <p style={{ marginBottom: "0.25rem" }}>{explanation}</p>
                    </div>

                    {/* Box "virgola" */}
                    <div
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "10px",
                            padding: "0.6rem 0.8rem",
                            fontSize: "0.9rem",
                            background: "#fafafa",
                        }}
                    >
                        <p style={{ marginBottom: "0.3rem" }}>
                            Per passare dalla misura originale alla mantissa:
                        </p>
                        <ul
                            style={{
                                paddingLeft: "1.2rem",
                                margin: 0,
                            }}
                        >
                            <li>
                                scrivi il numero con la virgola in modo che resti{" "}
                                <strong>una sola cifra diversa da zero</strong> prima della
                                virgola;
                            </li>
                            <li>
                                conta di quanti posti hai spostato la virgola: questo numero
                                sarà l&apos;esponente di 10 (positivo se hai spostato verso
                                sinistra, negativo se verso destra);
                            </li>
                            <li>
                                la misura non cambia, cambia solo il modo di scriverla: la
                                notazione scientifica è comoda per numeri molto grandi o molto
                                piccoli.
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

// piccola utility per scrivere esponenti in apice (solo cifre e segno)
function superscriptExponent(n: number): string {
    const map: Record<string, string> = {
        "-": "⁻",
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
    };
    const s = n.toString();
    return s
        .split("")
        .map((ch) => map[ch] ?? ch)
        .join("");
}

export default NotazioneScientificaDemo;

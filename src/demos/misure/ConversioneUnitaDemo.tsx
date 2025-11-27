import React, { useMemo, useState } from "react";

type Prefix = {
    symbol: string;
    name: string;
    exponent: number;
};

const PREFIXES: Prefix[] = [
    { symbol: "M", name: "mega", exponent: 6 },
    { symbol: "k", name: "chilo", exponent: 3 },
    { symbol: "h", name: "etto", exponent: 2 },
    { symbol: "da", name: "deca", exponent: 1 },
    { symbol: "", name: "unità", exponent: 0 },
    { symbol: "d", name: "deci", exponent: -1 },
    { symbol: "c", name: "centi", exponent: -2 },
    { symbol: "m", name: "milli", exponent: -3 },
    { symbol: "µ", name: "micro", exponent: -6 },
    { symbol: "n", name: "nano", exponent: -9 },
];

type BaseUnit = {
    symbol: string;
    label: string;
};

const BASE_UNITS: BaseUnit[] = [
    { symbol: "m", label: "metri (m)" },
    { symbol: "g", label: "grammi (g)" },
    { symbol: "s", label: "secondi (s)" },
];

function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "—";
    // Evito notazione scientifica per valori "ragionevoli"
    if (Math.abs(value) >= 1e-3 && Math.abs(value) < 1e7) {
        return value.toLocaleString("it-IT", {
            maximumFractionDigits: 10,
        });
    }
    return value.toExponential(5).replace(".", ",");
}

function parseInput(value: string): number | null {
    if (!value.trim()) return null;
    // accetta anche virgola
    const normalized = value.replace(",", ".");
    const num = Number(normalized);
    if (Number.isNaN(num)) return null;
    return num;
}

const ConversioneUnitaDemo: React.FC = () => {
    const [baseUnit, setBaseUnit] = useState<BaseUnit>(BASE_UNITS[0]);
    const [fromPrefixSymbol, setFromPrefixSymbol] = useState<string>("");
    const [toPrefixSymbol, setToPrefixSymbol] = useState<string>("m");
    const [inputValue, setInputValue] = useState<string>("1");
    const [focusFrom, setFocusFrom] = useState<"from" | "to" | null>(null);

    const fromPrefix = PREFIXES.find((p) => p.symbol === fromPrefixSymbol)!;
    const toPrefix = PREFIXES.find((p) => p.symbol === toPrefixSymbol)!;

    const parsedInput = useMemo(() => parseInput(inputValue), [inputValue]);

    const deltaExponent = fromPrefix.exponent - toPrefix.exponent;
    const factor = Math.pow(10, deltaExponent);

    const convertedValue = useMemo(() => {
        if (parsedInput === null) return null;
        return parsedInput * factor;
    }, [parsedInput, factor]);

    const movementExplanation = useMemo(() => {
        if (deltaExponent === 0) return "Non si sposta la virgola: i prefissi sono uguali.";
        const absDelta = Math.abs(deltaExponent);
        const direction = deltaExponent > 0 ? "verso destra" : "verso sinistra";
        const passi = absDelta === 1 ? "1 posto" : `${absDelta} posti`;
        return `Sposti la virgola di ${passi} ${direction}.`;
    }, [deltaExponent]);

    // Testo didattico per la conversione
    const explanationText = useMemo(() => {
        const unitLabelFrom =
            (fromPrefix.symbol || "") + baseUnit.symbol;
        const unitLabelTo =
            (toPrefix.symbol || "") + baseUnit.symbol;

        if (parsedInput === null) {
            return `Inserisci un numero valido per vedere la conversione da ${unitLabelFrom} a ${unitLabelTo}.`;
        }

        const fromVal = formatNumber(parsedInput);
        const toVal =
            convertedValue === null ? "—" : formatNumber(convertedValue);

        return `${fromVal} ${unitLabelFrom} = ${toVal} ${unitLabelTo}`;
    }, [parsedInput, convertedValue, fromPrefix, toPrefix, baseUnit]);

    const factorText = useMemo(() => {
        if (deltaExponent === 0) return "Fattore di conversione: ×10⁰ = 1";
        const sign = deltaExponent >= 0 ? "+" : "";
        return `Fattore di conversione: ×10${sign}${deltaExponent}`;
    }, [deltaExponent]);

    const handlePrefixClick = (symbol: string, target: "from" | "to") => {
        if (target === "from") {
            setFromPrefixSymbol(symbol);
        } else {
            setToPrefixSymbol(symbol);
        }
    };

    const currentFromUnitLabel =
        (fromPrefix.symbol || "") + baseUnit.symbol;
    const currentToUnitLabel =
        (toPrefix.symbol || "") + baseUnit.symbol;

    return (
        <div
            style={{
                padding: "1.5rem",
                maxWidth: "1100px",
                margin: "0 auto",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                Conversione tra multipli e sottomultipli
            </h1>
            <p style={{ marginBottom: "1rem", lineHeight: 1.4 }}>
                Scegli l&apos;unità di base (metri, grammi, secondi), il prefisso di{" "}
                <strong>partenza</strong> e quello di <strong>arrivo</strong>. Inserisci
                un valore e osserva come cambia: la barra dei prefissi mostra quanti
                ordini di grandezza stai cambiando, e la scheda spiega come si sposta la
                virgola.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                }}
            >
                {/* Scala prefissi + input */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "1rem",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.1rem",
                            marginBottom: "0.75rem",
                        }}
                    >
                        1. Scegli unità e prefissi sulla scala
                    </h2>

                    {/* Scelta unità base */}
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.75rem",
                            flexWrap: "wrap",
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

                    {/* Scala per prefisso di partenza */}
                    <div style={{ marginBottom: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "0.3rem",
                            }}
                        >
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Prefisso di partenza ({currentFromUnitLabel})
              </span>
                            <span
                                style={{
                                    fontSize: "0.8rem",
                                    fontStyle: "italic",
                                    color: "#555",
                                }}
                            >
                clicca sulla scala per scegliere
              </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.35rem",
                                flexWrap: "wrap",
                                padding: "0.4rem 0.4rem",
                                borderRadius: "999px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {PREFIXES.map((p) => {
                                const isSelected = p.symbol === fromPrefixSymbol;
                                return (
                                    <button
                                        key={`from-${p.symbol || "unit"}`}
                                        onClick={() => {
                                            handlePrefixClick(p.symbol, "from");
                                            setFocusFrom("to");
                                        }}
                                        style={{
                                            minWidth: "2.3rem",
                                            padding: "0.25rem 0.4rem",
                                            borderRadius: "999px",
                                            border: isSelected
                                                ? "2px solid #1f77b4"
                                                : "1px solid #ccc",
                                            background: isSelected
                                                ? "rgba(31,119,180,0.12)"
                                                : "white",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                        }}
                                        title={`${p.name} (10^${p.exponent})`}
                                    >
                                        {p.symbol || "1"}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scala per prefisso di arrivo */}
                    <div style={{ marginBottom: "0.75rem" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "0.3rem",
                            }}
                        >
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Prefisso di arrivo ({currentToUnitLabel})
              </span>
                            <span
                                style={{
                                    fontSize: "0.8rem",
                                    fontStyle: "italic",
                                    color: "#555",
                                }}
                            >
                clicca sulla scala per scegliere
              </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.35rem",
                                flexWrap: "wrap",
                                padding: "0.4rem 0.4rem",
                                borderRadius: "999px",
                                border: "1px solid #ddd",
                            }}
                        >
                            {PREFIXES.map((p) => {
                                const isSelected = p.symbol === toPrefixSymbol;
                                return (
                                    <button
                                        key={`to-${p.symbol || "unit"}`}
                                        onClick={() => {
                                            handlePrefixClick(p.symbol, "to");
                                            setFocusFrom("from");
                                        }}
                                        style={{
                                            minWidth: "2.3rem",
                                            padding: "0.25rem 0.4rem",
                                            borderRadius: "999px",
                                            border: isSelected
                                                ? "2px solid #d62728"
                                                : "1px solid #ccc",
                                            background: isSelected
                                                ? "rgba(214,39,40,0.12)"
                                                : "white",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                        }}
                                        title={`${p.name} (10^${p.exponent})`}
                                    >
                                        {p.symbol || "1"}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Input valore */}
                    <div>
                        <h2
                            style={{
                                fontSize: "1.05rem",
                                marginBottom: "0.4rem",
                            }}
                        >
                            2. Inserisci il valore da convertire
                        </h2>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                alignItems: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                style={{
                                    padding: "0.3rem 0.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    minWidth: "7rem",
                                }}
                                placeholder="Es. 1,25"
                            />
                            <span
                                style={{
                                    fontSize: "0.95rem",
                                }}
                            >
                {currentFromUnitLabel}
              </span>
                        </div>
                        {focusFrom && (
                            <p
                                style={{
                                    marginTop: "0.35rem",
                                    fontSize: "0.8rem",
                                    fontStyle: "italic",
                                    color: "#555",
                                }}
                            >
                                Suggerimento: ora scegli il prefisso di{" "}
                                {focusFrom === "from" ? "partenza" : "arrivo"} sulla scala
                                corrispondente.
                            </p>
                        )}
                    </div>
                </div>

                {/* Pannello di spiegazione */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.9rem",
                    }}
                >
                    {/* Risultato numerico */}
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
                            3. Risultato della conversione
                        </h2>
                        <p style={{ marginBottom: "0.4rem" }}>{explanationText}</p>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.3rem",
                                fontSize: "0.9rem",
                            }}
                        >
                            <span>{factorText}</span>
                            <span>{movementExplanation}</span>
                        </div>
                    </div>

                    {/* "Animazione" logica della virgola */}
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
                                marginBottom: "0.4rem",
                            }}
                        >
                            4. Lettura del risultato
                        </h2>
                        {parsedInput === null || convertedValue === null ? (
                            <p>
                                Inserisci un numero valido per vedere il confronto tra valore
                                iniziale e valore convertito.
                            </p>
                        ) : (
                            <>
                                <p style={{ marginBottom: "0.35rem" }}>
                                    <strong>Valore iniziale:</strong> {formatNumber(parsedInput)}{" "}
                                    {currentFromUnitLabel}
                                </p>
                                <p style={{ marginBottom: "0.35rem" }}>
                                    <strong>Valore convertito:</strong>{" "}
                                    {formatNumber(convertedValue)} {currentToUnitLabel}
                                </p>
                                <p>
                                    Immagina di scrivere il numero in notazione normale e di
                                    spostare la virgola come indicato sopra: se il prefisso di
                                    arrivo è un <strong>multiplo più grande</strong> (es. da m a
                                    km), la virgola si sposta a{" "}
                                    <strong>sinistra</strong>; se è un{" "}
                                    <strong>sottomultiplo</strong> (es. da m a mm), si sposta a{" "}
                                    <strong>destra</strong>.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Box riepilogo concettuale */}
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
                                marginBottom: "0.35rem",
                            }}
                        >
                            Ricorda:
                        </h3>
                        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                            <li>
                                Ogni prefisso corrisponde a una potenza di 10 (es.{" "}
                                <strong>milli</strong> = 10⁻³, <strong>kilo</strong> = 10³).
                            </li>
                            <li>
                                Cambiare prefisso significa moltiplicare per una potenza di 10:
                                il valore numerico cambia, ma la grandezza fisica è la stessa.
                            </li>
                            <li>
                                Usare la scala ti aiuta a <strong>visualizzare gli ordini di
                                grandezza</strong> e a evitare errori di virgola.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversioneUnitaDemo;

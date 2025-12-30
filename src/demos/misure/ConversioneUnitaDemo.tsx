/**
 * ConversioneUnitaDemo - Versione refactorizzata (3 layout: mobile/tablet/desktop)
 * Conversione tra multipli e sottomultipli con procedura step-by-step
 */

import React, { useEffect, useMemo, useState } from "react";
import { DemoContainer } from "../../components/ui";

// ============ TIPI E COSTANTI ============

type Prefix = {
    symbol: string;
    name: string;
    exponent: number;
};

const PREFIXES: Prefix[] = [
    { symbol: "G", name: "giga", exponent: 9 },
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

type BaseUnit = { symbol: string; label: string; examples: string };

const BASE_UNITS: BaseUnit[] = [
    { symbol: "m", label: "metri", examples: "lunghezza, distanza" },
    { symbol: "g", label: "grammi", examples: "massa" },
    { symbol: "L", label: "litri", examples: "volume" },
    { symbol: "s", label: "secondi", examples: "tempo" },
];

// ============ UTILITY ============

function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) >= 1e-4 && Math.abs(value) < 1e7) {
        return value.toLocaleString("it-IT", { maximumFractionDigits: 10 });
    }
    return value.toExponential(4).replace(".", ",");
}

function parseInput(value: string): number | null {
    if (!value.trim()) return null;
    const num = Number(value.replace(",", "."));
    return Number.isNaN(num) ? null : num;
}

function superscript(n: number): string {
    const sup: Record<string, string> = {
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
    return String(n)
        .split("")
        .map((c) => sup[c] || c)
        .join("");
}

// ============ COMPONENTE PRINCIPALE ============

export default function ConversioneUnitaDemo() {
    // --- responsive: 3 layout
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const mqMobile = window.matchMedia("(max-width: 640px)");
        const mqTablet = window.matchMedia("(min-width: 641px) and (max-width: 1024px)");

        const apply = () => {
            setIsMobile(mqMobile.matches);
            setIsTablet(mqTablet.matches);
        };

        apply();
        mqMobile.addEventListener("change", apply);
        mqTablet.addEventListener("change", apply);
        return () => {
            mqMobile.removeEventListener("change", apply);
            mqTablet.removeEventListener("change", apply);
        };
    }, []);

    const isDesktop = !isMobile && !isTablet;

    // --- state
    const [baseUnit, setBaseUnit] = useState<BaseUnit>(BASE_UNITS[0]);
    const [fromPrefix, setFromPrefix] = useState<Prefix>(PREFIXES.find((p) => p.symbol === "k")!);
    const [toPrefix, setToPrefix] = useState<Prefix>(PREFIXES.find((p) => p.symbol === "")!);
    const [inputValue, setInputValue] = useState<string>("5");
    const [currentStep, setCurrentStep] = useState<number>(1);

    const parsedInput = useMemo(() => parseInput(inputValue), [inputValue]);
    const deltaExponent = fromPrefix.exponent - toPrefix.exponent;
    const factor = Math.pow(10, deltaExponent);
    const convertedValue = parsedInput !== null ? parsedInput * factor : null;

    const fromUnit = `${fromPrefix.symbol}${baseUnit.symbol}`;
    const toUnit = `${toPrefix.symbol}${baseUnit.symbol}`;

    const direction = deltaExponent > 0 ? "destra" : deltaExponent < 0 ? "sinistra" : null;
    const steps = Math.abs(deltaExponent);

    const handlePrefixChange = (prefix: Prefix, type: "from" | "to") => {
        if (type === "from") setFromPrefix(prefix);
        else setToPrefix(prefix);
        setCurrentStep(1);
    };

    // ============ STILI ============

    const cardStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: 16,
        padding: isMobile ? 12 : 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    };

    const stepStyle = (step: number, active: boolean): React.CSSProperties => ({
        padding: isMobile ? 12 : 16,
        borderRadius: 12,
        border: active ? "2px solid #3b82f6" : "1px solid #e5e7eb",
        background: active ? "#eff6ff" : "#fff",
        opacity: step > currentStep ? 0.5 : 1,
        transition: "all 0.2s",
        cursor: "pointer",
    });

    const prefixBtnStyle = (selected: boolean, color: string): React.CSSProperties => ({
        minWidth: isMobile ? 42 : 44,
        padding: isMobile ? "8px 10px" : "8px 12px",
        borderRadius: 8,
        border: selected ? `2px solid ${color}` : "1px solid #d1d5db",
        background: selected ? `${color}15` : "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: selected ? 600 : 400,
        transition: "all 0.15s",
    });

    const stepsGridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 12 : 16,
        marginTop: 16,
    };

    return (
        <DemoContainer
            title="Conversione unità di misura"
            description="Impara a convertire tra multipli e sottomultipli seguendo una procedura passo-passo."
        >
            {/* Barra dei prefissi visuale */}
            <div style={cardStyle}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Scala dei prefissi</div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        overflowX: "auto",
                        padding: "8px 0",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {PREFIXES.map((p, i) => {
                        const isFrom = p.symbol === fromPrefix.symbol;
                        const isTo = p.symbol === toPrefix.symbol;
                        const isBetween = (() => {
                            const fromIdx = PREFIXES.findIndex((x) => x.symbol === fromPrefix.symbol);
                            const toIdx = PREFIXES.findIndex((x) => x.symbol === toPrefix.symbol);
                            return i > Math.min(fromIdx, toIdx) && i < Math.max(fromIdx, toIdx);
                        })();

                        return (
                            <div key={p.symbol || "unit"} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "0 0 auto" }}>
                                <div
                                    style={{
                                        width: isMobile ? 46 : 50,
                                        height: isMobile ? 46 : 50,
                                        borderRadius: 10,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: isFrom ? "#3b82f6" : isTo ? "#22c55e" : isBetween ? "#fef3c7" : "#f8fafc",
                                        color: isFrom || isTo ? "#fff" : "#374151",
                                        fontWeight: 700,
                                        fontSize: 16,
                                        border: isBetween ? "2px dashed #f59e0b" : "1px solid #e5e7eb",
                                    }}
                                >
                                    <span>{p.symbol || "1"}</span>
                                    <span style={{ fontSize: 9, opacity: 0.85 }}>10{superscript(p.exponent)}</span>
                                </div>
                                <span style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>{p.name}</span>
                            </div>
                        );
                    })}
                </div>

                {direction && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: isMobile ? 10 : 12,
                            background: "#fef3c7",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <span style={{ fontSize: 24 }}>{direction === "destra" ? "→" : "←"}</span>
                        <div style={{ minWidth: 200 }}>
                            <div style={{ fontWeight: 700, color: "#92400e" }}>
                                {steps} {steps === 1 ? "passo" : "passi"} verso {direction}
                            </div>
                            <div style={{ fontSize: 13, color: "#78350f" }}>
                                Da <strong>{fromPrefix.name}</strong> ({fromUnit}) a <strong>{toPrefix.name}</strong> ({toUnit})
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Steps (responsive) */}
            <div style={stepsGridStyle}>
                {/* STEP 1 */}
                <div style={stepStyle(1, currentStep === 1)} onClick={() => setCurrentStep(1)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span
                style={{
                    background: "#3b82f6",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    flex: "0 0 auto",
                }}
            >
              1
            </span>
                        <span style={{ fontWeight: 700 }}>Scegli l&apos;unità di misura</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {BASE_UNITS.map((u) => (
                            <button
                                key={u.symbol}
                                onClick={() => {
                                    setBaseUnit(u);
                                    setCurrentStep(2);
                                }}
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: baseUnit.symbol === u.symbol ? "2px solid #3b82f6" : "1px solid #d1d5db",
                                    background: baseUnit.symbol === u.symbol ? "#dbeafe" : "#fff",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    flex: isMobile ? "1 1 100%" : "0 0 auto",
                                    minWidth: isMobile ? "auto" : 190,
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>
                                    {u.label} ({u.symbol})
                                </div>
                                <div style={{ fontSize: 11, color: "#6b7280" }}>{u.examples}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* STEP 2 */}
                <div style={stepStyle(2, currentStep === 2)} onClick={() => currentStep >= 2 && setCurrentStep(2)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span
                style={{
                    background: currentStep >= 2 ? "#3b82f6" : "#9ca3af",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    flex: "0 0 auto",
                }}
            >
              2
            </span>
                        <span style={{ fontWeight: 700 }}>Prefisso di partenza</span>
                        <span style={{ marginLeft: "auto", background: "#3b82f6", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              {fromUnit}
            </span>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {PREFIXES.map((p) => (
                            <button
                                key={`from-${p.symbol || "unit"}`}
                                onClick={() => {
                                    handlePrefixChange(p, "from");
                                    setCurrentStep(3);
                                }}
                                style={prefixBtnStyle(p.symbol === fromPrefix.symbol, "#3b82f6")}
                                title={`${p.name} = 10${superscript(p.exponent)}`}
                            >
                                {p.symbol || "1"}
                                {baseUnit.symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {/* STEP 3 */}
                <div style={stepStyle(3, currentStep === 3)} onClick={() => currentStep >= 3 && setCurrentStep(3)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span
                style={{
                    background: currentStep >= 3 ? "#22c55e" : "#9ca3af",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    flex: "0 0 auto",
                }}
            >
              3
            </span>
                        <span style={{ fontWeight: 700 }}>Prefisso di arrivo</span>
                        <span style={{ marginLeft: "auto", background: "#22c55e", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              {toUnit}
            </span>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {PREFIXES.map((p) => (
                            <button
                                key={`to-${p.symbol || "unit"}`}
                                onClick={() => {
                                    handlePrefixChange(p, "to");
                                    setCurrentStep(4);
                                }}
                                style={prefixBtnStyle(p.symbol === toPrefix.symbol, "#22c55e")}
                                title={`${p.name} = 10${superscript(p.exponent)}`}
                            >
                                {p.symbol || "1"}
                                {baseUnit.symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {/* STEP 4 */}
                <div style={stepStyle(4, currentStep === 4)} onClick={() => currentStep >= 4 && setCurrentStep(4)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span
                style={{
                    background: currentStep >= 4 ? "#f59e0b" : "#9ca3af",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    flex: "0 0 auto",
                }}
            >
              4
            </span>
                        <span style={{ fontWeight: 700 }}>Inserisci il valore</span>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{
                                padding: "12px 14px",
                                borderRadius: 10,
                                border: "2px solid #f59e0b",
                                fontSize: 18,
                                width: isMobile ? "100%" : 140,
                                textAlign: "right",
                            }}
                            placeholder="0"
                        />
                        <span style={{ fontSize: 18, fontWeight: 800, color: "#3b82f6" }}>{fromUnit}</span>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[1, 10, 100, 0.5, 0.01].map((v) => (
                            <button
                                key={v}
                                onClick={() => setInputValue(String(v))}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    background: "#fff",
                                    cursor: "pointer",
                                    fontSize: 13,
                                }}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risultato */}
            <div style={{ ...cardStyle, marginTop: 16, background: "linear-gradient(135deg, #ecfdf5 0%, #dbeafe 100%)" }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 16, color: "#1e3a8a" }}>📊 Risultato della conversione</div>

                {parsedInput === null ? (
                    <div style={{ color: "#6b7280" }}>Inserisci un valore valido per vedere il risultato.</div>
                ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                        {/* Formula (responsive) */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                flexWrap: "wrap",
                                fontSize: isDesktop ? 22 : 20,
                            }}
                        >
              <span style={{ background: "#3b82f6", color: "#fff", padding: "10px 16px", borderRadius: 10, fontWeight: 800 }}>
                {formatNumber(parsedInput)} {fromUnit}
              </span>
                            <span style={{ fontSize: 24 }}>=</span>
                            <span style={{ background: "#22c55e", color: "#fff", padding: "10px 16px", borderRadius: 10, fontWeight: 800 }}>
                {convertedValue !== null ? formatNumber(convertedValue) : "—"} {toUnit}
              </span>
                        </div>

                        {/* Spiegazione (desktop: 2 colonne) */}
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: 12,
                                padding: isMobile ? 12 : 16,
                                display: "grid",
                                gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                                gap: 12,
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 800, marginBottom: 8 }}>Come si calcola?</div>
                                <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: 6, fontFamily: "monospace" }}>
                      {fromPrefix.name} = 10{superscript(fromPrefix.exponent)}
                    </span>
                                        <span>→</span>
                                        <span style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: 6, fontFamily: "monospace" }}>
                      {toPrefix.name} = 10{superscript(toPrefix.exponent)}
                    </span>
                                    </div>

                                    <div>
                                        <strong>Differenza esponenti:</strong> {fromPrefix.exponent} - ({toPrefix.exponent}) = <strong>{deltaExponent}</strong>
                                    </div>
                                    <div>
                                        <strong>Fattore di conversione:</strong> 10{superscript(deltaExponent)} = {factor.toLocaleString("it-IT")}
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: 12, background: "#fef3c7", borderRadius: 12 }}>
                                {deltaExponent === 0 ? (
                                    <span>I prefissi sono uguali: il valore non cambia!</span>
                                ) : (
                                    <span>
                    <strong>Regola pratica:</strong> sposta la virgola di <strong>{steps} {steps === 1 ? "posto" : "posti"}</strong> verso{" "}
                                        <strong>{direction}</strong>
                                        {deltaExponent > 0 ? " (moltiplichi)" : " (dividi)"}
                  </span>
                                )}
                            </div>
                        </div>

                        {/* Visualizzazione spostamento virgola */}
                        {deltaExponent !== 0 && (
                            <div style={{ background: "#fff", borderRadius: 12, padding: isMobile ? 12 : 16 }}>
                                <div style={{ fontWeight: 800, marginBottom: 12 }}>Visualizza lo spostamento</div>
                                <div
                                    style={{
                                        fontFamily: "monospace",
                                        fontSize: isMobile ? 18 : 24,
                                        letterSpacing: isMobile ? 2 : 4,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <span style={{ color: "#3b82f6", fontWeight: 800 }}>{formatNumber(parsedInput)}</span>
                                    <span style={{ fontSize: 16, color: "#6b7280" }}>
                    {Array(steps)
                        .fill(direction === "destra" ? "→" : "←")
                        .join("")}
                  </span>
                                    <span style={{ color: "#22c55e", fontWeight: 800 }}>{convertedValue !== null ? formatNumber(convertedValue) : "—"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tips */}
            <div style={{ marginTop: 16, background: "#f8fafc", borderRadius: 12, padding: isMobile ? 12 : 16, fontSize: 13 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>💡 Ricorda</div>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
                    <li>
                        Da un prefisso <strong>grande</strong> a uno <strong>piccolo</strong>: il numero aumenta (virgola a destra)
                    </li>
                    <li>
                        Da un prefisso <strong>piccolo</strong> a uno <strong>grande</strong>: il numero diminuisce (virgola a sinistra)
                    </li>
                    <li>
                        Esempio: 1 km = 1000 m (da kilo a unità: 3 passi a destra)
                    </li>
                </ul>
            </div>
        </DemoContainer>
    );
}

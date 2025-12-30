/**
 * NotazioneScientificaDemo - Versione refactorizzata
 * Impara la notazione scientifica con procedura step-by-step
 */

import React, { useMemo, useState } from "react";
import { DemoContainer } from "../../components/ui";

// ============ TIPI E COSTANTI ============

type BaseUnit = { symbol: string; label: string };

const BASE_UNITS: BaseUnit[] = [
    { symbol: "m", label: "metri" },
    { symbol: "g", label: "grammi" },
    { symbol: "s", label: "secondi" },
    { symbol: "N", label: "newton" },
    { symbol: "J", label: "joule" },
];

// ============ UTILITY ============

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

function formatNormal(value: number): string {
    if (!Number.isFinite(value)) return "—";
    const abs = Math.abs(value);

    // Per numeri molto grandi o piccoli, usa formato esteso
    if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) {
        return value
            .toExponential(2)
            .replace("e", " × 10^")
            .replace(".", ",");
    }

    let str = abs.toFixed(6).replace(/\.?0+$/, "");
    let [intPart, fracPart] = str.split(".");
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    let result = fracPart ? `${intPart},${fracPart}` : intPart;
    return value < 0 ? `-${result}` : result;
}

type SciForm = { mantissa: number; exponent: number; mantissaStr: string };

function toScientific(value: number, digits = 3): SciForm {
    if (value === 0) return { mantissa: 0, exponent: 0, mantissaStr: "0" };

    const sign = Math.sign(value);
    const abs = Math.abs(value);
    let exponent = Math.floor(Math.log10(abs));
    let mantissa = abs / Math.pow(10, exponent);

    const factor = Math.pow(10, digits - 1);
    mantissa = Math.round(mantissa * factor) / factor;

    if (mantissa >= 10) {
        mantissa /= 10;
        exponent++;
    }
    mantissa *= sign;

    const mantissaStr = mantissa.toLocaleString("it-IT", {
        maximumFractionDigits: digits - 1,
    });
    return { mantissa, exponent, mantissaStr };
}

function generateRandom(): number {
    const exp = Math.floor(Math.random() * 13) - 6; // -6 to +6
    const mantissa = 1 + Math.random() * 9;
    return mantissa * Math.pow(10, exp);
}

// Esempi predefiniti con contesto
const EXAMPLES = [
    { value: 299792458, context: "Velocità della luce", unit: "m/s" },
    { value: 0.000001, context: "Un micrometro", unit: "m" },
    { value: 6.022e23, context: "Numero di Avogadro", unit: "mol⁻¹" },
    { value: 9.81, context: "Accelerazione di gravità", unit: "m/s²" },
    { value: 0.00000000167, context: "Massa del protone", unit: "kg" },
    { value: 384400000, context: "Distanza Terra-Luna", unit: "m" },
    { value: 0.001, context: "Un millimetro", unit: "m" },
    { value: 1000000, context: "Un chilometro in millimetri", unit: "mm" },
];

// ============ COMPONENTE PRINCIPALE ============

export default function NotazioneScientificaDemo() {
    const [baseUnit, setBaseUnit] = useState<BaseUnit>(BASE_UNITS[0]);
    const [value, setValue] = useState<number>(() => generateRandom());
    const [customUnit, setCustomUnit] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [showHint, setShowHint] = useState<boolean>(false);
    const [userMantissa, setUserMantissa] = useState<string>("");
    const [userExponent, setUserExponent] = useState<string>("");
    const [checked, setChecked] = useState<boolean>(false);

    const scientific = useMemo(() => toScientific(value, 3), [value]);
    const displayUnit = customUnit || baseUnit.symbol;

    // Verifica risposta
    const isCorrect = useMemo(() => {
        if (!checked) return null;
        const mInput = parseFloat(userMantissa.replace(",", "."));
        const eInput = parseInt(userExponent);
        if (isNaN(mInput) || isNaN(eInput)) return false;

        // Tolleranza sulla mantissa
        const mCorrect = Math.abs(mInput - scientific.mantissa) < 0.1;
        const eCorrect = eInput === scientific.exponent;
        return mCorrect && eCorrect;
    }, [checked, userMantissa, userExponent, scientific]);

    const newMeasurement = (val?: number, unit?: string) => {
        setValue(val ?? generateRandom());
        setCustomUnit(unit ?? null);
        setCurrentStep(1);
        setShowHint(false);
        setUserMantissa("");
        setUserExponent("");
        setChecked(false);
    };

    const checkAnswer = () => {
        setChecked(true);
        if (isCorrect) setCurrentStep(4);
    };

    // ============ STILI ============

    const cardStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    };

    const stepBadge = (
        n: number,
        active: boolean,
        done: boolean
    ): React.CSSProperties => ({
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 14,
        background: done ? "#22c55e" : active ? "#3b82f6" : "#e5e7eb",
        color: done || active ? "#fff" : "#6b7280",
    });

    return (
        <DemoContainer
            title="Notazione scientifica"
            description="Impara a convertire numeri in notazione scientifica (a × 10ⁿ) con esercizi interattivi."
        >
            {/* Header con generazione */}
            <div style={cardStyle}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Unità di misura</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {BASE_UNITS.map((u) => (
                                <button
                                    key={u.symbol}
                                    onClick={() => {
                                        setBaseUnit(u);
                                        setCustomUnit(null);
                                    }}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: 8,
                                        border:
                                            baseUnit.symbol === u.symbol && !customUnit
                                                ? "2px solid #3b82f6"
                                                : "1px solid #d1d5db",
                                        background:
                                            baseUnit.symbol === u.symbol && !customUnit
                                                ? "#dbeafe"
                                                : "#fff",
                                        cursor: "pointer",
                                        fontSize: 13,
                                    }}
                                >
                                    {u.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={() => newMeasurement()}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "none",
                                background: "#3b82f6",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            🎲 Numero casuale
                        </button>
                    </div>
                </div>

                {/* Esempi famosi */}
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                        Oppure prova con un esempio famoso:
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {EXAMPLES.slice(0, 4).map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => newMeasurement(ex.value, ex.unit)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    background: "#f8fafc",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    textAlign: "left",
                                }}
                                title={ex.context}
                            >
                                {ex.context}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Numero da convertire */}
            <div
                style={{
                    ...cardStyle,
                    marginTop: 16,
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                }}
            >
                <div style={{ fontWeight: 600, marginBottom: 8, color: "#92400e" }}>
                    📐 Converti in notazione scientifica:
                </div>
                <div
                    style={{
                        fontSize: 32,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "#78350f",
                        letterSpacing: 1,
                    }}
                >
                    {formatNormal(value)} {displayUnit}
                </div>
                <div style={{ fontSize: 13, color: "#92400e", marginTop: 8 }}>
                    Scrivi questo numero nella forma <strong>a × 10ⁿ</strong> dove 1 ≤ |a|{" "}
                    &lt; 10
                </div>
            </div>

            {/* Steps interattivi */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginTop: 16,
                }}
            >
                {/* STEP 1: Trova la mantissa */}
                <div
                    style={{
                        ...cardStyle,
                        border: currentStep === 1 ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <div style={stepBadge(1, currentStep === 1, currentStep > 1)}>1</div>
                        <span style={{ fontWeight: 600 }}>
              Prima cifra (diversa da 0) e poi la virgola
            </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                        Sposta la virgola finché resta <strong>una sola cifra</strong>{" "}
                        (diversa da 0) prima della virgola.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="text"
                            value={userMantissa}
                            onChange={(e) => {
                                setUserMantissa(e.target.value);
                                setChecked(false);
                            }}
                            placeholder="es. 2,99"
                            style={{
                                padding: "10px 14px",
                                borderRadius: 8,
                                border: "2px solid #3b82f6",
                                fontSize: 18,
                                width: 100,
                                textAlign: "center",
                            }}
                        />
                        <span style={{ fontSize: 13, color: "#6b7280" }}>× 10</span>
                    </div>
                    {showHint && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: 10,
                                background: "#eff6ff",
                                borderRadius: 8,
                                fontSize: 12,
                            }}
                        >
                            💡 La mantissa deve essere tra 1 e 10. Es: 123 → 1,23
                        </div>
                    )}
                </div>

                {/* STEP 2: Trova l'esponente */}
                <div
                    style={{
                        ...cardStyle,
                        border: currentStep === 2 ? "2px solid #22c55e" : "1px solid #e5e7eb",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <div style={stepBadge(2, currentStep === 2, currentStep > 2)}>2</div>
                        <span style={{ fontWeight: 600 }}>
              Trova l'esponente della potenza di 10
            </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                        Conta di quanti posti hai spostato la virgola. A{" "}
                        <strong>sinistra</strong> = positivo, a <strong>destra</strong> =
                        negativo.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>10</span>
                        <input
                            type="text"
                            value={userExponent}
                            onChange={(e) => {
                                setUserExponent(e.target.value);
                                setChecked(false);
                            }}
                            placeholder="es. 8"
                            style={{
                                padding: "10px 14px",
                                borderRadius: 8,
                                border: "2px solid #22c55e",
                                fontSize: 18,
                                width: 70,
                                textAlign: "center",
                            }}
                        />
                    </div>
                    {showHint && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: 10,
                                background: "#f0fdf4",
                                borderRadius: 8,
                                fontSize: 12,
                            }}
                        >
                            💡 Numeri grandi → esponente positivo. Numeri piccoli (0,00...) →
                            esponente negativo.
                        </div>
                    )}
                </div>
            </div>

            {/* Controlli verifica */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={checkAnswer}
                    style={{
                        padding: "12px 24px",
                        borderRadius: 8,
                        border: "none",
                        background: "#22c55e",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                    }}
                >
                    ✓ Verifica risposta
                </button>
                <button
                    onClick={() => setShowHint(!showHint)}
                    style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                    }}
                >
                    {showHint ? "Nascondi suggerimenti" : "💡 Mostra suggerimenti"}
                </button>
                <button
                    onClick={() => setCurrentStep(4)}
                    style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                    }}
                >
                    Mostra soluzione
                </button>
            </div>

            {/* Feedback: DEVE STARE SOTTO AI PULSANTI */}
            {checked && (
                <div
                    style={{
                        ...cardStyle,
                        marginTop: 16,
                        background: isCorrect ? "#dcfce7" : "#fef2f2",
                        border: `2px solid ${isCorrect ? "#22c55e" : "#ef4444"}`,
                    }}
                >
                    {isCorrect ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 32 }}>🎉</span>
                            <div>
                                <div style={{ fontWeight: 700, color: "#166534", fontSize: 18 }}>
                                    Corretto!
                                </div>
                                <div style={{ color: "#166534" }}>
                                    {formatNormal(value)} {displayUnit} = {scientific.mantissaStr} ×
                                    10{superscript(scientific.exponent)} {displayUnit}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 32 }}>🤔</span>
                            <div>
                                <div style={{ fontWeight: 700, color: "#991b1b", fontSize: 18 }}>
                                    Non esattamente...
                                </div>
                                <div style={{ color: "#991b1b" }}>
                                    Controlla la tua risposta e riprova!
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Soluzione completa */}
            {currentStep >= 4 && (
                <div style={{ ...cardStyle, marginTop: 16, background: "#f8fafc" }}>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 16,
                            color: "#1e3a8a",
                        }}
                    >
                        📊 Soluzione passo-passo
                    </div>

                    <div style={{ display: "grid", gap: 16 }}>
                        {/* Risultato */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                fontSize: 24,
                                fontFamily: "monospace",
                                flexWrap: "wrap",
                            }}
                        >
              <span style={{ color: "#6b7280" }}>
                {formatNormal(value)} {displayUnit}
              </span>
                            <span>=</span>
                            <span
                                style={{
                                    background: "#22c55e",
                                    color: "#fff",
                                    padding: "8px 16px",
                                    borderRadius: 8,
                                    fontWeight: 700,
                                }}
                            >
                {scientific.mantissaStr} × 10{superscript(scientific.exponent)}{" "}
                                {displayUnit}
              </span>
                        </div>

                        {/* Spiegazione */}
                        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>Come si fa?</div>
                            <div style={{ display: "grid", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span
                      style={{
                          background: "#3b82f6",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          flexShrink: 0,
                      }}
                  >
                    1
                  </span>
                                    <div>
                                        <strong>Isola la prima cifra (diversa da 0):</strong> sposta la
                                        virgola finché il numero è tra 1 e 10 (questo numero si chiama
                                        mantissa)
                                        <div
                                            style={{
                                                fontFamily: "monospace",
                                                background: "#f3f4f6",
                                                padding: "6px 10px",
                                                borderRadius: 6,
                                                marginTop: 4,
                                                display: "inline-block",
                                            }}
                                        >
                                            {formatNormal(value)} → <strong>{scientific.mantissaStr}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span
                      style={{
                          background: "#22c55e",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          flexShrink: 0,
                      }}
                  >
                    2
                  </span>
                                    <div>
                                        <strong>Conta gli spostamenti:</strong> {Math.abs(scientific.exponent)}{" "}
                                        {Math.abs(scientific.exponent) === 1 ? "posto" : "posti"} verso{" "}
                                        {scientific.exponent > 0
                                            ? "sinistra (numero grande)"
                                            : scientific.exponent < 0
                                                ? "destra (numero piccolo)"
                                                : "nessuna direzione"}
                                        .
                                        <div
                                            style={{
                                                fontFamily: "monospace",
                                                background: "#f3f4f6",
                                                padding: "6px 10px",
                                                borderRadius: 6,
                                                marginTop: 4,
                                                display: "inline-block",
                                            }}
                                        >
                                            Esponente = <strong>{scientific.exponent}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span
                      style={{
                          background: "#f59e0b",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          flexShrink: 0,
                      }}
                  >
                    3
                  </span>
                                    <div>
                                        <strong>Scrivi il risultato:</strong> mantissa × 10 elevato
                                        all'esponente.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regola */}
                        <div style={{ background: "#fef3c7", borderRadius: 12, padding: 16 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: "#92400e" }}>
                                📌 Regola pratica
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#78350f" }}>
                                <li>
                                    Numeri <strong>grandi</strong> (≥10): esponente{" "}
                                    <strong>positivo</strong>
                                </li>
                                <li>
                                    Numeri <strong>piccoli</strong> (&lt;1): esponente{" "}
                                    <strong>negativo</strong>
                                </li>
                                <li>La prima cifra è sempre diversa da zero</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Tips */}
            <div
                style={{
                    marginTop: 16,
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 13,
                    color: "#1e40af",
                }}
            >
                <strong>💡 Perché usare la notazione scientifica?</strong>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>
                        È più compatta per numeri molto grandi (es. distanze astronomiche) o
                        piccoli (es. dimensioni atomiche)
                    </li>
                    <li>Mostra immediatamente l'ordine di grandezza</li>
                    <li>Facilita i calcoli con le proprietà delle potenze</li>
                </ul>
            </div>
        </DemoContainer>
    );
}

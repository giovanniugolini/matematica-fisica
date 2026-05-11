/**
 * DerivateElementariDemo – Dimostrazione passo-passo delle derivate
 * delle funzioni elementari dalla definizione (limite del rapporto incrementale)
 */

import React, { useState } from "react";
import {
    DemoContainer,
    DisplayMath,
    Latex,
    MixedLatex,
    useBreakpoint,
    CollapsiblePanel,
} from "../../components/ui";

// ─── Tipi ────────────────────────────────────────────────────────────────────

type FnKey = "costante" | "identita" | "potenza" | "esponenziale" | "logaritmo" | "seno" | "coseno";

type ProofStep = {
    math: string;
    annotation: string;
};

type FnData = {
    nome: string;
    formula: string;
    thNum: string;
    thTitolo: string;
    renderEnunciato: () => React.ReactNode;
    risultato: string;
    steps: ProofStep[];
};

// ─── Dati funzioni ────────────────────────────────────────────────────────────

const FN_KEYS: FnKey[] = [
    "costante", "identita", "potenza", "esponenziale", "logaritmo", "seno", "coseno",
];

const SINTESI: { key: FnKey; fn: string; der: string }[] = [
    { key: "costante",     fn: "c",            der: "0" },
    { key: "identita",     fn: "x",            der: "1" },
    { key: "potenza",      fn: "x^n",          der: "n\\,x^{n-1}" },
    { key: "esponenziale", fn: "a^x",          der: "a^x \\ln a" },
    { key: "logaritmo",    fn: "\\log_a x",    der: "\\dfrac{1}{x \\ln a}" },
    { key: "seno",         fn: "\\sin x",      der: "\\cos x" },
    { key: "coseno",       fn: "\\cos x",      der: "-\\sin x" },
];

const FUNZIONI: Record<FnKey, FnData> = {
    costante: {
        nome: "Costante",
        formula: "f(x)=c",
        thNum: "TEOREMA 5.2",
        thTitolo: "Derivata di una funzione costante",
        renderEnunciato: () => (
            <>
                La funzione <strong>costante</strong>{" "}
                <Latex>{"f(x)=c"}</Latex>, con <Latex>{"c\\in\\mathbb{R}"}</Latex>,
                è derivabile per ogni <Latex>{"x\\in\\mathbb{R}"}</Latex> e la sua
                derivata è la <strong>funzione nulla</strong>:
            </>
        ),
        risultato: "f'(x) = 0",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h)-f(x)}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{c - c}{h}",
                annotation: "$f(x+h)=c$ e $f(x)=c$",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{0}{h}",
                annotation: "Semplificazione al numeratore",
            },
            {
                math: "= \\lim_{h \\to 0} 0 = 0",
                annotation: "Il limite di una costante",
            },
        ],
    },

    identita: {
        nome: "Identità",
        formula: "f(x)=x",
        thNum: "TEOREMA 5.3",
        thTitolo: "Derivata della funzione identica",
        renderEnunciato: () => (
            <>
                La funzione <strong>identica</strong>{" "}
                <Latex>{"f(x)=x"}</Latex> è derivabile per ogni{" "}
                <Latex>{"x\\in\\mathbb{R}"}</Latex> e la sua derivata è la{" "}
                <strong>funzione costante uguale a 1</strong>:
            </>
        ),
        risultato: "f'(x) = 1",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h)-f(x)}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{(x+h) - x}{h}",
                annotation: "$f(x+h)=x+h$,\\; $f(x)=x$",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{h}{h}",
                annotation: "Semplificazione al numeratore",
            },
            {
                math: "= \\lim_{h \\to 0} 1 = 1",
                annotation: "Il limite di una costante",
            },
        ],
    },

    potenza: {
        nome: "Potenza",
        formula: "f(x)=x^n",
        thNum: "TEOREMA 5.4",
        thTitolo: "Derivata di una funzione potenza",
        renderEnunciato: () => (
            <>
                La funzione <strong>potenza</strong>{" "}
                <Latex>{"f(x)=x^n"}</Latex>, con{" "}
                <Latex>{"n\\in\\mathbb{N}"}</Latex> e <Latex>{"n>1"}</Latex>,
                è derivabile per ogni <Latex>{"x\\in\\mathbb{R}"}</Latex> e risulta:
            </>
        ),
        risultato: "f'(x) = n\\,x^{n-1}",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{(x+h)^n - x^n}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{\\displaystyle x^n + nx^{n-1}h + \\tbinom{n}{2}x^{n-2}h^2 + \\cdots + h^n \\;-\\; x^n}{h}",
                annotation: "Binomio di Newton: $(x+h)^n=\\sum_{k=0}^{n}\\binom{n}{k}x^{n-k}h^k$",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{n\\,x^{n-1}h + h^2(\\cdots)}{h}",
                annotation: "$x^n$ si cancella al numeratore",
            },
            {
                math: "= \\lim_{h \\to 0} \\bigl[n\\,x^{n-1} + h(\\cdots)\\bigr]",
                annotation: "Raccogliendo $h$ e semplificando",
            },
            {
                math: "= n\\,x^{n-1}",
                annotation: "Per $h\\to 0$, i termini con $h$ si annullano",
            },
        ],
    },

    esponenziale: {
        nome: "Esponenziale",
        formula: "f(x)=a^x",
        thNum: "TEOREMA 5.6",
        thTitolo: "Derivata della funzione esponenziale",
        renderEnunciato: () => (
            <>
                La funzione <strong>esponenziale</strong>{" "}
                <Latex>{"f(x)=a^x"}</Latex>, con <Latex>{"a>0"}</Latex> e{" "}
                <Latex>{"a\\neq 1"}</Latex>, è derivabile per ogni{" "}
                <Latex>{"x\\in\\mathbb{R}"}</Latex> e la sua derivata è:
            </>
        ),
        risultato: "f'(x) = a^x \\ln a",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{a^{x+h} - a^x}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{a^x \\cdot a^h - a^x}{h}",
                annotation: "Proprietà: $a^{x+h}=a^x\\cdot a^h$",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{a^x\\,(a^h - 1)}{h}",
                annotation: "Raccogliendo $a^x$ al numeratore",
            },
            {
                math: "= a^x \\cdot \\lim_{h \\to 0} \\dfrac{a^h - 1}{h}",
                annotation: "$a^x$ non dipende da $h$, esce dal limite",
            },
            {
                math: "= a^x \\cdot \\ln a",
                annotation: "Limite notevole: $\\lim_{h\\to 0}\\dfrac{a^h-1}{h}=\\ln a$",
            },
        ],
    },

    logaritmo: {
        nome: "Logaritmo",
        formula: "\\log_a x",
        thNum: "TEOREMA 5.7",
        thTitolo: "Derivata della funzione logaritmica",
        renderEnunciato: () => (
            <>
                La funzione <strong>logaritmica</strong>{" "}
                <Latex>{"f(x)=\\log_a x"}</Latex>, con <Latex>{"a>0"}</Latex> e{" "}
                <Latex>{"a\\neq 1"}</Latex>, è derivabile per ogni{" "}
                <Latex>{"x>0"}</Latex> e la sua derivata è:
            </>
        ),
        risultato: "f'(x) = \\dfrac{1}{x\\ln a}",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{\\log_a(x+h)-\\log_a x}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{1}{h}\\log_a\\!\\left(\\dfrac{x+h}{x}\\right)",
                annotation: "Proprietà: $\\log_a A - \\log_a B = \\log_a\\tfrac{A}{B}$",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{1}{h}\\log_a\\!\\left(1+\\dfrac{h}{x}\\right)",
                annotation: "Riscrivendo il rapporto",
            },
            {
                math: "= \\dfrac{1}{x} \\cdot \\lim_{h \\to 0} \\dfrac{\\log_a\\!\\left(1+\\frac{h}{x}\\right)}{\\frac{h}{x}}",
                annotation: "Moltiplicando e dividendo per $\\frac{1}{x}$",
            },
            {
                math: "= \\dfrac{1}{x} \\cdot \\log_a e",
                annotation: "Limite notevole: $\\lim_{t\\to 0}\\dfrac{\\log_a(1+t)}{t}=\\log_a e$, con $t=\\frac{h}{x}$",
            },
            {
                math: "= \\dfrac{1}{x} \\cdot \\dfrac{1}{\\ln a} = \\dfrac{1}{x\\ln a}",
                annotation: "$\\log_a e = \\dfrac{1}{\\ln a}$",
            },
        ],
    },

    seno: {
        nome: "Seno",
        formula: "\\sin x",
        thNum: "TEOREMA 5.8",
        thTitolo: "Derivata della funzione seno",
        renderEnunciato: () => (
            <>
                La funzione <strong>seno</strong>{" "}
                <Latex>{"f(x)=\\sin x"}</Latex> è derivabile per ogni{" "}
                <Latex>{"x\\in\\mathbb{R}"}</Latex> e la sua derivata è la funzione{" "}
                <strong>coseno</strong>:
            </>
        ),
        risultato: "f'(x) = \\cos x",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{\\sin(x+h)-\\sin x}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{\\sin x\\cos h + \\cos x\\sin h - \\sin x}{h}",
                annotation: "Formula di addizione del seno",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{\\sin x(\\cos h - 1) + \\cos x\\sin h}{h}",
                annotation: "Raccogliendo $\\sin x$",
            },
            {
                math: "= \\lim_{h \\to 0} \\left[\\sin x \\cdot \\dfrac{\\cos h-1}{h} + \\cos x \\cdot \\dfrac{\\sin h}{h}\\right]",
                annotation: "Separando in due rapporti",
            },
            {
                math: "= \\sin x \\cdot 0 + \\cos x \\cdot 1",
                annotation: "Limiti notevoli: $\\lim\\tfrac{\\cos h-1}{h}=0$,\\; $\\lim\\tfrac{\\sin h}{h}=1$",
            },
            {
                math: "= \\cos x",
                annotation: "Risultato",
            },
        ],
    },

    coseno: {
        nome: "Coseno",
        formula: "\\cos x",
        thNum: "TEOREMA 5.9",
        thTitolo: "Derivata della funzione coseno",
        renderEnunciato: () => (
            <>
                La funzione <strong>coseno</strong>{" "}
                <Latex>{"f(x)=\\cos x"}</Latex> è derivabile per ogni{" "}
                <Latex>{"x\\in\\mathbb{R}"}</Latex> e la sua derivata è:
            </>
        ),
        risultato: "f'(x) = -\\sin x",
        steps: [
            {
                math: "f'(x) = \\lim_{h \\to 0} \\dfrac{\\cos(x+h)-\\cos x}{h}",
                annotation: "Definizione di derivata",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{\\cos x\\cos h - \\sin x\\sin h - \\cos x}{h}",
                annotation: "Formula di addizione del coseno",
            },
            {
                math: "= \\lim_{h \\to 0} \\dfrac{\\cos x(\\cos h - 1) - \\sin x\\sin h}{h}",
                annotation: "Raccogliendo $\\cos x$",
            },
            {
                math: "= \\lim_{h \\to 0} \\left[\\cos x \\cdot \\dfrac{\\cos h-1}{h} - \\sin x \\cdot \\dfrac{\\sin h}{h}\\right]",
                annotation: "Separando in due rapporti",
            },
            {
                math: "= \\cos x \\cdot 0 - \\sin x \\cdot 1",
                annotation: "Limiti notevoli",
            },
            {
                math: "= -\\sin x",
                annotation: "Risultato",
            },
        ],
    },
};

// ─── Stili helper ─────────────────────────────────────────────────────────────

function btnStyle(
    disabled: boolean,
    variant: "primary" | "secondary" | "green" | "reset"
): React.CSSProperties {
    const base: React.CSSProperties = {
        padding: "7px 14px",
        borderRadius: 6,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        fontSize: 13,
        fontFamily: "system-ui, sans-serif",
        fontWeight: 500,
    };
    if (variant === "primary")
        return { ...base, background: "#0d7070", color: "#fff" };
    if (variant === "secondary")
        return { ...base, background: "#e5e7eb", color: "#374151" };
    if (variant === "green")
        return {
            ...base,
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #86efac",
        };
    return {
        ...base,
        background: "none",
        border: "1px solid #e5e7eb",
        color: "#6b7280",
    };
}

// ─── Componente: tabella di sintesi ───────────────────────────────────────────

function SynthesisTable({ activeKey }: { activeKey: FnKey }) {
    const card: React.CSSProperties = {
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
    };
    const thStyle: React.CSSProperties = {
        padding: "7px 12px",
        textAlign: "left",
        background: "#c2e0e0",
        color: "#0d7070",
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "system-ui, sans-serif",
        borderBottom: "2px solid #0d7070",
    };
    return (
        <div style={card}>
            <div
                style={{
                    background: "#2a2a2a",
                    color: "#fff",
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                Sintesi
            </div>
            <div
                style={{
                    fontSize: 11,
                    color: "#6b7280",
                    padding: "5px 14px",
                    fontStyle: "italic",
                    fontFamily: "system-ui, sans-serif",
                    borderBottom: "1px solid #e5e7eb",
                }}
            >
                Derivate delle funzioni elementari
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>f(x)</th>
                        <th style={thStyle}>f ′(x)</th>
                    </tr>
                </thead>
                <tbody>
                    {SINTESI.map((row) => {
                        const isActive = row.key === activeKey;
                        return (
                            <tr
                                key={row.key}
                                style={{
                                    background: isActive ? "#fffbe6" : "transparent",
                                    transition: "background 0.2s",
                                }}
                            >
                                <td
                                    style={{
                                        padding: "8px 12px",
                                        borderBottom: "1px solid #e5e7eb",
                                        borderLeft: `3px solid ${isActive ? "#e8a020" : "transparent"}`,
                                        fontWeight: isActive ? 700 : 400,
                                    }}
                                >
                                    <Latex>{row.fn}</Latex>
                                </td>
                                <td
                                    style={{
                                        padding: "8px 12px",
                                        borderBottom: "1px solid #e5e7eb",
                                        fontWeight: isActive ? 700 : 400,
                                    }}
                                >
                                    <Latex>{row.der}</Latex>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div
                style={{
                    padding: "10px 12px",
                    background: "#fff8e6",
                    borderTop: "1px solid #f0d090",
                    fontSize: 12,
                    fontFamily: "system-ui, sans-serif",
                    lineHeight: 1.7,
                }}
            >
                <div
                    style={{
                        color: "#b45309",
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 4,
                    }}
                >
                    Casi particolari
                </div>
                <div>
                    <Latex>{"D(x^2) = 2x"}</Latex>
                </div>
                <div>
                    <Latex>{"D(\\sqrt{x}) = \\dfrac{1}{2\\sqrt{x}}"}</Latex>
                </div>
                <div>
                    <Latex>{"D(e^x) = e^x"}</Latex>
                </div>
                <div>
                    <Latex>{"D(\\ln x) = \\dfrac{1}{x}"}</Latex>
                </div>
            </div>
        </div>
    );
}

// ─── Componente: area dimostrazione ──────────────────────────────────────────

function ProofArea({ fn }: { fn: FnData }) {
    const totalSteps = fn.steps.length;
    const [visibleCount, setVisibleCount] = useState(0);

    const handleNext = () =>
        setVisibleCount((v) => Math.min(v + 1, totalSteps));
    const handlePrev = () => setVisibleCount((v) => Math.max(v - 1, 0));
    const handleShowAll = () => setVisibleCount(totalSteps);
    const handleReset = () => setVisibleCount(0);

    const card: React.CSSProperties = {
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
        marginBottom: 16,
    };

    return (
        <div>
            {/* ── TEOREMA ── */}
            <div style={card}>
                <div
                    style={{
                        background: "#0d7070",
                        color: "#fff",
                        padding: "9px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {fn.thTitolo}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            background: "rgba(255,255,255,0.2)",
                            padding: "2px 8px",
                            borderRadius: 3,
                            letterSpacing: "0.05em",
                        }}
                    >
                        {fn.thNum}
                    </span>
                </div>
                <div
                    style={{
                        padding: "14px 18px",
                        background: "#e6f4f4",
                        fontSize: 14,
                        lineHeight: 1.75,
                    }}
                >
                    {fn.renderEnunciato()}
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                        <DisplayMath>{fn.risultato}</DisplayMath>
                    </div>
                </div>
            </div>

            {/* ── DIMOSTRAZIONE ── */}
            <div style={card}>
                <div
                    style={{
                        background: "#2a2a2a",
                        color: "#fff",
                        padding: "7px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    Dimostrazione
                </div>

                <div style={{ padding: "16px 20px 14px", background: "#fff" }}>
                    {/* Intro */}
                    <div
                        style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            marginBottom: 14,
                            fontFamily: "system-ui, sans-serif",
                        }}
                    >
                        In base alla definizione, per ogni{" "}
                        <Latex>{"x\\in\\mathbb{R}"}</Latex>:
                    </div>

                    {/* Barra di avanzamento */}
                    <div
                        style={{
                            height: 4,
                            background: "#e5e7eb",
                            borderRadius: 2,
                            marginBottom: 16,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                background: "#e8a020",
                                borderRadius: 2,
                                width: `${(visibleCount / totalSteps) * 100}%`,
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>

                    {/* Navigazione – posizionata sopra i passi */}
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 16,
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={handlePrev}
                            disabled={visibleCount === 0}
                            style={btnStyle(visibleCount === 0, "secondary")}
                        >
                            ← Indietro
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={visibleCount === totalSteps}
                            style={btnStyle(visibleCount === totalSteps, "primary")}
                        >
                            Avanti →
                        </button>
                        <button
                            onClick={handleShowAll}
                            disabled={visibleCount === totalSteps}
                            style={btnStyle(visibleCount === totalSteps, "green")}
                        >
                            Mostra tutto
                        </button>
                        <span style={{ flex: 1 }} />
                        <span
                            style={{
                                fontSize: 12,
                                color: "#9ca3af",
                                fontFamily: "system-ui, sans-serif",
                            }}
                        >
                            {visibleCount} / {totalSteps}
                        </span>
                        <button
                            onClick={handleReset}
                            style={btnStyle(false, "reset")}
                        >
                            ↺ Ricomincia
                        </button>
                    </div>

                    {/* Passi */}
                    <div style={{ minHeight: 180 }}>
                        {fn.steps.map((step, i) => {
                            if (i >= visibleCount) return null;
                            const isCurrent = i === visibleCount - 1;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        padding: "10px 12px",
                                        borderRadius: 6,
                                        marginBottom: 4,
                                        background: isCurrent ? "#fffbe6" : "#f8fafc",
                                        borderLeft: `3px solid ${isCurrent ? "#e8a020" : "transparent"}`,
                                        opacity: isCurrent ? 1 : 0.72,
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div style={{ flex: 1, overflowX: "auto" }}>
                                        <DisplayMath>{step.math}</DisplayMath>
                                    </div>
                                    {step.annotation && (
                                        <div
                                            style={{
                                                width: 175,
                                                flexShrink: 0,
                                                fontSize: 12,
                                                color: "#1a5fa8",
                                                fontStyle: "italic",
                                                fontFamily: "system-ui, sans-serif",
                                                borderLeft: "2px solid #bfdbfe",
                                                paddingLeft: 8,
                                                paddingTop: 4,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            <MixedLatex>{step.annotation}</MixedLatex>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Badge completamento */}
                    {visibleCount === totalSteps && (
                        <div
                            style={{
                                background: "#f0fdfa",
                                border: "1px solid #5eead4",
                                borderRadius: 6,
                                padding: "9px 14px",
                                fontSize: 13,
                                color: "#0f766e",
                                textAlign: "center",
                                marginTop: 10,
                                fontFamily: "system-ui, sans-serif",
                            }}
                        >
                            ✓ Dimostrazione completata —{" "}
                            <Latex>{fn.risultato}</Latex>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Componente principale ────────────────────────────────────────────────────

export default function DerivateElementariDemo() {
    const { isMobile } = useBreakpoint();

    const [selectedKey, setSelectedKey] = useState<FnKey>("costante");

    const fn = FUNZIONI[selectedKey];

    return (
        <DemoContainer
            title="2. Derivate delle funzioni elementari"
            description="Scegli una funzione e segui la dimostrazione passo-passo dalla definizione."
            maxWidth={1100}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "170px 1fr 240px",
                    gap: 16,
                    alignItems: "start",
                }}
            >
                {/* ── Selettore funzione ── */}
                <div>
                    <div
                        style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: 8,
                        }}
                    >
                        Funzione
                    </div>

                    {isMobile ? (
                        // Mobile: pulsanti orizzontali a scorrimento
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                overflowX: "auto",
                                paddingBottom: 6,
                                marginBottom: 12,
                            }}
                        >
                            {FN_KEYS.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedKey(key)}
                                    style={{
                                        flexShrink: 0,
                                        padding: "7px 12px",
                                        borderRadius: 6,
                                        border: "none",
                                        background:
                                            selectedKey === key
                                                ? "#0d7070"
                                                : "#e6f4f4",
                                        color:
                                            selectedKey === key
                                                ? "#fff"
                                                : "#0f766e",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        fontFamily: "system-ui, sans-serif",
                                        fontWeight:
                                            selectedKey === key ? 700 : 400,
                                    }}
                                >
                                    {FUNZIONI[key].nome}
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Desktop: pulsanti verticali
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {FN_KEYS.map((key) => {
                                const isActive = selectedKey === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedKey(key)}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "10px 14px",
                                            borderRadius: 6,
                                            border: "none",
                                            background: isActive
                                                ? "#0d7070"
                                                : "#f0fdfa",
                                            color: isActive ? "#fff" : "#0f766e",
                                            cursor: "pointer",
                                            fontFamily: "system-ui, sans-serif",
                                            fontSize: 13,
                                            fontWeight: isActive ? 700 : 400,
                                            borderLeft: `3px solid ${isActive ? "#e8a020" : "transparent"}`,
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        {FUNZIONI[key].nome}
                                        <span
                                            style={{
                                                display: "block",
                                                fontSize: 12,
                                                opacity: 0.8,
                                                marginTop: 2,
                                            }}
                                        >
                                            <Latex>{FUNZIONI[key].formula}</Latex>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Area dimostrazione (key forza il reset quando cambia funzione) ── */}
                <ProofArea key={selectedKey} fn={fn} />

                {/* ── Sintesi ── */}
                {isMobile ? (
                    <CollapsiblePanel title="Sintesi — Derivate elementari" defaultOpen={false}>
                        <SynthesisTable activeKey={selectedKey} />
                    </CollapsiblePanel>
                ) : (
                    <div style={{ position: "sticky", top: 16 }}>
                        <SynthesisTable activeKey={selectedKey} />
                    </div>
                )}
            </div>
        </DemoContainer>
    );
}

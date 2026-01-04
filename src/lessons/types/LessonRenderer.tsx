/**
 * LessonRenderer - Componente che renderizza una lezione da JSON
 * Supporta modalità documento e presentazione
 */

import React, { useState, Suspense, lazy, useEffect, useCallback } from "react";
import {
    Lezione,
    Blocco,
    BloccoTesto,
    BloccoTitolo,
    BloccoFormula,
    BloccoDefinizione,
    BloccoTeorema,
    BloccoEsempio,
    BloccoNota,
    BloccoElenco,
    BloccoImmagine,
    BloccoVideo,
    BloccoDemo,
    BloccoQuiz,
    BloccoStepByStep,
    BloccoCallout,
    BloccoTabella,
    SezioneLezione,
    OpzioneQuiz,
    StepItem,
    Risorsa,
    NotaVariante,
    CalloutVariante,
    TitoloLivello,
    BloccoSequenza,
    SequenzaStep,
} from "./schema";
import { Latex } from "../../components/ui/Latex";
import { AssetManager } from "../../assets";


// ============================================================================
// PUBLIC URL HELPERS (GitHub Pages / basename safe)
// ============================================================================

const publicUrl = process.env.PUBLIC_URL || "";

function resolvePublicSrc(src: string): string {
    // URL esterni: lascia invariato
    if (/^https?:\/\//.test(src)) return src;

    // già prefissato correttamente
    if (publicUrl && src.startsWith(publicUrl)) return src;

    // path assoluto "/images/..." -> "/<PUBLIC_URL>/images/..."
    if (src.startsWith("/")) return `${publicUrl}${src}`;

    // path relativo "images/..." -> "/<PUBLIC_URL>/images/..."
    return `${publicUrl}/${src}`;
}



// ============================================================================
// DEMO LOADER
// ============================================================================

const demoComponents: Record<
    string,
    React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>
> = {
    ComponentiCartesianeVettoreDemo: lazy(
        () => import("../../demos/vettori-piano/ComponentiCartesianeVettoreDemo")
    ),
    VectorTailToHeadPage: lazy(
        () => import("../../demos/vettori-piano/VectorTailToHeadPage")
    ),
    VettorePerScalare: lazy(() => import("../../demos/vettori-piano/VettorePerScalare")),
    DisequazioniSecondoGradoDemo: lazy(
        () => import("../../demos/disequazioni/DisequazioniSecondoGradoDemo")
    ),
    SistemiDisequazioniDemo: lazy(
        () => import("../../demos/disequazioni/SistemiDisequazioniDemo")
    ),
};

// ============================================================================
// TIPI STILE LAVAGNA
// ============================================================================

export type BoardStyle = "white" | "green" | "dark";

interface BoardTheme {
    bg: string;
    text: string;
    border: string;
    shadow: string;
    accent: string;
    secondaryBg: string;
}

const boardThemes: Record<BoardStyle, BoardTheme> = {
    white: {
        bg: "#ffffff",
        text: "#1f2937",
        border: "#e5e7eb",
        shadow: "0 4px 20px rgba(0,0,0,0.08)",
        accent: "#3b82f6",
        secondaryBg: "#f8fafc",
    },
    green: {
        bg: "#1a4d2e",
        text: "#f0fdf4",
        border: "#2d5a3d",
        shadow: "0 4px 20px rgba(0,0,0,0.3)",
        accent: "#86efac",
        secondaryBg: "#15803d",
    },
    dark: {
        bg: "#1e293b",
        text: "#f1f5f9",
        border: "#334155",
        shadow: "0 4px 20px rgba(0,0,0,0.4)",
        accent: "#60a5fa",
        secondaryBg: "#0f172a",
    },
};

// ============================================================================
// HELPERS
// ============================================================================

function renderTesto(testo: string, textColor?: string): React.ReactNode {
    const parts = testo.split(/(\$[^$]+\$)/g);

    return parts.map((part: string, i: number) => {
        if (part.startsWith("$") && part.endsWith("$")) {
            const latex = part.slice(1, -1);
            return <Latex key={i}>{latex}</Latex>;
        }

        const html = part
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")
            .replace(/`([^`]+)`/g, "<code>$1</code>");

        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ color: textColor }} />;
    });
}

/** Estrae video ID da URL YouTube o Vimeo */
function getVideoEmbedUrl(src: string): { type: "youtube" | "vimeo" | "file"; url: string } {
    // YouTube
    const ytMatch = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return { type: "youtube", url: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Vimeo
    const vimeoMatch = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
        return { type: "vimeo", url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // File locale o altro URL
    return { type: "file", url: src };
}

// ============================================================================
// BLOCCHI
// ============================================================================

function TestoBlock({ blocco }: { blocco: BloccoTesto }): React.ReactElement {
    return (
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#374151", marginBottom: 16 }}>
            {renderTesto(blocco.contenuto)}
        </p>
    );
}

function TitoloBlock({ blocco }: { blocco: BloccoTitolo }): React.ReactElement {
    const sizes: Record<TitoloLivello, number> = { 2: 24, 3: 20, 4: 18 };
    const margins: Record<TitoloLivello, string> = {
        2: "32px 0 16px",
        3: "24px 0 12px",
        4: "20px 0 10px",
    };

    const livello: TitoloLivello = blocco.livello;

    const style: React.CSSProperties = {
        fontSize: sizes[livello],
        fontWeight: 600,
        color: "#111827",
        margin: margins[livello],
    };

    if (livello === 2) return <h2 style={style}>{blocco.testo}</h2>;
    if (livello === 3) return <h3 style={style}>{blocco.testo}</h3>;
    return <h4 style={style}>{blocco.testo}</h4>;
}

function FormulaBlock({ blocco }: { blocco: BloccoFormula }): React.ReactElement {
    return (
        <div
            style={{
                margin: blocco.display ? "24px 0" : "8px 0",
                textAlign: blocco.display ? "center" : "left",
            }}
        >
            <Latex display={blocco.display}>{blocco.latex}</Latex>
            {blocco.etichetta && (
                <span style={{ float: "right", color: "#6b7280", fontSize: 14 }}>
                    {blocco.etichetta}
                </span>
            )}
            {blocco.descrizione && (
                <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginTop: 8 }}>
                    {blocco.descrizione}
                </p>
            )}
        </div>
    );
}

function DefinizioneBlock({ blocco }: { blocco: BloccoDefinizione }): React.ReactElement {
    return (
        <div
            style={{
                background: "#eff6ff",
                borderLeft: "4px solid #3b82f6",
                borderRadius: "0 8px 8px 0",
                padding: 16,
                margin: "20px 0",
            }}
        >
            <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 8, fontSize: 15 }}>
                📘 Definizione: {blocco.termine}
            </div>
            <div style={{ color: "#1e40af", lineHeight: 1.6 }}>
                {renderTesto(blocco.definizione)}
            </div>
            {blocco.nota && (
                <div style={{ fontSize: 13, color: "#3b82f6", marginTop: 8, fontStyle: "italic" }}>
                    {blocco.nota}
                </div>
            )}
        </div>
    );
}

function TeoremaBlock({ blocco }: { blocco: BloccoTeorema }): React.ReactElement {
    const [showDim, setShowDim] = useState(false);

    return (
        <div
            style={{
                background: "#fef3c7",
                borderLeft: "4px solid #f59e0b",
                borderRadius: "0 8px 8px 0",
                padding: 16,
                margin: "20px 0",
            }}
        >
            <div style={{ fontWeight: 600, color: "#92400e", marginBottom: 8, fontSize: 15 }}>
                📐 {blocco.nome || "Teorema"}
            </div>
            <div style={{ color: "#78350f", lineHeight: 1.6 }}>{renderTesto(blocco.enunciato)}</div>
            {blocco.dimostrazione && (
                <>
                    <button
                        onClick={() => setShowDim(!showDim)}
                        style={{
                            marginTop: 12,
                            padding: "6px 12px",
                            fontSize: 13,
                            background: "#fef3c7",
                            border: "1px solid #f59e0b",
                            borderRadius: 6,
                            cursor: "pointer",
                            color: "#92400e",
                        }}
                    >
                        {showDim ? "▼ Nascondi dimostrazione" : "▶ Mostra dimostrazione"}
                    </button>
                    {showDim && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: 12,
                                background: "#fffbeb",
                                borderRadius: 6,
                                fontSize: 14,
                                lineHeight: 1.6,
                            }}
                        >
                            {renderTesto(blocco.dimostrazione)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function EsempioBlock({ blocco }: { blocco: BloccoEsempio }): React.ReactElement {
    const [showSol, setShowSol] = useState(false);

    return (
        <div
            style={{
                background: "#f0fdf4",
                borderLeft: "4px solid #22c55e",
                borderRadius: "0 8px 8px 0",
                padding: 16,
                margin: "20px 0",
            }}
        >
            <div style={{ fontWeight: 600, color: "#166534", marginBottom: 8, fontSize: 15 }}>
                ✏️ {blocco.titolo || "Esempio"}
            </div>
            <div style={{ color: "#14532d", lineHeight: 1.6, marginBottom: 12 }}>
                <strong>Problema:</strong> {renderTesto(blocco.problema)}
            </div>
            <button
                onClick={() => setShowSol(!showSol)}
                style={{
                    padding: "8px 16px",
                    fontSize: 14,
                    background: showSol ? "#dcfce7" : "#22c55e",
                    color: showSol ? "#166534" : "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500,
                }}
            >
                {showSol ? "▼ Nascondi soluzione" : "▶ Mostra soluzione"}
            </button>
            {showSol && (
                <div
                    style={{
                        marginTop: 12,
                        padding: 12,
                        background: "#dcfce7",
                        borderRadius: 6,
                        lineHeight: 1.7,
                    }}
                >
                    <strong>Soluzione:</strong>
                    <div style={{ marginTop: 8 }}>
                        {blocco.soluzione.split("\n\n").map((p: string, i: number) => (
                            <p key={i} style={{ marginBottom: 8 }}>
                                {renderTesto(p)}
                            </p>
                        ))}
                    </div>
                    {blocco.nota && (
                        <div
                            style={{
                                fontSize: 13,
                                color: "#15803d",
                                marginTop: 8,
                                fontStyle: "italic",
                                borderTop: "1px solid #86efac",
                                paddingTop: 8,
                            }}
                        >
                            💡 {blocco.nota}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotaBlock({ blocco }: { blocco: BloccoNota }): React.ReactElement {
    const stili: Record<NotaVariante, { bg: string; border: string; icon: string; color: string }> = {
        info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️", color: "#1e40af" },
        attenzione: { bg: "#fef2f2", border: "#ef4444", icon: "⚠️", color: "#991b1b" },
        suggerimento: { bg: "#f0fdf4", border: "#22c55e", icon: "💡", color: "#166534" },
        ricorda: { bg: "#fefce8", border: "#eab308", icon: "📌", color: "#854d0e" },
    };
    const s = stili[blocco.variante];

    return (
        <div
            style={{
                background: s.bg,
                borderLeft: `4px solid ${s.border}`,
                borderRadius: "0 8px 8px 0",
                padding: "12px 16px",
                margin: "16px 0",
                color: s.color,
                fontSize: 14,
                lineHeight: 1.6,
            }}
        >
            {s.icon} {renderTesto(blocco.contenuto)}
        </div>
    );
}

function ElencoBlock({ blocco }: { blocco: BloccoElenco }): React.ReactElement {
    const items = blocco.elementi.map((el: string, i: number) => (
        <li key={i} style={{ marginBottom: 6 }}>
            {renderTesto(el)}
        </li>
    ));

    return blocco.ordinato ? (
        <ol style={{ margin: "16px 0", paddingLeft: 24, lineHeight: 1.7 }}>{items}</ol>
    ) : (
        <ul style={{ margin: "16px 0", paddingLeft: 24, lineHeight: 1.7 }}>{items}</ul>
    );
}

/** ✅ NUOVO: Blocco Immagine */
function ImmagineBlock({ blocco }: { blocco: BloccoImmagine }): React.ReactElement {
    console.log("🎯 ImmagineBlock ricevuto:", JSON.stringify(blocco, null, 2));

    let imageUrl: string | null = null;

    // 1. Cerca assetId prima
    if (blocco.assetId) {
        imageUrl = AssetManager.getUrl(blocco.assetId);
    }
    // 2. Se non c'è assetId, usa src
    else if (blocco.src) {
        imageUrl = resolvePublicSrc(blocco.src);
    }

    // 3. Se nessuno dei due, mostra errore
    if (!imageUrl) {
        return (
            <div style={{
                padding: 20,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#991b1b",
                margin: "20px 0",
            }}>
                ⚠️ Image source is missing. Please provide either src or assetId.
                {blocco.assetId && ` (assetId: ${blocco.assetId} not found)`}
            </div>
        );
    }

    return (
        <figure style={{ margin: "24px 0", textAlign: "center" }}>
            <img
                src={imageUrl}
                alt={blocco.alt}
                style={{
                    maxWidth: blocco.larghezza ? `${blocco.larghezza}%` : "100%",
                    height: "auto",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
            />
            {blocco.didascalia && (
                <figcaption style={{ marginTop: 8, fontSize: 14, color: "#6b7280", fontStyle: "italic" }}>
                    {blocco.didascalia}
                </figcaption>
            )}
        </figure>
    );
}

/** ✅ NUOVO: Blocco Video */
function VideoBlock({ blocco }: { blocco: BloccoVideo }): React.ReactElement {
    let videoUrl: string | null = null;

    // 1. Cerca assetId prima
    if (blocco.assetId) {
        videoUrl = AssetManager.getUrl(blocco.assetId);
    }
    // 2. Se non c'è assetId, usa src
    else if (blocco.src) {
        videoUrl = resolvePublicSrc(blocco.src);
    }

    // 3. Se nessuno dei due, mostra errore
    if (!videoUrl) {
        return (
            <div style={{
                padding: 20,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#991b1b",
                margin: "20px 0",
            }}>
                ⚠️ Video source is missing. Please provide either src or assetId.
                {blocco.assetId && ` (assetId: ${blocco.assetId} not found)`}
            </div>
        );
    }

    const { type, url } = getVideoEmbedUrl(videoUrl);
    const width = blocco.larghezza ?? 100;
    const height = blocco.altezza ?? 400;

    return (
        <figure style={{ margin: "24px 0", textAlign: "center" }}>
            {blocco.titolo && (
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16, color: "#374151" }}>
                    🎬 {blocco.titolo}
                </div>
            )}
            <div
                style={{
                    maxWidth: `${width}%`,
                    margin: "0 auto",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
            >
                {type === "file" ? (
                    <video
                        src={url}
                        controls
                        autoPlay={blocco.autoplay}
                        style={{ width: "100%", display: "block" }}
                    />
                ) : (
                    <iframe
                        src={url + (blocco.autoplay ? "?autoplay=1" : "")}
                        width="100%"
                        height={height}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={blocco.titolo || "Video"}
                        style={{ display: "block" }}
                    />
                )}
            </div>
            {blocco.didascalia && (
                <figcaption style={{ marginTop: 8, fontSize: 14, color: "#6b7280", fontStyle: "italic" }}>
                    {blocco.didascalia}
                </figcaption>
            )}
        </figure>
    );
}

function DemoBlock({ blocco }: { blocco: BloccoDemo }): React.ReactElement {
    const DemoComponent = demoComponents[blocco.componente];

    if (!DemoComponent) {
        return (
            <div
                style={{
                    padding: 20,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#991b1b",
                    margin: "20px 0",
                }}
            >
                ⚠️ Demo non trovata: <code>{blocco.componente}</code>
            </div>
        );
    }

    return (
        <div style={{ margin: "24px 0" }}>
            {blocco.titolo && (
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                    🎮 {blocco.titolo}
                </h4>
            )}
            {blocco.descrizione && (
                <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                    {blocco.descrizione}
                </p>
            )}
            <div
                style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#fff",
                }}
            >
                <Suspense
                    fallback={
                        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
                            Caricamento demo...
                        </div>
                    }
                >
                    <DemoComponent {...(blocco.props || {})} />
                </Suspense>
            </div>
        </div>
    );
}

function QuizBlock({ blocco }: { blocco: BloccoQuiz }): React.ReactElement {
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (idx: number) => {
        if (showResult) return;
        setSelected(idx);
    };

    const handleVerifica = () => {
        if (selected !== null) setShowResult(true);
    };

    const isCorrect = selected !== null && blocco.opzioni[selected].corretta;

    return (
        <div
            style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 20,
                margin: "24px 0",
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                ❓ {renderTesto(blocco.domanda)}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
                {blocco.opzioni.map((opt: OpzioneQuiz, i: number) => {
                    let bg = "#fff";
                    let border = "1px solid #d1d5db";
                    let color = "#374151";

                    if (showResult) {
                        if (opt.corretta) {
                            bg = "#dcfce7";
                            border = "2px solid #22c55e";
                            color = "#166534";
                        } else if (i === selected && !opt.corretta) {
                            bg = "#fee2e2";
                            border = "2px solid #ef4444";
                            color = "#991b1b";
                        }
                    } else if (i === selected) {
                        bg = "#dbeafe";
                        border = "2px solid #3b82f6";
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={showResult}
                            style={{
                                padding: "12px 16px",
                                background: bg,
                                border,
                                borderRadius: 8,
                                textAlign: "left",
                                cursor: showResult ? "default" : "pointer",
                                color,
                                fontSize: 14,
                                transition: "all 0.2s",
                            }}
                        >
                            <span style={{ fontWeight: 600, marginRight: 8 }}>
                                {String.fromCharCode(65 + i)}.
                            </span>
                            {renderTesto(opt.testo)}
                        </button>
                    );
                })}
            </div>

            {!showResult && (
                <button
                    onClick={handleVerifica}
                    disabled={selected === null}
                    style={{
                        marginTop: 16,
                        padding: "10px 20px",
                        background: selected === null ? "#e5e7eb" : "#3b82f6",
                        color: selected === null ? "#9ca3af" : "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: selected === null ? "not-allowed" : "pointer",
                        fontWeight: 500,
                    }}
                >
                    Verifica risposta
                </button>
            )}

            {showResult && (
                <div
                    style={{
                        marginTop: 16,
                        padding: 12,
                        background: isCorrect ? "#dcfce7" : "#fee2e2",
                        borderRadius: 8,
                        color: isCorrect ? "#166534" : "#991b1b",
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                        {isCorrect ? "✅ Corretto!" : "❌ Non corretto"}
                    </div>
                    <div style={{ fontSize: 14 }}>{renderTesto(blocco.spiegazione)}</div>
                </div>
            )}
        </div>
    );
}

function StepByStepBlock({ blocco }: { blocco: BloccoStepByStep }): React.ReactElement {
    const [currentStep, setCurrentStep] = useState(0);
    const [showAll, setShowAll] = useState(false);

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 20,
                margin: "24px 0",
            }}
        >
            {blocco.titolo && (
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#374151" }}>
                    📋 {blocco.titolo}
                </h4>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {blocco.step.map((_: StepItem, i: number) => (
                    <button
                        key={i}
                        onClick={() => {
                            setCurrentStep(i);
                            setShowAll(false);
                        }}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "none",
                            background: showAll || i <= currentStep ? "#3b82f6" : "#e5e7eb",
                            color: showAll || i <= currentStep ? "white" : "#6b7280",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => setShowAll(!showAll)}
                    style={{
                        padding: "0 12px",
                        height: 32,
                        borderRadius: 16,
                        border: "1px solid #d1d5db",
                        background: showAll ? "#dbeafe" : "#fff",
                        fontSize: 13,
                        cursor: "pointer",
                    }}
                >
                    {showAll ? "Nascondi" : "Mostra tutti"}
                </button>
            </div>

            {showAll ? (
                blocco.step.map((step: StepItem, i: number) => (
                    <div
                        key={i}
                        style={{
                            marginBottom: 16,
                            paddingBottom: 16,
                            borderBottom: i < blocco.step.length - 1 ? "1px solid #e5e7eb" : "none",
                        }}
                    >
                        <div style={{ fontWeight: 600, color: "#3b82f6", marginBottom: 8 }}>
                            Step {i + 1}: {step.titolo}
                        </div>
                        <div style={{ lineHeight: 1.7 }}>{renderTesto(step.contenuto)}</div>
                    </div>
                ))
            ) : (
                <div>
                    <div style={{ fontWeight: 600, color: "#3b82f6", marginBottom: 8 }}>
                        Step {currentStep + 1}: {blocco.step[currentStep].titolo}
                    </div>
                    <div style={{ lineHeight: 1.7 }}>{renderTesto(blocco.step[currentStep].contenuto)}</div>

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 6,
                                border: "1px solid #d1d5db",
                                background: currentStep === 0 ? "#f3f4f6" : "#fff",
                                cursor: currentStep === 0 ? "not-allowed" : "pointer",
                            }}
                        >
                            ← Indietro
                        </button>
                        <button
                            onClick={() => setCurrentStep(Math.min(blocco.step.length - 1, currentStep + 1))}
                            disabled={currentStep === blocco.step.length - 1}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 6,
                                border: "none",
                                background: currentStep === blocco.step.length - 1 ? "#e5e7eb" : "#3b82f6",
                                color: currentStep === blocco.step.length - 1 ? "#9ca3af" : "white",
                                cursor: currentStep === blocco.step.length - 1 ? "not-allowed" : "pointer",
                            }}
                        >
                            Avanti →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CalloutBlock({ blocco }: { blocco: BloccoCallout }): React.ReactElement {
    const stili: Record<CalloutVariante, { bg: string; border: string; icon: string; title: string }> = {
        obiettivo: { bg: "#fdf4ff", border: "#a855f7", icon: "🎯", title: "Obiettivi" },
        prerequisiti: { bg: "#fff7ed", border: "#f97316", icon: "📚", title: "Prerequisiti" },
        materiali: { bg: "#f0fdfa", border: "#14b8a6", icon: "🛠️", title: "Materiali" },
        tempo: { bg: "#fefce8", border: "#eab308", icon: "⏱️", title: "Tempo stimato" },
    };
    const s = stili[blocco.variante];

    return (
        <div
            style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: 16, margin: "16px 0" }}
        >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {s.icon} {blocco.titolo || s.title}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{renderTesto(blocco.contenuto)}</div>
        </div>
    );
}

function SeparatoreBlock(): React.ReactElement {
    return <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />;
}

function TabellaBlock({ blocco }: { blocco: BloccoTabella }): React.ReactElement {
    return (
        <div style={{ margin: "20px 0", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                <tr style={{ background: "#f3f4f6" }}>
                    {blocco.intestazione.map((h: string, i: number) => (
                        <th
                            key={i}
                            style={{
                                padding: "10px 12px",
                                borderBottom: "2px solid #d1d5db",
                                textAlign: "left",
                                fontWeight: 600,
                            }}
                        >
                            {renderTesto(h)}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {blocco.righe.map((riga: string[], i: number) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                        {riga.map((cella: string, j: number) => (
                            <td key={j} style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb" }}>
                                {renderTesto(cella)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
            {blocco.didascalia && (
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, textAlign: "center" }}>
                    {blocco.didascalia}
                </p>
            )}
        </div>
    );
}

// ============================================================================
// SEQUENZA A STEP
// ============================================================================

function SequenzaBlock({ blocco }: { blocco: BloccoSequenza }): React.ReactElement {
    const steps = blocco.steps || [];
    const total = steps.length;

    const safeStart = Math.min(Math.max(blocco.startAt ?? 0, 0), Math.max(0, total - 1));
    const [idx, setIdx] = useState(safeStart);
    const [frag, setFrag] = useState(0);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        setFrag(0);
        setAnimKey((k) => k + 1);
    }, [idx]);

    const canPrev = idx > 0;
    const canNext = idx < total - 1;
    const allowJump = blocco.allowJump ?? true;
    const showProgress = blocco.showProgress ?? true;
    const current: SequenzaStep | undefined = steps[idx];


    // --- Transizioni interne (frammenti) ---
    const rawTransitions = (current?.transitions ?? []).slice();
    const len = current?.blocchi?.length ?? 0;
    const boundaries = Array.from(
        new Set(
            rawTransitions
                .map((n) => Math.trunc(n))
                .filter((n) => Number.isFinite(n) && n >= 0 && n <= len)
                .sort((a, b) => a - b)
        )
    );
    // aggiungo sempre il boundary finale (=len) per arrivare alla visibilità completa
    if (!boundaries.includes(len)) boundaries.push(len);
    const totalFragments = Math.max(1, boundaries.length);
    const safeFrag = Math.min(Math.max(frag, 0), totalFragments - 1);
    const visibleCount = boundaries[safeFrag] ?? len;
    const visibleBlocchi = (current?.blocchi ?? []).slice(0, visibleCount);

    const canPrevFrag = safeFrag > 0;
    const canNextFrag = safeFrag < totalFragments - 1;

    if (total === 0) {
        return (
            <div style={{ padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
                ⚠️ Sequenza vuota
            </div>
        );
    }

    return (
        <div style={{ margin: "24px 0" }}>
            <div
                style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    background: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                            {blocco.titolo ? `🧭 ${blocco.titolo}` : "🧭 Step"}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                            Step {idx + 1}/{total}{totalFragments > 1 ? ` · Transizione ${safeFrag + 1}/${totalFragments}` : ""}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={() => {
                                if (canPrevFrag) {
                                    setFrag(safeFrag - 1);
                                    return;
                                }
                                if (canPrev) setIdx(idx - 1);
                            }}
                            disabled={!canPrev && !canPrevFrag}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #d1d5db",
                                background: (canPrev || canPrevFrag) ? "#fff" : "#f3f4f6",
                                color: (canPrev || canPrevFrag) ? "#111827" : "#9ca3af",
                                cursor: (canPrev || canPrevFrag) ? "pointer" : "not-allowed",
                                fontWeight: 600,
                            }}
                        >
                            ←
                        </button>
                        <button
                            onClick={() => {
                                if (canNextFrag) {
                                    setFrag(safeFrag + 1);
                                    return;
                                }
                                if (canNext) setIdx(idx + 1);
                            }}
                            disabled={!canNext && !canNextFrag}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "none",
                                background: (canNext || canNextFrag) ? "#3b82f6" : "#e5e7eb",
                                color: (canNext || canNextFrag) ? "white" : "#9ca3af",
                                cursor: (canNext || canNextFrag) ? "pointer" : "not-allowed",
                                fontWeight: 700,
                            }}
                        >
                            →
                        </button>
                    </div>
                </div>

                {showProgress && (
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {steps.map((s: SequenzaStep, i: number) => {
                                const active = i === idx;
                                const done = i < idx;
                                return (
                                    <button
                                        key={s.id ?? i}
                                        onClick={() => {
                                            if (!allowJump) return;
                                            setIdx(i);
                                            setFrag(0);
                                        }}
                                        disabled={!allowJump}
                                        title={s.titolo ? `Step ${i + 1}: ${s.titolo}` : `Step ${i + 1}`}
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 999,
                                            border: active ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                                            background: active ? "#3b82f6" : done ? "#93c5fd" : "#e2e8f0",
                                            cursor: allowJump ? "pointer" : "default",
                                            padding: 0,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {totalFragments > 1 && (
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>

                            {Array.from({ length: totalFragments }).map((_, i) => {
                                const active = i === safeFrag;
                                const done = i < safeFrag;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setFrag(i)}
                                        title={`Transizione ${i + 1}/${totalFragments}`}
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            border: active ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                                            background: active ? "#3b82f6" : done ? "#93c5fd" : "#e2e8f0",
                                            cursor: "pointer",
                                            padding: 0,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ padding: "14px 14px 6px" }}>
                    {current?.titolo && (
                        <div style={{ fontWeight: 700, color: "#1f2937", marginBottom: 10 }}>
                            {current.titolo}
                        </div>
                    )}

                    <div
                        key={animKey}
                        style={{
                            transform: "translateY(6px)",
                            opacity: 0,
                            animation: "lessonStepIn 220ms ease-out forwards",
                        }}
                    >
                        {visibleBlocchi.map((b: Blocco, i: number) => renderBlocco(b, i))}
                    </div>

                    <div style={{ height: 8 }} />
                </div>
            </div>

            <style>
                {`
                    @keyframes lessonStepIn {
                        from { opacity: 0; transform: translateY(6px); }
                        to   { opacity: 1; transform: translateY(0px); }
                    }
                `}
            </style>
        </div>
    );
}

// ============================================================================
// DISPATCHER
// ============================================================================

function renderBlocco(blocco: Blocco, index: number): React.ReactNode {
    const key = `blocco-${index}`;

    switch (blocco.tipo) {
        case "testo":
            return <TestoBlock key={key} blocco={blocco} />;
        case "titolo":
            return <TitoloBlock key={key} blocco={blocco} />;
        case "formula":
            return <FormulaBlock key={key} blocco={blocco} />;
        case "definizione":
            return <DefinizioneBlock key={key} blocco={blocco} />;
        case "teorema":
            return <TeoremaBlock key={key} blocco={blocco} />;
        case "esempio":
            return <EsempioBlock key={key} blocco={blocco} />;
        case "nota":
            return <NotaBlock key={key} blocco={blocco} />;
        case "elenco":
            return <ElencoBlock key={key} blocco={blocco} />;
        case "immagine":
            return <ImmagineBlock key={key} blocco={blocco} />;
        case "video":
            return <VideoBlock key={key} blocco={blocco} />;
        case "demo":
            return <DemoBlock key={key} blocco={blocco} />;
        case "quiz":
            return <QuizBlock key={key} blocco={blocco} />;
        case "step-by-step":
            return <StepByStepBlock key={key} blocco={blocco} />;
        case "sequenza":
            return <SequenzaBlock key={key} blocco={blocco as BloccoSequenza} />;
        case "callout":
            return <CalloutBlock key={key} blocco={blocco} />;
        case "separatore":
            return <SeparatoreBlock key={key} />;
        case "tabella":
            return <TabellaBlock key={key} blocco={blocco} />;
        default:
            return (
                <div key={key} style={{ padding: 12, background: "#fef2f2", borderRadius: 8, color: "#991b1b" }}>
                    Blocco non supportato
                </div>
            );
    }
}

// ============================================================================
// PRESENTAZIONE - Stile Lavagna
// ============================================================================

interface Slide {
    type: "intro" | "section-title" | "content" | "conclusion" | "resources";
    title?: string;
    sectionIndex?: number;
    blocchi?: Blocco[];
    data?: unknown;
}

function buildSlides(lezione: Lezione): Slide[] {
    const slides: Slide[] = [];
    const { metadati, introduzione, sezioni, conclusione, risorse } = lezione;

    // Slide intro
    slides.push({
        type: "intro",
        title: metadati.titolo,
        data: metadati,
    });

    // Introduzione
    if (introduzione && introduzione.length > 0) {
        slides.push({
            type: "content",
            title: "Introduzione",
            blocchi: introduzione,
        });
    }

    // Sezioni
    sezioni.forEach((sez, sezIdx) => {
        // Titolo sezione
        slides.push({
            type: "section-title",
            title: `${sezIdx + 1}. ${sez.titolo}`,
            sectionIndex: sezIdx,
        });

        // Contenuto sezione - ogni blocco è una slide (o gruppi logici)
        if (sez.blocchi.length > 0) {
            slides.push({
                type: "content",
                title: sez.titolo,
                sectionIndex: sezIdx,
                blocchi: sez.blocchi,
            });
        }
    });

    // Conclusione
    if (conclusione && conclusione.length > 0) {
        slides.push({
            type: "conclusion",
            title: "Conclusione",
            blocchi: conclusione,
        });
    }

    // Risorse
    if (risorse && risorse.length > 0) {
        slides.push({
            type: "resources",
            title: "Risorse",
            data: risorse,
        });
    }

    return slides;
}

interface PresentationViewProps {
    lezione: Lezione;
    boardStyle: BoardStyle;
    onExit: () => void;
}

function PresentationView({ lezione, boardStyle, onExit }: PresentationViewProps): React.ReactElement {
    const slides = buildSlides(lezione);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const theme = boardThemes[boardStyle];

    const canPrev = currentSlide > 0;
    const canNext = currentSlide < slides.length - 1;

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                if (canNext) setCurrentSlide((s) => s + 1);
            } else if (e.key === "ArrowLeft") {
                if (canPrev) setCurrentSlide((s) => s - 1);
            } else if (e.key === "Escape") {
                onExit();
            }
        },
        [canNext, canPrev, onExit]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const slide = slides[currentSlide];
    const metadati = lezione.metadati;

    const resetZoom = () => {
        setZoomLevel(1);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: theme.secondaryBg,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Top bar */}
            <div
                style={{
                    padding: "12px 24px",
                    background: theme.bg,
                    borderBottom: `1px solid ${theme.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                        onClick={onExit}
                        style={{
                            padding: "8px 16px",
                            background: "transparent",
                            border: `1px solid ${theme.border}`,
                            borderRadius: 8,
                            color: theme.text,
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        ✕ Esci
                    </button>
                    <span style={{ color: theme.text, fontWeight: 600 }}>{metadati.titolo}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.text }}>
                    <span style={{ fontSize: 14 }}>
                        {currentSlide + 1} / {slides.length}
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: theme.border }}>
                <div
                    style={{
                        height: "100%",
                        width: `${((currentSlide + 1) / slides.length) * 100}%`,
                        background: theme.accent,
                        transition: "width 0.3s ease",
                    }}
                />
            </div>

            {/* Main content */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 32,
                    overflow: "hidden",
                }}
            >
                {/* Container per lo zoom */}
                <div
                    style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "top center",
                        transition: "transform 0.3s ease",
                        width: "100%",
                        maxWidth: 1000,
                    }}
                >
                    {/* Board/Slide */}
                    <div
                        style={{
                            width: "100%",
                            minHeight: 500,
                            background: theme.bg,
                            borderRadius: 16,
                            boxShadow: theme.shadow,
                            border: `2px solid ${theme.border}`,
                            padding: 40,
                            color: theme.text,
                            position: "relative",
                        }}
                    >
                        {/* Slide content */}
                        {slide.type === "intro" && (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                                    <span
                                        style={{
                                            padding: "4px 12px",
                                            background: theme.accent + "20",
                                            color: theme.accent,
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {metadati.materia}
                                    </span>
                                    <span
                                        style={{
                                            padding: "4px 12px",
                                            background: theme.accent + "20",
                                            color: theme.accent,
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {metadati.argomento}
                                    </span>
                                </div>
                                <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>{metadati.titolo}</h1>
                                {metadati.sottotitolo && (
                                    <p style={{ fontSize: 20, opacity: 0.8, marginBottom: 24 }}>{metadati.sottotitolo}</p>
                                )}
                                {metadati.durata && (
                                    <p style={{ fontSize: 16, opacity: 0.6 }}>⏱️ Durata: {metadati.durata} minuti</p>
                                )}
                            </div>
                        )}

                        {slide.type === "section-title" && (
                            <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                                <h2 style={{ fontSize: 36, fontWeight: 700 }}>{slide.title}</h2>
                            </div>
                        )}

                        {slide.type === "content" && slide.blocchi && (
                            <div>
                                {slide.title && slide.title !== "Introduzione" && (
                                    <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: theme.accent }}>
                                        {slide.title}
                                    </h3>
                                )}
                                {slide.blocchi.map((b: Blocco, i: number) => renderBlocco(b, i))}
                            </div>
                        )}

                        {slide.type === "conclusion" && slide.blocchi && (
                            <div>
                                <h3 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>
                                    🎯 {slide.title}
                                </h3>
                                {slide.blocchi.map((b: Blocco, i: number) => renderBlocco(b, i))}
                            </div>
                        )}

                        {slide.type === "resources" && (
                            <div>
                                <h3 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24, textAlign: "center" }}>
                                    📚 Risorse
                                </h3>
                                <ul style={{ listStyle: "none", padding: 0 }}>
                                    {(slide.data as Risorsa[]).map((r: Risorsa, i: number) => (
                                        <li key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                                            {r.url ? (
                                                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent }}>
                                                    {r.titolo} ↗
                                                </a>
                                            ) : (
                                                <span>{r.titolo}</span>
                                            )}
                                            {r.descrizione && <p style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{r.descrizione}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom navigation con controlli zoom */}
            <div
                style={{
                    padding: "16px 24px",
                    background: theme.bg,
                    borderTop: `1px solid ${theme.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                }}
            >
                <button
                    onClick={() => canPrev && setCurrentSlide((s) => s - 1)}
                    disabled={!canPrev}
                    style={{
                        padding: "12px 24px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: canPrev ? theme.bg : theme.secondaryBg,
                        color: canPrev ? theme.text : theme.border,
                        cursor: canPrev ? "pointer" : "not-allowed",
                        fontSize: 16,
                        fontWeight: 600,
                    }}
                >
                    ← Precedente
                </button>

                <div style={{ display: "flex", gap: 4 }}>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            style={{
                                width: i === currentSlide ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                border: "none",
                                background: i === currentSlide ? theme.accent : theme.border,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={() => canNext && setCurrentSlide((s) => s + 1)}
                    disabled={!canNext}
                    style={{
                        padding: "12px 24px",
                        borderRadius: 8,
                        border: "none",
                        background: canNext ? theme.accent : theme.secondaryBg,
                        color: canNext ? "#fff" : theme.border,
                        cursor: canNext ? "pointer" : "not-allowed",
                        fontSize: 16,
                        fontWeight: 600,
                    }}
                >
                    Successivo →
                </button>

                {/* Controlli zoom */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
                    <button
                        onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.25))}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            background: theme.bg,
                            color: theme.text,
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        - Zoom
                    </button>

                    <button
                        onClick={() => setZoomLevel(zoomLevel + 0.25)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            background: theme.bg,
                            color: theme.text,
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        + Zoom
                    </button>

                    <button
                        onClick={resetZoom}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            background: theme.bg,
                            color: theme.text,
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        Reset Zoom
                    </button>
                </div>
            </div>

            {/* Keyboard hint */}
            <div style={{ padding: "8px 24px", textAlign: "center", fontSize: 12, color: theme.text, opacity: 0.5 }}>
                Usa ← → per navigare • Spazio per avanzare • Esc per uscire
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPALE
// ============================================================================

interface LessonRendererProps {
    lezione: Lezione;
    showTableOfContents?: boolean;
}

export function LessonRenderer({ lezione, showTableOfContents = true }: LessonRendererProps): React.ReactElement {
    const { metadati, introduzione, sezioni, conclusione, risorse } = lezione;
    const [mode, setMode] = useState<"document" | "presentation">("document");
    const [boardStyle, setBoardStyle] = useState<BoardStyle>("white");

    if (mode === "presentation") {
        return <PresentationView lezione={lezione} boardStyle={boardStyle} onExit={() => setMode("document")} />;
    }

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "24px 20px",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Toolbar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, color: "#64748b" }}>Modalità:</span>
                    <button
                        onClick={() => setMode("document")}
                        style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: "#3b82f6",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        📄 Documento
                    </button>
                    <button
                        onClick={() => setMode("presentation")}
                        style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: "#e2e8f0",
                            color: "#64748b",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        🎬 Presentazione
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, color: "#64748b" }}>Stile lavagna:</span>
                    <button
                        onClick={() => setBoardStyle("white")}
                        title="Bianca"
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: boardStyle === "white" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                            background: "#ffffff",
                            cursor: "pointer",
                        }}
                    />
                    <button
                        onClick={() => setBoardStyle("green")}
                        title="Verde classica"
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: boardStyle === "green" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                            background: "#1a4d2e",
                            cursor: "pointer",
                        }}
                    />
                    <button
                        onClick={() => setBoardStyle("dark")}
                        title="Scura moderna"
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: boardStyle === "dark" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                            background: "#1e293b",
                            cursor: "pointer",
                        }}
                    />
                </div>
            </div>

            {/* Header */}
            <header style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <span
                        style={{
                            padding: "4px 10px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        {metadati.materia}
                    </span>
                    <span
                        style={{
                            padding: "4px 10px",
                            background: "#f3e8ff",
                            color: "#7c3aed",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        {metadati.argomento}
                    </span>
                    {metadati.durata && (
                        <span
                            style={{
                                padding: "4px 10px",
                                background: "#fef3c7",
                                color: "#92400e",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            ⏱️ {metadati.durata} min
                        </span>
                    )}
                </div>

                <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{metadati.titolo}</h1>

                {metadati.sottotitolo && <p style={{ fontSize: 18, color: "#6b7280" }}>{metadati.sottotitolo}</p>}

                {metadati.obiettivi && metadati.obiettivi.length > 0 && (
                    <div
                        style={{
                            marginTop: 20,
                            padding: 16,
                            background: "#fdf4ff",
                            border: "1px solid #e9d5ff",
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#7c3aed" }}>
                            🎯 Obiettivi di apprendimento
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 20, color: "#6b21a8" }}>
                            {metadati.obiettivi.map((obj: string, i: number) => (
                                <li key={i} style={{ marginBottom: 4 }}>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {metadati.prerequisiti && metadati.prerequisiti.length > 0 && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 16,
                            background: "#fff7ed",
                            border: "1px solid #fed7aa",
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8, color: "#c2410c" }}>📚 Prerequisiti</div>
                        <ul style={{ margin: 0, paddingLeft: 20, color: "#9a3412" }}>
                            {metadati.prerequisiti.map((pre: string, i: number) => (
                                <li key={i} style={{ marginBottom: 4 }}>
                                    {pre}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </header>

            {/* Table of Contents */}
            {showTableOfContents && sezioni.length > 1 && (
                <nav
                    style={{
                        marginBottom: 32,
                        padding: 16,
                        background: "#f8fafc",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>📑 Indice</div>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                        {sezioni.map((sez: SezioneLezione, i: number) => (
                            <li key={i} style={{ marginBottom: 6 }}>
                                <a href={`#sezione-${sez.id}`} style={{ color: "#3b82f6", textDecoration: "none" }}>
                                    {sez.titolo}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Introduzione */}
            {introduzione && introduzione.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                    {introduzione.map((blocco: Blocco, i: number) => renderBlocco(blocco, i))}
                </section>
            )}

            {/* Sezioni */}
            {sezioni.map((sezione: SezioneLezione, sezIdx: number) => (
                <section key={sezione.id} id={`sezione-${sezione.id}`} style={{ marginBottom: 40 }}>
                    <h2
                        style={{
                            fontSize: 24,
                            fontWeight: 600,
                            color: "#111827",
                            borderBottom: "2px solid #e5e7eb",
                            paddingBottom: 8,
                            marginBottom: 20,
                        }}
                    >
                        {sezIdx + 1}. {sezione.titolo}
                    </h2>
                    {sezione.blocchi.map((blocco: Blocco, i: number) => renderBlocco(blocco, i))}
                </section>
            ))}

            {/* Conclusione */}
            {conclusione && conclusione.length > 0 && (
                <section style={{ marginTop: 40, paddingTop: 24, borderTop: "2px solid #e5e7eb" }}>
                    <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Conclusione</h2>
                    {conclusione.map((blocco: Blocco, i: number) => renderBlocco(blocco, i))}
                </section>
            )}

            {/* Risorse */}
            {risorse && risorse.length > 0 && (
                <section style={{ marginTop: 40, padding: 20, background: "#f8fafc", borderRadius: 12 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>📖 Risorse aggiuntive</h3>
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                        {risorse.map((r: Risorsa, i: number) => (
                            <li
                                key={i}
                                style={{
                                    padding: "12px 0",
                                    borderBottom: i < risorse.length - 1 ? "1px solid #e2e8f0" : "none",
                                }}
                            >
                                <div style={{ fontWeight: 500 }}>
                                    {r.url ? (
                                        <a
                                            href={r.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "#3b82f6" }}
                                        >
                                            {r.titolo} ↗
                                        </a>
                                    ) : (
                                        r.titolo
                                    )}
                                </div>
                                {r.descrizione && (
                                    <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{r.descrizione}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Footer */}
            <footer
                style={{
                    marginTop: 48,
                    paddingTop: 24,
                    borderTop: "1px solid #e5e7eb",
                    fontSize: 13,
                    color: "#9ca3af",
                    textAlign: "center",
                }}
            >
                {metadati.autore && <div>Autore: {metadati.autore}</div>}
                {metadati.dataModifica && (
                    <div>Ultimo aggiornamento: {new Date(metadati.dataModifica).toLocaleDateString("it-IT")}</div>
                )}
            </footer>
        </div>
    );
}

export default LessonRenderer;
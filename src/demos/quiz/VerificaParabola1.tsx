/**
 * VerificaParabola1 - Verifica scritta su Parabola e Sistemi di secondo grado
 * Liceo delle Scienze Umane – Classe 3F – Matematica – 28 Marzo 2026
 *
 * Punteggio (30 pt obbligatori → Voto = punti/3):
 *   Sez. A  4 × 2 pt = 8 pt
 *   Sez. B  vertice 3 + direttrice 2 + intersezioni 3 + grafico 2 = 10 pt
 *   Es. 3a  5 pt  |  Es. 4a  4 pt  |  Sez. C  3 pt
 *   Gli esercizi con * sono facoltativi per BES/DSA ma concorrono al punteggio
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

// ─── Helper: LaTeX inline ──────────────────────────────────────────────────────
function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

// ─── Stili costanti ────────────────────────────────────────────────────────────
const S = {
    page: {
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "24px 16px 48px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
    } as React.CSSProperties,

    sheet: {
        maxWidth: 820,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
        padding: "40px 48px",
    } as React.CSSProperties,

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap" as const,
        gap: 10,
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,

    btnBack: {
        padding: "8px 14px",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        background: "#f8fafc",
        color: "#475569",
        fontSize: 13,
        cursor: "pointer",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
    } as React.CSSProperties,

    btnPrint: {
        padding: "8px 16px",
        border: "none",
        borderRadius: 8,
        background: "#1e40af",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,

    btnSoluzioni: (show: boolean): React.CSSProperties => ({
        padding: "8px 16px",
        border: "none",
        borderRadius: 8,
        background: show ? "#16a34a" : "#f59e0b",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
    }),

    headerDoc: {
        borderBottom: "2px solid #0f172a",
        paddingBottom: 16,
        marginBottom: 24,
    } as React.CSSProperties,

    istituto: {
        fontSize: 13,
        color: "#475569",
        textAlign: "center" as const,
        letterSpacing: "0.3px",
    } as React.CSSProperties,

    title: {
        fontSize: 22,
        fontWeight: 700,
        textAlign: "center" as const,
        color: "#0f172a",
        margin: "8px 0 4px",
        textTransform: "uppercase" as const,
        letterSpacing: "1px",
    } as React.CSSProperties,

    disciplina: {
        fontSize: 15,
        textAlign: "center" as const,
        color: "#334155",
        fontStyle: "italic",
        marginBottom: 12,
    } as React.CSSProperties,

    metaRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#64748b",
        marginTop: 8,
    } as React.CSSProperties,

    noteBox: {
        background: "#fef3c7",
        border: "1px solid #fcd34d",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
        color: "#78350f",
        marginBottom: 20,
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.6,
    } as React.CSSProperties,

    parte: {
        marginBottom: 28,
    } as React.CSSProperties,

    parteTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#0f172a",
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: 6,
        marginBottom: 14,
        fontFamily: "system-ui, sans-serif",
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
    } as React.CSSProperties,

    punti: {
        float: "right" as const,
        fontWeight: 400,
        color: "#64748b",
        fontSize: 12,
        textTransform: "none" as const,
    } as React.CSSProperties,

    istruzione: {
        fontSize: 13,
        color: "#475569",
        marginBottom: 12,
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,

    domanda: {
        marginBottom: 20,
    } as React.CSSProperties,

    domandaLabel: {
        fontWeight: 700,
        fontSize: 14,
        color: "#1e293b",
        marginBottom: 6,
        display: "block",
    } as React.CSSProperties,

    domandaText: {
        fontSize: 14,
        lineHeight: 1.7,
        color: "#1e293b",
        marginBottom: 8,
    } as React.CSSProperties,

    mcOption: {
        display: "block",
        fontSize: 14,
        color: "#1e293b",
        marginBottom: 3,
        paddingLeft: 16,
    } as React.CSSProperties,

    soluzioniSection: {
        marginTop: 40,
        borderTop: "3px solid #16a34a",
        paddingTop: 24,
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,

    soluzioniTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#15803d",
        marginBottom: 20,
    } as React.CSSProperties,

    solParte: {
        marginBottom: 24,
    } as React.CSSProperties,

    solParteTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: "#0f172a",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 6,
        padding: "6px 12px",
        marginBottom: 12,
        textTransform: "uppercase" as const,
    } as React.CSSProperties,

    solDomanda: {
        marginBottom: 16,
        paddingLeft: 12,
        borderLeft: "3px solid #86efac",
    } as React.CSSProperties,

    solLabel: {
        fontWeight: 700,
        fontSize: 13,
        color: "#15803d",
        marginBottom: 4,
        display: "block",
    } as React.CSSProperties,

    solText: {
        fontSize: 13,
        lineHeight: 1.8,
        color: "#1e293b",
    } as React.CSSProperties,

    solRisposta: {
        display: "inline-block",
        background: "#dcfce7",
        border: "1px solid #86efac",
        borderRadius: 4,
        padding: "2px 10px",
        fontSize: 13,
        fontWeight: 700,
        color: "#15803d",
        marginBottom: 6,
    } as React.CSSProperties,

    solStep: {
        background: "#f8fafc",
        borderRadius: 6,
        padding: "10px 14px",
        marginTop: 6,
        fontSize: 13,
    } as React.CSSProperties,
} as const;

// ─── Helper: riga risposta MC ──────────────────────────────────────────────────
function RigaRisposta(): React.ReactElement {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
            fontSize: 13,
            color: "#475569",
            fontFamily: "system-ui, sans-serif",
        }}>
            <span>Risposta:</span>
            <span style={{ width: 60, borderBottom: "1px solid #94a3b8", display: "inline-block" }} />
        </div>
    );
}

function RigaMotivazione(): React.ReactElement {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 4,
            fontSize: 13,
            color: "#475569",
            fontFamily: "system-ui, sans-serif",
        }}>
            <span>Motivazione:</span>
            <span style={{ flex: 1, borderBottom: "1px solid #94a3b8", display: "inline-block", minWidth: 80 }} />
        </div>
    );
}

// ─── Helper: riga di lavoro ────────────────────────────────────────────────────
function Riga({ h = 52 }: { h?: number }): React.ReactElement {
    return <div style={{ height: h, borderBottom: "1px dashed #cbd5e1" }} />;
}

// ─── Helper: area grafico ──────────────────────────────────────────────────────
function AreaGrafico({ h = 180 }: { h?: number }): React.ReactElement {
    return (
        <div style={{
            height: h,
            border: "1px dashed #94a3b8",
            borderRadius: 4,
            background: "#fafafa",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 12,
            fontFamily: "system-ui, sans-serif",
        }}>
            (grafico)
        </div>
    );
}

// ─── Tabella voto ──────────────────────────────────────────────────────────────
function TabellaVoto(): React.ReactElement {
    return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, fontFamily: "system-ui, sans-serif" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                    <tr>
                        <td style={{ border: "1px solid #0f172a", padding: "6px 16px", fontWeight: 700 }}>
                            Totale punti &nbsp;
                            <span style={{ display: "inline-block", border: "1px solid #0f172a", width: 48, height: 20, verticalAlign: "middle" }} />
                            &nbsp;/ 30
                        </td>
                        <td style={{ border: "1px solid #0f172a", padding: "6px 24px", fontWeight: 700 }}>
                            VOTO &nbsp;
                            <span style={{ display: "inline-block", border: "1px solid #0f172a", width: 56, height: 28, verticalAlign: "middle" }} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ─── Componente principale ─────────────────────────────────────────────────────
export default function VerificaParabola1(): React.ReactElement {
    const [showSoluzioni, setShowSoluzioni] = useState(false);

    return (
        <>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .soluzioni-section { display: none !important; }
                    body { background: white; }
                    .verifica-sheet {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 20mm 18mm !important;
                    }
                    .verifica-page { background: white !important; padding: 0 !important; }
                }
            `}</style>

            <div style={S.page} className="verifica-page">
                {/* Barra superiore (no print) */}
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    <div style={S.topBar} className="no-print">
                        <Link to="/" style={S.btnBack}>← Home</Link>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                style={S.btnSoluzioni(showSoluzioni)}
                                onClick={() => setShowSoluzioni(v => !v)}
                            >
                                {showSoluzioni ? "✓ Nascondi soluzioni" : "Mostra soluzioni"}
                            </button>
                            <button style={S.btnPrint} onClick={() => window.print()}>
                                🖨️ Stampa / Salva PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Foglio verifica */}
                <div style={S.sheet} className="verifica-sheet">

                    {/* ── Intestazione ── */}
                    <div style={S.headerDoc}>
                        <div style={S.istituto}>
                            Licei Giovanni da San Giovanni — Scienze Umane — Classe 3F
                        </div>
                        <div style={S.title}>Verifica di Matematica — Fila A</div>
                        <div style={S.disciplina}>Parabola e sistemi di secondo grado</div>
                        <div style={S.metaRow}>
                            <span>28 Marzo 2026</span>
                            <span>Tempo: 60 minuti</span>
                        </div>
                    </div>

                    {/* Note */}
                    <div style={S.noteBox}>
                        Nella sezione A è richiesta la scelta della risposta corretta e una breve motivazione.
                        Gli esercizi contrassegnati con l'asterisco (*) sono facoltativi per BES e DSA.{" "}
                        <strong>Punteggio:</strong> 30 pt → Voto = pt ÷ 3.
                    </div>

                    {/* ════════════════════════════════════
                        SEZIONE A — Quesiti a risposta multipla
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Sezione A — Quesiti a risposta multipla con motivazione
                            <span style={S.punti}>(8 punti — 2 pt per quesito)</span>
                        </div>
                        <p style={S.istruzione}>
                            Per ciascun quesito scegli la risposta corretta tra A, B, C, D e motiva brevemente la scelta.
                        </p>

                        {/* A.1 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>1.</span>
                            <p style={S.domandaText}>
                                La parabola di equazione <L s="$y = x^2 - 4x + 3$" /> ha vertice nel punto:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$(2,\,-1)$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$(-2,\,-1)$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$(4,\,3)$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$(2,\,1)$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 12 }} />

                        {/* A.2 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>2.</span>
                            <p style={S.domandaText}>
                                La parabola di equazione <L s="$y = x^2 - 5x + 6$" /> interseca l'asse <L s="$x$" /> nei punti:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$(2,\,0)$" /> e <L s="$(3,\,0)$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$(-2,\,0)$" /> e <L s="$(-3,\,0)$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$(1,\,0)$" /> e <L s="$(6,\,0)$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$(0,\,2)$" /> e <L s="$(0,\,3)$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 12 }} />

                        {/* A.3 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>3.</span>
                            <p style={S.domandaText}>
                                Quale tra le seguenti parabole ha la concavità rivolta verso il basso?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$y = 2x^2 - 1$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$y = -3x^2 + 5x$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$y = x^2 + 4$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$y = \tfrac{1}{2}x^2 - 7$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 12 }} />

                        {/* A.4 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>4.</span>
                            <p style={S.domandaText}>
                                Considera il sistema
                            </p>
                            <div style={{ margin: "6px 0 10px 16px" }}>
                                <DisplayMath>{String.raw`\begin{cases} y = x + 1 \\ x^2 + y^2 = 13 \end{cases}`}</DisplayMath>
                            </div>
                            <p style={S.domandaText}>
                                Quale delle seguenti coppie rappresenta l'insieme delle soluzioni?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$(2,\,3)$" /> e <L s="$(-3,\,-2)$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$(2,\,2)$" /> e <L s="$(-2,\,-2)$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$(3,\,2)$" /> e <L s="$(-2,\,-3)$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$(1,\,2)$" /> e <L s="$(-1,\,0)$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        SEZIONE B — Studio di una parabola
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Sezione B — Studio della parabola
                            <span style={S.punti}>(10 pt)</span>
                        </div>
                        <p style={S.domandaText}>
                            Data la parabola di equazione
                        </p>
                        <div style={{ margin: "0 0 12px 16px" }}>
                            <DisplayMath>{String.raw`y = x^2 + 2x - 3`}</DisplayMath>
                        </div>

                        {/* i. Vertice */}
                        <div style={{ marginLeft: 16, marginBottom: 10 }}>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                <strong>i.)</strong> Determina il vertice <L s="$V$" />.
                                <span style={{ float: "right", fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>3 pt</span>
                            </p>
                            <Riga /><Riga /><Riga />
                        </div>

                        {/* *ii. Fuoco */}
                        <div style={{ marginLeft: 16, marginBottom: 10 }}>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                <strong>*ii.)</strong> Determina il fuoco <L s="$F$" />.
                                <span style={{ float: "right", fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                            </p>
                            <Riga /><Riga />
                        </div>

                        {/* Direttrice */}
                        <div style={{ marginLeft: 16, marginBottom: 10 }}>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                <strong>iii.)</strong> Determina l'equazione della retta direttrice.
                                <span style={{ float: "right", fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                            </p>
                            <Riga /><Riga />
                        </div>

                        {/* Intersezioni */}
                        <div style={{ marginLeft: 16, marginBottom: 10 }}>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                <strong>iv.)</strong> Determina le intersezioni con gli assi cartesiani.
                                <span style={{ float: "right", fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>3 pt</span>
                            </p>
                            <Riga /><Riga /><Riga />
                        </div>

                        {/* Grafico */}
                        <div style={{ marginLeft: 16, marginBottom: 4 }}>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                <strong>v.)</strong> Disegna i punti trovati e il grafico della parabola.
                                <span style={{ float: "right", fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                            </p>
                            <AreaGrafico h={200} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 3 — Parabola e retta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 3 — Posizione relativa tra parabola e retta
                        </div>

                        {/* 3a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                a)
                                <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>5 pt</span>
                            </span>
                            <p style={S.domandaText}>
                                Data la parabola di equazione <L s="$y = x^2 - 4x + 1$" />,
                                determina se la retta di equazione <L s="$y = -3$" /> è secante, tangente o esterna alla parabola.
                                Scrivi gli eventuali punti di intersezione trovati e fai il grafico.
                            </p>
                            <Riga /><Riga /><Riga /><Riga />
                            <AreaGrafico h={160} />
                        </div>

                        {/* *3b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*b)</span>
                            <p style={S.domandaText}>
                                Data la parabola di equazione <L s="$y = -x^2 + 6x - 5$" />,
                                determina se la retta di equazione <L s="$y = x + 3$" /> è secante, tangente o esterna alla parabola.
                                Scrivi gli eventuali punti di intersezione trovati e fai il grafico.
                            </p>
                            <Riga /><Riga /><Riga /><Riga />
                            <AreaGrafico h={160} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 4 — Sistemi di secondo grado
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 4 — Sistemi di secondo grado
                        </div>

                        {/* 4a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                a)
                                <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>4 pt</span>
                            </span>
                            <div style={{ margin: "4px 0 8px 16px" }}>
                                <DisplayMath>{String.raw`\begin{cases} x^2 - y^2 = 5 \\ y = x - 1 \end{cases}`}</DisplayMath>
                            </div>
                            <Riga /><Riga /><Riga /><Riga />
                        </div>

                        {/* *4b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*b)</span>
                            <div style={{ margin: "4px 0 8px 16px" }}>
                                <DisplayMath>{String.raw`\begin{cases} x^2 + y^2 = 13 \\ x - y = 1 \end{cases}`}</DisplayMath>
                            </div>
                            <Riga /><Riga /><Riga /><Riga />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        SEZIONE C — Problema
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Sezione C — Problema
                            <span style={S.punti}>(3 pt)</span>
                        </div>
                        <p style={S.domandaText}>
                            Determina due numeri sapendo che la loro somma è <L s="$6$" /> e
                            il loro prodotto è uguale al triplo della loro differenza.
                        </p>
                        <Riga /><Riga /><Riga /><Riga /><Riga />
                    </div>

                    {/* ── Tabella voto ── */}
                    <TabellaVoto />

                    {/* ════════════════════════════════════
                        SEZIONE SOLUZIONI (no print)
                    ════════════════════════════════════ */}
                    {showSoluzioni && (
                        <div style={S.soluzioniSection} className="soluzioni-section no-print">
                            <div style={S.soluzioniTitle}>✅ Soluzioni e procedimenti</div>

                            {/* ─── Sezione A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Sezione A — Risposte corrette</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. Vertice di <L s="$y = x^2 - 4x + 3$" /></span>
                                    <div style={S.solRisposta}>Risposta A</div>
                                    <p style={S.solText}>
                                        La coordinata <L s="$x$" /> del vertice è <L s="$x_V = -\tfrac{b}{2a} = -\tfrac{-4}{2} = 2$" />.
                                        La coordinata <L s="$y$" /> è <L s="$y_V = 4 - 8 + 3 = -1$" />.
                                        Quindi <L s="$V = (2,\,-1)$" />.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. Zeri di <L s="$y = x^2 - 5x + 6$" /></span>
                                    <div style={S.solRisposta}>Risposta A</div>
                                    <p style={S.solText}>
                                        Si pone <L s="$y = 0$" />: <L s="$x^2 - 5x + 6 = 0$" />,
                                        discriminante <L s="$\Delta = 25 - 24 = 1$" />,
                                        soluzioni <L s="$x = \tfrac{5 \pm 1}{2}$" />, cioè <L s="$x = 3$" /> e <L s="$x = 2$" />.
                                        I punti sono <L s="$(2,\,0)$" /> e <L s="$(3,\,0)$" />.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. Concavità verso il basso</span>
                                    <div style={S.solRisposta}>Risposta B</div>
                                    <p style={S.solText}>
                                        Una parabola ha concavità verso il basso quando il coefficiente <L s="$a$" /> di <L s="$x^2$" /> è negativo.
                                        Solo <L s="$y = -3x^2 + 5x$" /> ha <L s="$a = -3 < 0$" />.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. Sistema <L s="$y = x+1$" />, <L s="$x^2+y^2=13$" /></span>
                                    <div style={S.solRisposta}>Risposta A</div>
                                    <p style={S.solText}>
                                        Si sostituisce <L s="$y = x+1$" /> nella seconda equazione:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`x^2 + (x+1)^2 = 13 \;\Rightarrow\; 2x^2 + 2x - 12 = 0 \;\Rightarrow\; x^2 + x - 6 = 0`}</DisplayMath>
                                        <DisplayMath>{String.raw`(x-2)(x+3) = 0 \;\Rightarrow\; x = 2,\; y = 3 \quad \text{oppure} \quad x = -3,\; y = -2`}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Sezione B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Sezione B — <L s="$y = x^2 + 2x - 3$" /></div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>i. Vertice</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`x_V = -\frac{b}{2a} = -\frac{2}{2} = -1 \qquad y_V = 1 - 2 - 3 = -4 \qquad V = (-1,\,-4)`}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*ii. Fuoco</span>
                                    <p style={S.solText}>
                                        Per una parabola verticale <L s="$y = ax^2 + \ldots$" />, il parametro è <L s="$p = \tfrac{1}{4a} = \tfrac{1}{4}$" />.
                                        Il fuoco si trova a distanza <L s="$p$" /> dal vertice verso l'interno della concavità:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`F = \!\left(-1,\; -4 + \tfrac{1}{4}\right) = \!\left(-1,\; -\tfrac{15}{4}\right)`}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>iii. Direttrice</span>
                                    <p style={S.solText}>
                                        La direttrice è orizzontale, a distanza <L s="$p = \tfrac{1}{4}$" /> dal vertice verso il basso:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`y = y_V - p = -4 - \frac{1}{4} = -\frac{17}{4}`}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>iv. Intersezioni con gli assi</span>
                                    <p style={S.solText}>
                                        <strong>Con l'asse <L s="$x$" /> (y = 0):</strong>
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`x^2 + 2x - 3 = 0 \;\Rightarrow\; (x+3)(x-1) = 0 \;\Rightarrow\; x = -3 \;\text{ o }\; x = 1`}</DisplayMath>
                                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Punti: <L s="$(-3,\,0)$" /> e <L s="$(1,\,0)$" /></p>
                                    </div>
                                    <p style={{ ...S.solText, marginTop: 8 }}>
                                        <strong>Con l'asse <L s="$y$" /> (x = 0):</strong>
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`y = 0 + 0 - 3 = -3`}</DisplayMath>
                                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Punto: <L s="$(0,\,-3)$" /></p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 3 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 3 — Posizione relativa</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$y = x^2 - 4x + 1$" /> e <L s="$y = -3$" /></span>
                                    <p style={S.solText}>
                                        Si sostituisce <L s="$y = -3$" /> nell'equazione della parabola:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`-3 = x^2 - 4x + 1 \;\Rightarrow\; x^2 - 4x + 4 = 0 \;\Rightarrow\; (x-2)^2 = 0`}</DisplayMath>
                                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                                            <strong>Discriminante = 0</strong> → la retta è <strong>tangente</strong> alla parabola nel punto <L s="$(2,\,-3)$" />.
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*b) <L s="$y = -x^2 + 6x - 5$" /> e <L s="$y = x + 3$" /></span>
                                    <p style={S.solText}>
                                        Si sostituisce <L s="$y = x + 3$" />:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`x + 3 = -x^2 + 6x - 5 \;\Rightarrow\; x^2 - 5x + 8 = 0`}</DisplayMath>
                                        <DisplayMath>{String.raw`\Delta = 25 - 32 = -7 < 0`}</DisplayMath>
                                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                                            <strong>Discriminante negativo</strong> → la retta è <strong>esterna</strong> alla parabola (nessuna intersezione).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 4 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 4 — Sistemi di secondo grado</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$x^2 - y^2 = 5$" />, <L s="$y = x - 1$" /></span>
                                    <p style={S.solText}>
                                        Si sostituisce <L s="$y = x - 1$" /> nella prima equazione:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`x^2 - (x-1)^2 = 5 \;\Rightarrow\; x^2 - x^2 + 2x - 1 = 5 \;\Rightarrow\; 2x = 6 \;\Rightarrow\; x = 3`}</DisplayMath>
                                        <DisplayMath>{String.raw`y = 3 - 1 = 2 \qquad \text{Soluzione unica: } (3,\,2)`}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*b) <L s="$x^2 + y^2 = 13$" />, <L s="$x - y = 1$" /></span>
                                    <p style={S.solText}>
                                        Si ricava <L s="$x = y + 1$" /> e si sostituisce:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`(y+1)^2 + y^2 = 13 \;\Rightarrow\; 2y^2 + 2y - 12 = 0 \;\Rightarrow\; y^2 + y - 6 = 0`}</DisplayMath>
                                        <DisplayMath>{String.raw`(y-2)(y+3) = 0 \;\Rightarrow\; y = 2,\; x = 3 \quad \text{oppure} \quad y = -3,\; x = -2`}</DisplayMath>
                                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>Soluzioni: <L s="$(3,\,2)$" /> e <L s="$(-2,\,-3)$" /></p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Sezione C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Sezione C — Problema</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>Due numeri con somma 6 e prodotto uguale al triplo della differenza</span>
                                    <p style={S.solText}>
                                        Siano <L s="$x$" /> e <L s="$y$" /> i due numeri (con <L s="$x > y$" />). Il sistema è:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`\begin{cases} x + y = 6 \\ xy = 3(x - y) \end{cases}`}</DisplayMath>
                                    </div>
                                    <p style={{ ...S.solText, marginTop: 8 }}>
                                        Dalla prima: <L s="$y = 6 - x$" />. Si sostituisce nella seconda:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{String.raw`x(6-x) = 3\bigl(x - (6-x)\bigr) = 3(2x - 6) = 6x - 18`}</DisplayMath>
                                        <DisplayMath>{String.raw`6x - x^2 = 6x - 18 \;\Rightarrow\; x^2 = 18 \;\Rightarrow\; x = \pm 3\sqrt{2}`}</DisplayMath>
                                    </div>
                                    <p style={{ ...S.solText, marginTop: 8 }}>
                                        <strong>Soluzione 1:</strong> <L s="$x = 3\sqrt{2}$" />, <L s="$y = 6 - 3\sqrt{2} = 3(2-\sqrt{2})$" /><br />
                                        <strong>Soluzione 2:</strong> <L s="$x = -3\sqrt{2}$" />, <L s="$y = 6 + 3\sqrt{2} = 3(2+\sqrt{2})$" />
                                    </p>
                                    <p style={{ ...S.solText, marginTop: 4, color: "#475569", fontSize: 12 }}>
                                        Verifica: somma <L s="$= 6$" /> ✓,
                                        prodotto <L s="$= 18\sqrt{2} - 18$" />,
                                        triplo differenza <L s="$= 3(6\sqrt{2}-6) = 18\sqrt{2}-18$" /> ✓
                                    </p>
                                </div>
                            </div>

                            {/* ─── Griglia punteggi ─── */}
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 20px", fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
                                <div style={{ fontWeight: 700, marginBottom: 10, color: "#0f172a" }}>Griglia punteggi</div>
                                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                                    <thead>
                                        <tr style={{ background: "#e2e8f0" }}>
                                            <th style={{ padding: "4px 10px", textAlign: "left", border: "1px solid #cbd5e1" }}>Sezione</th>
                                            <th style={{ padding: "4px 10px", textAlign: "center", border: "1px solid #cbd5e1" }}>Punti</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ["Sez. A – 4 quesiti (2 pt cad.)", "8"],
                                            ["Sez. B – Vertice", "3"],
                                            ["Sez. B – *Fuoco", "2"],
                                            ["Sez. B – Direttrice", "2"],
                                            ["Sez. B – Intersezioni assi", "3"],
                                            ["Sez. B – Grafico", "2"],
                                            ["Es. 3a – tipo + intersezioni + grafico", "5"],
                                            ["Es. 4a – sistema", "4"],
                                            ["Sez. C – problema", "3"],
                                        ].map(([label, pts]) => (
                                            <tr key={label}>
                                                <td style={{ padding: "4px 10px", border: "1px solid #e2e8f0" }}>{label}</td>
                                                <td style={{ padding: "4px 10px", textAlign: "center", border: "1px solid #e2e8f0" }}>{pts}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ fontWeight: 700, background: "#f0fdf4" }}>
                                            <td style={{ padding: "4px 10px", border: "1px solid #86efac" }}>Totale</td>
                                            <td style={{ padding: "4px 10px", textAlign: "center", border: "1px solid #86efac" }}>30</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p style={{ marginTop: 10, color: "#475569", fontSize: 12 }}>
                                    <strong>Voto</strong> = punti ÷ 3, arrotondato al mezzo voto.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

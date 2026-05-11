/**
 * VerificaParabolaSistemi3F
 * Verifica scritta – Parabola e sistemi di secondo grado
 * Liceo Linguistico 3F — 31 Marzo 2026
 *
 * Punteggio (30 pt):
 *   Sez. A  4 × 2 pt = 8 pt
 *   Sez. B  vertice 3 + fuoco* 2 + direttrice 2 + intersezioni 3 = 10 pt
 *   Es. 3a  5 pt  |  Es. 3b*  5 pt  |  Es. 4a  4 pt  |  Es. 5  3 pt  → tot 35 pt
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

// ─── Stili ────────────────────────────────────────────────────────────────────
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

    filaTabs: {
        display: "flex",
        gap: 0,
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,

    filaTab: (active: boolean): React.CSSProperties => ({
        padding: "7px 20px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        border: "none",
        background: active ? "#1e40af" : "#f8fafc",
        color: active ? "#fff" : "#475569",
        letterSpacing: "0.5px",
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

    parte: { marginBottom: 28 } as React.CSSProperties,

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

    domanda: { marginBottom: 20 } as React.CSSProperties,

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

    solParte: { marginBottom: 24 } as React.CSSProperties,

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

// ─── Helper components ────────────────────────────────────────────────────────
function RigaRisposta(): React.ReactElement {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif" }}>
            <span>Risposta:</span>
            <span style={{ width: 60, borderBottom: "1px solid #94a3b8", display: "inline-block" }} />
        </div>
    );
}

function RigaMotivazione(): React.ReactElement {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif" }}>
            <span>Motivazione:</span>
            <span style={{ flex: 1, borderBottom: "1px solid #94a3b8", display: "inline-block", minWidth: 80 }} />
        </div>
    );
}

function Riga({ h = 52 }: { h?: number }): React.ReactElement {
    return <div style={{ height: h, borderBottom: "1px dashed #cbd5e1" }} />;
}

function AreaGrafico({ h = 180 }: { h?: number }): React.ReactElement {
    return (
        <div style={{ height: h, border: "1px dashed #94a3b8", borderRadius: 4, background: "#fafafa", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12, fontFamily: "system-ui, sans-serif" }}>
            (grafico)
        </div>
    );
}

function TabellaVoto(): React.ReactElement {
    return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, fontFamily: "system-ui, sans-serif" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                    <tr>
                        <td style={{ border: "1px solid #0f172a", padding: "6px 16px", fontWeight: 700 }}>
                            Totale punti &nbsp;
                            <span style={{ display: "inline-block", border: "1px solid #0f172a", width: 48, height: 20, verticalAlign: "middle" }} />
                            &nbsp;/ 35
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

// ─── FILA A ───────────────────────────────────────────────────────────────────
function FilaA(): React.ReactElement {
    return (
        <>
            {/* ── Intestazione ── */}
            <div style={S.headerDoc}>
                <div style={S.istituto}>Licei Giovanni da San Giovanni — Liceo Linguistico — Classe 3F</div>
                <div style={S.title}>Verifica di Matematica — Fila A</div>
                <div style={S.disciplina}>Parabola e sistemi di secondo grado</div>
                <div style={S.metaRow}>
                    <span>31 Marzo 2026</span>
                    <span>Tempo: 60 minuti</span>
                </div>
            </div>

            <div style={S.noteBox}>
                Nella sezione A indica la risposta corretta e motiva brevemente la scelta.
                Gli esercizi con asterisco (*) sono facoltativi per BES/DSA ma concorrono al punteggio.{" "}
                <strong>Punteggio totale:</strong> 35 pt.
            </div>

            {/* ── Parte A ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>
                    Parte A — Quesiti a risposta multipla con motivazione
                    <span style={S.punti}>(8 punti — 2 pt per quesito)</span>
                </div>
                <p style={S.istruzione}>Per ciascun quesito: indica la risposta corretta e motiva brevemente la scelta.</p>

                {/* 1 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>a)</span>
                    <p style={S.domandaText}>La parabola di equazione <L s="$y = x^2 - 6x + 5$" /> ha vertice nel punto:</p>
                    <div style={S.mcOption}><L s="A. $(-3,\,-4)$" /></div>
                    <div style={S.mcOption}><L s="B. $(3,\,-4)$" /></div>
                    <div style={S.mcOption}><L s="C. $(6,\,5)$" /></div>
                    <div style={S.mcOption}><L s="D. $(3,\,4)$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>

                {/* 2 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>b)</span>
                    <p style={S.domandaText}>La parabola di equazione <L s="$y = x^2 - 7x + 12$" /> interseca l'asse <L s="$x$" /> nei punti:</p>
                    <div style={S.mcOption}><L s="A. $(1,\,0)$ e $(12,\,0)$" /></div>
                    <div style={S.mcOption}><L s="B. $(3,\,0)$ e $(4,\,0)$" /></div>
                    <div style={S.mcOption}><L s="C. $(-3,\,0)$ e $(-4,\,0)$" /></div>
                    <div style={S.mcOption}><L s="D. $(0,\,3)$ e $(0,\,4)$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>

                {/* 3 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>c)</span>
                    <p style={S.domandaText}>Quale tra le seguenti parabole ha la concavità rivolta verso l'<strong>alto</strong>?</p>
                    <div style={S.mcOption}><L s="A. $y = -2x^2 + 3x$" /></div>
                    <div style={S.mcOption}><L s="B. $y = -x^2 + 5$" /></div>
                    <div style={S.mcOption}><L s="C. $y = 3x^2 - 4$" /></div>
                    <div style={S.mcOption}><L s="D. $y = -\dfrac{1}{2}x^2 + 7$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>

                {/* *4 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>*d)</span>
                    <p style={S.domandaText}>Considera il sistema:</p>
                    <div style={{ margin: "4px 0 8px 16px" }}>
                        <DisplayMath>{String.raw`\begin{cases} y = x - 1 \\ x^2 + y^2 = 25 \end{cases}`}</DisplayMath>
                    </div>
                    <p style={S.domandaText}>Quale delle seguenti coppie rappresenta l'insieme delle soluzioni?</p>
                    <div style={S.mcOption}><L s="A. $(4,\,3)$ e $(-3,\,-4)$" /></div>
                    <div style={S.mcOption}><L s="B. $(4,\,4)$ e $(-3,\,-3)$" /></div>
                    <div style={S.mcOption}><L s="C. $(3,\,4)$ e $(-4,\,-3)$" /></div>
                    <div style={S.mcOption}><L s="D. $(1,\,-2)$ e $(-1,\,0)$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>
            </div>

            {/* ── Parte B ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>
                    Parte B — Studio di una parabola
                    <span style={S.punti}>(10 punti)</span>
                </div>
                <p style={S.domandaText}>Data la parabola di equazione</p>
                <DisplayMath>{String.raw`y = x^2 - 4x - 5`}</DisplayMath>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        i. Determina il vertice <L s="$V$" />.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>3 pt</span>
                    </span>
                    <Riga /><Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        *ii. Determina il fuoco <L s="$F$" />.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                    </span>
                    <Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        iii. Determina l'equazione della retta direttrice.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                    </span>
                    <Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        iv. Determina le intersezioni con gli assi cartesiani.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>3 pt</span>
                    </span>
                    <Riga /><Riga /><Riga />
                </div>
            </div>

            {/* ── Esercizio 3 ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>Esercizio 3 — Posizione relativa tra parabola e retta</div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        a)
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>5 pt</span>
                    </span>
                    <p style={S.domandaText}>
                        Data la parabola <L s="$y = x^2 - 4x + 5$" />, determina se la retta <L s="$y = 1$" /> è{" "}
                        <strong>secante</strong>, <strong>tangente</strong> o <strong>esterna</strong> alla parabola.
                        Scrivi gli eventuali punti di intersezione e disegna la situazione.
                    </p>
                    <Riga /><Riga /><Riga />
                    <AreaGrafico />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        *b)
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>5 pt</span>
                    </span>
                    <p style={S.domandaText}>
                        Data la parabola <L s="$y = -x^2 + 4x + 1$" />, determina se la retta <L s="$y = x - 3$" /> è secante, tangente o esterna.
                        Scrivi gli eventuali punti di intersezione e disegna la situazione.
                    </p>
                    <Riga /><Riga /><Riga />
                    <AreaGrafico />
                </div>
            </div>

            {/* ── Esercizio 4 ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>Esercizio 4 — Sistemi di secondo grado</div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        a)
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>4 pt</span>
                    </span>
                    <p style={S.domandaText}>Risolvi il sistema:</p>
                    <div style={{ margin: "4px 0 8px 16px" }}>
                        <DisplayMath>{String.raw`\begin{cases} x^2 + y^2 = 10 \\ y = x + 2 \end{cases}`}</DisplayMath>
                    </div>
                    <Riga /><Riga /><Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>*b)</span>
                    <p style={S.domandaText}>Risolvi il sistema:</p>
                    <div style={{ margin: "4px 0 8px 16px" }}>
                        <DisplayMath>{String.raw`\begin{cases} x^2 + y^2 = 20 \\ y = x - 2 \end{cases}`}</DisplayMath>
                    </div>
                    <Riga /><Riga /><Riga /><Riga />
                </div>
            </div>

            {/* ── Esercizio 5 ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>
                    Esercizio 5
                    <span style={S.punti}>(3 pt)</span>
                </div>
                <p style={S.domandaText}>
                    Determina due numeri interi sapendo che la loro somma è <L s="$5$" /> e la somma dei loro quadrati è <L s="$13$" />.
                </p>
                <Riga /><Riga /><Riga /><Riga /><Riga />
            </div>
        </>
    );
}

// ─── FILA B ───────────────────────────────────────────────────────────────────
function FilaB(): React.ReactElement {
    return (
        <>
            {/* ── Intestazione ── */}
            <div style={S.headerDoc}>
                <div style={S.istituto}>Licei Giovanni da San Giovanni — Liceo Linguistico — Classe 3F</div>
                <div style={S.title}>Verifica di Matematica — Fila B</div>
                <div style={S.disciplina}>Parabola e sistemi di secondo grado</div>
                <div style={S.metaRow}>
                    <span>31 Marzo 2026</span>
                    <span>Tempo: 60 minuti</span>
                </div>
            </div>

            <div style={S.noteBox}>
                Nella sezione A indica la risposta corretta e motiva brevemente la scelta.
                Gli esercizi con asterisco (*) sono facoltativi per BES/DSA ma concorrono al punteggio.{" "}
                <strong>Punteggio totale:</strong> 35 pt.
            </div>

            {/* ── Parte A ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>
                    Parte A — Quesiti a risposta multipla con motivazione
                    <span style={S.punti}>(8 punti — 2 pt per quesito)</span>
                </div>
                <p style={S.istruzione}>Per ciascun quesito: indica la risposta corretta e motiva brevemente la scelta.</p>

                {/* 1 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>a)</span>
                    <p style={S.domandaText}>La parabola di equazione <L s="$y = x^2 - 8x + 7$" /> ha vertice nel punto:</p>
                    <div style={S.mcOption}><L s="A. $(4,\,-9)$" /></div>
                    <div style={S.mcOption}><L s="B. $(-4,\,-9)$" /></div>
                    <div style={S.mcOption}><L s="C. $(8,\,7)$" /></div>
                    <div style={S.mcOption}><L s="D. $(4,\,9)$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>

                {/* 2 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>b)</span>
                    <p style={S.domandaText}>La parabola di equazione <L s="$y = x^2 - 5x + 4$" /> interseca l'asse <L s="$x$" /> nei punti:</p>
                    <div style={S.mcOption}><L s="A. $(-1,\,0)$ e $(-4,\,0)$" /></div>
                    <div style={S.mcOption}><L s="B. $(1,\,0)$ e $(4,\,0)$" /></div>
                    <div style={S.mcOption}><L s="C. $(2,\,0)$ e $(3,\,0)$" /></div>
                    <div style={S.mcOption}><L s="D. $(0,\,1)$ e $(0,\,4)$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>

                {/* 3 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>c)</span>
                    <p style={S.domandaText}>Quale tra le seguenti parabole ha la concavità rivolta verso il <strong>basso</strong>?</p>
                    <div style={S.mcOption}><L s="A. $y = 2x^2 - 3$" /></div>
                    <div style={S.mcOption}><L s="B. $y = -2x^2 + x$" /></div>
                    <div style={S.mcOption}><L s="C. $y = x^2 - 5$" /></div>
                    <div style={S.mcOption}><L s="D. $y = \dfrac{1}{2}x^2 + 1$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>

                {/* *4 */}
                <div style={S.domanda}>
                    <span style={S.domandaLabel}>*d)</span>
                    <p style={S.domandaText}>Considera il sistema:</p>
                    <div style={{ margin: "4px 0 8px 16px" }}>
                        <DisplayMath>{String.raw`\begin{cases} y = x + 2 \\ x^2 + y^2 = 20 \end{cases}`}</DisplayMath>
                    </div>
                    <p style={S.domandaText}>Quale delle seguenti coppie rappresenta l'insieme delle soluzioni?</p>
                    <div style={S.mcOption}><L s="A. $(2,\,4)$ e $(-4,\,-2)$" /></div>
                    <div style={S.mcOption}><L s="B. $(2,\,2)$ e $(-4,\,-4)$" /></div>
                    <div style={S.mcOption}><L s="C. $(4,\,2)$ e $(-2,\,-4)$" /></div>
                    <div style={S.mcOption}><L s="D. $(1,\,3)$ e $(-1,\,1)$" /></div>
                    <RigaRisposta />
                    <RigaMotivazione />
                </div>
            </div>

            {/* ── Parte B ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>
                    Parte B — Studio di una parabola
                    <span style={S.punti}>(10 punti)</span>
                </div>
                <p style={S.domandaText}>Data la parabola di equazione</p>
                <DisplayMath>{String.raw`y = -x^2 + 2x + 3`}</DisplayMath>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        i. Determina il vertice <L s="$V$" />.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>3 pt</span>
                    </span>
                    <Riga /><Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        *ii. Determina il fuoco <L s="$F$" />.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                    </span>
                    <Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        iii. Determina l'equazione della retta direttrice.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>2 pt</span>
                    </span>
                    <Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        iv. Determina le intersezioni con gli assi cartesiani.
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>3 pt</span>
                    </span>
                    <Riga /><Riga /><Riga />
                </div>
            </div>

            {/* ── Esercizio 3 ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>Esercizio 3 — Posizione relativa tra parabola e retta</div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        a)
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>5 pt</span>
                    </span>
                    <p style={S.domandaText}>
                        Data la parabola <L s="$y = x^2 - 2x - 3$" />, determina se la retta <L s="$y = 5$" /> è{" "}
                        <strong>secante</strong>, <strong>tangente</strong> o <strong>esterna</strong> alla parabola.
                        Scrivi gli eventuali punti di intersezione e disegna la situazione.
                    </p>
                    <Riga /><Riga /><Riga />
                    <AreaGrafico />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        *b)
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>5 pt</span>
                    </span>
                    <p style={S.domandaText}>
                        Data la parabola <L s="$y = x^2 - 4x + 5$" />, determina se la retta <L s="$y = 2x - 4$" /> è secante, tangente o esterna.
                        Scrivi gli eventuali punti di intersezione e disegna la situazione.
                    </p>
                    <Riga /><Riga /><Riga />
                    <AreaGrafico />
                </div>
            </div>

            {/* ── Esercizio 4 ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>Esercizio 4 — Sistemi di secondo grado</div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>
                        a)
                        <span style={{ float: "right", fontWeight: 400, fontSize: 12, color: "#64748b", fontFamily: "system-ui, sans-serif" }}>4 pt</span>
                    </span>
                    <p style={S.domandaText}>Risolvi il sistema:</p>
                    <div style={{ margin: "4px 0 8px 16px" }}>
                        <DisplayMath>{String.raw`\begin{cases} x^2 + y^2 = 13 \\ y = x - 1 \end{cases}`}</DisplayMath>
                    </div>
                    <Riga /><Riga /><Riga /><Riga />
                </div>

                <div style={S.domanda}>
                    <span style={S.domandaLabel}>*b)</span>
                    <p style={S.domandaText}>Risolvi il sistema:</p>
                    <div style={{ margin: "4px 0 8px 16px" }}>
                        <DisplayMath>{String.raw`\begin{cases} x^2 + y^2 = 25 \\ y = x + 1 \end{cases}`}</DisplayMath>
                    </div>
                    <Riga /><Riga /><Riga /><Riga />
                </div>
            </div>

            {/* ── Esercizio 5 ── */}
            <div style={S.parte}>
                <div style={S.parteTitle}>
                    Esercizio 5
                    <span style={S.punti}>(3 pt)</span>
                </div>
                <p style={S.domandaText}>
                    Determina due numeri interi sapendo che la loro somma è <L s="$7$" /> e il loro prodotto è <L s="$12$" />.
                </p>
                <Riga /><Riga /><Riga /><Riga /><Riga />
            </div>
        </>
    );
}

// ─── Soluzioni Fila A ─────────────────────────────────────────────────────────
function SoluzioniA(): React.ReactElement {
    return (
        <div style={S.soluzioniSection} className="soluzioni-section no-print">
            <div style={S.soluzioniTitle}>✅ Soluzioni — Fila A</div>

            {/* Parte A */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Parte A — Risposte corrette</div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>a) Vertice di <L s="$y = x^2 - 6x + 5$" /></span>
                    <div style={S.solRisposta}>Risposta B: <L s="$(3,\,-4)$" /></div>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x_V = -\frac{b}{2a} = \frac{6}{2} = 3 \qquad y_V = 9 - 18 + 5 = -4 \qquad V = (3,\,-4)`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>b) Zeri di <L s="$y = x^2 - 7x + 12$" /></span>
                    <div style={S.solRisposta}>Risposta B: <L s="$(3,\,0)$ e $(4,\,0)$" /></div>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`\Delta = 49 - 48 = 1 \qquad x = \frac{7 \pm 1}{2} \;\Rightarrow\; x = 3 \;\text{ o }\; x = 4`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>c) Concavità verso l'alto</span>
                    <div style={S.solRisposta}>Risposta C: <L s="$y = 3x^2 - 4$" /></div>
                    <p style={S.solText}>
                        La concavità è verso l'alto quando <L s="$a > 0$" />.
                        Solo <L s="$y = 3x^2 - 4$" /> ha <L s="$a = 3 > 0$" /> (le altre hanno <L s="$a < 0$" />).
                    </p>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*d) Sistema <L s="$y = x-1$" />, <L s="$x^2+y^2=25$" /></span>
                    <div style={S.solRisposta}>Risposta A: <L s="$(4,\,3)$ e $(-3,\,-4)$" /></div>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 + (x-1)^2 = 25 \;\Rightarrow\; 2x^2 - 2x + 1 = 25 \;\Rightarrow\; x^2 - x - 12 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-4)(x+3) = 0 \;\Rightarrow\; x=4 \Rightarrow y=3 \quad \text{oppure} \quad x=-3 \Rightarrow y=-4`}</DisplayMath>
                    </div>
                </div>
            </div>

            {/* Parte B */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Parte B — <L s="$y = x^2 - 4x - 5$" /></div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>i. Vertice</span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x_V = \frac{4}{2} = 2 \qquad y_V = 4 - 8 - 5 = -9 \qquad V = (2,\,-9)`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*ii. Fuoco</span>
                    <p style={S.solText}>
                        Per <L s="$a = 1$" />, il parametro è <L s="$p = \tfrac{1}{4a} = \tfrac{1}{4}$" />.
                        Il fuoco si trova a distanza <L s="$p$" /> sopra il vertice (concavità verso l'alto):
                    </p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`F = \left(2,\; -9 + \frac{1}{4}\right) = \left(2,\; -\frac{35}{4}\right)`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>iii. Direttrice</span>
                    <p style={S.solText}>La direttrice si trova a distanza <L s="$p$" /> sotto il vertice:</p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`y = y_V - p = -9 - \frac{1}{4} = -\frac{37}{4}`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>iv. Intersezioni con gli assi</span>
                    <p style={S.solText}><strong>Con l'asse <L s="$y$" /> (<L s="$x=0$" />):</strong></p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`y = 0 - 0 - 5 = -5 \qquad \text{Punto: } (0,\,-5)`}</DisplayMath>
                    </div>
                    <p style={{ ...S.solText, marginTop: 8 }}><strong>Con l'asse <L s="$x$" /> (<L s="$y=0$" />):</strong></p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 - 4x - 5 = 0 \;\Rightarrow\; (x-5)(x+1) = 0 \;\Rightarrow\; x = 5 \;\text{ o }\; x = -1`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Punti: <L s="$(5,\,0)$" /> e <L s="$(-1,\,0)$" /></p>
                    </div>
                </div>
            </div>

            {/* Esercizio 3 */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Esercizio 3 — Posizione relativa</div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>a) <L s="$y = x^2 - 4x + 5$" /> e <L s="$y = 1$" /></span>
                    <p style={S.solText}>Si sostituisce <L s="$y = 1$" /> nell'equazione della parabola:</p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 - 4x + 5 = 1 \;\Rightarrow\; x^2 - 4x + 4 = 0 \;\Rightarrow\; (x-2)^2 = 0`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                            <strong><L s="$\Delta = 0$" /></strong> → la retta è <strong>tangente</strong> alla parabola nel punto <L s="$(2,\,1)$" />.
                        </p>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*b) <L s="$y = -x^2 + 4x + 1$" /> e <L s="$y = x - 3$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`-x^2 + 4x + 1 = x - 3 \;\Rightarrow\; -x^2 + 3x + 4 = 0 \;\Rightarrow\; x^2 - 3x - 4 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-4)(x+1) = 0 \;\Rightarrow\; x=4 \Rightarrow y=1 \quad \text{oppure} \quad x=-1 \Rightarrow y=-4`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                            <strong><L s="$\Delta > 0$" /></strong> → la retta è <strong>secante</strong> nei punti <L s="$(4,\,1)$" /> e <L s="$(-1,\,-4)$" />.
                        </p>
                    </div>
                </div>
            </div>

            {/* Esercizio 4 */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Esercizio 4 — Sistemi</div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>a) <L s="$x^2+y^2=10$" />, <L s="$y=x+2$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 + (x+2)^2 = 10 \;\Rightarrow\; 2x^2 + 4x + 4 = 10 \;\Rightarrow\; x^2 + 2x - 3 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-1)(x+3) = 0 \;\Rightarrow\; x=1 \Rightarrow y=3 \quad \text{oppure} \quad x=-3 \Rightarrow y=-1`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Soluzioni: <L s="$(1,\,3)$" /> e <L s="$(-3,\,-1)$" /></p>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*b) <L s="$x^2+y^2=20$" />, <L s="$y=x-2$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 + (x-2)^2 = 20 \;\Rightarrow\; 2x^2 - 4x + 4 = 20 \;\Rightarrow\; x^2 - 2x - 8 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-4)(x+2) = 0 \;\Rightarrow\; x=4 \Rightarrow y=2 \quad \text{oppure} \quad x=-2 \Rightarrow y=-4`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Soluzioni: <L s="$(4,\,2)$" /> e <L s="$(-2,\,-4)$" /></p>
                    </div>
                </div>
            </div>

            {/* Esercizio 5 */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Esercizio 5</div>
                <div style={S.solDomanda}>
                    <span style={S.solLabel}>Due numeri interi con somma 5 e somma dei quadrati 13</span>
                    <p style={S.solText}>Siano <L s="$x$" /> e <L s="$y$" /> i due numeri. Il sistema è:</p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`\begin{cases} x + y = 5 \\ x^2 + y^2 = 13 \end{cases}`}</DisplayMath>
                    </div>
                    <p style={{ ...S.solText, marginTop: 8 }}>
                        Da <L s="$(x+y)^2 = x^2 + 2xy + y^2 = 25$" /> si ricava <L s="$2xy = 25 - 13 = 12$" />, quindi <L s="$xy = 6$" />.
                        I due numeri sono radici di:
                    </p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`t^2 - 5t + 6 = 0 \;\Rightarrow\; (t-2)(t-3) = 0`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>I due numeri sono <strong>2</strong> e <strong>3</strong>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Soluzioni Fila B ─────────────────────────────────────────────────────────
function SoluzioniB(): React.ReactElement {
    return (
        <div style={S.soluzioniSection} className="soluzioni-section no-print">
            <div style={S.soluzioniTitle}>✅ Soluzioni — Fila B</div>

            {/* Parte A */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Parte A — Risposte corrette</div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>a) Vertice di <L s="$y = x^2 - 8x + 7$" /></span>
                    <div style={S.solRisposta}>Risposta A: <L s="$(4,\,-9)$" /></div>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x_V = \frac{8}{2} = 4 \qquad y_V = 16 - 32 + 7 = -9 \qquad V = (4,\,-9)`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>b) Zeri di <L s="$y = x^2 - 5x + 4$" /></span>
                    <div style={S.solRisposta}>Risposta B: <L s="$(1,\,0)$ e $(4,\,0)$" /></div>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`\Delta = 25 - 16 = 9 \qquad x = \frac{5 \pm 3}{2} \;\Rightarrow\; x = 1 \;\text{ o }\; x = 4`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>c) Concavità verso il basso</span>
                    <div style={S.solRisposta}>Risposta B: <L s="$y = -2x^2 + x$" /></div>
                    <p style={S.solText}>
                        La concavità è verso il basso quando <L s="$a < 0$" />.
                        Solo <L s="$y = -2x^2 + x$" /> ha <L s="$a = -2 < 0$" /> (le altre hanno <L s="$a > 0$" />).
                    </p>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*d) Sistema <L s="$y = x+2$" />, <L s="$x^2+y^2=20$" /></span>
                    <div style={S.solRisposta}>Risposta A: <L s="$(2,\,4)$ e $(-4,\,-2)$" /></div>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 + (x+2)^2 = 20 \;\Rightarrow\; 2x^2 + 4x + 4 = 20 \;\Rightarrow\; x^2 + 2x - 8 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-2)(x+4) = 0 \;\Rightarrow\; x=2 \Rightarrow y=4 \quad \text{oppure} \quad x=-4 \Rightarrow y=-2`}</DisplayMath>
                    </div>
                </div>
            </div>

            {/* Parte B */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Parte B — <L s="$y = -x^2 + 2x + 3$" /></div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>i. Vertice</span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x_V = -\frac{2}{2 \cdot (-1)} = 1 \qquad y_V = -1 + 2 + 3 = 4 \qquad V = (1,\,4)`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*ii. Fuoco</span>
                    <p style={S.solText}>
                        Per <L s="$a = -1$" />, il parametro è <L s="$p = \tfrac{1}{4a} = -\tfrac{1}{4}$" />.
                        Il fuoco si trova a distanza <L s="$|p| = \tfrac{1}{4}$" /> sotto il vertice (concavità verso il basso):
                    </p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`F = \left(1,\; 4 - \frac{1}{4}\right) = \left(1,\; \frac{15}{4}\right)`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>iii. Direttrice</span>
                    <p style={S.solText}>La direttrice si trova sopra il vertice (per concavità verso il basso):</p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`y = y_V + |p| = 4 + \frac{1}{4} = \frac{17}{4}`}</DisplayMath>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>iv. Intersezioni con gli assi</span>
                    <p style={S.solText}><strong>Con l'asse <L s="$y$" /> (<L s="$x=0$" />):</strong></p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`y = 0 + 0 + 3 = 3 \qquad \text{Punto: } (0,\,3)`}</DisplayMath>
                    </div>
                    <p style={{ ...S.solText, marginTop: 8 }}><strong>Con l'asse <L s="$x$" /> (<L s="$y=0$" />):</strong></p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`-x^2 + 2x + 3 = 0 \;\Rightarrow\; x^2 - 2x - 3 = 0 \;\Rightarrow\; (x-3)(x+1) = 0`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Punti: <L s="$(3,\,0)$" /> e <L s="$(-1,\,0)$" /></p>
                    </div>
                </div>
            </div>

            {/* Esercizio 3 */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Esercizio 3 — Posizione relativa</div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>a) <L s="$y = x^2 - 2x - 3$" /> e <L s="$y = 5$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 - 2x - 3 = 5 \;\Rightarrow\; x^2 - 2x - 8 = 0 \;\Rightarrow\; (x-4)(x+2) = 0`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                            <strong><L s="$\Delta > 0$" /></strong> → la retta è <strong>secante</strong> nei punti <L s="$(4,\,5)$" /> e <L s="$(-2,\,5)$" />.
                        </p>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*b) <L s="$y = x^2 - 4x + 5$" /> e <L s="$y = 2x - 4$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 - 4x + 5 = 2x - 4 \;\Rightarrow\; x^2 - 6x + 9 = 0 \;\Rightarrow\; (x-3)^2 = 0`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                            <strong><L s="$\Delta = 0$" /></strong> → la retta è <strong>tangente</strong> alla parabola nel punto <L s="$(3,\,2)$" />.
                        </p>
                    </div>
                </div>
            </div>

            {/* Esercizio 4 */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Esercizio 4 — Sistemi</div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>a) <L s="$x^2+y^2=13$" />, <L s="$y=x-1$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 + (x-1)^2 = 13 \;\Rightarrow\; 2x^2 - 2x + 1 = 13 \;\Rightarrow\; x^2 - x - 6 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-3)(x+2) = 0 \;\Rightarrow\; x=3 \Rightarrow y=2 \quad \text{oppure} \quad x=-2 \Rightarrow y=-3`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Soluzioni: <L s="$(3,\,2)$" /> e <L s="$(-2,\,-3)$" /></p>
                    </div>
                </div>

                <div style={S.solDomanda}>
                    <span style={S.solLabel}>*b) <L s="$x^2+y^2=25$" />, <L s="$y=x+1$" /></span>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`x^2 + (x+1)^2 = 25 \;\Rightarrow\; 2x^2 + 2x + 1 = 25 \;\Rightarrow\; x^2 + x - 12 = 0`}</DisplayMath>
                        <DisplayMath>{String.raw`(x-3)(x+4) = 0 \;\Rightarrow\; x=3 \Rightarrow y=4 \quad \text{oppure} \quad x=-4 \Rightarrow y=-3`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>Soluzioni: <L s="$(3,\,4)$" /> e <L s="$(-4,\,-3)$" /></p>
                    </div>
                </div>
            </div>

            {/* Esercizio 5 */}
            <div style={S.solParte}>
                <div style={S.solParteTitle}>Esercizio 5</div>
                <div style={S.solDomanda}>
                    <span style={S.solLabel}>Due numeri interi con somma 7 e prodotto 12</span>
                    <p style={S.solText}>Siano <L s="$x$" /> e <L s="$y$" /> i due numeri. Il sistema è:</p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`\begin{cases} x + y = 7 \\ xy = 12 \end{cases}`}</DisplayMath>
                    </div>
                    <p style={{ ...S.solText, marginTop: 8 }}>
                        I due numeri sono radici di:
                    </p>
                    <div style={S.solStep}>
                        <DisplayMath>{String.raw`t^2 - 7t + 12 = 0 \;\Rightarrow\; (t-3)(t-4) = 0`}</DisplayMath>
                        <p style={{ fontSize: 13, margin: "4px 0 0" }}>I due numeri sono <strong>3</strong> e <strong>4</strong>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function VerificaParabolaSistemi3F(): React.ReactElement {
    const [fila, setFila] = useState<"A" | "B">("A");
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
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    <div style={S.topBar} className="no-print">
                        <Link to="/" style={S.btnBack}>← Home</Link>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            {/* Switch fila */}
                            <div style={S.filaTabs}>
                                <button style={S.filaTab(fila === "A")} onClick={() => { setFila("A"); setShowSoluzioni(false); }}>
                                    Fila A
                                </button>
                                <button style={S.filaTab(fila === "B")} onClick={() => { setFila("B"); setShowSoluzioni(false); }}>
                                    Fila B
                                </button>
                            </div>
                            <button style={S.btnSoluzioni(showSoluzioni)} onClick={() => setShowSoluzioni(v => !v)}>
                                {showSoluzioni ? "✓ Nascondi soluzioni" : "Mostra soluzioni"}
                            </button>
                            <button style={S.btnPrint} onClick={() => window.print()}>
                                🖨️ Stampa / Salva PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div style={S.sheet} className="verifica-sheet">
                    {fila === "A" ? <FilaA /> : <FilaB />}
                    <TabellaVoto />
                    {showSoluzioni && (fila === "A" ? <SoluzioniA /> : <SoluzioniB />)}
                </div>
            </div>
        </>
    );
}

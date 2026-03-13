/**
 * VerificaGoniometria1 - Verifica scritta su Equazioni Goniometriche Elementari
 * Liceo delle Scienze Umane – Classe 4M – Matematica – San Giovanni Valdarno
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

    esRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0 32px",
        marginBottom: 4,
    } as React.CSSProperties,

    esItem: {
        fontSize: 14,
        lineHeight: 2.4,
        color: "#1e293b",
        borderBottom: "1px solid #94a3b8",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        paddingBottom: 2,
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

    vfRow: {
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto",
        gap: "0 12px",
        alignItems: "center",
        fontSize: 14,
        lineHeight: 1.7,
        color: "#1e293b",
        borderBottom: "1px solid #e2e8f0",
        padding: "8px 0",
    } as React.CSSProperties,

    vfBox: {
        width: 22,
        height: 22,
        border: "1.5px solid #64748b",
        borderRadius: 3,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#475569",
        fontFamily: "system-ui, sans-serif",
        flexShrink: 0,
    } as React.CSSProperties,
} as const;

// ─── Componente VF Row ─────────────────────────────────────────────────────────
function VFItem({ num, children }: { num: string; children: React.ReactNode }): React.ReactElement {
    return (
        <div style={S.vfRow}>
            <span style={{ fontWeight: 700, fontFamily: "system-ui, sans-serif", fontSize: 13, color: "#475569" }}>{num}</span>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{children}</div>
            <div style={{ ...S.vfBox }}>V</div>
            <div style={{ ...S.vfBox }}>F</div>
        </div>
    );
}

// ─── Componente principale ─────────────────────────────────────────────────────
export default function VerificaGoniometria1(): React.ReactElement {
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
                            Liceo delle Scienze Umane — Classe 4M — San Giovanni Valdarno
                        </div>
                        <div style={S.title}>Verifica di Matematica</div>
                        <div style={S.disciplina}>Equazioni Goniometriche — Simulazione</div>
                        <div style={S.metaRow}>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 1 – Equazioni elementari
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 1 — Risolvi le seguenti equazioni goniometriche elementari.
                            <span style={S.punti}>(punti 30)</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
                            <EsRow label="a)"><L s="$\sin x = -\dfrac{1}{2}$" /></EsRow>
                            <EsRow label="b)"><L s="$\cos x = -1$" /></EsRow>
                            <EsRow label="e)"><L s="$3\tan x = -\sqrt{3}$" /></EsRow>
                            <EsRow label="*f)"><L s="$5\sin x = 6$" /></EsRow>
                        </div>

                        {/* Spazio per svolgimento */}
                        <div style={{ marginTop: 16 }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            ))}
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 2 – Vero o Falso
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 2 — Vero o Falso? (motiva brevemente)
                            <span style={S.punti}>(punti 12)</span>
                        </div>

                        {/* Header colonne V/F */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 4, fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "#475569" }}>
                            <span style={{ width: 22, textAlign: "center" }}>V</span>
                            <span style={{ width: 22, textAlign: "center" }}>F</span>
                        </div>

                        <VFItem num="1.">
                            L'equazione <L s="$\sin x = 1$" /> ha come soluzioni <L s="$x = \dfrac{\pi}{2} + 2k\pi$" />.
                        </VFItem>
                        <VFItem num="2.">
                            L'equazione <L s="$\cos x = \dfrac{\pi}{2}$" /> non ha soluzioni reali.
                        </VFItem>
                        <VFItem num="3.">
                            L'equazione <L s="$\tan x = 1$" /> ha come soluzioni <L s="$x = \dfrac{\pi}{4} + k\pi$" />.
                        </VFItem>
                        <VFItem num="4.">
                            L'equazione <L s="$\cos x = 1$" /> ha come soluzioni <L s="$x = \pi + k\pi$" />.
                        </VFItem>

                        {/* Righe per motivazioni */}
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>Motivazioni:</div>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{ height: 36, borderBottom: "1px dashed #cbd5e1" }} />
                            ))}
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 3 – Riconducibili a elementari
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 3 — Risolvi le equazioni riconducibili a quelle elementari.
                            <span style={S.punti}>(punti 28)</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
                            <EsRow label="a)"><L s="$\sin(2x) = \dfrac{\sqrt{3}}{2}$" /></EsRow>
                            <EsRow label="b)"><L s="$\cos\!\left(x - \dfrac{\pi}{4}\right) = \sin\dfrac{\pi}{2}$" /></EsRow>
                            <EsRow label="c)"><L s="$\tan x = \sin\!\left(-\dfrac{\pi}{6}\right) + \cos\dfrac{2\pi}{3}$" /></EsRow>
                            <EsRow label="*c)"><L s="$\cos\!\left(x - \dfrac{\pi}{4}\right) = \sin\dfrac{\pi}{2}$" /></EsRow>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            ))}
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 4 – sin f(x) = sin g(x)
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 4 — Risolvi le equazioni del tipo <L s="$\sin f(x) = \sin g(x)$" />, ecc.
                            <span style={S.punti}>(punti 18)</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
                            <EsRow label="a)"><L s="$\sin x = \sin\!\left(\dfrac{\pi}{2} - 3x\right)$" /></EsRow>
                            <EsRow label="b)"><L s="$\cos\!\left(2x - \dfrac{\pi}{2}\right) = \cos\!\left(x + \dfrac{\pi}{4}\right)$" /></EsRow>
                            <EsRow label="*c)"><L s="$\tan 3x = \tan\!\left(x + \dfrac{\pi}{2}\right)$" /></EsRow>
                            <EsRow label="d)"><L s="$\cos\!\left(\dfrac{\pi}{2} - x\right) = \cos\!\left(x - \dfrac{\pi}{3}\right)$" /></EsRow>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            ))}
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 5 – Secondo grado
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 5 — Risolvi le equazioni di secondo grado in seno, coseno o tangente.
                            <span style={S.punti}>(punti 12)</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
                            <EsRow label="a)"><L s="$2\sin^2 x + \sin x - 1 = 0$" /></EsRow>
                            <EsRow label="*b)"><L s="$\cos^2 x - \dfrac{3}{4} = 0$" /></EsRow>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            ))}
                        </div>
                    </div>

                    {/* ── Tabella voto ── */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, fontFamily: "system-ui, sans-serif" }}>
                        <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: "1px solid #0f172a", padding: "6px 16px", fontWeight: 700 }}>
                                        Totale punti &nbsp;
                                        <span style={{ display: "inline-block", border: "1px solid #0f172a", width: 48, height: 20, verticalAlign: "middle" }} />
                                        &nbsp;/ 100
                                    </td>
                                    <td style={{ border: "1px solid #0f172a", padding: "6px 24px", fontWeight: 700 }}>
                                        VOTO &nbsp;
                                        <span style={{ display: "inline-block", border: "1px solid #0f172a", width: 56, height: 28, verticalAlign: "middle" }} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ════════════════════════════════════
                        SEZIONE SOLUZIONI (no print)
                    ════════════════════════════════════ */}
                    {showSoluzioni && (
                        <div style={S.soluzioniSection} className="soluzioni-section no-print">
                            <div style={S.soluzioniTitle}>✅ Soluzioni e procedimenti</div>

                            {/* ─── Esercizio 1 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 1 – Equazioni elementari</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$\sin x = -\dfrac{1}{2}$" /></span>
                                    <p style={S.solText}>
                                        Il valore <L s="$-\frac{1}{2}$" /> è noto: <L s="$\sin\frac{\pi}{6} = \frac{1}{2}$" />, quindi l'angolo di riferimento è <L s="$\frac{\pi}{6}$" />.
                                        Il seno è negativo nel III e IV quadrante.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x = -\\frac{\\pi}{6} + 2k\\pi \\qquad \\text{oppure} \\qquad x = \\pi + \\frac{\\pi}{6} + 2k\\pi = \\frac{7\\pi}{6} + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$\cos x = -1$" /></span>
                                    <p style={S.solText}>
                                        Il coseno vale <L s="$-1$" /> solo in <L s="$x = \pi$" /> (e sue traslazioni di <L s="$2\pi$" />).
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x = \\pi + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>e) <L s="$3\tan x = -\sqrt{3}$" /></span>
                                    <p style={S.solText}>
                                        Si divide per 3: <L s="$\tan x = -\frac{\sqrt{3}}{3} = -\frac{1}{\sqrt{3}}$" />.
                                        Il valore è noto: <L s="$\tan\frac{\pi}{6} = \frac{1}{\sqrt{3}}$" />.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\tan x = -\\frac{1}{\\sqrt{3}} \\implies x = -\\frac{\\pi}{6} + k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*f) <L s="$5\sin x = 6$" /></span>
                                    <p style={S.solText}>
                                        Si divide per 5: <L s="$\sin x = \frac{6}{5} = 1{,}2$" />.
                                        Poiché il codominio del seno è <L s="$[-1,\,1]$" /> e <L s="$1{,}2 > 1$" />, l'equazione è <strong>impossibile</strong>. Nessuna soluzione reale.
                                    </p>
                                    <div style={S.solStep}>
                                        <span style={{ ...S.solRisposta, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b" }}>
                                            Impossibile — nessuna soluzione
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 2 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 2 – Vero o Falso</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. <L s="$\sin x = 1 \Rightarrow x = \frac{\pi}{2} + 2k\pi$" /></span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>
                                        Il seno vale 1 solo nel punto <L s="$\frac{\pi}{2}$" /> del cerchio goniometrico. Le traslazioni di <L s="$2\pi$" /> danno tutte le soluzioni.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. <L s="$\cos x = \frac{\pi}{2}$" /> non ha soluzioni reali</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>
                                        <L s="$\frac{\pi}{2} \approx 1{,}57 > 1$" />, ma il coseno ha codominio <L s="$[-1,\,1]$" />. Il valore è fuori dall'intervallo, quindi l'equazione è impossibile.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. <L s="$\tan x = 1 \Rightarrow x = \frac{\pi}{4} + k\pi$" /></span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>
                                        <L s="$\tan\frac{\pi}{4} = 1$" />. La tangente ha periodo <L s="$\pi$" />, quindi le soluzioni si ripetono ogni <L s="$\pi$" />.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. <L s="$\cos x = 1 \Rightarrow x = \pi + k\pi$" /></span>
                                    <span style={{ ...S.solRisposta, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b" }}>FALSO ✗</span>
                                    <p style={S.solText}>
                                        <L s="$\cos(\pi) = -1 \neq 1$" />. La soluzione corretta è <L s="$x = 2k\pi$" />, poiché il coseno vale 1 solo nell'angolo 0 (e multipli di <L s="$2\pi$" />).
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\cos x = 1 \\implies x = 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 3 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 3 – Equazioni riconducibili a quelle elementari</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$\sin(2x) = \dfrac{\sqrt{3}}{2}$" /></span>
                                    <p style={S.solText}>
                                        Si pone <L s="$\alpha = 2x$" />. Il valore <L s="$\frac{\sqrt{3}}{2}$" /> è noto: <L s="$\sin\frac{\pi}{3} = \frac{\sqrt{3}}{2}$" />.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"2x = \\frac{\\pi}{3} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{6} + k\\pi"}</DisplayMath>
                                        <DisplayMath>{"2x = \\pi - \\frac{\\pi}{3} + 2k\\pi = \\frac{2\\pi}{3} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{3} + k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                            Soluzione: <strong><L s="$x = \frac{\pi}{6} + k\pi$" /></strong> oppure <strong><L s="$x = \frac{\pi}{3} + k\pi$" /></strong> &nbsp; (<L s="$k \in \mathbb{Z}$" />)
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$\cos\!\left(x - \dfrac{\pi}{4}\right) = \sin\dfrac{\pi}{2}$" /></span>
                                    <p style={S.solText}>
                                        Prima si calcola il secondo membro: <L s="$\sin\frac{\pi}{2} = 1$" />.
                                        Quindi: <L s="$\cos\!\left(x - \frac{\pi}{4}\right) = 1$" />.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x - \\frac{\\pi}{4} = 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{4} + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) <L s="$\tan x = \sin\!\left(-\dfrac{\pi}{6}\right) + \cos\dfrac{2\pi}{3}$" /></span>
                                    <p style={S.solText}>
                                        Si calcolano i valori del secondo membro:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\sin\\!\\left(-\\frac{\\pi}{6}\\right) = -\\sin\\frac{\\pi}{6} = -\\frac{1}{2}"}</DisplayMath>
                                        <DisplayMath>{"\\cos\\frac{2\\pi}{3} = \\cos\\!\\left(\\pi - \\frac{\\pi}{3}\\right) = -\\cos\\frac{\\pi}{3} = -\\frac{1}{2}"}</DisplayMath>
                                        <DisplayMath>{"\\tan x = -\\frac{1}{2} + \\left(-\\frac{1}{2}\\right) = -1"}</DisplayMath>
                                        <DisplayMath>{"\\tan x = -1 \\quad\\Rightarrow\\quad x = -\\frac{\\pi}{4} + k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 4 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 4 – Equazioni del tipo sin f(x) = sin g(x)</div>

                                <p style={{ fontSize: 12, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 12 }}>
                                    <strong>Regole generali:</strong>&nbsp;
                                    <L s="$\sin A = \sin B \Leftrightarrow A = B + 2k\pi \;\text{ oppure }\; A = \pi - B + 2k\pi$" /><br />
                                    <L s="$\cos A = \cos B \Leftrightarrow A = B + 2k\pi \;\text{ oppure }\; A = -B + 2k\pi$" /><br />
                                    <L s="$\tan A = \tan B \Leftrightarrow A = B + k\pi$" />
                                </p>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$\sin x = \sin\!\left(\dfrac{\pi}{2} - 3x\right)$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Caso 1:</p>
                                        <DisplayMath>{"x = \\frac{\\pi}{2} - 3x + 2k\\pi \\quad\\Rightarrow\\quad 4x = \\frac{\\pi}{2} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{8} + \\frac{k\\pi}{2}"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>Caso 2:</p>
                                        <DisplayMath>{"x = \\pi - \\left(\\frac{\\pi}{2} - 3x\\right) + 2k\\pi = \\frac{\\pi}{2} + 3x + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"-2x = \\frac{\\pi}{2} + 2k\\pi \\quad\\Rightarrow\\quad x = -\\frac{\\pi}{4} + k\\pi"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$\cos\!\left(2x - \dfrac{\pi}{2}\right) = \cos\!\left(x + \dfrac{\pi}{4}\right)$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Caso 1:</p>
                                        <DisplayMath>{"2x - \\frac{\\pi}{2} = x + \\frac{\\pi}{4} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{3\\pi}{4} + 2k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>Caso 2:</p>
                                        <DisplayMath>{"2x - \\frac{\\pi}{2} = -\\left(x + \\frac{\\pi}{4}\\right) + 2k\\pi = -x - \\frac{\\pi}{4} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"3x = \\frac{\\pi}{4} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{12} + \\frac{2k\\pi}{3}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*c) <L s="$\tan 3x = \tan\!\left(x + \dfrac{\pi}{2}\right)$" /></span>
                                    <p style={S.solText}>Per la tangente si usa direttamente l'unica famiglia di soluzioni:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"3x = x + \\frac{\\pi}{2} + k\\pi \\quad\\Rightarrow\\quad 2x = \\frac{\\pi}{2} + k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{4} + \\frac{k\\pi}{2} \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>d) <L s="$\cos\!\left(\dfrac{\pi}{2} - x\right) = \cos\!\left(x - \dfrac{\pi}{3}\right)$" /></span>
                                    <p style={S.solText}>
                                        Si osserva che <L s="$\cos\!\left(\frac{\pi}{2} - x\right) = \sin x$" /> (identità di complemento), ma si applica direttamente la regola del coseno.
                                    </p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Caso 1:</p>
                                        <DisplayMath>{"\\frac{\\pi}{2} - x = x - \\frac{\\pi}{3} + 2k\\pi \\quad\\Rightarrow\\quad \\frac{\\pi}{2} + \\frac{\\pi}{3} = 2x + 2k\\pi \\quad\\Rightarrow\\quad \\frac{5\\pi}{6} = 2x + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"x = \\frac{5\\pi}{12} + k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>Caso 2:</p>
                                        <DisplayMath>{"\\frac{\\pi}{2} - x = -\\left(x - \\frac{\\pi}{3}\\right) + 2k\\pi = -x + \\frac{\\pi}{3} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"\\frac{\\pi}{2} = \\frac{\\pi}{3} + 2k\\pi \\quad\\Rightarrow\\quad \\frac{\\pi}{6} = 2k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                            Impossibile per <L s="$k \in \mathbb{Z}$" />: nessuna soluzione aggiuntiva da questo caso.
                                        </p>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            Soluzione unica: <strong><L s="$x = \frac{5\pi}{12} + k\pi$" /></strong> &nbsp; (<L s="$k \in \mathbb{Z}$" />)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 5 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 5 – Equazioni di secondo grado</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$2\sin^2 x + \sin x - 1 = 0$" /></span>
                                    <p style={S.solText}>
                                        Si pone <L s="$t = \sin x$" /> con <L s="$t \in [-1,\,1]$" />. Si risolve l'equazione di secondo grado:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"2t^2 + t - 1 = 0 \\quad\\Rightarrow\\quad t = \\frac{-1 \\pm \\sqrt{1 + 8}}{4} = \\frac{-1 \\pm 3}{4}"}</DisplayMath>
                                        <DisplayMath>{"t_1 = \\frac{2}{4} = \\frac{1}{2} \\qquad t_2 = \\frac{-4}{4} = -1"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Entrambi i valori sono accettabili (<L s="$t \in [-1,1]$" />):</p>
                                        <DisplayMath>{"\\sin x = \\frac{1}{2} \\quad\\Rightarrow\\quad x = \\frac{\\pi}{6} + 2k\\pi \\quad\\text{oppure}\\quad x = \\frac{5\\pi}{6} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"\\sin x = -1 \\quad\\Rightarrow\\quad x = -\\frac{\\pi}{2} + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*b) <L s="$\cos^2 x - \dfrac{3}{4} = 0$" /></span>
                                    <p style={S.solText}>
                                        Si isola il coseno quadrato e si estrae la radice:
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\cos^2 x = \\frac{3}{4} \\quad\\Rightarrow\\quad \\cos x = \\pm\\frac{\\sqrt{3}}{2}"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Entrambi i valori sono accettabili:</p>
                                        <DisplayMath>{"\\cos x = +\\frac{\\sqrt{3}}{2} \\quad\\Rightarrow\\quad x = \\pm\\frac{\\pi}{6} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"\\cos x = -\\frac{\\sqrt{3}}{2} \\quad\\Rightarrow\\quad x = \\pm\\frac{5\\pi}{6} + 2k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                            Soluzione compatta: <strong><L s="$x = \pm\frac{\pi}{6} + k\pi$" /></strong> &nbsp; (<L s="$k \in \mathbb{Z}$" />)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{
                        marginTop: 40,
                        paddingTop: 16,
                        borderTop: "1px solid #e2e8f0",
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                        fontFamily: "system-ui, sans-serif",
                    }}>
                        Liceo delle Scienze Umane · Matematica · Equazioni Goniometriche · Classe 4M · Giovanni Ugolini
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Helper: riga esercizio con spazio risposta ────────────────────────────────
function EsRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
    const starred = label.startsWith("*");
    return (
        <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            borderBottom: "1px solid #94a3b8",
            paddingBottom: 4,
            minHeight: 52,
        }}>
            <span style={{
                fontWeight: 700,
                fontSize: 13,
                color: starred ? "#7c3aed" : "#1e293b",
                fontFamily: "system-ui, sans-serif",
                flexShrink: 0,
                marginBottom: 2,
            }}>
                {label}
            </span>
            <div style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>{children}</div>
        </div>
    );
}

/**
 * VerificaGoniometria2FilaB - Verifica scritta su Equazioni Goniometriche – FILA B
 * Liceo delle Scienze Umane – Classe 4M – Matematica – San Giovanni Valdarno
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

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

export default function VerificaGoniometria2FilaB(): React.ReactElement {
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "8px 0 4px" }}>
                            <div style={S.title}>Verifica di Matematica</div>
                            <div style={{
                                background: "#b45309",
                                color: "#fff",
                                fontFamily: "system-ui, sans-serif",
                                fontWeight: 800,
                                fontSize: 20,
                                letterSpacing: "2px",
                                padding: "4px 16px",
                                borderRadius: 6,
                                flexShrink: 0,
                            }}>FILA B</div>
                        </div>
                        <div style={S.disciplina}>Equazioni Goniometriche — Compito scritto</div>

                        {/* Campi alunno */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: "10px 24px",
                            marginTop: 14,
                            fontFamily: "system-ui, sans-serif",
                            fontSize: 13,
                            color: "#1e293b",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Cognome e Nome:</span>
                                <span style={{ flex: 1, borderBottom: "1.5px solid #0f172a", minWidth: 220, height: 20, display: "inline-block" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Data:</span>
                                <span style={{ width: 100, borderBottom: "1.5px solid #0f172a", height: 20, display: "inline-block" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Classe:</span>
                                <span style={{ width: 80, borderBottom: "1.5px solid #0f172a", height: 20, display: "inline-block" }} />
                            </div>
                        </div>

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
                            <EsRow label="a)"><L s="$\cos x = -\dfrac{\sqrt{3}}{2}$" /></EsRow>
                            <EsRow label="b)"><L s="$\sin x = 1$" /></EsRow>
                            <EsRow label="c)"><L s="$4\tan x = 4\sqrt{3}$" /></EsRow>
                            <EsRow label="*d)"><L s="$3\sin x = 4$" /></EsRow>
                        </div>

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

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 4, fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "#475569" }}>
                            <span style={{ width: 22, textAlign: "center" }}>V</span>
                            <span style={{ width: 22, textAlign: "center" }}>F</span>
                        </div>

                        <VFItem num="1.">
                            L'equazione <L s="$\cos x = 0$" /> ha come soluzioni <L s="$x = \dfrac{\pi}{2} + k\pi$" />.
                        </VFItem>
                        <VFItem num="2.">
                            L'equazione <L s="$\sin x = -\dfrac{\sqrt{3}}{2}$" /> ha due soluzioni nell'intervallo <L s="$[0,\,2\pi)$" />.
                        </VFItem>
                        <VFItem num="3.">
                            L'equazione <L s="$\tan x = -1$" /> ha come soluzioni <L s="$x = -\dfrac{\pi}{4} + 2k\pi$" />.
                        </VFItem>
                        <VFItem num="4.">
                            L'equazione <L s="$\cos x = \dfrac{3}{2}$" /> non ha soluzioni reali.
                        </VFItem>

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
                            <EsRow label="a)"><L s="$\sin(3x) = \dfrac{1}{2}$" /></EsRow>
                            <EsRow label="b)"><L s="$\cos\!\left(x - \dfrac{\pi}{6}\right) = \sin\dfrac{\pi}{3}$" /></EsRow>
                            <EsRow label="c)"><L s="$\tan x = \sin\dfrac{5\pi}{6} + \cos\dfrac{\pi}{3}$" /></EsRow>
                            <EsRow label="*d)"><L s="$\cos\!\left(x - \dfrac{\pi}{3}\right) = \sin\dfrac{\pi}{4}$" /></EsRow>
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
                            <EsRow label="a)"><L s="$\sin x = \sin\!\left(\dfrac{\pi}{3} - 2x\right)$" /></EsRow>
                            <EsRow label="b)"><L s="$\cos\!\left(2x + \dfrac{\pi}{3}\right) = \cos\!\left(x - \dfrac{\pi}{6}\right)$" /></EsRow>
                            <EsRow label="*c)"><L s="$\tan 2x = \tan\!\left(x + \dfrac{\pi}{3}\right)$" /></EsRow>
                            <EsRow label="d)"><L s="$\sin\!\left(\dfrac{\pi}{4} - x\right) = \sin\!\left(2x + \dfrac{\pi}{4}\right)$" /></EsRow>
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
                            <EsRow label="a)"><L s="$2\sin^2 x - 3\sin x + 1 = 0$" /></EsRow>
                            <EsRow label="*b)"><L s="$\cos^2 x - \dfrac{1}{2} = 0$" /></EsRow>
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
                            <div style={S.soluzioniTitle}>✅ Soluzioni e procedimenti — FILA B</div>

                            {/* ─── Esercizio 1 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 1 – Equazioni elementari</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$\cos x = -\dfrac{\sqrt{3}}{2}$" /></span>
                                    <p style={S.solText}>
                                        Il valore <L s="$\frac{\sqrt{3}}{2}$" /> è noto: <L s="$\cos\frac{\pi}{6} = \frac{\sqrt{3}}{2}$" />. Il coseno è negativo nel II e III quadrante.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x = \\pm\\frac{5\\pi}{6} + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$\sin x = 1$" /></span>
                                    <p style={S.solText}>Il seno vale <L s="$1$" /> solo in <L s="$x = \frac{\pi}{2}$" /> (e sue traslazioni di <L s="$2\pi$" />).</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x = \\frac{\\pi}{2} + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) <L s="$4\tan x = 4\sqrt{3}$" /></span>
                                    <p style={S.solText}>Si divide per 4: <L s="$\tan x = \sqrt{3}$" />. Il valore è noto: <L s="$\tan\frac{\pi}{3} = \sqrt{3}$" />.</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x = \\frac{\\pi}{3} + k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d) <L s="$3\sin x = 4$" /></span>
                                    <p style={S.solText}>
                                        Si divide per 3: <L s="$\sin x = \frac{4}{3} \approx 1{,}33$" />. Poiché il codominio del seno è <L s="$[-1,\,1]$" /> e <L s="$\frac{4}{3} > 1$" />, l'equazione è <strong>impossibile</strong>.
                                    </p>
                                    <div style={S.solStep}>
                                        <span style={{ display: "inline-block", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 4, padding: "2px 10px", fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
                                            Impossibile — nessuna soluzione
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 2 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 2 – Vero o Falso</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. <L s="$\cos x = 0 \Rightarrow x = \frac{\pi}{2} + k\pi$" /></span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>Il coseno vale zero nei punti <L s="$\frac{\pi}{2}$" /> e <L s="$\frac{3\pi}{2}$" />, ovvero esattamente per <L s="$x = \frac{\pi}{2} + k\pi$" />.</p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. <L s="$\sin x = -\frac{\sqrt{3}}{2}$" /> ha due soluzioni in <L s="$[0,\,2\pi)$" /></span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>Le due soluzioni sono <L s="$x = \frac{4\pi}{3}$" /> e <L s="$x = \frac{5\pi}{3}$" /> (III e IV quadrante). Il seno negativo ammette sempre due soluzioni per periodo.</p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. <L s="$\tan x = -1 \Rightarrow x = -\frac{\pi}{4} + 2k\pi$" /></span>
                                    <span style={{ display: "inline-block", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 4, padding: "2px 10px", fontSize: 13, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>FALSO ✗</span>
                                    <p style={S.solText}>La tangente ha periodo <L s="$\pi$" /> (non <L s="$2\pi$" />). La formula corretta è:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\tan x = -1 \\implies x = -\\frac{\\pi}{4} + k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. <L s="$\cos x = \frac{3}{2}$" /> non ha soluzioni reali</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}><L s="$\frac{3}{2} = 1{,}5 > 1$" />, ma il codominio del coseno è <L s="$[-1,\,1]$" />. L'equazione è impossibile.</p>
                                </div>
                            </div>

                            {/* ─── Esercizio 3 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 3 – Equazioni riconducibili a quelle elementari</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$\sin(3x) = \dfrac{1}{2}$" /></span>
                                    <p style={S.solText}>Si pone <L s="$\alpha = 3x$" />. Il valore è noto: <L s="$\sin\frac{\pi}{6} = \frac{1}{2}$" />.</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"3x = \\frac{\\pi}{6} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{18} + \\frac{2k\\pi}{3}"}</DisplayMath>
                                        <DisplayMath>{"3x = \\pi - \\frac{\\pi}{6} + 2k\\pi = \\frac{5\\pi}{6} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{5\\pi}{18} + \\frac{2k\\pi}{3}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$\cos\!\left(x - \dfrac{\pi}{6}\right) = \sin\dfrac{\pi}{3}$" /></span>
                                    <p style={S.solText}>
                                        Si calcola il secondo membro: <L s="$\sin\frac{\pi}{3} = \frac{\sqrt{3}}{2}$" />.
                                        Si nota che <L s="$\frac{\sqrt{3}}{2} = \cos\frac{\pi}{6}$" />.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x - \\frac{\\pi}{6} = \\frac{\\pi}{6} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{3} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"x - \\frac{\\pi}{6} = -\\frac{\\pi}{6} + 2k\\pi \\quad\\Rightarrow\\quad x = 2k\\pi"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) <L s="$\tan x = \sin\dfrac{5\pi}{6} + \cos\dfrac{\pi}{3}$" /></span>
                                    <p style={S.solText}>Si calcolano i valori del secondo membro:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\sin\\frac{5\\pi}{6} = \\sin\\!\\left(\\pi - \\frac{\\pi}{6}\\right) = \\sin\\frac{\\pi}{6} = \\frac{1}{2}, \\qquad \\cos\\frac{\\pi}{3} = \\frac{1}{2}"}</DisplayMath>
                                        <DisplayMath>{"\\tan x = \\frac{1}{2} + \\frac{1}{2} = 1 \\quad\\Rightarrow\\quad x = \\frac{\\pi}{4} + k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d) <L s="$\cos\!\left(x - \dfrac{\pi}{3}\right) = \sin\dfrac{\pi}{4}$" /></span>
                                    <p style={S.solText}>Si calcola il secondo membro: <L s="$\sin\frac{\pi}{4} = \frac{\sqrt{2}}{2}$" />. Si nota che <L s="$\frac{\sqrt{2}}{2} = \cos\frac{\pi}{4}$" />.</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x - \\frac{\\pi}{3} = \\frac{\\pi}{4} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{3} + \\frac{\\pi}{4} + 2k\\pi = \\frac{7\\pi}{12} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"x - \\frac{\\pi}{3} = -\\frac{\\pi}{4} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{3} - \\frac{\\pi}{4} + 2k\\pi = \\frac{\\pi}{12} + 2k\\pi"}</DisplayMath>
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
                                    <span style={S.solLabel}>a) <L s="$\sin x = \sin\!\left(\dfrac{\pi}{3} - 2x\right)$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Caso 1:</p>
                                        <DisplayMath>{"x = \\frac{\\pi}{3} - 2x + 2k\\pi \\quad\\Rightarrow\\quad 3x = \\frac{\\pi}{3} + 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{9} + \\frac{2k\\pi}{3}"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>Caso 2:</p>
                                        <DisplayMath>{"x = \\pi - \\left(\\frac{\\pi}{3} - 2x\\right) + 2k\\pi = \\frac{2\\pi}{3} + 2x + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"-x = \\frac{2\\pi}{3} + 2k\\pi \\quad\\Rightarrow\\quad x = -\\frac{2\\pi}{3} + 2k\\pi"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$\cos\!\left(2x + \dfrac{\pi}{3}\right) = \cos\!\left(x - \dfrac{\pi}{6}\right)$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Caso 1:</p>
                                        <DisplayMath>{"2x + \\frac{\\pi}{3} = x - \\frac{\\pi}{6} + 2k\\pi \\quad\\Rightarrow\\quad x = -\\frac{\\pi}{6} - \\frac{\\pi}{3} + 2k\\pi = -\\frac{\\pi}{2} + 2k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>Caso 2:</p>
                                        <DisplayMath>{"2x + \\frac{\\pi}{3} = -\\left(x - \\frac{\\pi}{6}\\right) + 2k\\pi = -x + \\frac{\\pi}{6} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"3x = \\frac{\\pi}{6} - \\frac{\\pi}{3} + 2k\\pi = -\\frac{\\pi}{6} + 2k\\pi \\quad\\Rightarrow\\quad x = -\\frac{\\pi}{18} + \\frac{2k\\pi}{3}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*c) <L s="$\tan 2x = \tan\!\left(x + \dfrac{\pi}{3}\right)$" /></span>
                                    <p style={S.solText}>Per la tangente si usa direttamente l'unica famiglia di soluzioni:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"2x = x + \\frac{\\pi}{3} + k\\pi \\quad\\Rightarrow\\quad x = \\frac{\\pi}{3} + k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>d) <L s="$\sin\!\left(\dfrac{\pi}{4} - x\right) = \sin\!\left(2x + \dfrac{\pi}{4}\right)$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Caso 1:</p>
                                        <DisplayMath>{"\\frac{\\pi}{4} - x = 2x + \\frac{\\pi}{4} + 2k\\pi \\quad\\Rightarrow\\quad -x = 2x + 2k\\pi \\quad\\Rightarrow\\quad -3x = 2k\\pi \\quad\\Rightarrow\\quad x = \\frac{2k\\pi}{3}"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>Caso 2:</p>
                                        <DisplayMath>{"\\frac{\\pi}{4} - x = \\pi - \\left(2x + \\frac{\\pi}{4}\\right) + 2k\\pi = \\frac{3\\pi}{4} - 2x + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"x = \\frac{3\\pi}{4} - \\frac{\\pi}{4} + 2k\\pi = \\frac{\\pi}{2} + 2k\\pi"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Esercizio 5 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 5 – Equazioni di secondo grado</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$2\sin^2 x - 3\sin x + 1 = 0$" /></span>
                                    <p style={S.solText}>Si pone <L s="$t = \sin x$" /> con <L s="$t \in [-1,\,1]$" />:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"2t^2 - 3t + 1 = 0 \\quad\\Rightarrow\\quad (2t - 1)(t - 1) = 0 \\quad\\Rightarrow\\quad t_1 = \\frac{1}{2},\\; t_2 = 1"}</DisplayMath>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Entrambi i valori sono accettabili:</p>
                                        <DisplayMath>{"\\sin x = \\frac{1}{2} \\quad\\Rightarrow\\quad x = \\frac{\\pi}{6} + 2k\\pi \\;\\text{ oppure }\\; x = \\frac{5\\pi}{6} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"\\sin x = 1 \\quad\\Rightarrow\\quad x = \\frac{\\pi}{2} + 2k\\pi \\qquad (k \\in \\mathbb{Z})"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*b) <L s="$\cos^2 x - \dfrac{1}{2} = 0$" /></span>
                                    <p style={S.solText}>Si isola il coseno al quadrato e si estrae la radice:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\cos^2 x = \\frac{1}{2} \\quad\\Rightarrow\\quad \\cos x = \\pm\\frac{\\sqrt{2}}{2} = \\pm\\frac{1}{\\sqrt{2}}"}</DisplayMath>
                                        <DisplayMath>{"\\cos x = +\\frac{\\sqrt{2}}{2} \\quad\\Rightarrow\\quad x = \\pm\\frac{\\pi}{4} + 2k\\pi"}</DisplayMath>
                                        <DisplayMath>{"\\cos x = -\\frac{\\sqrt{2}}{2} \\quad\\Rightarrow\\quad x = \\pm\\frac{3\\pi}{4} + 2k\\pi"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                            Forma compatta: <strong><L s="$x = \pm\dfrac{\pi}{4} + k\pi$" /></strong> &nbsp; (<L s="$k \in \mathbb{Z}$" />)
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
                        Liceo delle Scienze Umane · Matematica · Equazioni Goniometriche · Classe 4M · Giovanni Ugolini — FILA B
                    </div>
                </div>
            </div>
        </>
    );
}

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

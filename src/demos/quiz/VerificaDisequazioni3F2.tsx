import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

type Fila = "A" | "B";

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
    btnFila: (active: boolean, fila: Fila): React.CSSProperties => ({
        padding: "6px 20px",
        border: active
            ? `2px solid ${fila === "A" ? "#1e40af" : "#9d174d"}`
            : "2px solid #e2e8f0",
        borderRadius: 6,
        background: active
            ? fila === "A" ? "#dbeafe" : "#fce7f3"
            : "#f8fafc",
        color: active
            ? fila === "A" ? "#1e40af" : "#9d174d"
            : "#94a3b8",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "1px",
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
    } as React.CSSProperties,
    parte: { marginBottom: 28 } as React.CSSProperties,
    punti: { float: "right" as const, fontWeight: 400, color: "#64748b" } as React.CSSProperties,
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
    linea: (h: number): React.CSSProperties => ({
        height: h,
        borderBottom: "1px dashed #cbd5e1",
    }),
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
    solText: { fontSize: 13, lineHeight: 1.8, color: "#1e293b" } as React.CSSProperties,
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

export default function VerificaDisequazioni3F2(): React.ReactElement {
    const [fila, setFila] = useState<Fila>("A");
    const [showSoluzioni, setShowSoluzioni] = useState(false);

    const filaBadge = fila === "A"
        ? { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" }
        : { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" };

    return (
        <>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .soluzioni-section { display: none !important; }
                    body { background: white; }
                    .verifica-sheet { box-shadow: none !important; border-radius: 0 !important; padding: 20mm 18mm !important; }
                    .verifica-page { background: white !important; padding: 0 !important; }
                }
            `}</style>

            <div style={S.page} className="verifica-page">
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    <div style={S.topBar} className="no-print">
                        <Link to="/" style={S.btnBack}>← Home</Link>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button style={S.btnFila(fila === "A", "A")} onClick={() => { setFila("A"); setShowSoluzioni(false); }}>FILA A</button>
                            <button style={S.btnFila(fila === "B", "B")} onClick={() => { setFila("B"); setShowSoluzioni(false); }}>FILA B</button>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
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

                    {/* ── Intestazione ── */}
                    <div style={S.headerDoc}>
                        <div style={S.istituto}>Liceo — San Giovanni Valdarno — Classe 3ª F</div>
                        <div style={S.title}>Verifica di Matematica</div>
                        <div style={S.disciplina}>Disequazioni di 2° grado e Circonferenza</div>
                        <div style={{ textAlign: "center", marginBottom: 4 }}>
                            <span style={{
                                display: "inline-block",
                                background: filaBadge.bg,
                                color: filaBadge.color,
                                fontWeight: 700,
                                fontSize: 15,
                                letterSpacing: "2px",
                                padding: "3px 18px",
                                borderRadius: 4,
                                border: `1px solid ${filaBadge.border}`,
                                fontFamily: "system-ui, sans-serif",
                            }}>FILA {fila}</span>
                        </div>
                        <div style={S.metaRow}>
                            <span>Maggio 2026</span>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>

                    <div style={S.noteBox}>
                        Mostra tutti i passaggi del ragionamento. Per le domande a risposta multipla motiva la scelta.
                    </div>

                    {/* ════════════════════════════════════
                        PARTE A – Risposta multipla: Circonferenza
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte A – Domande a risposta multipla: la Circonferenza
                            <span style={S.punti}>(28 punti)</span>
                        </div>
                        <p style={S.istruzione}>
                            Indica la risposta corretta e motiva brevemente la scelta (2 righe).
                        </p>

                        {/* A.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è l'equazione della circonferenza con centro <L s="$C(-2,\,4)$" /> e raggio <L s="$r = 3$" />?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$(x-2)^2 + (y+4)^2 = 9$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$(x+2)^2 + (y-4)^2 = 3$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$(x-2)^2 + (y-4)^2 = 9$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$(x+2)^2 + (y-4)^2 = 9$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è il centro e il raggio della circonferenza di equazione{" "}
                                        <L s="$x^2 + y^2 + 2x - 8y + 8 = 0$" />?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Centro <L s="$(1,\,-4)$" />, raggio <L s="$3$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> Centro <L s="$(-1,\,4)$" />, raggio <L s="$9$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> Centro <L s="$(1,\,4)$" />, raggio <L s="$3$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> Centro <L s="$(-1,\,4)$" />, raggio <L s="$3$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* A.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è il centro e il raggio della circonferenza di equazione{" "}
                                        <L s="$(x-5)^2 + (y+1)^2 = 36$" />?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Centro <L s="$(-5,\,1)$" />, raggio <L s="$36$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> Centro <L s="$(5,\,-1)$" />, raggio <L s="$36$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> Centro <L s="$(-5,\,1)$" />, raggio <L s="$6$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> Centro <L s="$(5,\,-1)$" />, raggio <L s="$6$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Il punto <L s="$Q(3,\,1)$" /> rispetto alla circonferenza <L s="$x^2 + y^2 = 16$" /> è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Esterno alla circonferenza</span>
                                    <span style={S.mcOption}><strong>B.</strong> Sulla circonferenza</span>
                                    <span style={S.mcOption}><strong>C.</strong> Interno alla circonferenza</span>
                                    <span style={S.mcOption}><strong>D.</strong> Non si può determinare senza conoscere il raggio</span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* A.c */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Il punto <L s="$P(3,\,4)$" /> rispetto alla circonferenza <L s="$x^2 + y^2 = 36$" /> è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Esterno alla circonferenza</span>
                                    <span style={S.mcOption}><strong>B.</strong> Sulla circonferenza</span>
                                    <span style={S.mcOption}><strong>C.</strong> Interno alla circonferenza</span>
                                    <span style={S.mcOption}><strong>D.</strong> Non si può determinare senza conoscere il raggio</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è l'equazione della circonferenza con centro <L s="$C(2,\,-3)$" /> e raggio <L s="$r = 5$" />?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$(x+2)^2 + (y-3)^2 = 25$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$(x-2)^2 + (y-3)^2 = 25$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$(x-2)^2 + (y+3)^2 = 5$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$(x-2)^2 + (y+3)^2 = 25$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* A.d */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>d)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è il centro e il raggio della circonferenza di equazione{" "}
                                        <L s="$x^2 + y^2 - 6x + 2y + 6 = 0$" />?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Centro <L s="$(3,\,-1)$" />, raggio <L s="$4$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> Centro <L s="$(-3,\,1)$" />, raggio <L s="$2$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> Centro <L s="$(3,\,1)$" />, raggio <L s="$2$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> Centro <L s="$(3,\,-1)$" />, raggio <L s="$2$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è il centro e il raggio della circonferenza di equazione{" "}
                                        <L s="$(x+2)^2 + (y-5)^2 = 49$" />?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Centro <L s="$(2,\,-5)$" />, raggio <L s="$49$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> Centro <L s="$(-2,\,5)$" />, raggio <L s="$49$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> Centro <L s="$(2,\,-5)$" />, raggio <L s="$7$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> Centro <L s="$(-2,\,5)$" />, raggio <L s="$7$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Disequazioni di 2° grado
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte B – Esercizi: disequazioni di 2° grado
                            <span style={S.punti}>(48 punti)</span>
                        </div>

                        {/* B.1 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(16 punti)</span>
                            </span>
                            <p style={S.domandaText}>
                                Risolvi la disequazione:{" "}
                                {fila === "A"
                                    ? <L s="$\quad {-x^2 + 6x - 8 > 0}$" />
                                    : <L s="$\quad {-x^2 + 2x + 3 > 0}$" />
                                }
                            </p>
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                        </div>

                        <div style={{ height: 20 }} />

                        {/* B.2 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(16 punti)</span>
                            </span>
                            <p style={S.domandaText}>
                                Risolvi la disequazione, portandola prima in forma normale:
                            </p>
                            <div style={{ margin: "4px 0 8px", textAlign: "center" as const }}>
                                {fila === "A"
                                    ? <DisplayMath>{"\\dfrac{(x-3)^2}{2} \\leq x + 1"}</DisplayMath>
                                    : <DisplayMath>{"\\dfrac{(x+1)^2}{2} \\leq x + 5"}</DisplayMath>
                                }
                            </div>
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                        </div>

                        <div style={{ height: 20 }} />

                        {/* B.3 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                3) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(16 punti)</span>
                            </span>
                            <p style={S.domandaText}>
                                Risolvi la disequazione:{" "}
                                {fila === "A"
                                    ? <L s="$\quad \dfrac{x^2 - 3x - 4}{x - 2} \geq 0$" />
                                    : <L s="$\quad \dfrac{x + 2}{x^2 + x - 6} \geq 0$" />
                                }
                            </p>
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Problema
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte C – Problema
                            <span style={S.punti}>(24 punti)</span>
                        </div>

                        <div style={S.domanda}>
                            <p style={S.domandaText}>
                                Una pallina viene lanciata verticalmente verso l'alto. La sua altezza in metri
                                al tempo <L s="$t$" /> (in secondi) è descritta dalla legge:
                            </p>
                            <div style={{ margin: "8px 0 12px", textAlign: "center" as const }}>
                                {fila === "A"
                                    ? <DisplayMath>{"h(t) = -2t^2 + 10t"}</DisplayMath>
                                    : <DisplayMath>{"h(t) = -5t^2 + 30t"}</DisplayMath>
                                }
                            </div>
                            <p style={S.domandaText}>
                                Per quali valori di <L s="$t$" /> la pallina si trova ad un'altezza
                                {fila === "A"
                                    ? <strong> maggiore di 8 metri</strong>
                                    : <strong> maggiore di 40 metri</strong>
                                }?
                            </p>
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                            <div style={S.linea(56)} />
                        </div>
                    </div>

                    {/* ── Tabella voto ── */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, fontFamily: "system-ui, sans-serif" }}>
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
                        SOLUZIONI
                    ════════════════════════════════════ */}
                    {showSoluzioni && (
                        <div style={S.soluzioniSection} className="soluzioni-section no-print">
                            <div style={S.soluzioniTitle}>✅ Soluzioni — Fila {fila}</div>

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposta multipla: Circonferenza</div>

                                {/* Sol A.a */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>a) Equazione con C(−2, 4), r = 3</span>
                                            <span style={S.solRisposta}>Risposta: D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13, marginBottom: 4 }}>
                                                    Formula <L s="$(x-a)^2+(y-b)^2=r^2$" /> con <L s="$a=-2,\,b=4,\,r=3$" />:
                                                </p>
                                                <DisplayMath>{"(x-(-2))^2+(y-4)^2=3^2 \\quad\\Rightarrow\\quad (x+2)^2+(y-4)^2=9"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>
                                                    A sbagliata: segno del centro invertito. B sbagliata: <L s="$r=3$" /> invece di <L s="$r^2=9$" />. C sbagliata: entrambi i segni errati.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>a) Centro e raggio di x² + y² + 2x − 8y + 8 = 0</span>
                                            <span style={S.solRisposta}>Risposta: D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13, marginBottom: 4 }}>Completamento del quadrato:</p>
                                                <DisplayMath>{"(x^2 + 2x + 1) + (y^2 - 8y + 16) = -8 + 1 + 16 = 9"}</DisplayMath>
                                                <DisplayMath>{"(x+1)^2 + (y-4)^2 = 9"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>Centro <L s="$(-1,\,4)$" />, raggio <L s="$r = \sqrt{9} = 3$" />.</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sol A.b */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>b) Centro e raggio di (x−5)² + (y+1)² = 36</span>
                                            <span style={S.solRisposta}>Risposta: D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13, marginBottom: 4 }}>
                                                    Confronto con <L s="$(x-a)^2+(y-b)^2=r^2$" />: si ha <L s="$(x-5)^2+(y-(-1))^2=6^2$" />.
                                                </p>
                                                <DisplayMath>{"a=5,\\quad b=-1,\\quad r=\\sqrt{36}=6"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>A e C sbagliate: segno del centro invertito. B sbagliata: confonde <L s="$r^2$" /> con <L s="$r$" />.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>b) Posizione di Q(3, 1) rispetto a x² + y² = 16</span>
                                            <span style={S.solRisposta}>Risposta: C — interno</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"3^2 + 1^2 = 9 + 1 = 10 < 16 = r^2 \\quad \\Rightarrow \\quad Q \\text{ è interno}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sol A.c */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>c) Posizione di P(3, 4) rispetto a x² + y² = 36</span>
                                            <span style={S.solRisposta}>Risposta: C — interno</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"3^2 + 4^2 = 9 + 16 = 25 < 36 = r^2 \\quad \\Rightarrow \\quad P \\text{ è interno}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>c) Equazione con C(2, −3), r = 5</span>
                                            <span style={S.solRisposta}>Risposta: D</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"(x-2)^2 + (y-(-3))^2 = 5^2 \\quad \\Rightarrow \\quad (x-2)^2 + (y+3)^2 = 25"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sol A.d */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>d) Centro e raggio di x² + y² − 6x + 2y + 6 = 0</span>
                                            <span style={S.solRisposta}>Risposta: D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13, marginBottom: 4 }}>Completamento del quadrato:</p>
                                                <DisplayMath>{"(x^2-6x+9)+(y^2+2y+1)=-6+9+1=4"}</DisplayMath>
                                                <DisplayMath>{"(x-3)^2+(y+1)^2=4"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>Centro <L s="$(3,\,-1)$" />, raggio <L s="$r=\sqrt{4}=2$" />. A sbagliata: <L s="$r=4$" /> (confonde <L s="$r^2$" /> con <L s="$r$" />). B e C sbagliate: segno del centro errato.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>d) Centro e raggio di (x+2)² + (y−5)² = 49</span>
                                            <span style={S.solRisposta}>Risposta: D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13, marginBottom: 4 }}>
                                                    Forma canonica <L s="$(x-a)^2+(y-b)^2=r^2$" />: confronto con <L s="$(x-(-2))^2+(y-5)^2=7^2$" />.
                                                </p>
                                                <DisplayMath>{"a = -2,\\quad b = 5,\\quad r = \\sqrt{49} = 7"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>
                                                    A e B sbagliate: confondono <L s="$r^2=49$" /> con il raggio. C sbagliata: segno del centro invertito.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Disequazioni</div>

                                {/* Sol B.1 */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>1) −x² + 6x − 8 &gt; 0</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Moltiplicazione per −1</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 - 6x + 8 < 0"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>Moltiplicando per un numero negativo il verso si inverte.</p>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Discriminante e radici</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"\\Delta = 36 - 32 = 4 \\quad \\Rightarrow \\quad x_{1,2} = \\frac{6 \\pm 2}{2} \\quad \\Rightarrow \\quad x_1 = 2,\\quad x_2 = 4"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Soluzione</p>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}><L s="$a=1>0$" /> → parabola verso l'alto → <L s="$<0$" /> tra le radici.</p>
                                                <DisplayMath>{"\\boxed{2 < x < 4}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>1) −x² + 2x + 3 &gt; 0</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Moltiplicazione per −1</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 - 2x - 3 < 0"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>Moltiplicando per un numero negativo il verso si inverte.</p>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Discriminante e radici</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"\\Delta = 4 + 12 = 16 \\quad \\Rightarrow \\quad x_{1,2} = \\frac{2 \\pm 4}{2} \\quad \\Rightarrow \\quad x_1 = -1,\\quad x_2 = 3"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Soluzione</p>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}><L s="$a=1>0$" /> → parabola verso l'alto → <L s="$<0$" /> tra le radici.</p>
                                                <DisplayMath>{"\\boxed{-1 < x < 3}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sol B.2 */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>2) (x−3)²/2 ≤ x + 1</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Moltiplicazione per 2</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"(x-3)^2 \\leq 2x + 2"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Sviluppo e forma normale</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 - 6x + 9 \\leq 2x + 2 \\quad \\Rightarrow \\quad x^2 - 8x + 7 \\leq 0"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Discriminante e radici</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"\\Delta = 64 - 28 = 36 \\quad \\Rightarrow \\quad x_{1,2} = \\frac{8 \\pm 6}{2} \\quad \\Rightarrow \\quad x_1 = 1,\\quad x_2 = 7"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iv) Soluzione</p>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}><L s="$a=1>0$" /> → <L s="$\leq 0$" /> tra le radici (estremi inclusi).</p>
                                                <DisplayMath>{"\\boxed{1 \\leq x \\leq 7}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>2) (x+1)²/2 ≤ x + 5</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Moltiplicazione per 2</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"(x+1)^2 \\leq 2x + 10"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Sviluppo e forma normale</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 + 2x + 1 \\leq 2x + 10 \\quad \\Rightarrow \\quad x^2 - 9 \\leq 0"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Discriminante e radici</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 - 9 = 0 \\quad \\Rightarrow \\quad x^2 = 9 \\quad \\Rightarrow \\quad x_1 = -3,\\quad x_2 = 3"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iv) Soluzione</p>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}><L s="$a=1>0$" /> → <L s="$\leq 0$" /> tra le radici (estremi inclusi).</p>
                                                <DisplayMath>{"\\boxed{-3 \\leq x \\leq 3}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Sol B.3 */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>3) (x² − 3x − 4)/(x − 2) ≥ 0</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Fattorizzazione e zeri</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 - 3x - 4 = (x+1)(x-4)"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>
                                                    Zeri del numeratore: <L s="$x=-1$" /> e <L s="$x=4$" /> (inclusi).{" "}
                                                    Zero del denominatore: <L s="$x=2$" /> (escluso).
                                                </p>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Tabella dei segni</p>
                                            <div style={S.solStep}>
                                                <SignTable
                                                    headers={["", "x < −1", "x = −1", "−1 < x < 2", "x = 2", "2 < x < 4", "x = 4", "x > 4"]}
                                                    rows={[
                                                        ["(x+1)", "−", "0", "+", "+", "+", "+", "+"],
                                                        ["(x−4)", "−", "−", "−", "−", "−", "0", "+"],
                                                        ["(x−2)", "−", "−", "−", "0", "+", "+", "+"],
                                                        ["frazione", "−", "0", "+", "✗", "−", "0", "+"],
                                                    ]}
                                                />
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Soluzione</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"\\boxed{[-1,\\,2)\\cup[4,\\,+\\infty)}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>3) (x + 2)/(x² + x − 6) ≥ 0</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Fattorizzazione e zeri</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x^2 + x - 6 = (x+3)(x-2)"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>
                                                    Zero del numeratore: <L s="$x=-2$" /> (incluso, annulla la frazione).{" "}
                                                    Zeri del denominatore: <L s="$x=-3$" /> e <L s="$x=2$" /> (esclusi).
                                                </p>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Tabella dei segni</p>
                                            <div style={S.solStep}>
                                                <SignTable
                                                    headers={["", "x < −3", "x = −3", "−3 < x < −2", "x = −2", "−2 < x < 2", "x = 2", "x > 2"]}
                                                    rows={[
                                                        ["(x+2)", "−", "−", "−", "0", "+", "+", "+"],
                                                        ["(x+3)", "−", "0", "+", "+", "+", "+", "+"],
                                                        ["(x−2)", "−", "−", "−", "−", "−", "0", "+"],
                                                        ["frazione", "−", "✗", "+", "0", "−", "✗", "+"],
                                                    ]}
                                                />
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Soluzione</p>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>La frazione è <L s="$\geq 0$" /> (positiva o nulla) in:</p>
                                                <DisplayMath>{"\\boxed{(-3,\\,-2\\,]\\cup(2,\\,+\\infty)}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Problema</div>

                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>h(t) = −2t² + 10t &gt; 8</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Impostazione</p>
                                            <div style={S.solStep}><DisplayMath>{"-2t^2 + 10t > 8"}</DisplayMath></div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forma normale</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"-2t^2 + 10t - 8 > 0"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>Divido per <L s="$-2$" /> (il verso si inverte):</p>
                                                <DisplayMath>{"t^2 - 5t + 4 < 0"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Radici e soluzione</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"\\Delta = 25 - 16 = 9 \\quad \\Rightarrow \\quad t_{1,2} = \\frac{5 \\pm 3}{2} \\quad \\Rightarrow \\quad t_1 = 1,\\quad t_2 = 4"}</DisplayMath>
                                                <DisplayMath>{"\\boxed{1 < t < 4}"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 6 }}>
                                                    La pallina supera gli 8 m per <strong>3 secondi</strong>.
                                                    Altezza massima a <L s="$t=2{,}5\,\text{s}$" />: <L s="$h(2{,}5)=-2(6{,}25)+25=12{,}5\,\text{m}$" />.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>h(t) = −5t² + 30t &gt; 40</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Impostazione</p>
                                            <div style={S.solStep}><DisplayMath>{"-5t^2 + 30t > 40"}</DisplayMath></div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forma normale</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"-5t^2 + 30t - 40 > 0"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>Divido per <L s="$-5$" /> (il verso si inverte):</p>
                                                <DisplayMath>{"t^2 - 6t + 8 < 0"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Radici e soluzione</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"\\Delta = 36 - 32 = 4 \\quad \\Rightarrow \\quad t_{1,2} = \\frac{6 \\pm 2}{2} \\quad \\Rightarrow \\quad t_1 = 2,\\quad t_2 = 4"}</DisplayMath>
                                                <DisplayMath>{"\\boxed{2 < t < 4}"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 6 }}>
                                                    La pallina supera i 40 m per <strong>2 secondi</strong>.
                                                    Altezza massima a <L s="$t=3\,\text{s}$" />: <L s="$h(3)=-45+90=45\,\text{m}$" />.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 32, fontSize: 11, color: "#94a3b8", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
                        Classe 3F · Matematica · Disequazioni e Circonferenza · Fila {fila} · Giovanni Ugolini · Maggio 2026
                    </div>
                </div>
            </div>
        </>
    );
}

function SignTable({ headers, rows }: { headers: string[]; rows: string[][] }): React.ReactElement {
    return (
        <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%", marginTop: 4 }}>
            <thead>
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} style={{ border: "1px solid #cbd5e1", padding: "4px 6px", background: "#f8fafc", fontWeight: 600 }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j} style={{
                                border: "1px solid #cbd5e1",
                                padding: "4px 6px",
                                textAlign: "center",
                                fontWeight: j === 0 ? 600 : 400,
                                background: i === rows.length - 1 ? "#fef9c3" : "white",
                                color: cell === "✗" ? "#dc2626" : cell === "0" ? "#16a34a" : "inherit",
                            }}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function RigaRisposta(): React.ReactElement {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif" }}>
            <span>Risposta:</span>
            <span style={{ width: 60, borderBottom: "1px solid #94a3b8", display: "inline-block" }}></span>
        </div>
    );
}

function RigaMotivazione(): React.ReactElement {
    const s: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif" };
    const l: React.CSSProperties = { flex: 1, borderBottom: "1px solid #94a3b8", minWidth: 80 };
    return (
        <>
            <div style={s}><span>Motivazione:</span><span style={l}></span></div>
            <div style={s}><span style={{ opacity: 0 }}>Motivazione:</span><span style={l}></span></div>
        </>
    );
}

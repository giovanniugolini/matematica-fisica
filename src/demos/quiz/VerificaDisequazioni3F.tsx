/**
 * VerificaDisequazioni3F – Simulazione di verifica
 * Classe 3ª F – Matematica
 * Disequazioni di 2° grado (intere e fratte) e Circonferenza
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

export default function VerificaDisequazioni3F(): React.ReactElement {
    const [showSoluzioni, setShowSoluzioni] = useState(false);

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
                        <div style={S.title}>Simulazione di Verifica di Matematica</div>
                        <div style={S.disciplina}>Disequazioni di 2° grado e Circonferenza</div>
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
                        PARTE A – Domande a risposta multipla: Circonferenza
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
                            <p style={S.domandaText}>
                                Qual è il centro e il raggio della circonferenza di equazione{" "}
                                <L s="$x^2 + y^2 - 4x + 6y - 3 = 0$" />?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> Centro <L s="$(-2,\,3)$" />, raggio <L s="$4$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> Centro <L s="$(2,\,-3)$" />, raggio <L s="$\sqrt{3}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> Centro <L s="$(2,\,-3)$" />, raggio <L s="$16$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> Centro <L s="$(2,\,-3)$" />, raggio <L s="$4$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* A.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Il punto <L s="$P(1,\,2)$" /> rispetto alla circonferenza <L s="$x^2 + y^2 = 10$" /> è:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> Esterno alla circonferenza</span>
                            <span style={S.mcOption}><strong>B.</strong> Sulla circonferenza</span>
                            <span style={S.mcOption}><strong>C.</strong> Interno alla circonferenza</span>
                            <span style={S.mcOption}><strong>D.</strong> Non si può determinare senza conoscere il raggio</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* A.c */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>
                                Qual è l'equazione della circonferenza con centro <L s="$C(-1,\,3)$" /> e raggio <L s="$r = 2$" />?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$(x-1)^2 + (y+3)^2 = 4$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$(x+1)^2 + (y-3)^2 = 2$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$(x+1)^2 + (y+3)^2 = 4$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$(x+1)^2 + (y-3)^2 = 4$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* A.d */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>d)</span>
                            <p style={S.domandaText}>
                                Qual è la posizione reciproca della retta <L s="$y = x + 4$" /> rispetto alla
                                circonferenza <L s="$x^2 + y^2 = 9$" />?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> Tangente</span>
                            <span style={S.mcOption}><strong>B.</strong> Esterna</span>
                            <span style={S.mcOption}><strong>C.</strong> Secante</span>
                            <span style={S.mcOption}><strong>D.</strong> Coincidente con il diametro</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Esercizi: disequazioni di 2° grado
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
                                Risolvi la disequazione: <L s="$\quad {-x^2 + 4x - 3 > 0}$" />
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
                                <DisplayMath>{"\\dfrac{(x-1)^2}{2} \\leq x + 3"}</DisplayMath>
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
                                Risolvi la disequazione: <L s="$\quad \dfrac{x^2 - x - 6}{x - 1} \geq 0$" />
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
                                <DisplayMath>{"h(t) = -5t^2 + 20t"}</DisplayMath>
                            </div>
                            <p style={S.domandaText}>
                                Per quali valori di <L s="$t$" /> la pallina si trova ad un'altezza
                                <strong> maggiore di 15 metri</strong>?
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
                            <div style={S.soluzioniTitle}>✅ Soluzioni</div>

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposta multipla: Circonferenza</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Centro e raggio di x² + y² − 4x + 6y − 3 = 0</span>
                                    <span style={S.solRisposta}>Risposta: D</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>Completamento del quadrato:</p>
                                        <DisplayMath>{"(x^2 - 4x + 4) + (y^2 + 6y + 9) = 3 + 4 + 9 = 16"}</DisplayMath>
                                        <DisplayMath>{"(x-2)^2 + (y+3)^2 = 16"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>Centro <L s="$(2,\,-3)$" />, raggio <L s="$r = \sqrt{16} = 4$" />.</p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Posizione di P(1, 2) rispetto a x² + y² = 10</span>
                                    <span style={S.solRisposta}>Risposta: C — interno</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"1^2 + 2^2 = 1 + 4 = 5 < 10 = r^2 \\quad \\Rightarrow \\quad P \\text{ è interno}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) Equazione con C(−1, 3), r = 2</span>
                                    <span style={S.solRisposta}>Risposta: D</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"(x - (-1))^2 + (y - 3)^2 = 2^2 \\quad \\Rightarrow \\quad (x+1)^2 + (y-3)^2 = 4"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>d) Posizione di y = x + 4 rispetto a x² + y² = 9</span>
                                    <span style={S.solRisposta}>Risposta: C — secante</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>Sostituisco <L s="$y = x+4$" /> nell'equazione della circonferenza:</p>
                                        <DisplayMath>{"x^2 + (x+4)^2 = 9 \\;\\Rightarrow\\; 2x^2 + 8x + 16 = 9 \\;\\Rightarrow\\; 2x^2 + 8x + 7 = 0"}</DisplayMath>
                                        <DisplayMath>{"\\Delta = 64 - 56 = 8 > 0 \\quad \\Rightarrow \\quad \\text{due punti di intersezione} \\Rightarrow \\text{secante}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Disequazioni</div>

                                {/* B.1 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1) −x² + 4x − 3 &gt; 0</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Moltiplicazione per −1</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"(-1)\\cdot(-x^2+4x-3) < (-1)\\cdot 0 \\quad \\Rightarrow \\quad x^2 - 4x + 3 < 0"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>Moltiplicando per un numero negativo il verso si inverte.</p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Discriminante e radici</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\Delta = 16 - 12 = 4 \\quad \\Rightarrow \\quad x_{1,2} = \\frac{4 \\pm 2}{2} \\quad \\Rightarrow \\quad x_1 = 1,\\quad x_2 = 3"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Segno e soluzione</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            <L s="$a = 1 > 0$" /> → parabola verso l'alto → <L s="$< 0$" /> tra le radici (estremi esclusi).
                                        </p>
                                        <DisplayMath>{"\\boxed{1 < x < 3}"}</DisplayMath>
                                    </div>
                                </div>

                                {/* B.2 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2) (x−1)²/2 ≤ x + 3</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Moltiplicazione per 2</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"(x-1)^2 \\leq 2x + 6"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>Il fattore 2 è positivo: il verso non cambia.</p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Sviluppo e forma normale</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x^2 - 2x + 1 \\leq 2x + 6 \\quad \\Rightarrow \\quad x^2 - 4x - 5 \\leq 0"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Discriminante e radici</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\Delta = 16 + 20 = 36 \\quad \\Rightarrow \\quad x_{1,2} = \\frac{4 \\pm 6}{2} \\quad \\Rightarrow \\quad x_1 = -1,\\quad x_2 = 5"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iv) Segno e soluzione</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            <L s="$a = 1 > 0$" /> → parabola verso l'alto → <L s="$\leq 0$" /> tra le radici (estremi inclusi).
                                        </p>
                                        <DisplayMath>{"\\boxed{-1 \\leq x \\leq 5}"}</DisplayMath>
                                    </div>
                                </div>

                                {/* B.3 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3) (x² − x − 6)/(x − 1) ≥ 0</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Fattorizzazione e zeri</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x^2 - x - 6 = (x+2)(x-3)"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Zeri del numeratore: <L s="$x = -2$" /> e <L s="$x = 3$" /> (inclusi, annullano la frazione).<br />
                                            Zero del denominatore: <L s="$x = 1$" /> (escluso, rende la frazione indefinita).
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Tabella dei segni</p>
                                    <div style={S.solStep}>
                                        <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%", marginTop: 4 }}>
                                            <thead>
                                                <tr>
                                                    {["", "x < −2", "x = −2", "−2 < x < 1", "x = 1", "1 < x < 3", "x = 3", "x > 3"].map((h, i) => (
                                                        <th key={i} style={{ border: "1px solid #cbd5e1", padding: "4px 6px", background: "#f8fafc", fontWeight: 600 }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    ["(x+2)", "−", "0", "+", "+", "+", "+", "+"],
                                                    ["(x−3)", "−", "−", "−", "−", "−", "0", "+"],
                                                    ["(x−1)", "−", "−", "−", "0", "+", "+", "+"],
                                                    ["frazione", "−", "0", "+", "✗", "−", "0", "+"],
                                                ].map((row, i) => (
                                                    <tr key={i}>
                                                        {row.map((cell, j) => (
                                                            <td key={j} style={{
                                                                border: "1px solid #cbd5e1",
                                                                padding: "4px 6px",
                                                                textAlign: "center",
                                                                fontWeight: j === 0 ? 600 : 400,
                                                                background: i === 3 ? "#fef9c3" : "white",
                                                                color: cell === "✗" ? "#dc2626" : cell === "0" ? "#16a34a" : "inherit",
                                                            }}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Soluzione</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>La frazione è <L s="$\geq 0$" /> (positiva o nulla) in:</p>
                                        <DisplayMath>{"\\boxed{[-2,\\,1)\\cup[3,\\,+\\infty)}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Problema</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>h(t) = −5t² + 20t &gt; 15</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>i) Impostazione</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"-5t^2 + 20t > 15"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Semplificazione</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"-5t^2 + 20t - 15 > 0"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>Divido per <L s="$-5$" /> (il verso si inverte):</p>
                                        <DisplayMath>{"t^2 - 4t + 3 < 0"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Discriminante e radici</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\Delta = 16 - 12 = 4 \\quad \\Rightarrow \\quad t_{1,2} = \\frac{4 \\pm 2}{2} \\quad \\Rightarrow \\quad t_1 = 1,\\quad t_2 = 3"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iv) Soluzione e interpretazione</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}><L s="$a=1>0$" /> → parabola verso l'alto → <L s="$< 0$" /> tra le radici:</p>
                                        <DisplayMath>{"\\boxed{1 < t < 3}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            La pallina si trova ad altezza superiore a 15 m nell'intervallo
                                            <strong> 1 s &lt; t &lt; 3 s</strong>, ovvero per <strong>2 secondi</strong>.<br />
                                            L'altezza massima si raggiunge a <L s="$t = 2\,\text{s}$" />:{" "}
                                            <L s="$h(2) = -5 \cdot 4 + 40 = 20\,\text{m}$" />.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 32, fontSize: 11, color: "#94a3b8", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
                        Classe 3F · Matematica · Disequazioni e Circonferenza · Giovanni Ugolini · Maggio 2026
                    </div>
                </div>
            </div>
        </>
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

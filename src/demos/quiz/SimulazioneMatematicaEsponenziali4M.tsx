/**
 * SimulazioneMatematicaEsponenziali4M – Simulazione: Esponenziali e Logaritmi
 * Liceo Linguistico 4M – Matematica – Maggio 2026
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

function RigaMotivazione(): React.ReactElement {
    const row: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: 12,
        marginTop: 8, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif",
    };
    const linea: React.CSSProperties = {
        flex: 1, borderBottom: "1px solid #94a3b8", minWidth: 80,
    };
    return (
        <>
            <div style={row}>
                <span>Risposta:</span>
                <span style={{ width: 40, borderBottom: "1px solid #94a3b8", display: "inline-block" }} />
                <span style={{ marginLeft: 8 }}>Motivazione:</span>
                <span style={linea} />
            </div>
            <div style={{ ...row, marginTop: 4 }}>
                <span style={{ opacity: 0 }}>Motivazione:</span>
                <span style={linea} />
            </div>
        </>
    );
}

// ─── Stili ──────────────────────────────────────────────────────────────────

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

    parte: { marginBottom: 28 } as React.CSSProperties,

    punti: {
        float: "right" as const,
        fontWeight: 400,
        color: "#64748b",
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

    domanda: { marginBottom: 18 } as React.CSSProperties,

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

// ─── Componente principale ───────────────────────────────────────────────────

export default function SimulazioneMatematicaEsponenziali4M(): React.ReactElement {
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

                <div style={S.sheet} className="verifica-sheet">

                    {/* ── Intestazione ── */}
                    <div style={S.headerDoc}>
                        <div style={S.istituto}>Liceo delle Scienze Umane — San Giovanni Valdarno — Classe 4ª M</div>
                        <div style={S.title}>Simulazione di Matematica</div>
                        <div style={S.disciplina}>
                            Funzioni esponenziali e logaritmiche · Equazioni · Proprietà dei logaritmi
                        </div>
                        <div style={S.metaRow}>
                            <span>Maggio 2026</span>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#78350f", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 6, padding: "6px 12px", marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>
                        Gli esercizi contrassegnati con <strong>*</strong> sono facoltativi per BES e DSA.
                    </p>

                    {/* ════════════════════════════════════
                        PARTE A – Risposta multipla
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte A – Domande a risposta multipla <span style={S.punti}>(20 punti · 4 pt ciascuna)</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 14 }}>
                            Per ogni domanda indica la risposta corretta e motiva brevemente la scelta.
                        </p>

                        {/* A.1 — definizione di logaritmo */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>1.</span>
                            <p style={S.domandaText}>
                                Quale delle seguenti uguaglianze esprime correttamente la{" "}
                                <strong>definizione di logaritmo</strong> in base <L s="$a$" /> di <L s="$b$" />?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$\log_a b = c \;\Leftrightarrow\; a^b = c$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$\log_a b = c \;\Leftrightarrow\; a^c = b$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$\log_a b = c \;\Leftrightarrow\; c^a = b$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$\log_a b = c \;\Leftrightarrow\; b^a = c$" /></span>
                        </div>

                        {/* A.2 — dominio / condizione sulla base */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>2.</span>
                            <p style={S.domandaText}>
                                La <strong>funzione esponenziale</strong> <L s="$f(x) = a^x$" /> è definita per
                                ogni valore reale di <L s="$x$" />. Qual è la condizione che deve soddisfare
                                la base <L s="$a$" />?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$a > 1$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$a \neq 0$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$a > 0 \text{ e } a \neq 1$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$a \geq 1$" /></span>
                        </div>

                        {/* A.3 — applicazione proprietà del prodotto */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>3.</span>
                            <p style={S.domandaText}>
                                Quanto vale <L s="$\log_2 6 + \log_2 \dfrac{8}{3}$" />?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$2$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$3$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$4$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$\log_2 \dfrac{48}{3}$" /></span>
                            <RigaMotivazione />
                        </div>

                        {/* A.4 — monotonia */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>4.</span>
                            <p style={S.domandaText}>
                                La funzione esponenziale <L s="$f(x) = a^x$" /> è <strong>decrescente</strong> quando:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$a > 1$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$a = 1$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$0 < a < 1$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$a < 0$" /></span>
                        </div>

                        {/* A.5 — proprietà della potenza (facoltativa) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*5.</span>
                            <p style={S.domandaText}>
                                Applicando le proprietà dei logaritmi, <L s="$\log_a(m^n)$" /> è uguale a:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$(\log_a m)^n$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$\log_a m + n$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$n \cdot \log_a m$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$\log_a n \cdot \log_a m$" /></span>
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Equazioni esponenziali
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte B – Equazioni esponenziali <span style={S.punti}>(30 punti)</span>
                        </div>

                        {/* B.1 — stessa base */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>1.</span>
                            <p style={S.domandaText}>Risolvi l'equazione:</p>
                            <DisplayMath>{"3^{2x-1} = 3^{x+2}"}</DisplayMath>
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        <div style={{ height: 8 }} />

                        {/* B.2 — basi diverse da ricondurre */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>2.</span>
                            <p style={S.domandaText}>
                                Risolvi l'equazione riconductendo entrambi i membri alla stessa base:
                            </p>
                            <DisplayMath>{"4^{x-1} = 2^{x+3}"}</DisplayMath>
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        <div style={{ height: 8 }} />

                        {/* B.3 — equazione esponenziale con esponenti di secondo grado (facoltativa) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*3.</span>
                            <p style={S.domandaText}>
                                Risolvi l'equazione: le basi sono uguali, ma quando uguagli gli esponenti
                                ottieni un'equazione di secondo grado.
                            </p>
                            <DisplayMath>{"2^{x^2} = 2^{3x}"}</DisplayMath>
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Equazioni logaritmiche
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte C – Equazioni logaritmiche <span style={S.punti}>(30 punti · 15 pt ciascuna)</span>
                        </div>

                        {/* C.1 — tipo log_a(g(x)) = b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>1.</span>
                            <p style={S.domandaText}>
                                Risolvi l'equazione (verifica che la soluzione soddisfi le condizioni di esistenza):
                            </p>
                            <DisplayMath>{"\\log_2(3x + 2) = 5"}</DisplayMath>
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        <div style={{ height: 8 }} />

                        {/* C.2 — tipo secondo grado con cambio di variabile */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>2.</span>
                            <p style={S.domandaText}>
                                Risolvi l'equazione logaritmica mediante il cambio di variabile{" "}
                                <L s="$t = \log_3 x$" />:
                            </p>
                            <DisplayMath>{"(\\log_3 x)^2 - 4\\log_3 x + 3 = 0"}</DisplayMath>
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE D – Proprietà dei logaritmi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte D – Espressioni con le proprietà dei logaritmi <span style={S.punti}>(20 punti · 5 pt ciascuna)</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 14 }}>
                            Semplifica ciascuna espressione applicando le proprietà dei logaritmi (prodotto, quoziente, potenza) e calcola il risultato.
                        </p>

                        {[
                            { label: "1.", expr: "\\log_2 4 + \\log_2 8 - \\log_2 2" },
                            { label: "2.", expr: "2\\log_3 6 - \\log_3 4" },
                            { label: "3.", expr: "\\log_5 \\sqrt{125}" },
                            { label: "*4.", expr: "\\log 200 + \\log 5 - \\log 100" },
                        ].map(({ label, expr }) => (
                            <div key={label} style={{ marginBottom: 18 }}>
                                <span style={S.domandaLabel}>{label}</span>
                                <DisplayMath>{expr}</DisplayMath>
                                <div style={{ height: 36, borderBottom: "1px dashed #cbd5e1", marginTop: 4 }} />
                            </div>
                        ))}
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
                                <div style={S.solParteTitle}>Parte A – Risposte multiple</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. Definizione di logaritmo</span>
                                    <span style={S.solRisposta}>B</span>
                                    <p style={S.solText}>
                                        Per definizione: <L s="$\log_a b = c \;\Leftrightarrow\; a^c = b$" />.
                                        Il logaritmo è l'esponente a cui si deve elevare la base <L s="$a$" /> per ottenere <L s="$b$" />.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. Condizione sulla base</span>
                                    <span style={S.solRisposta}>C</span>
                                    <p style={S.solText}>
                                        La base deve essere <L s="$a > 0$" /> (per evitare potenze di numeri negativi) e{" "}
                                        <L s="$a \neq 1$" /> (con <L s="$a=1$" /> la funzione sarebbe costante, non esponenziale). Il dominio di <L s="$f(x)=a^x$" /> è sempre <L s="$\mathbb{R}$" />.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. Applicazione proprietà del prodotto</span>
                                    <span style={S.solRisposta}>C</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"\\log_2 6 + \\log_2 \\frac{8}{3} = \\log_2\\!\\left(6 \\cdot \\frac{8}{3}\\right) = \\log_2 16 = \\log_2 2^4 = 4"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. Monotonia della funzione esponenziale</span>
                                    <span style={S.solRisposta}>C</span>
                                    <p style={S.solText}>
                                        Con <L s="$0 < a < 1$" /> la funzione è decrescente: all'aumentare di <L s="$x$" />, <L s="$a^x$" /> si avvicina a zero.
                                        Con <L s="$a > 1$" /> è crescente. Con <L s="$a = 1$" /> è costante (non ammessa). Con <L s="$a < 0$" /> non è definita.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>5. Logaritmo di una potenza</span>
                                    <span style={S.solRisposta}>C</span>
                                    <p style={S.solText}>
                                        <L s="$\log_a(m^n) = n \cdot \log_a m$" />.
                                        L'esponente <em>scende</em> davanti al logaritmo come fattore moltiplicativo.
                                    </p>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Equazioni esponenziali</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. <L s="$3^{2x-1} = 3^{x+2}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                                            Le basi sono uguali, quindi si uguagliano gli esponenti:
                                        </p>
                                        <DisplayMath>{"2x - 1 = x + 2 \\implies x = 3"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Verifica: <L s="$3^{2(3)-1} = 3^5$" /> e <L s="$3^{3+2} = 3^5$" /> ✓
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*3. <L s="$2^{x^2} = 2^{3x}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                                            Stessa base → si uguagliano gli esponenti:
                                        </p>
                                        <DisplayMath>{"x^2 = 3x \\implies x^2 - 3x = 0 \\implies x(x-3) = 0"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            Equazione spuria: <L s="$x_1 = 0$" />, <L s="$x_2 = 3$" />.{" "}
                                            Attenzione a non dividere entrambi i membri per <L s="$x$" /> (si perderebbe la soluzione <L s="$x=0$" />).
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. <L s="$4^{x-1} = 2^{x+3}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                                            Si riconduce alla base 2: <L s="$4 = 2^2$" />, quindi <L s="$4^{x-1} = 2^{2(x-1)}$" />:
                                        </p>
                                        <DisplayMath>{"2^{2x-2} = 2^{x+3} \\implies 2x - 2 = x + 3 \\implies x = 5"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Verifica: <L s="$4^4 = 256$" /> e <L s="$2^8 = 256$" /> ✓
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Equazioni logaritmiche</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. <L s="$\log_2(3x+2) = 5$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                                            Si applica la definizione di logaritmo (<L s="$\log_a b = c \Leftrightarrow a^c = b$" />):
                                        </p>
                                        <DisplayMath>{"3x + 2 = 2^5 = 32 \\implies 3x = 30 \\implies x = 10"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Condizione di esistenza: <L s="$3x+2 > 0$" /> → <L s="$x > -\tfrac{2}{3}$" />.
                                            Con <L s="$x = 10$" />: <L s="$3(10)+2 = 32 > 0$" /> ✓
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. <L s="$(\log_3 x)^2 - 4\log_3 x + 3 = 0$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                                            Cambio di variabile <L s="$t = \log_3 x$" />:
                                        </p>
                                        <DisplayMath>{"t^2 - 4t + 3 = 0 \\implies (t-1)(t-3) = 0"}</DisplayMath>
                                        <p style={{ fontSize: 13, margin: "6px 0 4px" }}>
                                            <strong>Caso <L s="$t = 1$" />:</strong> <L s="$\log_3 x = 1 \Rightarrow x = 3$" />
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                                            <strong>Caso <L s="$t = 3$" />:</strong> <L s="$\log_3 x = 3 \Rightarrow x = 27$" />
                                        </p>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            Condizione di esistenza: <L s="$x > 0$" />. Entrambe le soluzioni sono positive ✓
                                        </p>
                                        <DisplayMath>{"x_1 = 3, \\quad x_2 = 27"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte D ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte D – Espressioni logaritmiche</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. <L s="$\log_2 4 + \log_2 8 - \log_2 2$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"= \\log_2\\frac{4 \\cdot 8}{2} = \\log_2 16 = \\log_2 2^4 = 4"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. <L s="$2\log_3 6 - \log_3 4$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"= \\log_3 6^2 - \\log_3 4 = \\log_3 36 - \\log_3 4 = \\log_3 \\frac{36}{4} = \\log_3 9 = 2"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. <L s="$\log_5 \sqrt{125}$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"= \\log_5 125^{1/2} = \\log_5 (5^3)^{1/2} = \\log_5 5^{3/2} = \\frac{3}{2}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. <L s="$\log 200 + \log 5 - \log 100$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"= \\log\\frac{200 \\cdot 5}{100} = \\log 10 = 1"}</DisplayMath>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

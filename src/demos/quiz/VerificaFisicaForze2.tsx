/**
 * VerificaFisicaForze2 - Verifica scritta su Forze e Vettori
 * Liceo Linguistico 3E – Fisica – 12/03/2026
 * FILA A e FILA B (selezionabile)
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

type Fila = "A" | "B";

// ─── Stili ─────────────────────────────────────────────────────────────────────

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

    btnFila: (active: boolean): React.CSSProperties => ({
        padding: "8px 20px",
        border: "2px solid",
        borderColor: active ? "#1e40af" : "#cbd5e1",
        borderRadius: 8,
        background: active ? "#1e40af" : "#f8fafc",
        color: active ? "#fff" : "#475569",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
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

    filaBadge: (fila: Fila): React.CSSProperties => ({
        display: "inline-block",
        margin: "6px auto 0",
        padding: "3px 18px",
        borderRadius: 20,
        background: fila === "A" ? "#dbeafe" : "#fce7f3",
        color: fila === "A" ? "#1e40af" : "#9d174d",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "1px",
        fontFamily: "system-ui, sans-serif",
        border: `1.5px solid ${fila === "A" ? "#93c5fd" : "#f9a8d4"}`,
    }),

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

    parte: {
        marginBottom: 28,
    } as React.CSSProperties,

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

    bulletList: {
        marginLeft: 24,
        marginTop: 6,
        marginBottom: 8,
    } as React.CSSProperties,

    bulletItem: {
        fontSize: 14,
        lineHeight: 1.7,
        color: "#1e293b",
        marginBottom: 3,
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

// ─── Componente principale ──────────────────────────────────────────────────────

export default function VerificaFisicaForze2(): React.ReactElement {
    const [fila, setFila] = useState<Fila>("A");
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

                        {/* Switch FILA */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif" }}>Fila:</span>
                            <button style={S.btnFila(fila === "A")} onClick={() => setFila("A")}>FILA A</button>
                            <button style={S.btnFila(fila === "B")} onClick={() => setFila("B")}>FILA B</button>
                        </div>

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
                        <div style={S.istituto}>Liceo Linguistico 3E — San Giovanni Valdarno — Classe 3ª</div>
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>Forze e Vettori</div>
                        <div style={{ textAlign: "center" }}>
                            <span style={S.filaBadge(fila)}>FILA {fila}</span>
                        </div>
                        <div style={S.metaRow}>
                            <span>12 Marzo 2026</span>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>

                    <div style={S.noteBox}>
                        Gli esercizi contrassegnati con <strong>*</strong> sono facoltativi per BES e DSA.
                    </div>

                    {/* ════════════════════════════════════
                        PARTE A – Domande a risposta aperta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(26 punti)</span></div>

                        {fila === "A" ? (
                            <>
                                {/* A.a — FILA A */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>a)</span>
                                    <p style={S.domandaText}>
                                        Definisci il <strong>Newton</strong> come unità di misura, spiega come si definisce operativamente
                                        e descrivi il funzionamento del <strong>dinamometro</strong>.
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>

                                {/* A.b — FILA A */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>b)</span>
                                    <p style={S.domandaText}>
                                        Definisci la <strong>forza peso</strong>: qual è il suo modulo, la sua direzione e il suo verso?
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* A.a — FILA B */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>a)</span>
                                    <p style={S.domandaText}>
                                        Definisci che cos'è una <strong>forza</strong> e spiega quando una forza può modificare
                                        lo stato di moto di un corpo. Spiega inoltre cosa significa <strong>forza di contatto</strong> e{" "}
                                        <strong>forza a distanza</strong> e fai qualche esempio.
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>

                                {/* A.b — FILA B */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>b)</span>
                                    <p style={S.domandaText}>
                                        Definisci la <strong>forza peso</strong> e spiega come sia direttamente proporzionale alla massa.
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Risposta multipla con motivazione
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte B – Domande a risposta multipla (motivare) <span style={S.punti}>(20 punti)</span></div>
                        <p style={S.istruzione}>
                            Per ogni domanda: indica la risposta corretta e motiva brevemente la scelta.
                        </p>

                        {/* B.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>Qual è la principale differenza tra massa e peso?</p>
                                    <span style={S.mcOption}><strong>A.</strong> La massa è invariante, il peso dipende dal luogo</span>
                                    <span style={S.mcOption}><strong>B.</strong> Non c'è alcuna differenza</span>
                                    <span style={S.mcOption}><strong>C.</strong> La massa cambia a seconda del luogo</span>
                                    <span style={S.mcOption}><strong>D.</strong> Il peso è una grandezza scalare</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>Quale tra le seguenti affermazioni è corretta?</p>
                                    <span style={S.mcOption}><strong>A.</strong> Il peso si misura in chilogrammi</span>
                                    <span style={S.mcOption}><strong>B.</strong> La massa si misura in newton</span>
                                    <span style={S.mcOption}><strong>C.</strong> Il peso è una forza</span>
                                    <span style={S.mcOption}><strong>D.</strong> La massa dipende dal pianeta</span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Un corpo ha massa <L s="$m = 50\,\text{kg}$" />. Il suo peso sulla Terra{" "}
                                        (<L s="$g = 9{,}8\,\text{N/kg}$" />) è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$50\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$9{,}8\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$490\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$5{,}1\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un corpo ha massa <L s="$m = 60\,\text{kg}$" />. Il suo peso sulla Terra{" "}
                                        (<L s="$g = 9{,}8\,\text{N/kg}$" />) è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$588\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$60\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$9{,}8\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$600\,\text{N}$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Una forza <L s="$F$" /> forma un angolo di <L s="$20°$" /> con l'asse negativo delle <L s="$x$" />{" "}
                                        (si trova nel secondo quadrante) e ha modulo <L s="$5{,}9\,\text{N}$" />.
                                        Quali sono le componenti cartesiane della forza?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$F_x = 5{,}5\,\text{N}$" />, <L s="$\quad F_y = 2{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$F_x = -5{,}5\,\text{N}$" />, <L s="$\quad F_y = 2{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$F_x = -2{,}0\,\text{N}$" />, <L s="$\quad F_y = 5{,}5\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$F_x = -2{,}0\,\text{N}$" />, <L s="$\quad F_y = -5{,}5\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Una forza <L s="$F$" /> forma un angolo di <L s="$30°$" /> con l'asse positivo delle <L s="$x$" />{" "}
                                        e ha modulo <L s="$8{,}0\,\text{N}$" />. Quali sono le sue componenti cartesiane?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$F_x = 6{,}9\,\text{N}$" />, <L s="$\quad F_y = 4{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$F_x = -6{,}9\,\text{N}$" />, <L s="$\quad F_y = 4{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$F_x = 4{,}0\,\text{N}$" />, <L s="$\quad F_y = 6{,}9\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$F_x = 6{,}9\,\text{N}$" />, <L s="$\quad F_y = -4{,}0\,\text{N}$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d — facoltativo */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Le componenti cartesiane di un vettore <L s="$\vec{V}$" /> sono{" "}
                                        <L s="$V_x = 60\,\text{N}$" /> e <L s="$V_y = 80\,\text{N}$" />.
                                        Il modulo del vettore è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$140\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$20\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$100\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$70\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Le componenti cartesiane di un vettore <L s="$\vec{V}$" /> sono{" "}
                                        <L s="$V_x = 24\,\text{N}$" /> e <L s="$V_y = 7\,\text{N}$" />.
                                        Il modulo del vettore è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$31\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$17\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$25\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$49\,\text{N}$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Esercizi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte C – Esercizi</div>

                        {/* C.1 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(30 punti)</span></span>
                            <p style={S.domandaText}>Su un oggetto agiscono due forze.</p>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Una forza <L s="$\vec{F}_1$" /> ha intensità <L s="$70{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$20°$" /> al di sopra del semiasse positivo delle <L s="$x$" />.
                                    Una seconda forza <L s="$\vec{F}_2$" /> ha intensità <L s="$50{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$160°$" /> rispetto al semiasse positivo delle <L s="$x$" />.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Una forza <L s="$\vec{F}_1$" /> ha intensità <L s="$60{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$30°$" /> al di sopra del semiasse positivo delle <L s="$x$" />.
                                    Una seconda forza <L s="$\vec{F}_2$" /> ha intensità <L s="$40{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$150°$" /> rispetto al semiasse positivo delle <L s="$x$" />.
                                </p>
                            )}

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola le componenti cartesiane di entrambe le forze.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Fai un disegno delle forze su un piano cartesiano.
                                </p>
                                <div style={{ height: 110, border: "1px dashed #cbd5e1", borderRadius: 4 }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Determina le componenti cartesiane della forza risultante{" "}
                                    <L s="$\vec{R} = \vec{F}_1 + \vec{F}_2$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iv.)</strong> Determina modulo e direzione della forza risultante.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*v.)</strong> In quale quadrante si trova la forza risultante <L s="$\vec{R}$" />?
                                </p>
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(24 punti)</span></span>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Su un pianeta lontano, un astronauta raccoglie una roccia. La roccia ha una massa di{" "}
                                    <L s="$7{,}00\,\text{kg}$" /> e su quel pianeta il suo peso è di <L s="$50\,\text{N}$" />.
                                    L'astronauta ha una massa di <L s="$70\,\text{kg}$" />.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Su un pianeta lontano, una roccia ha una massa di{" "}
                                    <L s="$8{,}00\,\text{kg}$" /> e su quel pianeta il suo peso è di <L s="$48\,\text{N}$" />.
                                    L'astronauta ha una massa di <L s="$72\,\text{kg}$" />.
                                </p>
                            )}

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola l'accelerazione di gravità del pianeta.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Calcola il peso del sistema astronauta + roccia sul pianeta Terra{" "}
                                    (<L s="$g_\text{Terra} = 9{,}8\,\text{N/kg}$" />).
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Calcola il peso del sistema astronauta + roccia sul pianeta lontano.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Esprimi il peso del sistema sul pianeta lontano come percentuale del peso
                                    del sistema sulla Terra.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
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
                        SEZIONE SOLUZIONI (no print)
                    ════════════════════════════════════ */}
                    {showSoluzioni && (
                        <div style={S.soluzioniSection} className="soluzioni-section no-print">
                            <div style={S.soluzioniTitle}>✅ Soluzioni — FILA {fila}</div>

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposte attese</div>

                                {fila === "A" ? (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Il Newton e il dinamometro</span>
                                            <p style={S.solText}>
                                                Il <strong>Newton</strong> è l'unità di misura della forza nel SI.
                                                Si definisce operativamente come la forza esercitata su un dinamometro da un oggetto
                                                di massa <L s="$\dfrac{1}{9{,}81}\,\text{kg}$" />.
                                            </p>
                                            <p style={S.solText}>
                                                Il <strong>dinamometro</strong> è uno strumento che misura forze sfruttando la deformazione
                                                elastica di una molla. Applicando una forza, la molla si allunga proporzionalmente
                                                (legge di Hooke: <L s="$F = kx$" />); una scala tarata indica il valore in newton.
                                            </p>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) La forza peso</span>
                                            <p style={S.solText}>
                                                La <strong>forza peso</strong> è la forza gravitazionale con cui la Terra attrae un corpo.
                                                Il suo modulo è <L s="$P = mg$" />, la sua direzione è <strong>perpendicolare al suolo</strong>{" "}
                                                e il suo verso è <strong>verso il basso</strong>.
                                            </p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = m \\cdot g"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 6, color: "#475569" }}>
                                                    Il modulo della forza peso è <strong>direttamente proporzionale alla massa</strong>:
                                                    raddoppiando <L s="$m$" />, raddoppia <L s="$P$" />.
                                                    Con buona approssimazione sulla Terra si considera{" "}
                                                    <L s="$g = 9{,}81\,\text{N/kg}$" />.
                                                </p>
                                            </div>
                                            <p style={{ ...S.solText, marginTop: 8 }}>
                                                Il peso è <strong>dipendente dal pianeta</strong> (cambia al variare di <L s="$g$" />),
                                                al contrario della <strong>massa</strong> che è una proprietà intrinseca di ciascun corpo
                                                e rimane invariata ovunque.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Cos'è una forza</span>
                                            <p style={S.solText}>
                                                Una <strong>forza</strong> è un'interazione che può modificare lo stato di moto di un corpo
                                                (metterlo in moto, fermarlo, cambiarne la direzione) o deformarlo.
                                            </p>
                                            <p style={S.solText}>
                                                La forza è una <strong>grandezza vettoriale</strong>: i suoi effetti dipendono non solo
                                                dall'intensità (modulo), ma anche dalla <strong>direzione</strong> e dal <strong>verso</strong>.
                                                La stessa forza di 10 N applicata verso l'alto o verso il basso produce effetti completamente
                                                diversi; analogamente, spingere un oggetto verso destra o verso sinistra cambia il risultato.
                                            </p>
                                            <p style={S.solText}>
                                                <strong>Esempi:</strong> la forza peso agisce sempre verticalmente verso il basso;
                                                la tensione di un filo agisce lungo il filo nel verso dal corpo all'attacco;
                                                la forza di attrito si oppone al moto, quindi ha verso opposto allo spostamento.
                                            </p>
                                            <p style={S.solText}>
                                                L'unità di misura della forza nel SI è il <strong>Newton (N)</strong>.
                                            </p>
                                            <p style={S.solText}>
                                                <strong>Forza di contatto:</strong> richiede il contatto fisico tra i corpi
                                                (es. attrito, normale, tensione).{" "}
                                                <strong>Forza a distanza:</strong> agisce senza contatto (es. gravità, forza magnetica).
                                            </p>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Forza peso e proporzionalità con la massa</span>
                                            <p style={S.solText}>
                                                La <strong>forza peso</strong> è la forza gravitazionale che la Terra esercita su un corpo.
                                                La relazione <L s="$P = mg$" /> esprime la <strong>diretta proporzionalità</strong> tra
                                                il modulo della forza peso e la massa: se la massa raddoppia, raddoppia anche il peso;
                                                se triplica, triplica anche il peso, e così via.
                                            </p>
                                            <p style={S.solText}>
                                                Il grafico di questa relazione è una <strong>retta passante per l'origine</strong>
                                                (con pendenza pari a <L s="$g$" />).
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposta multipla</div>

                                {fila === "A" ? (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Differenza massa / peso</span>
                                            <span style={S.solRisposta}>Risposta: A</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    La <strong>massa</strong> è invariante (proprietà intrinseca, si misura in kg).
                                                    Il <strong>peso</strong> (<L s="$P = mg$" />) dipende da <L s="$g$" />,
                                                    che varia da pianeta a pianeta.
                                                </p>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Peso di m = 50 kg sulla Terra</span>
                                            <span style={S.solRisposta}>Risposta: C — 490 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = 50 \\times 9{,}8 = 490\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>c) F = 5,9 N a 20° dall'asse negativo x (2° quadrante)</span>
                                            <span style={S.solRisposta}>Risposta: B</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13, marginBottom: 6 }}>
                                                    L'angolo rispetto all'asse positivo x è <L s="$\theta = 180° - 20° = 160°$" />.
                                                </p>
                                                <DisplayMath>{"F_x = 5{,}9 \\cos 160° = -5{,}9 \\cos 20° \\approx -5{,}5\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_y = 5{,}9 \\sin 160° = 5{,}9 \\sin 20° \\approx 2{,}0\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>*d) Modulo con Vx = 60 N, Vy = 80 N</span>
                                            <span style={S.solRisposta}>Risposta: C — 100 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"V = \\sqrt{60^2 + 80^2} = \\sqrt{3600 + 6400} = \\sqrt{10000} = 100\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Affermazione corretta su massa e peso</span>
                                            <span style={S.solRisposta}>Risposta: C</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    Il <strong>peso è una forza</strong> (si misura in N), non in kg.
                                                    La massa si misura in kg e non dipende dal pianeta.
                                                </p>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Peso di m = 60 kg sulla Terra</span>
                                            <span style={S.solRisposta}>Risposta: A — 588 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = 60 \\times 9{,}8 = 588\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>c) F = 8,0 N a 30° dall'asse positivo x</span>
                                            <span style={S.solRisposta}>Risposta: A</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_x = 8{,}0 \\cos 30° = 8{,}0 \\times \\frac{\\sqrt{3}}{2} \\approx 6{,}9\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_y = 8{,}0 \\sin 30° = 8{,}0 \\times 0{,}5 = 4{,}0\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>*d) Modulo con Vx = 24 N, Vy = 7 N</span>
                                            <span style={S.solRisposta}>Risposta: C — 25 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"V = \\sqrt{24^2 + 7^2} = \\sqrt{576 + 49} = \\sqrt{625} = 25\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Esercizi svolti</div>

                                {/* C.1 */}
                                {fila === "A" ? (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>1) F₁ = 70,0 N a 20° — F₂ = 50,0 N a 160°</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 6 }}>i) Componenti cartesiane</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                                Forza <L s="$\vec{F}_1$" /> (angolo 20°):
                                            </p>
                                            <DisplayMath>{"F_{1x} = 70{,}0 \\cos 20° \\approx 70{,}0 \\times 0{,}940 \\approx 65{,}8\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"F_{1y} = 70{,}0 \\sin 20° \\approx 70{,}0 \\times 0{,}342 \\approx 23{,}9\\,\\text{N}"}</DisplayMath>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 10 }}>
                                                Forza <L s="$\vec{F}_2$" /> (angolo 160°):
                                            </p>
                                            <DisplayMath>{"F_{2x} = 50{,}0 \\cos 160° \\approx -47{,}0\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"F_{2y} = 50{,}0 \\sin 160° \\approx 17{,}1\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iii) Componenti risultante</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R_x = 65{,}8 + (-47{,}0) = 18{,}8\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"R_y = 23{,}9 + 17{,}1 = 41{,}0\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iv) Modulo e direzione</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R = \\sqrt{18{,}8^2 + 41{,}0^2} = \\sqrt{353 + 1681} \\approx 45{,}1\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"\\theta = \\arctan\\!\\left(\\frac{41{,}0}{18{,}8}\\right) \\approx 65{,}4°\\text{ sopra l'asse }x"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 6 }}>
                                                ⟹ <strong>R ≈ 45,1 N</strong> a <strong>65,4° sopra l'asse x positivo</strong> (1° quadrante).
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>1) F₁ = 60,0 N a 30° — F₂ = 40,0 N a 150°</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 6 }}>i) Componenti cartesiane</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                                Forza <L s="$\vec{F}_1$" /> (angolo 30°):
                                            </p>
                                            <DisplayMath>{"F_{1x} = 60{,}0 \\cos 30° = 60{,}0 \\times \\frac{\\sqrt{3}}{2} \\approx 52{,}0\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"F_{1y} = 60{,}0 \\sin 30° = 60{,}0 \\times 0{,}5 = 30{,}0\\,\\text{N}"}</DisplayMath>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 10 }}>
                                                Forza <L s="$\vec{F}_2$" /> (angolo 150°):
                                            </p>
                                            <DisplayMath>{"F_{2x} = 40{,}0 \\cos 150° = -40{,}0 \\times \\frac{\\sqrt{3}}{2} \\approx -34{,}6\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"F_{2y} = 40{,}0 \\sin 150° = 40{,}0 \\times 0{,}5 = 20{,}0\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iii) Componenti risultante</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R_x = 52{,}0 + (-34{,}6) = 17{,}4\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"R_y = 30{,}0 + 20{,}0 = 50{,}0\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iv) Modulo e direzione</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R = \\sqrt{17{,}4^2 + 50{,}0^2} = \\sqrt{303 + 2500} \\approx 52{,}9\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"\\theta = \\arctan\\!\\left(\\frac{50{,}0}{17{,}4}\\right) \\approx 70{,}8°\\text{ sopra l'asse }x"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 6 }}>
                                                ⟹ <strong>R ≈ 52,9 N</strong> a <strong>70,8° sopra l'asse x positivo</strong> (1° quadrante).
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* C.2 */}
                                {fila === "A" ? (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>2) Roccia: m = 7,00 kg, P_pianeta = 50 N — astronauta: m = 70 kg</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Accelerazione di gravità del pianeta</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"g_\\text{pianeta} = \\frac{P_\\text{roccia}}{m_\\text{roccia}} = \\frac{50}{7{,}00} \\approx 7{,}14\\,\\text{N/kg}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Peso sistema sulla Terra</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"m_\\text{tot} = 70 + 7{,}00 = 77{,}0\\,\\text{kg}"}</DisplayMath>
                                            <DisplayMath>{"P_\\text{Terra} = 77{,}0 \\times 9{,}8 = 754{,}6\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Peso sistema sul pianeta lontano</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"P_\\text{pianeta} = 77{,}0 \\times 7{,}14 \\approx 549{,}8\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Percentuale rispetto alla Terra</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"x = \\frac{P_\\text{pianeta}}{P_\\text{Terra}} \\times 100 = \\frac{549{,}8}{754{,}6} \\times 100 \\approx 72{,}9\\%"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 4 }}>
                                                Il peso del sistema sul pianeta lontano è circa il <strong>72,9%</strong> del peso sulla Terra.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>2) Roccia: m = 8,00 kg, P_pianeta = 48 N — astronauta: m = 72 kg</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Accelerazione di gravità del pianeta</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"g_\\text{pianeta} = \\frac{P_\\text{roccia}}{m_\\text{roccia}} = \\frac{48}{8{,}00} = 6{,}00\\,\\text{N/kg}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Peso sistema sulla Terra</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"m_\\text{tot} = 72 + 8{,}00 = 80{,}0\\,\\text{kg}"}</DisplayMath>
                                            <DisplayMath>{"P_\\text{Terra} = 80{,}0 \\times 9{,}8 = 784\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Peso sistema sul pianeta lontano</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"P_\\text{pianeta} = 80{,}0 \\times 6{,}00 = 480\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Percentuale rispetto alla Terra</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"x = \\frac{P_\\text{pianeta}}{P_\\text{Terra}} \\times 100 = \\frac{480}{784} \\times 100 \\approx 61{,}2\\%"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 4 }}>
                                                Il peso del sistema sul pianeta lontano è circa il <strong>61,2%</strong> del peso sulla Terra.
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                        Liceo Linguistico 3E · Fisica · Forze e Vettori · Giovanni Ugolini · 12/03/2026
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Helper components ──────────────────────────────────────────────────────────

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
            <span style={{ width: 60, borderBottom: "1px solid #94a3b8", display: "inline-block" }}></span>
        </div>
    );
}

function RigaMotivazione(): React.ReactElement {
    const style: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 4,
        fontSize: 13,
        color: "#475569",
        fontFamily: "system-ui, sans-serif",
    };
    const lineaStyle: React.CSSProperties = {
        flex: 1,
        borderBottom: "1px solid #94a3b8",
        minWidth: 80,
    };
    return (
        <>
            <div style={style}>
                <span>Motivazione:</span>
                <span style={lineaStyle}></span>
            </div>
            <div style={style}>
                <span style={{ opacity: 0 }}>Motivazione:</span>
                <span style={lineaStyle}></span>
            </div>
        </>
    );
}

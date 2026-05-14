/**
 * VerificaFisicaCampoMagnetico5I – Verifica scritta sul Campo Magnetico
 * Classe 5I – Fisica – Maggio 2026
 * Fila unica
 *
 * A: 2 domande aperta (24 pt)
 * B: 4 domande MC + motivazione (32 pt) + *e facoltativa
 * C: 2 esercizi guidati (44 pt)
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

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

export default function VerificaFisicaCampoMagnetico5I(): React.ReactElement {
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
                        <div style={S.istituto}>Liceo — San Giovanni Valdarno — Classe 5ª I</div>
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>Il campo magnetico</div>
                        <div style={S.metaRow}>
                            <span>Maggio 2026</span>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>

                    <div style={S.noteBox}>
                        Gli esercizi contrassegnati con <strong>*</strong> sono facoltativi per BES e DSA. &nbsp;
                        Costante: <L s="$\mu_0 = 4\pi \times 10^{-7}\,\text{T·m/A}$" />.
                    </div>

                    {/* ════════════════════════════════════
                        PARTE A – Domande a risposta aperta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(24 punti)</span></div>

                        {/* A.a — campo magnetico e linee di campo */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>
                                Descrivi direzione e verso del  <strong>campo magnetico</strong>: come si definisce operativamente.
                                Spiega inoltre in che cosa le sorgenti del campo magnetico differiscono da quelle
                                del campo elettrico.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        {/* A.b — campo della spira e del solenoide */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Enuncia la legge di Biot-Savart e spiegala a parole tue
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Risposta multipla (motivare)
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte B – Domande a risposta multipla (motivare) <span style={S.punti}>(32 punti)</span>
                        </div>
                        <p style={S.istruzione}>
                            Per ogni domanda: indica la risposta corretta e motiva brevemente la scelta.
                        </p>

                        {/* B.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>Quale affermazione sulle linee di campo magnetico è corretta?</p>
                            <span style={S.mcOption}><strong>A.</strong> Le linee di campo magnetico possono incrociarsi tra loro</span>
                            <span style={S.mcOption}><strong>B.</strong> Le linee di campo magnetico partono dal polo nord e terminano al polo sud (all'esterno del magnete)</span>
                            <span style={S.mcOption}><strong>C.</strong> Le linee di campo magnetico sono sempre chiuse su sé stesse</span>
                            <span style={S.mcOption}><strong>D.</strong> Le linee di campo magnetico terminano dove il campo è nullo</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Un filo rettilineo molto lungo è percorso da una corrente <L s="$I = 5{,}0\,\text{A}$" />.
                                Qual è il modulo del campo magnetico a distanza <L s="$r = 10\,\text{cm}$" /> dal filo?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$1{,}0 \times 10^{-6}\,\text{T}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$1{,}0 \times 10^{-5}\,\text{T}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$1{,}0 \times 10^{-4}\,\text{T}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$5{,}0 \times 10^{-7}\,\text{T}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>
                                Un solenoide ha <L s="$n = 500\,\text{spire/m}$" /> ed è percorso da una corrente{" "}
                                <L s="$I = 2{,}0\,\text{A}$" />. Qual è il campo magnetico all'interno?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$6{,}3 \times 10^{-4}\,\text{T}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$4{,}0 \times 10^{-3}\,\text{T}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$1{,}3 \times 10^{-3}\,\text{T}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$2{,}5 \times 10^{-3}\,\text{T}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>d)</span>
                            <p style={S.domandaText}>
                                Una carica <L s="$q = 3{,}0 \times 10^{-6}\,\text{C}$" /> si muove con velocità{" "}
                                <L s="$v = 4{,}0 \times 10^{5}\,\text{m/s}$" /> perpendicolarmente a un campo{" "}
                                <L s="$B = 0{,}20\,\text{T}$" />. Qual è la forza di Lorentz sulla carica?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$2{,}4 \times 10^{-2}\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$2{,}4 \times 10^{-1}\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$2{,}4\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$2{,}4 \times 10^{1}\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.e — facoltativo */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*e)</span>
                            <p style={S.domandaText}>
                                Un filo di lunghezza <L s="$L = 0{,}50\,\text{m}$" /> percorso da corrente{" "}
                                <L s="$I = 3{,}0\,\text{A}$" /> è immerso in un campo uniforme{" "}
                                <L s="$B = 0{,}80\,\text{T}$" /> perpendicolarmente al filo.
                                Quale forza agisce sul filo?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$0{,}12\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$1{,}2\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$12\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$0{,}012\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Esercizi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte C – Esercizi</div>

                        {/* C.1 — Campo magnetico di un filo e forza di Lorentz */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(22 punti)</span>{" "}
                                Campo magnetico di un filo e forza di Lorentz
                            </span>
                            <p style={S.domandaText}>
                                Un filo rettilineo molto lungo è percorso da una corrente <L s="$I_1 = 8{,}0\,\text{A}$" />.
                                A una distanza <L s="$r = 5{,}0\,\text{cm}$" /> dal filo si trova una carica puntiforme{" "}
                                <L s="$q = 2{,}0 \times 10^{-6}\,\text{C}$" /> che si muove con velocità{" "}
                                <L s="$v = 3{,}0 \times 10^{5}\,\text{m/s}$" /> in direzione parallela al filo.
                            </p>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Converti la distanza in metri.
                                </p>
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Calcola il campo magnetico generato dal filo nella posizione della carica.

                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Calcola la forza di Lorentz sulla carica.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Se la corrente nel filo raddoppiasse, come cambierebbe la forza sulla carica? Motiva brevemente.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 — Solenoide e forza su un filo */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(22 punti)</span>{" "}
                                Solenoide e forza magnetica su un filo
                            </span>
                            <p style={S.domandaText}>
                                Un solenoide lungo <L s="$L = 0{,}30\,\text{m}$" /> ha <L s="$N = 600$" /> spire totali
                                ed è percorso da una corrente <L s="$I_1 = 2{,}5\,\text{A}$" />.
                                All'interno del solenoide è disposto un filo di lunghezza <L s="$\ell = 0{,}20\,\text{m}$" />{" "}
                                percorso da corrente <L s="$I_2 = 4{,}0\,\text{A}$" />, orientato
                                perpendicolarmente al campo del solenoide.
                            </p>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola il numero di spire per unità di lunghezza{" "}
                                    <L s="$n = N/L$" />.
                                </p>
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Calcola il campo magnetico all'interno del solenoide
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Calcola la forza magnetica che agisce sul filo interno
                                    (<L s="$F = B I_2 \ell$" />).
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Se raddoppiassimo sia <L s="$I_1$" /> che <L s="$I_2$" />,
                                    di quale fattore cambierebbe la forza sul filo? Giustifica.
                                </p>
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
                            <div style={S.soluzioniTitle}>✅ Soluzioni</div>



                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposta multipla</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Linee di campo magnetico</span>
                                    <span style={S.solRisposta}>Risposta: C</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Le linee di campo magnetico sono sempre chiuse su sé stesse: non
                                            esistono monopoli magnetici, quindi non ci sono punti di partenza
                                            o di arrivo (a differenza del campo elettrico).
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Campo di un filo, I = 5,0 A, r = 10 cm</span>
                                    <span style={S.solRisposta}>Risposta: B — <L s="$1{,}0 \times 10^{-5}\,\text{T}$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"B = \\frac{\\mu_0 I}{2\\pi r} = \\frac{4\\pi \\times 10^{-7} \\times 5{,}0}{2\\pi \\times 0{,}10} = \\frac{2 \\times 10^{-7} \\times 5{,}0}{0{,}10} = 1{,}0 \\times 10^{-5}\\,\\text{T}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) Solenoide, n = 500 spire/m, I = 2,0 A</span>
                                    <span style={S.solRisposta}>Risposta: C — <L s="$1{,}3 \times 10^{-3}\,\text{T}$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"B = \\mu_0 n I = 4\\pi \\times 10^{-7} \\times 500 \\times 2{,}0 = 4\\pi \\times 10^{-4} \\approx 1{,}26 \\times 10^{-3}\\,\\text{T}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>d) Forza di Lorentz, q = 3,0×10⁻⁶ C, v = 4,0×10⁵ m/s, B = 0,20 T</span>
                                    <span style={S.solRisposta}>Risposta: B — <L s="$2{,}4 \times 10^{-1}\,\text{N}$" /></span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = qvB = 3{,}0 \\times 10^{-6} \\times 4{,}0 \\times 10^{5} \\times 0{,}20 = 2{,}4 \\times 10^{-1}\\,\\text{N} = 0{,}24\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*e) Forza su un filo, B = 0,80 T, I = 3,0 A, L = 0,50 m</span>
                                    <span style={S.solRisposta}>Risposta: B — 1,2 N</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = BIL = 0{,}80 \\times 3{,}0 \\times 0{,}50 = 1{,}2\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Esercizi svolti</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1) I₁ = 8,0 A, r = 5,0 cm, q = 2,0×10⁻⁶ C, v = 3,0×10⁵ m/s</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"r = 5{,}0\\,\\text{cm} = 0{,}050\\,\\text{m}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Campo magnetico del filo</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"B = \\frac{\\mu_0 I_1}{2\\pi r} = \\frac{4\\pi \\times 10^{-7} \\times 8{,}0}{2\\pi \\times 0{,}050} = \\frac{2 \\times 10^{-7} \\times 8{,}0}{0{,}050} = 3{,}2 \\times 10^{-5}\\,\\text{T}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza di Lorentz</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = qvB = 2{,}0 \\times 10^{-6} \\times 3{,}0 \\times 10^{5} \\times 3{,}2 \\times 10^{-5} = 1{,}92 \\times 10^{-5}\\,\\text{N} \\approx 1{,}9 \\times 10^{-5}\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Raddoppio della corrente</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Se <L s="$I_1 \to 2I_1$" />, il campo <L s="$B$" /> raddoppia
                                            (proporzionalità diretta). Di conseguenza anche la forza di Lorentz
                                            raddoppia:
                                        </p>
                                        <DisplayMath>{"F' = 2F \\approx 3{,}8 \\times 10^{-5}\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2) Solenoide: L = 0,30 m, N = 600, I₁ = 2,5 A; filo: ℓ = 0,20 m, I₂ = 4,0 A</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Spire per unità di lunghezza</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"n = \\frac{N}{L} = \\frac{600}{0{,}30} = 2\\,000\\,\\text{spire/m}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Campo magnetico interno al solenoide</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"B = \\mu_0 n I_1 = 4\\pi \\times 10^{-7} \\times 2\\,000 \\times 2{,}5 = 2\\pi \\times 10^{-3} \\approx 6{,}28 \\times 10^{-3}\\,\\text{T}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza sul filo</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = B I_2 \\ell = 6{,}28 \\times 10^{-3} \\times 4{,}0 \\times 0{,}20 \\approx 5{,}0 \\times 10^{-3}\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>⟹ <strong>F ≈ 5,0 × 10⁻³ N</strong></p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Raddoppio di entrambe le correnti</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Se <L s="$I_1 \to 2I_1$" /> il campo <L s="$B$" /> raddoppia;
                                            se <L s="$I_2 \to 2I_2$" /> la forza raddoppia ancora.
                                            I due effetti si moltiplicano:
                                        </p>
                                        <DisplayMath>{"F' = (2B)(2I_2)\\ell = 4 \\cdot B I_2 \\ell = 4F \\approx 2{,}0 \\times 10^{-2}\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>La forza <strong>quadruplica</strong> (fattore 4).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Footer ── */}
                    <div style={{
                        marginTop: 32,
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                        fontFamily: "system-ui, sans-serif",
                    }}>
                        Classe 5I · Fisica · Il campo magnetico · Giovanni Ugolini · Maggio 2026
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

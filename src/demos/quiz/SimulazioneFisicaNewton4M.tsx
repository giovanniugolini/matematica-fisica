/**
 * SimulazioneFisicaNewton4M – Simulazione su Leggi di Newton e Gravitazione Universale
 * Liceo Linguistico 4M – Fisica – Maggio 2026
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

    simBadge: {
        display: "inline-block",
        margin: "6px auto 0",
        padding: "3px 18px",
        borderRadius: 20,
        background: "#ede9fe",
        color: "#5b21b6",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "1px",
        fontFamily: "system-ui, sans-serif",
        border: "1.5px solid #c4b5fd",
    } as React.CSSProperties,

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

export default function SimulazioneFisicaNewton4M(): React.ReactElement {
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
                        <div style={S.istituto}>Liceo Linguistico — San Giovanni Valdarno — Classe 4ª M</div>
                        <div style={S.title}>Simulazione di Fisica</div>
                        <div style={S.disciplina}>
                            Leggi di Newton · Sistemi inerziali · Principio di relatività galileiano · Gravitazione universale
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <span style={S.simBadge}>SIMULAZIONE</span>
                        </div>
                        <div style={S.metaRow}>
                            <span>Maggio 2026</span>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>

                    <div style={S.noteBox}>
                        Gli esercizi contrassegnati con <strong>*</strong> sono facoltativi per BES e DSA.&nbsp;
                        Costante di gravitazione universale: <L s="$G = 6{,}67 \times 10^{-11}\,\text{N}{\cdot}\text{m}^2/\text{kg}^2$" />.
                    </div>

                    {/* ════════════════════════════════════
                        PARTE A – Domande a risposta aperta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(24 punti)</span></div>

                        {/* A.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Enuncia le <strong>tre leggi di Newton</strong>. Per la seconda legge scrivi la formula,
                                specifica le grandezze coinvolte e le loro unità di misura nel SI, e spiega come si
                                definisce il <strong>newton</strong> come unità di forza. Definisci infine cosa si
                                intende per <strong>sistema di riferimento inerziale</strong>.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        {/* A.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Enuncia il <strong>principio di relatività galileiano</strong>: cosa afferma
                                riguardo alle leggi della meccanica in sistemi di riferimento inerziali diversi?
                                Enuncia poi la <strong>legge di gravitazione universale</strong> di Newton,
                                scrivendo la formula e specificando il significato fisico di ciascuna grandezza.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Risposta multipla
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte B – Domande a risposta multipla (motivare) <span style={S.punti}>(20 punti)</span>
                        </div>
                        <p style={S.istruzione}>
                            Per ogni domanda: indica la risposta corretta e motiva brevemente la scelta.
                        </p>

                        {/* B.a — Principio di inerzia */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>Quale affermazione sul <strong>principio di inerzia</strong> (prima legge di Newton) è corretta?</p>
                            <span style={S.mcOption}><strong>A.</strong> Un corpo in moto tende sempre a fermarsi spontaneamente</span>
                            <span style={S.mcOption}><strong>B.</strong> Un corpo rimane in quiete o in moto rettilineo uniforme se la forza risultante su di esso è nulla</span>
                            <span style={S.mcOption}><strong>C.</strong> Un corpo in moto accelera sempre a causa della propria inerzia</span>
                            <span style={S.mcOption}><strong>D.</strong> Il principio di inerzia vale solo per i corpi in quiete</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b — Seconda legge: calcolo numerico */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Un'auto di massa <L s="$m = 1\,200\,\text{kg}$" /> acquista un'accelerazione{" "}
                                <L s="$a = 2{,}5\,\text{m/s}^2$" />. Qual è la forza risultante che agisce su di essa?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$480\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$3\,000\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$300\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$30\,000\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c — Gravitazione: dipendenza da r */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>
                                La forza gravitazionale tra due corpi è <L s="$F$" /> quando la loro distanza è{" "}
                                <L s="$r$" />. Se la distanza viene <strong>raddoppiata</strong>, la nuova forza gravitazionale vale:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$2F$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$F/2$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$F/4$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$4F$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d — Gravitazione: calcolo numerico (*facoltativo) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            <p style={S.domandaText}>
                                Due corpi di massa <L s="$m_1 = 2{,}0 \times 10^4\,\text{kg}$" /> e{" "}
                                <L s="$m_2 = 5{,}0 \times 10^3\,\text{kg}$" /> sono distanti <L s="$r = 4{,}0\,\text{m}$" />.
                                Qual è la forza gravitazionale tra loro?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$4{,}17 \times 10^{-4}\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$8{,}34 \times 10^{-4}\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$6{,}67 \times 10^{-3}\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$1{,}67 \times 10^{-3}\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Esercizi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte C – Esercizi</div>

                        {/* C.1 — Terza legge di Newton */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Terza legge di Newton
                            </span>

                            <p style={S.domandaText}>
                                Due pattinatori A e B sono fermi sul ghiaccio (attrito trascurabile).
                                A ha massa <L s="$m_A = 60\,\text{kg}$" />, B ha massa <L s="$m_B = 80\,\text{kg}$" />.
                                A spinge B con una forza di <L s="$F = 120\,\text{N}$" /> diretta orizzontalmente.
                            </p>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Per la terza legge di Newton, con quale forza B spinge A?
                                    Descrivi modulo, direzione e verso di questa forza.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Applica la seconda legge di Newton e calcola l'accelerazione di B.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Calcola l'accelerazione di A.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Se la spinta dura <L s="$t = 2{,}0\,\text{s}$" />, calcola
                                    la velocità finale di ciascun pattinatore (entrambi partono da fermi).
                                    Quale dei due acquista la velocità maggiore? Spiega perché.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 — Gravitazione universale */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Legge di gravitazione universale
                            </span>

                            <p style={S.domandaText}>
                                La Terra ha massa <L s="$M_T = 5{,}97 \times 10^{24}\,\text{kg}$" /> e raggio{" "}
                                <L s="$R_T = 6{,}37 \times 10^6\,\text{m}$" />.
                                La Luna ha massa <L s="$M_L = 7{,}35 \times 10^{22}\,\text{kg}$" /> e orbita a una distanza
                                media dalla Terra di <L s="$d = 3{,}84 \times 10^8\,\text{m}$" />.
                            </p>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola la forza di attrazione gravitazionale tra la Terra e la Luna.
                                </p>
                                <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Per la terza legge di Newton, con quale forza la Luna attrae la
                                    Terra? Specifica modulo, direzione e verso.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Utilizzando la legge di gravitazione, ricava il valore
                                    dell'accelerazione di gravità <L s="$g$" /> sulla superficie della Terra.
                                    Confronta il risultato con il valore noto <L s="$9{,}8\,\text{m/s}^2$" />.
                                </p>
                                <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> A quale distanza dal centro della Terra la forza gravitazionale
                                    sulla Luna si ridurrebbe a <L s="$1/4$" /> del valore calcolato al punto i)?
                                    Ricava la risposta in modo algebrico, senza calcolare numericamente.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
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

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposte attese</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Tre leggi di Newton · sistema inerziale</span>
                                    <p style={S.solText}>
                                        <strong>1ª legge (inerzia):</strong> un corpo rimane in quiete o in moto
                                        rettilineo uniforme finché la forza risultante su di esso è nulla.
                                    </p>
                                    <p style={S.solText}>
                                        <strong>2ª legge:</strong> <L s="$\vec{F} = m\vec{a}$" />. La forza risultante
                                        (in N), la massa (in kg) e l'accelerazione (in m/s²) sono legate da questa
                                        relazione. <strong>1 newton</strong> è la forza che imprime a una massa di 1 kg
                                        un'accelerazione di 1 m/s².
                                    </p>
                                    <p style={S.solText}>
                                        <strong>3ª legge (azione-reazione):</strong> se il corpo A esercita una forza su
                                        B, allora B esercita su A una forza uguale in modulo e direzione ma di verso
                                        opposto. Le due forze agiscono su corpi diversi.
                                    </p>
                                    <p style={S.solText}>
                                        <strong>Sistema inerziale:</strong> sistema di riferimento in cui vale il
                                        principio di inerzia, ovvero un sistema non accelerato e non rotante rispetto
                                        alle stelle fisse.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Principio di relatività galileiano · gravitazione universale</span>
                                    <p style={S.solText}>
                                        <strong>Principio di relatività galileiano:</strong> le leggi della meccanica
                                        hanno la stessa forma in tutti i sistemi di riferimento inerziali. Nessun
                                        esperimento meccanico può distinguere uno stato di quiete da uno di moto
                                        rettilineo uniforme.
                                    </p>
                                    <p style={S.solText}>
                                        <strong>Legge di gravitazione universale:</strong>{" "}
                                        <L s="$F = G\,\dfrac{m_1 m_2}{r^2}$" />, dove <L s="$G = 6{,}67\times10^{-11}\,\text{N}{\cdot}\text{m}^2/\text{kg}^2$" /> è
                                        la costante di gravitazione universale, <L s="$m_1$" /> e <L s="$m_2$" /> sono
                                        le masse dei due corpi (in kg) e <L s="$r$" /> è la distanza tra i loro centri
                                        (in m). La forza è attrattiva, diretta lungo la congiungente i due centri.
                                    </p>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposta multipla</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Principio di inerzia</span>
                                    <span style={S.solRisposta}>Risposta: B</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Un corpo su cui la forza risultante è nulla non cambia il proprio stato di
                                            moto. A, C, D descrivono comportamenti errati (A confonde inerzia con attrito;
                                            C e D sono affermazioni false).
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) m = 1 200 kg, a = 2,5 m/s²</span>
                                    <span style={S.solRisposta}>Risposta: B — 3 000 N</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = ma = 1\\,200 \\times 2{,}5 = 3\\,000\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) Distanza raddoppiata</span>
                                    <span style={S.solRisposta}>Risposta: C — F/4</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La forza varia come <L s="$1/r^2$" />. Se <L s="$r \to 2r$" />:{" "}
                                            <L s="$F' = G m_1 m_2/(2r)^2 = F/4$" />.
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d) m₁ = 2,0×10⁴ kg, m₂ = 5,0×10³ kg, r = 4,0 m</span>
                                    <span style={S.solRisposta}>Risposta: A — 4,17×10⁻⁴ N</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = \\frac{G m_1 m_2}{r^2} = \\frac{6{,}67\\times10^{-11}\\times 2{,}0\\times10^4 \\times 5{,}0\\times10^3}{(4{,}0)^2}"}</DisplayMath>
                                        <DisplayMath>{"= \\frac{6{,}67\\times10^{-11}\\times 10^8}{16} = \\frac{6{,}67\\times10^{-3}}{16} \\approx 4{,}17\\times10^{-4}\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Esercizi svolti</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1) Terza legge di Newton — mA = 60 kg, mB = 80 kg, F = 120 N</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Forza di reazione su A</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Per la terza legge, B esercita su A una forza di <strong>120 N</strong>,
                                            stessa direzione (orizzontale), verso opposto a quello con cui A ha spinto B.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Accelerazione di B</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"a_B = \\frac{F}{m_B} = \\frac{120}{80} = 1{,}5\\,\\text{m/s}^2"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Accelerazione di A</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"a_A = \\frac{F}{m_A} = \\frac{120}{60} = 2{,}0\\,\\text{m/s}^2"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Velocità dopo t = 2,0 s</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"v_B = a_B \\cdot t = 1{,}5 \\times 2{,}0 = 3{,}0\\,\\text{m/s}"}</DisplayMath>
                                        <DisplayMath>{"v_A = a_A \\cdot t = 2{,}0 \\times 2{,}0 = 4{,}0\\,\\text{m/s}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            A acquista la velocità maggiore perché ha massa minore: a parità di forza
                                            applicata, <L s="$a = F/m$" /> è più grande per il corpo meno massivo.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2) Gravitazione universale — Terra–Luna</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Forza Terra–Luna</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = G\\frac{M_T M_L}{d^2} = \\frac{6{,}67\\times10^{-11}\\times 5{,}97\\times10^{24}\\times 7{,}35\\times10^{22}}{(3{,}84\\times10^8)^2}"}</DisplayMath>
                                        <DisplayMath>{"= \\frac{2{,}93\\times10^{37}}{1{,}47\\times10^{17}} \\approx 1{,}99\\times10^{20}\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>⟹ <strong>F ≈ 1,99×10²⁰ N</strong></p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza della Luna sulla Terra (3ª legge)</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La Luna attrae la Terra con una forza di uguale modulo:{" "}
                                            <strong>≈ 1,99×10²⁰ N</strong>, diretta lungo la congiungente Terra–Luna,
                                            verso la Luna.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Accelerazione di gravità sulla superficie terrestre</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"g = \\frac{GM_T}{R_T^2} = \\frac{6{,}67\\times10^{-11}\\times 5{,}97\\times10^{24}}{(6{,}37\\times10^6)^2}"}</DisplayMath>
                                        <DisplayMath>{"= \\frac{3{,}98\\times10^{14}}{4{,}06\\times10^{13}} \\approx 9{,}80\\,\\text{m/s}^2"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Il risultato coincide con il valore noto <L s="$g = 9{,}8\,\text{m/s}^2$" />.
                                            La legge di gravitazione universale «ricava» l'accelerazione di gravità
                                            senza misurarla direttamente.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Distanza a cui la forza si riduce a F/4</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Poiché <L s="$F \propto 1/r^2$" />, si vuole che{" "}
                                            <L s="$r_{\text{new}}^2 = 4\,d^2$" />, quindi:
                                        </p>
                                        <DisplayMath>{"r_{\\text{new}} = 2d = 2 \\times 3{,}84\\times10^8\\,\\text{m} = 7{,}68\\times10^8\\,\\text{m}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Basta <strong>raddoppiare la distanza</strong> per ridurre la forza a un quarto.
                                        </p>
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

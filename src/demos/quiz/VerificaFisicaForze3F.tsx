/**
 * VerificaFisicaForze3F - Verifica scritta su Forze elastiche e Vettori
 * Liceo Linguistico 3F – Fisica – 10/04/2026
 * FILA A e FILA B (selezionabile)
 *
 * FILA A: teoria forza peso · MC forza peso · C.1 molla verticale · C.2 vettori
 * FILA B: teoria forza elastica · MC forza elastica · C.1 forza peso (Marte) · C.2 vettori
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

export default function VerificaFisicaForze3F(): React.ReactElement {
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
                        <div style={S.istituto}>Liceo Linguistico 3F — San Giovanni Valdarno — Classe 3ª</div>
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>Forze elastiche e Vettori</div>
                        <div style={{ textAlign: "center" }}>
                            <span style={S.filaBadge(fila)}>FILA {fila}</span>
                        </div>
                        <div style={S.metaRow}>
                            <span>10 Aprile 2026</span>
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
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(24 punti)</span></div>

                        {fila === "A" ? (
                            <>
                                {/* A.a — FILA A: forza peso */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>a)</span>
                                    <p style={S.domandaText}>
                                        Definisci la <strong>forza peso</strong>: qual è il suo modulo, la sua direzione
                                        e il suo verso? Spiega perché un corpo ha lo stesso peso sulla Luna di un altro
                                        corpo con massa diversa che si trova sulla Terra.
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>

                                {/* A.b — FILA A: vettori */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>b)</span>
                                    <p style={S.domandaText}>
                                        Cosa si intende per <strong>forza risultante</strong> di due vettori-forza?
                                        Spiega come si ottiene la risultante utilizzando il metodo delle componenti
                                        cartesiane.
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* A.a — FILA B: legge di Hooke */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>a)</span>
                                    <p style={S.domandaText}>
                                        Enuncia la <strong>legge di Hooke</strong> e spiega il significato fisico della
                                        costante elastica <L s="$k$" />. Che cosa succede a una molla reale se la si
                                        allunga oltre il limite elastico?
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>

                                {/* A.b — FILA B: dinamometro */}
                                <div style={S.domanda}>
                                    <span style={S.domandaLabel}>b)</span>
                                    <p style={S.domandaText}>
                                        Descrivi il funzionamento del <strong>dinamometro</strong>: su quale principio
                                        fisico si basa? Spiega inoltre la differenza tra <strong>grandezza scalare</strong>{" "}
                                        e <strong>grandezza vettoriale</strong>, con un esempio per ciascuna.
                                    </p>
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Risposta multipla (motivare)
                        FILA A → forza peso   |   FILA B → forza elastica
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Parte B – Domande a risposta multipla
                            {fila === "A" ? " sulla forza peso" : " sulla forza elastica"}
                            {" "}(motivare) <span style={S.punti}>(20 punti)</span>
                        </div>
                        <p style={S.istruzione}>
                            Per ogni domanda: indica la risposta corretta e motiva brevemente la scelta.
                        </p>

                        {/* B.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>Quale affermazione su massa e peso è corretta?</p>
                                    <span style={S.mcOption}><strong>A.</strong> La massa dipende dal pianeta in cui ci si trova</span>
                                    <span style={S.mcOption}><strong>B.</strong> Il peso è una forza e dipende dall'accelerazione di gravità</span>
                                    <span style={S.mcOption}><strong>C.</strong> Massa e peso si misurano entrambi in newton</span>
                                    <span style={S.mcOption}><strong>D.</strong> Il peso è costante ovunque nell'universo</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>Quale formula esprime correttamente la legge di Hooke?</p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$F = k / x$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$F = k \cdot x$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$F = k + x$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$F = k^2 \cdot x$" /></span>
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
                                        Un corpo ha massa <L s="$m = 45\,\text{kg}$" />.
                                        Qual è il suo peso sulla Terra (<L s="$g = 9{,}8\,\text{N/kg}$" />)?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$45\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$441\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$4{,}6\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$459\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Qual è l'unità di misura della costante elastica <L s="$k$" /> nel Sistema Internazionale?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$\text{kg} \cdot \text{m}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$\text{N} \cdot \text{m}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$\text{N/m}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$\text{J}$" /></span>
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
                                        Un astronauta pesa <L s="$686\,\text{N}$" /> sulla Terra.
                                        Su un pianeta con <L s="$g = 4{,}9\,\text{N/kg}$" />, qual è il suo peso?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$686\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$1\,372\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$343\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$70\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Una molla con <L s="$k = 250\,\text{N/m}$" /> è soggetta a una forza di <L s="$10\,\text{N}$" />.
                                        Di quanto si allunga?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$2\,500\,\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$4\,\text{cm}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$25\,\text{cm}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$40\,\text{m}$" /></span>
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
                                        Un oggetto ha peso <L s="$P = 39{,}2\,\text{N}$" /> sulla Terra
                                        (<L s="$g = 9{,}8\,\text{N/kg}$" />). Qual è la sua massa?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$39{,}2\,\text{kg}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$384\,\text{kg}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$4{,}00\,\text{kg}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$0{,}25\,\text{kg}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un dinamometro con <L s="$k = 80\,\text{N/m}$" /> mostra un allungamento di{" "}
                                        <L s="$2{,}5\,\text{cm}$" />. Quale forza è applicata?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$3\,200\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$0{,}32\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$32\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$2\,\text{N}$" /></span>
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

                        {/* C.1 — FILA A: molla verticale  |  FILA B: forza peso su Marte */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                {fila === "A" ? "Molla verticale" : "Forza peso su Marte"}
                            </span>

                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Un blocco di acciaio è posto sopra una molla verticale con costante elastica{" "}
                                    <L s="$k = 1\,750\,\text{N/m}$" />. Il blocco comprime la molla di{" "}
                                    <L s="$3{,}15\,\text{cm}$" />. Determina la massa del blocco.
                                    Usa <L s="$g = 9{,}81\,\text{N/kg}$" />.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Una sonda spaziale porta a bordo un campione di roccia di massa{" "}
                                    <L s="$m = 2{,}50\,\text{kg}$" />. Sulla Terra il peso del campione è{" "}
                                    <L s="$24{,}5\,\text{N}$" />. L'accelerazione di gravità su Marte è{" "}
                                    <L s="$g_M = 3{,}72\,\text{N/kg}$" />.
                                </p>
                            )}

                            {fila === "A" ? (
                                <div style={{ marginLeft: 16, marginTop: 10 }}>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                        <strong>i.)</strong> Converti la compressione da centimetri a metri.
                                    </p>
                                    <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                        <strong>ii.)</strong> Calcola la forza elastica esercitata dalla molla.
                                    </p>
                                    <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                        <strong>iii.)</strong> Il blocco è in equilibrio. Ricava la sua massa.
                                    </p>
                                    <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                        <strong>*iv.)</strong> Se la massa del blocco raddoppiasse, di quanto si comprimerebbe la molla? Motiva brevemente.
                                    </p>
                                    <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>
                            ) : (
                                <div style={{ marginLeft: 16, marginTop: 10 }}>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                        <strong>i.)</strong> Ricava il valore dell'accelerazione di gravità sulla Terra dai dati forniti.
                                    </p>
                                    <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                        <strong>ii.)</strong> Calcola il peso del campione di roccia su Marte.
                                    </p>
                                    <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                        <strong>iii.)</strong> Un astronauta pesa <L s="$750\,\text{N}$" /> sulla Terra.
                                        Calcola la sua massa e il suo peso su Marte.
                                    </p>
                                    <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                    <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                        <strong>*iv.)</strong> Di quanto è minore (in percentuale) il peso dell'astronauta
                                        su Marte rispetto alla Terra?
                                    </p>
                                    <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                                </div>
                            )}
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 — Vettori */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span></span>
                            <p style={S.domandaText}>Su un oggetto agiscono due forze.</p>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Una forza <L s="$\vec{F}_1$" /> ha intensità <L s="$45{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$35°$" /> al di sopra del semiasse positivo delle <L s="$x$" />.
                                    Una seconda forza <L s="$\vec{F}_2$" /> ha intensità <L s="$30{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$120°$" /> rispetto al semiasse positivo delle <L s="$x$" />.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Una forza <L s="$\vec{F}_1$" /> ha intensità <L s="$50{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$25°$" /> al di sopra del semiasse positivo delle <L s="$x$" />.
                                    Una seconda forza <L s="$\vec{F}_2$" /> ha intensità <L s="$35{,}0\,\text{N}$" /> e direzione{" "}
                                    <L s="$140°$" /> rispetto al semiasse positivo delle <L s="$x$" />.
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
                                            <span style={S.solLabel}>a) La forza peso</span>
                                            <p style={S.solText}>
                                                La <strong>forza peso</strong> è la forza gravitazionale con cui la Terra
                                                attrae un corpo. Il suo modulo è <L s="$P = mg$" />, la sua direzione è
                                                verticale e il suo verso è verso il basso.
                                            </p>
                                            <p style={S.solText}>
                                                Due corpi di masse diverse possono avere lo stesso peso su pianeti diversi
                                                perché il peso dipende sia dalla massa (<L s="$m$" />) sia dall'accelerazione
                                                di gravità locale (<L s="$g$" />): un corpo meno massivo su un pianeta con
                                                <L s="$g$" /> maggiore può pesare quanto un corpo più massivo su un pianeta
                                                con <L s="$g$" /> minore.
                                            </p>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Forza risultante e metodo delle componenti</span>
                                            <p style={S.solText}>
                                                La <strong>forza risultante</strong> è l'unica forza equivalente
                                                all'insieme di tutte le forze applicate a un corpo.
                                            </p>
                                            <p style={S.solText}>
                                                Con il metodo delle componenti: si scompone ogni forza in componente
                                                orizzontale (<L s="$F_x = F\cos\theta$" />) e verticale (<L s="$F_y = F\sin\theta$" />),
                                                si sommano separatamente tutte le componenti <L s="$x$" /> e tutte le
                                                componenti <L s="$y$" />, poi si ricostruisce la risultante con il teorema
                                                di Pitagora: <L s="$R = \sqrt{R_x^2 + R_y^2}$" />.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Legge di Hooke e costante elastica</span>
                                            <p style={S.solText}>
                                                La <strong>legge di Hooke</strong> afferma che la forza elastica di una
                                                molla è proporzionale all'allungamento (o compressione) <L s="$x$" />:{" "}
                                                <L s="$F = kx$" />.
                                            </p>
                                            <p style={S.solText}>
                                                La costante <L s="$k$" /> misura la rigidità della molla (si misura in
                                                N/m). Se si supera il <strong>limite elastico</strong> la molla si deforma
                                                permanentemente e non torna alla lunghezza originale; la legge di Hooke
                                                cessa di valere.
                                            </p>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Dinamometro · scalare vs vettoriale</span>
                                            <p style={S.solText}>
                                                Il <strong>dinamometro</strong> misura forze sfruttando la deformazione
                                                elastica di una molla: la forza applicata allunga la molla di una
                                                quantità proporzionale (legge di Hooke), letta su una scala tarata in newton.
                                            </p>
                                            <p style={S.solText}>
                                                Una <strong>grandezza scalare</strong> è descritta da un numero e un'unità
                                                (es. la costante elastica <L s="$k$" /> in N/m). Una{" "}
                                                <strong>grandezza vettoriale</strong> richiede anche direzione e verso
                                                (es. la forza elastica, che agisce lungo la molla verso la posizione di
                                                equilibrio).
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
                                            <span style={S.solLabel}>a) Massa e peso</span>
                                            <span style={S.solRisposta}>Risposta: B</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    Il peso è una <strong>forza</strong> (<L s="$P = mg$" />, si misura in N)
                                                    e dipende da <L s="$g$" />. La massa è invariante e si misura in kg.
                                                </p>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Peso di m = 45 kg sulla Terra</span>
                                            <span style={S.solRisposta}>Risposta: B — 441 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = 45 \\times 9{,}8 = 441\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>c) Peso con g = 4,9 N/kg, P_Terra = 686 N</span>
                                            <span style={S.solRisposta}>Risposta: C — 343 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"m = \\frac{686}{9{,}8} = 70\\,\\text{kg} \\qquad P = 70 \\times 4{,}9 = 343\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>*d) Massa da P = 39,2 N</span>
                                            <span style={S.solRisposta}>Risposta: C — 4,00 kg</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"m = \\frac{P}{g} = \\frac{39{,}2}{9{,}8} = 4{,}00\\,\\text{kg}"}</DisplayMath>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Formula della legge di Hooke</span>
                                            <span style={S.solRisposta}>Risposta: B</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    <L s="$F = k \cdot x$" />: la forza è direttamente proporzionale
                                                    all'allungamento. Le altre opzioni non rispettano questa relazione lineare.
                                                </p>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Unità di misura di k</span>
                                            <span style={S.solRisposta}>Risposta: C — N/m</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    Da <L s="$k = F/x$" /> si ottiene <L s="$[k] = \text{N}/\text{m}$" />.
                                                </p>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>c) Allungamento con k = 250 N/m, F = 10 N</span>
                                            <span style={S.solRisposta}>Risposta: B — 4 cm</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x = \\frac{F}{k} = \\frac{10}{250} = 0{,}04\\,\\text{m} = 4\\,\\text{cm}"}</DisplayMath>
                                            </div>
                                        </div>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>*d) Dinamometro: k = 80 N/m, x = 2,5 cm</span>
                                            <span style={S.solRisposta}>Risposta: D — 2 N</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F = 80 \\times 0{,}025 = 2\\,\\text{N}"}</DisplayMath>
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
                                        <span style={S.solLabel}>1) Molla verticale — k = 1 750 N/m, x = 3,15 cm</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"x = 3{,}15\\,\\text{cm} = 0{,}0315\\,\\text{m}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza elastica</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"F = k \\cdot x = 1\\,750 \\times 0{,}0315 = 55{,}1\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Massa del blocco</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"m = \\frac{F}{g} = \\frac{55{,}1}{9{,}81} \\approx 5{,}62\\,\\text{kg}"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 4 }}>⟹ <strong>m ≈ 5,62 kg</strong></p>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Se la massa raddoppia</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13 }}>
                                                Raddoppiando <L s="$m$" />, la forza peso raddoppia; poiché{" "}
                                                <L s="$x = F/k$" />, anche la compressione raddoppia:
                                            </p>
                                            <DisplayMath>{"x' = 2 \\times 3{,}15\\,\\text{cm} = 6{,}30\\,\\text{cm}"}</DisplayMath>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>1) Forza peso su Marte — m = 2,50 kg, P_Terra = 24,5 N</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) g sulla Terra</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"g_T = \\frac{P}{m} = \\frac{24{,}5}{2{,}50} = 9{,}80\\,\\text{N/kg}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Peso del campione su Marte</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"P_M = m \\cdot g_M = 2{,}50 \\times 3{,}72 = 9{,}30\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Astronauta: massa e peso su Marte</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"m_a = \\frac{750}{9{,}80} \\approx 76{,}5\\,\\text{kg}"}</DisplayMath>
                                            <DisplayMath>{"P_{M,a} = 76{,}5 \\times 3{,}72 \\approx 285\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Riduzione percentuale del peso</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"\\Delta\\% = \\frac{750 - 285}{750} \\times 100 \\approx 62{,}0\\%"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 4 }}>
                                                Su Marte l'astronauta pesa circa il <strong>62% in meno</strong> rispetto alla Terra.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* C.2 */}
                                {fila === "A" ? (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>2) F₁ = 45,0 N a 35° — F₂ = 30,0 N a 120°</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 6 }}>i) Componenti cartesiane</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                                <L s="$\vec{F}_1$" /> (35°):
                                            </p>
                                            <DisplayMath>{"F_{1x} = 45{,}0 \\cos 35° \\approx 36{,}9\\,\\text{N} \\qquad F_{1y} = 45{,}0 \\sin 35° \\approx 25{,}8\\,\\text{N}"}</DisplayMath>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
                                                <L s="$\vec{F}_2$" /> (120°):
                                            </p>
                                            <DisplayMath>{"F_{2x} = 30{,}0 \\cos 120° = -15{,}0\\,\\text{N} \\qquad F_{2y} = 30{,}0 \\sin 120° \\approx 26{,}0\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iii) Componenti risultante</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R_x = 36{,}9 - 15{,}0 = 21{,}9\\,\\text{N} \\qquad R_y = 25{,}8 + 26{,}0 = 51{,}8\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iv) Modulo e direzione</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R = \\sqrt{21{,}9^2 + 51{,}8^2} \\approx 56{,}2\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"\\theta = \\arctan\\!\\left(\\frac{51{,}8}{21{,}9}\\right) \\approx 67{,}1°\\text{ (1° quadrante)}"}</DisplayMath>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>2) F₁ = 50,0 N a 25° — F₂ = 35,0 N a 140°</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 6 }}>i) Componenti cartesiane</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                                <L s="$\vec{F}_1$" /> (25°):
                                            </p>
                                            <DisplayMath>{"F_{1x} = 50{,}0 \\cos 25° \\approx 45{,}3\\,\\text{N} \\qquad F_{1y} = 50{,}0 \\sin 25° \\approx 21{,}1\\,\\text{N}"}</DisplayMath>
                                            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>
                                                <L s="$\vec{F}_2$" /> (140°):
                                            </p>
                                            <DisplayMath>{"F_{2x} = 35{,}0 \\cos 140° \\approx -26{,}8\\,\\text{N} \\qquad F_{2y} = 35{,}0 \\sin 140° \\approx 22{,}5\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iii) Componenti risultante</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R_x = 45{,}3 - 26{,}8 = 18{,}5\\,\\text{N} \\qquad R_y = 21{,}1 + 22{,}5 = 43{,}6\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>iv) Modulo e direzione</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"R = \\sqrt{18{,}5^2 + 43{,}6^2} \\approx 47{,}4\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"\\theta = \\arctan\\!\\left(\\frac{43{,}6}{18{,}5}\\right) \\approx 67{,}0°\\text{ (1° quadrante)}"}</DisplayMath>
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
                        Liceo Linguistico 3F · Fisica · Forze elastiche e Vettori · Giovanni Ugolini · 10/04/2026
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

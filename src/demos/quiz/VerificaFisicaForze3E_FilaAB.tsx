/**
 * VerificaFisicaForze3E_FilaAB – Verifica: Forze, Molla, Piano Inclinato, Momento
 * Liceo Linguistico 3E – Fisica – Maggio 2026 – FILA A / FILA B
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

type Fila = "A" | "B";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
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

    btnFila: (active: boolean, fila: Fila): React.CSSProperties => ({
        padding: "6px 20px",
        border: active
            ? `2px solid ${fila === "A" ? "#1e40af" : "#d97706"}`
            : "2px solid #e2e8f0",
        borderRadius: 6,
        background: active
            ? fila === "A" ? "#dbeafe" : "#fef3c7"
            : "#f8fafc",
        color: active
            ? fila === "A" ? "#1e40af" : "#92400e"
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

// ─── Componente principale ───────────────────────────────────────────────────

export default function VerificaFisicaForze3E_FilaAB(): React.ReactElement {
    const [fila, setFila] = useState<Fila>("A");
    const [showSoluzioni, setShowSoluzioni] = useState(false);

    const filaBadge = fila === "A"
        ? { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" }
        : { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };

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
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button
                                style={S.btnFila(fila === "A", "A")}
                                onClick={() => { setFila("A"); setShowSoluzioni(false); }}
                            >FILA A</button>
                            <button
                                style={S.btnFila(fila === "B", "B")}
                                onClick={() => { setFila("B"); setShowSoluzioni(false); }}
                            >FILA B</button>
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

                <div style={S.sheet} className="verifica-sheet">

                    {/* ── Intestazione ── */}
                    <div style={S.headerDoc}>
                        <div style={S.istituto}>Liceo Linguistico — San Giovanni Valdarno — Classe 3ª E</div>
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>
                            Forza elastica · Forza di attrito · Piano inclinato · Momento torcente · Equilibrio
                        </div>
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
                                border: `1.5px solid ${filaBadge.border}`,
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
                        Gli esercizi contrassegnati con <strong>*</strong> sono facoltativi per BES e DSA.&nbsp;
                        Usa <L s="$g = 9{,}8\,\text{N/kg}$" /> dove non diversamente indicato.
                    </div>

                    {/* ════════════════════════════════════
                        PARTE A – Domande a risposta aperta (identiche per A e B)
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(24 punti)</span></div>

                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Enuncia la <strong>legge di Hooke</strong> e scrivi la relativa formula, specificando
                                le grandezze coinvolte e la loro unità di misura nel SI. Spiega cosa si intende per{" "}
                                <strong>limite elastico</strong> di una molla e cosa accade se la forza applicata
                                lo supera.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Definisci il <strong>momento torcente</strong> (o momento di una forza) rispetto a un
                                punto, specificando come si calcola nel caso in cui la forza sia perpendicolare al
                                braccio. Enuncia poi le <strong>due condizioni di equilibrio</strong> di un corpo rigido.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
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

                        {/* B.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>Quale affermazione sulla <strong>forza di attrito statico</strong> è corretta?</p>
                                    <span style={S.mcOption}><strong>A.</strong> La forza di attrito statico è sempre uguale a <L s="$\mu_s \cdot F_{\perp}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> La forza di attrito statico agisce nella stessa direzione del moto</span>
                                    <span style={S.mcOption}><strong>C.</strong> La forza di attrito statico non può mai superare il valore <L s="$\mu_s \cdot F_{\perp}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> La forza di attrito statico dipende dalla velocità del corpo</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>Quale affermazione sulla <strong>legge di Hooke</strong> è corretta?</p>
                                    <span style={S.mcOption}><strong>A.</strong> La forza elastica è proporzionale alla velocità di deformazione</span>
                                    <span style={S.mcOption}><strong>B.</strong> La costante elastica <L s="$k$" /> si misura in <L s="$\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> La forza elastica è proporzionale all'allungamento: <L s="$F = k \cdot x$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> La legge di Hooke vale per qualsiasi deformazione, anche oltre il limite elastico</span>
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
                                        Un dinamometro con costante elastica <L s="$k = 490\,\text{N/m}$" /> si allunga
                                        di <L s="$4{,}00\,\text{cm}$" />. Quale forza lo sta allungando?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$122{,}5\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$19{,}6\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$1{,}96\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$196\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un dinamometro con costante elastica <L s="$k = 500\,\text{N/m}$" /> si allunga
                                        di <L s="$6{,}00\,\text{cm}$" />. Quale forza lo sta allungando?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$83{,}3\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$30{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$3{,}00\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$300\,\text{N}$" /></span>
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
                                        Un blocco di <L s="$m = 10\,\text{kg}$" /> è appoggiato su un piano orizzontale.
                                        Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}30$" />.
                                        Qual è la forza orizzontale minima per mettere in moto il blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$0{,}30\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$3{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$29{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$98\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di <L s="$m = 5{,}0\,\text{kg}$" /> è appoggiato su un piano orizzontale.
                                        Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}40$" />.
                                        Qual è la forza orizzontale minima per mettere in moto il blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$2{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$19{,}6\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$49{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$12{,}3\,\text{N}$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            {fila === "A" ? (
                                <>
                                    <p style={S.domandaText}>
                                        A una leva è applicata una forza di <L s="$60\,\text{N}$" />, perpendicolare al
                                        braccio di <L s="$0{,}40\,\text{m}$" />. Qual è il momento torcente?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$24\,\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$150\,\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$2{,}4\,\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$0{,}007\,\text{N}{\cdot}\text{m}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        A una leva è applicata una forza di <L s="$40\,\text{N}$" />, perpendicolare al
                                        braccio di <L s="$0{,}50\,\text{m}$" />. Qual è il momento torcente?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$80\,\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$20\,\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$2{,}0\,\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$8{,}0\,\text{N}{\cdot}\text{m}$" /></span>
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

                        {/* C.1 — Molla con blocco appeso */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Molla con blocco appeso
                            </span>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa incognita viene agganciato a un dinamometro verticale con
                                    costante elastica <L s="$k = 490\,\text{N/m}$" />. Il dinamometro si allunga
                                    di <L s="$4{,}00\,\text{cm}$" />. Determina la massa del blocco.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Un blocco di massa incognita viene agganciato a un dinamometro verticale con
                                    costante elastica <L s="$k = 490\,\text{N/m}$" />. Il dinamometro si allunga
                                    di <L s="$6{,}00\,\text{cm}$" />. Determina la massa del blocco.
                                </p>
                            )}
                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Converti l'allungamento da centimetri a metri.
                                </p>
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Applica la legge di Hooke e calcola la forza elastica.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Il blocco è in equilibrio: la forza elastica bilancia la forza peso.
                                    Ricava la massa del blocco.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong>{" "}
                                    {fila === "A"
                                        ? <>Se il dinamometro avesse costante elastica <L s="$k' = 245\,\text{N/m}$" /> (la metà), di quanto si allungherebbe per sostenere lo stesso blocco? Motiva.</>
                                        : <>Se il dinamometro avesse costante elastica <L s="$k' = 980\,\text{N/m}$" /> (il doppio), di quanto si allungherebbe per sostenere lo stesso blocco? Motiva.</>
                                    }
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 — Piano inclinato con molla */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Piano inclinato con forza elastica
                            </span>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è in equilibrio su un piano
                                    inclinato liscio. La base del piano è <L s="$b = 4{,}0\,\text{m}$" />,
                                    l'altezza è <L s="$h = 3{,}0\,\text{m}$" />. Il blocco è trattenuto da una
                                    molla parallela al piano, allungata di <L s="$x = 0{,}30\,\text{m}$" />.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è in equilibrio su un piano
                                    inclinato liscio. La base del piano è <L s="$b = 3{,}0\,\text{m}$" />,
                                    l'altezza è <L s="$h = 4{,}0\,\text{m}$" />. Il blocco è trattenuto da una
                                    molla parallela al piano, allungata di <L s="$x = 0{,}20\,\text{m}$" />.
                                </p>
                            )}

                            <div style={{ marginLeft: 16, marginTop: 8 }}>
                                <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
                                    Disegna le forze sul blocco (forza peso, forza vincolare, forza elastica della molla):
                                </p>
                                <div style={{ height: 100, border: "1px dashed #cbd5e1", borderRadius: 4, marginBottom: 12 }} />
                            </div>

                            <div style={{ marginLeft: 16, marginTop: 6 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Usa il teorema di Pitagora per trovare la lunghezza <L s="$L$" /> del
                                    piano. Ricava poi <L s="$\sin\theta$" /> e <L s="$\cos\theta$" /> come rapporti tra i lati del triangolo.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Calcola la componente del peso <em>parallela</em> al piano{" "}
                                    <L s="$F_\parallel = mg\sin\theta$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Il blocco è in equilibrio lungo il piano: la forza elastica
                                    bilancia <L s="$F_\parallel$" />. Applica la{" "}
                                    <strong>legge di Hooke</strong> (<L s="$F_{el} = k \cdot x$" />) e calcola la
                                    costante elastica <L s="$k$" /> della molla.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Se la massa del blocco fosse raddoppiata (a parità di <L s="$k$" />),
                                    di quanto si allungherebbe la molla? Motiva.
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
                        SOLUZIONI
                    ════════════════════════════════════ */}
                    {showSoluzioni && (
                        <div style={S.soluzioniSection} className="soluzioni-section no-print">
                            <div style={S.soluzioniTitle}>✅ Soluzioni – Fila {fila}</div>

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposte attese</div>
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Legge di Hooke e limite elastico</span>
                                    <p style={S.solText}>
                                        La <strong>legge di Hooke</strong>: <L s="$F = k \cdot x$" />, dove <L s="$k$" /> è
                                        la costante elastica (N/m) e <L s="$x$" /> l'allungamento (m).
                                    </p>
                                    <p style={S.solText}>
                                        Il <strong>limite elastico</strong> è la massima deformazione oltre la quale la
                                        molla non torna alla lunghezza naturale: la deformazione diventa permanente e la
                                        legge di Hooke cessa di valere.
                                    </p>
                                </div>
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Momento torcente e condizioni di equilibrio</span>
                                    <p style={S.solText}>
                                        Il <strong>momento torcente</strong>: <L s="$M = F \cdot d$" /> (N·m), con <L s="$d$" /> braccio
                                        perpendicolare alla forza.
                                    </p>
                                    <p style={S.solText}>
                                        Due condizioni di equilibrio del corpo rigido: (1){" "}
                                        <L s="$\sum \vec{F} = \vec{0}$" /> (traslazionale); (2){" "}
                                        <L s="$\sum M = 0$" /> (rotazionale).
                                    </p>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposta multipla</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a)</span>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <p style={S.solText}>
                                                L'attrito statico varia da 0 fino a un massimo di <L s="$\mu_s F_\perp$" />,
                                                ma non è sempre uguale a quel massimo (A falsa). Non agisce nella direzione
                                                del moto (B falsa). Non dipende dalla velocità (D falsa).
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <p style={S.solText}>
                                                La legge di Hooke è <L s="$F = k \cdot x$" />: la forza è proporzionale
                                                all'allungamento. <L s="$k$" /> si misura in N/m (non N·m, B falsa).
                                                Vale solo entro il limite elastico (D falsa).
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b)</span>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F = k \\cdot x = 490 \\times 0{,}0400 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F = k \\cdot x = 500 \\times 0{,}0600 = 30{,}0\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c)</span>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\perp} = mg = 10 \\times 9{,}8 = 98\\,\\text{N} \\qquad f_{s,\\max} = 0{,}30 \\times 98 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\perp} = mg = 5{,}0 \\times 9{,}8 = 49{,}0\\,\\text{N} \\qquad f_{s,\\max} = 0{,}40 \\times 49{,}0 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d)</span>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solRisposta}>A</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"M = F \\cdot d = 60 \\times 0{,}40 = 24\\,\\text{N}{\\cdot}\\text{m}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"M = F \\cdot d = 40 \\times 0{,}50 = 20\\,\\text{N}{\\cdot}\\text{m}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Esercizi svolti</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <span style={S.solLabel}>1) k = 490 N/m, x = 4,00 cm</span>
                                    ) : (
                                        <span style={S.solLabel}>1) k = 490 N/m, x = 6,00 cm</span>
                                    )}

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                    <div style={S.solStep}>
                                        {fila === "A"
                                            ? <DisplayMath>{"x = 4{,}00\\,\\text{cm} = 0{,}0400\\,\\text{m}"}</DisplayMath>
                                            : <DisplayMath>{"x = 6{,}00\\,\\text{cm} = 0{,}0600\\,\\text{m}"}</DisplayMath>
                                        }
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza elastica</p>
                                    <div style={S.solStep}>
                                        {fila === "A"
                                            ? <DisplayMath>{"F_{el} = 490 \\times 0{,}0400 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                            : <DisplayMath>{"F_{el} = 490 \\times 0{,}0600 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                        }
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Massa</p>
                                    <div style={S.solStep}>
                                        {fila === "A" ? (
                                            <>
                                                <DisplayMath>{"m = \\frac{F_{el}}{g} = \\frac{19{,}6}{9{,}8} = 2{,}00\\,\\text{kg}"}</DisplayMath>
                                            </>
                                        ) : (
                                            <>
                                                <DisplayMath>{"m = \\frac{F_{el}}{g} = \\frac{29{,}4}{9{,}8} = 3{,}00\\,\\text{kg}"}</DisplayMath>
                                            </>
                                        )}
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv)</p>
                                    <div style={S.solStep}>
                                        {fila === "A" ? (
                                            <>
                                                <p style={{ fontSize: 13 }}>La forza rimane 19,6 N. Con <L s="$k' = 245\,\text{N/m}$" /> (la metà), l'allungamento raddoppia:</p>
                                                <DisplayMath>{"x' = \\frac{19{,}6}{245} = 0{,}0800\\,\\text{m} = 8{,}00\\,\\text{cm}"}</DisplayMath>
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ fontSize: 13 }}>La forza rimane 29,4 N. Con <L s="$k' = 980\,\text{N/m}$" /> (il doppio), l'allungamento si dimezza:</p>
                                                <DisplayMath>{"x' = \\frac{29{,}4}{980} = 0{,}0300\\,\\text{m} = 3{,}00\\,\\text{cm}"}</DisplayMath>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <span style={S.solLabel}>2) Piano inclinato + molla — m = 5,0 kg, b = 4,0 m, h = 3,0 m, x = 0,30 m</span>
                                    ) : (
                                        <span style={S.solLabel}>2) Piano inclinato + molla — m = 5,0 kg, b = 3,0 m, h = 4,0 m, x = 0,20 m</span>
                                    )}

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Pitagora e angoli</p>
                                    <div style={S.solStep}>
                                        {fila === "A" ? (
                                            <>
                                                <DisplayMath>{"L = \\sqrt{4{,}0^2 + 3{,}0^2} = \\sqrt{25} = 5{,}0\\,\\text{m}"}</DisplayMath>
                                                <DisplayMath>{"\\sin\\theta = \\frac{3{,}0}{5{,}0} = 0{,}60 \\qquad \\cos\\theta = \\frac{4{,}0}{5{,}0} = 0{,}80"}</DisplayMath>
                                            </>
                                        ) : (
                                            <>
                                                <DisplayMath>{"L = \\sqrt{3{,}0^2 + 4{,}0^2} = \\sqrt{25} = 5{,}0\\,\\text{m}"}</DisplayMath>
                                                <DisplayMath>{"\\sin\\theta = \\frac{4{,}0}{5{,}0} = 0{,}80 \\qquad \\cos\\theta = \\frac{3{,}0}{5{,}0} = 0{,}60"}</DisplayMath>
                                            </>
                                        )}
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Componente parallela</p>
                                    <div style={S.solStep}>
                                        {fila === "A" ? (
                                            <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                        ) : (
                                            <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                        )}
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Costante elastica (legge di Hooke)</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio lungo il piano: <L s="$F_{el} = F_\parallel$" />.
                                            Dalla legge di Hooke <L s="$F_{el} = k \cdot x$" />:
                                        </p>
                                        {fila === "A" ? (
                                            <DisplayMath>{"k = \\frac{F_{\\parallel}}{x} = \\frac{29{,}4}{0{,}30} = 98\\,\\text{N/m}"}</DisplayMath>
                                        ) : (
                                            <DisplayMath>{"k = \\frac{F_{\\parallel}}{x} = \\frac{39{,}2}{0{,}20} = 196\\,\\text{N/m}"}</DisplayMath>
                                        )}
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Massa raddoppiata</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Con <L s="$m' = 10{,}0\,\text{kg}$" />, <L s="$F'_\parallel$" /> raddoppia,
                                            mentre <L s="$k$" /> è costante, quindi <L s="$x' = F'_\parallel / k$" /> raddoppia:
                                        </p>
                                        {fila === "A" ? (
                                            <DisplayMath>{"x' = \\frac{2 \\times 29{,}4}{98} = 0{,}60\\,\\text{m}"}</DisplayMath>
                                        ) : (
                                            <DisplayMath>{"x' = \\frac{2 \\times 39{,}2}{196} = 0{,}40\\,\\text{m}"}</DisplayMath>
                                        )}
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

// ─── Helper components ───────────────────────────────────────────────────────

function RigaRisposta(): React.ReactElement {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginTop: 8, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif",
        }}>
            <span>Risposta:</span>
            <span style={{ width: 60, borderBottom: "1px solid #94a3b8", display: "inline-block" }} />
        </div>
    );
}

function RigaMotivazione(): React.ReactElement {
    const row: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: 12,
        marginTop: 4, fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif",
    };
    const linea: React.CSSProperties = { flex: 1, borderBottom: "1px solid #94a3b8", minWidth: 80 };
    return (
        <>
            <div style={row}>
                <span>Motivazione:</span>
                <span style={linea} />
            </div>
            <div style={row}>
                <span style={{ opacity: 0 }}>Motivazione:</span>
                <span style={linea} />
            </div>
        </>
    );
}

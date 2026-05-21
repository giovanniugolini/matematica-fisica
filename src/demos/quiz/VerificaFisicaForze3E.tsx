/**
 * VerificaFisicaForze3E – Verifica scritta su Forze, Attrito, Piano Inclinato, Momento Torcente
 * Liceo Linguistico 3E – Fisica – Maggio 2026
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

    filaBadge: {
        display: "inline-block",
        margin: "6px auto 0",
        padding: "3px 18px",
        borderRadius: 20,
        background: "#dbeafe",
        color: "#1e40af",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "1px",
        fontFamily: "system-ui, sans-serif",
        border: "1.5px solid #93c5fd",
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

export default function VerificaFisicaForze3E(): React.ReactElement {
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
                        <div style={S.istituto}>Liceo Linguistico — San Giovanni Valdarno — Classe 3ª E</div>
                        <div style={S.title}>Simulazione di Fisica</div>
                        <div style={S.disciplina}>
                            Forza elastica · Forza di attrito · Piano inclinato · Momento torcente · Equilibrio
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <span style={S.filaBadge}>SIMULAZIONE</span>
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
                        PARTE A – Domande a risposta aperta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(24 punti)</span></div>

                        {/* A.a — Legge di Hooke */}
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

                        {/* A.b — Momento torcente ed equilibrio del corpo rigido */}
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

                        {/* B.a — Attrito statico (N → F_⊥) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>Quale affermazione sulla <strong>forza di attrito statico</strong> è corretta?</p>
                            <span style={S.mcOption}><strong>A.</strong> La forza di attrito statico è sempre uguale a <L s="$\mu_s \cdot F_{\perp}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> La forza di attrito statico agisce nella stessa direzione del moto</span>
                            <span style={S.mcOption}><strong>C.</strong> La forza di attrito statico non può mai superare il valore <L s="$\mu_s \cdot F_{\perp}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> La forza di attrito statico dipende dalla velocità del corpo</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b — Calcolo forza elastica */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Un dinamometro con costante elastica <L s="$k = 490\,\text{N/m}$" /> si allunga
                                di <L s="$4{,}00\,\text{cm}$" />. Quale forza lo sta allungando?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$122{,}5\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$19{,}6\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$1{,}96\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$196\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c — Attrito statico: forza massima */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>
                                Un blocco di <L s="$m = 10\,\text{kg}$" /> è appoggiato su un piano orizzontale.
                                Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}30$" />.
                                Qual è la forza orizzontale minima per mettere in moto il blocco?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$0{,}30\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$3{,}0\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$29{,}4\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$98\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d — Momento torcente (*facoltativo) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            <p style={S.domandaText}>
                                A una leva è applicata una forza di <L s="$60\,\text{N}$" />, perpendicolare al
                                braccio di <L s="$0{,}40\,\text{m}$" />. Qual è il momento torcente?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$24\,\text{N}{\cdot}\text{m}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$150\,\text{N}{\cdot}\text{m}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$2{,}4\,\text{N}{\cdot}\text{m}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$0{,}007\,\text{N}{\cdot}\text{m}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Esercizi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte C – Esercizi</div>

                        {/* C.1 — Legge di Hooke: molla con blocco appeso */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Molla con blocco appeso
                            </span>

                            <p style={S.domandaText}>
                                Un blocco di massa incognita viene agganciato a un dinamometro verticale con
                                costante elastica <L s="$k = 490\,\text{N/m}$" />. Il dinamometro si allunga
                                di <L s="$4{,}00\,\text{cm}$" />. Determina la massa del blocco.
                            </p>

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
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Se il dinamometro avesse costante elastica <L s="$k' = 245\,\text{N/m}$" /> (la metà),
                                    di quanto si allungherebbe per sostenere lo stesso blocco? Motiva.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 — Piano inclinato con attrito */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Piano inclinato con attrito
                            </span>

                            <p style={S.domandaText}>
                                Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è in equilibrio su un piano
                                inclinato. Il piano ha lunghezza <L s="$L = 2{,}50\,\text{m}$" /> e altezza{" "}
                                <L s="$h = 1{,}50\,\text{m}$" />. Non è noto l'angolo di inclinazione.
                            </p>

                            {/* Spazio per il disegno delle forze */}
                            <div style={{ marginLeft: 16, marginTop: 8 }}>
                                <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
                                    Disegna le forze sul blocco (forza peso, forza vincolare, forza di attrito):
                                </p>
                                <div style={{ height: 100, border: "1px dashed #cbd5e1", borderRadius: 4, marginBottom: 12 }} />
                            </div>

                            <div style={{ marginLeft: 16, marginTop: 6 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola la componente del peso <em>parallela</em> al piano.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Il blocco è in equilibrio lungo il piano: la forza di attrito
                                    statico bilancia la componente parallela. Calcola il{" "}
                                    <strong>coefficiente di attrito statico</strong>.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Utilizza il teorema di Pitagora per trovare la base{" "}
                                    <L s="$b$" /> del piano. Ricava poi <L s="$\sin\theta$" /> e{" "}
                                    <L s="$\cos\theta$" /> senza usare gli angoli.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Calcola la componente del peso <em>perpendicolare</em> al piano
                                    e la forza vincolare <L s="$F_v$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
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
                                    <span style={S.solLabel}>a) Legge di Hooke e limite elastico</span>
                                    <p style={S.solText}>
                                        La <strong>legge di Hooke</strong> afferma che la forza elastica è
                                        direttamente proporzionale alla deformazione: <L s="$F = k \cdot x$" />,
                                        dove <L s="$k$" /> è la costante elastica (in N/m) e <L s="$x$" /> è
                                        l'allungamento o la compressione (in m).
                                    </p>
                                    <p style={S.solText}>
                                        Il <strong>limite elastico</strong> è la massima deformazione oltre la quale
                                        la molla non torna alla lunghezza naturale: la deformazione diventa
                                        permanente e la legge di Hooke cessa di valere.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Momento torcente e condizioni di equilibrio del corpo rigido</span>
                                    <p style={S.solText}>
                                        Il <strong>momento torcente</strong> rispetto a un punto O è il prodotto
                                        della forza per il braccio: <L s="$M = F \cdot d$" /> (in{" "}
                                        <L s="$\text{N}{\cdot}\text{m}$" />). Se la forza è perpendicolare al braccio,
                                        il braccio coincide con la distanza geometrica dal punto O.
                                    </p>
                                    <p style={S.solText}>
                                        Le <strong>due condizioni di equilibrio</strong> di un corpo rigido sono:
                                        (1) la risultante di tutte le forze è nulla (<L s="$\sum \vec{F} = \vec{0}$" />);
                                        (2) la somma algebrica di tutti i momenti rispetto a qualsiasi punto è nulla
                                        (<L s="$\sum M = 0$" />).
                                    </p>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposta multipla</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Forza di attrito statico</span>
                                    <span style={S.solRisposta}>Risposta: C</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La forza di attrito statico varia da 0 a un massimo di{" "}
                                            <L s="$\mu_s F_{\perp}$" />, ma non è sempre uguale a quel massimo (A
                                            è falsa). Non agisce nella direzione del moto (B è falsa). Non dipende
                                            dalla velocità (D è falsa, riguarda l'attrito dinamico).
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) k = 490 N/m, x = 4,00 cm</span>
                                    <span style={S.solRisposta}>Risposta: B — 19,6 N</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F = k \\cdot x = 490 \\times 0{,}0400 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) m = 10 kg, μs = 0,30</span>
                                    <span style={S.solRisposta}>Risposta: C — 29,4 N</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F_{\\perp} = mg = 10 \\times 9{,}8 = 98\\,\\text{N} \\qquad f_{s,\\text{max}} = 0{,}30 \\times 98 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d) F = 60 N, braccio d = 0,40 m</span>
                                    <span style={S.solRisposta}>Risposta: A — 24 N·m</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"M = F \\cdot d = 60 \\times 0{,}40 = 24\\,\\text{N}{\\cdot}\\text{m}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Esercizi svolti</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1) Molla con blocco appeso — k = 490 N/m, x = 4,00 cm</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"x = 4{,}00\\,\\text{cm} = 0{,}0400\\,\\text{m}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza elastica</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F_{el} = k \\cdot x = 490 \\times 0{,}0400 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Massa del blocco (F_el = mg)</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"m = \\frac{F_{el}}{g} = \\frac{19{,}6}{9{,}8} = 2{,}00\\,\\text{kg}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>⟹ <strong>m = 2,00 kg</strong></p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) k′ = 245 N/m (la metà)</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La forza necessaria è invariata (19,6 N). Poiché <L s="$x = F/k$" />,
                                            dimezzando <L s="$k$" /> l'allungamento raddoppia:
                                        </p>
                                        <DisplayMath>{"x' = \\frac{19{,}6}{245} = 0{,}0800\\,\\text{m} = 8{,}00\\,\\text{cm}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2) Piano inclinato — m = 5,0 kg, L = 2,50 m, h = 1,50 m</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Componente del peso parallela al piano</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Usando <L s="$\sin\theta = h/L = 1{,}50/2{,}50 = 0{,}60$" />:
                                        </p>
                                        <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Coefficiente di attrito statico</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio lungo il piano: <L s="$f_s = F_\parallel = 29{,}4\,\text{N}$" />.
                                            Usando <L s="$F_v = mg\cos\theta = 5{,}0 \times 9{,}8 \times 0{,}80 = 39{,}2\,\text{N}$" />:
                                        </p>
                                        <DisplayMath>{"\\mu_s = \\frac{f_s}{F_v} = \\frac{29{,}4}{39{,}2} = 0{,}75"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>⟹ <strong>μs = 0,75</strong></p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Base del piano e sin θ, cos θ</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"b = \\sqrt{L^2 - h^2} = \\sqrt{2{,}50^2 - 1{,}50^2} = \\sqrt{4{,}00} = 2{,}00\\,\\text{m}"}</DisplayMath>
                                        <DisplayMath>{"\\sin\\theta = \\frac{h}{L} = \\frac{1{,}50}{2{,}50} = 0{,}60 \\qquad \\cos\\theta = \\frac{b}{L} = \\frac{2{,}00}{2{,}50} = 0{,}80"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Componente perpendicolare e forza vincolare F_v</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F_{\\perp} = mg\\cos\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Equilibrio perpendicolare al piano:{" "}
                                            <L s="$F_v = F_\perp = 39{,}2\,\text{N}$" />
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

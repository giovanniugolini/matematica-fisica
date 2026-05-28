/**
 * VerificaFisicaForze3E_FilaAB – Verifica: Forze, Molla, Piano Inclinato, Momento
 * Liceo Linguistico 3E – Fisica – Maggio 2026 – FILA A / FILA B
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

type Fila = "A" | "B" | "C";

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
            ? `2px solid ${fila === "A" ? "#1e40af" : fila === "B" ? "#d97706" : "#16a34a"}`
            : "2px solid #e2e8f0",
        borderRadius: 6,
        background: active
            ? fila === "A" ? "#dbeafe" : fila === "B" ? "#fef3c7" : "#dcfce7"
            : "#f8fafc",
        color: active
            ? fila === "A" ? "#1e40af" : fila === "B" ? "#92400e" : "#15803d"
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
        : fila === "B"
        ? { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" }
        : { bg: "#dcfce7", color: "#15803d", border: "#86efac" };

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
                            <button
                                style={S.btnFila(fila === "C", "C")}
                                onClick={() => { setFila("C"); setShowSoluzioni(false); }}
                            >FILA C</button>
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
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Definisci la <strong>forza di attrito statico</strong>. Scrivi la relazione tra
                                    la forza di attrito statico massima <L s="$f_{s,\max}$" />, il coefficiente di
                                    attrito statico <L s="$\mu_s$" /> e la forza vincolare <L s="$F_v$" />,
                                    specificando il significato fisico di ciascuna grandezza e la loro unità di
                                    misura nel SI. Spiega cosa accade quando la forza applicata supera{" "}
                                    <L s="$f_{s,\max}$" />.
                                </p>
                            ) : fila === "B" ? (
                                <p style={S.domandaText}>
                                    Definisci il concetto di <strong>punto materiale</strong>. Enuncia la{" "}
                                    <strong>condizione di equilibrio</strong> di un punto materiale, scrivendo la
                                    relazione vettoriale che deve essere soddisfatta e spiegandone il significato fisico.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Enuncia la <strong>legge di Hooke</strong>. Scrivi la relazione tra forza
                                    elastica <L s="$F_{el}$" />, costante elastica <L s="$k$" /> e allungamento{" "}
                                    <L s="$x$" />, specificando il significato fisico di ciascuna grandezza e la
                                    loro unità di misura nel SI. Spiega cosa si intende per{" "}
                                    <strong>limite elastico</strong>.
                                </p>
                            )}
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Definisci il <strong>momento torcente</strong> (o momento di una forza) rispetto a un
                                punto, specificando come si calcola nel caso in cui la forza sia perpendicolare al raggio. Enuncia poi le{" "}
                                <strong>due condizioni di equilibrio</strong> di un corpo rigido.
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
                            ) : fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>Quale affermazione sulla <strong>legge di Hooke</strong> è corretta?</p>
                                    <span style={S.mcOption}><strong>A.</strong> La forza elastica è proporzionale alla velocità di deformazione</span>
                                    <span style={S.mcOption}><strong>B.</strong> La costante elastica <L s="$k$" /> si misura in <L s="$\text{N}{\cdot}\text{m}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> La forza elastica è proporzionale all'allungamento: <L s="$F = k \cdot x$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> La legge di Hooke vale per qualsiasi deformazione, anche oltre il limite elastico</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>Quale condizione deve essere soddisfatta affinché un <strong>corpo rigido</strong> sia in <strong>equilibrio rotazionale</strong>?</p>
                                    <span style={S.mcOption}><strong>A.</strong> La velocità di rotazione del corpo è nulla</span>
                                    <span style={S.mcOption}><strong>B.</strong> La risultante di tutte le forze applicate è nulla</span>
                                    <span style={S.mcOption}><strong>C.</strong> La somma algebrica dei momenti delle forze rispetto all'asse è nulla</span>
                                    <span style={S.mcOption}><strong>D.</strong> Il corpo è geometricamente simmetrico rispetto all'asse di rotazione</span>
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
                            ) : fila === "B" ? (
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
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un dinamometro con costante elastica <L s="$k = 245\,\text{N/m}$" /> si allunga
                                        di <L s="$4{,}00\,\text{cm}$" />. Quale forza lo sta allungando?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$9{,}80\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$61{,}3\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$245\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$0{,}98\,\text{N}$" /></span>
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
                            ) : fila === "B" ? (
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
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di <L s="$m = 6{,}0\,\text{kg}$" /> è appoggiato su un piano orizzontale.
                                        Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}30$" />.
                                        Qual è la forza orizzontale minima per mettere in moto il blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$58{,}8\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$17{,}6\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$0{,}30\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$196\,\text{N}$" /></span>
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
                                        Un blocco di massa <L s="$m = 3{,}0\,\text{kg}$" /> è appoggiato su un piano
                                        orizzontale. Dall'alto viene esercitata una <strong>forza premente</strong>{" "}
                                        <L s="$F_p = 10{,}0\,\text{N}$" />. Qual è la forza vincolare <L s="$F_v$" />{" "}
                                        esercitata dal piano sul blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$10{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$29{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$39{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$19{,}4\,\text{N}$" /></span>
                                </>
                            ) : fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 4{,}0\,\text{kg}$" /> è appoggiato su un piano
                                        orizzontale. Dall'alto viene esercitata una <strong>forza premente</strong>{" "}
                                        <L s="$F_p = 12{,}0\,\text{N}$" />. Qual è la forza vincolare <L s="$F_v$" />{" "}
                                        esercitata dal piano sul blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$12{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$39{,}2\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$27{,}2\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$51{,}2\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è appoggiato su un piano
                                        orizzontale. Dall'alto viene esercitata una <strong>forza della mano</strong>{" "}
                                        <L s="$F = 15{,}0\,\text{N}$" />. Qual è la forza vincolare <L s="$F_v$" />{" "}
                                        esercitata dal piano sul blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$15{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$49{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$64{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$34{,}0\,\text{N}$" /></span>
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
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                {fila === "C" ? "Piano inclinato con attrito" : "Molla con blocco appeso"}
                            </span>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa incognita viene agganciato a un dinamometro verticale con
                                    costante elastica <L s="$k = 245\,\text{N/m}$" />. Il dinamometro si allunga
                                    di <L s="$8{,}00\,\text{cm}$" />. Determina la massa del blocco.
                                </p>
                            ) : fila === "B" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa incognita viene agganciato a un dinamometro verticale con
                                    costante elastica <L s="$k = 490\,\text{N/m}$" />. Il dinamometro si allunga
                                    di <L s="$6{,}00\,\text{cm}$" />. Determina la massa del blocco.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è su un piano inclinato
                                    scabro di angolo <L s="$\theta = 37°$" />.
                                    Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}60$" />.
                                    Verifica se il blocco è in equilibrio.
                                </p>
                            )}
                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                {fila === "C" ? (
                                    <>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                            <strong>i.)</strong> Calcola la componente del peso <em>parallela</em> al piano <L s="$F_\parallel$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>ii.)</strong> Calcola la forza vincolare <L s="$F_v$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>iii.)</strong> Calcola la forza di attrito statico massima <L s="$f_{s,\max}$" />.
                                            Il blocco è in equilibrio? Motiva confrontando <L s="$f_{s,\max}$" /> con <L s="$F_\parallel$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.2 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                {fila === "C" ? "Molla con blocco appeso" : "Piano inclinato con attrito"}
                            </span>
                            {fila === "A" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è su un piano inclinato
                                    scabro di angolo <L s="$\theta = 37°$" />.
                                    Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}50$" />.
                                    Verifica se il blocco è in equilibrio.
                                </p>
                            ) : fila === "B" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è su un piano inclinato
                                    scabro di angolo <L s="$\theta = 37°$" />.
                                    Il coefficiente di attrito statico è <L s="$\mu_s = 0{,}80$" />.
                                    Verifica se il blocco è in equilibrio.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Un blocco di massa incognita viene agganciato a un dinamometro verticale con
                                    costante elastica <L s="$k = 196\,\text{N/m}$" />. Il dinamometro si allunga
                                    di <L s="$5{,}00\,\text{cm}$" />. Determina la massa del blocco.
                                </p>
                            )}

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                {fila === "C" ? (
                                    <>
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
                                    </>
                                ) : (
                                    <>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                            <strong>i.)</strong> Calcola la componente del peso <em>parallela</em> al piano <L s="$F_\parallel$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>ii.)</strong> Calcola la forza vincolare <L s="$F_v$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>iii.)</strong> Calcola la forza di attrito statico massima <L s="$f_{s,\max}$" />.
                                            Il blocco è in equilibrio? Motiva confrontando <L s="$f_{s,\max}$" /> con <L s="$F_\parallel$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />
                                    </>
                                )}
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
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>a) Forza di attrito statico</span>
                                            <p style={S.solText}>
                                                La <strong>forza di attrito statico</strong> è la forza che si oppone al
                                                moto relativo tra due superfici a contatto quando il corpo è fermo.
                                                La sua relazione con la forza vincolare è:{" "}
                                                <L s="$f_{s,\max} = \mu_s \cdot F_v$" />, dove <L s="$\mu_s$" /> (adimensionale)
                                                è il coefficiente di attrito statico e <L s="$F_v$" /> (N) è la forza
                                                vincolare (reazione normale del piano).
                                            </p>
                                            <p style={S.solText}>
                                                Quando la forza applicata supera <L s="$f_{s,\max}$" />, il corpo si
                                                mette in moto e subentra l'attrito dinamico.
                                            </p>
                                        </>
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solLabel}>a) Punto materiale e condizione di equilibrio</span>
                                            <p style={S.solText}>
                                                Un <strong>punto materiale</strong> è un corpo le cui dimensioni sono
                                                trascurabili rispetto alle distanze in gioco, così che può essere
                                                rappresentato da un singolo punto con tutta la sua massa concentrata.
                                            </p>
                                            <p style={S.solText}>
                                                <strong>Condizione di equilibrio</strong>: la risultante di tutte le forze
                                                applicate è nulla:{" "}
                                                <L s="$\sum \vec{F} = \vec{0}$" />. Ciò significa che le forze si
                                                bilanciano e il punto materiale resta in quiete (o in moto rettilineo
                                                uniforme).
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>a) Legge di Hooke e limite elastico</span>
                                            <p style={S.solText}>
                                                La <strong>legge di Hooke</strong>:{" "}
                                                <L s="$F_{el} = k \cdot x$" />, dove <L s="$F_{el}$" /> (N) è la forza
                                                elastica, <L s="$k$" /> (N/m) è la costante elastica della molla e{" "}
                                                <L s="$x$" /> (m) è l'allungamento rispetto alla posizione di riposo.
                                            </p>
                                            <p style={S.solText}>
                                                Il <strong>limite elastico</strong> è il valore massimo di deformazione
                                                entro cui la legge di Hooke è valida: oltre tale limite la molla non
                                                torna alla forma originale.
                                            </p>
                                        </>
                                    )}
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
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <p style={S.solText}>
                                                La legge di Hooke è <L s="$F = k \cdot x$" />: la forza è proporzionale
                                                all'allungamento. <L s="$k$" /> si misura in N/m (non N·m, B falsa).
                                                Vale solo entro il limite elastico (D falsa).
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <p style={S.solText}>
                                                L'equilibrio rotazionale richiede che la somma algebrica dei momenti
                                                sia nulla: <L s="$\sum M = 0$" />. La quiete (A) non implica
                                                necessariamente equilibrio rotazionale. La forza risultante nulla (B) è
                                                la condizione traslazionale, non rotazionale. La simmetria (D) non è
                                                una condizione fisica necessaria.
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
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F = k \\cdot x = 500 \\times 0{,}0600 = 30{,}0\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>A</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F = k \\cdot x = 245 \\times 0{,}0400 = 9{,}80\\,\\text{N}"}</DisplayMath>
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
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\perp} = mg = 5{,}0 \\times 9{,}8 = 49{,}0\\,\\text{N} \\qquad f_{s,\\max} = 0{,}40 \\times 49{,}0 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\perp} = mg = 6{,}0 \\times 9{,}8 = 58{,}8\\,\\text{N} \\qquad f_{s,\\max} = 0{,}30 \\times 58{,}8 = 17{,}6\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d)</span>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = mg = 3{,}0 \\times 9{,}8 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_v = P + F_p = 29{,}4 + 10{,}0 = 39{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>D</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = mg = 4{,}0 \\times 9{,}8 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_v = P + F_p = 39{,}2 + 12{,}0 = 51{,}2\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"P = mg = 5{,}0 \\times 9{,}8 = 49{,}0\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_v = P + F = 49{,}0 + 15{,}0 = 64{,}0\\,\\text{N}"}</DisplayMath>
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
                                        <>
                                            <span style={S.solLabel}>1) k = 245 N/m, x = 8,00 cm</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x = 8{,}00\\,\\text{cm} = 0{,}0800\\,\\text{m}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza elastica</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{el} = 245 \\times 0{,}0800 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Massa</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"m = \\frac{F_{el}}{g} = \\frac{19{,}6}{9{,}8} = 2{,}00\\,\\text{kg}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solLabel}>1) k = 490 N/m, x = 6,00 cm</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x = 6{,}00\\,\\text{cm} = 0{,}0600\\,\\text{m}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza elastica</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{el} = 490 \\times 0{,}0600 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Massa</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"m = \\frac{F_{el}}{g} = \\frac{29{,}4}{9{,}8} = 3{,}00\\,\\text{kg}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>1) Piano inclinato + attrito — m = 5,0 kg, θ = 37°, μs = 0,60</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Componente parallela</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\parallel} = mg\\sin 37° = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza vincolare</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_v = mg\\cos 37° = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Attrito massimo e verifica</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"f_{s,\\max} = \\mu_s \\cdot F_v = 0{,}60 \\times 39{,}2 = 23{,}5\\,\\text{N}"}</DisplayMath>
                                                <p style={{ fontSize: 13 }}>
                                                    <L s="$F_\parallel = 29{,}4\,\text{N} > f_{s,\max} = 23{,}5\,\text{N}$" /> → il blocco <strong>non è in equilibrio</strong>: scivola lungo il piano.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    {fila === "A" ? (
                                        <>
                                            <span style={S.solLabel}>2) Piano inclinato + attrito — m = 5,0 kg, θ = 37°, μs = 0,50</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Componente parallela</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\parallel} = mg\\sin 37° = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza vincolare</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_v = mg\\cos 37° = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Attrito massimo e verifica</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"f_{s,\\max} = \\mu_s \\cdot F_v = 0{,}50 \\times 39{,}2 = 19{,}6\\,\\text{N}"}</DisplayMath>
                                                <p style={{ fontSize: 13 }}>
                                                    <L s="$F_\parallel = 29{,}4\,\text{N} > f_{s,\max} = 19{,}6\,\text{N}$" /> → il blocco <strong>non è in equilibrio</strong>: scivola lungo il piano.
                                                </p>
                                            </div>
                                        </>
                                    ) : fila === "B" ? (
                                        <>
                                            <span style={S.solLabel}>2) Piano inclinato + attrito — m = 5,0 kg, θ = 37°, μs = 0,80</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Componente parallela</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\parallel} = mg\\sin 37° = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza vincolare</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_v = mg\\cos 37° = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Attrito massimo e verifica</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"f_{s,\\max} = \\mu_s \\cdot F_v = 0{,}80 \\times 39{,}2 = 31{,}4\\,\\text{N}"}</DisplayMath>
                                                <p style={{ fontSize: 13 }}>
                                                    <L s="$F_\parallel = 29{,}4\,\text{N} < f_{s,\max} = 31{,}4\,\text{N}$" /> → il blocco è in <strong>equilibrio</strong>.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solLabel}>2) k = 196 N/m, x = 5,00 cm</span>
                                            <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Conversione</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"x = 5{,}00\\,\\text{cm} = 0{,}0500\\,\\text{m}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Forza elastica</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{el} = 196 \\times 0{,}0500 = 9{,}80\\,\\text{N}"}</DisplayMath>
                                            </div>
                                            <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Massa</p>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"m = \\frac{F_{el}}{g} = \\frac{9{,}80}{9{,}8} = 1{,}00\\,\\text{kg}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
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

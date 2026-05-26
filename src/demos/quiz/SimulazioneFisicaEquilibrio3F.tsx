/**
 * SimulazioneFisicaEquilibrio3F – Simulazione: Equilibrio del punto materiale
 * Liceo Linguistico 3F – Fisica – Maggio 2026
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

export default function SimulazioneFisicaEquilibrio3F(): React.ReactElement {
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
                        <div style={S.istituto}>Liceo Linguistico — San Giovanni Valdarno — Classe 3ª F</div>
                        <div style={S.title}>Simulazione di Fisica</div>
                        <div style={S.disciplina}>
                            Equilibrio del punto materiale · Forze · Forza elastica · Attrito · Piano inclinato
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

                        {/* A.a — Equilibrio del punto materiale */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Enuncia la <strong>condizione di equilibrio di un punto materiale</strong>: scrivi la
                                relazione vettoriale che deve essere soddisfatta e spiegane il significato fisico.
                                Spiega inoltre la differenza tra <strong>equilibrio statico</strong> ed{" "}
                                <strong>equilibrio dinamico</strong>, portando un esempio concreto per ciascuno.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        {/* A.b — Forza di attrito statico */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Definisci la <strong>forza di attrito statico</strong>: scrivi la disuguaglianza che la
                                esprime, specifica il significato fisico di <L s="$\mu_s$" /> e di{" "}
                                <L s="$F_v$" /> (forza vincolare). Spiega in quali casi l'uguaglianza vale e cosa
                                succede quando la forza applicata supera il valore massimo di attrito statico.
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

                        {/* B.a — Equilibrio: condizione */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>
                                Quale affermazione esprime correttamente la <strong>condizione di equilibrio</strong>{" "}
                                di un punto materiale?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> Il corpo deve essere necessariamente fermo</span>
                            <span style={S.mcOption}><strong>B.</strong> La risultante di tutte le forze applicate è zero</span>
                            <span style={S.mcOption}><strong>C.</strong> Tutte le forze applicate devono essere uguali in modulo</span>
                            <span style={S.mcOption}><strong>D.</strong> Il corpo deve essere a contatto con una superficie</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b — Forza vincolare: piano orizzontale con forza aggiuntiva */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è appoggiato su un piano
                                orizzontale. Oltre alla forza peso, una corda tira il blocco verticalmente verso
                                il basso con una forza <L s="$F = 15{,}0\,\text{N}$" />. Qual è la forza vincolare
                                esercitata dal piano sul blocco?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$49{,}0\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$15{,}0\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$34{,}0\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$64{,}0\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c — Equilibrio del corpo rigido: condizioni */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>
                                Un <strong>corpo rigido</strong> (corpo esteso) è in equilibrio quando:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> La risultante delle forze è zero</span>
                            <span style={S.mcOption}><strong>B.</strong> La somma dei momenti delle forze rispetto a un punto è zero</span>
                            <span style={S.mcOption}><strong>C.</strong> La risultante delle forze è zero <em>e</em> la somma dei momenti rispetto a qualsiasi punto è zero</span>
                            <span style={S.mcOption}><strong>D.</strong> Tutte le forze applicate hanno lo stesso punto di applicazione</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d — Piano inclinato: componente parallela (*facoltativo) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            <p style={S.domandaText}>
                                Un blocco di massa <L s="$m = 6{,}0\,\text{kg}$" /> è su un piano inclinato di{" "}
                                <L s="$\theta = 30°$" />. Qual è la componente della forza peso{" "}
                                <em>parallela</em> al piano?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$29{,}4\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$50{,}9\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$58{,}8\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$14{,}7\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Esercizi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte C – Esercizi</div>

                        {/* C.1 — Equilibrio su piano orizzontale poi inclinato */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                1) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                Equilibrio su piano orizzontale e piano inclinato
                            </span>

                            <p style={S.domandaText}>
                                Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è appoggiato su una superficie.
                                Oltre alla forza peso, una forza verticale <L s="$F = 5{,}0\,\text{N}$" /> agisce
                                sul blocco spingendolo verso il basso.
                            </p>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Il piano è <strong>orizzontale</strong>. Disegna le forze
                                    sul blocco (forza peso, forza aggiuntiva, forza vincolare). Scrivi la condizione
                                    di equilibrio verticale e calcola la forza vincolare <L s="$F_v$" />.
                                </p>
                                <div style={{ height: 80, border: "1px dashed #cbd5e1", borderRadius: 4, marginBottom: 8 }} />
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Il piano si <strong>inclina di</strong>{" "}
                                    <L s="$\theta = 12°$" />. Sia la forza peso che la forza <L s="$F$" /> restano
                                    verticali. Calcola la forza risultante verticale verso il basso{" "}
                                    <L s="$F_{\text{tot}}$" /> e le sue componenti parallela e perpendicolare al piano.
                                </p>
                                <div style={{ height: 72, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Usando la condizione di equilibrio perpendicolare al piano,
                                    calcola la forza vincolare <L s="$F_v$" />. Confronta con il valore trovato al
                                    punto i): come cambia passando dal piano orizzontale a quello inclinato?
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Per mantenere il blocco in equilibrio <em>lungo</em> il piano
                                    inclinato, qual è la forza di attrito necessaria? Calcola il coefficiente di
                                    attrito statico minimo <L s="$\mu_s$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
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
                                inclinato. Il piano ha lunghezza <L s="$L = 5{,}0\,\text{m}$" /> e altezza{" "}
                                <L s="$h = 3{,}0\,\text{m}$" />. L'angolo di inclinazione non è noto esplicitamente.
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
                                    <strong>i.)</strong> Usa il teorema di Pitagora per trovare la base <L s="$b$" /> del
                                    piano. Ricava poi <L s="$\sin\theta$" /> e <L s="$\cos\theta$" /> come rapporti tra
                                    i lati del triangolo.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Calcola la componente del peso <em>parallela</em> al piano{" "}
                                    <L s="$F_\parallel$" /> e la forza vincolare <L s="$F_v$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Il blocco è in equilibrio lungo il piano: la forza di attrito
                                    statico bilancia <L s="$F_\parallel$" />. Calcola la forza di attrito e il{" "}
                                    <strong>coefficiente di attrito statico</strong> <L s="$\mu_s$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>*iv.)</strong> Supponi ora che il piano abbia la stessa lunghezza{" "}
                                    <L s="$L = 5{,}0\,\text{m}$" /> ma altezza <L s="$h' = 4{,}0\,\text{m}$" />.
                                    Con il <L s="$\mu_s$" /> trovato al punto iii.), il blocco rimane in equilibrio?
                                    Giustifica con un calcolo.
                                </p>
                                <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
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
                                    <span style={S.solLabel}>a) Condizione di equilibrio del punto materiale</span>
                                    <p style={S.solText}>
                                        Un punto materiale è in <strong>equilibrio</strong> quando la risultante
                                        vettoriale di tutte le forze applicate è uguale a zero:{" "}
                                        <L s="$\vec{F}_{\text{ris}} = \vec{0}$" />. Questo equivale a dire che
                                        le componenti della risultante lungo ogni asse sono nulle.
                                    </p>
                                    <p style={S.solText}>
                                        L'<strong>equilibrio statico</strong> si ha quando il corpo è fermo
                                        (<em>es.</em> un libro sul tavolo: la forza peso è bilanciata dalla forza
                                        normale). L'<strong>equilibrio dinamico</strong> si ha quando il corpo si muove
                                        di moto rettilineo uniforme (<em>es.</em> un'auto che avanza a velocità costante
                                        su strada piana: forza motrice = attrito).
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Forza di attrito statico</span>
                                    <p style={S.solText}>
                                        La forza di attrito statico soddisfa la disuguaglianza{" "}
                                        <L s="$F_{\text{att}} \leq \mu_s \cdot F_v$" />, dove{" "}
                                        <L s="$\mu_s$" /> è il coefficiente di attrito statico (adimensionale, dipende
                                        dai materiali a contatto) e <L s="$F_v$" /> è la forza vincolare (reazione
                                        perpendicolare alla superficie di appoggio).
                                    </p>
                                    <p style={S.solText}>
                                        L'uguaglianza vale solo quando l'attrito raggiunge il valore massimo, cioè
                                        quando il corpo è sul punto di scivolare. Se la forza applicata supera{" "}
                                        <L s="$\mu_s \cdot F_v$" />, il corpo inizia a muoversi e subentra
                                        l'attrito dinamico (in genere minore dell'attrito statico massimo).
                                    </p>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposte multiple</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a)</span>
                                    <span style={S.solRisposta}>B</span>
                                    <p style={S.solText}>
                                        La condizione di equilibrio richiede che la risultante sia zero, non che il
                                        corpo sia fermo. Un corpo può essere in equilibrio anche in moto rettilineo
                                        uniforme (prima legge di Newton).
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b)</span>
                                    <span style={S.solRisposta}>D</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Piano orizzontale: la forza vincolare equilibra il peso <em>e</em> la
                                            forza aggiuntiva verso il basso.
                                        </p>
                                        <DisplayMath>{"F_v = mg + F = 5{,}0 \\times 9{,}8 + 15{,}0 = 49{,}0 + 15{,}0 = 64{,}0\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c)</span>
                                    <span style={S.solRisposta}>C</span>
                                    <p style={S.solText}>
                                        Per un <strong>corpo rigido</strong> servono <em>due</em> condizioni
                                        di equilibrio simultanee: equilibrio traslazionale (
                                        <L s="$\vec{F}_{\text{ris}} = \vec{0}$" />) e equilibrio rotazionale (
                                        <L s="$\sum M = 0$" /> rispetto a qualsiasi punto). A sola è
                                        insufficiente (il corpo potrebbe ruotare), B sola è insufficiente
                                        (il centro di massa potrebbe accelerare). Per un punto materiale basta
                                        la condizione A, perché non ha estensione e non può ruotare.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d)</span>
                                    <span style={S.solRisposta}>A</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 6{,}0 \\times 9{,}8 \\times \\sin 30° = 6{,}0 \\times 9{,}8 \\times 0{,}50 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Soluzioni degli esercizi</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1) Equilibrio piano orizzontale / inclinato — m = 5,0 kg, F = 5,0 N</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Piano orizzontale</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Condizione di equilibrio verticale:{" "}
                                            <L s="$F_v - P - F = 0 \;\Rightarrow\; F_v = P + F$" />
                                        </p>
                                        <DisplayMath>{"F_v = mg + F = 5{,}0 \\times 9{,}8 + 5{,}0 = 49{,}0 + 5{,}0 = 54{,}0\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Piano inclinato (θ = 12°): componenti di F_tot</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La forza risultante verticale verso il basso è{" "}
                                            <L s="$F_{\text{tot}} = mg + F = 54{,}0\,\text{N}$" />.
                                            Con <L s="$\sin 12° \approx 0{,}208$" /> e{" "}
                                            <L s="$\cos 12° \approx 0{,}978$" />:
                                        </p>
                                        <DisplayMath>{"F_{\\parallel} = F_{\\text{tot}}\\sin 12° = 54{,}0 \\times 0{,}208 \\approx 11{,}2\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_{\\perp} = F_{\\text{tot}}\\cos 12° = 54{,}0 \\times 0{,}978 \\approx 52{,}8\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza vincolare sul piano inclinato</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio perpendicolare al piano:{" "}
                                            <L s="$F_v = F_\perp \approx 52{,}8\,\text{N}$" />.
                                            La forza vincolare è quasi uguale a quella sul piano orizzontale (54,0 N)
                                            perché l'angolo è piccolo e il piano regge quasi tutta la componente
                                            perpendicolare del peso totale.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Attrito necessario e μ_s minimo</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio lungo il piano: <L s="$F_{\text{att}} = F_\parallel \approx 11{,}2\,\text{N}$" />
                                        </p>
                                        <DisplayMath>{"\\mu_s = \\frac{F_{\\text{att}}}{F_v} = \\frac{11{,}2}{52{,}8} \\approx 0{,}21 = \\tan 12°"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Notare che <L s="$\mu_s = \tan\theta$" /> indipendentemente dalla forza
                                            aggiuntiva <L s="$F$" />: la forza verticale extra aumenta sia l'attrito
                                            necessario che la forza vincolare nella stessa proporzione.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2) Piano inclinato — m = 5,0 kg, L = 5,0 m, h = 3,0 m</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Pitagora e angoli</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"b = \\sqrt{L^2 - h^2} = \\sqrt{5{,}0^2 - 3{,}0^2} = \\sqrt{16} = 4{,}0\\,\\text{m}"}</DisplayMath>
                                        <DisplayMath>{"\\sin\\theta = \\frac{h}{L} = \\frac{3{,}0}{5{,}0} = 0{,}60 \\qquad \\cos\\theta = \\frac{b}{L} = \\frac{4{,}0}{5{,}0} = 0{,}80"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Componenti del peso e forza vincolare</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_v = mg\\cos\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza di attrito e coefficiente μ_s</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio lungo il piano: <L s="$F_{\text{att}} = F_\parallel = 29{,}4\,\text{N}$" />
                                        </p>
                                        <DisplayMath>{"\\mu_s = \\frac{F_{\\text{att}}}{F_v} = \\frac{29{,}4}{39{,}2} = 0{,}75"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Nuovo piano più ripido (h' = 4,0 m)</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Con <L s="$h' = 4{,}0\,\text{m}$" /> e <L s="$L = 5{,}0\,\text{m}$" />:
                                        </p>
                                        <DisplayMath>{"\\sin\\theta' = \\frac{4{,}0}{5{,}0} = 0{,}80 \\qquad \\cos\\theta' = \\frac{3{,}0}{5{,}0} = 0{,}60"}</DisplayMath>
                                        <DisplayMath>{"F'_{\\parallel} = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F'_v = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_{\\text{att,max}} = \\mu_s \\cdot F'_v = 0{,}75 \\times 29{,}4 = 22{,}1\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            Poiché <L s="$F'_\parallel = 39{,}2\,\text{N} > F_{\text{att,max}} = 22{,}1\,\text{N}$" />,
                                            l'attrito non è sufficiente a mantenere l'equilibrio: <strong>il blocco scivola</strong>.
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

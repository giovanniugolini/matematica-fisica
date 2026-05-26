/**
 * VerificaFisicaEquilibrio3F_FilaB – Verifica: Equilibrio del punto materiale
 * Liceo Linguistico 3F – Fisica – Maggio 2026 – FILA B
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
        background: "#fef3c7",
        color: "#92400e",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "1px",
        fontFamily: "system-ui, sans-serif",
        border: "1.5px solid #fcd34d",
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

export default function VerificaFisicaEquilibrio3F_FilaB(): React.ReactElement {
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
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>
                            Equilibrio del punto materiale · Forze · Attrito · Piano inclinato
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <span style={S.filaBadge}>FILA B</span>
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

                        {/* A.b — Corpo esteso, rigido e punto materiale */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            <p style={S.domandaText}>
                                Definisci i concetti di <strong>punto materiale</strong>, <strong>corpo esteso</strong>{" "}
                                e <strong>corpo rigido</strong>. Spiega le principali differenze tra questi modelli
                                fisici e indica in quale caso è necessario imporre <em>due</em> condizioni di
                                equilibrio invece di una sola, motivando la risposta.
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

                        {/* B.a — Equilibrio dinamico */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>
                                Quale delle seguenti situazioni descrive correttamente un corpo in{" "}
                                <strong>equilibrio dinamico</strong>?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> Un libro immobile su un tavolo</span>
                            <span style={S.mcOption}><strong>B.</strong> Un'auto che frena fino a fermarsi</span>
                            <span style={S.mcOption}><strong>C.</strong> Un pattinatore che scivola su ghiaccio a velocità costante in linea retta</span>
                            <span style={S.mcOption}><strong>D.</strong> Una palla che viene lanciata verso l'alto</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b — Forza vincolare: piano orizzontale con forza verso il basso */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Un blocco di massa <L s="$m = 4{,}0\,\text{kg}$" /> è appoggiato su un piano
                                orizzontale. Oltre alla forza peso, una forza verticale{" "}
                                <L s="$F = 20{,}0\,\text{N}$" /> spinge il blocco verso il basso. Qual è la
                                forza vincolare esercitata dal piano sul blocco?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$39{,}2\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$20{,}0\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$19{,}2\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$59{,}2\,\text{N}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c — Condizione di equilibrio del punto materiale vs corpo rigido */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>
                                Per un <strong>punto materiale</strong> (non per un corpo rigido), la condizione{" "}
                                <em>necessaria e sufficiente</em> per l'equilibrio è:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> La risultante delle forze è zero <em>e</em> la somma dei momenti è zero</span>
                            <span style={S.mcOption}><strong>B.</strong> Solo che la somma dei momenti delle forze sia zero</span>
                            <span style={S.mcOption}><strong>C.</strong> Solo che la risultante di tutte le forze sia zero</span>
                            <span style={S.mcOption}><strong>D.</strong> Il corpo deve essere necessariamente in quiete assoluta</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d — Piano inclinato: componente perpendicolare (*facoltativo) */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            <p style={S.domandaText}>
                                Un blocco di massa <L s="$m = 8{,}0\,\text{kg}$" /> è su un piano inclinato di{" "}
                                <L s="$\theta = 30°$" />. Qual è la componente della forza peso{" "}
                                <em>perpendicolare</em> al piano (uguale alla forza vincolare in assenza di attrito)?
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$39{,}2\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$67{,}9\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$78{,}4\,\text{N}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$49{,}0\,\text{N}$" /></span>
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
                                Un blocco di massa <L s="$m = 6{,}0\,\text{kg}$" /> è appoggiato su una superficie.
                                Oltre alla forza peso, una forza verticale <L s="$F = 4{,}0\,\text{N}$" /> agisce
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
                                    <L s="$\theta = 20°$" />. Sia la forza peso che la forza <L s="$F$" /> restano
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
                                Un blocco di massa <L s="$m = 6{,}0\,\text{kg}$" /> è in equilibrio su un piano
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
                            <div style={S.soluzioniTitle}>✅ Soluzioni – Fila B</div>

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
                                        (<em>es.</em> un libro sul tavolo). L'<strong>equilibrio dinamico</strong>{" "}
                                        si ha quando il corpo si muove di moto rettilineo uniforme (<em>es.</em>{" "}
                                        un pattinatore su ghiaccio a velocità costante).
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Punto materiale, corpo esteso e corpo rigido</span>
                                    <p style={S.solText}>
                                        Il <strong>punto materiale</strong> è un modello ideale in cui tutta la massa
                                        è concentrata in un punto privo di dimensioni: non ha estensione e non può
                                        ruotare. Il <strong>corpo esteso</strong> è un oggetto reale con dimensioni
                                        finite. Il <strong>corpo rigido</strong> è un corpo esteso in cui le distanze
                                        tra i punti restano invariate (non si deforma).
                                    </p>
                                    <p style={S.solText}>
                                        Per il punto materiale basta una sola condizione: <L s="$\vec{F}_{\text{ris}} = \vec{0}$" />.
                                        Per il corpo rigido occorrono <em>due</em> condizioni: equilibrio
                                        traslazionale (<L s="$\vec{F}_{\text{ris}} = \vec{0}$" />) ed equilibrio
                                        rotazionale (<L s="$\sum M = 0$" />), perché il corpo, avendo estensione,
                                        può ruotare anche se la risultante è zero.
                                    </p>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposte multiple</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a)</span>
                                    <span style={S.solRisposta}>C</span>
                                    <p style={S.solText}>
                                        L'equilibrio dinamico si ha con moto rettilineo uniforme (risultante = 0, ma
                                        velocità ≠ 0). Il pattinatore a velocità costante soddisfa esattamente questa
                                        condizione. A è equilibrio statico; B e D implicano accelerazione.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b)</span>
                                    <span style={S.solRisposta}>D</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La forza vincolare deve bilanciare sia il peso che la forza aggiuntiva verso il basso.
                                        </p>
                                        <DisplayMath>{"F_v = mg + F = 4{,}0 \\times 9{,}8 + 20{,}0 = 39{,}2 + 20{,}0 = 59{,}2\\,\\text{N}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c)</span>
                                    <span style={S.solRisposta}>C</span>
                                    <p style={S.solText}>
                                        Il punto materiale non ha estensione e non può ruotare, quindi basta imporre
                                        che la risultante delle forze sia zero (<L s="$\vec{F}_{\text{ris}} = \vec{0}$" />).
                                        La condizione sui momenti è necessaria solo per il corpo rigido. L'equilibrio
                                        non richiede che il corpo sia fermo (può esserci equilibrio dinamico).
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d)</span>
                                    <span style={S.solRisposta}>B</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La componente <em>perpendicolare</em> al piano usa il coseno dell'angolo.
                                        </p>
                                        <DisplayMath>{"F_{\\perp} = mg\\cos\\theta = 8{,}0 \\times 9{,}8 \\times \\cos 30° = 78{,}4 \\times 0{,}866 \\approx 67{,}9\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            La risposta A (39,2 N) è la componente <em>parallela</em> al piano (<L s="$mg\sin 30°$" />).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Soluzioni degli esercizi</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1) Piano orizzontale / inclinato — m = 6,0 kg, F = 4,0 N</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Piano orizzontale</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Condizione di equilibrio verticale:{" "}
                                            <L s="$F_v - mg - F = 0 \;\Rightarrow\; F_v = mg + F$" />
                                        </p>
                                        <DisplayMath>{"F_v = 6{,}0 \\times 9{,}8 + 4{,}0 = 58{,}8 + 4{,}0 = 62{,}8\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Piano inclinato (θ = 20°): componenti di F_tot</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La forza risultante verticale verso il basso è{" "}
                                            <L s="$F_{\text{tot}} = 62{,}8\,\text{N}$" />.
                                            Con <L s="$\sin 20° \approx 0{,}342$" /> e <L s="$\cos 20° \approx 0{,}940$" />:
                                        </p>
                                        <DisplayMath>{"F_{\\parallel} = F_{\\text{tot}}\\sin 20° = 62{,}8 \\times 0{,}342 \\approx 21{,}5\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_{\\perp} = F_{\\text{tot}}\\cos 20° = 62{,}8 \\times 0{,}940 \\approx 59{,}0\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza vincolare sul piano inclinato</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio perpendicolare al piano:{" "}
                                            <L s="$F_v = F_\perp \approx 59{,}0\,\text{N}$" />.
                                            La forza vincolare è diminuita rispetto al piano orizzontale (62,8 N)
                                            perché parte della forza totale viene "deviata" lungo il piano.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Attrito necessario e μ_s minimo</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio lungo il piano: <L s="$F_{\text{att}} = F_\parallel \approx 21{,}5\,\text{N}$" />
                                        </p>
                                        <DisplayMath>{"\\mu_s = \\frac{F_{\\text{att}}}{F_v} = \\frac{21{,}5}{59{,}0} \\approx 0{,}36 = \\tan 20°"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Il risultato <L s="$\mu_s = \tan\theta$" /> è indipendente dalla forza
                                            aggiuntiva <L s="$F$" />, perché essa aumenta in proporzione uguale
                                            sia l'attrito necessario che la forza vincolare.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2) Piano inclinato — m = 6,0 kg, L = 5,0 m, h = 3,0 m</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Pitagora e angoli</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"b = \\sqrt{L^2 - h^2} = \\sqrt{5{,}0^2 - 3{,}0^2} = \\sqrt{16} = 4{,}0\\,\\text{m}"}</DisplayMath>
                                        <DisplayMath>{"\\sin\\theta = \\frac{h}{L} = \\frac{3{,}0}{5{,}0} = 0{,}60 \\qquad \\cos\\theta = \\frac{b}{L} = \\frac{4{,}0}{5{,}0} = 0{,}80"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Componenti del peso e forza vincolare</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 6{,}0 \\times 9{,}8 \\times 0{,}60 = 35{,}3\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_v = mg\\cos\\theta = 6{,}0 \\times 9{,}8 \\times 0{,}80 = 47{,}0\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza di attrito e coefficiente μ_s</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Equilibrio lungo il piano: <L s="$F_{\text{att}} = F_\parallel = 35{,}3\,\text{N}$" />
                                        </p>
                                        <DisplayMath>{"\\mu_s = \\frac{F_{\\text{att}}}{F_v} = \\frac{35{,}3}{47{,}0} = 0{,}75"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Nuovo piano più ripido (h' = 4,0 m)</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Con <L s="$h' = 4{,}0\,\text{m}$" /> e <L s="$L = 5{,}0\,\text{m}$" />:
                                        </p>
                                        <DisplayMath>{"\\sin\\theta' = \\frac{4{,}0}{5{,}0} = 0{,}80 \\qquad \\cos\\theta' = \\frac{3{,}0}{5{,}0} = 0{,}60"}</DisplayMath>
                                        <DisplayMath>{"F'_{\\parallel} = 6{,}0 \\times 9{,}8 \\times 0{,}80 = 47{,}0\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F'_v = 6{,}0 \\times 9{,}8 \\times 0{,}60 = 35{,}3\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_{\\text{att,max}} = \\mu_s \\cdot F'_v = 0{,}75 \\times 35{,}3 = 26{,}5\\,\\text{N}"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            Poiché <L s="$F'_\parallel = 47{,}0\,\text{N} > F_{\text{att,max}} = 26{,}5\,\text{N}$" />,
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

/**
 * VerificaFisicaEquilibrio3F_FilaBC – Verifica: Equilibrio del punto materiale
 * Liceo Linguistico 3F – Fisica – Maggio 2026 – FILA B / FILA C
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

type Fila = "B" | "C";

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

    btnFila: (active: boolean, fila: Fila): React.CSSProperties => ({
        padding: "6px 20px",
        border: active
            ? `2px solid ${fila === "B" ? "#d97706" : "#7c3aed"}`
            : "2px solid #e2e8f0",
        borderRadius: 6,
        background: active
            ? fila === "B" ? "#fef3c7" : "#f3e8ff"
            : "#f8fafc",
        color: active
            ? fila === "B" ? "#92400e" : "#5b21b6"
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

// ─── Componente principale ──────────────────────────────────────────────────────

export default function VerificaFisicaEquilibrio3F_FilaBC(): React.ReactElement {
    const [fila, setFila] = useState<Fila>("B");
    const [showSoluzioni, setShowSoluzioni] = useState(false);

    const filaBadge = fila === "B"
        ? { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" }
        : { bg: "#f3e8ff", color: "#5b21b6", border: "#c4b5fd" };

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
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

                {/* Foglio verifica */}
                <div style={S.sheet} className="verifica-sheet">

                    {/* ── Intestazione ── */}
                    <div style={S.headerDoc}>
                        <div style={S.istituto}>Liceo Linguistico — San Giovanni Valdarno — Classe 3ª F</div>
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>
                            Equilibrio del punto materiale · Forze · Attrito · Piano inclinato
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
                        PARTE A – Domande a risposta aperta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta <span style={S.punti}>(24 punti)</span></div>

                        {/* A.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            {fila === "B" ? (
                                <p style={S.domandaText}>
                                    Definisci il concetto di <strong>corpo rigido</strong> e spiega quali sono le{" "}
                                    <strong>due condizioni di equilibrio</strong> che deve soddisfare. Per quale motivo
                                    per il <strong>punto materiale</strong> è sufficiente una sola condizione?
                                    Scrivi le relazioni matematiche corrispondenti.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Definisci i concetti di <strong>corpo esteso</strong> e di{" "}
                                    <strong>corpo rigido</strong>. Spiega le differenze tra i due modelli e porta
                                    un esempio di oggetto fisico che può essere considerato rigido e uno che{" "}
                                    <em>non</em> può esserlo, motivando la scelta.
                                </p>
                            )}
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        {/* A.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(12 punti)</span></span>
                            {fila === "B" ? (
                                <p style={S.domandaText}>
                                    Definisci il concetto di <strong>punto materiale</strong> e di{" "}
                                    <strong>corpo esteso</strong>. Fai un esempio concreto di situazione fisica in
                                    cui è opportuno usare il modello di punto materiale e uno in cui è invece
                                    necessario trattare il corpo come esteso, motivando la scelta in entrambi i casi.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Enuncia le condizioni di equilibrio per un <strong>punto materiale</strong> e
                                    per un <strong>corpo rigido</strong>. Spiega, usando il concetto di{" "}
                                    <strong>momento di una forza</strong>, perché per un corpo rigido è necessario
                                    imporre anche l'equilibrio rotazionale oltre a quello traslazionale.
                                </p>
                            )}
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
                            {fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Quale delle seguenti situazioni descrive correttamente un corpo in{" "}
                                        <strong>equilibrio dinamico</strong>?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Un libro immobile su un tavolo</span>
                                    <span style={S.mcOption}><strong>B.</strong> Un'auto che frena fino a fermarsi</span>
                                    <span style={S.mcOption}><strong>C.</strong> Un pattinatore che scivola su ghiaccio a velocità costante in linea retta</span>
                                    <span style={S.mcOption}><strong>D.</strong> Una palla che viene lanciata verso l'alto</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un punto materiale si muove di <strong>moto rettilineo uniforme</strong>. Quale delle
                                        seguenti affermazioni è corretta?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> Sta accelerando perché è in moto</span>
                                    <span style={S.mcOption}><strong>B.</strong> La risultante delle forze che agiscono su di esso è zero</span>
                                    <span style={S.mcOption}><strong>C.</strong> Non può agire alcuna forza su di esso</span>
                                    <span style={S.mcOption}><strong>D.</strong> La forza che lo muove è maggiore dell'attrito</span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            {fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 4{,}0\,\text{kg}$" /> è appoggiato su un piano
                                        orizzontale. Oltre alla forza peso, una forza verticale{" "}
                                        <L s="$F = 20{,}0\,\text{N}$" /> spinge il blocco verso il{" "}
                                        <strong>basso</strong>. Qual è la forza vincolare esercitata dal piano sul blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$39{,}2\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$20{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$19{,}2\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$59{,}2\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 3{,}0\,\text{kg}$" /> è appoggiato su un piano
                                        orizzontale. Una corda tira il blocco verticalmente verso l'<strong>alto</strong>{" "}
                                        con una forza <L s="$F = 8{,}0\,\text{N}$" />. Qual è la forza vincolare
                                        esercitata dal piano sul blocco?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$29{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$37{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$8{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$21{,}4\,\text{N}$" /></span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            {fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Per un <strong>punto materiale</strong> (non per un corpo rigido), la condizione{" "}
                                        <em>necessaria e sufficiente</em> per l'equilibrio è:
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> La risultante delle forze è zero <em>e</em> la somma dei momenti è zero</span>
                                    <span style={S.mcOption}><strong>B.</strong> Solo che la somma dei momenti delle forze sia zero</span>
                                    <span style={S.mcOption}><strong>C.</strong> Solo che la risultante di tutte le forze sia zero</span>
                                    <span style={S.mcOption}><strong>D.</strong> Il corpo deve essere necessariamente in quiete assoluta</span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Quali sono le due condizioni che devono essere soddisfatte{" "}
                                        <em>simultaneamente</em> affinché un <strong>corpo rigido</strong> sia in
                                        equilibrio?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> La velocità è costante e la forza applicata è zero</span>
                                    <span style={S.mcOption}><strong>B.</strong> La risultante delle forze è zero e la somma dei momenti è zero rispetto a qualsiasi punto</span>
                                    <span style={S.mcOption}><strong>C.</strong> La somma dei momenti è zero e il corpo è necessariamente in quiete</span>
                                    <span style={S.mcOption}><strong>D.</strong> Tutte le forze applicate sono perpendicolari alla superficie di appoggio</span>
                                </>
                            )}
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>*d)</span>
                            {fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 8{,}0\,\text{kg}$" /> è su un piano inclinato di{" "}
                                        <L s="$\theta = 30°$" />. Qual è la componente della forza peso{" "}
                                        <em>perpendicolare</em> al piano (uguale alla forza vincolare in assenza di attrito)?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$39{,}2\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$67{,}9\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$78{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$49{,}0\,\text{N}$" /></span>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è su un piano inclinato.
                                        L'angolo soddisfa <L s="$\sin\theta = 0{,}80$" /> e{" "}
                                        <L s="$\cos\theta = 0{,}60$" />. Qual è la componente della forza peso{" "}
                                        <em>parallela</em> al piano?
                                    </p>
                                    <span style={S.mcOption}><strong>A.</strong> <L s="$29{,}4\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>B.</strong> <L s="$39{,}2\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>C.</strong> <L s="$49{,}0\,\text{N}$" /></span>
                                    <span style={S.mcOption}><strong>D.</strong> <L s="$24{,}5\,\text{N}$" /></span>
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
                                Equilibrio su piano orizzontale e piano inclinato
                            </span>

                            {fila === "B" ? (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 6{,}0\,\text{kg}$" /> è appoggiato su una superficie.
                                    Oltre alla forza peso, una forza verticale <L s="$F = 4{,}0\,\text{N}$" /> agisce
                                    sul blocco spingendolo verso il basso.
                                </p>
                            ) : (
                                <p style={S.domandaText}>
                                    Un blocco di massa <L s="$m = 4{,}0\,\text{kg}$" /> è appoggiato su una superficie.
                                    Oltre alla forza peso, una forza verticale <L s="$F = 8{,}0\,\text{N}$" /> agisce
                                    sul blocco spingendolo verso il basso.
                                </p>
                            )}

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
                                    {fila === "B"
                                        ? <L s="$\theta = 20°$" />
                                        : <L s="$\theta = 15°$" />
                                    }. Sia la forza peso che la forza <L s="$F$" /> restano
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

                        {/* C.2 */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>
                                2) <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>(28 punti)</span>{" "}
                                {fila === "B" ? "Piano inclinato con forza elastica" : "Piano inclinato con attrito"}
                            </span>

                            {fila === "B" ? (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 5{,}0\,\text{kg}$" /> è in equilibrio su un piano
                                        inclinato liscio. La <strong>base</strong> del piano è{" "}
                                        <L s="$b = 4{,}0\,\text{m}$" /> e l'altezza è <L s="$h = 3{,}0\,\text{m}$" />.
                                        Il blocco è trattenuto da una molla parallela al piano, allungata di{" "}
                                        <L s="$x = 0{,}30\,\text{m}$" />.
                                    </p>

                                    <div style={{ marginLeft: 16, marginTop: 8 }}>
                                        <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
                                            Disegna le forze sul blocco (forza peso, forza vincolare, forza elastica della molla):
                                        </p>
                                        <div style={{ height: 100, border: "1px dashed #cbd5e1", borderRadius: 4, marginBottom: 12 }} />
                                    </div>

                                    <div style={{ marginLeft: 16, marginTop: 6 }}>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                            <strong>i.)</strong> Usa il teorema di Pitagora per trovare la{" "}
                                            <strong>lunghezza</strong> <L s="$L$" /> del piano inclinato. Ricava poi{" "}
                                            <L s="$\sin\theta$" /> e <L s="$\cos\theta$" /> come rapporti tra i lati
                                            del triangolo.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>ii.)</strong> Calcola la componente del peso <em>parallela</em> al
                                            piano <L s="$F_\parallel$" /> e la forza vincolare <L s="$F_v$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>iii.)</strong> La forza di richiamo della molla bilancia la componente
                                            parallela <L s="$F_\parallel$" />. Applicando la{" "}
                                            <strong>legge di Hooke</strong> (<L s="$F = k \cdot x$" />), calcola la
                                            costante elastica <L s="$k$" /> della molla.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>*iv.)</strong> Se la massa del blocco fosse raddoppiata (a parità
                                            di <L s="$k$" />), di quanto si allunga la molla per mantenere il blocco
                                            in equilibrio?
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p style={S.domandaText}>
                                        Un blocco di massa <L s="$m = 4{,}0\,\text{kg}$" /> è in equilibrio su un piano
                                        inclinato liscio. La <strong>base</strong> del piano è{" "}
                                        <L s="$b = 4{,}0\,\text{m}$" /> e l'altezza è <L s="$h = 3{,}0\,\text{m}$" />.
                                        Il blocco è trattenuto da una molla parallela al piano, allungata di{" "}
                                        <L s="$x = 0{,}40\,\text{m}$" />.
                                    </p>

                                    <div style={{ marginLeft: 16, marginTop: 8 }}>
                                        <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
                                            Disegna le forze sul blocco (forza peso, forza vincolare, forza elastica della molla):
                                        </p>
                                        <div style={{ height: 100, border: "1px dashed #cbd5e1", borderRadius: 4, marginBottom: 12 }} />
                                    </div>

                                    <div style={{ marginLeft: 16, marginTop: 6 }}>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                            <strong>i.)</strong> Usa il teorema di Pitagora per trovare la{" "}
                                            <strong>lunghezza</strong> <L s="$L$" /> del piano inclinato. Ricava poi{" "}
                                            <L s="$\sin\theta$" /> e <L s="$\cos\theta$" /> come rapporti tra i lati
                                            del triangolo.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>ii.)</strong> Calcola la componente del peso <em>parallela</em> al
                                            piano <L s="$F_\parallel$" /> e la forza vincolare <L s="$F_v$" />.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>iii.)</strong> La forza di richiamo della molla bilancia la componente
                                            parallela <L s="$F_\parallel$" />. Applicando la{" "}
                                            <strong>legge di Hooke</strong> (<L s="$F = k \cdot x$" />), calcola la
                                            costante elastica <L s="$k$" /> della molla.
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                        <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1" }} />

                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                            <strong>*iv.)</strong> Se la massa del blocco fosse raddoppiata (a parità
                                            di <L s="$k$" />), di quanto si allunga la molla per mantenere il blocco
                                            in equilibrio?
                                        </p>
                                        <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                    </div>
                                </>
                            )}
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
                            <div style={S.soluzioniTitle}>✅ Soluzioni – Fila {fila}</div>

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposte attese</div>

                                {fila === "B" ? (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Corpo rigido e condizioni di equilibrio</span>
                                            <p style={S.solText}>
                                                Il <strong>corpo rigido</strong> è un corpo esteso in cui le distanze
                                                tra tutti i punti rimangono costanti: non si deforma sotto l'azione
                                                delle forze.
                                            </p>
                                            <p style={S.solText}>
                                                Per il corpo rigido occorrono <em>due</em> condizioni simultane:
                                            </p>
                                            <p style={S.solText}>
                                                1. <strong>Equilibrio traslazionale</strong>:{" "}
                                                <L s="$\vec{F}_{\text{ris}} = \vec{0}$" /> — la risultante di tutte
                                                le forze è nulla (il centro di massa non accelera).
                                            </p>
                                            <p style={S.solText}>
                                                2. <strong>Equilibrio rotazionale</strong>:{" "}
                                                <L s="$\sum M = 0$" /> — la somma dei momenti di tutte le forze
                                                rispetto a qualsiasi punto è nulla (il corpo non ruota).
                                            </p>
                                            <p style={S.solText}>
                                                Per il <strong>punto materiale</strong> è sufficiente la sola
                                                condizione <L s="$\vec{F}_{\text{ris}} = \vec{0}$" />, perché non
                                                ha estensione e non può ruotare: non ha senso parlare di momento
                                                di una forza applicata a un punto.
                                            </p>
                                        </div>

                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Punto materiale vs corpo esteso</span>
                                            <p style={S.solText}>
                                                Il <strong>punto materiale</strong> è un modello ideale in cui tutta
                                                la massa è concentrata in un punto geometrico privo di dimensioni.
                                                Il <strong>corpo esteso</strong> è un oggetto con dimensioni finite,
                                                la cui forma e distribuzione della massa sono rilevanti.
                                            </p>
                                            <p style={S.solText}>
                                                <em>Punto materiale</em>: un pianeta che orbita attorno al Sole —
                                                la distanza è talmente grande rispetto alle sue dimensioni che
                                                la forma del pianeta è irrilevante.
                                            </p>
                                            <p style={S.solText}>
                                                <em>Corpo esteso</em>: una trave orizzontale sostenuta a un'estremità
                                                — il punto in cui si applica la forza cambia il momento, quindi
                                                non si può ignorare l'estensione del corpo.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>a) Corpo esteso vs corpo rigido</span>
                                            <p style={S.solText}>
                                                Il <strong>corpo esteso</strong> è qualsiasi oggetto fisico con
                                                dimensioni finite: ha forma, volume e la sua massa è distribuita
                                                nello spazio. Il <strong>corpo rigido</strong> è un caso particolare
                                                di corpo esteso in cui le distanze tra tutti i punti rimangono
                                                costanti: il corpo non si deforma per effetto delle forze applicate.
                                            </p>
                                            <p style={S.solText}>
                                                <em>Esempio di corpo rigido</em>: un'asta metallica o un bilanciere —
                                                le deformazioni sono trascurabili rispetto alle dimensioni.
                                            </p>
                                            <p style={S.solText}>
                                                <em>Esempio non rigido</em>: una molla, un pallone di gomma, un
                                                elastico — si deformano apprezzabilmente sotto l'azione delle forze
                                                e non possono essere trattati come rigidi.
                                            </p>
                                        </div>

                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>b) Condizioni di equilibrio e momento della forza</span>
                                            <p style={S.solText}>
                                                <strong>Punto materiale</strong>: una sola condizione —{" "}
                                                <L s="$\vec{F}_{\text{ris}} = \vec{0}$" /> (risultante nulla).
                                            </p>
                                            <p style={S.solText}>
                                                <strong>Corpo rigido</strong>: due condizioni —{" "}
                                                <L s="$\vec{F}_{\text{ris}} = \vec{0}$" /> e{" "}
                                                <L s="$\sum M = 0$" />.
                                            </p>
                                            <p style={S.solText}>
                                                Il <strong>momento di una forza</strong> rispetto a un punto O è
                                                definito come il prodotto della forza per il suo braccio{" "}
                                                (<L s="$M = F \cdot d$" />). Anche se la risultante è nulla, possono
                                                esistere coppie di forze uguali e opposte ma non collineari che
                                                generano una rotazione netta. Per evitare la rotazione occorre
                                                imporre <L s="$\sum M = 0$" />. Questa condizione non ha senso per
                                                il punto materiale, che non ha estensione e non può ruotare.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposte multiple</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a)</span>
                                    {fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <p style={S.solText}>
                                                L'equilibrio dinamico si ha con moto rettilineo uniforme (risultante = 0,
                                                velocità ≠ 0). Il pattinatore a velocità costante soddisfa questa
                                                condizione. A è equilibrio statico; B e D implicano accelerazione.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <p style={S.solText}>
                                                Il moto rettilineo uniforme implica accelerazione zero, quindi risultante
                                                zero (1ª legge di Newton). Non è necessario che non agiscano forze,
                                                ma che si bilancino. Il corpo è in equilibrio dinamico.
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b)</span>
                                    {fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    La forza vincolare bilancia peso e forza aggiuntiva verso il basso.
                                                </p>
                                                <DisplayMath>{"F_v = mg + F = 4{,}0 \\times 9{,}8 + 20{,}0 = 39{,}2 + 20{,}0 = 59{,}2\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>D</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    La corda tira verso l'alto, riducendo la forza vincolare necessaria.
                                                </p>
                                                <DisplayMath>{"F_v = mg - F = 3{,}0 \\times 9{,}8 - 8{,}0 = 29{,}4 - 8{,}0 = 21{,}4\\,\\text{N}"}</DisplayMath>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c)</span>
                                    {fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>C</span>
                                            <p style={S.solText}>
                                                Il punto materiale non ha estensione e non può ruotare, quindi basta
                                                imporre <L s="$\vec{F}_{\text{ris}} = \vec{0}$" />. La condizione sui
                                                momenti è necessaria solo per il corpo rigido. L'equilibrio non richiede
                                                quiete assoluta (equilibrio dinamico).
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <p style={S.solText}>
                                                Per il corpo rigido servono due condizioni simultanee: equilibrio
                                                traslazionale (<L s="$\vec{F}_{\text{ris}} = \vec{0}$" />) ed equilibrio
                                                rotazionale (<L s="$\sum M = 0$" /> rispetto a qualsiasi punto). Senza
                                                entrambe, il corpo può ancora traslare o ruotare.
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*d)</span>
                                    {fila === "B" ? (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 13 }}>
                                                    La componente perpendicolare usa il coseno.
                                                </p>
                                                <DisplayMath>{"F_{\\perp} = mg\\cos 30° = 8{,}0 \\times 9{,}8 \\times 0{,}866 = 67{,}9\\,\\text{N}"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>
                                                    A (39,2 N) è la componente parallela <L s="$mg\sin 30°$" />.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span style={S.solRisposta}>B</span>
                                            <div style={S.solStep}>
                                                <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                                <p style={{ fontSize: 13, marginTop: 4 }}>
                                                    A (29,4 N) è la componente perpendicolare <L s="$mg\cos\theta = 5{,}0 \times 9{,}8 \times 0{,}60$" />.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Soluzioni degli esercizi</div>

                                {/* C.1 */}
                                <div style={S.solDomanda}>
                                    {fila === "B" ? (
                                        <span style={S.solLabel}>1) Piano orizzontale / inclinato — m = 6,0 kg, F = 4,0 N, θ = 20°</span>
                                    ) : (
                                        <span style={S.solLabel}>1) Piano orizzontale / inclinato — m = 4,0 kg, F = 8,0 N, θ = 15°</span>
                                    )}

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Piano orizzontale</p>
                                    <div style={S.solStep}>
                                        {fila === "B" ? (
                                            <DisplayMath>{"F_v = mg + F = 6{,}0 \\times 9{,}8 + 4{,}0 = 58{,}8 + 4{,}0 = 62{,}8\\,\\text{N}"}</DisplayMath>
                                        ) : (
                                            <DisplayMath>{"F_v = mg + F = 4{,}0 \\times 9{,}8 + 8{,}0 = 39{,}2 + 8{,}0 = 47{,}2\\,\\text{N}"}</DisplayMath>
                                        )}
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>
                                        ii) Piano inclinato ({fila === "B" ? "θ = 20°" : "θ = 15°"})
                                    </p>
                                    <div style={S.solStep}>
                                        {fila === "B" ? (
                                            <>
                                                <p style={{ fontSize: 13 }}>
                                                    <L s="$F_{\text{tot}} = 62{,}8\,\text{N}$" />,{" "}
                                                    <L s="$\sin 20° \approx 0{,}342$" />, <L s="$\cos 20° \approx 0{,}940$" />:
                                                </p>
                                                <DisplayMath>{"F_{\\parallel} = 62{,}8 \\times 0{,}342 \\approx 21{,}5\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_{\\perp} = 62{,}8 \\times 0{,}940 \\approx 59{,}0\\,\\text{N}"}</DisplayMath>
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ fontSize: 13 }}>
                                                    <L s="$F_{\text{tot}} = 47{,}2\,\text{N}$" />,{" "}
                                                    <L s="$\sin 15° \approx 0{,}259$" />, <L s="$\cos 15° \approx 0{,}966$" />:
                                                </p>
                                                <DisplayMath>{"F_{\\parallel} = 47{,}2 \\times 0{,}259 \\approx 12{,}2\\,\\text{N}"}</DisplayMath>
                                                <DisplayMath>{"F_{\\perp} = 47{,}2 \\times 0{,}966 \\approx 45{,}6\\,\\text{N}"}</DisplayMath>
                                            </>
                                        )}
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Forza vincolare</p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            {fila === "B"
                                                ? <><L s="$F_v = F_\perp \approx 59{,}0\,\text{N}$" /> (vs 62,8 N su piano orizzontale).</>
                                                : <><L s="$F_v = F_\perp \approx 45{,}6\,\text{N}$" /> (vs 47,2 N su piano orizzontale).</>
                                            }{" "}
                                            La forza vincolare diminuisce all'inclinarsi del piano.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Attrito e μ_s</p>
                                    <div style={S.solStep}>
                                        {fila === "B" ? (
                                            <DisplayMath>{"\\mu_s = \\frac{F_{\\text{att}}}{F_v} = \\frac{21{,}5}{59{,}0} \\approx 0{,}36 = \\tan 20°"}</DisplayMath>
                                        ) : (
                                            <DisplayMath>{"\\mu_s = \\frac{F_{\\text{att}}}{F_v} = \\frac{12{,}2}{45{,}6} \\approx 0{,}27 = \\tan 15°"}</DisplayMath>
                                        )}
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Notare che <L s="$\mu_s = \tan\theta$" /> indipendentemente da <L s="$F$" />.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ height: 8 }} />

                                {/* C.2 */}
                                {fila === "B" ? (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>2) Piano inclinato + molla — m = 5,0 kg, b = 4,0 m, h = 3,0 m, x = 0,30 m</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Pitagora e angoli</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"L = \\sqrt{b^2 + h^2} = \\sqrt{4{,}0^2 + 3{,}0^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5{,}0\\,\\text{m}"}</DisplayMath>
                                            <DisplayMath>{"\\sin\\theta = \\frac{h}{L} = \\frac{3{,}0}{5{,}0} = 0{,}60 \\qquad \\cos\\theta = \\frac{b}{L} = \\frac{4{,}0}{5{,}0} = 0{,}80"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Componenti e forza vincolare</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}60 = 29{,}4\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"F_v = mg\\cos\\theta = 5{,}0 \\times 9{,}8 \\times 0{,}80 = 39{,}2\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Costante elastica (legge di Hooke)</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13 }}>
                                                Equilibrio lungo il piano: la molla deve esercitare{" "}
                                                <L s="$F_{\text{el}} = F_\parallel = 29{,}4\,\text{N}$" />.
                                                Dalla legge di Hooke <L s="$F = k \cdot x$" />:
                                            </p>
                                            <DisplayMath>{"k = \\frac{F_{\\parallel}}{x} = \\frac{29{,}4}{0{,}30} = 98\\,\\text{N/m}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Massa raddoppiata</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13 }}>
                                                Con <L s="$m' = 10{,}0\,\text{kg}$" />: <L s="$F'_\parallel = 10{,}0 \times 9{,}8 \times 0{,}60 = 58{,}8\,\text{N}$" />.
                                            </p>
                                            <DisplayMath>{"x' = \\frac{F'_{\\parallel}}{k} = \\frac{58{,}8}{98} = 0{,}60\\,\\text{m}"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 4 }}>
                                                L'allungamento raddoppia: <L s="$x' = 2x$" />, perché{" "}
                                                <L s="$F_\parallel \propto m$" /> e <L s="$k$" /> resta costante.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>2) Piano inclinato + molla — m = 4,0 kg, b = 4,0 m, h = 3,0 m, x = 0,40 m</span>

                                        <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>i) Pitagora e angoli</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"L = \\sqrt{b^2 + h^2} = \\sqrt{4{,}0^2 + 3{,}0^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5{,}0\\,\\text{m}"}</DisplayMath>
                                            <DisplayMath>{"\\sin\\theta = \\frac{h}{L} = \\frac{3{,}0}{5{,}0} = 0{,}60 \\qquad \\cos\\theta = \\frac{b}{L} = \\frac{4{,}0}{5{,}0} = 0{,}80"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>ii) Componenti e forza vincolare</p>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"F_{\\parallel} = mg\\sin\\theta = 4{,}0 \\times 9{,}8 \\times 0{,}60 = 23{,}5\\,\\text{N}"}</DisplayMath>
                                            <DisplayMath>{"F_v = mg\\cos\\theta = 4{,}0 \\times 9{,}8 \\times 0{,}80 = 31{,}4\\,\\text{N}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>iii) Costante elastica (legge di Hooke)</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13 }}>
                                                Equilibrio lungo il piano: la molla deve esercitare{" "}
                                                <L s="$F_{\text{el}} = F_\parallel = 23{,}5\,\text{N}$" />.
                                                Dalla legge di Hooke <L s="$F = k \cdot x$" />:
                                            </p>
                                            <DisplayMath>{"k = \\frac{F_{\\parallel}}{x} = \\frac{23{,}5}{0{,}40} = 58{,}8\\,\\text{N/m}"}</DisplayMath>
                                        </div>

                                        <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>*iv) Massa raddoppiata</p>
                                        <div style={S.solStep}>
                                            <p style={{ fontSize: 13 }}>
                                                Con <L s="$m' = 8{,}0\,\text{kg}$" />:{" "}
                                                <L s="$F'_\parallel = 8{,}0 \times 9{,}8 \times 0{,}60 = 47{,}0\,\text{N}$" />.
                                            </p>
                                            <DisplayMath>{"x' = \\frac{F'_{\\parallel}}{k} = \\frac{47{,}0}{58{,}8} = 0{,}80\\,\\text{m}"}</DisplayMath>
                                            <p style={{ fontSize: 13, marginTop: 4 }}>
                                                L'allungamento raddoppia: <L s="$x' = 2x$" />, perché{" "}
                                                <L s="$F_\parallel \propto m$" /> e <L s="$k$" /> resta costante.
                                            </p>
                                        </div>
                                    </div>
                                )}
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

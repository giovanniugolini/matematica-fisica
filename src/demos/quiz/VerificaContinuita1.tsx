/**
 * VerificaContinuita1 – Verifica scritta: Continuità e Asintoti
 * Liceo Economico Sociale – Classe 5I – Matematica – San Giovanni Valdarno
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

// ─── Stili ────────────────────────────────────────────────────────────────────
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

    parte: {
        marginBottom: 28,
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

    punti: {
        float: "right" as const,
        fontWeight: 400,
        color: "#64748b",
        fontSize: 12,
        textTransform: "none" as const,
    } as React.CSSProperties,

    vfRow: {
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto",
        gap: "0 12px",
        alignItems: "center",
        fontSize: 14,
        lineHeight: 1.7,
        color: "#1e293b",
        borderBottom: "1px solid #e2e8f0",
        padding: "8px 0",
    } as React.CSSProperties,

    vfBox: {
        width: 22,
        height: 22,
        border: "1.5px solid #64748b",
        borderRadius: 3,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#475569",
        fontFamily: "system-ui, sans-serif",
        flexShrink: 0,
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

    solRispostaFalso: {
        display: "inline-block",
        background: "#fee2e2",
        border: "1px solid #fca5a5",
        borderRadius: 4,
        padding: "2px 10px",
        fontSize: 13,
        fontWeight: 700,
        color: "#991b1b",
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

function VFItem({ num, children }: { num: string; children: React.ReactNode }): React.ReactElement {
    return (
        <div style={S.vfRow}>
            <span style={{ fontWeight: 700, fontFamily: "system-ui, sans-serif", fontSize: 13, color: "#475569" }}>{num}</span>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{children}</div>
            <div style={{ ...S.vfBox }}>V</div>
            <div style={{ ...S.vfBox }}>F</div>
        </div>
    );
}

function Righe({ n, h = 44 }: { n: number; h?: number }): React.ReactElement {
    return (
        <div style={{ marginTop: 10 }}>
            {Array.from({ length: n }).map((_, i) => (
                <div key={i} style={{ height: h, borderBottom: "1px dashed #cbd5e1" }} />
            ))}
        </div>
    );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function VerificaContinuita1(): React.ReactElement {
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
                            <button style={S.btnSoluzioni(showSoluzioni)} onClick={() => setShowSoluzioni(v => !v)}>
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
                        <div style={S.istituto}>
                            Liceo Economico Sociale — Classe 5I — San Giovanni Valdarno
                        </div>
                        <div style={S.title}>Verifica di Matematica</div>
                        <div style={S.disciplina}>Continuità e Asintoti — Simulazione</div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: "10px 24px",
                            marginTop: 14,
                            fontFamily: "system-ui, sans-serif",
                            fontSize: 13,
                            color: "#1e293b",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Cognome e Nome:</span>
                                <span style={{ flex: 1, borderBottom: "1.5px solid #0f172a", minWidth: 220, height: 20, display: "inline-block" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Data:</span>
                                <span style={{ width: 100, borderBottom: "1.5px solid #0f172a", height: 20, display: "inline-block" }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Classe:</span>
                                <span style={{ width: 80, borderBottom: "1.5px solid #0f172a", height: 20, display: "inline-block" }} />
                            </div>
                        </div>

                        <div style={S.metaRow}>
                            <span>Tempo: 60 minuti</span>
                            <span>Totale: 100 punti</span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 1 – Vero o Falso
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 1 — Vero o Falso? (motiva brevemente)
                            <span style={S.punti}>(punti 10)</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 4, fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "#475569" }}>
                            <span style={{ width: 22, textAlign: "center" }}>V</span>
                            <span style={{ width: 22, textAlign: "center" }}>F</span>
                        </div>

                        <VFItem num="1.">
                            Se una funzione è continua in <L s="$(a,b)$" />, allora assume sicuramente un valore massimo e un valore minimo nell'intervallo.
                        </VFItem>
                        <VFItem num="2.">
                            Se una funzione presenta una discontinuità eliminabile in <L s="$x=a$" />, allora il limite per <L s="$x\to a$" /> esiste ed è finito.
                        </VFItem>
                        <VFItem num="3.">
                            Se una funzione assume in due punti distinti valori di segno opposto, allora ammette sicuramente almeno uno zero compreso tra essi.
                        </VFItem>
                        <VFItem num="4.">
                            Se una funzione ha asintoto verticale <L s="$x=a$" />, allora almeno uno dei due limiti per <L s="$x\to a$" /> è infinito.
                        </VFItem>
                        <VFItem num="5.">
                            Una funzione continua in un intervallo aperto limitato assume sempre massimo e minimo assoluti.
                        </VFItem>

                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>Motivazioni:</div>
                            <Righe n={5} h={34} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 2 – Grafico
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 2 — Studio della singolarità dal grafico
                            <span style={S.punti}>(punti 20)</span>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 12 }}>
                            Osserva il seguente grafico della funzione <L s="$f(x)$" /> e classifica i punti di singolarità della funzione, indicando per ciascuno: la <em>x</em> del punto, il tipo di discontinuità e i limiti significativi.
                        </p>
                        <div style={{ textAlign: "center", margin: "16px 0" }}>
                            <img
                                src={`${import.meta.env.BASE_URL}grafico_singolarita.png`}
                                alt="Grafico della funzione con singolarità"
                                style={{ maxWidth: 340, width: "100%", border: "1px solid #e2e8f0", borderRadius: 4 }}
                            />
                        </div>
                        <Righe n={6} h={40} />
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 3 – Singolarità analitiche
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 3 — Studio della singolarità da funzione analitica
                            <span style={S.punti}>(punti 24)</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 10 }}>
                            Per ciascuna funzione: <strong>i)</strong> determina il dominio &nbsp;
                            <strong>ii)</strong> individua i punti di possibile discontinuità &nbsp;
                            <strong>iii)</strong> calcola i limiti significativi &nbsp;
                            <strong>iv)</strong> classifica la singolarità.
                        </p>

                        {[
                            { label: "a)", formula: "f(x)=\\dfrac{x^2-4}{x-2}" },
                            { label: "b)", formula: "g(x)=\\dfrac{x^2-1}{x^2+3x-4}" },
                            { label: "*c)", formula: "h(x)=\\dfrac{1}{(x+1)^2}" },
                        ].map(({ label, formula }) => (
                            <div key={label} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontFamily: "system-ui, sans-serif", fontSize: 14, color: label.startsWith("*") ? "#7c3aed" : "#1e293b", flexShrink: 0 }}>{label}</span>
                                    <L s={`$${formula}$`} />
                                </div>
                                <Righe n={5} h={38} />
                            </div>
                        ))}
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 4 – Asintoti
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 4 — Studio degli asintoti
                            <span style={S.punti}>(punti 30)</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 10 }}>
                            Per ciascuna funzione: <strong>i)</strong> determina il dominio &nbsp;
                            <strong>ii)</strong> cerca gli eventuali asintoti verticali &nbsp;
                            <strong>iii)</strong> cerca gli eventuali asintoti orizzontali &nbsp;
                            <strong>*iv)</strong> determina l'eventuale asintoto obliquo.
                        </p>

                        {[
                            { label: "a)", formula: "f(x)=\\dfrac{2x+3}{x-1}" },
                            { label: "b)", formula: "g(x)=\\dfrac{x^2+1}{x}" },
                            { label: "*c)", formula: "h(x)=\\dfrac{3x^2-2}{x^2+1}" },
                        ].map(({ label, formula }) => (
                            <div key={label} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontFamily: "system-ui, sans-serif", fontSize: 14, color: label.startsWith("*") ? "#7c3aed" : "#1e293b", flexShrink: 0 }}>{label}</span>
                                    <L s={`$${formula}$`} />
                                </div>
                                <Righe n={5} h={38} />
                            </div>
                        ))}
                    </div>

                    {/* ════════════════════════════════════
                        ESERCIZIO 5 – Parametro
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 5 — Continuità di una funzione con parametro
                            <span style={S.punti}>(punti 16)</span>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 14 }}>
                            Determina il valore del parametro reale <L s="$k$" /> affinché la seguente funzione sia continua nel punto <L s="$x=2$" />, motivando la risposta.
                        </p>
                        <div style={{ textAlign: "center", margin: "0 0 16px" }}>
                            <DisplayMath>{
                                "f(x)=\\begin{cases} x+3 & \\text{se } x<2 \\\\ kx-1 & \\text{se } x\\geq 2 \\end{cases}"
                            }</DisplayMath>
                        </div>
                        <Righe n={7} h={44} />
                    </div>

                    {/* ── Tabella voto ── */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, fontFamily: "system-ui, sans-serif" }}>
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
                            <div style={S.soluzioniTitle}>✅ Soluzioni e procedimenti</div>

                            {/* ─── Es.1 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 1 – Vero o Falso</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>1. Funzione continua su (a,b) → max e min sicuri</span>
                                    <span style={S.solRispostaFalso}>FALSO ✗</span>
                                    <p style={S.solText}>
                                        Il <strong>Teorema di Weierstrass</strong> richiede un intervallo <em>chiuso e limitato</em> [a,b]. Su un intervallo <em>aperto</em> la funzione può non raggiungere massimo o minimo (es. <L s="$f(x)=x$" /> su <L s="$(0,1)$" />).
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. Discontinuità eliminabile → limite finito in x=a</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>
                                        Per definizione, la discontinuità si dice <em>eliminabile</em> (1ª specie) se e solo se <L s="$\lim_{x\to a} f(x) = L \in \mathbb{R}$" /> (limite finito), ma <L s="$f(a) \neq L$" /> oppure <L s="$f(a)$" /> non è definita.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. Valori di segno opposto in due punti → zero sicuro</span>
                                    <span style={S.solRispostaFalso}>FALSO ✗</span>
                                    <p style={S.solText}>
                                        Il <strong>Teorema degli Zeri (Bolzano)</strong> richiede che la funzione sia <em>continua</em> nell'intervallo. Senza continuità non è garantita l'esistenza dello zero: la funzione potrebbe "saltare" da valori negativi a positivi senza mai passare per zero.
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. Asintoto verticale x=a → almeno un limite infinito</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>
                                        Per definizione, <L s="$x = a$" /> è asintoto verticale se <L s="$\lim_{x \to a^+} f(x) = \pm\infty$" /> oppure <L s="$\lim_{x \to a^-} f(x) = \pm\infty$" /> (o entrambi).
                                    </p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>5. Funzione continua su aperto limitato → max e min assoluti</span>
                                    <span style={S.solRispostaFalso}>FALSO ✗</span>
                                    <p style={S.solText}>
                                        Come per l'affermazione 1: il Teorema di Weierstrass vale su <strong>intervalli chiusi e limitati</strong> [a,b]. Su un aperto limitato (a,b) la funzione continua non è garantita a raggiungere massimo e minimo assoluti (potrebbe tendere a valori arbitrariamente grandi/piccoli avvicinandosi agli estremi).
                                    </p>
                                </div>
                            </div>

                            {/* ─── Es.2 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 2 – Singolarità dal grafico</div>

                                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                                    <img
                                        src={`${import.meta.env.BASE_URL}grafico_singolarita.png`}
                                        alt="Grafico singolarità"
                                        style={{ maxWidth: 220, border: "1px solid #e2e8f0", borderRadius: 4 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 280 }}>
                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>Punto x = 0 — discontinuità eliminabile</span>
                                            <div style={S.solStep}>
                                                <p style={{ marginBottom: 4, fontSize: 13 }}>
                                                    • Il cerchio <strong>pieno</strong> (●) si trova <em>sopra</em> la curva: la funzione è definita in <L s="$x=0$" /> ma il suo valore <L s="$f(0)$" /> è diverso dal limite.
                                                </p>
                                                <p style={{ fontSize: 13 }}>
                                                    • Il limite <L s="$\lim_{x\to 0} f(x)$" /> esiste ed è finito, ma <L s="$\lim_{x\to 0} f(x) \neq f(0)$" />:
                                                </p>
                                                <DisplayMath>{"\\Rightarrow \\textbf{discontinuità eliminabile} \\text{ in } x=0"}</DisplayMath>
                                            </div>
                                        </div>

                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>Punto x = 1 — discontinuità di 1ª specie (salto)</span>
                                            <div style={S.solStep}>
                                                <p style={{ marginBottom: 4, fontSize: 13 }}>
                                                    • Il cerchio <strong>aperto</strong> (○) sulla curva sinistra indica che il <strong>limite sinistro</strong> <L s="$\lim_{x\to 1^-} f(x)$" /> esiste ma il punto non appartiene al grafico.
                                                </p>
                                                <p style={{ marginBottom: 4, fontSize: 13 }}>
                                                    • Il cerchio <strong>pieno</strong> (●) a <L s="$y=0$" /> indica che <L s="$f(1) = 0$" /> e la curva destra parte da quel punto.
                                                </p>
                                                <p style={{ fontSize: 13 }}>
                                                    • Poiché <L s="$\lim_{x\to 1^-} f(x) \neq \lim_{x\to 1^+} f(x)$" />, i limiti laterali esistono finiti ma sono <strong>diversi</strong>:
                                                </p>
                                                <DisplayMath>{"\\Rightarrow \\text{discontinuità di } \\mathbf{1^a\\text{ specie}} \\text{ (salto)}"}</DisplayMath>
                                            </div>
                                        </div>

                                        <div style={S.solDomanda}>
                                            <span style={S.solLabel}>Criterio generale di classificazione</span>
                                            <div style={S.solStep}>
                                                <p style={{ fontSize: 12, lineHeight: 1.8, color: "#475569" }}>
                                                    • <strong>Eliminabile</strong>: ∃ lim finito ≠ f(a), oppure f(a) non definita. Sul grafico: "buco" con punto altrove.<br />
                                                    • <strong>Salto (1ª specie)</strong>: i due limiti laterali esistono finiti ma sono diversi. Sul grafico: due rami che finiscono ad altezze diverse.<br />
                                                    • <strong>2ª specie (essenziale)</strong>: almeno un limite laterale è ±∞ o non esiste. Sul grafico: asintoto verticale o oscillazione.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.3 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 3 – Singolarità analitiche</div>

                                {/* a) */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$f(x)=\dfrac{x^2-4}{x-2}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>i) Dominio:</p>
                                        <DisplayMath>{"\\text{Dom}(f) = \\mathbb{R}\\setminus\\{2\\}"}</DisplayMath>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>ii) Punto critico: x = 2</p>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>iii) Limite:</p>
                                        <DisplayMath>{"\\lim_{x\\to 2}\\frac{x^2-4}{x-2}=\\lim_{x\\to 2}\\frac{(x-2)(x+2)}{x-2}=\\lim_{x\\to 2}(x+2)=4"}</DisplayMath>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>iv) Classificazione:</p>
                                        <p style={{ fontSize: 13 }}>Il limite esiste ed è finito (<L s="$L=4$" />), ma <L s="$f(2)$" /> non è definita.</p>
                                        <DisplayMath>{"\\Rightarrow \\textbf{discontinuità eliminabile} \\text{ in } x=2"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b" }}>Prolungamento per continuità: <L s="$F(2)=4$" />.</p>
                                    </div>
                                </div>

                                {/* b) */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$g(x)=\dfrac{x^2-1}{x^2+3x-4}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>i) Dominio — fattorizzo il denominatore:</p>
                                        <DisplayMath>{"x^2+3x-4=(x+4)(x-1) \\quad\\Rightarrow\\quad \\text{Dom}(g)=\\mathbb{R}\\setminus\\{-4,\\,1\\}"}</DisplayMath>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>ii–iii) Punti critici x = 1 e x = −4:</p>
                                        <DisplayMath>{"g(x)=\\frac{(x-1)(x+1)}{(x-1)(x+4)}=\\frac{x+1}{x+4} \\quad (x\\neq 1)"}</DisplayMath>
                                        <DisplayMath>{"\\lim_{x\\to 1}g(x)=\\frac{1+1}{1+4}=\\frac{2}{5} \\quad \\text{(limite finito, }g(1)\\text{ non def.)} \\quad\\Rightarrow \\textbf{eliminabile}"}</DisplayMath>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13, marginTop: 8 }}>In x = −4: il numeratore <L s="$(-4)^2-1=15\neq 0$" />, denominatore → 0:</p>
                                        <DisplayMath>{"\\lim_{x\\to -4^+}g(x)=-\\infty \\qquad \\lim_{x\\to -4^-}g(x)=+\\infty"}</DisplayMath>
                                        <p style={{ fontSize: 13 }}>(I limiti laterali sono infiniti di segno opposto.)</p>
                                        <DisplayMath>{"\\Rightarrow \\textbf{discontinuità di }\\mathbf{2^a}\\textbf{ specie} \\text{ in } x=-4 \\text{ (asintoto verticale)}"}</DisplayMath>
                                    </div>
                                </div>

                                {/* c) */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*c) <L s="$h(x)=\dfrac{1}{(x+1)^2}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>i) Dominio:</p>
                                        <DisplayMath>{"\\text{Dom}(h)=\\mathbb{R}\\setminus\\{-1\\}"}</DisplayMath>
                                        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>iii) Limite in x = −1:</p>
                                        <DisplayMath>{"\\lim_{x\\to -1}\\frac{1}{(x+1)^2}=+\\infty"}</DisplayMath>
                                        <p style={{ fontSize: 13 }}>Il denominatore <L s="$(x+1)^2 \to 0^+$" /> per qualsiasi lato, quindi il limite è <L s="$+\infty$" /> da entrambi i lati.</p>
                                        <DisplayMath>{"\\Rightarrow \\textbf{discontinuità di }\\mathbf{2^a}\\textbf{ specie}\\text{ in }x=-1 \\text{ (asintoto verticale } x=-1\\text{)}"}</DisplayMath>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.4 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 4 – Asintoti</div>

                                {/* a) */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) <L s="$f(x)=\dfrac{2x+3}{x-1}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Dom: <L s="$\mathbb{R}\setminus\{1\}$" /></p>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Asintoto verticale x = 1:</p>
                                        <DisplayMath>{"\\lim_{x\\to 1^+}\\frac{2x+3}{x-1}=\\frac{5}{0^+}=+\\infty \\qquad \\lim_{x\\to 1^-}\\frac{2x+3}{x-1}=\\frac{5}{0^-}=-\\infty"}</DisplayMath>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Asintoto orizzontale:</p>
                                        <DisplayMath>{"\\lim_{x\\to\\pm\\infty}\\frac{2x+3}{x-1}=2 \\quad\\Rightarrow\\quad y=2"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b" }}>Nessun asintoto obliquo (esiste già quello orizzontale).</p>
                                    </div>
                                </div>

                                {/* b) */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) <L s="$g(x)=\dfrac{x^2+1}{x}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Dom: <L s="$\mathbb{R}\setminus\{0\}$" /></p>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Asintoto verticale x = 0:</p>
                                        <DisplayMath>{"\\lim_{x\\to 0^+}\\frac{x^2+1}{x}=+\\infty \\qquad \\lim_{x\\to 0^-}\\frac{x^2+1}{x}=-\\infty"}</DisplayMath>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Asintoto orizzontale:</p>
                                        <DisplayMath>{"\\lim_{x\\to\\pm\\infty}\\frac{x^2+1}{x}=\\pm\\infty \\quad\\Rightarrow\\quad \\text{nessun asintoto orizzontale}"}</DisplayMath>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>*Asintoto obliquo — calcolo m e q:</p>
                                        <DisplayMath>{"m=\\lim_{x\\to\\infty}\\frac{g(x)}{x}=\\lim_{x\\to\\infty}\\frac{x^2+1}{x^2}=1"}</DisplayMath>
                                        <DisplayMath>{"q=\\lim_{x\\to\\infty}\\bigl[g(x)-x\\bigr]=\\lim_{x\\to\\infty}\\frac{x^2+1}{x}-x=\\lim_{x\\to\\infty}\\frac{x^2+1-x^2}{x}=\\lim_{x\\to\\infty}\\frac{1}{x}=0"}</DisplayMath>
                                        <DisplayMath>{"\\Rightarrow\\quad y=x \\quad \\text{(asintoto obliquo)}"}</DisplayMath>
                                    </div>
                                </div>

                                {/* c) */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>*c) <L s="$h(x)=\dfrac{3x^2-2}{x^2+1}$" /></span>
                                    <div style={S.solStep}>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Dom: <L s="$\mathbb{R}$" /> (il denominatore <L s="$x^2+1\geq 1>0$" /> per ogni <L s="$x$" />)</p>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Asintoti verticali: <span style={{ fontWeight: 400 }}>nessuno (h è continua su tutto ℝ)</span></p>
                                        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Asintoto orizzontale:</p>
                                        <DisplayMath>{"\\lim_{x\\to\\pm\\infty}\\frac{3x^2-2}{x^2+1}=3 \\quad\\Rightarrow\\quad y=3"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b" }}>Nessun asintoto obliquo: il grado del numeratore è uguale a quello del denominatore, quindi il limite <L s="$g(x)/x \to 0$" /> e non si ha asintoto obliquo.</p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.5 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 5 – Continuità con parametro</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>Determinare k affinché f sia continua in x = 2</span>
                                    <p style={S.solText}>
                                        Per la continuità in <L s="$x=2$" /> devono essere verificate contemporaneamente:
                                    </p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 6 }}><strong>1. Valore della funzione in x = 2</strong> (si usa la seconda formula, valida per <L s="$x\geq 2$" />):</p>
                                        <DisplayMath>{"f(2)=k\\cdot 2-1=2k-1"}</DisplayMath>

                                        <p style={{ fontSize: 13, marginBottom: 6, marginTop: 8 }}><strong>2. Limite sinistro</strong> (si usa la prima formula, valida per <L s="$x<2$" />):</p>
                                        <DisplayMath>{"\\lim_{x\\to 2^-}f(x)=\\lim_{x\\to 2^-}(x+3)=2+3=5"}</DisplayMath>

                                        <p style={{ fontSize: 13, marginBottom: 6, marginTop: 8 }}><strong>3. Limite destro</strong>:</p>
                                        <DisplayMath>{"\\lim_{x\\to 2^+}f(x)=\\lim_{x\\to 2^+}(kx-1)=2k-1=f(2)"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b" }}>(Il limite destro coincide già con il valore: condizione automaticamente soddisfatta.)</p>

                                        <p style={{ fontSize: 13, marginBottom: 6, marginTop: 8 }}><strong>4. Condizione di continuità</strong> — limite sinistro = valore:</p>
                                        <DisplayMath>{"5 = 2k-1 \\quad\\Rightarrow\\quad 2k=6 \\quad\\Rightarrow\\quad \\boxed{k=3}"}</DisplayMath>

                                        <p style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>Verifica:</p>
                                        <DisplayMath>{"f(x)=\\begin{cases}x+3 & x<2\\\\ 3x-1 & x\\geq 2\\end{cases}"}</DisplayMath>
                                        <DisplayMath>{"\\lim_{x\\to 2^-}(x+3)=5 \\qquad f(2)=3\\cdot2-1=5 \\qquad \\lim_{x\\to 2^+}(3x-1)=5 \\quad\\checkmark"}</DisplayMath>
                                    </div>
                                </div>
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
                        Liceo Economico Sociale · Matematica · Continuità e Asintoti · Classe 5I · Giovanni Ugolini
                    </div>
                </div>
            </div>
        </>
    );
}

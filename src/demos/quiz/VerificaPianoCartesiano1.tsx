/**
 * VerificaPianoCartesiano1 – Verifica scritta: Piano Cartesiano e Retta
 * Liceo – Classe 2B – Matematica – San Giovanni Valdarno
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

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

function SubEs({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
    const starred = label.startsWith("*");
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                    fontFamily: "system-ui, sans-serif",
                    color: starred ? "#7c3aed" : "#1e293b",
                }}>
                    {label}
                </span>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b" }}>{children}</div>
            </div>
        </div>
    );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function VerificaPianoCartesiano1(): React.ReactElement {
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
                            Liceo — Classe 2B — San Giovanni Valdarno
                        </div>
                        <div style={S.title}>Verifica di Matematica</div>
                        <div style={S.disciplina}>Piano Cartesiano e Retta · Disequazioni Fratte — Simulazione</div>

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

                    {/* ════════ Es.1 – Vero o Falso ════════ */}
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
                            Due punti distinti del piano determinano una e una sola retta.
                        </VFItem>
                        <VFItem num="2.">
                            La distanza tra <L s="$A(1,\,0)$" /> e <L s="$B(0,\,1)$" /> è uguale a <L s="$1$" />.
                        </VFItem>
                        <VFItem num="3.">
                            Il punto medio del segmento di estremi <L s="$A(0,\,0)$" /> e <L s="$B(4,\,6)$" /> è <L s="$M(2,\,4)$" />.
                        </VFItem>
                        <VFItem num="4.">
                            Una retta con coefficiente angolare <L s="$m < 0$" /> è decrescente da sinistra a destra.
                        </VFItem>
                        <VFItem num="5.">
                            L'equazione <L s="$x = 3$" /> rappresenta una retta parallela all'asse <L s="$y$" />.
                        </VFItem>

                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 13, color: "#475569", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>Motivazioni:</div>
                            <Righe n={5} h={34} />
                        </div>
                    </div>

                    {/* ════════ Es.2 – Punti nel piano ════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 2 — Punti nel piano cartesiano
                            <span style={S.punti}>(punti 16)</span>
                        </div>

                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 14 }}>
                            Considera i punti <L s="$A(3,\,2)$" />, <L s="$B(-2,\,1)$" />, <L s="$C(-1,\,-3)$" />, <L s="$D(4,\,-2)$" />.
                        </p>

                        <SubEs label="a)">Indica il quadrante di ciascun punto.</SubEs>
                        <Righe n={2} h={36} />

                        <SubEs label="b)">Quali punti hanno <em>ascissa positiva</em>?</SubEs>
                        <Righe n={1} h={36} />

                        <SubEs label="c)">Quali punti hanno <em>ordinata negativa</em>?</SubEs>
                        <Righe n={1} h={36} />

                        <SubEs label="d)">Quale punto si trova più vicino all'asse <L s="$x$" />? (motiva)</SubEs>
                        <Righe n={2} h={36} />
                    </div>

                    {/* ════════ Es.3 – Rette nel piano (figura) ════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 3 — Rette nel piano cartesiano (figura)
                            <span style={S.punti}>(punti 14)</span>
                        </div>

                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 14 }}>
                            Osserva la figura. Associa a ogni retta (<L s="$a,\,b,\,c,\,d$" />) l'equazione corrispondente tra le quattro proposte. Motiva la risposta.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                            <img
                                src={`${import.meta.env.BASE_URL}rette_piano_cartesiano_simulazione.png`}
                                alt="Quattro rette nel piano cartesiano"
                                style={{ maxWidth: "100%", border: "1px solid #e2e8f0", borderRadius: 4 }}
                            />
                        </div>

                        <SubEs label="a)">Retta <L s="$a$" />: equazione n. ___ — Motivazione:</SubEs>
                        <Righe n={2} h={36} />

                        <SubEs label="b)">Retta <L s="$b$" />: equazione n. ___ — Motivazione:</SubEs>
                        <Righe n={2} h={36} />

                        <SubEs label="c)">Retta <L s="$c$" />: equazione n. ___ — Motivazione:</SubEs>
                        <Righe n={2} h={36} />

                        <SubEs label="d)">Retta <L s="$d$" />: equazione n. ___ — Motivazione:</SubEs>
                        <Righe n={2} h={36} />
                    </div>

                    {/* ════════ Es.4 – Distanza e punto medio ════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 4 — Distanza tra due punti e punto medio
                            <span style={S.punti}>(punti 20)</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                            <div>
                                <SubEs label="a)">
                                    Calcola la distanza tra <L s="$A(1,\,2)$" /> e <L s="$B(5,\,2)$" />.
                                </SubEs>
                                <Righe n={3} h={40} />
                            </div>
                            <div>
                                <SubEs label="b)">
                                    Calcola la distanza tra <L s="$C(0,\,0)$" /> e <L s="$D(3,\,4)$" />.
                                </SubEs>
                                <Righe n={3} h={40} />
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <SubEs label="c)">
                                    Trova il punto medio di <L s="$E(2,\,4)$" /> e <L s="$F(6,\,8)$" />.
                                </SubEs>
                                <Righe n={3} h={40} />
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <SubEs label="d)">
                                    Trova il punto medio di <L s="$G(-3,\,5)$" /> e <L s="$H(1,\,-1)$" />.
                                </SubEs>
                                <Righe n={3} h={40} />
                            </div>
                        </div>
                    </div>

                    {/* ════════ Es.5 – Equazione della retta ════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 5 — Equazione della retta
                            <span style={S.punti}>(punti 20)</span>
                        </div>

                        <SubEs label="a)">
                            Calcola il coefficiente angolare della retta passante per <L s="$A(1,\,1)$" /> e <L s="$B(3,\,5)$" />.
                        </SubEs>
                        <Righe n={3} h={40} />

                        <SubEs label="b)">
                            Scrivi l'equazione della retta passante per <L s="$A(1,\,1)$" /> con il coefficiente angolare trovato al punto a).
                        </SubEs>
                        <Righe n={3} h={40} />

                        <SubEs label="c)">
                            Verifica se il punto <L s="$P(2,\,3)$" /> appartiene alla retta trovata al punto b).
                        </SubEs>
                        <Righe n={2} h={40} />
                    </div>

                    {/* ════════ Es.6 – Disequazione fratta ════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>
                            Esercizio 6 — Disequazione fratta
                            <span style={S.punti}>(punti 20)</span>
                        </div>

                        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 10 }}>
                            Risolvi la seguente disequazione fratta.
                        </p>

                        <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
                            <DisplayMath>{"\\dfrac{x+1}{x-2} < 0"}</DisplayMath>
                        </div>

                        <Righe n={6} h={40} />
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
                                    <span style={S.solLabel}>1. Due punti distinti → una sola retta</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>È un assioma della geometria euclidea: per due punti distinti passa una e una sola retta.</p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>2. Distanza A(1,0) – B(0,1) = 1</span>
                                    <span style={S.solRispostaFalso}>FALSO ✗</span>
                                    <p style={S.solText}>Applicando la formula della distanza:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"d = \\sqrt{(0-1)^2+(1-0)^2} = \\sqrt{1+1} = \\sqrt{2} \\approx 1{,}41 \\neq 1"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>3. Punto medio A(0,0) e B(4,6) = M(2,4)</span>
                                    <span style={S.solRispostaFalso}>FALSO ✗</span>
                                    <p style={S.solText}>Il punto medio si calcola come media delle coordinate:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"M = \\left(\\frac{0+4}{2},\\;\\frac{0+6}{2}\\right) = (2,\\;3) \\neq (2,\\;4)"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>4. m &lt; 0 → retta decrescente</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}>Il coefficiente angolare <L s="$m$" /> misura la pendenza: se <L s="$m < 0$" />, al crescere di <L s="$x$" /> il valore di <L s="$y$" /> diminuisce, quindi la retta è decrescente.</p>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>5. x = 3 è parallela all'asse y</span>
                                    <span style={S.solRisposta}>VERO ✓</span>
                                    <p style={S.solText}><L s="$x = 3$" /> è l'insieme di tutti i punti con ascissa uguale a 3: forma una retta verticale, parallela all'asse <L s="$y$" />.</p>
                                </div>
                            </div>

                            {/* ─── Es.2 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 2 – Punti nel piano</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>Punti: A(3, 2), B(−2, 1), C(−1, −3), D(4, −2)</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 6 }}><strong>a) Quadranti:</strong></p>
                                        <table style={{ borderCollapse: "collapse", fontSize: 13, marginBottom: 10 }}>
                                            <thead>
                                                <tr>
                                                    {["Punto", "x", "y", "Quadrante"].map(h => (
                                                        <th key={h} style={{ border: "1px solid #e2e8f0", padding: "4px 12px", background: "#f8fafc", fontWeight: 700 }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    ["A(3, 2)", "+ ", "+", "I"],
                                                    ["B(−2, 1)", "−", "+", "II"],
                                                    ["C(−1, −3)", "−", "−", "III"],
                                                    ["D(4, −2)", "+", "−", "IV"],
                                                ].map(([p, x, y, q]) => (
                                                    <tr key={p}>
                                                        {[p, x, y, q].map((v, i) => (
                                                            <td key={i} style={{ border: "1px solid #e2e8f0", padding: "4px 12px", textAlign: "center" }}>{v}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <p style={{ fontSize: 13, marginBottom: 4 }}><strong>b) Ascissa positiva</strong> (x &gt; 0): <span style={{ color: "#15803d", fontWeight: 700 }}>A e D</span></p>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}><strong>c) Ordinata negativa</strong> (y &lt; 0): <span style={{ color: "#15803d", fontWeight: 700 }}>C e D</span></p>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}><strong>d) Più vicino all'asse x</strong> — si confrontano i valori assoluti delle ordinate:</p>
                                        <DisplayMath>{"|y_A|=2,\\quad |y_B|=1,\\quad |y_C|=3,\\quad |y_D|=2"}</DisplayMath>
                                        <p style={{ fontSize: 13 }}>Il minimo è <L s="$|y_B|=1$" />, quindi il punto più vicino all'asse <L s="$x$" /> è <strong>B(−2, 1)</strong>.</p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.3 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 3 – Rette nel piano cartesiano (figura)</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>Associazione rette ↔ equazioni</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 8 }}>
                                            Le quattro equazioni proposte nella figura sono:<br />
                                            <strong>1.</strong> <L s="$y = \tfrac{1}{2}x - 2$" /> &nbsp;
                                            <strong>2.</strong> <L s="$y = 2x - 1$" /> &nbsp;
                                            <strong>3.</strong> <L s="$y = -2x + 3$" /> &nbsp;
                                            <strong>4.</strong> <L s="$y = -\tfrac{1}{2}x + 2$" />
                                        </p>
                                        <table style={{ borderCollapse: "collapse", fontSize: 13, marginBottom: 10 }}>
                                            <thead>
                                                <tr>
                                                    {["Retta", "Equazione", "Motivazione"].map(h => (
                                                        <th key={h} style={{ border: "1px solid #e2e8f0", padding: "4px 12px", background: "#f8fafc", fontWeight: 700 }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", textAlign: "center", fontWeight: 700 }}>a</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px" }}><L s="$y = 2x - 1$" /> (n. 2)</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", fontSize: 12 }}>pendenza positiva ripida (<L s="$m=2$" />), intercetta <L s="$y=-1$" /></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", textAlign: "center", fontWeight: 700 }}>b</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px" }}><L s="$y = -\tfrac{1}{2}x + 2$" /> (n. 4)</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", fontSize: 12 }}>pendenza negativa lieve (<L s="$m=-\tfrac{1}{2}$" />), intercetta <L s="$y=2$" /></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", textAlign: "center", fontWeight: 700 }}>c</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px" }}><L s="$y = -2x + 3$" /> (n. 3)</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", fontSize: 12 }}>pendenza negativa ripida (<L s="$m=-2$" />), intercetta <L s="$y=3$" /></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", textAlign: "center", fontWeight: 700 }}>d</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px" }}><L s="$y = \tfrac{1}{2}x - 2$" /> (n. 1)</td>
                                                    <td style={{ border: "1px solid #e2e8f0", padding: "4px 12px", fontSize: 12 }}>pendenza positiva lieve (<L s="$m=\tfrac{1}{2}$" />), intercetta <L s="$y=-2$" /></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <p style={{ fontSize: 12, color: "#64748b" }}>
                                            Per identificare ogni retta: si osserva il <strong>segno del coefficiente angolare</strong> (retta crescente o decrescente) e la sua <strong>inclinazione</strong> (pendenza ripida o lieve), poi si verifica l'intercetta con l'asse <L s="$y$" />.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.4 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 4 – Distanza e punto medio</div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>a) d(A(1,2), B(5,2))</span>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"d = \\sqrt{(5-1)^2+(2-2)^2} = \\sqrt{16+0} = \\sqrt{16} = 4"}</DisplayMath>
                                            <p style={{ fontSize: 12, color: "#64748b" }}>(I punti hanno la stessa ordinata: è un segmento orizzontale.)</p>
                                        </div>
                                    </div>

                                    <div style={S.solDomanda}>
                                        <span style={S.solLabel}>b) d(C(0,0), D(3,4))</span>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"d = \\sqrt{(3-0)^2+(4-0)^2} = \\sqrt{9+16} = \\sqrt{25} = 5"}</DisplayMath>
                                            <p style={{ fontSize: 12, color: "#64748b" }}>(Terna pitagorica 3-4-5.)</p>
                                        </div>
                                    </div>

                                    <div style={{ ...S.solDomanda, marginTop: 8 }}>
                                        <span style={S.solLabel}>c) Punto medio E(2,4) e F(6,8)</span>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"M = \\left(\\frac{2+6}{2},\\;\\frac{4+8}{2}\\right) = (4,\\;6)"}</DisplayMath>
                                        </div>
                                    </div>

                                    <div style={{ ...S.solDomanda, marginTop: 8 }}>
                                        <span style={S.solLabel}>d) Punto medio G(−3,5) e H(1,−1)</span>
                                        <div style={S.solStep}>
                                            <DisplayMath>{"M = \\left(\\frac{-3+1}{2},\\;\\frac{5+(-1)}{2}\\right) = (-1,\\;2)"}</DisplayMath>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.5 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 5 – Equazione della retta</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Coefficiente angolare — A(1,1) e B(3,5)</span>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"m = \\frac{y_B - y_A}{x_B - x_A} = \\frac{5-1}{3-1} = \\frac{4}{2} = 2"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Equazione della retta per A(1,1) con m = 2</span>
                                    <p style={S.solText}>Si usa la formula <L s="$y - y_1 = m(x - x_1)$" />:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"y - 1 = 2(x - 1) \\quad\\Rightarrow\\quad y = 2x - 2 + 1 \\quad\\Rightarrow\\quad \\boxed{y = 2x - 1}"}</DisplayMath>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) Il punto P(2, 3) appartiene a y = 2x − 1?</span>
                                    <p style={S.solText}>Si sostituisce <L s="$x = 2$" /> nell'equazione e si verifica se si ottiene <L s="$y = 3$" />:</p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"y = 2(2) - 1 = 4 - 1 = 3 \\quad \\Rightarrow \\quad 3 = 3 \\;\\checkmark"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4, fontWeight: 600, color: "#15803d" }}>SÌ — P(2, 3) appartiene alla retta.</p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Es.6 ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Esercizio 6 – Disequazione fratta</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>Disequazione: (x+1)/(x−2) &lt; 0</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>a) Radici critiche:</p>
                                        <p style={{ fontSize: 13, marginBottom: 2 }}>Numeratore: <L s="$x+1=0 \;\Rightarrow\; x=-1$" /> (la frazione si annulla)</p>
                                        <p style={{ fontSize: 13, marginBottom: 8 }}>Denominatore: <L s="$x-2=0 \;\Rightarrow\; x=2$" /> — <strong>escluso dal dominio</strong> (<L s="$x \neq 2$" />)</p>

                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>b) Schema dei segni completato:</p>
                                        <table style={{ borderCollapse: "collapse", fontSize: 12, marginBottom: 10, fontFamily: "system-ui, sans-serif" }}>
                                            <thead>
                                                <tr>
                                                    {["Fattore", "x < −1", "x = −1", "−1 < x < 2", "x = 2", "x > 2"].map(h => (
                                                        <th key={h} style={{ border: "1px solid #94a3b8", padding: "4px 10px", background: "#f1f5f9", textAlign: "center" }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px" }}><L s="$x+1$" /> (num.)</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#dc2626", fontWeight: 700 }}>−</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", background: "#dbeafe", fontWeight: 700 }}>0</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#15803d", fontWeight: 700 }}>+</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", background: "#fef3c7" }}>+</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#15803d", fontWeight: 700 }}>+</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px" }}><L s="$x-2$" /> (den.)</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#dc2626", fontWeight: 700 }}>−</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", background: "#dbeafe" }}>−</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#dc2626", fontWeight: 700 }}>−</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", background: "#fef3c7", fontWeight: 700, color: "#92400e" }}>✗</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#15803d", fontWeight: 700 }}>+</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", fontWeight: 700 }}>Frazione</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#15803d", fontWeight: 700 }}>+</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", background: "#dbeafe", fontWeight: 700 }}>0</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#dc2626", fontWeight: 700, background: "#fee2e2" }}>−  ✓</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", background: "#fef3c7", fontWeight: 700, color: "#92400e" }}>✗</td>
                                                    <td style={{ border: "1px solid #94a3b8", padding: "6px 10px", textAlign: "center", color: "#15803d", fontWeight: 700 }}>+</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>*c) Soluzione:</p>
                                        <p style={{ fontSize: 13, marginBottom: 4 }}>La frazione è negativa nell'intervallo <L s="$(-1,\,2)$" />. Poiché la disequazione è stretta (<L s="$< 0$" />), entrambi gli estremi sono <strong>esclusi</strong>:</p>
                                        <DisplayMath>{"x \\in (-1,\\;2)"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                            In forma di doppia disuguaglianza: <L s="$-1 < x < 2$" />
                                        </p>
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
                        Liceo · Matematica · Piano Cartesiano e Retta · Disequazioni Fratte · Classe 2B · Giovanni Ugolini
                    </div>
                </div>
            </div>
        </>
    );
}

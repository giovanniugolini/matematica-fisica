/**
 * VerificaFisicaVettori1 - Verifica scritta su Vettori e Forze
 * Liceo Linguistico – Classe 3ª – Fisica – 05/03/2026
 */

import React, { useState } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

// ─── Helper: LaTeX inline via attributo (evita problemi JSX con {}) ────────────
function L({ s }: { s: string }): React.ReactElement {
    return <MixedLatex>{s}</MixedLatex>;
}

// ─── Stili costanti ────────────────────────────────────────────────────────────

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

    bulletList: {
        marginLeft: 24,
        marginTop: 6,
        marginBottom: 8,
    } as React.CSSProperties,

    bulletItem: {
        fontSize: 14,
        lineHeight: 1.7,
        color: "#1e293b",
        marginBottom: 3,
    } as React.CSSProperties,

    mcOption: {
        display: "block",
        fontSize: 14,
        color: "#1e293b",
        marginBottom: 3,
        paddingLeft: 16,
    } as React.CSSProperties,

    rigaRisposta: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 8,
        fontSize: 13,
        color: "#475569",
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,

    linea: {
        flex: 1,
        borderBottom: "1px solid #94a3b8",
        minWidth: 80,
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

// ─── Componente principale ─────────────────────────────────────────────────────

export default function VerificaFisicaVettori1(): React.ReactElement {
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
                        <div style={S.istituto}>Liceo Linguistico — Classe 3ª</div>
                        <div style={S.title}>Verifica di Fisica</div>
                        <div style={S.disciplina}>Vettori e Forze</div>
                        <div style={S.metaRow}>
                            <span>Tempo: 60 minuti</span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE A – Domande a risposta aperta
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte A – Domande a risposta aperta</div>

                        {/* A.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>
                                Spiega che cos'è una <strong>grandezza vettoriale</strong> e fai almeno due esempi.
                                Descrivi le caratteristiche di un vettore:
                            </p>
                            <ul style={S.bulletList}>
                                <li style={S.bulletItem}>modulo;</li>
                                <li style={S.bulletItem}>direzione;</li>
                                <li style={S.bulletItem}>verso.</li>
                            </ul>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>

                        {/* A.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Spiega la differenza tra <strong>massa</strong> e <strong>peso</strong>.
                                Qual è la relazione che lega queste due grandezze? Scrivi la formula e definisci ciascun termine.
                            </p>
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1", marginTop: 8 }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                            <div style={{ height: 80, borderBottom: "1px dashed #cbd5e1" }} />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE B – Risposta multipla con motivazione
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte B – Domande a risposta multipla (motivare)</div>
                        <p style={S.istruzione}>
                            Per ogni domanda: indica la risposta corretta e motiva brevemente la scelta.
                        </p>

                        {/* B.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>
                                Due vettori perpendicolari hanno moduli <L s="$A = 3\,\text{u}$" /> e{" "}
                                <L s="$B = 4\,\text{u}$" />.
                                Il modulo del vettore risultante è:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$7\,\text{u}$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$5\,\text{u}$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$1\,\text{u}$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$12\,\text{u}$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>La forza peso di un corpo sulla Terra:</p>
                            <span style={S.mcOption}><strong>A.</strong> è uguale alla sua massa</span>
                            <span style={S.mcOption}><strong>B.</strong> dipende dall'accelerazione di gravità <L s="$g$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> è costante in tutto l'universo</span>
                            <span style={S.mcOption}><strong>D.</strong> non ha direzione né verso</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.c */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>c)</span>
                            <p style={S.domandaText}>Se raddoppio la massa di un oggetto, il suo peso:</p>
                            <span style={S.mcOption}><strong>A.</strong> rimane uguale</span>
                            <span style={S.mcOption}><strong>B.</strong> si dimezza</span>
                            <span style={S.mcOption}><strong>C.</strong> raddoppia</span>
                            <span style={S.mcOption}><strong>D.</strong> diventa quattro volte maggiore</span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>

                        <div style={{ height: 16 }} />

                        {/* B.d */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>d)</span>
                            <p style={S.domandaText}>
                                Le componenti cartesiane di un vettore <L s="$\vec{F}$" /> sono{" "}
                                <L s="$F_x = 100\,\text{N}$" /> e <L s="$F_y = 100\,\text{N}$" />.
                                L'angolo che il vettore forma con l'asse <L s="$x$" /> è:
                            </p>
                            <span style={S.mcOption}><strong>A.</strong> <L s="$30°$" /></span>
                            <span style={S.mcOption}><strong>B.</strong> <L s="$60°$" /></span>
                            <span style={S.mcOption}><strong>C.</strong> <L s="$45°$" /></span>
                            <span style={S.mcOption}><strong>D.</strong> <L s="$90°$" /></span>
                            <RigaRisposta />
                            <RigaMotivazione />
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        PARTE C – Esercizi
                    ════════════════════════════════════ */}
                    <div style={S.parte}>
                        <div style={S.parteTitle}>Parte C – Esercizi</div>

                        {/* C.a */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>a)</span>
                            <p style={S.domandaText}>Su un oggetto agiscono contemporaneamente due forze:</p>
                            <ul style={S.bulletList}>
                                <li style={S.bulletItem}>
                                    <L s="$\vec{F}_1$" /> con modulo <L s="$50\,\text{N}$" /> e angolo di{" "}
                                    <L s="$30°$" /> rispetto all'asse <L s="$x$" /> positivo;
                                </li>
                                <li style={S.bulletItem}>
                                    <L s="$\vec{F}_2$" /> con modulo <L s="$120\,\text{N}$" /> e angolo di{" "}
                                    <L s="$70°$" /> al di <em>sotto</em> dell'asse <L s="$x$" /> positivo.
                                </li>
                            </ul>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola le componenti cartesiane <L s="$F_x$" /> e{" "}
                                    <L s="$F_y$" /> di ciascuna forza.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Determina il modulo e la direzione della forza risultante{" "}
                                    <L s="$\vec{R} = \vec{F}_1 + \vec{F}_2$" />.
                                </p>
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 64, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> Disegna i due vettori e il vettore risultante su un piano cartesiano.
                                </p>
                                <div style={{ height: 100, border: "1px dashed #cbd5e1", borderRadius: 4 }} />
                            </div>
                        </div>

                        <div style={{ height: 24 }} />

                        {/* C.b */}
                        <div style={S.domanda}>
                            <span style={S.domandaLabel}>b)</span>
                            <p style={S.domandaText}>
                                Un astronauta ha una massa di <L s="$80\,\text{kg}$" />.
                                Sulla Luna l'accelerazione di gravità è{" "}
                                <L s="$g_\text{Luna} = 1{,}62\,\text{N/kg}$" />,
                                mentre sulla Terra è{" "}
                                <L s="$g_\text{Terra} = 9{,}8\,\text{N/kg}$" />.
                            </p>

                            <div style={{ marginLeft: 16, marginTop: 10 }}>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginBottom: 6 }}>
                                    <strong>i.)</strong> Calcola il peso dell'astronauta sulla Terra.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>ii.)</strong> Calcola il peso dell'astronauta sulla Luna.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iii.)</strong> La massa dell'astronauta cambia andando sulla Luna? Motiva la risposta.
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />

                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b", marginTop: 12, marginBottom: 6 }}>
                                    <strong>iv.)</strong> Di quanto percentuale diminuisce il peso dell'astronauta sulla Luna rispetto alla Terra?
                                </p>
                                <div style={{ height: 56, borderBottom: "1px dashed #cbd5e1" }} />
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════
                        SEZIONE SOLUZIONI (no print)
                    ════════════════════════════════════ */}
                    {showSoluzioni && (
                        <div style={S.soluzioniSection} className="soluzioni-section no-print">
                            <div style={S.soluzioniTitle}>✅ Soluzioni e procedimenti</div>

                            {/* ─── Parte A ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte A – Risposte attese</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>a) Grandezze vettoriali</span>
                                    <p style={S.solText}>
                                        Una <strong>grandezza vettoriale</strong> è una grandezza che richiede, oltre a un valore
                                        numerico (modulo), anche una direzione e un verso per essere completamente descritta.
                                    </p>
                                    <p style={S.solText}>
                                        <strong>Esempi:</strong> forza, velocità, accelerazione, campo elettrico.
                                    </p>
                                    <p style={S.solText}>Caratteristiche del vettore <L s="$\vec{v}$" />:</p>
                                    <ul style={{ marginLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
                                        <li>
                                            <strong>Modulo:</strong> la "lunghezza" del vettore, sempre positivo
                                            (es. <L s="$|\vec{v}| = 5\,\text{m/s}$" />).
                                        </li>
                                        <li>
                                            <strong>Direzione:</strong> la retta su cui giace il vettore
                                            (es. orizzontale, verticale, a 30°).
                                        </li>
                                        <li>
                                            <strong>Verso:</strong> il senso di percorrenza lungo quella direzione
                                            (es. verso destra, verso l'alto).
                                        </li>
                                    </ul>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Massa e peso</span>
                                    <p style={S.solText}>
                                        La <strong>massa</strong> (<L s="$m$" />) è una proprietà intrinseca del corpo:
                                        misura la quantità di materia e non cambia mai, indipendentemente dalla posizione.
                                        Si misura in kg.
                                    </p>
                                    <p style={S.solText}>
                                        Il <strong>peso</strong> (<L s="$\vec{P}$" />) è una forza: è l'attrazione gravitazionale
                                        che un pianeta esercita sul corpo. Dipende da <em>dove</em> ci si trova. Si misura in N.
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"P = m \\cdot g"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 8, color: "#475569" }}>
                                            dove <L s="$m$" /> = massa [kg],{" "}
                                            <L s="$g$" /> = accelerazione di gravità
                                            (sulla Terra <L s="$g \approx 9{,}8\,\text{N/kg}$" />),{" "}
                                            <L s="$P$" /> = peso [N].
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte B ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte B – Risposta multipla</div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>
                                        a) Vettori perpendicolari A = 3 u, B = 4 u
                                    </span>
                                    <span style={S.solRisposta}>Risposta: B — 5 u</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 6 }}>
                                            Poiché i due vettori sono <strong>perpendicolari</strong>,
                                            si applica il teorema di Pitagora:
                                        </p>
                                        <DisplayMath>{"R = \\sqrt{A^2 + B^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\,\\text{u}"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                            ✗ A: 7 sarebbe la somma algebrica (valida solo se paralleli e concordi).<br />
                                            ✗ D: 12 è il prodotto dei moduli, non ha senso per la risultante.
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) La forza peso sulla Terra</span>
                                    <span style={S.solRisposta}>Risposta: B — dipende da g</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            La formula <L s="$P = mg$" /> mostra che il peso dipende da <L s="$g$" />.
                                            Il peso non è uguale alla massa (A: errore di unità),
                                            non è costante nell'universo (C: sulla Luna <L s="$g \approx 1{,}62\,\text{N/kg}$" />),
                                            ed è una forza vettoriale diretta verso il basso (D: falso).
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>c) Raddoppio della massa → peso</span>
                                    <span style={S.solRisposta}>Risposta: C — raddoppia</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            Da <L s="$P = mg$" />: se <L s="$m' = 2m$" />, allora{" "}
                                            <L s="$P' = 2m \cdot g = 2P$" />.
                                            Il peso è proporzionale alla massa: raddoppiandola, raddoppia.
                                        </p>
                                    </div>
                                </div>

                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>
                                        d) Angolo con Fx = Fy = 100 N
                                    </span>
                                    <span style={S.solRisposta}>Risposta: C — 45°</span>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, marginBottom: 6 }}>
                                            L'angolo si ricava dal rapporto delle componenti:
                                        </p>
                                        <DisplayMath>{"\\tan\\theta = \\frac{F_y}{F_x} = \\frac{100}{100} = 1 \\implies \\theta = \\arctan(1) = 45°"}</DisplayMath>
                                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                                            Quando le due componenti sono uguali, il vettore è a 45° rispetto a entrambi gli assi.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Parte C ─── */}
                            <div style={S.solParte}>
                                <div style={S.solParteTitle}>Parte C – Esercizi svolti</div>

                                {/* C.a */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>
                                        a) F₁ = 50 N a 30°, F₂ = 120 N a −70°
                                    </span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 6 }}>
                                        i) Componenti cartesiane
                                    </p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                            Forza <L s="$\vec{F}_1$" /> (angolo +30° rispetto all'asse x):
                                        </p>
                                        <DisplayMath>{"F_{1x} = 50 \\cos 30° = 50 \\times \\frac{\\sqrt{3}}{2} \\approx 43{,}3\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_{1y} = 50 \\sin 30° = 50 \\times 0{,}5 = 25{,}0\\,\\text{N}"}</DisplayMath>

                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 10 }}>
                                            Forza <L s="$\vec{F}_2$" /> (angolo −70°, sotto l'asse x):
                                        </p>
                                        <DisplayMath>{"F_{2x} = 120 \\cos 70° \\approx 120 \\times 0{,}342 \\approx 41{,}0\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"F_{2y} = -120 \\sin 70° \\approx -120 \\times 0{,}940 \\approx -112{,}8\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>
                                        ii) Forza risultante
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"R_x = 43{,}3 + 41{,}0 = 84{,}3\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"R_y = 25{,}0 + (-112{,}8) = -87{,}8\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"R = \\sqrt{84{,}3^2 + 87{,}8^2} = \\sqrt{14815} \\approx 121{,}7\\,\\text{N}"}</DisplayMath>
                                        <DisplayMath>{"\\theta = \\arctan\\!\\left(\\frac{87{,}8}{84{,}3}\\right) \\approx 46{,}1°\\text{ sotto l'asse }x"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 6 }}>
                                            ⟹ <strong>R ≈ 121,7 N</strong> a <strong>46,1° sotto l'asse x positivo</strong>
                                            (4° quadrante: <L s="$R_x > 0$" />, <L s="$R_y < 0$" />).
                                        </p>
                                    </div>
                                </div>

                                {/* C.b */}
                                <div style={S.solDomanda}>
                                    <span style={S.solLabel}>b) Astronauta: m = 80 kg</span>

                                    <p style={{ ...S.solText, fontWeight: 600, marginBottom: 4 }}>
                                        i) Peso sulla Terra
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"P_\\text{Terra} = m \\cdot g_\\text{Terra} = 80 \\times 9{,}8 = 784\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>
                                        ii) Peso sulla Luna
                                    </p>
                                    <div style={S.solStep}>
                                        <DisplayMath>{"P_\\text{Luna} = m \\cdot g_\\text{Luna} = 80 \\times 1{,}62 = 129{,}6\\,\\text{N}"}</DisplayMath>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>
                                        iii) La massa cambia?
                                    </p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13 }}>
                                            <strong>No.</strong> La massa è una proprietà intrinseca del corpo e non dipende dalla
                                            posizione. L'astronauta ha sempre <L s="$m = 80\,\text{kg}$" />, sia sulla Terra
                                            che sulla Luna. Cambia il <em>peso</em>, perché cambia <L s="$g$" />.
                                        </p>
                                    </div>

                                    <p style={{ ...S.solText, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>
                                        iv) Riduzione percentuale del peso
                                    </p>
                                    <div style={S.solStep}>
                                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                                            Proporzione: che percentuale è il peso sulla Luna rispetto a quello sulla Terra?
                                        </p>
                                        <DisplayMath>{"P_\\text{Terra} : P_\\text{Luna} = 100 : x \\quad\\Longrightarrow\\quad x = \\frac{P_\\text{Luna}}{P_\\text{Terra}} \\times 100"}</DisplayMath>
                                        <DisplayMath>{"x = \\frac{129{,}6}{784} \\times 100 \\approx 16{,}5\\%"}</DisplayMath>
                                        <p style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>
                                            Il peso sulla Luna è circa il <strong>16,5%</strong> del peso sulla Terra, quindi la riduzione è:
                                        </p>
                                        <DisplayMath>{"\\Delta P\\% = 100\\% - 16{,}5\\% = 83{,}5\\%"}</DisplayMath>

                                        <p style={{ fontSize: 13, fontWeight: 600, marginTop: 10, marginBottom: 4 }}>
                                            Si può utilizzare anche una formula generale alternativa:
                                        </p>
                                        <DisplayMath>{"\\Delta\\% = \\frac{\\text{valore iniziale} - \\text{valore finale}}{\\text{valore iniziale}} \\times 100"}</DisplayMath>
                                        <p style={{ fontSize: 13, color: "#475569", marginTop: 4, marginBottom: 4 }}>
                                            Questa formula calcola direttamente di quanto percentuale è diminuita una grandezza rispetto al suo valore di partenza. Applicata al peso:
                                        </p>
                                        <DisplayMath>{"\\Delta P\\% = \\frac{784 - 129{,}6}{784} \\times 100 = \\frac{654{,}4}{784} \\times 100 \\approx 83{,}5\\%"}</DisplayMath>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>
                                            Il peso si riduce dell'<strong>83,5%</strong> passando dalla Terra alla Luna.
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
                        Liceo Linguistico · Fisica · Vettori e Forze · Giovanni Ugolini
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Helper components ─────────────────────────────────────────────────────────

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

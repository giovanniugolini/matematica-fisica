/**
 * BattagliaProblemiDemo — Gioco: Battaglia di Problemi
 * Piano Cartesiano · Timer 5 min/esercizio · Auto-valutazione · Punteggio
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";
import imgEs4 from "../../assets/es_4.png";
import imgEs9 from "../../assets/es_9.png";

// ── Helpers ──────────────────────────────────────────────────────────────────
function L({ s }: { s: string }): React.ReactElement { return <MixedLatex>{s}</MixedLatex>; }
function fmt(s: number): string { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Problem Data ──────────────────────────────────────────────────────────────

const ES1_PUNTI = [
    { label: "A", x: 2, y: 3 }, { label: "B", x: -1, y: 4 },
    { label: "C", x: -3, y: -2 }, { label: "D", x: 4, y: -1 },
];
function quadrante(x: number, y: number): string {
    if (x > 0 && y > 0) return "I"; if (x < 0 && y > 0) return "II";
    if (x < 0 && y < 0) return "III"; return "IV";
}

const ES2 = [
    { id: "d1", txt: "$A(1,\\,2)$ e $B(5,\\,2)$", p1: "A(1,2)", p2: "B(5,2)", passi: ["d = \\sqrt{(5-1)^2+(2-2)^2} = \\sqrt{16} = 4"], ris: "d = 4" },
    { id: "d2", txt: "$C(-2,\\,1)$ e $D(-2,\\,6)$", p1: "C(−2,1)", p2: "D(−2,6)", passi: ["d = \\sqrt{0^2+5^2} = \\sqrt{25} = 5"], ris: "d = 5" },
    { id: "d3", txt: "$E(0,\\,0)$ e $F(3,\\,4)$", p1: "E(0,0)", p2: "F(3,4)", passi: ["d = \\sqrt{3^2+4^2} = \\sqrt{9+16} = \\sqrt{25} = 5"], ris: "d = 5" },
    { id: "d4", txt: "$G(-1,\\,-2)$ e $H(2,\\,2)$", p1: "G(−1,−2)", p2: "H(2,2)", passi: ["d = \\sqrt{3^2+4^2} = \\sqrt{9+16} = \\sqrt{25} = 5"], ris: "d = 5" },
];

const ES3 = [
    { id: "m1", txt: "$A(2,\\,4)$ e $B(6,\\,8)$", p1: "A(2,4)", p2: "B(6,8)", passi: ["M = \\left(\\frac{2+6}{2},\\,\\frac{4+8}{2}\\right) = (4,\\,6)"], ris: "M = (4, 6)" },
    { id: "m2", txt: "$C(-3,\\,5)$ e $D(1,\\,-1)$", p1: "C(−3,5)", p2: "D(1,−1)", passi: ["M = \\left(\\frac{-3+1}{2},\\,\\frac{5-1}{2}\\right) = (-1,\\,2)"], ris: "M = (−1, 2)" },
    { id: "m3", txt: "$E(-4,\\,-2)$ e $F(2,\\,6)$", p1: "E(−4,−2)", p2: "F(2,6)", passi: ["M = \\left(\\frac{-4+2}{2},\\,\\frac{-2+6}{2}\\right) = (-1,\\,2)"], ris: "M = (−1, 2)" },
    { id: "m4", txt: "$G(0,\\,3)$ e $H(8,\\,-1)$", p1: "G(0,3)", p2: "H(8,−1)", passi: ["M = \\left(\\frac{0+8}{2},\\,\\frac{3-1}{2}\\right) = (4,\\,1)"], ris: "M = (4, 1)" },
];

const ES5 = [
    { id: "r1", txt: "Il punto $A(1,\\,3)$ appartiene alla retta $y = 2x+1$?", retta: "y=2x+1", punto: "A(1,3)", passi: ["y = 2(1)+1 = 3 \\quad \\Rightarrow \\quad 3 = 3 \\;\\checkmark"], ok: true, ris: "SÌ — appartiene" },
    { id: "r2", txt: "Il punto $B(2,\\,6)$ appartiene alla retta $y = 2x+1$?", retta: "y=2x+1", punto: "B(2,6)", passi: ["y = 2(2)+1 = 5 \\quad \\Rightarrow \\quad 5 \\neq 6"], ok: false, ris: "NO — non appartiene" },
    { id: "r3", txt: "Il punto $C(3,\\,1)$ appartiene alla retta $y = -x+4$?", retta: "y=-x+4", punto: "C(3,1)", passi: ["y = -(3)+4 = 1 \\quad \\Rightarrow \\quad 1 = 1 \\;\\checkmark"], ok: true, ris: "SÌ — appartiene" },
    { id: "r4", txt: "Il punto $D(0,\\,5)$ appartiene alla retta $y = -x+4$?", retta: "y=-x+4", punto: "D(0,5)", passi: ["y = -(0)+4 = 4 \\quad \\Rightarrow \\quad 4 \\neq 5"], ok: false, ris: "NO — non appartiene" },
];

const ES6 = [
    { eq: "y = 2x+1", tipo: "crescente", motivo: "m=2>0", punti: "(0,1)\\text{ e }(1,3)" },
    { eq: "y = -x+3", tipo: "decrescente", motivo: "m=-1<0", punti: "(0,3)\\text{ e }(3,0)" },
    { eq: "y = 4", tipo: "orizzontale", motivo: "m=0", punti: "(0,4)\\text{ e }(1,4)" },
    { eq: "x = -2", tipo: "verticale", motivo: "no coefficiente angolare", punti: "(-2,0)\\text{ e }(-2,1)" },
];

const ES7 = [
    { id: "ca1", p1: "A(1,1)", p2: "B(3,5)", x1:1,y1:1,x2:3,y2:5, passi: ["m = \\frac{5-1}{3-1} = \\frac{4}{2} = 2"], ris: "m = 2" },
    { id: "ca2", p1: "A(0,3)", p2: "B(4,1)", x1:0,y1:3,x2:4,y2:1, passi: ["m = \\frac{1-3}{4-0} = \\frac{-2}{4} = -\\frac{1}{2}"], ris: "m = −1/2" },
    { id: "ca3", p1: "A(−2,4)", p2: "B(2,0)", x1:-2,y1:4,x2:2,y2:0, passi: ["m = \\frac{0-4}{2-(-2)} = \\frac{-4}{4} = -1"], ris: "m = −1" },
    { id: "ca4", p1: "A(1,−1)", p2: "B(4,5)", x1:1,y1:-1,x2:4,y2:5, passi: ["m = \\frac{5-(-1)}{4-1} = \\frac{6}{3} = 2"], ris: "m = 2" },
];

const ES8 = [
    { id: "t1", punto: "(3,\\;12)", passi: ["12 = m \\cdot 3 \\implies m = \\frac{12}{3} = 4"], ris: "m = 4" },
    { id: "t2", punto: "(2,\\;8)", passi: ["8 = m \\cdot 2 \\implies m = \\frac{8}{2} = 4"], ris: "m = 4" },
    { id: "t3", punto: "(5,\\;15)", passi: ["15 = m \\cdot 5 \\implies m = \\frac{15}{5} = 3"], ris: "m = 3" },
    { id: "t4", punto: "(4,\\;6)", passi: ["6 = m \\cdot 4 \\implies m = \\frac{6}{4} = \\frac{3}{2}"], ris: "m = 3/2" },
];

const ES10 = [
    { id: "re1", A:[1,1] as [number,number], B:[7,1] as [number,number], C:[7,5] as [number,number], D:[1,5] as [number,number], costo:5, base:6, alt:4, per:20, spesa:100 },
    { id: "re2", A:[0,0] as [number,number], B:[8,0] as [number,number], C:[8,3] as [number,number], D:[0,3] as [number,number], costo:4, base:8, alt:3, per:22, spesa:88 },
    { id: "re3", A:[2,1] as [number,number], B:[6,1] as [number,number], C:[6,4] as [number,number], D:[2,4] as [number,number], costo:6, base:4, alt:3, per:14, spesa:84 },
];

// ── GameProblem ───────────────────────────────────────────────────────────────

interface GameProblem {
    id: string; num: number; title: string; punti: number;
    content: React.ReactNode;
    solution: React.ReactNode;
}

type Sel = { d: typeof ES2[0]; m: typeof ES3[0]; v: typeof ES5[0]; ca: typeof ES7[0]; tm: typeof ES8[0]; re: typeof ES10[0] };

function makeProblems(sel: Sel): GameProblem[] {
    const { d, m, v, ca, tm, re } = sel;
    return [
        // ── Es. 1
        {
            id: "es1", num: 1, title: "Punti nel piano cartesiano", punti: 6,
            content: (
                <div>
                    <p style={T.q}>Nel piano cartesiano sono dati i punti <L s="$A(2,3)$" />, <L s="$B(-1,4)$" />, <L s="$C(-3,-2)$" />, <L s="$D(4,-1)$" />.</p>
                    <ol style={{ fontSize: 14, lineHeight: 2, paddingLeft: 20, color: "#1e293b" }}>
                        <li>In quale quadrante si trova ciascun punto?</li>
                        <li>Quali hanno ascissa positiva? Quali ordinata negativa?</li>
                        <li>Rappresentali sul piano cartesiano.</li>
                    </ol>
                </div>
            ),
            solution: (
                <div>
                    <p style={T.solTitle}>Quadranti:</p>
                    {ES1_PUNTI.map(p => (
                        <p key={p.label} style={T.solLine}>
                            <strong>{p.label}({p.x},{p.y})</strong> → <span style={T.green}>{quadrante(p.x, p.y)} quadrante</span>
                        </p>
                    ))}
                    <p style={{ ...T.solLine, marginTop: 8 }}><strong>Ascissa positiva:</strong> <span style={T.green}>{ES1_PUNTI.filter(p => p.x > 0).map(p => p.label).join(", ")}</span></p>
                    <p style={T.solLine}><strong>Ordinata negativa:</strong> <span style={T.green}>{ES1_PUNTI.filter(p => p.y < 0).map(p => p.label).join(", ")}</span></p>
                </div>
            ),
        },
        // ── Es. 2
        {
            id: "es2", num: 2, title: "Distanza tra due punti", punti: 8,
            content: (
                <div>
                    <p style={T.q}>Calcola la distanza tra i punti {d.p1} e {d.p2}.</p>
                    <div style={T.formula}><L s={"$d = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"} /></div>
                </div>
            ),
            solution: (
                <div>
                    {d.passi.map((p, i) => <DisplayMath key={i}>{p}</DisplayMath>)}
                    <Ris>{d.ris}</Ris>
                </div>
            ),
        },
        // ── Es. 3
        {
            id: "es3", num: 3, title: "Punto medio di un segmento", punti: 8,
            content: (
                <div>
                    <p style={T.q}>Calcola il punto medio del segmento con estremi {m.p1} e {m.p2}.</p>
                    <div style={T.formula}><L s={"$M = \\left(\\dfrac{x_1+x_2}{2},\\;\\dfrac{y_1+y_2}{2}\\right)$"} /></div>
                </div>
            ),
            solution: (
                <div>
                    {m.passi.map((p, i) => <DisplayMath key={i}>{p}</DisplayMath>)}
                    <Ris>{m.ris}</Ris>
                </div>
            ),
        },
        // ── Es. 4
        {
            id: "es4", num: 4, title: "Abbinamento rette–equazioni", punti: 6,
            content: (
                <div>
                    <p style={T.q}>Osserva la figura. Associa a ogni retta (a, b, c) l'equazione corrispondente tra le quattro proposte. <em>Una non corrisponde ad alcuna retta.</em></p>
                    <img src={imgEs4} alt="Rette a,b,c" style={{ maxWidth: "100%", borderRadius: 6, margin: "10px 0" }} />
                </div>
            ),
            solution: (
                <div>
                    {[
                        { label: "c", eq: "y = x + 1", why: "pendenza +1, intercetta y=1" },
                        { label: "b", eq: "y = x − 1", why: "pendenza +1, intercetta y=−1" },
                        { label: "a", eq: "y = −x − 1", why: "pendenza −1, intercetta y=−1" },
                    ].map(r => (
                        <p key={r.label} style={T.solLine}>
                            <strong>Retta {r.label}:</strong>{" "}
                            <span style={T.green}>{r.eq}</span>
                            {" "}— {r.why}
                        </p>
                    ))}
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                        L'equazione <strong>y = −x + 1</strong> non compare nella figura.
                    </p>
                </div>
            ),
        },
        // ── Es. 5
        {
            id: "es5", num: 5, title: "Verifica appartenenza a una retta", punti: 5,
            content: (
                <div>
                    <p style={T.q}><L s={v.txt} /></p>
                    <div style={T.formula}>
                        Sostituisci le coordinate del punto nell'equazione.
                        Se l'uguaglianza è verificata → appartiene.
                    </div>
                </div>
            ),
            solution: (
                <div>
                    {v.passi.map((p, i) => <DisplayMath key={i}>{p}</DisplayMath>)}
                    <Ris ok={v.ok}>{v.ris}</Ris>
                </div>
            ),
        },
        // ── Es. 6
        {
            id: "es6", num: 6, title: "Classificazione delle rette", punti: 5,
            content: (
                <div>
                    <p style={T.q}>Per ciascuna retta indica se è <em>crescente</em>, <em>decrescente</em>, <em>orizzontale</em> o <em>verticale</em>, e scrivi due punti che le appartengono.</p>
                    <div style={{ marginTop: 10 }}>
                        {ES6.map(r => (
                            <p key={r.eq} style={{ fontSize: 14, margin: "4px 0", color: "#1e293b" }}>
                                • <L s={`$${r.eq}$`} />
                            </p>
                        ))}
                    </div>
                </div>
            ),
            solution: (
                <div>
                    {ES6.map(r => (
                        <div key={r.eq} style={{ marginBottom: 6 }}>
                            <L s={`$${r.eq}$`} />
                            {" → "}<span style={T.green}><strong>{r.tipo}</strong></span>
                            {" "}({r.motivo}).{" "}
                            Punti: <L s={`$${r.punti}$`} />
                        </div>
                    ))}
                </div>
            ),
        },
        // ── Es. 7
        {
            id: "es7", num: 7, title: "Coefficiente angolare di una retta", punti: 4,
            content: (
                <div>
                    <p style={T.q}>Dati i punti <strong>{ca.p1}</strong> e <strong>{ca.p2}</strong>, determina il coefficiente angolare della retta AB.</p>
                    <div style={T.formula}><L s={"$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$"} /></div>
                </div>
            ),
            solution: (
                <div>
                    {ca.passi.map((p, i) => <DisplayMath key={i}>{p}</DisplayMath>)}
                    <Ris>{ca.ris}</Ris>
                </div>
            ),
        },
        // ── Es. 8
        {
            id: "es8", num: 8, title: "Trovare m — condizione di passaggio", punti: 3,
            content: (
                <div>
                    <p style={T.q}>
                        Per quale valore di <L s="$m$" /> la retta <L s="$y = mx$" /> passa per il punto <L s={`$${tm.punto}$`} />?
                    </p>
                </div>
            ),
            solution: (
                <div>
                    {tm.passi.map((p, i) => (
                        <div key={i} style={{ fontSize: 13, marginBottom: 5 }}>
                            {p.startsWith("\\text") ? <L s={`$${p}$`} /> : <DisplayMath>{p}</DisplayMath>}
                        </div>
                    ))}
                    <Ris>{tm.ris}</Ris>
                </div>
            ),
        },
        // ── Es. 9
        {
            id: "es9", num: 9, title: "Identificare il grafico di y = 1 − 4x", punti: 5,
            content: (
                <div>
                    <p style={T.q}>Uno dei grafici rappresenta <L s="$y = 1 - 4x$" />. Quale?</p>
                    <img src={imgEs9} alt="Grafici A B C D" style={{ maxWidth: "100%", borderRadius: 6, margin: "10px 0" }} />
                </div>
            ),
            solution: (
                <div>
                    <Ris>Grafico A</Ris>
                    <p style={{ fontSize: 13, marginTop: 8, color: "#1e293b", lineHeight: 1.7 }}>
                        <L s="$m = -4 < 0$" /> → retta <strong>decrescente e ripida</strong>.
                        Intercetta y: <L s="$y(0) = 1$" />.
                        Intercetta x: <L s="$x = 1/4$" />.
                        Solo A ha pendenza negativa con intercetta y=1.
                    </p>
                </div>
            ),
        },
        // ── Es. 10
        {
            id: "es10", num: 10, title: "Problema: terreno rettangolare", punti: 6,
            content: (
                <div>
                    <p style={T.q}>
                        Un terreno rettangolare ha vertici{" "}
                        <L s={`$A(${re.A[0]},${re.A[1]})$`} />,{" "}
                        <L s={`$B(${re.B[0]},${re.B[1]})$`} />,{" "}
                        <L s={`$C(${re.C[0]},${re.C[1]})$`} />,{" "}
                        <L s={`$D(${re.D[0]},${re.D[1]})$`} />.
                        La recinzione costa <strong>{re.costo} €/m</strong>.
                    </p>
                    <ol style={{ fontSize: 14, lineHeight: 2, paddingLeft: 20, color: "#1e293b" }}>
                        <li>Calcola base e altezza del rettangolo.</li>
                        <li>Calcola il perimetro.</li>
                        <li>Calcola la spesa totale.</li>
                    </ol>
                </div>
            ),
            solution: (
                <div>
                    <DisplayMath>{`\\text{Base} = ${re.base}\\,\\text{m},\\quad \\text{Altezza} = ${re.alt}\\,\\text{m}`}</DisplayMath>
                    <DisplayMath>{`P = 2(${re.base}+${re.alt}) = ${re.per}\\,\\text{m}`}</DisplayMath>
                    <DisplayMath>{`\\text{Spesa} = ${re.per} \\times ${re.costo} = ${re.spesa}\\,\\text{€}`}</DisplayMath>
                    <Ris>Spesa = {re.spesa} €</Ris>
                </div>
            ),
        },
    ];
}

// ── Game State ────────────────────────────────────────────────────────────────

const SECS = 300;

interface ProbState {
    timeLeft: number;
    revealed: boolean;
    timedOut: boolean;
    score: "correct" | "wrong" | null;
}

type Phase = "start" | "battle" | "end";

const UNLOCK_PASSWORD = "343452";

// ── Main Component ────────────────────────────────────────────────────────────

export default function BattagliaProblemiDemo(): React.ReactElement {
    const [sel] = useState(() => ({
        d: rand(ES2), m: rand(ES3), v: rand(ES5),
        ca: rand(ES7), tm: rand(ES8), re: rand(ES10),
    }));

    const probs = useMemo(() => makeProblems(sel), [sel]);

    const [phase, setPhase] = useState<Phase>("start");
    const [idx, setIdx] = useState(0);
    const [states, setStates] = useState<ProbState[]>(() =>
        probs.map(() => ({ timeLeft: SECS, revealed: false, timedOut: false, score: null }))
    );
    const [pwdModal, setPwdModal] = useState(false);
    const [pwdInput, setPwdInput] = useState("");
    const [pwdError, setPwdError] = useState(false);

    const cur = states[idx];
    const prob = probs[idx];

    // Timer: ticks only for the current active problem
    useEffect(() => {
        if (phase !== "battle" || cur.revealed) return;
        const id = setInterval(() => {
            setStates(prev => {
                const s = prev[idx];
                if (s.revealed || s.timeLeft <= 0) return prev;
                const t = s.timeLeft - 1;
                const next = [...prev];
                next[idx] = { ...s, timeLeft: t, timedOut: t <= 0, revealed: false };
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase, idx, cur.revealed]);

    const reveal = useCallback(() => {
        setStates(p => p.map((s, i) => i === idx ? { ...s, revealed: true } : s));
    }, [idx]);

    const scoreIt = useCallback((result: "correct" | "wrong") => {
        setStates(p => p.map((s, i) => i === idx ? { ...s, score: result } : s));
    }, [idx]);

    const go = useCallback((i: number) => {
        setIdx(Math.max(0, Math.min(probs.length - 1, i)));
    }, [probs.length]);

    const totalScore = states.filter(s => s.score === "correct").length;

    // ── START ──────────────────────────────────────────────────────────────
    if (phase === "start") {
        return (
            <div style={G.page}>
                <div style={G.startCard}>
                    <div style={G.startBadge}>⚔️ Battaglia di Problemi</div>
                    <h1 style={G.startTitle}>Piano Cartesiano</h1>
                    <p style={G.startSub}>Classe 2B · A.S. 2025/2026</p>
                    <div style={G.rulesBox}>
                        <Rule icon="📋" text={`${probs.length} esercizi dal compito`} />
                        <Rule icon="⏱" text="5 minuti per ogni esercizio" />
                        <Rule icon="🔀" text="Puoi passare tra i problemi liberamente" />
                        <Rule icon="✅" text="Alla fine autovaluta le risposte" />
                        <Rule icon="🏆" text="Punteggio aggiornato in tempo reale" />
                    </div>
                    <button onClick={() => setPhase("battle")} style={G.startBtn}>
                        ⚔️ Inizia la battaglia!
                    </button>
                    <Link to="/" style={G.backLink}>← Torna alla home</Link>
                </div>
            </div>
        );
    }

    // ── END ────────────────────────────────────────────────────────────────
    if (phase === "end") {
        const correct = states.filter(s => s.score === "correct").length;
        const wrong = states.filter(s => s.score === "wrong").length;
        const unscored = states.filter(s => s.score === null).length;
        return (
            <div style={G.page}>
                <div style={G.endCard}>
                    <div style={G.endHeader}>
                        <div style={G.trophyBig}>🏆</div>
                        <h2 style={G.endTitle}>Battaglia terminata!</h2>
                        <div style={G.scoreBig}>{correct} / {probs.length}</div>
                        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
                            {correct > 0 ? `${correct} corretti` : ""}
                            {wrong > 0 ? ` · ${wrong} sbagliati` : ""}
                            {unscored > 0 ? ` · ${unscored} non valutati` : ""}
                        </p>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        {probs.map((p, i) => {
                            const s = states[i];
                            const dotColor = s.score === "correct" ? "#16a34a" : s.score === "wrong" ? "#dc2626" : s.timedOut ? "#f59e0b" : "#94a3b8";
                            return (
                                <div key={p.id} style={G.endRow}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                        <span style={{ ...G.endDot, background: dotColor }}>
                                            {s.score === "correct" ? "✓" : s.score === "wrong" ? "✗" : s.timedOut ? "⏰" : "–"}
                                        </span>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                                            Es. {p.num} — {p.title}
                                        </span>
                                        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
                                            {p.punti} pt · {fmt(SECS - s.timeLeft)} usati
                                        </span>
                                    </div>
                                    <div style={G.endSolution}>{p.solution}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center" }}>
                        <button onClick={() => window.location.reload()} style={G.startBtn}>
                            ⚔️ Nuova battaglia
                        </button>
                        <Link to="/" style={{ ...G.backLink, margin: 0 }}>← Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── BATTLE ─────────────────────────────────────────────────────────────
    const pct = cur.timeLeft / SECS;
    const timerColor = cur.timeLeft <= 60 ? "#ef4444" : cur.timeLeft <= 120 ? "#f59e0b" : "#22c55e";

    return (
        <div style={G.page}>
            {/* Header */}
            <div style={G.header}>
                <Link to="/" style={G.headerLink}>← Home</Link>
                <span style={G.headerCenter}>
                    <span style={G.headerLabel}>Es. {idx + 1}/{probs.length}</span>
                </span>
                <div style={G.timerBlock}>
                    <span style={{ ...G.timerText, color: cur.revealed ? "#64748b" : timerColor }}>
                        {cur.revealed ? "—" : fmt(cur.timeLeft)}
                    </span>
                    <div style={G.timerBar}>
                        <div style={{ ...G.timerFill, width: `${pct * 100}%`, background: timerColor }} />
                    </div>
                </div>
                <span style={G.scoreChip}>🏆 {totalScore}/{probs.length}</span>
                <button onClick={() => setPhase("end")} style={G.endBtnHeader}>Fine →</button>
            </div>

            {/* Problem card */}
            <div style={G.card}>
                <div style={G.cardHeader}>
                    <span style={G.cardTitle}>Es. {prob.num} — {prob.title}</span>
                    <span style={G.puntiBadge}>{prob.punti} pt</span>
                </div>

                <div style={G.cardBody}>
                    {prob.content}
                </div>

                {/* Timed out banner */}
                {cur.timedOut && (
                    <div style={G.timeoutBanner}>⏰ Tempo scaduto! Ecco la soluzione:</div>
                )}

                {/* Reveal button */}
                {!cur.revealed && (
                    <div style={G.actionArea}>
                        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 12px" }}>
                            Risolvi sul foglio, poi verifica la soluzione.
                        </p>
                        <button onClick={() => { setPwdInput(""); setPwdError(false); setPwdModal(true); }} style={G.btnReveal}>
                            🔒 Ho finito — mostra soluzione
                        </button>
                    </div>
                )}

                {/* Password modal */}
                {pwdModal && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                    }}>
                        <div style={{
                            background: "#fff", borderRadius: 16, padding: "32px 28px",
                            maxWidth: 360, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
                            <h3 style={{ margin: "0 0 6px", color: "#0f172a", fontSize: 18, fontWeight: 700 }}>
                                Soluzione protetta
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                                Inserisci la password per vedere la soluzione.
                            </p>
                            <input
                                type="password"
                                value={pwdInput}
                                onChange={e => { setPwdInput(e.target.value); setPwdError(false); }}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        if (pwdInput === UNLOCK_PASSWORD) { setPwdModal(false); reveal(); }
                                        else setPwdError(true);
                                    }
                                    if (e.key === "Escape") setPwdModal(false);
                                }}
                                placeholder="Password…"
                                autoFocus
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    padding: "10px 14px", fontSize: 16,
                                    border: pwdError ? "2px solid #ef4444" : "2px solid #e2e8f0",
                                    borderRadius: 10, outline: "none", marginBottom: 8,
                                    textAlign: "center", letterSpacing: 4,
                                }}
                            />
                            {pwdError && (
                                <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 10px" }}>
                                    Password errata. Riprova!
                                </p>
                            )}
                            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                <button
                                    onClick={() => setPwdModal(false)}
                                    style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#475569" }}
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={() => {
                                        if (pwdInput === UNLOCK_PASSWORD) { setPwdModal(false); reveal(); }
                                        else setPwdError(true);
                                    }}
                                    style={{ flex: 1, padding: "10px", background: "#1d4ed8", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#fff" }}
                                >
                                    Sblocca
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Solution */}
                {cur.revealed && (
                    <div style={G.solutionBox}>
                        <div style={G.solutionLabel}>💡 Soluzione</div>
                        <div style={G.solutionContent}>{prob.solution}</div>

                        {cur.score === null ? (
                            <div style={G.selfScoreArea}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                                    Avevi ragione?
                                </p>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => scoreIt("correct")} style={G.btnCorrect}>✓ Giusto!</button>
                                    <button onClick={() => scoreIt("wrong")} style={G.btnWrong}>✗ Sbagliato</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                ...G.scoredBanner,
                                background: cur.score === "correct" ? "#f0fdf4" : "#fef2f2",
                                borderColor: cur.score === "correct" ? "#86efac" : "#fca5a5",
                                color: cur.score === "correct" ? "#15803d" : "#dc2626",
                            }}>
                                {cur.score === "correct" ? "✓ +1 punto! Ottimo!" : "✗ Ripassaci — andrà meglio!"}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigator */}
            <div style={G.nav}>
                <button
                    onClick={() => go(idx - 1)}
                    disabled={idx === 0}
                    style={{ ...G.navBtn, opacity: idx === 0 ? 0.3 : 1 }}
                >
                    ← Prec
                </button>

                <div style={G.dots}>
                    {states.map((s, i) => {
                        const isActive = i === idx;
                        const bg = s.score === "correct" ? "#22c55e"
                            : s.score === "wrong" ? "#ef4444"
                            : s.timedOut ? "#f59e0b"
                            : s.revealed ? "#a855f7"
                            : s.timeLeft < SECS ? "#3b82f6"
                            : "#475569";
                        return (
                            <button
                                key={i}
                                onClick={() => go(i)}
                                title={`Es. ${i + 1} — ${probs[i].title}`}
                                style={{
                                    width: isActive ? 32 : 24,
                                    height: isActive ? 32 : 24,
                                    borderRadius: "50%",
                                    background: bg,
                                    border: isActive ? "3px solid #fff" : "2px solid transparent",
                                    boxShadow: isActive ? "0 0 0 3px " + bg : "none",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontSize: isActive ? 12 : 10,
                                    fontWeight: 700,
                                    transition: "all 0.15s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => go(idx + 1)}
                    disabled={idx === probs.length - 1}
                    style={{ ...G.navBtn, opacity: idx === probs.length - 1 ? 0.3 : 1 }}
                >
                    Succ →
                </button>
            </div>

            {/* Legend */}
            <div style={G.legend}>
                {[
                    { color: "#475569", label: "Non visitato" },
                    { color: "#3b82f6", label: "In corso" },
                    { color: "#a855f7", label: "Rivelato" },
                    { color: "#22c55e", label: "Giusto" },
                    { color: "#ef4444", label: "Sbagliato" },
                    { color: "#f59e0b", label: "Scaduto" },
                ].map(({ color, label }) => (
                    <span key={label} style={G.legendItem}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", marginRight: 4 }} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Rule({ icon, text }: { icon: string; text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 14, color: "#334155" }}>{text}</span>
        </div>
    );
}

function Ris({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
    return (
        <div style={{
            display: "inline-block",
            background: ok === false ? "#fee2e2" : "#dcfce7",
            border: ok === false ? "1px solid #fca5a5" : "1px solid #86efac",
            borderRadius: 6,
            padding: "4px 14px",
            fontSize: 15,
            fontWeight: 700,
            color: ok === false ? "#dc2626" : "#15803d",
            marginTop: 10,
        }}>
            {children}
        </div>
    );
}

// ── Text styles (shorthand) ────────────────────────────────────────────────────
const T = {
    q: { fontSize: 15, lineHeight: 1.8, color: "#1e293b", marginBottom: 8 } as React.CSSProperties,
    formula: {
        background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6,
        padding: "8px 14px", fontSize: 13, color: "#475569", marginTop: 8,
    } as React.CSSProperties,
    solTitle: { fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 6 } as React.CSSProperties,
    solLine: { fontSize: 13, margin: "3px 0", color: "#1e293b" } as React.CSSProperties,
    green: { color: "#15803d", fontWeight: 700 } as React.CSSProperties,
};

// ── Game Styles — tema coerente con il sito ───────────────────────────────────
const G = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
        padding: "20px 16px 40px",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
    } as React.CSSProperties,

    // Start
    startCard: {
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        padding: "40px 32px",
        maxWidth: 480,
        width: "100%",
        textAlign: "center" as const,
        marginTop: 32,
    } as React.CSSProperties,
    startBadge: {
        display: "inline-block",
        background: "#eff6ff",
        color: "#1d4ed8",
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 14px",
        borderRadius: 20,
        letterSpacing: "0.5px",
        marginBottom: 16,
    } as React.CSSProperties,
    startTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" } as React.CSSProperties,
    startSub: { fontSize: 14, color: "#64748b", marginBottom: 28 } as React.CSSProperties,
    rulesBox: {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 28,
        textAlign: "left" as const,
    } as React.CSSProperties,
    startBtn: {
        background: "#1d4ed8",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        padding: "14px 28px",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        width: "100%",
        marginBottom: 12,
        transition: "background 0.15s",
    } as React.CSSProperties,
    backLink: {
        display: "block",
        color: "#94a3b8",
        textDecoration: "none",
        fontSize: 13,
        marginTop: 4,
    } as React.CSSProperties,

    // Header
    header: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        maxWidth: 700,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "10px 16px",
        marginBottom: 12,
        flexWrap: "wrap" as const,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    } as React.CSSProperties,
    headerLink: {
        color: "#64748b", textDecoration: "none", fontSize: 13,
        padding: "4px 10px", borderRadius: 8, border: "1px solid #e2e8f0",
    } as React.CSSProperties,
    headerCenter: { flex: 1 } as React.CSSProperties,
    headerLabel: { color: "#0f172a", fontWeight: 700, fontSize: 15 } as React.CSSProperties,
    timerBlock: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 } as React.CSSProperties,
    timerText: { fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" as const } as React.CSSProperties,
    timerBar: { width: 80, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" } as React.CSSProperties,
    timerFill: { height: "100%", borderRadius: 3, transition: "width 1s linear, background 0.5s" } as React.CSSProperties,
    scoreChip: {
        background: "#fef3c7",
        color: "#92400e",
        fontWeight: 700,
        fontSize: 14,
        padding: "4px 12px",
        borderRadius: 20,
        border: "1px solid #fcd34d",
    } as React.CSSProperties,
    endBtnHeader: {
        background: "#f1f5f9",
        color: "#475569",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600,
    } as React.CSSProperties,

    // Card
    card: {
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 700,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
    } as React.CSSProperties,
    cardHeader: {
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    } as React.CSSProperties,
    cardTitle: { color: "#0f172a", fontWeight: 700, fontSize: 15 } as React.CSSProperties,
    puntiBadge: {
        background: "#dbeafe",
        color: "#1d4ed8",
        fontSize: 12,
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: 20,
    } as React.CSSProperties,
    cardBody: { padding: "20px 24px", minHeight: 120 } as React.CSSProperties,

    // Action
    actionArea: {
        padding: "16px 24px 20px",
        borderTop: "1px solid #f1f5f9",
    } as React.CSSProperties,
    btnReveal: {
        width: "100%",
        padding: "12px",
        background: "#1d4ed8",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
    } as React.CSSProperties,

    // Timeout
    timeoutBanner: {
        background: "#fef3c7",
        borderTop: "1px solid #fcd34d",
        padding: "10px 20px",
        color: "#92400e",
        fontWeight: 600,
        fontSize: 14,
    } as React.CSSProperties,

    // Solution
    solutionBox: {
        borderTop: "2px solid #22c55e",
        padding: "16px 24px",
        background: "#f0fdf4",
    } as React.CSSProperties,
    solutionLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: "#15803d",
        marginBottom: 10,
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
    } as React.CSSProperties,
    solutionContent: { marginBottom: 16 } as React.CSSProperties,
    selfScoreArea: {
        borderTop: "1px solid #bbf7d0",
        paddingTop: 14,
        textAlign: "center" as const,
    } as React.CSSProperties,
    btnCorrect: {
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        flex: 1,
    } as React.CSSProperties,
    btnWrong: {
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        flex: 1,
    } as React.CSSProperties,
    scoredBanner: {
        marginTop: 12,
        fontWeight: 700,
        fontSize: 15,
        textAlign: "center" as const,
        padding: 12,
        borderRadius: 10,
        border: "1px solid",
    } as React.CSSProperties,

    // Navigator
    nav: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        maxWidth: 700,
        marginTop: 12,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "10px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    } as React.CSSProperties,
    navBtn: {
        background: "#f8fafc",
        color: "#334155",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    dots: {
        display: "flex",
        gap: 6,
        flex: 1,
        justifyContent: "center",
        flexWrap: "wrap" as const,
    } as React.CSSProperties,

    legend: {
        display: "flex",
        gap: 10,
        marginTop: 10,
        flexWrap: "wrap" as const,
        justifyContent: "center",
    } as React.CSSProperties,
    legendItem: {
        fontSize: 11, color: "#64748b", display: "flex", alignItems: "center",
        background: "#fff", padding: "3px 8px", borderRadius: 20,
        border: "1px solid #e2e8f0",
    } as React.CSSProperties,

    // End screen
    endCard: {
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        padding: "32px 24px",
        maxWidth: 700,
        width: "100%",
        marginTop: 24,
    } as React.CSSProperties,
    endHeader: { textAlign: "center" as const, marginBottom: 16 } as React.CSSProperties,
    trophyBig: { fontSize: 48, marginBottom: 8 } as React.CSSProperties,
    endTitle: { color: "#0f172a", fontSize: 22, fontWeight: 700, margin: "0 0 4px" } as React.CSSProperties,
    scoreBig: { fontSize: 52, fontWeight: 800, color: "#1d4ed8" } as React.CSSProperties,
    endRow: {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 10,
        fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,
    endDot: {
        width: 28, height: 28, borderRadius: "50%",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
    } as React.CSSProperties,
    endSolution: {
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 14px",
        marginTop: 8,
        fontSize: 13,
        color: "#334155",
    } as React.CSSProperties,
} as const;

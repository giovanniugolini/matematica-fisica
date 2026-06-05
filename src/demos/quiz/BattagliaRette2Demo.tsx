/**
 * BattagliaRette2Demo — Gioco: Battaglia di Problemi
 * Rette, Sistemi e Radicali · Timer 5 min/esercizio · Auto-valutazione · Punteggio
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { MixedLatex, DisplayMath } from "../../components/ui/Latex";
import { Link } from "react-router-dom";

// ── Helpers ──────────────────────────────────────────────────────────────────
function L({ s }: { s: string }): React.ReactElement { return <MixedLatex>{s}</MixedLatex>; }
function fmt(s: number): string { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Helpers sistema sostituzione (stesso stile di SistemiPrimoGradoSostituzione) ──
function mono(c: number, v: string): string {
    if (c === 0) return "0";
    if (c === 1) return v;
    if (c === -1) return `-${v}`;
    return `${c}${v}`;
}
function signedMono(c: number, v: string): string {
    if (c === 0) return "";
    if (c > 0) return `+ ${c === 1 ? v : `${c}${v}`}`;
    if (c === -1) return `- ${v}`;
    return `- ${Math.abs(c)}${v}`;
}
function signedConst(n: number): string {
    if (n === 0) return "";
    if (n > 0) return `+ ${n}`;
    return `${n}`;
}
function linLHS(a: number, b: number): string {
    let s = a !== 0 ? mono(a, "x") : "";
    if (b !== 0) {
        if (s === "" || s === "0") s = mono(b, "y");
        else if (b > 0) s += ` + ${b === 1 ? "y" : `${b}y`}`;
        else if (b === -1) s += " - y";
        else s += ` - ${Math.abs(b)}y`;
    }
    return s || "0";
}
function varExpr(a: number, v: string, k: number): string {
    let s = a !== 0 ? mono(a, v) : "";
    if (k !== 0) {
        if (s === "" || s === "0") s = `${k}`;
        else s += ` ${signedConst(k)}`;
    }
    return s || "0";
}

interface SisData {
    a1: number; b1: number; c1: number;
    a2: number; b2: number; c2: number;
    x0: number; y0: number;
    sys1: string; sys2: string; sys3: string; sys4: string; sys5: string;
    work2: string; work3: string; work4: string; work5: string;
    isolateVar: "x" | "y";
    isolateFrom: 1 | 2;
    otherVar: "x" | "y";
    otherEqNum: 1 | 2;
    solutionLatex: string;
}

function generateSisData(): SisData {
    const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    const rNZ = (a: number, b: number) => { let v = 0; while (!v) v = ri(a, b); return v; };

    let a1: number, b1: number, a2: number, b2: number;
    const x0 = ri(-4, 4), y0 = ri(-4, 4);
    let attempt = 0;
    do {
        a1 = rNZ(-3, 3); b1 = rNZ(-3, 3); a2 = rNZ(-3, 3); b2 = rNZ(-3, 3);
        const pos = ri(0, 3), val = Math.random() < 0.5 ? 1 : -1;
        if (pos === 0) a1 = val; else if (pos === 1) b1 = val;
        else if (pos === 2) a2 = val; else b2 = val;
        attempt++;
    } while (a1! * b2! - a2! * b1! === 0 && attempt < 100);

    const _a1 = a1!, _b1 = b1!, _a2 = a2!, _b2 = b2!;
    const _c1 = _a1 * x0 + _b1 * y0;
    const _c2 = _a2 * x0 + _b2 * y0;

    const candidates: { from: 1 | 2; v: "x" | "y"; coeff: number }[] = [
        { from: 1, v: "x", coeff: _a1 }, { from: 1, v: "y", coeff: _b1 },
        { from: 2, v: "x", coeff: _a2 }, { from: 2, v: "y", coeff: _b2 },
    ];
    const unit = candidates.filter(c => Math.abs(c.coeff) === 1);
    const pool = unit.length > 0 ? unit : candidates;
    const best = pool[Math.floor(Math.random() * pool.length)];

    const isolateFrom = best.from;
    const isolateVar  = best.v;
    const otherVar: "x" | "y" = isolateVar === "x" ? "y" : "x";
    const otherEqNum: 1 | 2    = isolateFrom === 1 ? 2 : 1;

    const cv  = isolateFrom === 1 ? (isolateVar === "x" ? _a1 : _b1) : (isolateVar === "x" ? _a2 : _b2);
    const cw  = isolateFrom === 1 ? (isolateVar === "x" ? _b1 : _a1) : (isolateVar === "x" ? _b2 : _a2);
    const c   = isolateFrom === 1 ? _c1 : _c2;
    const exprA = -cv * cw;
    const exprC =  cv * c;

    const cv2 = isolateFrom === 1 ? (isolateVar === "x" ? _a2 : _b2) : (isolateVar === "x" ? _a1 : _b1);
    const cw2 = isolateFrom === 1 ? (isolateVar === "x" ? _b2 : _a2) : (isolateVar === "x" ? _b1 : _a1);
    const c2_ = isolateFrom === 1 ? _c2 : _c1;

    const rCoeff = cv2 * exprA + cw2;
    const rRHS   = c2_ - cv2 * exprC;
    const wVal   = rRHS / rCoeff;
    const vVal   = exprA * wVal + exprC;

    const V = isolateVar, W = otherVar;
    const eq1 = `${linLHS(_a1, _b1)} = ${_c1}`;
    const eq2 = `${linLHS(_a2, _b2)} = ${_c2}`;
    const vExpr = varExpr(exprA, W, exprC);
    const isolatedLine = `${V} = ${vExpr}`;
    const wFmt = String(wVal), vFmt = String(vVal);

    const sys1 = `\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}`;
    const sys2 = isolateFrom === 1
        ? `\\begin{cases} ${isolatedLine} \\\\ ${eq2} \\end{cases}`
        : `\\begin{cases} ${eq1} \\\\ ${isolatedLine} \\end{cases}`;

    const vParen = Math.abs(cv2) === 1 ? (cv2 === 1 ? `(${vExpr})` : `-(${vExpr})`) : `${cv2}(${vExpr})`;
    const substEq = cw2 !== 0 ? `${vParen} ${signedMono(cw2, W)} = ${c2_}` : `${vParen} = ${c2_}`;
    const sys3 = isolateFrom === 1
        ? `\\begin{cases} ${isolatedLine} \\\\ ${substEq} \\end{cases}`
        : `\\begin{cases} ${substEq} \\\\ ${isolatedLine} \\end{cases}`;

    const sys4 = isolateFrom === 1
        ? `\\begin{cases} ${isolatedLine} \\\\ ${W} = ${wFmt} \\end{cases}`
        : `\\begin{cases} ${W} = ${wFmt} \\\\ ${isolatedLine} \\end{cases}`;

    const xFmt = V === "x" ? vFmt : wFmt, yFmt = V === "y" ? vFmt : wFmt;
    const sys5 = `\\begin{cases} x = ${xFmt} \\\\ y = ${yFmt} \\end{cases}`;
    const solutionLatex = `(x,\\,y) = (${xFmt},\\,${yFmt})`;

    const origLine  = isolateFrom === 1 ? eq1 : eq2;
    const otherOrig = isolateFrom === 1 ? eq2 : eq1;
    const moved = `${mono(cv, V)} = ${c} ${signedMono(-cw, W)}`;
    const work2 = `\\begin{aligned} &${origLine} \\\\ &${moved} \\\\ &${isolatedLine} \\end{aligned}`;
    const work3 = `${otherOrig} \\;\\xrightarrow{\\;${V}\\,=\\,${vExpr}\\;}\\; ${substEq}`;

    const t1 = cv2 * exprA, t2 = cw2, tk = cv2 * exprC;
    let expLine = "";
    if (t1 !== 0) expLine += mono(t1, W);
    if (t2 !== 0) expLine += expLine ? ` ${signedMono(t2, W)}` : mono(t2, W);
    if (tk !== 0) expLine += ` ${signedConst(tk)}`;
    expLine = expLine.trim() || "0";
    const work4 = `\\begin{aligned} &${substEq} \\\\ &${expLine} = ${c2_} \\\\ &${mono(rCoeff, W)} = ${rRHS} \\\\ &${W} = ${wFmt} \\end{aligned}`;

    const calcA = exprA !== 0 ? `${exprA} \\cdot ${wFmt}` : "";
    const calcC = exprC !== 0 ? ` ${signedConst(exprC)}` : "";
    const calc  = (calcA + calcC).trim() || "0";
    const work5 = `\\begin{aligned} &${V} = ${vExpr} \\\\ &${V} = ${calc} \\\\ &${V} = ${vFmt} \\end{aligned}`;

    return {
        a1: _a1, b1: _b1, c1: _c1, a2: _a2, b2: _b2, c2: _c2,
        x0, y0, sys1, sys2, sys3, sys4, sys5,
        work2, work3, work4, work5,
        isolateVar, isolateFrom, otherVar, otherEqNum, solutionLatex,
    };
}

// ── Problem Data ──────────────────────────────────────────────────────────────

const ES_CONV = [
    { id: "c1", eq: "3x - y + 2 = 0", expl: "y = 3x + 2", m: "3", q: "+2",
      steps: ["3x - y + 2 = 0", "-y = -3x - 2", "y = 3x + 2"] },
    { id: "c2", eq: "2x + y - 5 = 0", expl: "y = -2x + 5", m: "-2", q: "+5",
      steps: ["y = -2x + 5"] },
    { id: "c3", eq: "x - 2y + 4 = 0", expl: "y = \\tfrac{1}{2}x + 2", m: "\\tfrac{1}{2}", q: "+2",
      steps: ["-2y = -x - 4", "y = \\tfrac{1}{2}x + 2"] },
    { id: "c4", eq: "4x + y + 3 = 0", expl: "y = -4x - 3", m: "-4", q: "-3",
      steps: ["y = -4x - 3"] },
    { id: "c5", eq: "-x + 2y - 6 = 0", expl: "y = \\tfrac{1}{2}x + 3", m: "\\tfrac{1}{2}", q: "+3",
      steps: ["2y = x + 6", "y = \\tfrac{1}{2}x + 3"] },
];

const ES_DUE_PUNTI = [
    { id: "p1", A: "A(1,\\,3)", B: "B(3,\\,7)", ris: "y = 2x + 1",
      steps: ["m = \\frac{7-3}{3-1} = \\frac{4}{2} = 2", "y - 3 = 2(x-1) \\implies y = 2x+1"] },
    { id: "p2", A: "A(0,\\,2)", B: "B(2,\\,6)", ris: "y = 2x + 2",
      steps: ["m = \\frac{6-2}{2-0} = \\frac{4}{2} = 2", "y = 2x+2"] },
    { id: "p3", A: "A(-1,\\,5)", B: "B(2,\\,-1)", ris: "y = -2x + 3",
      steps: ["m = \\frac{-1-5}{2-(-1)} = \\frac{-6}{3} = -2", "y - 5 = -2(x+1) \\implies y = -2x+3"] },
    { id: "p4", A: "A(1,\\,-1)", B: "B(3,\\,5)", ris: "y = 3x - 4",
      steps: ["m = \\frac{5-(-1)}{3-1} = \\frac{6}{2} = 3", "y + 1 = 3(x-1) \\implies y = 3x-4"] },
];

const ES_PUNTO_M = [
    { id: "pm1", punto: "P(2,\\,5)", m: 3, mStr: "3", ris: "y = 3x - 1",
      steps: ["y - 5 = 3(x-2)", "y = 3x - 1"] },
    { id: "pm2", punto: "P(-1,\\,4)", m: -2, mStr: "-2", ris: "y = -2x + 2",
      steps: ["y - 4 = -2(x+1)", "y = -2x + 2"] },
    { id: "pm3", punto: "P(3,\\,-1)", m: 2, mStr: "2", ris: "y = 2x - 7",
      steps: ["y + 1 = 2(x-3)", "y = 2x - 7"] },
    { id: "pm4", punto: "P(0,\\,3)", m: -1, mStr: "-1", ris: "y = -x + 3",
      steps: ["y - 3 = -1 \\cdot (x - 0)", "y = -x + 3"] },
];

const ES_PARA_PERP = [
    { id: "pp1",
      lines: [
          { label: "r", eq: "y = 2x + 1", mStr: "2" },
          { label: "s", eq: "y = 2x - 3", mStr: "2" },
          { label: "t", eq: "y = -\\tfrac{1}{2}x + 2", mStr: "-\\tfrac{1}{2}" },
          { label: "u", eq: "y = 3x + 1", mStr: "3" },
      ],
      parallel: "r \\parallel s", parallelWhy: "m_r = m_s = 2",
      perp: "r \\perp t,\\;\\; s \\perp t", perpWhy: "2 \\cdot \\bigl(-\\tfrac{1}{2}\\bigr) = -1",
    },
    { id: "pp2",
      lines: [
          { label: "r", eq: "y = 3x - 1", mStr: "3" },
          { label: "s", eq: "y = 3x + 4", mStr: "3" },
          { label: "t", eq: "y = -\\tfrac{1}{3}x + 2", mStr: "-\\tfrac{1}{3}" },
          { label: "u", eq: "y = -2x + 1", mStr: "-2" },
      ],
      parallel: "r \\parallel s", parallelWhy: "m_r = m_s = 3",
      perp: "r \\perp t,\\;\\; s \\perp t", perpWhy: "3 \\cdot \\bigl(-\\tfrac{1}{3}\\bigr) = -1",
    },
    { id: "pp3",
      lines: [
          { label: "r", eq: "y = -2x + 3", mStr: "-2" },
          { label: "s", eq: "y = -2x - 1", mStr: "-2" },
          { label: "t", eq: "y = \\tfrac{1}{2}x + 1", mStr: "\\tfrac{1}{2}" },
          { label: "u", eq: "y = 3x - 2", mStr: "3" },
      ],
      parallel: "r \\parallel s", parallelWhy: "m_r = m_s = -2",
      perp: "r \\perp t,\\;\\; s \\perp t", perpWhy: "-2 \\cdot \\tfrac{1}{2} = -1",
    },
];

const ES_PARA_PUNTO = [
    { id: "pt1", retta: "y = 2x + 3", punto: "P(2,\\,0)",
      para: "y = 2x - 4", perp: "y = -\\tfrac{1}{2}x + 1",
      para_steps: ["q = 0 - 2 \\cdot 2 = -4", "y = 2x - 4"],
      perp_steps: ["m_\\perp = -\\tfrac{1}{2}", "q = 0 + \\tfrac{1}{2} \\cdot 2 = 1", "y = -\\tfrac{1}{2}x + 1"] },
    { id: "pt2", retta: "y = -x + 2", punto: "P(3,\\,1)",
      para: "y = -x + 4", perp: "y = x - 2",
      para_steps: ["q = 1 - (-1) \\cdot 3 = 4", "y = -x + 4"],
      perp_steps: ["m_\\perp = 1", "q = 1 - 1 \\cdot 3 = -2", "y = x - 2"] },
    { id: "pt3", retta: "y = -2x + 1", punto: "P(2,\\,4)",
      para: "y = -2x + 8", perp: "y = \\tfrac{1}{2}x + 3",
      para_steps: ["q = 4 - (-2) \\cdot 2 = 8", "y = -2x + 8"],
      perp_steps: ["m_\\perp = \\tfrac{1}{2}", "q = 4 - \\tfrac{1}{2} \\cdot 2 = 3", "y = \\tfrac{1}{2}x + 3"] },
    { id: "pt4", retta: "y = 3x - 1", punto: "P(3,\\,2)",
      para: "y = 3x - 7", perp: "y = -\\tfrac{1}{3}x + 3",
      para_steps: ["q = 2 - 3 \\cdot 3 = -7", "y = 3x - 7"],
      perp_steps: ["m_\\perp = -\\tfrac{1}{3}", "q = 2 + \\tfrac{1}{3} \\cdot 3 = 3", "y = -\\tfrac{1}{3}x + 3"] },
];


const ES_RADICALI = [
    { id: "rad1", radicals: [
        { expr: "\\sqrt{12}", scompo: "\\sqrt{4 \\cdot 3}", result: "2\\sqrt{3}", power: "2 \\cdot 3^{1/2}" },
        { expr: "\\sqrt{50}", scompo: "\\sqrt{25 \\cdot 2}", result: "5\\sqrt{2}", power: "5 \\cdot 2^{1/2}" },
        { expr: "\\sqrt[3]{24}", scompo: "\\sqrt[3]{8 \\cdot 3}", result: "2\\sqrt[3]{3}", power: "2 \\cdot 3^{1/3}" },
        { expr: "\\sqrt[3]{54}", scompo: "\\sqrt[3]{27 \\cdot 2}", result: "3\\sqrt[3]{2}", power: "3 \\cdot 2^{1/3}" },
    ]},
    { id: "rad2", radicals: [
        { expr: "\\sqrt{18}", scompo: "\\sqrt{9 \\cdot 2}", result: "3\\sqrt{2}", power: "3 \\cdot 2^{1/2}" },
        { expr: "\\sqrt{75}", scompo: "\\sqrt{25 \\cdot 3}", result: "5\\sqrt{3}", power: "5 \\cdot 3^{1/2}" },
        { expr: "\\sqrt[3]{16}", scompo: "\\sqrt[3]{8 \\cdot 2}", result: "2\\sqrt[3]{2}", power: "2 \\cdot 2^{1/3}" },
        { expr: "\\sqrt[3]{81}", scompo: "\\sqrt[3]{27 \\cdot 3}", result: "3\\sqrt[3]{3}", power: "3 \\cdot 3^{1/3}" },
    ]},
    { id: "rad3", radicals: [
        { expr: "\\sqrt{45}", scompo: "\\sqrt{9 \\cdot 5}", result: "3\\sqrt{5}", power: "3 \\cdot 5^{1/2}" },
        { expr: "\\sqrt{72}", scompo: "\\sqrt{36 \\cdot 2}", result: "6\\sqrt{2}", power: "6 \\cdot 2^{1/2}" },
        { expr: "\\sqrt[3]{40}", scompo: "\\sqrt[3]{8 \\cdot 5}", result: "2\\sqrt[3]{5}", power: "2 \\cdot 5^{1/3}" },
        { expr: "\\sqrt[3]{128}", scompo: "\\sqrt[3]{64 \\cdot 2}", result: "4\\sqrt[3]{2}", power: "4 \\cdot 2^{1/3}" },
    ]},
    { id: "rad4", radicals: [
        { expr: "\\sqrt{20}", scompo: "\\sqrt{4 \\cdot 5}", result: "2\\sqrt{5}", power: "2 \\cdot 5^{1/2}" },
        { expr: "\\sqrt{98}", scompo: "\\sqrt{49 \\cdot 2}", result: "7\\sqrt{2}", power: "7 \\cdot 2^{1/2}" },
        { expr: "\\sqrt[3]{250}", scompo: "\\sqrt[3]{125 \\cdot 2}", result: "5\\sqrt[3]{2}", power: "5 \\cdot 2^{1/3}" },
        { expr: "\\sqrt[3]{108}", scompo: "\\sqrt[3]{27 \\cdot 4}", result: "3\\sqrt[3]{4}", power: "3 \\cdot 4^{1/3}" },
    ]},
];

// ── Rendering helpers per il display step-by-step del sistema ────────────────
function SisStepHead({ n, color, title }: { n: number; color: string; title: string }): React.ReactElement {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: n > 1 ? 12 : 0, marginBottom: 4 }}>
            <div style={{
                width: 22, height: 22, borderRadius: "50%", background: color, color: "#fff",
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>{n}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{title}</span>
        </div>
    );
}
function SisSysBox({ latex }: { latex: string }): React.ReactElement {
    return (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 12px", textAlign: "center", marginBottom: 4 }}>
            <DisplayMath>{latex}</DisplayMath>
        </div>
    );
}
function SisWorkBox({ latex }: { latex: string }): React.ReactElement {
    return (
        <div style={{ background: "#fff", border: "1px dashed #cbd5e1", borderRadius: 6, padding: "6px 12px", marginBottom: 4, overflowX: "auto" }}>
            <DisplayMath>{latex}</DisplayMath>
        </div>
    );
}

// ── GameProblem ───────────────────────────────────────────────────────────────

interface GameProblem {
    id: string; num: number; title: string; punti: number;
    content: React.ReactNode;
    solution: React.ReactNode;
}

type Sel = {
    conv: typeof ES_CONV[0];
    dp: typeof ES_DUE_PUNTI[0];
    pm: typeof ES_PUNTO_M[0];
    pp: typeof ES_PARA_PERP[0];
    pt: typeof ES_PARA_PUNTO[0];
    sis: SisData;
    rad: typeof ES_RADICALI[0];
};

function makeProblems(sel: Sel): GameProblem[] {
    const { conv, dp, pm, pp, pt, sis, rad } = sel;
    return [
        // ── Es. 1 — Forma implicita → esplicita
        {
            id: "es1", num: 1, title: "Forma implicita → esplicita", punti: 6,
            content: (
                <div>
                    <p style={T.q}>
                        Scrivi la retta <L s={`$${conv.eq}$`} /> in forma esplicita <L s="$y = mx + q$" />.
                        Indica il coefficiente angolare <L s="$m$" /> e il termine noto <L s="$q$" />.
                    </p>
                    <div style={T.nota}>Isola <L s="$y$" /> al primo membro.</div>
                </div>
            ),
            solution: (
                <div>
                    {conv.steps.map((s, i) => <DisplayMath key={i}>{s}</DisplayMath>)}
                    <Ris><L s={`$${conv.expl}$`} /></Ris>
                    <p style={{ ...T.solLine, marginTop: 8 }}>
                        <L s={`$m = ${conv.m}$`} />, &ensp; <L s={`$q = ${conv.q}$`} />
                    </p>
                </div>
            ),
        },
        // ── Es. 2 — Retta per due punti
        {
            id: "es2", num: 2, title: "Retta per due punti", punti: 10,
            content: (
                <div>
                    <p style={T.q}>
                        Trova l'equazione della retta passante per i punti <L s={`$${dp.A}$`} /> e <L s={`$${dp.B}$`} />.
                    </p>
                    <div style={T.nota}>Usa la formula della retta passante per due punti.</div>
                </div>
            ),
            solution: (
                <div>
                    {dp.steps.map((s, i) => <DisplayMath key={i}>{s}</DisplayMath>)}
                    <Ris><L s={`$${dp.ris}$`} /></Ris>
                </div>
            ),
        },
        // ── Es. 3 — Retta per un punto con m noto
        {
            id: "es3", num: 3, title: "Retta per un punto con m noto", punti: 8,
            content: (
                <div>
                    <p style={T.q}>
                        Trova l'equazione della retta passante per <L s={`$${pm.punto}$`} /> con coefficiente angolare <L s={`$m = ${pm.mStr}$`} />.
                    </p>
                    <div style={T.nota}>Usa la formula della retta passante per un punto di coefficiente angolare noto.</div>
                </div>
            ),
            solution: (
                <div>
                    {pm.steps.map((s, i) => <DisplayMath key={i}>{s}</DisplayMath>)}
                    <Ris><L s={`$${pm.ris}$`} /></Ris>
                </div>
            ),
        },
        // ── Es. 4 — Parallelismo e perpendicolarità
        {
            id: "es4", num: 4, title: "Parallelismo e perpendicolarità", punti: 8,
            content: (
                <div>
                    <p style={T.q}>Date le seguenti rette, individua quali coppie sono <strong>parallele</strong> e quali sono <strong>perpendicolari</strong>.</p>
                    <div style={{ marginTop: 10 }}>
                        {pp.lines.map(l => (
                            <p key={l.label} style={{ fontSize: 14, margin: "5px 0", color: "#1e293b" }}>
                                <strong>{l.label}:</strong>&ensp;<L s={`$${l.eq}$`} />
                            </p>
                        ))}
                    </div>
                    <div style={T.nota}>Usa le condizioni di parallelismo e perpendicolarità tra rette.</div>
                </div>
            ),
            solution: (
                <div>
                    <p style={T.solTitle}>Coefficienti angolari:</p>
                    {pp.lines.map(l => (
                        <p key={l.label} style={T.solLine}>
                            <strong>{l.label}:</strong>&ensp;<L s={`$m = ${l.mStr}$`} />
                        </p>
                    ))}
                    <p style={{ ...T.solLine, marginTop: 10 }}>
                        <strong>Parallele:</strong>&ensp;
                        <span style={T.green}><L s={`$${pp.parallel}$`} /></span>
                        &ensp;(<L s={`$${pp.parallelWhy}$`} />)
                    </p>
                    <p style={T.solLine}>
                        <strong>Perpendicolari:</strong>&ensp;
                        <span style={T.green}><L s={`$${pp.perp}$`} /></span>
                        &ensp;(<L s={`$${pp.perpWhy}$`} />)
                    </p>
                </div>
            ),
        },
        // ── Es. 5 — Retta parallela/perpendicolare per un punto
        {
            id: "es5", num: 5, title: "Retta parallela e perpendicolare per un punto", punti: 8,
            content: (
                <div>
                    <p style={T.q}>Data la retta <L s={`$${pt.retta}$`} />, trova la retta:</p>
                    <ol style={{ fontSize: 14, lineHeight: 2.2, paddingLeft: 20, color: "#1e293b" }}>
                        <li>Parallela passante per <L s={`$${pt.punto}$`} /></li>
                        <li>Perpendicolare passante per <L s={`$${pt.punto}$`} /></li>
                    </ol>
                </div>
            ),
            solution: (
                <div>
                    <p style={T.solTitle}>a) Retta parallela (stesso m):</p>
                    {pt.para_steps.map((s, i) => <DisplayMath key={i}>{s}</DisplayMath>)}
                    <Ris><L s={`$${pt.para}$`} /></Ris>
                    <p style={{ ...T.solTitle, marginTop: 14 }}>b) Retta perpendicolare:</p>
                    {pt.perp_steps.map((s, i) => <DisplayMath key={i}>{s}</DisplayMath>)}
                    <Ris><L s={`$${pt.perp}$`} /></Ris>
                </div>
            ),
        },
        // ── Es. 6 — Sistema lineare sostituzione
        {
            id: "es6", num: 6, title: "Sistema lineare — sostituzione", punti: 12,
            content: (
                <div>
                    <p style={T.q}>
                        Risolvi il sistema con il metodo di sostituzione. Trova le coordinate del punto di intersezione.
                    </p>
                    <div style={{ marginTop: 12, padding: "6px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                        <DisplayMath>{sis.sys1}</DisplayMath>
                    </div>
                    <div style={T.nota}>
                        Isola <L s={`$${sis.isolateVar}$`} /> dalla ({sis.isolateFrom}), poi sostituisci nella ({sis.otherEqNum}).
                    </div>
                </div>
            ),
            solution: (
                <div>
                    <SisStepHead n={1} color="#16a34a" title="Sistema di partenza" />
                    <SisSysBox latex={sis.sys1} />

                    <SisStepHead n={2} color="#1e40af" title={`Ricava ${sis.isolateVar} dalla (${sis.isolateFrom})`} />
                    <SisSysBox latex={sis.sys2} />
                    <SisWorkBox latex={sis.work2} />

                    <SisStepHead n={3} color="#d97706" title={`Sostituisci ${sis.isolateVar} nella (${sis.otherEqNum})`} />
                    <SisSysBox latex={sis.sys3} />
                    <SisWorkBox latex={sis.work3} />

                    <SisStepHead n={4} color="#7c3aed" title={`Risolvi per ${sis.otherVar}`} />
                    <SisSysBox latex={sis.sys4} />
                    <SisWorkBox latex={sis.work4} />

                    <SisStepHead n={5} color="#15803d" title={`Calcola ${sis.isolateVar} per sostituzione inversa`} />
                    <SisWorkBox latex={sis.work5} />
                    <Ris><L s={`$${sis.solutionLatex}$`} /></Ris>
                </div>
            ),
        },
        // ── Es. 7 — Radicali: definizione e condizione di esistenza (fisso)
        {
            id: "es7", num: 7, title: "Radicali — definizione e condizione di esistenza", punti: 5,
            content: (
                <div>
                    <p style={T.q}>
                        Scrivi la definizione di <em>radicale quadratico</em> e la condizione di esistenza.
                    </p>
                </div>
            ),
            solution: (
                <div>
                    <p style={T.solTitle}>Definizione:</p>
                    <p style={T.solLine}>
                        <L s="$\\sqrt{a}$" /> è il numero non negativo il cui quadrato è <L s="$a$" />.
                    </p>
                    <p style={{ ...T.solTitle, marginTop: 10 }}>Condizione di esistenza:</p>
                    <p style={T.solLine}>
                        <L s="$\\sqrt{a}$" /> è definita se e solo se <span style={T.green}><L s="$a \\geq 0$" /></span>
                    </p>
                </div>
            ),
        },
        // ── Es. 8 — Radicali: semplificazione + forma come potenza
        {
            id: "es8", num: 8, title: "Radicali — semplificazione e potenze", punti: 8,
            content: (
                <div>
                    <p style={T.q}>
                        Semplifica i seguenti radicali estraendo il fattore fuori dal segno di radice,
                        poi esprimi il risultato anche come potenza con esponente frazionario.
                    </p>
                    <div style={{ marginTop: 8 }}>
                        {rad.radicals.map(r => (
                            <p key={r.expr} style={{ fontSize: 15, margin: "5px 0", color: "#1e293b" }}>
                                • <L s={`$${r.expr}$`} />
                            </p>
                        ))}
                    </div>
                    <div style={T.nota}>Scomponi il radicando come prodotto di una potenza perfetta per un fattore.</div>
                </div>
            ),
            solution: (
                <div>
                    {rad.radicals.map(r => (
                        <p key={r.expr} style={{ ...T.solLine, marginBottom: 6 }}>
                            <L s={`$${r.expr} = ${r.scompo} = ${r.result} = $`} />
                            <span style={T.green}><L s={`$${r.power}$`} /></span>
                        </p>
                    ))}
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

export default function BattagliaRette2Demo(): React.ReactElement {
    const [sel] = useState<Sel>(() => ({
        conv: rand(ES_CONV),
        dp: rand(ES_DUE_PUNTI),
        pm: rand(ES_PUNTO_M),
        pp: rand(ES_PARA_PERP),
        pt: rand(ES_PARA_PUNTO),
        sis: generateSisData(),
        rad: rand(ES_RADICALI),
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
                    <h1 style={G.startTitle}>Rette, Sistemi e Radicali</h1>
                    <p style={G.startSub}>Matematica · A.S. 2025/2026</p>
                    <div style={G.rulesBox}>
                        <Rule icon="📋" text={`${probs.length} esercizi`} />
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
                            const dotColor = s.score === "correct" ? "#16a34a"
                                : s.score === "wrong" ? "#dc2626"
                                : s.timedOut ? "#f59e0b" : "#94a3b8";
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

                {cur.timedOut && (
                    <div style={G.timeoutBanner}>⏰ Tempo scaduto! Ecco la soluzione:</div>
                )}

                {!cur.revealed && (
                    <div style={G.actionArea}>
                        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 12px" }}>
                            Risolvi sul foglio, poi verifica la soluzione.
                        </p>
                        <button
                            onClick={() => { setPwdInput(""); setPwdError(false); setPwdModal(true); }}
                            style={G.btnReveal}
                        >
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

// ── Text styles ───────────────────────────────────────────────────────────────
const T = {
    q: { fontSize: 15, lineHeight: 1.8, color: "#1e293b", marginBottom: 8 } as React.CSSProperties,
    formula: {
        background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6,
        padding: "8px 14px", fontSize: 13, color: "#475569", marginTop: 8,
    } as React.CSSProperties,
    nota: {
        background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6,
        padding: "6px 12px", fontSize: 13, color: "#713f12", marginTop: 8,
    } as React.CSSProperties,
    solTitle: { fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 6 } as React.CSSProperties,
    solLine: { fontSize: 13, margin: "3px 0", color: "#1e293b" } as React.CSSProperties,
    green: { color: "#15803d", fontWeight: 700 } as React.CSSProperties,
};

// ── Game Styles ───────────────────────────────────────────────────────────────
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
    startCard: {
        background: "#fff", borderRadius: 20,
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        padding: "40px 32px", maxWidth: 480, width: "100%",
        textAlign: "center" as const, marginTop: 32,
    } as React.CSSProperties,
    startBadge: {
        display: "inline-block", background: "#eff6ff", color: "#1d4ed8",
        fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
        letterSpacing: "0.5px", marginBottom: 16,
    } as React.CSSProperties,
    startTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" } as React.CSSProperties,
    startSub: { fontSize: 14, color: "#64748b", marginBottom: 28 } as React.CSSProperties,
    rulesBox: {
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12,
        padding: "16px 20px", marginBottom: 28, textAlign: "left" as const,
    } as React.CSSProperties,
    startBtn: {
        background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 12,
        padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer",
        width: "100%", marginBottom: 12, transition: "background 0.15s",
    } as React.CSSProperties,
    backLink: {
        display: "block", color: "#94a3b8", textDecoration: "none",
        fontSize: 13, marginTop: 4,
    } as React.CSSProperties,
    header: {
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", maxWidth: 700, background: "#fff",
        border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 16px",
        marginBottom: 12, flexWrap: "wrap" as const,
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
        background: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: 14,
        padding: "4px 12px", borderRadius: 20, border: "1px solid #fcd34d",
    } as React.CSSProperties,
    endBtnHeader: {
        background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
        borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontWeight: 600,
    } as React.CSSProperties,
    card: {
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700,
        overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0",
    } as React.CSSProperties,
    cardHeader: {
        background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
    } as React.CSSProperties,
    cardTitle: { color: "#0f172a", fontWeight: 700, fontSize: 15 } as React.CSSProperties,
    puntiBadge: {
        background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 700,
        padding: "2px 10px", borderRadius: 20,
    } as React.CSSProperties,
    cardBody: { padding: "20px 24px", minHeight: 120 } as React.CSSProperties,
    actionArea: { padding: "16px 24px 20px", borderTop: "1px solid #f1f5f9" } as React.CSSProperties,
    btnReveal: {
        width: "100%", padding: "12px", background: "#1d4ed8", color: "#fff",
        border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
    } as React.CSSProperties,
    timeoutBanner: {
        background: "#fef3c7", borderTop: "1px solid #fcd34d", padding: "10px 20px",
        color: "#92400e", fontWeight: 600, fontSize: 14,
    } as React.CSSProperties,
    solutionBox: {
        borderTop: "2px solid #22c55e", padding: "16px 24px", background: "#f0fdf4",
    } as React.CSSProperties,
    solutionLabel: {
        fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 10,
        textTransform: "uppercase" as const, letterSpacing: "0.5px",
    } as React.CSSProperties,
    solutionContent: { marginBottom: 16 } as React.CSSProperties,
    selfScoreArea: {
        borderTop: "1px solid #bbf7d0", paddingTop: 14, textAlign: "center" as const,
    } as React.CSSProperties,
    btnCorrect: {
        background: "#16a34a", color: "#fff", border: "none", borderRadius: 8,
        padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", flex: 1,
    } as React.CSSProperties,
    btnWrong: {
        background: "#dc2626", color: "#fff", border: "none", borderRadius: 8,
        padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", flex: 1,
    } as React.CSSProperties,
    scoredBanner: {
        marginTop: 12, fontWeight: 700, fontSize: 15, textAlign: "center" as const,
        padding: 12, borderRadius: 10, border: "1px solid",
    } as React.CSSProperties,
    nav: {
        display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 700,
        marginTop: 12, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
        padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    } as React.CSSProperties,
    navBtn: {
        background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0",
        borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
        cursor: "pointer", whiteSpace: "nowrap" as const,
    } as React.CSSProperties,
    dots: {
        display: "flex", gap: 6, flex: 1, justifyContent: "center", flexWrap: "wrap" as const,
    } as React.CSSProperties,
    legend: {
        display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" as const, justifyContent: "center",
    } as React.CSSProperties,
    legendItem: {
        fontSize: 11, color: "#64748b", display: "flex", alignItems: "center",
        background: "#fff", padding: "3px 8px", borderRadius: 20, border: "1px solid #e2e8f0",
    } as React.CSSProperties,
    endCard: {
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20,
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)", padding: "32px 24px",
        maxWidth: 700, width: "100%", marginTop: 24,
    } as React.CSSProperties,
    endHeader: { textAlign: "center" as const, marginBottom: 16 } as React.CSSProperties,
    trophyBig: { fontSize: 48, marginBottom: 8 } as React.CSSProperties,
    endTitle: { color: "#0f172a", fontSize: 22, fontWeight: 700, margin: "0 0 4px" } as React.CSSProperties,
    scoreBig: { fontSize: 52, fontWeight: 800, color: "#1d4ed8" } as React.CSSProperties,
    endRow: {
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12,
        padding: "12px 16px", marginBottom: 10, fontFamily: "system-ui, sans-serif",
    } as React.CSSProperties,
    endDot: {
        width: 28, height: 28, borderRadius: "50%",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
    } as React.CSSProperties,
    endSolution: {
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
        padding: "10px 14px", marginTop: 8, fontSize: 13, color: "#334155",
    } as React.CSSProperties,
} as const;

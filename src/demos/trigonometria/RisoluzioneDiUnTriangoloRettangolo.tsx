/**
 * RisoluzioneTriangoloRettangolo - Demo interattiva
 * L'utente risolve un triangolo rettangolo scegliendo i teoremi da applicare
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    Latex,
    DemoContainer,
    ProblemCard,
    StepCard,
    GenerateButton,
    InfoBox,
} from "../../components/ui";

// ============ TIPI ============

interface TriangoloRettangolo {
    // Cateti
    a: number | null; // cateto opposto ad α
    b: number | null; // cateto adiacente ad α (opposto a β)
    c: number | null; // ipotenusa
    // Angoli (in gradi)
    alpha: number | null; // angolo acuto α
    beta: number | null;  // angolo acuto β
    gamma: number;        // angolo retto (sempre 90°)
}

interface TriangoloCompleto {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
}

interface TeoremaApplicato {
    nome: string;
    formula: string;
    calcolo: string;
    risultato: string;
    datoTrovato: string;
}

type DatoMancante = "a" | "b" | "c" | "alpha" | "beta";

// ============ UTILITY ============

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arrotonda(n: number, decimali: number = 2): number {
    return Math.round(n * Math.pow(10, decimali)) / Math.pow(10, decimali);
}

function gradi(radianti: number): number {
    return (radianti * 180) / Math.PI;
}

function radianti(gradi: number): number {
    return (gradi * Math.PI) / 180;
}

// ============ GENERATORE PROBLEMI ============

function generaTriangoloRettangolo(): {
    triangoloIniziale: TriangoloRettangolo;
    triangoloCompleto: TriangoloCompleto;
    datiNoti: string[];
    datiDaTrovare: string[];
} {
    // Genera un triangolo rettangolo completo, poi nascondi alcuni dati
    const tipiProblema = [
        "due_cateti",
        "cateto_ipotenusa",
        "cateto_angolo",
        "ipotenusa_angolo",
    ];

    const tipo = tipiProblema[randomInt(0, tipiProblema.length - 1)];

    let triangoloIniziale: TriangoloRettangolo = {
        a: null,
        b: null,
        c: null,
        alpha: null,
        beta: null,
        gamma: 90,
    };

    let triangoloCompleto: TriangoloCompleto;
    let datiNoti: string[] = [];
    let datiDaTrovare: string[] = [];

    switch (tipo) {
        case "due_cateti":
            // Dati: a e b
            const a1 = randomInt(3, 8);
            const b1 = randomInt(3, 8);
            const c1 = arrotonda(Math.sqrt(a1 * a1 + b1 * b1));
            const alpha1 = arrotonda(gradi(Math.atan(a1 / b1)));
            const beta1 = arrotonda(90 - alpha1);

            triangoloIniziale.a = a1;
            triangoloIniziale.b = b1;
            triangoloCompleto = { a: a1, b: b1, c: c1, alpha: alpha1, beta: beta1 };
            datiNoti = [`b = ${b1}`, `a = ${a1}`];
            datiDaTrovare = ["c", "α", "β"];
            break;

        case "cateto_ipotenusa":
            // Dati: b e c
            const c2 = randomInt(8, 12);
            const b2 = randomInt(4, c2 - 2);
            const a2 = arrotonda(Math.sqrt(c2 * c2 - b2 * b2));
            const alpha2 = arrotonda(gradi(Math.asin(a2 / c2)));
            const beta2 = arrotonda(90 - alpha2);

            triangoloIniziale.b = b2;
            triangoloIniziale.c = c2;
            triangoloCompleto = { a: a2, b: b2, c: c2, alpha: alpha2, beta: beta2 };
            datiNoti = [`b = ${b2}`, `c = ${c2}`];
            datiDaTrovare = ["a", "α", "β"];
            break;

        case "cateto_angolo":
            // Dati: b e α
            const b3 = randomInt(5, 10);
            const alpha3 = randomInt(30, 60);
            const a3 = arrotonda(b3 * Math.tan(radianti(alpha3)));
            const c3 = arrotonda(b3 / Math.cos(radianti(alpha3)));
            const beta3 = 90 - alpha3;

            triangoloIniziale.b = b3;
            triangoloIniziale.alpha = alpha3;
            triangoloCompleto = { a: a3, b: b3, c: c3, alpha: alpha3, beta: beta3 };
            datiNoti = [`b = ${b3}`, `α = ${alpha3}°`];
            datiDaTrovare = ["a", "c", "β"];
            break;

        case "ipotenusa_angolo":
            // Dati: c e β
            const c4 = randomInt(8, 12);
            const beta4 = randomInt(30, 60);
            const alpha4 = 90 - beta4;
            const a4 = arrotonda(c4 * Math.sin(radianti(alpha4)));
            const b4 = arrotonda(c4 * Math.cos(radianti(alpha4)));

            triangoloIniziale.c = c4;
            triangoloIniziale.beta = beta4;
            triangoloCompleto = { a: a4, b: b4, c: c4, alpha: alpha4, beta: beta4 };
            datiNoti = [`c = ${c4}`, `β = ${beta4}°`];
            datiDaTrovare = ["a", "b", "α"];
            break;

        default:
            // Fallback
            const aF = 3, bF = 4, cF = 5, alphaF = 37, betaF = 53;
            triangoloIniziale.a = aF;
            triangoloIniziale.b = bF;
            triangoloCompleto = { a: aF, b: bF, c: cF, alpha: alphaF, beta: betaF };
            datiNoti = [`a = ${aF}`, `b = ${bF}`];
            datiDaTrovare = ["c", "α", "β"];
    }

    return { triangoloIniziale, triangoloCompleto, datiNoti, datiDaTrovare };
}

// ============ TEOREMI ============

interface OpzioneTeorema {
    id: string;
    nome: string;
    formula: string;
    applicabile: boolean;
    motivo?: string;
}

function getTeoremiDisponibili(
    triangolo: TriangoloRettangolo,
    datiMancanti: DatoMancante[]
): OpzioneTeorema[] {
    const opzioni: OpzioneTeorema[] = [];

    // Teorema di Pitagora
    const pitagoraApplicabile =
        (triangolo.a !== null && triangolo.b !== null && datiMancanti.includes("c")) ||
        (triangolo.a !== null && triangolo.c !== null && datiMancanti.includes("b")) ||
        (triangolo.b !== null && triangolo.c !== null && datiMancanti.includes("a"));

    opzioni.push({
        id: "pitagora",
        nome: "Teorema di Pitagora",
        formula: "a^2 + b^2 = c^2",
        applicabile: pitagoraApplicabile,
        motivo: pitagoraApplicabile ? "" : "Servono due lati noti",
    });

    // Primo teorema sui triangoli rettangoli (seno e coseno)
    const teorema1Applicabile =
        (triangolo.a !== null && triangolo.c !== null && datiMancanti.includes("alpha")) ||
        (triangolo.a !== null && triangolo.alpha !== null && datiMancanti.includes("c")) ||
        (triangolo.c !== null && triangolo.alpha !== null && datiMancanti.includes("a")) ||
        (triangolo.b !== null && triangolo.c !== null && datiMancanti.includes("beta")) ||
        (triangolo.b !== null && triangolo.beta !== null && datiMancanti.includes("c")) ||
        // Aggiungi i casi con coseno
        (triangolo.b !== null && triangolo.c !== null && datiMancanti.includes("alpha")) ||
        (triangolo.b !== null && triangolo.alpha !== null && datiMancanti.includes("c")) ||
        (triangolo.a !== null && triangolo.c !== null && datiMancanti.includes("beta")) ||
        (triangolo.a !== null && triangolo.beta !== null && datiMancanti.includes("c"));

    opzioni.push({
        id: "teorema1",
        nome: "Primo teorema (seno/coseno)",
        formula: "\\sin\\alpha = \\frac{a}{c}, \\; \\cos\\alpha = \\frac{b}{c}, \\; \\sin\\beta = \\frac{b}{c}, \\; \\cos\\beta = \\frac{a}{c}",
        applicabile: teorema1Applicabile,
        motivo: teorema1Applicabile ? "" : "Serve un cateto e ipotenusa, o un angolo",
    });

    // Secondo teorema sui triangoli rettangoli (tangente)
    const teorema2Applicabile =
        (triangolo.a !== null && triangolo.b !== null &&
            (datiMancanti.includes("alpha") || datiMancanti.includes("beta"))) ||
        (triangolo.a !== null && triangolo.alpha !== null && datiMancanti.includes("b")) ||
        (triangolo.b !== null && triangolo.alpha !== null && datiMancanti.includes("a")) ||
        (triangolo.a !== null && triangolo.beta !== null && datiMancanti.includes("b")) ||
        (triangolo.b !== null && triangolo.beta !== null && datiMancanti.includes("a"));

    opzioni.push({
        id: "teorema2",
        nome: "Secondo teorema (tangente)",
        formula: "\\tan\\alpha = \\frac{a}{b}, \\quad \\tan\\beta = \\frac{b}{a}",
        applicabile: teorema2Applicabile,
        motivo: teorema2Applicabile ? "" : "Servono due cateti o un cateto e un angolo",
    });

    // Somma angoli
    const sommaAngoliApplicabile =
        (triangolo.alpha !== null && datiMancanti.includes("beta")) ||
        (triangolo.beta !== null && datiMancanti.includes("alpha"));

    opzioni.push({
        id: "somma_angoli",
        nome: "Somma angoli triangolo",
        formula: "\\alpha + \\beta + \\gamma = 180°",
        applicabile: sommaAngoliApplicabile,
        motivo: sommaAngoliApplicabile ? "" : "Serve un angolo acuto noto",
    });

    return opzioni;
}

function applicaTeorema(
    teoremaId: string,
    triangolo: TriangoloRettangolo,
    datoMancante: DatoMancante
): { nuovoTriangolo: TriangoloRettangolo; passo: TeoremaApplicato } | null {
    const t = { ...triangolo };
    let passo: TeoremaApplicato | null = null;

    switch (teoremaId) {
        case "pitagora":
            if (datoMancante === "c" && t.a !== null && t.b !== null) {
                const c = arrotonda(Math.sqrt(t.a * t.a + t.b * t.b));
                passo = {
                    nome: "Teorema di Pitagora",
                    formula: "c = \\sqrt{a^2 + b^2}",
                    calcolo: `c = \\sqrt{${t.a}^2 + ${t.b}^2} = \\sqrt{${t.a * t.a} + ${t.b * t.b}} = \\sqrt{${t.a * t.a + t.b * t.b}}`,
                    risultato: `c = ${c}`,
                    datoTrovato: "c",
                };
                t.c = c;
            } else if (datoMancante === "a" && t.b !== null && t.c !== null) {
                const a = arrotonda(Math.sqrt(t.c * t.c - t.b * t.b));
                passo = {
                    nome: "Teorema di Pitagora",
                    formula: "a = \\sqrt{c^2 - b^2}",
                    calcolo: `a = \\sqrt{${t.c}^2 - ${t.b}^2} = \\sqrt{${t.c * t.c} - ${t.b * t.b}} = \\sqrt{${t.c * t.c - t.b * t.b}}`,
                    risultato: `a = ${a}`,
                    datoTrovato: "a",
                };
                t.a = a;
            } else if (datoMancante === "b" && t.a !== null && t.c !== null) {
                const b = arrotonda(Math.sqrt(t.c * t.c - t.a * t.a));
                passo = {
                    nome: "Teorema di Pitagora",
                    formula: "b = \\sqrt{c^2 - a^2}",
                    calcolo: `b = \\sqrt{${t.c}^2 - ${t.a}^2} = \\sqrt{${t.c * t.c} - ${t.a * t.a}} = \\sqrt{${t.c * t.c - t.a * t.a}}`,
                    risultato: `b = ${b}`,
                    datoTrovato: "b",
                };
                t.b = b;
            }
            break;

        case "teorema1":
            // Casi con SENO
            if (datoMancante === "alpha" && t.a !== null && t.c !== null) {
                const alpha = arrotonda(gradi(Math.asin(t.a / t.c)));
                passo = {
                    nome: "Primo teorema (seno)",
                    formula: "\\sin\\alpha = \\frac{a}{c} \\text{ (cateto opposto / ipotenusa)}",
                    calcolo: `\\sin\\alpha = \\frac{${t.a}}{${t.c}} = ${arrotonda(t.a / t.c, 3)}`,
                    risultato: `\\alpha = \\arcsin(${arrotonda(t.a / t.c, 3)}) \\approx ${alpha}°`,
                    datoTrovato: "α",
                };
                t.alpha = alpha;
            }
            // Caso COSENO per alpha
            else if (datoMancante === "alpha" && t.b !== null && t.c !== null) {
                const alpha = arrotonda(gradi(Math.acos(t.b / t.c)));
                passo = {
                    nome: "Primo teorema (coseno)",
                    formula: "\\cos\\alpha = \\frac{b}{c} \\text{ (cateto adiacente / ipotenusa)}",
                    calcolo: `\\cos\\alpha = \\frac{${t.b}}{${t.c}} = ${arrotonda(t.b / t.c, 3)}`,
                    risultato: `\\alpha = \\arccos(${arrotonda(t.b / t.c, 3)}) \\approx ${alpha}°`,
                    datoTrovato: "α",
                };
                t.alpha = alpha;
            }
            else if (datoMancante === "beta" && t.b !== null && t.c !== null) {
                const beta = arrotonda(gradi(Math.asin(t.b / t.c)));
                passo = {
                    nome: "Primo teorema (seno)",
                    formula: "\\sin\\beta = \\frac{b}{c} \\text{ (cateto opposto / ipotenusa)}",
                    calcolo: `\\sin\\beta = \\frac{${t.b}}{${t.c}} = ${arrotonda(t.b / t.c, 3)}`,
                    risultato: `\\beta = \\arcsin(${arrotonda(t.b / t.c, 3)}) \\approx ${beta}°`,
                    datoTrovato: "β",
                };
                t.beta = beta;
            }
            // Caso COSENO per beta
            else if (datoMancante === "beta" && t.a !== null && t.c !== null) {
                const beta = arrotonda(gradi(Math.acos(t.a / t.c)));
                passo = {
                    nome: "Primo teorema (coseno)",
                    formula: "\\cos\\beta = \\frac{a}{c} \\text{ (cateto adiacente / ipotenusa)}",
                    calcolo: `\\cos\\beta = \\frac{${t.a}}{${t.c}} = ${arrotonda(t.a / t.c, 3)}`,
                    risultato: `\\beta = \\arccos(${arrotonda(t.a / t.c, 3)}) \\approx ${beta}°`,
                    datoTrovato: "β",
                };
                t.beta = beta;
            }
            else if (datoMancante === "a" && t.c !== null && t.alpha !== null) {
                const a = arrotonda(t.c * Math.sin(radianti(t.alpha)));
                passo = {
                    nome: "Primo teorema (seno)",
                    formula: "a = c \\cdot \\sin\\alpha",
                    calcolo: `a = ${t.c} \\cdot \\sin(${t.alpha}°) = ${t.c} \\cdot ${arrotonda(Math.sin(radianti(t.alpha)), 3)}`,
                    risultato: `a \\approx ${a}`,
                    datoTrovato: "a",
                };
                t.a = a;
            }
            // Caso COSENO per trovare a
            else if (datoMancante === "a" && t.c !== null && t.beta !== null) {
                const a = arrotonda(t.c * Math.cos(radianti(t.beta)));
                passo = {
                    nome: "Primo teorema (coseno)",
                    formula: "a = c \\cdot \\cos\\beta",
                    calcolo: `a = ${t.c} \\cdot \\cos(${t.beta}°) = ${t.c} \\cdot ${arrotonda(Math.cos(radianti(t.beta)), 3)}`,
                    risultato: `a \\approx ${a}`,
                    datoTrovato: "a",
                };
                t.a = a;
            }
            else if (datoMancante === "b" && t.c !== null && t.beta !== null) {
                const b = arrotonda(t.c * Math.sin(radianti(t.beta)));
                passo = {
                    nome: "Primo teorema (seno)",
                    formula: "b = c \\cdot \\sin\\beta",
                    calcolo: `b = ${t.c} \\cdot \\sin(${t.beta}°) = ${t.c} \\cdot ${arrotonda(Math.sin(radianti(t.beta)), 3)}`,
                    risultato: `b \\approx ${b}`,
                    datoTrovato: "b",
                };
                t.b = b;
            }
            // Caso COSENO per trovare b
            else if (datoMancante === "b" && t.c !== null && t.alpha !== null) {
                const b = arrotonda(t.c * Math.cos(radianti(t.alpha)));
                passo = {
                    nome: "Primo teorema (coseno)",
                    formula: "b = c \\cdot \\cos\\alpha",
                    calcolo: `b = ${t.c} \\cdot \\cos(${t.alpha}°) = ${t.c} \\cdot ${arrotonda(Math.cos(radianti(t.alpha)), 3)}`,
                    risultato: `b \\approx ${b}`,
                    datoTrovato: "b",
                };
                t.b = b;
            }
            else if (datoMancante === "c" && t.a !== null && t.alpha !== null) {
                const c = arrotonda(t.a / Math.sin(radianti(t.alpha)));
                passo = {
                    nome: "Primo teorema (seno)",
                    formula: "c = \\frac{a}{\\sin\\alpha}",
                    calcolo: `c = \\frac{${t.a}}{\\sin(${t.alpha}°)} = \\frac{${t.a}}{${arrotonda(Math.sin(radianti(t.alpha)), 3)}}`,
                    risultato: `c \\approx ${c}`,
                    datoTrovato: "c",
                };
                t.c = c;
            }
            // Caso COSENO per trovare c
            else if (datoMancante === "c" && t.b !== null && t.alpha !== null) {
                const c = arrotonda(t.b / Math.cos(radianti(t.alpha)));
                passo = {
                    nome: "Primo teorema (coseno)",
                    formula: "c = \\frac{b}{\\cos\\alpha}",
                    calcolo: `c = \\frac{${t.b}}{\\cos(${t.alpha}°)} = \\frac{${t.b}}{${arrotonda(Math.cos(radianti(t.alpha)), 3)}}`,
                    risultato: `c \\approx ${c}`,
                    datoTrovato: "c",
                };
                t.c = c;
            }
            else if (datoMancante === "c" && t.a !== null && t.beta !== null) {
                const c = arrotonda(t.a / Math.cos(radianti(t.beta)));
                passo = {
                    nome: "Primo teorema (coseno)",
                    formula: "c = \\frac{a}{\\cos\\beta}",
                    calcolo: `c = \\frac{${t.a}}{\\cos(${t.beta}°)} = \\frac{${t.a}}{${arrotonda(Math.cos(radianti(t.beta)), 3)}}`,
                    risultato: `c \\approx ${c}`,
                    datoTrovato: "c",
                };
                t.c = c;
            }
            else if (datoMancante === "c" && t.b !== null && t.beta !== null) {
                const c = arrotonda(t.b / Math.sin(radianti(t.beta)));
                passo = {
                    nome: "Primo teorema (seno)",
                    formula: "c = \\frac{b}{\\sin\\beta}",
                    calcolo: `c = \\frac{${t.b}}{\\sin(${t.beta}°)} = \\frac{${t.b}}{${arrotonda(Math.sin(radianti(t.beta)), 3)}}`,
                    risultato: `c \\approx ${c}`,
                    datoTrovato: "c",
                };
                t.c = c;
            }
            break;

        case "teorema2":
            if (datoMancante === "alpha" && t.a !== null && t.b !== null) {
                const alpha = arrotonda(gradi(Math.atan(t.a / t.b)));
                passo = {
                    nome: "Secondo teorema (tangente)",
                    formula: "\\tan\\alpha = \\frac{a}{b}",
                    calcolo: `\\tan\\alpha = \\frac{${t.a}}{${t.b}} = ${arrotonda(t.a / t.b, 3)}`,
                    risultato: `\\alpha = \\arctan(${arrotonda(t.a / t.b, 3)}) \\approx ${alpha}°`,
                    datoTrovato: "α",
                };
                t.alpha = alpha;
            } else if (datoMancante === "beta" && t.a !== null && t.b !== null) {
                const beta = arrotonda(gradi(Math.atan(t.b / t.a)));
                passo = {
                    nome: "Secondo teorema (tangente)",
                    formula: "\\tan\\beta = \\frac{b}{a}",
                    calcolo: `\\tan\\beta = \\frac{${t.b}}{${t.a}} = ${arrotonda(t.b / t.a, 3)}`,
                    risultato: `\\beta = \\arctan(${arrotonda(t.b / t.a, 3)}) \\approx ${beta}°`,
                    datoTrovato: "β",
                };
                t.beta = beta;
            } else if (datoMancante === "a" && t.b !== null && t.alpha !== null) {
                const a = arrotonda(t.b * Math.tan(radianti(t.alpha)));
                passo = {
                    nome: "Secondo teorema (tangente)",
                    formula: "a = b \\cdot \\tan\\alpha",
                    calcolo: `a = ${t.b} \\cdot \\tan(${t.alpha}°) = ${t.b} \\cdot ${arrotonda(Math.tan(radianti(t.alpha)), 3)}`,
                    risultato: `a \\approx ${a}`,
                    datoTrovato: "a",
                };
                t.a = a;
            } else if (datoMancante === "b" && t.a !== null && t.alpha !== null) {
                const b = arrotonda(t.a / Math.tan(radianti(t.alpha)));
                passo = {
                    nome: "Secondo teorema (tangente)",
                    formula: "b = \\frac{a}{\\tan\\alpha}",
                    calcolo: `b = \\frac{${t.a}}{\\tan(${t.alpha}°)} = \\frac{${t.a}}{${arrotonda(Math.tan(radianti(t.alpha)), 3)}}`,
                    risultato: `b \\approx ${b}`,
                    datoTrovato: "b",
                };
                t.b = b;
            }
            break;

        case "somma_angoli":
            if (datoMancante === "alpha" && t.beta !== null) {
                const alpha = 90 - t.beta;
                passo = {
                    nome: "Somma angoli triangolo",
                    formula: "\\alpha + \\beta + 90° = 180°",
                    calcolo: `\\alpha = 180° - 90° - ${t.beta}°`,
                    risultato: `\\alpha = ${alpha}°`,
                    datoTrovato: "α",
                };
                t.alpha = alpha;
            } else if (datoMancante === "beta" && t.alpha !== null) {
                const beta = 90 - t.alpha;
                passo = {
                    nome: "Somma angoli triangolo",
                    formula: "\\alpha + \\beta + 90° = 180°",
                    calcolo: `\\beta = 180° - 90° - ${t.alpha}°`,
                    risultato: `\\beta = ${beta}°`,
                    datoTrovato: "β",
                };
                t.beta = beta;
            }
            break;
    }

    if (passo) {
        return { nuovoTriangolo: t, passo };
    }

    return null;
}

// ============ COMPONENTE TRIANGOLO SVG ============

interface TriangoloSVGProps {
    triangoloCorrente: TriangoloRettangolo;
    triangoloCompleto: TriangoloCompleto;
    datiIniziali: Set<string>;
}

const TriangoloSVG: React.FC<TriangoloSVGProps> = ({
                                                       triangoloCorrente,
                                                       triangoloCompleto,
                                                       datiIniziali
                                                   }) => {
    const width = 450;
    const height = 350;

    // Usa sempre il triangolo completo per calcolare le dimensioni FISSE
    const maxDim = Math.max(triangoloCompleto.a, triangoloCompleto.b, triangoloCompleto.c);
    const scale = Math.min(250 / maxDim, 250 / maxDim);

    // Posizioni vertici (A = origine angolo retto)
    const Ax = 80;
    const Ay = height - 60;

    // Cateto b orizzontale (dimensione fissa dal triangolo completo)
    const Bx = Ax + triangoloCompleto.b * scale;
    const By = Ay;

    // Cateto a verticale (dimensione fissa dal triangolo completo)
    const Cx = Ax;
    const Cy = Ay - triangoloCompleto.a * scale;

    // Funzione per determinare il colore
    const getColor = (dato: string, valore: number | null): string => {
        if (valore === null) return "#ef4444"; // Rosso se manca
        if (datiIniziali.has(dato)) return "#10b981"; // Verde se dato iniziale
        return "#10b981"; // Verde se trovato
    };

    // Raggio degli archi degli angoli
    const arcRadius = 35;

    return (
        <svg width={width} height={height} style={{ border: "1px solid #e2e8f0", background: "#fff" }}>
            {/* Triangolo */}
            <polygon
                points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="2"
            />

            {/* Quadratino angolo retto - sempre verde (dato noto) */}
            <rect
                x={Ax}
                y={Ay - 12}
                width={12}
                height={12}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
            />
            <text
                x={Ax + 18}
                y={Ay - 8}
                fontSize="14"
                fill="#10b981"
                fontWeight="bold"
            >
                90°
            </text>

            {/* Arco angolo α (in B) - dall'orizzontale verso l'ipotenusa */}
            <g>
                {(() => {
                    const angleRad = Math.atan2(Cy - By, Cx - Bx);
                    const startX = Bx - arcRadius;
                    const startY = By;
                    const endX = Bx + arcRadius * Math.cos(angleRad);
                    const endY = By + arcRadius * Math.sin(angleRad);
                    const isKnown = triangoloCorrente.alpha !== null;
                    const color = isKnown ? "#10b981" : "#ef4444";

                    return (
                        <>
                            <path
                                d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${endY}`}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                            />
                            <text
                                x={Bx - 55}
                                y={By - 20}
                                fontSize="14"
                                fill={color}
                                fontWeight="bold"
                            >
                                {isKnown ? `α = ${triangoloCorrente.alpha}°` : "α"}
                            </text>
                        </>
                    );
                })()}
            </g>

            {/* Arco angolo β (in C) - dalla verticale verso l'ipotenusa */}
            <g>
                {(() => {
                    const angleRad = Math.atan2(By - Cy, Bx - Cx);
                    const startX = Cx;
                    const startY = Cy + arcRadius;
                    const endX = Cx + arcRadius * Math.cos(angleRad);
                    const endY = Cy + arcRadius * Math.sin(angleRad);
                    const isKnown = triangoloCorrente.beta !== null;
                    const color = isKnown ? "#10b981" : "#ef4444";

                    return (
                        <>
                            <path
                                d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 0 0 ${endX} ${endY}`}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                            />
                            <text
                                x={Cx + 25}
                                y={Cy + 45}
                                fontSize="14"
                                fill={color}
                                fontWeight="bold"
                            >
                                {isKnown ? `β = ${triangoloCorrente.beta}°` : "β"}
                            </text>
                        </>
                    );
                })()}
            </g>

            {/* Labels lati */}
            <text
                x={(Ax + Bx) / 2}
                y={Ay + 25}
                textAnchor="middle"
                fontSize="16"
                fill={getColor("b", triangoloCorrente.b)}
                fontWeight="bold"
            >
                b{triangoloCorrente.b !== null ? ` = ${triangoloCorrente.b}` : ""}
            </text>
            <text
                x={Ax - 50}
                y={(Ay + Cy) / 2}
                textAnchor="middle"
                fontSize="16"
                fill={getColor("a", triangoloCorrente.a)}
                fontWeight="bold"
            >
                a{triangoloCorrente.a !== null ? ` = ${triangoloCorrente.a}` : ""}
            </text>
            <text
                x={(Bx + Cx) / 2 + 35}
                y={(By + Cy) / 2}
                textAnchor="middle"
                fontSize="16"
                fill={getColor("c", triangoloCorrente.c)}
                fontWeight="bold"
            >
                c{triangoloCorrente.c !== null ? ` = ${triangoloCorrente.c}` : ""}
            </text>

            {/* Labels vertici */}
            <text x={Ax - 20} y={Ay + 20} fontSize="18" fontWeight="bold">A</text>
            <text x={Bx + 10} y={By + 20} fontSize="18" fontWeight="bold">B</text>
            <text x={Cx - 20} y={Cy - 10} fontSize="18" fontWeight="bold">C</text>
        </svg>
    );
};

// ============ COMPONENTE PRINCIPALE ============

export default function RisoluzioneTriangoloRettangolo() {
    const [problema, setProblema] = useState<ReturnType<typeof generaTriangoloRettangolo> | null>(null);
    const [triangoloCorrente, setTriangoloCorrente] = useState<TriangoloRettangolo | null>(null);
    const [datiIniziali, setDatiIniziali] = useState<Set<string>>(new Set());
    const [datiTrovati, setDatiTrovati] = useState<string[]>([]);
    const [passiEseguiti, setPassiEseguiti] = useState<TeoremaApplicato[]>([]);
    const [completato, setCompletato] = useState(false);

    const handleGenera = useCallback(() => {
        const nuovoProblema = generaTriangoloRettangolo();
        setProblema(nuovoProblema);
        setTriangoloCorrente(nuovoProblema.triangoloIniziale);

        // Memorizza quali dati sono noti dall'inizio
        const iniziali = new Set<string>();
        if (nuovoProblema.triangoloIniziale.a !== null) iniziali.add("a");
        if (nuovoProblema.triangoloIniziale.b !== null) iniziali.add("b");
        if (nuovoProblema.triangoloIniziale.c !== null) iniziali.add("c");
        if (nuovoProblema.triangoloIniziale.alpha !== null) iniziali.add("alpha");
        if (nuovoProblema.triangoloIniziale.beta !== null) iniziali.add("beta");
        setDatiIniziali(iniziali);

        setDatiTrovati([]);
        setPassiEseguiti([]);
        setCompletato(false);
    }, []);

    // Genera problema all'avvio
    useEffect(() => {
        handleGenera();
    }, [handleGenera]);

    const datiMancanti = useMemo((): DatoMancante[] => {
        if (!triangoloCorrente) return [];
        const mancanti: DatoMancante[] = [];
        if (triangoloCorrente.a === null) mancanti.push("a");
        if (triangoloCorrente.b === null) mancanti.push("b");
        if (triangoloCorrente.c === null) mancanti.push("c");
        if (triangoloCorrente.alpha === null) mancanti.push("alpha");
        if (triangoloCorrente.beta === null) mancanti.push("beta");
        return mancanti;
    }, [triangoloCorrente]);

    // Calcola i dati ancora da trovare (filtra quelli già trovati)
    const datiDaTrovareCorrente = useMemo(() => {
        if (!problema) return [];

        // Mappa i dati mancanti ai loro nomi visualizzati
        const mapDato: { [key: string]: string } = {
            "a": "a",
            "b": "b",
            "c": "c",
            "alpha": "α",
            "beta": "β",
        };

        return datiMancanti.map(d => mapDato[d] || d);
    }, [problema, datiMancanti]);

    const teoremiDisponibili = useMemo(() => {
        if (!triangoloCorrente) return [];
        return getTeoremiDisponibili(triangoloCorrente, datiMancanti);
    }, [triangoloCorrente, datiMancanti]);

    const handleApplicaTeorema = useCallback((teoremaId: string) => {
        if (!triangoloCorrente || datiMancanti.length === 0) return;

        // Trova quale dato può essere calcolato con questo teorema
        for (const dato of datiMancanti) {
            const risultato = applicaTeorema(teoremaId, triangoloCorrente, dato);
            if (risultato) {
                setTriangoloCorrente(risultato.nuovoTriangolo);
                setPassiEseguiti(prev => [...prev, risultato.passo]);
                setDatiTrovati(prev => [...prev, risultato.passo.datoTrovato]);

                // Controlla se abbiamo finito
                const nuoviMancanti = datiMancanti.filter(d => d !== dato);
                if (nuoviMancanti.length === 0) {
                    setCompletato(true);
                }
                break;
            }
        }
    }, [triangoloCorrente, datiMancanti]);

    if (!problema) {
        return (
            <DemoContainer
                title="Risoluzione Triangolo Rettangolo"
                description="Risolvi un triangolo rettangolo scegliendo i teoremi da applicare passo dopo passo"
            >
                <div style={{ textAlign: "center", padding: 60 }}>
                    Caricamento...
                </div>
            </DemoContainer>
        );
    }

    return (
        <DemoContainer
            title="Risoluzione Triangolo Rettangolo"
            description="Scegli i teoremi da applicare per risolvere il triangolo"
        >
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuovo Problema" onClick={handleGenera} />
            </div>

            {/* Problema */}
            <ProblemCard label="Problema">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <strong style={{ fontSize: 18, color: "#1e40af" }}>Dati noti:</strong>
                            <div style={{ marginTop: 8, fontSize: 16, color: "#10b981", fontWeight: 600 }}>
                                {problema.datiNoti.map((dato, idx) => (
                                    <div key={idx}>• {dato}</div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <strong style={{ fontSize: 18, color: "#1e40af" }}>Da trovare:</strong>
                            <div style={{ marginTop: 8, fontSize: 16, color: "#ef4444", fontWeight: 600 }}>
                                {datiDaTrovareCorrente.length > 0 ? (
                                    datiDaTrovareCorrente.map((dato, idx) => (
                                        <div key={idx}>• {dato}</div>
                                    ))
                                ) : (
                                    <div style={{ color: "#64748b", fontStyle: "italic" }}>Nessuno</div>
                                )}
                            </div>
                        </div>

                        {datiTrovati.length > 0 && (
                            <div>
                                <strong style={{ fontSize: 18, color: "#1e40af" }}>Dati trovati:</strong>
                                <div style={{ marginTop: 8, fontSize: 16, color: "#10b981", fontWeight: 600 }}>
                                    {datiTrovati.map((dato, idx) => (
                                        <div key={idx}>✓ {dato}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <TriangoloSVG
                            triangoloCorrente={triangoloCorrente!}
                            triangoloCompleto={problema.triangoloCompleto}
                            datiIniziali={datiIniziali}
                        />
                    </div>
                </div>
            </ProblemCard>

            {!completato && (
                <>
                    <div style={{ marginTop: 20, marginBottom: 12, fontSize: 18, fontWeight: 600 }}>
                        Scegli quale teorema applicare:
                    </div>

                    <div style={{ display: "grid", gap: 12 }}>
                        {teoremiDisponibili.map(teorema => (
                            <button
                                key={teorema.id}
                                onClick={() => handleApplicaTeorema(teorema.id)}
                                disabled={!teorema.applicabile}
                                style={{
                                    padding: "16px 20px",
                                    textAlign: "left",
                                    background: teorema.applicabile ? "#fff" : "#f8fafc",
                                    border: `2px solid ${teorema.applicabile ? "#3b82f6" : "#e2e8f0"}`,
                                    borderRadius: 8,
                                    cursor: teorema.applicabile ? "pointer" : "not-allowed",
                                    opacity: teorema.applicabile ? 1 : 0.6,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => {
                                    if (teorema.applicabile) {
                                        e.currentTarget.style.borderColor = "#2563eb";
                                        e.currentTarget.style.background = "#eff6ff";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (teorema.applicabile) {
                                        e.currentTarget.style.borderColor = "#3b82f6";
                                        e.currentTarget.style.background = "#fff";
                                    }
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>
                                    {teorema.nome}
                                </div>
                                <div style={{ fontSize: 14, color: "#64748b" }}>
                                    <Latex>{teorema.formula}</Latex>
                                </div>
                                {!teorema.applicabile && teorema.motivo && (
                                    <div style={{ marginTop: 8, fontSize: 13, color: "#ef4444", fontStyle: "italic" }}>
                                        {teorema.motivo}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Passi eseguiti */}
            {passiEseguiti.length > 0 && (
                <div style={{ marginTop: 30 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                        Risoluzione:
                    </h3>

                    {passiEseguiti.map((passo, idx) => (
                        <StepCard
                            key={idx}
                            stepNumber={idx + 1}
                            title={passo.nome}
                            color="blue"
                            isActive={true}
                        >
                            <div style={{ fontSize: 14 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Formula:</strong>{" "}
                                    <Latex>{passo.formula}</Latex>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Calcolo:</strong>{" "}
                                    <Latex>{passo.calcolo}</Latex>
                                </div>
                                <div
                                    style={{
                                        padding: "8px 12px",
                                        background: "#f0fdf4",
                                        borderRadius: 6,
                                        border: "1px solid #bbf7d0",
                                    }}
                                >
                                    <strong>Risultato:</strong>{" "}
                                    <Latex>{passo.risultato}</Latex>
                                </div>
                            </div>
                        </StepCard>
                    ))}
                </div>
            )}

            {completato && (
                <div
                    style={{
                        marginTop: 30,
                        padding: 20,
                        background: "#f0fdf4",
                        border: "2px solid #22c55e",
                        borderRadius: 12,
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#166534", marginBottom: 12 }}>
                        ✓ Triangolo risolto!
                    </div>
                    <div style={{ fontSize: 16, color: "#15803d" }}>
                        Tutti i dati sono stati calcolati in {passiEseguiti.length} passi.
                    </div>
                </div>
            )}

            <InfoBox title="Come funziona:" style={{ marginTop: 30 }}>
                <ol style={{ marginLeft: 20, fontSize: 14 }}>
                    <li>Osserva i <span style={{ color: "#10b981", fontWeight: 600 }}>dati noti (verdi)</span> e i <span style={{ color: "#ef4444", fontWeight: 600 }}>dati da trovare (rossi)</span></li>
                    <li>Scegli quale teorema applicare tra quelli disponibili</li>
                    <li>Il <strong>Primo teorema</strong> offre due possibilità: usare il <strong>seno</strong> (cateto opposto / ipotenusa) o il <strong>coseno</strong> (cateto adiacente / ipotenusa)</li>
                    <li>Il calcolo verrà eseguito automaticamente</li>
                    <li>I dati trovati spariranno dalla lista "Da trovare" e appariranno in "Dati trovati"</li>
                    <li>Continua fino a trovare tutti i dati mancanti</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}
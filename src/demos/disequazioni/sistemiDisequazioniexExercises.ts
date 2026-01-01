/**
 * Esercizi predefiniti per SistemiDisequazioniDemo
 * Con passaggi algebrici completi
 */

import { InequalitySign } from "../../utils/math";

export interface RawInequality {
    original: string;
    steps?: string[];      // Passaggi algebrici intermedi (LaTeX)
    simplified: string;    // Forma normale ax + b ⋚ 0
    a: number;
    b: number;
    sign: InequalitySign;
}

export interface Exercise {
    id: number;
    level: "base" | "intermedio" | "avanzato";
    inequalities: RawInequality[];
    solution: string;
}

export const SistemiDisequazioniexExercises: Exercise[] = [
    // ==================== BASE ====================
    {
        id: 118, level: "base",
        inequalities: [
            {
                original: "x - 1 > 0",
                steps: ["x > 1"],
                simplified: "x - 1 > 0",
                a: 1, b: -1, sign: ">"
            },
            {
                original: "x - 6 > 0",
                steps: ["x > 6"],
                simplified: "x - 6 > 0",
                a: 1, b: -6, sign: ">"
            },
        ],
        solution: "x > 6"
    },
    {
        id: 119, level: "base",
        inequalities: [
            {
                original: "4x + 6 < 0",
                steps: ["4x < -6", "x < -\\frac{6}{4}", "x < -\\frac{3}{2}"],
                simplified: "4x + 6 < 0",
                a: 4, b: 6, sign: "<"
            },
            {
                original: "6x \\geq 0",
                steps: ["x \\geq 0"],
                simplified: "6x \\geq 0",
                a: 6, b: 0, sign: ">="
            },
        ],
        solution: "impossibile"
    },
    {
        id: 120, level: "base",
        inequalities: [
            {
                original: "x + 4 < 0",
                steps: ["x < -4"],
                simplified: "x + 4 < 0",
                a: 1, b: 4, sign: "<"
            },
            {
                original: "3x < 1",
                steps: ["x < \\frac{1}{3}"],
                simplified: "3x - 1 < 0",
                a: 3, b: -1, sign: "<"
            },
        ],
        solution: "x < -4"
    },
    {
        id: 121, level: "base",
        inequalities: [
            {
                original: "x + 1 > 0",
                steps: ["x > -1"],
                simplified: "x + 1 > 0",
                a: 1, b: 1, sign: ">"
            },
            {
                original: "-2x \\geq 0",
                steps: ["x \\leq 0 \\quad \\text{(cambio verso)}"],
                simplified: "-2x \\geq 0",
                a: -2, b: 0, sign: ">="
            },
            {
                original: "3x + 2 > 0",
                steps: ["3x > -2", "x > -\\frac{2}{3}"],
                simplified: "3x + 2 > 0",
                a: 3, b: 2, sign: ">"
            },
        ],
        solution: "-2/3 < x ≤ 0"
    },
    {
        id: 1001, level: "base",
        inequalities: [
            {
                original: "2x - 4 > 0",
                steps: ["2x > 4", "x > 2"],
                simplified: "2x - 4 > 0",
                a: 2, b: -4, sign: ">"
            },
            {
                original: "x + 3 < 10",
                steps: ["x < 10 - 3", "x < 7"],
                simplified: "x - 7 < 0",
                a: 1, b: -7, sign: "<"
            },
        ],
        solution: "2 < x < 7"
    },
    {
        id: 1002, level: "base",
        inequalities: [
            {
                original: "5x \\leq 15",
                steps: ["x \\leq \\frac{15}{5}", "x \\leq 3"],
                simplified: "5x - 15 \\leq 0",
                a: 5, b: -15, sign: "<="
            },
            {
                original: "x - 1 \\geq 0",
                steps: ["x \\geq 1"],
                simplified: "x - 1 \\geq 0",
                a: 1, b: -1, sign: ">="
            },
        ],
        solution: "1 ≤ x ≤ 3"
    },

    // ==================== INTERMEDIO ====================
    {
        id: 122, level: "intermedio",
        inequalities: [
            {
                original: "x - 4 < 0",
                steps: ["x < 4"],
                simplified: "x - 4 < 0",
                a: 1, b: -4, sign: "<"
            },
            {
                original: "2 - x > 0",
                steps: ["-x > -2", "x < 2 \\quad \\text{(cambio verso)}"],
                simplified: "-x + 2 > 0",
                a: -1, b: 2, sign: ">"
            },
            {
                original: "x + 3 > 0",
                steps: ["x > -3"],
                simplified: "x + 3 > 0",
                a: 1, b: 3, sign: ">"
            },
        ],
        solution: "-3 < x < 2"
    },
    {
        id: 123, level: "intermedio",
        inequalities: [
            {
                original: "3x + 9 + 2 < x - 1",
                steps: [
                    "3x + 11 < x - 1",
                    "3x - x < -1 - 11",
                    "2x < -12",
                    "x < -6"
                ],
                simplified: "2x + 12 < 0",
                a: 2, b: 12, sign: "<"
            },
            {
                original: "2x - 3 > x + 7",
                steps: [
                    "2x - x > 7 + 3",
                    "x > 10"
                ],
                simplified: "x - 10 > 0",
                a: 1, b: -10, sign: ">"
            },
        ],
        solution: "impossibile"
    },
    {
        id: 125, level: "intermedio",
        inequalities: [
            {
                original: "x + 7 - 3x \\geq -x(x+1) + x^2 - 3 - 2x",
                steps: [
                    "-2x + 7 \\geq -x^2 - x + x^2 - 3 - 2x",
                    "-2x + 7 \\geq -3x - 3",
                    "-2x + 3x \\geq -3 - 7",
                    "x \\geq -10"
                ],
                simplified: "x + 10 \\geq 0",
                a: 1, b: 10, sign: ">="
            },
            {
                original: "2x + 3 < 7",
                steps: [
                    "2x < 7 - 3",
                    "2x < 4",
                    "x < 2"
                ],
                simplified: "2x - 4 < 0",
                a: 2, b: -4, sign: "<"
            },
        ],
        solution: "-10 ≤ x < 2"
    },
    {
        id: 126, level: "intermedio",
        inequalities: [
            {
                original: "\\frac{1}{3}(9x + 12) - 10 > 12",
                steps: [
                    "3x + 4 - 10 > 12",
                    "3x - 6 > 12",
                    "3x > 18",
                    "x > 6"
                ],
                simplified: "3x - 18 > 0",
                a: 3, b: -18, sign: ">"
            },
            {
                original: "4x(x-1) + 10 < 4x(x+1) - 6",
                steps: [
                    "4x^2 - 4x + 10 < 4x^2 + 4x - 6",
                    "-4x + 10 < 4x - 6",
                    "-4x - 4x < -6 - 10",
                    "-8x < -16",
                    "x > 2 \\quad \\text{(cambio verso)}"
                ],
                simplified: "-8x + 16 < 0",
                a: -8, b: 16, sign: "<"
            },
        ],
        solution: "x > 6"
    },
    {
        id: 127, level: "intermedio",
        inequalities: [
            {
                original: "2x(x-1) - 2x^2 + x < 2 - x",
                steps: [
                    "2x^2 - 2x - 2x^2 + x < 2 - x",
                    "-x < 2 - x",
                    "-x + x < 2",
                    "0 < 2 \\quad \\checkmark \\text{ sempre vera}"
                ],
                simplified: "-2 < 0",
                a: 0, b: -2, sign: "<"
            },
            {
                original: "7x - 1 - 6x > x - 3",
                steps: [
                    "x - 1 > x - 3",
                    "x - x > -3 + 1",
                    "0 > -2 \\quad \\checkmark \\text{ sempre vera}"
                ],
                simplified: "2 > 0",
                a: 0, b: 2, sign: ">"
            },
        ],
        solution: "∀x ∈ ℝ"
    },

    // ==================== AVANZATO ====================
    {
        // CORRETTO: x > -4 e x ≤ -1 → -4 < x ≤ -1
        id: 136, level: "avanzato",
        inequalities: [
            {
                original: "2x - 3 < (x+1)^2 - x(x-1)",
                steps: [
                    "2x - 3 < x^2 + 2x + 1 - x^2 + x",
                    "2x - 3 < 3x + 1",
                    "2x - 3x < 1 + 3",
                    "-x < 4",
                    "x > -4 \\quad \\text{(cambio verso)}"
                ],
                simplified: "x + 4 > 0",
                a: 1, b: 4, sign: ">"
            },
            {
                original: "x + 3 - 2x \\geq 4",
                steps: [
                    "-x + 3 \\geq 4",
                    "-x \\geq 4 - 3",
                    "-x \\geq 1",
                    "x \\leq -1 \\quad \\text{(cambio verso)}"
                ],
                simplified: "-x - 1 \\geq 0",
                a: -1, b: -1, sign: ">="
            },
        ],
        solution: "-4 < x ≤ -1"
    },
    {
        id: 137, level: "avanzato",
        inequalities: [
            {
                original: "(x-1)^2 + 2x - 7 < 1 + x^2",
                steps: [
                    "x^2 - 2x + 1 + 2x - 7 < 1 + x^2",
                    "x^2 - 6 < 1 + x^2",
                    "-6 < 1 \\quad \\checkmark \\text{ sempre vera}"
                ],
                simplified: "-7 < 0",
                a: 0, b: -7, sign: "<"
            },
            {
                original: "7x + 1 < 7 + x(x-2) - x^2 + 9x",
                steps: [
                    "7x + 1 < 7 + x^2 - 2x - x^2 + 9x",
                    "7x + 1 < 7 + 7x",
                    "7x - 7x < 7 - 1",
                    "0 < 6 \\quad \\checkmark \\text{ sempre vera}"
                ],
                simplified: "-6 < 0",
                a: 0, b: -6, sign: "<"
            },
        ],
        solution: "∀x ∈ ℝ"
    },
    {
        id: 138, level: "avanzato",
        inequalities: [
            {
                original: "x^2 + 6x - 3 < 2x(x+2) - x^2",
                steps: [
                    "x^2 + 6x - 3 < 2x^2 + 4x - x^2",
                    "x^2 + 6x - 3 < x^2 + 4x",
                    "6x - 4x < 3",
                    "2x < 3",
                    "x < \\frac{3}{2}"
                ],
                simplified: "2x - 3 < 0",
                a: 2, b: -3, sign: "<"
            },
            {
                original: "(x-2)^2 + 3x - 3 > -2x + 1 + x^2",
                steps: [
                    "x^2 - 4x + 4 + 3x - 3 > -2x + 1 + x^2",
                    "x^2 - x + 1 > x^2 - 2x + 1",
                    "-x + 2x > 1 - 1",
                    "x > 0"
                ],
                simplified: "x > 0",
                a: 1, b: 0, sign: ">"
            },
        ],
        solution: "impossibile"
    },
    {
        id: 139, level: "avanzato",
        inequalities: [
            {
                original: "(x+3)^2 - x^2 - 7 < x + 2",
                steps: [
                    "x^2 + 6x + 9 - x^2 - 7 < x + 2",
                    "6x + 2 < x + 2",
                    "6x - x < 2 - 2",
                    "5x < 0",
                    "x < 0"
                ],
                simplified: "5x < 0",
                a: 5, b: 0, sign: "<"
            },
            {
                original: "2x > x(x+1) + 4 - x^2",
                steps: [
                    "2x > x^2 + x + 4 - x^2",
                    "2x > x + 4",
                    "2x - x > 4",
                    "x > 4"
                ],
                simplified: "x - 4 > 0",
                a: 1, b: -4, sign: ">"
            },
        ],
        solution: "impossibile"
    },
    {
        id: 141, level: "avanzato",
        inequalities: [
            {
                original: "4\\left(\\frac{1}{8}x - 2\\right) - \\frac{x}{4} \\leq -\\frac{x+3}{4}",
                steps: [
                    "\\frac{x}{2} - 8 - \\frac{x}{4} \\leq -\\frac{x+3}{4}",
                    "\\frac{2x - x}{4} - 8 \\leq -\\frac{x+3}{4} \\text{ (ora fai m.c.m e trasforma)}",
                    "\\frac{2x -32-x}{\\cancel{4}}  \\leq -\\frac{x+3}{\\cancel{4}}  " ,
                    "x-32 \\leq -x -3",
                    "\\frac{2x + 3}{4} \\leq 8",
                    "2x \\leq 29",
                    "x \\leq \\frac{29}{2}"
                ],
                simplified: "2x - 29 \\leq 0",
                a: 2, b: -29, sign: "<="
            },
            {
                original: "\\frac{1}{3}x + 2 > \\frac{1}{2}x - \\frac{x-5}{6} + 1",
                steps: [
                    "\\frac{2x+12}{6}> \\frac{3x-(x-5) + 6}{6} \\text{ \\small{(attenzione al segno  davanti a frazione)}}",
                    "\\frac{2x+12}{\\cancel{6}}> \\frac{3x-(x-5) + 6}{\\cancel{6}}",
                    "2x +12 > 3x-x+5+6",
                    "2x + 12 > 2x + 11",
                    "\\cancel{2x} + 12 > \\cancel{2x} + 11",
                    "12 > 11 \\quad \\checkmark \\text{ sempre vera}"
                ],
                simplified: "1 > 0",
                a: 0, b: 1, sign: ">"
            },
        ],
        solution: "x ≤ 29/2"
    },
];
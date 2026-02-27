/**
 * EscapeRoomGame - Gioco didattico "Escape Room"
 *
 * 5 stanze, ciascuna con un problema di matematica/fisica.
 * Per aprire ogni porta occorre:
 * 1) Scegliere la strategia giusta tra 4 opzioni (+40 pt)
 * 2) Digitare la risposta numerica corretta (+60 pt)
 * Hint disponibili con penalità (−10 pt ciascuno, max 3).
 */

import React, { useState } from "react";
import { Latex, InfoBox, QuizNumericInput, useBreakpoint } from "../../components/ui";

// ============ TIPI ============

interface RoomStrategy {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
}

interface EscapeRoom {
    id: string;
    number: number;
    emoji: string;
    name: string;
    narrative: string;
    problemLatex?: string;
    unit: string;
    answer: number;
    tolerance: number;
    strategies: RoomStrategy[];
    hints: string[];
    solutionExplanation: string;
}

type GamePhase =
    | "start"
    | "strategy"
    | "strategy_feedback"
    | "numeric"
    | "room_feedback"
    | "victory";

interface RoomScore {
    method: number;   // 0 o 40
    precision: number; // 0 o 60
    hintPenalty: number; // 10 × hint usati
}

// ============ DATI STANZE ============

const ROOMS: EscapeRoom[] = [
    {
        id: "mru",
        number: 1,
        emoji: "🚂",
        name: "Corridoio delle Misure",
        narrative:
            "Il corridoio è sbarrato da una porta blindata. Sul muro è inciso: " +
            "\"Un treno percorre 360 km in 4 ore a velocità costante. " +
            "Inserisci la velocità media (in km/h) per sbloccare il meccanismo.\"",
        problemLatex: "s = 360\\text{ km},\\quad t = 4\\text{ h}",
        unit: "km/h",
        answer: 90,
        tolerance: 0.5,
        strategies: [
            {
                id: "vst",
                label: "Usa v = s/t",
                isCorrect: true,
                feedback:
                    "Esatto! Per il moto rettilineo uniforme la velocità media è il rapporto tra spazio e tempo: v = s/t.",
            },
            {
                id: "acc",
                label: "Usa a = Δv/Δt",
                isCorrect: false,
                feedback:
                    "Questa è la formula dell'accelerazione, non della velocità media. La velocità è costante, quindi serve v = s/t.",
            },
            {
                id: "mua",
                label: "Usa s = v₀t + ½at²",
                isCorrect: false,
                feedback:
                    "Questa formula vale per il moto uniformemente accelerato (MUA). Qui il moto è uniforme: basta v = s/t.",
            },
            {
                id: "impulso",
                label: "Usa p = mv",
                isCorrect: false,
                feedback:
                    "p = mv è la quantità di moto, non serve qui. Per trovare la velocità usa v = s/t.",
            },
        ],
        hints: [
            "La velocità media si calcola dividendo lo spazio percorso per il tempo impiegato.",
            "v = s ÷ t = 360 km ÷ 4 h. Fai la divisione.",
            "360 ÷ 4 = 90. La risposta è 90 km/h.",
        ],
        solutionExplanation:
            "v = s/t = 360 km / 4 h = 90 km/h. Il treno procede a velocità costante di 90 km/h.",
    },
    {
        id: "densita",
        number: 2,
        emoji: "⚗️",
        name: "Laboratorio di Densità",
        narrative:
            "La cassaforte del laboratorio è chiusa. Sull'etichetta si legge: " +
            "\"Campione: massa = 600 g, volume = 200 cm³. " +
            "Inserisci la densità in g/cm³ per aprire il lucchetto.\"",
        problemLatex: "m = 600\\text{ g},\\quad V = 200\\text{ cm}^3",
        unit: "g/cm³",
        answer: 3,
        tolerance: 0.05,
        strategies: [
            {
                id: "dens",
                label: "Usa ρ = m/V",
                isCorrect: true,
                feedback:
                    "Perfetto! La densità si calcola come rapporto tra massa e volume: ρ = m/V.",
            },
            {
                id: "peso",
                label: "Usa F = mg",
                isCorrect: false,
                feedback:
                    "F = mg calcola la forza peso, non la densità. Per la densità usa ρ = m/V.",
            },
            {
                id: "pres",
                label: "Usa p = ρgh",
                isCorrect: false,
                feedback:
                    "p = ρgh è la legge di Stevino per la pressione idrostatica. Qui serve ρ = m/V.",
            },
            {
                id: "vel",
                label: "Usa v = s/t",
                isCorrect: false,
                feedback:
                    "v = s/t riguarda il moto, non la densità. Usa ρ = m/V.",
            },
        ],
        hints: [
            "La densità è la massa divisa per il volume: ρ = m/V.",
            "ρ = 600 g ÷ 200 cm³. Esegui la divisione.",
            "600 ÷ 200 = 3. La densità è 3 g/cm³.",
        ],
        solutionExplanation:
            "ρ = m/V = 600 g / 200 cm³ = 3 g/cm³. Il campione ha densità 3 g/cm³.",
    },
    {
        id: "stevino",
        number: 3,
        emoji: "🏛️",
        name: "Cripta di Stevino",
        narrative:
            "L'acqua blocca l'ingresso della cripta. Un sensore rileva la pressione " +
            "a 5 m di profondità (ρ = 1000 kg/m³, g = 10 m/s²). " +
            "Inserisci la pressione idrostatica in Pa per aprire la serratura.",
        problemLatex: "\\rho = 1000\\tfrac{\\text{kg}}{\\text{m}^3},\\quad g = 10\\tfrac{\\text{m}}{\\text{s}^2},\\quad h = 5\\text{ m}",
        unit: "Pa",
        answer: 50000,
        tolerance: 1,
        strategies: [
            {
                id: "stevino",
                label: "Usa p = ρgh",
                isCorrect: true,
                feedback:
                    "Corretto! La legge di Stevino dà la pressione idrostatica: p = ρgh.",
            },
            {
                id: "newton",
                label: "Usa F = ma",
                isCorrect: false,
                feedback:
                    "F = ma è il secondo principio della dinamica. Per la pressione a una certa profondità usa p = ρgh.",
            },
            {
                id: "cinetica",
                label: "Usa E = ½mv²",
                isCorrect: false,
                feedback:
                    "E = ½mv² è l'energia cinetica. Per la pressione idrostatica serve p = ρgh.",
            },
            {
                id: "densgen",
                label: "Usa ρ = m/V",
                isCorrect: false,
                feedback:
                    "ρ = m/V calcola la densità, ma qui la densità è già nota. Per la pressione usa p = ρgh.",
            },
        ],
        hints: [
            "La pressione idrostatica dipende da densità del liquido, gravità e profondità: p = ρ · g · h.",
            "p = 1000 kg/m³ × 10 m/s² × 5 m. Moltiplica i tre valori.",
            "1000 × 10 × 5 = 50 000. La pressione è 50 000 Pa.",
        ],
        solutionExplanation:
            "p = ρgh = 1000 kg/m³ × 10 m/s² × 5 m = 50 000 Pa. " +
            "A 5 m di profondità la pressione è 50 000 Pa (= 0,5 atm).",
    },
    {
        id: "grafici",
        number: 4,
        emoji: "📈",
        name: "Sala dei Grafici",
        narrative:
            "Il proiettore mostra un grafico spazio-tempo: alle 2 s il corpo si trova " +
            "a 20 m, alle 6 s si trova a 80 m. " +
            "Calcola la velocità media in m/s per disattivare l'allarme.",
        problemLatex: "s_1 = 20\\text{ m},\\; t_1 = 2\\text{ s},\\quad s_2 = 80\\text{ m},\\; t_2 = 6\\text{ s}",
        unit: "m/s",
        answer: 15,
        tolerance: 0.1,
        strategies: [
            {
                id: "grafico",
                label: "Usa v = Δs/Δt",
                isCorrect: true,
                feedback:
                    "Ottimo! La velocità media è il rapporto tra la variazione di spazio e la variazione di tempo: v = Δs/Δt.",
            },
            {
                id: "mua2",
                label: "Usa v = at",
                isCorrect: false,
                feedback:
                    "v = at vale per il MUA a partire da fermo. Qui servono due punti del grafico: usa Δs/Δt.",
            },
            {
                id: "pres2",
                label: "Usa p = ρgh",
                isCorrect: false,
                feedback:
                    "p = ρgh è la pressione idrostatica. Per leggere una velocità da un grafico s-t usa Δs/Δt.",
            },
            {
                id: "acc2",
                label: "Usa a = Δv/Δt",
                isCorrect: false,
                feedback:
                    "a = Δv/Δt calcola l'accelerazione, non la velocità. Dal grafico s-t ricava la velocità con Δs/Δt.",
            },
        ],
        hints: [
            "La velocità media dal grafico s-t è il rapporto incrementale: v = (s₂ − s₁) / (t₂ − t₁).",
            "Δs = 80 − 20 = 60 m; Δt = 6 − 2 = 4 s. Dividi Δs per Δt.",
            "60 m ÷ 4 s = 15 m/s.",
        ],
        solutionExplanation:
            "v = Δs/Δt = (80 − 20) m / (6 − 2) s = 60 m / 4 s = 15 m/s. " +
            "La pendenza della retta s-t dà sempre la velocità.",
    },
    {
        id: "equazioni",
        number: 5,
        emoji: "📝",
        name: "Studio delle Equazioni",
        narrative:
            "La lavagna dello studio mostra il rebus finale: " +
            "\"La somma di due numeri è 45. Il maggiore è il doppio del minore. " +
            "Inserisci il numero minore per aprire la porta segreta.\"",
        problemLatex: "x + y = 45,\\quad y = 2x",
        unit: "",
        answer: 15,
        tolerance: 0.1,
        strategies: [
            {
                id: "sistema",
                label: "Sistema di 2 equazioni",
                isCorrect: true,
                feedback:
                    "Perfetto! Con due incognite e due condizioni si imposta un sistema 2×2: { x + y = 45; y = 2x }.",
            },
            {
                id: "proporzione",
                label: "Proporzione diretta",
                isCorrect: false,
                feedback:
                    "Una proporzione descrive un rapporto costante, ma qui abbiamo una somma fissa. Serve un sistema di equazioni.",
            },
            {
                id: "quadratica",
                label: "Equazione di 2° grado",
                isCorrect: false,
                feedback:
                    "Non ci sono quadrati in questo problema. Le due condizioni formano un sistema lineare 2×2.",
            },
            {
                id: "divisione",
                label: "Divisione semplice 45 ÷ 2",
                isCorrect: false,
                feedback:
                    "45 ÷ 2 dà 22,5, ma il maggiore è il doppio del minore, non il doppio di se stesso. Serve un sistema.",
            },
        ],
        hints: [
            "Chiama x il numero minore e y il maggiore. Hai due equazioni: x + y = 45 e y = 2x.",
            "Sostituisci y = 2x nella prima: x + 2x = 45, quindi 3x = 45.",
            "3x = 45 → x = 15. Il numero minore è 15.",
        ],
        solutionExplanation:
            "Sistema: x + y = 45, y = 2x. Sostituzione: x + 2x = 45 → 3x = 45 → x = 15. " +
            "Il numero minore è 15, il maggiore è 30.",
    },
];

// ============ COMPONENTE PRINCIPALE ============

export default function EscapeRoomGame() {
    const { isMobile } = useBreakpoint();

    // ─── State macchina ───
    const [phase, setPhase] = useState<GamePhase>("start");
    const [roomIdx, setRoomIdx] = useState(0);

    // Strategia
    const [chosenStrategyId, setChosenStrategyId] = useState<string | null>(null);

    // Risposta numerica
    const [numericValue, setNumericValue] = useState("");
    const [numericVerified, setNumericVerified] = useState(false);
    const [numericCorrect, setNumericCorrect] = useState(false);

    // Hint
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hintsShown, setHintsShown] = useState<number[]>([]);

    // Punteggi per stanza
    const [roomScores, setRoomScores] = useState<RoomScore[]>([]);
    const [currentRoomScore, setCurrentRoomScore] = useState<RoomScore>({
        method: 0,
        precision: 0,
        hintPenalty: 0,
    });

    const room = ROOMS[roomIdx];
    const totalScore = roomScores.reduce(
        (sum, s) => sum + s.method + s.precision - s.hintPenalty,
        0
    );

    // ─── Helpers ───

    function startGame() {
        setPhase("strategy");
        setRoomIdx(0);
        resetRoomState();
        setRoomScores([]);
    }

    function resetRoomState() {
        setChosenStrategyId(null);
        setNumericValue("");
        setNumericVerified(false);
        setNumericCorrect(false);
        setHintsUsed(0);
        setHintsShown([]);
        setCurrentRoomScore({ method: 0, precision: 0, hintPenalty: 0 });
    }

    function handleStrategyChoice(stratId: string) {
        const strat = room.strategies.find((s) => s.id === stratId)!;
        const methodPts = strat.isCorrect ? 40 : 0;
        setChosenStrategyId(stratId);
        setCurrentRoomScore((prev) => ({ ...prev, method: methodPts }));
        setPhase("strategy_feedback");
    }

    function proceedToNumeric() {
        setPhase("numeric");
    }

    function handleShowHint() {
        if (hintsUsed >= 3 || numericVerified) return;
        const nextHint = hintsUsed; // index of next hint to show
        setHintsShown((prev) => [...prev, nextHint]);
        setHintsUsed((prev) => prev + 1);
        setCurrentRoomScore((prev) => ({
            ...prev,
            hintPenalty: prev.hintPenalty + 10,
        }));
    }

    function handleVerify() {
        const val = parseFloat(numericValue);
        const correct =
            !isNaN(val) && Math.abs(val - room.answer) <= room.tolerance;
        setNumericCorrect(correct);
        setNumericVerified(true);
        const precisionPts = correct ? 60 : 0;
        const finalScore = {
            ...currentRoomScore,
            precision: precisionPts,
        };
        setCurrentRoomScore(finalScore);
        setPhase("room_feedback");
    }

    function handleNextRoom() {
        // Salva punteggio stanza corrente
        setRoomScores((prev) => [...prev, currentRoomScore]);
        if (roomIdx + 1 >= ROOMS.length) {
            setPhase("victory");
        } else {
            setRoomIdx((i) => i + 1);
            resetRoomState();
            setPhase("strategy");
        }
    }

    // ─── BackLink ───
    const BackLink = (
        <div style={{ marginBottom: 12 }}>
            <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                ← Torna alla home
            </a>
        </div>
    );

    // ─── Header con punteggio e progresso ───
    function RoomHeader() {
        const maxSoFar = roomScores.length * 100;
        const scoreSoFar = roomScores.reduce(
            (sum, s) => sum + s.method + s.precision - s.hintPenalty,
            0
        );
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    marginBottom: 12,
                }}
            >
                {/* Pallini progresso */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {ROOMS.map((r, i) => (
                        <div
                            key={r.id}
                            title={r.name}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background:
                                    i < roomIdx
                                        ? "#22c55e"
                                        : i === roomIdx
                                        ? "#3b82f6"
                                        : "#d1d5db",
                                border:
                                    i === roomIdx ? "2px solid #1d4ed8" : "none",
                                transition: "background 0.3s",
                            }}
                        />
                    ))}
                    <span style={{ fontSize: 13, color: "#64748b", marginLeft: 6 }}>
                        Stanza {roomIdx + 1}/{ROOMS.length}
                    </span>
                </div>
                {/* Punteggio */}
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#0f172a",
                        background: "#f0fdf4",
                        borderRadius: 8,
                        padding: "4px 12px",
                        border: "1px solid #86efac",
                    }}
                >
                    🏆 {scoreSoFar} / {maxSoFar > 0 ? maxSoFar : 500}
                </div>
            </div>
        );
    }

    // ─── Card stanza ───
    function RoomCard() {
        return (
            <div
                style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    padding: isMobile ? "16px 14px" : "20px 20px",
                    marginBottom: 16,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                    }}
                >
                    <span style={{ fontSize: 30 }}>{room.emoji}</span>
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#94a3b8",
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                            }}
                        >
                            Stanza {room.number}
                        </div>
                        <div
                            style={{
                                fontSize: isMobile ? 16 : 18,
                                fontWeight: 700,
                                color: "#0f172a",
                            }}
                        >
                            {room.name}
                        </div>
                    </div>
                </div>
                <p
                    style={{
                        fontSize: 14,
                        color: "#334155",
                        lineHeight: 1.65,
                        margin: 0,
                        marginBottom: room.problemLatex ? 12 : 0,
                    }}
                >
                    {room.narrative}
                </p>
                {room.problemLatex && (
                    <div
                        style={{
                            marginTop: 4,
                            padding: "10px 14px",
                            background: "#fff",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                            fontSize: 18,
                        }}
                    >
                        <Latex display>{room.problemLatex}</Latex>
                    </div>
                )}
            </div>
        );
    }

    // ══════════════════════════════════════════
    //  START
    // ══════════════════════════════════════════
    if (phase === "start") {
        return (
            <div
                style={{
                    maxWidth: 580,
                    margin: "0 auto",
                    padding: isMobile ? "16px 12px" : "24px 16px",
                }}
            >
                {BackLink}
                <div
                    style={{
                        textAlign: "center",
                        padding: isMobile ? "28px 20px" : "40px 32px",
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <div style={{ fontSize: 60, marginBottom: 10 }}>🔐</div>
                    <h1
                        style={{
                            fontSize: isMobile ? 22 : 28,
                            fontWeight: 800,
                            color: "#0f172a",
                            marginBottom: 12,
                        }}
                    >
                        Escape Room di Fisica & Matematica
                    </h1>
                    <p
                        style={{
                            color: "#64748b",
                            fontSize: 14,
                            lineHeight: 1.7,
                            maxWidth: 420,
                            margin: "0 auto 24px",
                        }}
                    >
                        Sei intrappolato in 5 stanze. Per aprire ogni porta devi:{" "}
                        <strong>scegliere la strategia giusta</strong> e{" "}
                        <strong>calcolare la risposta numerica corretta</strong>.
                        Gli aiuti sono disponibili ma costano punti!
                    </p>

                    {/* Info chip */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 10,
                            flexWrap: "wrap",
                            marginBottom: 28,
                        }}
                    >
                        {[
                            { icon: "🏠", label: "5 stanze", color: "#3b82f6", bg: "#eff6ff" },
                            { icon: "🎯", label: "+40 strategia", color: "#16a34a", bg: "#f0fdf4" },
                            { icon: "🔢", label: "+60 calcolo", color: "#d97706", bg: "#fef3c7" },
                            { icon: "💡", label: "hint −10 pt", color: "#dc2626", bg: "#fef2f2" },
                        ].map((chip) => (
                            <div
                                key={chip.label}
                                style={{
                                    padding: "8px 14px",
                                    background: chip.bg,
                                    borderRadius: 10,
                                    fontSize: 13,
                                    color: chip.color,
                                    fontWeight: 600,
                                }}
                            >
                                {chip.icon} {chip.label}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            padding: "14px 44px",
                            background: "#1d4ed8",
                            color: "#fff",
                            border: "none",
                            borderRadius: 14,
                            fontSize: 17,
                            fontWeight: 700,
                            cursor: "pointer",
                            letterSpacing: 0.3,
                        }}
                    >
                        Entra nella Escape Room →
                    </button>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════
    //  VICTORY
    // ══════════════════════════════════════════
    if (phase === "victory") {
        // Includi l'ultima stanza nel totale
        const allScores = [...roomScores, currentRoomScore];
        const grandTotal = allScores.reduce(
            (sum, s) => sum + s.method + s.precision - s.hintPenalty,
            0
        );
        const percentage = Math.round((grandTotal / 500) * 100);
        let medal = "🥉";
        if (percentage >= 90) medal = "🥇";
        else if (percentage >= 70) medal = "🥈";

        return (
            <div
                style={{
                    maxWidth: 580,
                    margin: "0 auto",
                    padding: isMobile ? "16px 12px" : "24px 16px",
                }}
            >
                {BackLink}
                <div
                    style={{
                        textAlign: "center",
                        padding: isMobile ? "28px 20px" : "40px 32px",
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
                        border: "2px solid #fcd34d",
                    }}
                >
                    <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
                    <h2
                        style={{
                            fontSize: isMobile ? 22 : 28,
                            fontWeight: 800,
                            color: "#0f172a",
                            marginBottom: 6,
                        }}
                    >
                        Sei uscito dalla Escape Room!
                    </h2>
                    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                        Tutte e 5 le stanze completate
                    </p>

                    {/* Punteggio grande */}
                    <div
                        style={{
                            display: "inline-block",
                            padding: "20px 48px",
                            background: "#fffbeb",
                            borderRadius: 16,
                            border: "2px solid #fcd34d",
                            marginBottom: 24,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                color: "#92400e",
                                fontWeight: 700,
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                marginBottom: 4,
                            }}
                        >
                            Punteggio totale
                        </div>
                        <div
                            style={{
                                fontSize: 54,
                                fontWeight: 800,
                                color: "#d97706",
                                lineHeight: 1,
                            }}
                        >
                            {grandTotal}
                            <span style={{ fontSize: 22, color: "#92400e" }}>/500</span>
                        </div>
                        <div style={{ fontSize: 22, marginTop: 6 }}>
                            {medal} {percentage}%
                        </div>
                    </div>

                    {/* Dettaglio per stanza */}
                    <div
                        style={{
                            textAlign: "left",
                            marginBottom: 24,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        {ROOMS.map((r, i) => {
                            const s = allScores[i];
                            if (!s) return null;
                            const roomTotal = s.method + s.precision - s.hintPenalty;
                            return (
                                <div
                                    key={r.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "10px 14px",
                                        background: "#f8fafc",
                                        borderRadius: 10,
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: "#334155" }}>
                                        {r.emoji} {r.name}
                                    </span>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: "#64748b",
                                            }}
                                        >
                                            {s.method}/40 + {s.precision}/60
                                            {s.hintPenalty > 0 && (
                                                <span style={{ color: "#ef4444" }}>
                                                    {" "}−{s.hintPenalty}
                                                </span>
                                            )}
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                color:
                                                    roomTotal === 100
                                                        ? "#16a34a"
                                                        : roomTotal >= 60
                                                        ? "#d97706"
                                                        : "#ef4444",
                                                fontSize: 15,
                                                minWidth: 28,
                                                textAlign: "right",
                                            }}
                                        >
                                            {roomTotal}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            padding: "14px 44px",
                            background: "#1d4ed8",
                            color: "#fff",
                            border: "none",
                            borderRadius: 14,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Gioca ancora
                    </button>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════
    //  STRATEGY — scegli 1 tra 4 strategie
    // ══════════════════════════════════════════
    if (phase === "strategy") {
        return (
            <div
                style={{
                    maxWidth: 580,
                    margin: "0 auto",
                    padding: isMobile ? "16px 12px" : "24px 16px",
                }}
            >
                {BackLink}
                <RoomHeader />
                <RoomCard />

                <div
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        padding: isMobile ? "16px 14px" : "20px 20px",
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: 14,
                        }}
                    >
                        FASE 1 — Scegli la strategia
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                            gap: 10,
                        }}
                    >
                        {room.strategies.map((strat) => (
                            <StrategyButton
                                key={strat.id}
                                label={strat.label}
                                onClick={() => handleStrategyChoice(strat.id)}
                                isMobile={isMobile}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════
    //  STRATEGY_FEEDBACK
    // ══════════════════════════════════════════
    if (phase === "strategy_feedback") {
        const chosen = room.strategies.find((s) => s.id === chosenStrategyId)!;
        const isCorrect = chosen.isCorrect;

        return (
            <div
                style={{
                    maxWidth: 580,
                    margin: "0 auto",
                    padding: isMobile ? "16px 12px" : "24px 16px",
                }}
            >
                {BackLink}
                <RoomHeader />
                <RoomCard />

                <div
                    style={{
                        background: isCorrect ? "#f0fdf4" : "#fffbeb",
                        borderRadius: 16,
                        border: `2px solid ${isCorrect ? "#86efac" : "#fcd34d"}`,
                        padding: isMobile ? "16px 14px" : "20px 20px",
                        marginBottom: 14,
                    }}
                >
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: isCorrect ? "#16a34a" : "#92400e",
                            marginBottom: 8,
                        }}
                    >
                        {isCorrect
                            ? `✅ Metodo corretto! +40 pt`
                            : `⚠️ Non è il metodo migliore (0 pt), ma puoi procedere`}
                    </div>
                    <p style={{ fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.6 }}>
                        {chosen.feedback}
                    </p>
                </div>

                <button
                    onClick={proceedToNumeric}
                    style={{
                        width: "100%",
                        padding: "14px",
                        background: "#1d4ed8",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Avanti → Calcola la risposta
                </button>
            </div>
        );
    }

    // ══════════════════════════════════════════
    //  NUMERIC — inserisci risposta
    // ══════════════════════════════════════════
    if (phase === "numeric") {
        return (
            <div
                style={{
                    maxWidth: 580,
                    margin: "0 auto",
                    padding: isMobile ? "16px 12px" : "24px 16px",
                }}
            >
                {BackLink}
                <RoomHeader />
                <RoomCard />

                <div
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        padding: isMobile ? "16px 14px" : "20px 20px",
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: 14,
                        }}
                    >
                        FASE 2 — Calcola la risposta
                    </div>

                    {/* Hints mostrati */}
                    {hintsShown.length > 0 && (
                        <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                            {hintsShown.map((idx) => (
                                <InfoBox key={idx} variant="amber" title={`💡 Aiuto ${idx + 1}`}>
                                    {room.hints[idx]}
                                </InfoBox>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{ marginBottom: 14 }}>
                        <QuizNumericInput
                            value={numericValue}
                            onChange={setNumericValue}
                            placeholder="Inserisci il risultato..."
                            unit={room.unit || undefined}
                            disabled={false}
                            state="default"
                        />
                    </div>

                    {/* Bottoni */}
                    <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                        {hintsUsed < 3 && (
                            <button
                                onClick={handleShowHint}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    border: "1px solid #fcd34d",
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                💡 Aiuto ({3 - hintsUsed} rimasti, −10 pt)
                            </button>
                        )}
                        <button
                            onClick={handleVerify}
                            disabled={numericValue.trim() === ""}
                            style={{
                                flex: 2,
                                padding: "12px",
                                background:
                                    numericValue.trim() === "" ? "#94a3b8" : "#1d4ed8",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor:
                                    numericValue.trim() === "" ? "not-allowed" : "pointer",
                            }}
                        >
                            Verifica ✓
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════
    //  ROOM_FEEDBACK
    // ══════════════════════════════════════════
    if (phase === "room_feedback") {
        const roomTotal =
            currentRoomScore.method +
            currentRoomScore.precision -
            currentRoomScore.hintPenalty;
        const isLastRoom = roomIdx + 1 >= ROOMS.length;

        return (
            <div
                style={{
                    maxWidth: 580,
                    margin: "0 auto",
                    padding: isMobile ? "16px 12px" : "24px 16px",
                }}
            >
                {BackLink}
                <RoomHeader />

                {/* Banner risposta */}
                <div
                    style={{
                        padding: isMobile ? "16px 14px" : "20px 20px",
                        background: numericCorrect ? "#f0fdf4" : "#fef2f2",
                        borderRadius: 16,
                        border: `2px solid ${numericCorrect ? "#86efac" : "#fca5a5"}`,
                        marginBottom: 14,
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: 36, marginBottom: 6 }}>
                        {numericCorrect ? "✅" : "❌"}
                    </div>
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: numericCorrect ? "#16a34a" : "#dc2626",
                            marginBottom: 8,
                        }}
                    >
                        {numericCorrect
                            ? "Risposta corretta! +60 pt"
                            : `Risposta errata. La risposta esatta era: ${room.answer}${room.unit ? " " + room.unit : ""}`}
                    </div>
                    <p
                        style={{
                            fontSize: 13,
                            color: "#475569",
                            margin: 0,
                            lineHeight: 1.6,
                        }}
                    >
                        {room.solutionExplanation}
                    </p>
                </div>

                {/* Scorecard stanza */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        padding: isMobile ? "16px 14px" : "20px 20px",
                        marginBottom: 14,
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: 12,
                        }}
                    >
                        {room.emoji} Punteggio — {room.name}
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <ScoreChip
                            label="Metodo"
                            value={currentRoomScore.method}
                            max={40}
                            color="#3b82f6"
                        />
                        <ScoreChip
                            label="Calcolo"
                            value={currentRoomScore.precision}
                            max={60}
                            color="#16a34a"
                        />
                        <ScoreChip
                            label="Hint"
                            value={-currentRoomScore.hintPenalty}
                            max={0}
                            color={currentRoomScore.hintPenalty > 0 ? "#ef4444" : "#94a3b8"}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            background: "#f8fafc",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#0f172a",
                        }}
                    >
                        <span>Totale stanza</span>
                        <span
                            style={{
                                color:
                                    roomTotal === 100
                                        ? "#16a34a"
                                        : roomTotal >= 60
                                        ? "#d97706"
                                        : "#ef4444",
                            }}
                        >
                            {roomTotal} / 100
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleNextRoom}
                    style={{
                        width: "100%",
                        padding: "14px",
                        background: isLastRoom ? "#16a34a" : "#1d4ed8",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    {isLastRoom ? "🏁 Vedi risultato finale!" : "Prossima stanza →"}
                </button>
            </div>
        );
    }

    return null;
}

// ─── Componenti ausiliari ───

function StrategyButton({
    label,
    onClick,
    isMobile,
}: {
    label: string;
    onClick: () => void;
    isMobile: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: isMobile ? "14px 10px" : "16px 12px",
                background: hovered ? "#eff6ff" : "#fff",
                border: `2px solid ${hovered ? "#3b82f6" : "#e2e8f0"}`,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                color: hovered ? "#1e40af" : "#0f172a",
                textAlign: "center",
            }}
        >
            {label}
        </button>
    );
}

function ScoreChip({
    label,
    value,
    max,
    color,
}: {
    label: string;
    value: number;
    max: number;
    color: string;
}) {
    return (
        <div
            style={{
                background: `${color}12`,
                borderRadius: 10,
                padding: "10px 8px",
                textAlign: "center",
                border: `1px solid ${color}30`,
            }}
        >
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                    marginBottom: 4,
                }}
            >
                {value >= 0 ? "+" : ""}{value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                {label}
                {max > 0 && (
                    <span style={{ color: "#94a3b8" }}>/{max}</span>
                )}
            </div>
        </div>
    );
}

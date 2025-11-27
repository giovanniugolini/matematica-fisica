import React, { useRef, useState } from "react";

type Vector = {
    x0: number; // origine x
    y0: number; // origine y
    dx: number; // componente x
    dy: number; // componente y
};

const WIDTH = 500;
const HEIGHT = 500;
const SCALE = 20; // pixel per unità

function toSvgX(x: number): number {
    return WIDTH / 2 + x * SCALE;
}

function toSvgY(y: number): number {
    // asse y matematico verso l’alto, in SVG verso il basso
    return HEIGHT / 2 - y * SCALE;
}

type ArrowProps = {
    x0: number;
    y0: number;
    dx: number;
    dy: number;
    strokeWidth?: number;
    stroke?: string;
    fill?: string;
    dashed?: boolean;
};

const Arrow: React.FC<ArrowProps> = ({
                                         x0,
                                         y0,
                                         dx,
                                         dy,
                                         strokeWidth = 2,
                                         stroke = "#000",
                                         fill,
                                         dashed = false,
                                     }) => {
    const x1 = x0 + dx;
    const y1 = y0 + dy;

    const sx0 = toSvgX(x0);
    const sy0 = toSvgY(y0);
    const sx1 = toSvgX(x1);
    const sy1 = toSvgY(y1);

    const angle = Math.atan2(sy1 - sy0, sx1 - sx0);
    const headLength = 10;

    const hx1 = sx1 - headLength * Math.cos(angle - Math.PI / 6);
    const hy1 = sy1 - headLength * Math.sin(angle - Math.PI / 6);
    const hx2 = sx1 - headLength * Math.cos(angle + Math.PI / 6);
    const hy2 = sy1 - headLength * Math.sin(angle + Math.PI / 6);

    return (
        <>
            <line
                x1={sx0}
                y1={sy0}
                x2={sx1}
                y2={sy1}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashed ? "4 3" : undefined}
            />
            <polygon
                points={`${sx1},${sy1} ${hx1},${hy1} ${hx2},${hy2}`}
                fill={fill ?? stroke}
                stroke={stroke}
            />
        </>
    );
};

type DrawMode = "none" | "A" | "B";

const VectorTailToHeadPage: React.FC = () => {
    const [vecA, setVecA] = useState<Vector>({ x0: 0, y0: 0, dx: 4, dy: 2 });
    const [vecB, setVecB] = useState<Vector>({ x0: 0, y0: 0, dx: 3, dy: 3 });

    const [showSum, setShowSum] = useState(false);
    const [originMode, setOriginMode] = useState(false); // false: geometria nel piano, true: tutto all'origine

    const isAnimatingRef = useRef(false);

    const [drawMode, setDrawMode] = useState<DrawMode>("none");
    const [pendingStart, setPendingStart] = useState<{ x: number; y: number } | null>(null);

    const handleChange =
        (vectorId: "A" | "B", field: keyof Vector) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = parseFloat(e.target.value || "0");
                setShowSum(false);
                setOriginMode(false);
                setDrawMode("none");
                setPendingStart(null);

                if (vectorId === "A") {
                    setVecA((prev) => ({ ...prev, [field]: value }));
                } else {
                    setVecB((prev) => ({ ...prev, [field]: value }));
                }
            };

    // vettore somma
    const sumVector: Vector = originMode
        ? {
            // modalità "tutti all'origine"
            x0: 0,
            y0: 0,
            dx: vecA.dx + vecB.dx,
            dy: vecA.dy + vecB.dy,
        }
        : {
            // modalità geometrica: dalla coda di A alla punta di B
            x0: vecA.x0,
            y0: vecA.y0,
            dx: vecB.x0 + vecB.dx - vecA.x0,
            dy: vecB.y0 + vecB.dy - vecA.y0,
        };

    // numeri casuali per componenti in [-4, 4] a step 0.5
    const randComp = () => {
        const v = Math.round((Math.random() * 8 - 4) * 2) / 2; // [-4, 4]
        return v === 0 ? 1 : v; // evito il vettore nullo
    };

    // numeri casuali per coordinate di origine in [-3, 3] a step 0.5
    const randCoord = () => {
        return Math.round((Math.random() * 6 - 3) * 2) / 2; // [-3, 3]
    };

    // vettori casuali, NON necessariamente con coda nell'origine
    const randomizeVectors = () => {
        const newA: Vector = {
            x0: randCoord(),
            y0: randCoord(),
            dx: randComp(),
            dy: randComp(),
        };
        const newB: Vector = {
            x0: randCoord(),
            y0: randCoord(),
            dx: randComp(),
            dy: randComp(),
        };

        setVecA(newA);
        setVecB(newB);
        setShowSum(false);
        setOriginMode(false);
        setDrawMode("none");
        setPendingStart(null);
    };

    const resetVectors = () => {
        setVecA({ x0: 0, y0: 0, dx: 4, dy: 2 });
        setVecB({ x0: 0, y0: 0, dx: 3, dy: 3 });
        setShowSum(false);
        setOriginMode(false);
        setDrawMode("none");
        setPendingStart(null);
    };

    // animazione metodo punta-coda: porta la coda di B sulla punta di A
    const animateTailToHead = () => {
        if (isAnimatingRef.current) return;

        setOriginMode(false); // vista geometrica
        setDrawMode("none");
        setPendingStart(null);

        const startX0 = vecB.x0;
        const startY0 = vecB.y0;
        const endX0 = vecA.x0 + vecA.dx;
        const endY0 = vecA.y0 + vecA.dy;

        const duration = 800; // ms
        let startTime: number | null = null;

        isAnimatingRef.current = true;
        setShowSum(true); // mostro la somma durante/dopo l’animazione

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(1, elapsed / duration);

            const currentX0 = startX0 + (endX0 - startX0) * t;
            const currentY0 = startY0 + (endY0 - startY0) * t;

            setVecB((prev) => ({
                ...prev,
                x0: currentX0,
                y0: currentY0,
            }));

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                isAnimatingRef.current = false;
            }
        };

        requestAnimationFrame(step);
    };

    // TRASLAZIONE FINALE ANIMATA: tutti i vettori con coda in (0,0)
    const bringAllToOrigin = () => {
        if (isAnimatingRef.current) return;

        isAnimatingRef.current = true;

        setShowSum(true);
        setOriginMode(true);
        setDrawMode("none");
        setPendingStart(null);

        const startAx0 = vecA.x0;
        const startAy0 = vecA.y0;
        const startBx0 = vecB.x0;
        const startBy0 = vecB.y0;

        const duration = 800; // ms
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(1, elapsed / duration);

            const currentAx0 = startAx0 * (1 - t);
            const currentAy0 = startAy0 * (1 - t);
            const currentBx0 = startBx0 * (1 - t);
            const currentBy0 = startBy0 * (1 - t);

            setVecA((prev) => ({
                ...prev,
                x0: currentAx0,
                y0: currentAy0,
            }));
            setVecB((prev) => ({
                ...prev,
                x0: currentBx0,
                y0: currentBy0,
            }));

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                // correggiamo eventuali residui numerici
                setVecA((prev) => ({ ...prev, x0: 0, y0: 0 }));
                setVecB((prev) => ({ ...prev, x0: 0, y0: 0 }));
                isAnimatingRef.current = false;
            }
        };

        requestAnimationFrame(step);
    };

    // gestione click sul piano per disegnare A o B con due clic
    const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (isAnimatingRef.current) return;
        if (drawMode === "none") return;

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const xSvg = e.clientX - rect.left;
        const ySvg = e.clientY - rect.top;

        const x = (xSvg - WIDTH / 2) / SCALE;
        const y = (HEIGHT / 2 - ySvg) / SCALE;

        // primo clic: memorizzo la coda
        if (!pendingStart) {
            setPendingStart({ x, y });
            return;
        }

        // secondo clic: definisco il vettore
        const dx = x - pendingStart.x;
        const dy = y - pendingStart.y;

        if (drawMode === "A") {
            setVecA((prev) => ({
                ...prev,
                x0: pendingStart.x,
                y0: pendingStart.y,
                dx,
                dy,
            }));
        } else if (drawMode === "B") {
            setVecB((prev) => ({
                ...prev,
                x0: pendingStart.x,
                y0: pendingStart.y,
                dx,
                dy,
            }));
        }

        setPendingStart(null);
        setDrawMode("none");
        setShowSum(false);
        setOriginMode(false);
    };

    const startDrawVector = (which: DrawMode) => {
        if (isAnimatingRef.current) return;
        setDrawMode(which);
        setPendingStart(null);
        setShowSum(false);
        setOriginMode(false);
    };

    const drawHint =
        drawMode === "A"
            ? "Modalità disegno: vettore A. Clicca la coda, poi la punta nel piano."
            : drawMode === "B"
                ? "Modalità disegno: vettore B. Clicca la coda, poi la punta nel piano."
                : "";

    return (
        <div
            style={{
                padding: "1.5rem",
                maxWidth: "1100px",
                margin: "0 auto",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                Somma di vettori – metodo punta-coda
            </h1>
            <p style={{ marginBottom: "1rem", lineHeight: 1.4 }}>
                1) Puoi generare due vettori casuali nel piano oppure disegnarli con due clic
                (coda e punta). 2) Usa <em>“Anima metodo punta-coda”</em> per spostare la
                coda di B sulla punta di A e vedere graficamente la somma. 3) Con{" "}
                <em>“Trasla tutti all&apos;origine”</em> metti A, B e A+B in posizione
                standard, con coda nell&apos;origine.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                }}
            >
                {/* Area grafica */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "0.5rem",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                    }}
                >
                    <svg
                        width={WIDTH}
                        height={HEIGHT}
                        onClick={handleSvgClick}
                        style={{ cursor: drawMode === "none" ? "default" : "crosshair" }}
                    >
                        {/* sfondo */}
                        <rect
                            x={0}
                            y={0}
                            width={WIDTH}
                            height={HEIGHT}
                            fill="#fafafa"
                            stroke="#ccc"
                        />
                        {/* griglia */}
                        {Array.from({ length: 21 }, (_, i) => i - 10).map((k) => (
                            <React.Fragment key={k}>
                                {/* verticali */}
                                <line
                                    x1={toSvgX(k)}
                                    y1={0}
                                    x2={toSvgX(k)}
                                    y2={HEIGHT}
                                    stroke="#eee"
                                    strokeWidth={1}
                                />
                                {/* orizzontali */}
                                <line
                                    x1={0}
                                    y1={toSvgY(k)}
                                    x2={WIDTH}
                                    y2={toSvgY(k)}
                                    stroke="#eee"
                                    strokeWidth={1}
                                />
                            </React.Fragment>
                        ))}
                        {/* assi */}
                        <line
                            x1={0}
                            y1={toSvgY(0)}
                            x2={WIDTH}
                            y2={toSvgY(0)}
                            stroke="#000"
                            strokeWidth={1.5}
                        />
                        <line
                            x1={toSvgX(0)}
                            y1={0}
                            x2={toSvgX(0)}
                            y2={HEIGHT}
                            stroke="#000"
                            strokeWidth={1.5}
                        />
                        {/* etichette semplici sugli assi */}
                        <text x={toSvgX(9)} y={toSvgY(-0.3)} fontSize={12}>
                            x
                        </text>
                        <text x={toSvgX(0.3)} y={toSvgY(9)} fontSize={12}>
                            y
                        </text>

                        {/* vettore A: blu */}
                        <Arrow
                            x0={vecA.x0}
                            y0={vecA.y0}
                            dx={vecA.dx}
                            dy={vecA.dy}
                            strokeWidth={3}
                            stroke="#1f77b4"
                            fill="#1f77b4"
                        />

                        {/* vettore B: verde */}
                        <Arrow
                            x0={vecB.x0}
                            y0={vecB.y0}
                            dx={vecB.dx}
                            dy={vecB.dy}
                            strokeWidth={3}
                            stroke="#2ca02c"
                            fill="#2ca02c"
                        />

                        {/* vettore somma: rosso tratteggiato */}
                        {showSum && (
                            <Arrow
                                x0={sumVector.x0}
                                y0={sumVector.y0}
                                dx={sumVector.dx}
                                dy={sumVector.dy}
                                strokeWidth={3}
                                stroke="#d62728"
                                fill="#d62728"
                                dashed
                            />
                        )}
                    </svg>
                    {drawHint && (
                        <p
                            style={{
                                marginTop: "0.4rem",
                                fontSize: "0.85rem",
                                fontStyle: "italic",
                            }}
                        >
                            {drawHint}
                        </p>
                    )}
                </div>

                {/* Controlli */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {/* Pulsanti principali */}
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={randomizeVectors}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 600,
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            Genera vettori casuali
                        </button>
                        <button
                            onClick={animateTailToHead}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 600,
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            Anima metodo punta-coda
                        </button>
                        <button
                            onClick={bringAllToOrigin}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 600,
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            Trasla tutti all&apos;origine
                        </button>
                        <button
                            onClick={resetVectors}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Reset
                        </button>
                    </div>

                    {/* Pulsanti disegno A/B */}
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() => startDrawVector("A")}
                            style={{
                                padding: "0.35rem 0.8rem",
                                borderRadius: "999px",
                                border:
                                    drawMode === "A" ? "2px solid #1f77b4" : "1px solid #ccc",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                background:
                                    drawMode === "A" ? "rgba(31,119,180,0.1)" : "white",
                            }}
                        >
                            Disegna vettore A (2 clic)
                        </button>
                        <button
                            onClick={() => startDrawVector("B")}
                            style={{
                                padding: "0.35rem 0.8rem",
                                borderRadius: "999px",
                                border:
                                    drawMode === "B" ? "2px solid #2ca02c" : "1px solid #ccc",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                background:
                                    drawMode === "B" ? "rgba(44,160,44,0.1)" : "white",
                            }}
                        >
                            Disegna vettore B (2 clic)
                        </button>
                    </div>

                    {/* Vettore A */}
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                        }}
                    >
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                            Vettore A
                        </h2>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "0.4rem",
                                alignItems: "center",
                            }}
                        >
                            <label>
                                x₀
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecA.x0}
                                    onChange={handleChange("A", "x0")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                            <label>
                                y₀
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecA.y0}
                                    onChange={handleChange("A", "y0")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                            <label>
                                Δx
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecA.dx}
                                    onChange={handleChange("A", "dx")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                            <label>
                                Δy
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecA.dy}
                                    onChange={handleChange("A", "dy")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Vettore B */}
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                        }}
                    >
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                            Vettore B
                        </h2>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "0.4rem",
                                alignItems: "center",
                            }}
                        >
                            <label>
                                x₀
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecB.x0}
                                    onChange={handleChange("B", "x0")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                            <label>
                                y₀
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecB.y0}
                                    onChange={handleChange("B", "y0")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                            <label>
                                Δx
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecB.dx}
                                    onChange={handleChange("B", "dx")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                            <label>
                                Δy
                                <input
                                    type="number"
                                    step="0.5"
                                    value={vecB.dy}
                                    onChange={handleChange("B", "dy")}
                                    style={{ width: "100%" }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Componenti Cartesiane */}
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        <h2 style={{ fontSize: "1.05rem", marginBottom: "0.3rem" }}>
                            Componenti Cartesiane
                        </h2>
                        <p>
                            A = ({vecA.dx.toFixed(2)}, {vecA.dy.toFixed(2)})
                        </p>
                        <p>
                            B = ({vecB.dx.toFixed(2)}, {vecB.dy.toFixed(2)})
                        </p>
                        {showSum && (
                            <p>
                                <strong>
                                    A + B = ({(vecA.dx + vecB.dx).toFixed(2)},{" "}
                                    {(vecA.dy + vecB.dy).toFixed(2)})
                                </strong>
                                {originMode && "  (in posizione standard, coda in (0,0))"}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VectorTailToHeadPage;

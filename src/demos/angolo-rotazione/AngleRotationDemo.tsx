import React, { useEffect, useMemo, useRef, useState } from "react";

// Conversioni e formattazione radianti
const DEG2RAD = Math.PI / 180;

// Prova a scrivere i radianti come multipli "puliti" di π (es. π/6, 3π/4)
function formatRadPi(rad: number): string {
    const k = rad / Math.PI; // multiplo di π
    const dens = [1, 2, 3, 4, 6, 8, 12, 16]; // denominatori comuni
    for (const d of dens) {
        const n = Math.round(k * d);
        if (Math.abs(k - n / d) < 1e-3) {
            if (n === 0) return "0";
            if (d === 1) return `${n}π`;
            return `${n}π/${d}`;
        }
    }
    return rad.toFixed(3);
}

// clamp helper
function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
}

// Demo interattiva: angolo come rotazione (CCW positivo)
export default function AngleRotationDemo() {
    const [angleDeg, setAngleDeg] = useState(35);
    const [isAnimating, setIsAnimating] = useState(false);
    const [speed, setSpeed] = useState(30); // deg/s
    const [direction, setDirection] = useState(1); // 1 = CCW, -1 = CW
    const [showProjections, setShowProjections] = useState(true);

    // nuovi toggle
    const [highlightArc, setHighlightArc] = useState(false);
    const [highlightRadius, setHighlightRadius] = useState(false);

    const svgRef = useRef<SVGSVGElement | null>(null);

    const size = 420;
    const cx = size / 2;
    const cy = size / 2;
    const R = 160;

    // Convenzione matematica: CCW positivo
    const angleRad = useMemo(() => angleDeg * DEG2RAD, [angleDeg]);

    // Animazione continua (mod 360; non arriva esattamente a 360)
    useEffect(() => {
        if (!isAnimating) return;
        let raf: number;
        let last = performance.now();
        const tick = (t: number) => {
            const dt = (t - last) / 1000;
            last = t;
            setAngleDeg((a) => {
                let next = a + direction * speed * dt;
                // modulo 360 mantenendo 0..360 (se supera 360 ricomincia da 0)
                next %= 360;
                if (next < 0) next += 360;
                return next;
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isAnimating, speed, direction]);

    // Drag: estrai angolo con CCW positivo (y invertita) e normalizza 0..360)
    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const svg = svgRef.current;
        if (!svg) return;

        const el = e.currentTarget; // <svg> stabile nella closure
        el.setPointerCapture?.(e.pointerId);

        const handleMove = (ev: PointerEvent) => {
            const pt = svg.createSVGPoint();
            pt.x = ev.clientX;
            pt.y = ev.clientY;
            const ctm = svg.getScreenCTM();
            if (!ctm) return;
            const p = pt.matrixTransform(ctm.inverse());

            const dx = p.x - cx;
            const dy = p.y - cy;
            const ang = Math.atan2(-dy, dx); // CCW positivo
            let deg = (ang * 180) / Math.PI; // (-180,180]
            if (deg < 0) deg += 360;         // -> [0,360)
            setAngleDeg(deg);
        };

        const handleUp = () => {
            try {
                el.releasePointerCapture?.(e.pointerId);
            } catch {}
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };

        window.addEventListener("pointermove", handleMove, { passive: false });
        window.addEventListener("pointerup", handleUp, { passive: true });
    }

    // Converte un angolo (in CONVENZIONE MATEMATICA) in coordinate SVG
    function polarToXY(r: number, angRad: number) {
        // y con segno opposto perché in SVG l'asse cresce verso il basso
        return { x: cx + r * Math.cos(angRad), y: cy - r * Math.sin(angRad) };
    }

    const P = polarToXY(R, angleRad);
    const Px = { x: P.x, y: cy };
    const Py = { x: cx, y: P.y };

    // Soglia per considerare l'angolo come "giro completo"
    const EPS_FULL = 0.5; // gradi

    // Arco "piccolo" vicino al centro, r = 60
    function ArcSmall() {
        const a = angleDeg;
        if (a <= 1e-6) return null;
        if (a >= 360 - EPS_FULL) {
            // giro completo
            return <circle cx={cx} cy={cy} r={60} fill="none" stroke="#3b82f6" strokeWidth={5} />;
        }
        const largeArc = a > 180 ? 1 : 0;
        const sweep = 0; // CCW visivo
        const start = polarToXY(60, 0);
        const end = polarToXY(60, angleRad);
        const d = `M ${start.x} ${start.y} A 60 60 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
        return <path d={d} fill="none" stroke="#3b82f6" strokeWidth={5} />;
    }

    // Arco "grande" sulla circonferenza principale, r = R
    function ArcOnCircle() {
        if (!highlightArc || angleDeg <= 1e-6) return null;
        if (angleDeg >= 360 - EPS_FULL) {
            // giro completo
            return <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ef4444" strokeWidth={6} />;
        }
        const a = angleDeg;
        const largeArc = a > 180 ? 1 : 0;
        const sweep = 0; // CCW visivo
        const start = polarToXY(R, 0);
        const end = polarToXY(R, angleRad);
        const d = `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
        return (
            <path
                d={d}
                fill="none"
                stroke="#ef4444"
                strokeWidth={6}
                strokeLinecap="round"
            />
        );
    }

    return (
        <div style={{ maxWidth: "900px", margin: "auto", padding: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Angolo come rotazione
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "1rem" }}>
                Trascina il punto blu sulla circonferenza, usa lo slider o avvia l'animazione.
                Convenzione: <b>antiorario = angoli positivi</b>. Intervallo di lavoro: 0°–360°.
            </p>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ background: "white", borderRadius: 16, padding: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${size} ${size}`}
                        style={{ width: "100%", height: "auto", cursor: "crosshair", touchAction: "none" }}
                        onPointerDown={onPointerDown}
                    >
                        <rect x={0} y={0} width={size} height={size} fill="white" />
                        {/* circonferenza */}
                        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e5e7eb" strokeWidth={2} />

                        {/* arco evidenziato sulla circonferenza principale (toggle) */}
                        <ArcOnCircle />

                        {/* assi */}
                        <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke="#d1d5db" strokeDasharray="6 6" />
                        <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke="#d1d5db" strokeDasharray="6 6" />

                        {/* lato iniziale (asse x positivo) */}
                        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="#9ca3af" strokeWidth={3} />

                        {/* arco angolo "piccolo" vicino al centro (sempre visibile) */}
                        <ArcSmall />

                        {/* lato finale (raggio) */}
                        <line
                            x1={cx}
                            y1={cy}
                            x2={P.x}
                            y2={P.y}
                            stroke={highlightRadius ? "#f59e0b" : "#111827"}
                            strokeWidth={highlightRadius ? 6 : 4}
                        />

                        {/* proiezioni */}
                        {showProjections && (
                            <g>
                                <line x1={P.x} y1={P.y} x2={Px.x} y2={Px.y} stroke="#a8a29e" strokeDasharray="4 4" />
                                <line x1={P.x} y1={P.y} x2={Py.x} y2={Py.y} stroke="#a8a29e" strokeDasharray="4 4" />
                                <circle cx={Px.x} cy={Px.y} r={4} fill="#a8a29e" />
                                <circle cx={Py.x} cy={Py.y} r={4} fill="#a8a29e" />
                            </g>
                        )}

                        <circle cx={cx} cy={cy} r={5} fill="#111827" />
                        <circle cx={P.x} cy={P.y} r={9} fill="#3b82f6" />
                        <text x={cx + R + 10} y={cy - 8} fontSize={12} fill="#6b7280">
                            lato iniziale
                        </text>
                    </svg>
                </div>

                <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <div>
                        <label>Angolo (°)</label>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={angleDeg}
                            onChange={(e) => setAngleDeg(clamp(parseFloat(e.target.value), 0, 360))}
                            style={{ width: "100%" }}
                        />
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                            {angleDeg.toFixed(1)}°
                            <span style={{ marginLeft: 12, fontSize: 16, color: "#6b7280" }}>
                ({(angleDeg * DEG2RAD).toFixed(3)} rad = {formatRadPi(angleDeg * DEG2RAD)})
              </span>
                        </div>
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                            style={{ padding: "8px 16px", borderRadius: 16, background: "black", color: "white", border: 0 }}
                            onClick={() => setIsAnimating((v) => !v)}
                        >
                            {isAnimating ? "Pausa" : "Avvia animazione"}
                        </button>
                        <button
                            style={{ padding: "8px 16px", borderRadius: 16, background: "#f3f4f6", border: 0 }}
                            onClick={() => setAngleDeg(0)}
                        >
                            Reset
                        </button>

                        {/* nuovi pulsanti */}
                        <button
                            style={{ padding: "8px 16px", borderRadius: 16, background: highlightArc ? "#fecaca" : "#f3f4f6", border: 0 }}
                            onClick={() => setHighlightArc((s) => !s)}
                        >
                            {highlightArc ? "Nascondi arco" : "Evidenzia arco sulla circonferenza"}
                        </button>
                        <button
                            style={{ padding: "8px 16px", borderRadius: 16, background: highlightRadius ? "#fde68a" : "#f3f4f6", border: 0 }}
                            onClick={() => setHighlightRadius((s) => !s)}
                        >
                            {highlightRadius ? "Raggio normale" : "Evidenzia raggio"}
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                Velocità (°/s)
                                <input
                                    type="number"
                                    value={speed}
                                    onChange={(e) => setSpeed(parseFloat(e.target.value || "0"))}
                                    style={{ width: 80 }}
                                />
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                    type="checkbox"
                                    checked={direction === -1}
                                    onChange={(e) => setDirection(e.target.checked ? -1 : 1)}
                                />
                                Senso orario
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <label style={{ display: "block" }}>
                            <input
                                type="checkbox"
                                checked={showProjections}
                                onChange={(e) => setShowProjections(e.target.checked)}
                            />
                            Mostra proiezioni (cosθ, sinθ)
                        </label>
                    </div>

                    <p style={{ fontSize: "0.9rem", marginTop: 16 }}>
                        L'angolo è la rotazione dal lato iniziale (asse x positivo) al lato finale. Con proiezioni attive,
                        la coordinata x = cos θ e la y = sin θ. Convenzione: antiorario = positivo.
                    </p>
                </div>
            </div>
        </div>
    );
}

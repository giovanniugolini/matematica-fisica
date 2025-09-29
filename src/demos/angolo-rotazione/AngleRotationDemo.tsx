import React, { useEffect, useMemo, useRef, useState } from "react";

// Demo interattiva: angolo come rotazione
export default function AngleRotationDemo() {
    const [angleDeg, setAngleDeg] = useState(35);
    const [isAnimating, setIsAnimating] = useState(false);
    const [speed, setSpeed] = useState(30); // deg/s
    const [direction, setDirection] = useState(1); // 1 = CCW, -1 = CW
    const [showProjections, setShowProjections] = useState(true);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const size = 420;
    const cx = size / 2;
    const cy = size / 2;
    const R = 160;

    const angleRad = useMemo(() => (angleDeg * Math.PI) / 180, [angleDeg]);

    useEffect(() => {
        if (!isAnimating) return;
        let raf: number;
        let last = performance.now();
        const tick = (t: number) => {
            const dt = (t - last) / 1000;
            last = t;
            setAngleDeg((a) => {
                let next = a + direction * speed * dt;
                if (next > 720) next -= 720;
                if (next < -720) next += 720;
                return next;
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isAnimating, speed, direction]);

    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const svg = svgRef.current;
        if (!svg) return;
        svg.setPointerCapture(e.pointerId);
        const handleMove = (ev: PointerEvent) => {
            const pt = svg.createSVGPoint();
            pt.x = ev.clientX;
            pt.y = ev.clientY;
            const ctm = svg.getScreenCTM();
            if (!ctm) return;
            const p = pt.matrixTransform(ctm.inverse());
            const dx = p.x - cx;
            const dy = p.y - cy;
            const ang = Math.atan2(dy, dx);
            setAngleDeg((ang * 180) / Math.PI);
        };
        const handleUp = () => {
            svg.releasePointerCapture(e.pointerId);
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
    }

    function polarToXY(r: number, angRad: number) {
        return { x: cx + r * Math.cos(angRad), y: cy + r * Math.sin(angRad) };
    }

    const P = polarToXY(R, angleRad);
    const Px = { x: P.x, y: cy };
    const Py = { x: cx, y: P.y };

    function arcPath() {
        const a = angleDeg;
        if (Math.abs(a) < 0.0001) return "";
        const largeArc = Math.abs(a) > 180 ? 1 : 0;
        const sweep = a >= 0 ? 1 : 0;
        const start = polarToXY(60, 0);
        const end = polarToXY(60, angleRad);
        return `M ${start.x} ${start.y} A 60 60 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "auto", padding: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Angolo come rotazione
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "1rem" }}>
                Trascina il punto blu sulla circonferenza, usa lo slider o avvia l'animazione.
                L'angolo è la rotazione dal lato iniziale (asse x positivo) al lato finale.
            </p>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ background: "white", borderRadius: 16, padding: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${size} ${size}`}
                        style={{ width: "100%", height: "auto", cursor: "crosshair" }}
                        onPointerDown={onPointerDown}
                    >
                        <rect x={0} y={0} width={size} height={size} fill="white" />
                        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e5e7eb" strokeWidth={2} />
                        <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke="#d1d5db" strokeDasharray="6 6" />
                        <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke="#d1d5db" strokeDasharray="6 6" />
                        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="#9ca3af" strokeWidth={3} />
                        <path d={arcPath()} fill="none" stroke="#3b82f6" strokeWidth={5} />
                        <line x1={cx} y1={cy} x2={P.x} y2={P.y} stroke="#111827" strokeWidth={4} />
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
                            min={-360}
                            max={360}
                            step={1}
                            value={angleDeg}
                            onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                            {angleDeg.toFixed(1)}°
                            <span style={{ marginLeft: 12, fontSize: 16, color: "#6b7280" }}>
                ({angleRad.toFixed(3)} rad)
              </span>
                        </div>
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
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
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <label style={{ display: "block" }}>
                            <input
                                type="checkbox"
                                checked={direction === -1}
                                onChange={(e) => setDirection(e.target.checked ? -1 : 1)}
                            />
                            Senso orario (angoli negativi)
                        </label>
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
                        L'angolo è la rotazione dal lato iniziale (asse x positivo) al lato finale.
                        Con proiezioni attive, la coordinata x = cos θ e la y = sin θ.
                    </p>
                </div>
            </div>
        </div>
    );
}

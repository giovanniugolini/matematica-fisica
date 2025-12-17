import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type CheckResult = "none" | "true" | "false";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 18,
        border: "1px solid #e7e7e7",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Pill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: "#fafafa",
        fontWeight: 700,
        cursor: "pointer",
        marginRight: 10,
        marginBottom: 10,
      }}
    >
      {label}
    </button>
  );
}

function MiniCheckInequality() {
  // dalla presentazione: x-3<5 -> x<8
  const options = [1, 5, 8, 9];
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<CheckResult>("none");

  function check(x: number) {
    setPicked(x);
    const ok = x - 3 < 5;
    setResult(ok ? "true" : "false");
  }

  return (
    <div>
      <p>
        Considera la disequazione: <b>x − 3 &lt; 5</b>
      </p>
      <p style={{ opacity: 0.85 }}>
        Clicca un valore di <b>x</b> e controlla se rende vera la disequazione.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {options.map((x) => (
          <Pill key={x} label={`x = ${x}`} onClick={() => check(x)} />
        ))}
      </div>

      {result !== "none" && picked !== null && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 14,
            border: "1px solid #e7e7e7",
            background: "#fcfcfc",
          }}
        >
          <div style={{ fontWeight: 900 }}>{result === "true" ? "✅ Vera" : "❌ Falsa"}</div>
          <div style={{ marginTop: 6 }}>
            Calcolo: {picked} − 3 = {picked - 3} {picked - 3 < 5 ? "<" : "≥"} 5
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Conclusione: l’insieme soluzione è <b>x &lt; 8</b>.
          </div>
        </div>
      )}
    </div>
  );
}

function IntersectionTrainer() {
  // idea (sistemi): intersezione delle soluzioni
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);

  const interval = useMemo(() => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return { lo, hi };
  }, [a, b]);

  return (
    <div>
      <p>
        Sistema: <b>x &gt; 1</b> e <b>x &lt; 4</b>
      </p>
      <p style={{ opacity: 0.85 }}>
        L’idea è l’<b>intersezione</b> delle soluzioni: devono essere vere entrambe.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Pill label="Metti 1 e 4" onClick={() => { setA(1); setB(4); }} />
        <Pill label="Scambia (4 e 1)" onClick={() => { setA(4); setB(1); }} />
        <Pill label="Prova (2 e 6)" onClick={() => { setA(2); setB(6); }} />
      </div>

      <div
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 14,
          border: "1px solid #e7e7e7",
          background: "#fcfcfc",
        }}
      >
        <div style={{ fontWeight: 900 }}>Soluzioni comuni</div>
        <div style={{ marginTop: 6 }}>
          Intersezione = <b>({interval.lo}, {interval.hi})</b>
        </div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          (Estremi aperti perché sono “&gt;” e “&lt;”.)
        </div>
      </div>
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export default function TeoriaDisequazioni() {
  const [step, setStep] = useState(0);
  const reduce = prefersReducedMotion();

  const sections = [
    { title: "1. Cosa significa “<”?", body: <MiniCheckInequality /> },
    {
      title: "2. Intervalli e rappresentazione",
      body: (
        <p style={{ lineHeight: 1.5, opacity: 0.9 }}>
          Le soluzioni formano spesso un <b>intervallo</b>.
          <br />
          <b>[ ]</b> include l’estremo, <b>( )</b> lo esclude; <b>±∞</b> è sempre escluso.
        </p>
      ),
    },
    {
      title: "3. Principi di equivalenza (attenzione!)",
      body: (
        <p style={{ lineHeight: 1.5, opacity: 0.9 }}>
          Se moltiplichi o dividi per un <b>numero negativo</b>, devi <b>invertire il verso</b> della disequazione.
        </p>
      ),
    },
    {
      title: "4. Sistemi di disequazioni",
      body: <IntersectionTrainer />,
    },
    {
      title: "5. Collega con la demo sul grafico",
      body: (
        <p style={{ lineHeight: 1.5, opacity: 0.9 }}>
          Per allenarti a passare tra grafico, intervalli e forma algebrica puoi usare anche la demo:
          <br />
          <Link to="/disequazioni-soluzioni" style={{ fontWeight: 800 }}>
            Apri “Soluzioni di una disequazione: grafico, intervalli, forma algebrica”
          </Link>
        </p>
      ),
    },
  ];

  const current = sections[step];

  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
      {/* CSS minimale per transizioni (senza librerie) */}
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(18px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: "8px 0 4px", fontSize: 30 }}>Disequazioni e Sistemi</h1>
            <div style={{ opacity: 0.8 }}>Lezione interattiva (dalla tua presentazione).</div>
          </div>
          <Link to="/" style={{ fontWeight: 800 }}>← Home</Link>
        </div>

        <div
          key={step}
          style={{
            marginTop: 14,
            animation: reduce ? "none" : "slideIn 180ms ease-out",
          }}
        >
          <Card title={current.title}>{current.body}</Card>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 800,
              opacity: step === 0 ? 0.5 : 1,
              cursor: step === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Indietro
          </button>

          <div style={{ opacity: 0.7 }}>
            {step + 1} / {sections.length}
          </div>

          <button
            onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}
            disabled={step === sections.length - 1}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 800,
              opacity: step === sections.length - 1 ? 0.5 : 1,
              cursor: step === sections.length - 1 ? "not-allowed" : "pointer",
            }}
          >
            Avanti →
          </button>
        </div>
      </div>
    </div>
  );
}

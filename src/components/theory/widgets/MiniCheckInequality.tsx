import React, { useState } from "react";

type CheckResult = "none" | "true" | "false";

function Pill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: "#fafafa",
        fontWeight: 700,
        cursor: "pointer",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {label}
    </button>
  );
}

export default function MiniCheckInequality() {
  // Dalla presentazione: x-3<5 -> x<8
  const options = [1, 5, 8, 9];
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<CheckResult>("none");

  function check(x: number) {
    setPicked(x);
    const ok = x - 3 < 5;
    setResult(ok ? "true" : "false");
  }

  return (
    <div style={{ marginTop: 12 }}>
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

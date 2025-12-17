import React, { useEffect, useMemo, useState } from "react";
import MarkdownPage from "../../../components/theory/MarkdownPage";
import "../../../components/theory/theory.css";
import MiniCheckInequality from "../../../components/theory/widgets/MiniCheckInequality";

export default function DisequazioniTheory() {
    // Elenco delle pagine (file markdown)
    const pages = useMemo(
        () => [
            { id: 1, title: "Oltre l’uguaglianza", file: "page1.md" },
            // { id: 2, title: "Cosa significa <", file: "page2.md" },
        ],
        []
    );

    // Pagina corrente
    const [idx, setIdx] = useState(0);

    // Step di narrazione nella pagina corrente
    const [step, setStep] = useState(0);
    const [stepsCount, setStepsCount] = useState(1);

    // Quando cambio pagina, riparto dallo step 0
    useEffect(() => {
        setStep(0);
    }, [idx]);

    const current = pages[idx];

    const publicUrl = process.env.PUBLIC_URL || "";
    const baseUrl = `${publicUrl}/content/teoria/disequazioni/`;
    const src = baseUrl + current.file;

    /* ---- Navigazione ---- */

    function goNext() {
        // Se ci sono ancora step nella pagina, avanza nello step
        if (step < stepsCount - 1) {
            setStep((s) => s + 1);
            return;
        }
        // Altrimenti passa alla pagina successiva
        if (idx < pages.length - 1) {
            setIdx((i) => i + 1);
        }
    }

    function goPrev() {
        // Se non siamo al primo step, torna indietro di uno step
        if (step > 0) {
            setStep((s) => s - 1);
            return;
        }
        // Altrimenti torna alla pagina precedente
        if (idx > 0) {
            setIdx((i) => i - 1);
        }
    }

    return (
        <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
            <MarkdownPage
                src={src}
                baseUrl={baseUrl}
                widgets={{ MiniCheckInequality }}
                step={step}
                onStepsCount={setStepsCount}
            />

            <div className="theory" style={{ paddingTop: 0 }}>
                <div className="theory-nav">
                    <button
                        className="theory-btn"
                        disabled={idx === 0 && step === 0}
                        onClick={goPrev}
                    >
                        ← Indietro
                    </button>

                    <div style={{ opacity: 0.7 }}>
                        Pagina {idx + 1}/{pages.length} — Step {step + 1}/{stepsCount}
                    </div>

                    <button
                        className="theory-btn"
                        disabled={idx === pages.length - 1 && step === stepsCount - 1}
                        onClick={goNext}
                    >
                        Avanti →
                    </button>
                </div>
            </div>
        </div>
    );
}

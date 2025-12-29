/**
 * StepByStep Components - Componenti UI per demo matematiche step-by-step
 * @module components/ui/StepByStep
 */

import React from "react";

// ============ TIPI ============

export interface StepCardProps {
    /** Numero dello step (es. 1, 2, 3) */
    stepNumber: number;
    /** Titolo dello step */
    title: string;
    /** Colore del tema (hex o nome) */
    color: "green" | "blue" | "purple" | "amber" | "red" | "teal";
    /** Se lo step è attivo/visibile */
    isActive: boolean;
    /** Contenuto dello step */
    children: React.ReactNode;
    /** Classe CSS aggiuntiva */
    className?: string;
    /** Se occupa tutta la larghezza (gridColumn: 1 / -1) */
    fullWidth?: boolean;
}

export interface NavigationButtonsProps {
    /** Step corrente (0-indexed) */
    currentStep: number;
    /** Numero totale di step */
    totalSteps: number;
    /** Callback per andare avanti */
    onNext: () => void;
    /** Callback per andare indietro */
    onPrev: () => void;
    /** Callback per mostrare tutto */
    onShowAll: () => void;
    /** Classe CSS aggiuntiva */
    className?: string;
}

export interface ProblemCardProps {
    /** Etichetta sopra il problema (es. "Risolvi l'equazione:") */
    label: string;
    /** Contenuto del problema */
    children: React.ReactNode;
    /** Classe CSS aggiuntiva */
    className?: string;
}

export interface DemoContainerProps {
    /** Titolo della demo */
    title: string;
    /** Descrizione breve */
    description?: string;
    /** Link per tornare indietro */
    backLink?: string;
    /** Testo del link indietro */
    backText?: string;
    /** Contenuto della demo */
    children: React.ReactNode;
    /** Larghezza massima (default: 950px) */
    maxWidth?: number;
}

export interface GenerateButtonProps {
    /** Testo del pulsante */
    text?: string;
    /** Emoji prima del testo */
    emoji?: string;
    /** Callback al click */
    onClick: () => void;
    /** Classe CSS aggiuntiva */
    className?: string;
}

export interface InfoBoxProps {
    /** Titolo del box */
    title?: string;
    /** Contenuto */
    children: React.ReactNode;
    /** Variante di colore */
    variant?: "blue" | "green" | "amber" | "red" | "gray";
    /** Classe CSS aggiuntiva */
    className?: string;
}

// ============ COLORI ============

const colorSchemes = {
    green: {
        bg: "#f0fdf4",
        bgActive: "#f0fdf4",
        border: "#22c55e",
        borderInactive: "#cbd5e1",
        text: "#166534",
    },
    blue: {
        bg: "#eff6ff",
        bgActive: "#eff6ff",
        border: "#3b82f6",
        borderInactive: "#cbd5e1",
        text: "#1d4ed8",
    },
    purple: {
        bg: "#faf5ff",
        bgActive: "#faf5ff",
        border: "#8b5cf6",
        borderInactive: "#cbd5e1",
        text: "#6d28d9",
    },
    amber: {
        bg: "#fef3c7",
        bgActive: "#fef3c7",
        border: "#f59e0b",
        borderInactive: "#cbd5e1",
        text: "#b45309",
    },
    red: {
        bg: "#fef2f2",
        bgActive: "#fef2f2",
        border: "#ef4444",
        borderInactive: "#cbd5e1",
        text: "#991b1b",
    },
    teal: {
        bg: "#f0fdfa",
        bgActive: "#f0fdfa",
        border: "#14b8a6",
        borderInactive: "#cbd5e1",
        text: "#0f766e",
    },
};

// ============ COMPONENTI ============

/**
 * Card per uno step del procedimento
 */
export function StepCard({
                             stepNumber,
                             title,
                             color,
                             isActive,
                             children,
                             className = "",
                             fullWidth = false,
                         }: StepCardProps): React.ReactElement {
    const scheme = colorSchemes[color];

    return (
        <div
            className={className}
            style={{
                padding: 16,
                background: isActive ? scheme.bgActive : "#f8fafc",
                borderRadius: 8,
                borderLeft: `4px solid ${isActive ? scheme.border : scheme.borderInactive}`,
                opacity: isActive ? 1 : 0.5,
                gridColumn: fullWidth ? "1 / -1" : undefined,
            }}
        >
            <div style={{ fontWeight: 600, color: scheme.text, marginBottom: 6 }}>
                Step {stepNumber}: {title}
            </div>
            {isActive && children}
        </div>
    );
}

/**
 * Pulsanti di navigazione (Indietro, Avanti, Mostra tutto)
 */
export function NavigationButtons({
                                      currentStep,
                                      totalSteps,
                                      onNext,
                                      onPrev,
                                      onShowAll,
                                      className = "",
                                  }: NavigationButtonsProps): React.ReactElement {
    const isFirst = currentStep === 0;
    const isLast = currentStep === totalSteps - 1;

    return (
        <div
            className={className}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
            }}
        >
            <div style={{ fontWeight: 600, fontSize: 16 }}>Procedimento</div>
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: isFirst ? "#f1f5f9" : "#fff",
                        color: isFirst ? "#94a3b8" : "#334155",
                        cursor: isFirst ? "not-allowed" : "pointer",
                        fontSize: 13,
                    }}
                >
                    ← Indietro
                </button>

                <button
                    onClick={onNext}
                    disabled={isLast}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: isLast ? "#94a3b8" : "#3b82f6",
                        color: "#fff",
                        cursor: isLast ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    Avanti →
                </button>

                <button
                    onClick={onShowAll}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #22c55e",
                        background: "#dcfce7",
                        color: "#166534",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    Mostra tutto
                </button>
            </div>
        </div>
    );
}

/**
 * Card per il problema/esercizio da risolvere
 */
export function ProblemCard({
                                label,
                                children,
                                className = "",
                            }: ProblemCardProps): React.ReactElement {
    return (
        <div
            className={className}
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                {label}
            </div>
            <div style={{ fontSize: 24 }}>{children}</div>
        </div>
    );
}

/**
 * Contenitore principale per le demo
 */
export function DemoContainer({
                                  title,
                                  description,
                                  backLink = "#/",
                                  backText = "← Torna alla home",
                                  children,
                                  maxWidth = 950,
                              }: DemoContainerProps): React.ReactElement {
    return (
        <div
            style={{
                maxWidth,
                margin: "auto",
                padding: 16,
                fontFamily: "system-ui, sans-serif",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <a
                    href={backLink}
                    style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}
                >
                    {backText}
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24 }}>{title}</h1>
                {description && (
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                        {description}
                    </p>
                )}
            </div>

            {children}
        </div>
    );
}

/**
 * Pulsante per generare nuovo esercizio
 */
export function GenerateButton({
                                   text = "Nuova",
                                   emoji = "🎲",
                                   onClick,
                                   className = "",
                               }: GenerateButtonProps): React.ReactElement {
    return (
        <button
            onClick={onClick}
            className={className}
            style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
        >
            {emoji} {text}
        </button>
    );
}

/**
 * Box informativo (per spiegazioni, note, ecc.)
 */
export function InfoBox({
                            title,
                            children,
                            variant = "blue",
                            className = "",
                        }: InfoBoxProps): React.ReactElement {
    const colors = {
        blue: { bg: "#eff6ff", text: "#1e3a8a" },
        green: { bg: "#f0fdf4", text: "#166534" },
        amber: { bg: "#fef3c7", text: "#92400e" },
        red: { bg: "#fef2f2", text: "#991b1b" },
        gray: { bg: "#f8fafc", text: "#334155" },
    };

    const scheme = colors[variant];

    return (
        <div
            className={className}
            style={{
                marginTop: 20,
                background: scheme.bg,
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                color: scheme.text,
            }}
        >
            {title && <strong>{title}</strong>}
            {children}
        </div>
    );
}

/**
 * Contenitore per risultati/soluzioni
 */
export function ResultBox({
                              label,
                              children,
                              className = "",
                          }: {
    label?: string;
    children: React.ReactNode;
    className?: string;
}): React.ReactElement {
    return (
        <div className={className}>
            {label && (
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    {label}
                </div>
            )}
            <div
                style={{
                    fontSize: 18,
                    padding: "6px 10px",
                    background: "#fff7ed",
                    borderRadius: 6,
                    display: "inline-block",
                    color: "#9a3412",
                    border: "1px solid #fed7aa",
                }}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * Griglia per gli step (2 colonne)
 */
export function StepGrid({
                             children,
                             columns = 2,
                             gap = 12,
                             className = "",
                         }: {
    children: React.ReactNode;
    columns?: number;
    gap?: number;
    className?: string;
}): React.ReactElement {
    return (
        <div
            className={className}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap,
            }}
        >
            {children}
        </div>
    );
}

/**
 * Contenitore per il grafico
 */
export function GraphContainer({
                                   title,
                                   children,
                                   footer,
                                   className = "",
                               }: {
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}): React.ReactElement {
    return (
        <div
            className={className}
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
        >
            {title && (
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
                    {title}
                </div>
            )}
            {children}
            {footer && (
                <div
                    style={{
                        marginTop: 16,
                        fontSize: 14,
                        color: "#64748b",
                        textAlign: "center",
                    }}
                >
                    {footer}
                </div>
            )}
        </div>
    );
}

// ============ HOOK PERSONALIZZATO ============

/**
 * Hook per gestire la navigazione step-by-step
 */
export function useStepNavigation(totalSteps: number, initialStep: number = 0) {
    const [currentStep, setCurrentStep] = React.useState(initialStep);

    const nextStep = React.useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }, [totalSteps]);

    const prevStep = React.useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const showAll = React.useCallback(() => {
        setCurrentStep(totalSteps - 1);
    }, [totalSteps]);

    const reset = React.useCallback(() => {
        setCurrentStep(0);
    }, []);

    const goToStep = React.useCallback((step: number) => {
        setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
    }, [totalSteps]);

    return {
        currentStep,
        nextStep,
        prevStep,
        showAll,
        reset,
        goToStep,
        isFirst: currentStep === 0,
        isLast: currentStep === totalSteps - 1,
        isStepActive: (step: number) => currentStep >= step,
    };
}
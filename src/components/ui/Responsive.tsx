/**
 * Responsive Components - Componenti UI ottimizzati per mobile/tablet
 * @module components/ui/Responsive
 */

import React, { useEffect, useState } from "react";

// ============ BREAKPOINTS ============

export const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
} as const;

export type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

// ============ HOOK useBreakpoint ============

/**
 * Hook per rilevare il breakpoint corrente
 * @returns { breakpoint, isMobile, isTablet, isDesktop, width }
 */
export function useBreakpoint() {
    const [width, setWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const breakpoint: Breakpoint =
        width < BREAKPOINTS.mobile ? "mobile" :
            width < BREAKPOINTS.tablet ? "mobile" :
                width < BREAKPOINTS.desktop ? "tablet" : "desktop";

    return {
        breakpoint,
        width,
        isMobile: width < BREAKPOINTS.tablet,
        isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
        isDesktop: width >= BREAKPOINTS.desktop,
        isTouch: width < BREAKPOINTS.desktop,
    };
}

// ============ HOOK useResponsiveValue ============

/**
 * Hook per ottenere un valore basato sul breakpoint
 * @example const cols = useResponsiveValue({ mobile: 1, tablet: 2, desktop: 3 })
 */
export function useResponsiveValue<T>(values: {
    mobile: T;
    tablet?: T;
    desktop?: T;
}): T {
    const { breakpoint } = useBreakpoint();

    if (breakpoint === "mobile") return values.mobile;
    if (breakpoint === "tablet") return values.tablet ?? values.mobile;
    return values.desktop ?? values.tablet ?? values.mobile;
}

// ============ RESPONSIVE GRID ============

export interface ResponsiveGridProps {
    children: React.ReactNode;
    /** Colonne per breakpoint */
    columns?: { mobile?: number; tablet?: number; desktop?: number };
    /** Gap in pixel */
    gap?: number | { mobile?: number; tablet?: number; desktop?: number };
    /** Classe CSS */
    className?: string;
    /** Stile aggiuntivo */
    style?: React.CSSProperties;
}

/**
 * Griglia responsive che adatta le colonne al breakpoint
 */
export function ResponsiveGrid({
                                   children,
                                   columns = { mobile: 1, tablet: 2, desktop: 3 },
                                   gap = 12,
                                   className = "",
                                   style = {},
                               }: ResponsiveGridProps): React.ReactElement {
    const { isMobile, isTablet } = useBreakpoint();

    const cols = isMobile
        ? (columns.mobile ?? 1)
        : isTablet
            ? (columns.tablet ?? columns.mobile ?? 2)
            : (columns.desktop ?? columns.tablet ?? 3);

    const gapValue = typeof gap === "number"
        ? gap
        : isMobile
            ? (gap.mobile ?? 8)
            : isTablet
                ? (gap.tablet ?? 12)
                : (gap.desktop ?? 16);

    return (
        <div
            className={className}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: gapValue,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ============ RESPONSIVE STACK ============

export interface ResponsiveStackProps {
    children: React.ReactNode;
    /** Direzione per breakpoint */
    direction?: { mobile?: "column" | "row"; tablet?: "column" | "row"; desktop?: "column" | "row" };
    /** Gap in pixel */
    gap?: number;
    /** Allineamento */
    align?: "start" | "center" | "end" | "stretch";
    /** Giustificazione */
    justify?: "start" | "center" | "end" | "between" | "around";
    /** Classe CSS */
    className?: string;
    /** Stile aggiuntivo */
    style?: React.CSSProperties;
}

/**
 * Stack che cambia direzione in base al breakpoint
 */
export function ResponsiveStack({
                                    children,
                                    direction = { mobile: "column", tablet: "row", desktop: "row" },
                                    gap = 12,
                                    align = "stretch",
                                    justify = "start",
                                    className = "",
                                    style = {},
                                }: ResponsiveStackProps): React.ReactElement {
    const { isMobile, isTablet } = useBreakpoint();

    const dir = isMobile
        ? (direction.mobile ?? "column")
        : isTablet
            ? (direction.tablet ?? "row")
            : (direction.desktop ?? "row");

    const justifyMap = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        between: "space-between",
        around: "space-around",
    };

    const alignMap = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        stretch: "stretch",
    };

    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: dir,
                gap,
                alignItems: alignMap[align],
                justifyContent: justifyMap[justify],
                flexWrap: "wrap",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ============ RESPONSIVE CARD ============

export interface ResponsiveCardProps {
    children: React.ReactNode;
    /** Padding responsive */
    padding?: { mobile?: number; tablet?: number; desktop?: number } | number;
    /** Classe CSS */
    className?: string;
    /** Stile aggiuntivo */
    style?: React.CSSProperties;
}

/**
 * Card con padding responsive
 */
export function ResponsiveCard({
                                   children,
                                   padding = { mobile: 12, tablet: 16, desktop: 20 },
                                   className = "",
                                   style = {},
                               }: ResponsiveCardProps): React.ReactElement {
    const { isMobile, isTablet } = useBreakpoint();

    const pad = typeof padding === "number"
        ? padding
        : isMobile
            ? (padding.mobile ?? 12)
            : isTablet
                ? (padding.tablet ?? 16)
                : (padding.desktop ?? 20);

    return (
        <div
            className={className}
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: pad,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ============ RESPONSIVE SVG CONTAINER ============

export interface ResponsiveSvgProps {
    children: React.ReactNode;
    /** ViewBox width */
    width: number;
    /** ViewBox height */
    height: number;
    /** Altezza massima */
    maxHeight?: { mobile?: string; tablet?: string; desktop?: string } | string;
    /** Classe CSS */
    className?: string;
    /** Stile aggiuntivo */
    style?: React.CSSProperties;
    /** Props passati al SVG */
    svgProps?: React.SVGProps<SVGSVGElement>;
}

/**
 * Contenitore SVG responsive con viewBox
 */
export function ResponsiveSvg({
                                  children,
                                  width,
                                  height,
                                  maxHeight = { mobile: "50vh", tablet: "55vh", desktop: "60vh" },
                                  className = "",
                                  style = {},
                                  svgProps = {},
                              }: ResponsiveSvgProps): React.ReactElement {
    const { isMobile, isTablet } = useBreakpoint();

    const mh = typeof maxHeight === "string"
        ? maxHeight
        : isMobile
            ? (maxHeight.mobile ?? "50vh")
            : isTablet
                ? (maxHeight.tablet ?? "55vh")
                : (maxHeight.desktop ?? "60vh");

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={{
                width: "100%",
                height: "auto",
                maxHeight: mh,
                ...style,
            }}
            {...svgProps}
        >
            {children}
        </svg>
    );
}

// ============ RESPONSIVE BUTTON GROUP ============

export interface ResponsiveButtonGroupProps {
    children: React.ReactNode;
    /** Stack verticale su mobile */
    stackOnMobile?: boolean;
    /** Gap */
    gap?: number;
    /** Classe CSS */
    className?: string;
}

/**
 * Gruppo di pulsanti che si impila su mobile
 */
export function ResponsiveButtonGroup({
                                          children,
                                          stackOnMobile = true,
                                          gap = 8,
                                          className = "",
                                      }: ResponsiveButtonGroupProps): React.ReactElement {
    const { isMobile } = useBreakpoint();

    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: stackOnMobile && isMobile ? "column" : "row",
                gap,
                flexWrap: "wrap",
            }}
        >
            {children}
        </div>
    );
}

// ============ TOUCH-FRIENDLY BUTTON ============

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variante */
    variant?: "primary" | "secondary" | "outline" | "ghost";
    /** Dimensione */
    size?: "sm" | "md" | "lg";
    /** Icona a sinistra */
    icon?: React.ReactNode;
    /** Full width */
    fullWidth?: boolean;
}

/**
 * Pulsante ottimizzato per touch con area minima 44x44px
 */
export function TouchButton({
                                children,
                                variant = "primary",
                                size = "md",
                                icon,
                                fullWidth = false,
                                disabled = false,
                                style = {},
                                ...props
                            }: TouchButtonProps): React.ReactElement {
    const { isMobile } = useBreakpoint();

    const sizes = {
        sm: { padding: "8px 12px", fontSize: 13, minHeight: 36 },
        md: { padding: isMobile ? "12px 16px" : "10px 16px", fontSize: 14, minHeight: isMobile ? 48 : 40 },
        lg: { padding: "14px 24px", fontSize: 16, minHeight: 52 },
    };

    const variants = {
        primary: {
            background: disabled ? "#94a3b8" : "#3b82f6",
            color: "#fff",
            border: "none",
        },
        secondary: {
            background: disabled ? "#f1f5f9" : "#f8fafc",
            color: disabled ? "#94a3b8" : "#334155",
            border: "1px solid #d1d5db",
        },
        outline: {
            background: "transparent",
            color: disabled ? "#94a3b8" : "#3b82f6",
            border: `1px solid ${disabled ? "#d1d5db" : "#3b82f6"}`,
        },
        ghost: {
            background: "transparent",
            color: disabled ? "#94a3b8" : "#3b82f6",
            border: "none",
        },
    };

    const sizeStyle = sizes[size];
    const variantStyle = variants[variant];

    return (
        <button
            disabled={disabled}
            style={{
                ...sizeStyle,
                ...variantStyle,
                borderRadius: 8,
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: fullWidth ? "100%" : "auto",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                transition: "all 0.15s ease",
                ...style,
            }}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}

// ============ RESPONSIVE INPUT ============

export interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Label */
    label?: string;
    /** Helper text */
    helper?: string;
    /** Full width */
    fullWidth?: boolean;
}

/**
 * Input ottimizzato per touch con font-size >= 16px (evita zoom su iOS)
 */
export function ResponsiveInput({
                                    label,
                                    helper,
                                    fullWidth = false,
                                    style = {},
                                    ...props
                                }: ResponsiveInputProps): React.ReactElement {
    const { isMobile } = useBreakpoint();

    return (
        <div style={{ width: fullWidth ? "100%" : "auto" }}>
            {label && (
                <label style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    width: fullWidth ? "100%" : "auto",
                    padding: isMobile ? "12px 14px" : "10px 12px",
                    fontSize: 16, // >= 16px evita zoom su iOS
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    outline: "none",
                    minHeight: isMobile ? 48 : 40,
                    boxSizing: "border-box",
                    ...style,
                }}
                {...props}
            />
            {helper && (
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {helper}
                </div>
            )}
        </div>
    );
}

// ============ RESPONSIVE SLIDER ============

export interface ResponsiveSliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label?: string;
    showValue?: boolean;
    formatValue?: (value: number) => string;
    className?: string;
}

/**
 * Slider ottimizzato per touch con area più grande
 */
export function ResponsiveSlider({
                                     value,
                                     onChange,
                                     min,
                                     max,
                                     step = 1,
                                     label,
                                     showValue = true,
                                     formatValue = (v) => v.toString(),
                                     className = "",
                                 }: ResponsiveSliderProps): React.ReactElement {
    const { isMobile } = useBreakpoint();

    return (
        <div className={className}>
            {(label || showValue) && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8
                }}>
                    {label && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>}
                    {showValue && (
                        <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#3b82f6",
                            background: "#eff6ff",
                            padding: "2px 8px",
                            borderRadius: 4
                        }}>
                            {formatValue(value)}
                        </span>
                    )}
                </div>
            )}
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
                style={{
                    width: "100%",
                    height: isMobile ? 44 : 32,
                    cursor: "pointer",
                    accentColor: "#3b82f6",
                }}
            />
        </div>
    );
}

// ============ COLLAPSIBLE PANEL ============

export interface CollapsiblePanelProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    /** Aperto di default solo su desktop */
    openOnDesktop?: boolean;
    className?: string;
}

/**
 * Pannello collassabile, utile per nascondere controlli secondari su mobile
 */
export function CollapsiblePanel({
                                     title,
                                     children,
                                     defaultOpen = true,
                                     openOnDesktop = true,
                                     className = "",
                                 }: CollapsiblePanelProps): React.ReactElement {
    const { isDesktop } = useBreakpoint();
    const [isOpen, setIsOpen] = useState(defaultOpen || (openOnDesktop && isDesktop));

    // Aggiorna quando cambia breakpoint
    useEffect(() => {
        if (openOnDesktop && isDesktop) setIsOpen(true);
    }, [isDesktop, openOnDesktop]);

    return (
        <div
            className={className}
            style={{
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "100%",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#f8fafc",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#334155",
                }}
            >
                {title}
                <span style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                }}>
                    ▼
                </span>
            </button>
            {isOpen && (
                <div style={{ padding: 16 }}>
                    {children}
                </div>
            )}
        </div>
    );
}

// ============ SWIPEABLE TABS (per mobile) ============

export interface SwipeableTabsProps {
    tabs: { id: string; label: string; content: React.ReactNode }[];
    defaultTab?: string;
    className?: string;
}

/**
 * Tabs con supporto swipe per mobile
 */
export function SwipeableTabs({
                                  tabs,
                                  defaultTab,
                                  className = "",
                              }: SwipeableTabsProps): React.ReactElement {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const { isMobile } = useBreakpoint();

    const activeContent = tabs.find(t => t.id === activeTab)?.content;

    return (
        <div className={className}>
            {/* Tab headers */}
            <div style={{
                display: "flex",
                gap: 4,
                background: "#f1f5f9",
                padding: 4,
                borderRadius: 10,
                marginBottom: 12,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: isMobile ? "1 0 auto" : 1,
                            padding: isMobile ? "12px 16px" : "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: activeTab === tab.id ? "#fff" : "transparent",
                            color: activeTab === tab.id ? "#3b82f6" : "#64748b",
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            fontSize: 14,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                            transition: "all 0.15s ease",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div>
                {activeContent}
            </div>
        </div>
    );
}

// ============ UTILITY: Responsive Style Helper ============

/**
 * Helper per creare stili responsive inline
 * @example style={responsive({ padding: { mobile: 8, desktop: 16 } }, breakpoint)}
 */
export function responsive<T extends Record<string, unknown>>(
    styles: { [K in keyof T]: T[K] | { mobile?: T[K]; tablet?: T[K]; desktop?: T[K] } },
    breakpoint: Breakpoint
): T {
    const result: Record<string, unknown> = {};

    for (const key in styles) {
        const value = styles[key];
        if (value && typeof value === "object" && ("mobile" in value || "tablet" in value || "desktop" in value)) {
            const responsiveValue = value as { mobile?: unknown; tablet?: unknown; desktop?: unknown };
            if (breakpoint === "mobile") {
                result[key] = responsiveValue.mobile;
            } else if (breakpoint === "tablet") {
                result[key] = responsiveValue.tablet ?? responsiveValue.mobile;
            } else {
                result[key] = responsiveValue.desktop ?? responsiveValue.tablet ?? responsiveValue.mobile;
            }
        } else {
            result[key] = value;
        }
    }

    return result as T;
}
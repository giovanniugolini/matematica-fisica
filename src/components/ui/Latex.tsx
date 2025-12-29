/**
 * Latex Component - Componente React per rendering LaTeX con KaTeX
 * @module components/ui/Latex
 */

import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export interface LatexProps {
    /** Stringa LaTeX da renderizzare */
    children: string;
    /** Se true, usa display mode (centrato, più grande) */
    display?: boolean;
    /** Classe CSS aggiuntiva */
    className?: string;
    /** Stile inline aggiuntivo */
    style?: React.CSSProperties;
}

/**
 * Componente per renderizzare espressioni LaTeX
 *
 * @example
 * ```tsx
 * <Latex>{"x^2 + 2x + 1 = 0"}</Latex>
 * <Latex display>{"\\frac{-b \\pm \\sqrt{\\Delta}}{2a}"}</Latex>
 * ```
 */
export function Latex({
                          children,
                          display = false,
                          className = "",
                          style
                      }: LatexProps): React.ReactElement {
    const html = useMemo(() => {
        try {
            return katex.renderToString(children, {
                throwOnError: false,
                displayMode: display,
            });
        } catch {
            return children;
        }
    }, [children, display]);

    return (
        <span
            dangerouslySetInnerHTML={{ __html: html }}
            className={className}
            style={style}
        />
    );
}

/**
 * Componente per LaTeX inline (alias di Latex con display=false)
 */
export function InlineMath({ children, className, style }: Omit<LatexProps, 'display'>): React.ReactElement {
    return <Latex display={false} className={className} style={style}>{children}</Latex>;
}

/**
 * Componente per LaTeX display (alias di Latex con display=true)
 */
export function DisplayMath({ children, className, style }: Omit<LatexProps, 'display'>): React.ReactElement {
    return <Latex display={true} className={className} style={style}>{children}</Latex>;
}

export default Latex;
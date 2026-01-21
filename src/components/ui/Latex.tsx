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
 * Renderizza una stringa LaTeX pura (senza delimitatori $)
 */
function renderLatex(latex: string, displayMode: boolean): string {
    try {
        return katex.renderToString(latex, {
            throwOnError: false,
            displayMode,
        });
    } catch {
        return latex;
    }
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
        return renderLatex(children, display);
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
 * Componente per renderizzare testo misto con LaTeX inline
 * Supporta delimitatori $...$ per LaTeX inline
 *
 * @example
 * ```tsx
 * <MixedLatex>{"Risolvi l'equazione $x^2 + 2x + 1 = 0$"}</MixedLatex>
 * ```
 */
export function MixedLatex({
                               children,
                               className = "",
                               style
                           }: Omit<LatexProps, 'display'>): React.ReactElement {
    const html = useMemo(() => {
        // Regex per trovare $...$ (non escaped)
        const parts = children.split(/(\$[^$]+\$)/g);

        return parts.map((part) => {
            if (part.startsWith('$') && part.endsWith('$')) {
                // È una parte LaTeX - rimuovi i delimitatori e renderizza
                const latex = part.slice(1, -1);
                return renderLatex(latex, false);
            }
            // È testo normale - escape HTML
            return part
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }).join('');
    }, [children]);

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
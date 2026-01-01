// components/ui/CollapsibleExplanation.tsx
import React, { useState } from "react";

export interface CollapsibleExplanationProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function CollapsibleExplanation({
                                           title,
                                           children,
                                           defaultOpen = false,
                                       }: CollapsibleExplanationProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{ marginBottom: 12 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 500,
                    marginBottom: isOpen ? 8 : 0,
                    padding: 0,
                }}
            >
                {isOpen ? "👇 Nascondi spiegazione" : "👉 Mostra spiegazione"}
                <span style={{ marginLeft: 6 }}>{title}</span>
            </button>
            {isOpen && (
                <div
                    style={{
                        fontSize: 13,
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

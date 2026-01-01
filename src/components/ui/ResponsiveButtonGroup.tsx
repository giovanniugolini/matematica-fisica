// components/ui/ResponsiveButtonGroup.tsx
import React from "react";

export interface ResponsiveButtonGroupProps {
    options: { label: string; value: string }[];
    selectedValue: string;
    onChange: (value: string) => void;
}

export function ResponsiveButtonGroup({ options, selectedValue, onChange }: ResponsiveButtonGroupProps) {
    return (
        <div style={{ display: "flex", gap: 8 }}>
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    style={{
                        padding: "6px 12px",
                        background: selectedValue === option.value ? "#3b82f6" : "#f1f5f9",
                        color: selectedValue === option.value ? "white" : "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        cursor: "pointer",
                    }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

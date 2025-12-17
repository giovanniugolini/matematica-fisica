import React from "react";

export function Title({ children }: { children: React.ReactNode }) {
    return <h2 style={{ marginTop: 0 }}>{children}</h2>;
}

export function Paragraph({ children }: { children: React.ReactNode }) {
    return <p style={{ lineHeight: 1.6 }}>{children}</p>;
}

export function Definition({
                               title,
                               children,
                           }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                background: "#f8fafc",
                borderLeft: "6px solid #2563eb",
                padding: "14px",
                borderRadius: 12,
                margin: "14px 0",
            }}
        >
            <strong>{title}</strong>
            <div style={{ marginTop: 6 }}>{children}</div>
        </div>
    );
}

export function Figure({
                           src,
                           caption,
                       }: {
    src: string;
    caption: string;
}) {
    return (
        <figure style={{ margin: "16px 0", textAlign: "center" }}>
            <img
                src={src}
                alt={caption}
                style={{ maxWidth: "100%", borderRadius: 12 }}
            />
            <figcaption style={{ fontSize: 14, opacity: 0.7 }}>
                {caption}
            </figcaption>
        </figure>
    );
}

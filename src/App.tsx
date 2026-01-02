import React, { Suspense, useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { demos } from "./demos";
import { lessons } from "./lessons";
import "katex/dist/katex.min.css";

// ============ STRUTTURA CATEGORIE ============

interface Category {
    id: string;
    name: string;
    icon: string;
    subcategories: Subcategory[];
}

interface Subcategory {
    id: string;
    name: string;
    slugs: string[]; // slug delle demo in questa sottocategoria
}

interface LessonCategory {
    id: string;
    name: string;
    icon: string;
    argomenti: LessonArgomento[];
}

interface LessonArgomento {
    id: string;
    name: string;
    slugs: string[]; // slug delle lezioni in questo argomento
}

const categories: Category[] = [
    {
        id: "matematica",
        name: "Matematica",
        icon: "📐",
        subcategories: [
            {
                id: "algebra",
                name: "Algebra",
                slugs: [
                    "scomposizione-polinomi",
                    "equazioni-secondo-grado",
                    "equazioni-frazionarie",
                    "disequazioni-secondo-grado",
                    "sistemi-disequazioni",
                    "disequazioni-soluzioni",
                ],
            },
            {
                id: "analisi",
                name: "Analisi",
                slugs: [
                    "intervalli-r",
                    "domini-funzioni",
                    "limite-finito-finito",
                    "limite-infinito-finito",
                    "limite-finito-infinito",
                    "limite-infinito-infinito",
                ],
            },
            {
                id: "probabilita",
                name: "Probabilità",
                slugs: ["probabilita-urna-albero"],
            },
            {
                id: "goniometria",
                name: "Goniometria",
                slugs: ["angolo-rotazione", "archi-associati"],
            },
        ],
    },
    {
        id: "fisica",
        name: "Fisica",
        icon: "⚛️",
        subcategories: [
            {
                id: "fisica-geometria",
                name: "Geometria",
                slugs: [
                    "vettori-punta-coda",
                    "vettore-per-escalare",
                    "componenti-cartesiane-vettore",
                ],
            },
            {
                id: "cinematica",
                name: "Cinematica",
                slugs: ["velocita-media-secante", "moto-uniformemente-accelerato", "caduta-libera"],
            },
            {
                id: "elettromagnetismo",
                name: "Elettromagnetismo",
                slugs: ["campo-elettrico", "legge-di-coulomb", "condensatore"],
            },
            {
                id: "strumenti",
                name: "Strumenti di misura",
                slugs: ["misure", "conversione-unita"],
            },
        ],
    },
    {
        id: "altro",
        name: "Altro",
        icon: "📚",
        subcategories: [
            {
                id: "apprendimento",
                name: "Apprendimento",
                slugs: ["ebbinghaus-curva-oblio"],
            },
        ],
    },
];

// Categorie per le lezioni
const lessonCategories: LessonCategory[] = [
    {
        id: "lezioni-fisica",
        name: "Fisica",
        icon: "⚛️",
        argomenti: [
            {
                id: "lezioni-vettori",
                name: "Vettori",
                slugs: ["lezione-componenti-vettore"],
            },
        ],
    },
];

// Mappa slug -> demo per lookup veloce
const demoBySlug = new Map(demos.map((d) => [d.slug, d]));
const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));

// ============ COMPONENTI ============

function CategoryCard({
                          category,
                          expanded,
                          onToggle,
                      }: {
    category: Category;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
                marginBottom: 16,
            }}
        >
            {/* Header categoria */}
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    padding: "16px 20px",
                    background: expanded ? "#f8fafc" : "#fff",
                    border: "none",
                    borderBottom: expanded ? "1px solid #e2e8f0" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1e293b",
                    transition: "background 0.2s",
                }}
            >
        <span>
          <span style={{ marginRight: 12 }}>{category.icon}</span>
            {category.name}
        </span>
                <span
                    style={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        fontSize: 14,
                        color: "#64748b",
                    }}
                >
          ▼
        </span>
            </button>

            {/* Sottocategorie */}
            {expanded && (
                <div style={{ padding: "12px 20px 20px" }}>
                    {category.subcategories.map((sub) => (
                        <div key={sub.id} style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "#64748b",
                                    marginBottom: 8,
                                    paddingLeft: 4,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                {sub.name}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {sub.slugs.map((slug) => {
                                    const demo = demoBySlug.get(slug);
                                    if (!demo) return null;
                                    return (
                                        <Link
                                            key={slug}
                                            to={`/${slug}`}
                                            style={{
                                                display: "block",
                                                padding: "10px 14px",
                                                background: "#f8fafc",
                                                borderRadius: 8,
                                                color: "#334155",
                                                textDecoration: "none",
                                                fontSize: 14,
                                                transition: "all 0.15s",
                                                borderLeft: "3px solid transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#e0f2fe";
                                                e.currentTarget.style.borderLeftColor = "#3b82f6";
                                                e.currentTarget.style.color = "#1e40af";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#f8fafc";
                                                e.currentTarget.style.borderLeftColor = "transparent";
                                                e.currentTarget.style.color = "#334155";
                                            }}
                                        >
                                            {demo.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function LessonCategoryCard({
                                category,
                                expanded,
                                onToggle,
                            }: {
    category: LessonCategory;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
                marginBottom: 16,
                border: "2px solid #c4b5fd",
            }}
        >
            {/* Header categoria */}
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: expanded ? "#f5f3ff" : "#faf5ff",
                    border: "none",
                    borderBottom: expanded ? "1px solid #ddd6fe" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#5b21b6",
                    transition: "background 0.2s",
                }}
            >
        <span>
          <span style={{ marginRight: 10 }}>{category.icon}</span>
            {category.name}
        </span>
                <span
                    style={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        fontSize: 12,
                        color: "#7c3aed",
                    }}
                >
          ▼
        </span>
            </button>

            {/* Argomenti */}
            {expanded && (
                <div style={{ padding: "10px 14px 14px" }}>
                    {category.argomenti.map((arg) => (
                        <div key={arg.id} style={{ marginBottom: 14 }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#7c3aed",
                                    marginBottom: 8,
                                    paddingLeft: 2,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                {arg.name}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {arg.slugs.map((slug) => {
                                    const lesson = lessonBySlug.get(slug);
                                    if (!lesson) return null;
                                    return (
                                        <Link
                                            key={slug}
                                            to={`/${slug}`}
                                            style={{
                                                display: "block",
                                                padding: "10px 12px",
                                                background: "#f5f3ff",
                                                borderRadius: 10,
                                                color: "#5b21b6",
                                                textDecoration: "none",
                                                fontSize: 13,
                                                transition: "all 0.15s",
                                                borderLeft: "3px solid transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#ede9fe";
                                                e.currentTarget.style.borderLeftColor = "#8b5cf6";
                                                e.currentTarget.style.color = "#5b21b6";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#f5f3ff";
                                                e.currentTarget.style.borderLeftColor = "transparent";
                                                e.currentTarget.style.color = "#5b21b6";
                                            }}
                                        >
                                            <span style={{ marginRight: 8 }}>📖</span>
                                            {lesson.title}
                                            {lesson.durata && (
                                                <span
                                                    style={{
                                                        marginLeft: 8,
                                                        fontSize: 11,
                                                        color: "#a78bfa",
                                                    }}
                                                >
                          ({lesson.durata} min)
                        </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Home() {
    // Tutte le categorie espanse di default
    const [expanded, setExpanded] = useState<Record<string, boolean>>(
        Object.fromEntries([
            ...categories.map((c) => [c.id, true]),
            ...lessonCategories.map((c) => [c.id, true]),
        ])
    );

    const toggleCategory = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalDemos = demos.length;
    const totalLessons = lessons.length;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
                padding: "24px 16px",
            }}
        >
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: 8,
                            lineHeight: 1.3,
                        }}
                    >
                        📚 Matematica & Fisica
                    </h1>
                    <p
                        style={{
                            fontSize: 16,
                            color: "#64748b",
                            marginBottom: 16,
                        }}
                    >
                        Demo interattive e lezioni per la didattica
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                padding: "6px 16px",
                                background: "#dbeafe",
                                borderRadius: 20,
                                fontSize: 13,
                                color: "#1e40af",
                                fontWeight: 500,
                            }}
                        >
                            🎮 {totalDemos} demo
                        </div>
                        <div
                            style={{
                                padding: "6px 16px",
                                background: "#ede9fe",
                                borderRadius: 20,
                                fontSize: 13,
                                color: "#5b21b6",
                                fontWeight: 500,
                            }}
                        >
                            📖 {totalLessons} {totalLessons === 1 ? "lezione" : "lezioni"}
                        </div>
                    </div>
                </div>

                {/* Pulsanti espandi/comprimi */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        marginBottom: 20,
                    }}
                >
                    <button
                        onClick={() =>
                            setExpanded(
                                Object.fromEntries([
                                    ...categories.map((c) => [c.id, true]),
                                    ...lessonCategories.map((c) => [c.id, true]),
                                ])
                            )
                        }
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#475569",
                        }}
                    >
                        Espandi tutto
                    </button>
                    <button
                        onClick={() =>
                            setExpanded(
                                Object.fromEntries([
                                    ...categories.map((c) => [c.id, false]),
                                    ...lessonCategories.map((c) => [c.id, false]),
                                ])
                            )
                        }
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#475569",
                        }}
                    >
                        Comprimi tutto
                    </button>
                </div>

                {/* Sezione Demo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                        marginTop: 16,
                    }}
                >
                    <h2
                        style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#1e40af",
                            margin: 0,
                        }}
                    >
                        🎮 Demo Interattive
                    </h2>
                    <div
                        style={{
                            flex: 1,
                            height: 2,
                            background: "linear-gradient(to right, #93c5fd, transparent)",
                        }}
                    />
                </div>

                {/* Categorie Demo */}
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        expanded={expanded[category.id]}
                        onToggle={() => toggleCategory(category.id)}
                    />
                ))}

                {/* Footer */}
                <div
                    style={{
                        textAlign: "center",
                        marginTop: 32,
                        padding: "16px",
                        color: "#94a3b8",
                        fontSize: 13,
                    }}
                >
                    Made with ❤️ per la didattica
                </div>
            </div>

            {/* ===== LEZIONI INTERATTIVE (BETA) - FLOATING BOTTOM RIGHT ===== */}
            {lessons.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        width: 340,
                        maxWidth: "90vw",
                        maxHeight: "70vh",
                        overflowY: "auto",
                        background: "#faf5ff",
                        border: "2px solid #c4b5fd",
                        borderRadius: 16,
                        boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
                        zIndex: 1000,
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #ddd6fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#f5f3ff",
                            borderTopLeftRadius: 14,
                            borderTopRightRadius: 14,
                        }}
                    >
                        <div style={{ fontWeight: 700, color: "#5b21b6", fontSize: 14 }}>
                            📖 Lezioni interattive
                        </div>
                        <span
                            style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "#ede9fe",
                                color: "#6d28d9",
                                fontWeight: 800,
                                letterSpacing: "0.3px",
                            }}
                        >
              BETA
            </span>
                    </div>

                    {/* Contenuto */}
                    <div style={{ padding: "12px 12px 4px" }}>
                        {lessonCategories.map((category) => (
                            <LessonCategoryCard
                                key={category.id}
                                category={category}
                                expanded={!!expanded[category.id]}
                                onToggle={() => toggleCategory(category.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ APP ============

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Route per le demo */}
                {demos.map(({ slug, Component }) => (
                    <Route
                        key={slug}
                        path={`/${slug}`}
                        element={
                            <Suspense
                                fallback={
                                    <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                                        Caricamento…
                                    </div>
                                }
                            >
                                <Component />
                            </Suspense>
                        }
                    />
                ))}

                {/* Route per le lezioni */}
                {lessons.map(({ slug, Component }) => (
                    <Route
                        key={slug}
                        path={`/${slug}`}
                        element={
                            <Suspense
                                fallback={
                                    <div style={{ padding: 32, textAlign: "center", color: "#7c3aed" }}>
                                        📖 Caricamento lezione…
                                    </div>
                                }
                            >
                                <Component />
                            </Suspense>
                        }
                    />
                ))}

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <div style={{ padding: 32, textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                            <h2 style={{ color: "#1e293b", marginBottom: 8 }}>404 – Pagina non trovata</h2>
                            <p style={{ color: "#64748b", marginBottom: 16 }}>La pagina che cerchi non esiste.</p>
                            <Link
                                to="/"
                                style={{
                                    color: "#3b82f6",
                                    textDecoration: "none",
                                    fontWeight: 500,
                                }}
                            >
                                ← Torna alla home
                            </Link>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
}

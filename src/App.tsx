import React, { Suspense, useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { demos } from "./demos";
import { tests } from "./tests";
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
                    "segno-di-un-prodotto"

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
                slugs: [
                    "probabilita-urna-albero",
                ],
            },

            {
                id: "goniometria",
                name: "Goniometria",
                slugs: [
                    "angolo-rotazione",
                    "archi-associati",
                ],
            },
            {
                id: "trigonometria",
                name: "Trigonometria",
                slugs: [
                    "risoluzione-di-un-triangolo-rettangolo",
                ],
            },
        ],
    },
    {
        id: "fisica",
        name: "Fisica",
        icon: "⚛️",
        subcategories: [
            {
                id:"fisica-vettori-forze",
                name:"Vettori e Forze",
                slugs: [
                    "vettori-punta-coda",
                    "vettore-per-escalare",
                    "componenti-cartesiane-vettore"
                ]
            },
            {
                id: "cinematica",
                name: "Cinematica",
                slugs: [
                    "velocita-media-secante",
                    "moto-uniformemente-accelerato",
                    "caduta-libera",
                ],
            },
            {
                id: "elettromagnetismo",
                name: "Elettromagnetismo",
                slugs: [
                    "campo-elettrico",
                    "legge-di-coulomb",
                    "condensatore",
                ],
            },
            {
                id: "strumenti",
                name: "Strumenti di misura",
                slugs: [
                    "misure",
                    "conversione-unita",
                ],
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
                slugs: [
                    "ebbinghaus-curva-oblio",
                ],
            },
        ],
    },
    {
        id: "verifiche",
        name: "Verifiche & Quiz",
        icon: "📝",
        subcategories: [
            {
                id: "quiz-algebra",
                name: "Algebra",
                slugs: [
                    "quiz-algebra",
                    "verifica-algebra-1",
                ],
            },
            {
                id: "quiz-fisica",
                name: "Fisica",
                slugs: [
                    "quiz-vettori",
                ],
            },
        ],
    },
];

// Mappa slug -> demo per lookup veloce
const demoBySlug = new Map(demos.map((d) => [d.slug, d]));

// Demo nuove (mostrano tag NEW)
const newDemoSlugs = new Set([
    "segno-di-un-prodotto",
    "quiz-algebra",
    "verifica-algebra-1",
    "quiz-vettori",
    "risoluzione-di-un-triangolo-rettangolo"
]);

// ============ COMPONENTI ============

function CategoryCard({ category, expanded, onToggle }: {
    category: Category;
    expanded: boolean;
    onToggle: () => void;
}) {
    // Stile speciale per la categoria Verifiche & Quiz
    const isVerifiche = category.id === "verifiche";

    return (
        <div style={{
            background: isVerifiche ? "#fffbeb" : "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            overflow: "hidden",
            marginBottom: 16,
            border: isVerifiche ? "2px solid #fcd34d" : "none",
        }}>
            {/* Header categoria */}
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    padding: "16px 20px",
                    background: isVerifiche
                        ? (expanded ? "#fef3c7" : "#fffbeb")
                        : (expanded ? "#f8fafc" : "#fff"),
                    border: "none",
                    borderBottom: expanded ? `1px solid ${isVerifiche ? "#fcd34d" : "#e2e8f0"}` : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 18,
                    fontWeight: 600,
                    color: isVerifiche ? "#92400e" : "#1e293b",
                    transition: "background 0.2s",
                }}
            >
                <span>
                    <span style={{ marginRight: 12 }}>{category.icon}</span>
                    {category.name}
                </span>
                <span style={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    fontSize: 14,
                    color: "#64748b"
                }}>
                    ▼
                </span>
            </button>

            {/* Sottocategorie */}
            {expanded && (
                <div style={{ padding: "12px 20px 20px" }}>
                    {category.subcategories.map((sub) => (
                        <div key={sub.id} style={{ marginBottom: 16 }}>
                            <div style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#64748b",
                                marginBottom: 8,
                                paddingLeft: 4,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}>
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
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
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
                                            {newDemoSlugs.has(slug) && (
                                                <span style={{
                                                    background: "#f59e0b",
                                                    color: "#fff",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    padding: "2px 6px",
                                                    borderRadius: 4,
                                                    textTransform: "uppercase",
                                                }}>
                                                    New
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
        Object.fromEntries(categories.map((c) => [c.id, true]))
    );

    const toggleCategory = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalDemos = demos.length;
    const totalTests = tests.length;

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
            padding: "24px 16px",
        }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 8,
                        lineHeight: 1.3,
                    }}>
                        📚 Matematica & Fisica
                    </h1>
                    <p style={{
                        fontSize: 16,
                        color: "#64748b",
                        marginBottom: 16,
                    }}>
                        Demo interattive per le lezioni di Giovanni Ugolini
                    </p>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 12,
                        flexWrap: "wrap",
                    }}>
                        <div style={{
                            padding: "6px 16px",
                            background: "#dbeafe",
                            borderRadius: 20,
                            fontSize: 13,
                            color: "#1e40af",
                            fontWeight: 500,
                        }}>
                            {totalDemos} demo disponibili
                        </div>
                        <div style={{
                            padding: "6px 16px",
                            background: "#fef3c7",
                            borderRadius: 20,
                            fontSize: 13,
                            color: "#92400e",
                            fontWeight: 500,
                        }}>
                            {totalTests} verifiche & quiz
                        </div>
                    </div>
                </div>

                {/* Pulsanti espandi/comprimi */}
                <div style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginBottom: 20,
                }}>
                    <button
                        onClick={() => setExpanded(Object.fromEntries(categories.map((c) => [c.id, true])))}
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
                        onClick={() => setExpanded(Object.fromEntries(categories.map((c) => [c.id, false])))}
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

                {/* Categorie */}
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        expanded={expanded[category.id]}
                        onToggle={() => toggleCategory(category.id)}
                    />
                ))}

                {/* Footer */}
                <div style={{
                    textAlign: "center",
                    marginTop: 32,
                    padding: "16px",
                    color: "#94a3b8",
                    fontSize: 13,
                }}>
                    Made with ❤️ per la didattica
                </div>
            </div>
        </div>
    );
}

// ============ APP ============

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                {demos.map(({ slug, Component }) => (
                    <Route
                        key={slug}
                        path={`/${slug}`}
                        element={
                            <Suspense fallback={
                                <div style={{
                                    padding: 32,
                                    textAlign: "center",
                                    color: "#64748b"
                                }}>
                                    Caricamento…
                                </div>
                            }>
                                <Component />
                            </Suspense>
                        }
                    />
                ))}
                <Route
                    path="*"
                    element={
                        <div style={{
                            padding: 32,
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                            <h2 style={{ color: "#1e293b", marginBottom: 8 }}>404 – Demo non trovata</h2>
                            <p style={{ color: "#64748b", marginBottom: 16 }}>
                                La pagina che cerchi non esiste.
                            </p>
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
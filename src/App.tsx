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
                    "segno-di-un-prodotto",
                    "sistemi-secondo-grado"

                ],
            },
            {
                id: "analisi",
                name: "Analisi",
                slugs: [
                    "intervalli-r",
                    "domini-funzioni",
                    "funzione-esponenziale",
                    "limite-finito-finito",
                    "limite-infinito-finito",
                    "limite-finito-infinito",
                    "limite-infinito-infinito",
                    "funzioni-continue",
                    "proprieta-funzioni-continue",
                    "asintoti",
                    "derivata",
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
                    "grafico-funzioni-goniometriche",
                    "archi-associati",
                    "equazioni-goniometriche"
                ],
            },
            {
                id: "trigonometria",
                name: "Trigonometria",
                slugs: [
                    "risoluzione-di-un-triangolo-rettangolo",
                ],
            },
            {
                id: "geometria-cartesiana",
                name: "Geometria Cartesiana",
                slugs: [
                    "distanza-punto-medio",
                    "equazione-retta",
                    "parabola",
                    "retta-e-parabola",
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
                    "componenti-cartesiane-vettore",
                    "forze",
                    "forza-peso",
                    "forza-elastica",
                    "forza-attrito",
                ]
            },
            {
                id: "cinematica",
                name: "Cinematica",
                slugs: [
                    "velocita-media-secante",
                    "moto-uniformemente-accelerato",
                    "caduta-libera",
                    "moto-circolare-uniforme"
                ],
            },

            {
                id: "elettromagnetismo",
                name: "Elettromagnetismo",
                slugs: [
                    "campo-elettrico",
                    "legge-di-coulomb",
                    "condensatore",
                    "legge-hom",
                    "seconda-legge-ohm",
                    "resistenze-serie-parallelo"
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
                    "verifica-parabola-1",
                    "verifica-parabola-sistemi-3f",

                ],
            },
            {
                id: "quiz-fisica",
                name: "Fisica",
                slugs: [
                    "quiz-vettori",
                    "quiz-forza-peso",
                    "quiz-forza-elastica",
                    "verifica-fisica-vettori-1",
                    "verifica-fisica-forze-2",
                ],
            },
            {
                id: "quiz-goniometria",
                name: "Goniometria",
                slugs: [
                    "verifica-goniometria-1",
                ],
            },
            {
                id: "quiz-analisi",
                name: "Analisi",
                slugs: [
                    "verifica-continuita-1",
                ],
            },
            {
                id: "quiz-geometria-cartesiana",
                name: "Geometria Cartesiana",
                slugs: [
                    "verifica-piano-cartesiano-1",
                ],
            },
            {
                id: "giochi",
                name: "Giochi",
                slugs: [
                    "gioco-inversione-formule",
                    "escape-room",
                    "battaglia-piano-cartesiano",
                ],
            },
        ],
    },
];

// Mappa slug -> demo per lookup veloce
const demoBySlug = new Map(demos.map((d) => [d.slug, d]));

// Demo nuove (mostrano tag NEW)
const newDemoSlugs = new Set([
    "verifica-parabola-1",
    "gioco-inversione-formule",
    "segno-di-un-prodotto",
    "quiz-algebra",
    "verifica-algebra-1",
    "quiz-vettori",
    "risoluzione-di-un-triangolo-rettangolo",
    "legge-hom",
    "sistemi-secondo-grado",
    "funzioni-continue",
    "equazioni-goniometriche",
    "proprieta-funzioni-continue",
    "forze",
    "distanza-punto-medio",
    "equazione-retta",
    "seconda-legge-ohm",
    "parabola",
    "asintoti",
    "quiz-forza-peso",
    "quiz-forza-elastica",
    "escape-room",
    "verifica-fisica-vettori-1",
    "verifica-fisica-forze-2",
    "battaglia-piano-cartesiano",
    "verifica-goniometria-1",
    "derivata",
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

// Estrai tutti i tag unici e conta le occorrenze
const allTags = demos.flatMap(d => d.tags || []);
const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

// Tag popolari (ordinati per frequenza, top 15)
const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag]) => tag);

function Home() {
    // Tutte le categorie espanse di default
    const [expanded, setExpanded] = useState<Record<string, boolean>>(
        Object.fromEntries(categories.map((c) => [c.id, true]))
    );

    // Stato ricerca
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const toggleCategory = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalDemos = demos.length;
    const totalTests = tests.length;

    // Filtra le demo in base alla ricerca e al tag selezionato
    const filteredSlugs = demos
        .filter(demo => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                demo.title.toLowerCase().includes(query) ||
                (demo.tags || []).some(tag => tag.toLowerCase().includes(query));
            const matchesTag = !selectedTag || (demo.tags || []).includes(selectedTag);
            return matchesSearch && matchesTag;
        })
        .map(d => d.slug);

    const isFiltering = searchQuery.trim() !== "" || selectedTag !== null;

    // Set per lookup veloce
    const filteredSlugsSet = new Set(filteredSlugs);

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

                {/* Barra di ricerca */}
                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                }}>
                    <div style={{ position: "relative", overflow: "hidden" }}>
                        <input
                            type="text"
                            placeholder="Cerca demo per titolo o argomento..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px 12px 44px",
                                borderRadius: 8,
                                border: "2px solid #e2e8f0",
                                fontSize: 16,
                                outline: "none",
                                transition: "border-color 0.2s",
                                boxSizing: "border-box",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                        <span style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: 18,
                            pointerEvents: "none",
                        }}>
                            🔍
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                style={{
                                    position: "absolute",
                                    right: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "#e2e8f0",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 24,
                                    height: 24,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 14,
                                    color: "#64748b",
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Tag popolari */}
                    <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                            Tag popolari:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {popularTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 20,
                                        border: selectedTag === tag ? "2px solid #3b82f6" : "1px solid #d1d5db",
                                        background: selectedTag === tag ? "#dbeafe" : "#f8fafc",
                                        color: selectedTag === tag ? "#1e40af" : "#475569",
                                        fontSize: 13,
                                        cursor: "pointer",
                                        fontWeight: selectedTag === tag ? 600 : 400,
                                        transition: "all 0.15s",
                                    }}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro attivo */}
                    {isFiltering && (
                        <div style={{
                            marginTop: 12,
                            padding: "8px 12px",
                            background: "#fef3c7",
                            borderRadius: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                            <span style={{ fontSize: 13, color: "#92400e" }}>
                                {filteredSlugs.length} demo trovate
                                {selectedTag && <span> con tag <strong>#{selectedTag}</strong></span>}
                            </span>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedTag(null); }}
                                style={{
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#fcd34d",
                                    color: "#78350f",
                                    fontSize: 12,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Azzera filtri
                            </button>
                        </div>
                    )}
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
                {categories.map((category) => {
                    // Filtra le sottocategorie che hanno almeno una demo visibile
                    const filteredSubcategories = category.subcategories
                        .map(sub => ({
                            ...sub,
                            slugs: isFiltering
                                ? sub.slugs.filter(slug => filteredSlugsSet.has(slug))
                                : sub.slugs
                        }))
                        .filter(sub => sub.slugs.length > 0);

                    // Non mostrare categorie vuote durante il filtro
                    if (isFiltering && filteredSubcategories.length === 0) {
                        return null;
                    }

                    return (
                        <CategoryCard
                            key={category.id}
                            category={{ ...category, subcategories: filteredSubcategories }}
                            expanded={expanded[category.id] || isFiltering}
                            onToggle={() => toggleCategory(category.id)}
                        />
                    );
                })}

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
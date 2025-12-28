import React, { Suspense } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { demos } from "./demos";
import "katex/dist/katex.min.css";

function Home() {
  return (
      <div style={{ maxWidth: 900, margin: "auto", padding: 16 }}>
        <h1>Matematica & Fisica – Demo interattive per le lezioni di Giovanni Ugolini</h1>
        <ul>
          {demos.map((d) => (
              <li key={d.slug}>
                <Link to={`/${d.slug}`}>{d.title}</Link>
              </li>
          ))}
        </ul>
        <p>cercherò di metterne il più possibile</p>
      </div>
  );
}

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
                    <Suspense fallback={<div style={{ padding: 16 }}>Caricamento…</div>}>
                      <Component />
                    </Suspense>
                  }
              />
          ))}
          <Route path="*" element={<div style={{ padding: 16 }}>404 – demo non trovata</div>} />
        </Routes>
      </Router>
  );
}

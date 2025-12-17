import React, { Suspense } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { demos } from "./demos";
import TeoriaDisequazioni from "./pages/teoria/disequazioni";

function Home() {
  return (
      <div style={{maxWidth: 900, margin: "auto", padding: 16}}>
          <h1>Matematica & Fisica – Demo interattive per le lezioni di Giovanni Ugolini</h1>


          <h2>Demo Interattive</h2>
          <ul>
              {demos.map((d) => (
                  <li key={d.slug}>
                      <Link to={`/${d.slug}`}>{d.title}</Link>
                  </li>
              ))}
          </ul>
          <h2>Lezioni Interattive</h2>
          <ul>
              <li>
                  <Link to="/teoria/disequazioni">Disequazioni e sistemi (lezione interattiva)</Link>
              </li>
          </ul>

      </div>
  );
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/teoria/disequazioni" element={<TeoriaDisequazioni />} />
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

/**
 * LessonPage - Pagina esempio per visualizzare una lezione
 */

import React from "react";
import { LessonRenderer } from "../types/LessonRenderer";
import { Lezione } from "../types/schema";

// Import del JSON
import lezioneVettori from "../data/vettori-componenti-cartesiane.json";

export default function LessonPage(): React.ReactElement {
    const lezione = lezioneVettori as unknown as Lezione;

    return (
        <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
            <LessonRenderer lezione={lezione} showTableOfContents={true} />
        </div>
    );
}
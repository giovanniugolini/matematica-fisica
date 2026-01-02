/**
 * Lezioni Interattive - Export centralizzato
 */

// Schema e tipi
export * from "./types/schema";

// Renderer
export { LessonRenderer } from "./types/LessonRenderer";
export type { BoardStyle } from "./types/LessonRenderer";

// Pagina esempio
export { default as LessonPage } from "./pages/LessonPage";
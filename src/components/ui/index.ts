/**
 * UI Components - Esporta tutti i componenti UI riutilizzabili
 * @module components/ui
 */

// Latex
export { Latex, InlineMath, DisplayMath } from "./Latex";
export type { LatexProps } from "./Latex";

// StepByStep
export {
    StepCard,
    NavigationButtons,
    ProblemCard,
    DemoContainer,
    GenerateButton,
    InfoBox,
    ResultBox,
    StepGrid,
    GraphContainer,
    useStepNavigation,
} from "./StepByStep";

export type {
    StepCardProps,
    NavigationButtonsProps,
    ProblemCardProps,
    DemoContainerProps,
    GenerateButtonProps,
    InfoBoxProps,
} from "./StepByStep";
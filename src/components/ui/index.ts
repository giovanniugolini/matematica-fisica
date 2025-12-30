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

// Responsive
export {
    // Breakpoints
    BREAKPOINTS,
    // Hooks
    useBreakpoint,
    useResponsiveValue,
    // Layout Components
    ResponsiveGrid,
    ResponsiveStack,
    ResponsiveCard,
    ResponsiveSvg,
    // Interactive Components
    ResponsiveButtonGroup,
    TouchButton,
    ResponsiveInput,
    ResponsiveSlider,
    // Advanced Components
    CollapsiblePanel,
    SwipeableTabs,
    // Utility
    responsive,
} from "./Responsive";

export type {
    Breakpoint,
    ResponsiveGridProps,
    ResponsiveStackProps,
    ResponsiveCardProps,
    ResponsiveSvgProps,
    ResponsiveButtonGroupProps,
    TouchButtonProps,
    ResponsiveInputProps,
    ResponsiveSliderProps,
    CollapsiblePanelProps,
    SwipeableTabsProps,
} from "./Responsive";
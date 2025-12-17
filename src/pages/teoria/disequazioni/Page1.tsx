import page1Img from "../../../assets/theory/disequazioni/page1.png";
import { Title, Paragraph, Definition, Figure } from "../../../components/theory/TheoryBlocks";
import MiniCheckInequality from "../../../components/theory/widgets/MiniCheckInequality";

export default function Page1() {
    return (
        <>
            <Title>Oltre l’uguaglianza</Title>

            <Figure
                src={page1Img}
                caption="Dalle equazioni alle disequazioni"
            />

            <Paragraph>
                Fino ad ora abbiamo lavorato con le <b>equazioni</b>, cioè con relazioni
                in cui due espressioni sono uguali.
            </Paragraph>
            <MiniCheckInequality />
            <Definition title="Disequazione">
                Una <b>disequazione</b> è una relazione matematica che utilizza i simboli
                &nbsp;<b>&lt;, &gt;, ≤, ≥</b>&nbsp; per confrontare due espressioni.
            </Definition>

            <Definition title="Obiettivo">
                In questo capitolo impareremo a trovare <b>tutti i valori</b> per cui una
                disequazione è vera.
            </Definition>
        </>

    );
}

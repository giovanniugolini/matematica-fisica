#!/bin/bash

# Nome del file di output
OUTFILE="riassunto_commit.txt"

# Prende il primo argomento come numero di commit (default: 1)
N=${1:-1}

# Ottiene la data corrente formattata
DATA=$(date "+%d/%m/%Y alle ore %H:%M:%S")

# Messaggio a video
echo "🔄 Sto esportando gli ultimi $N commit..."

# Scrive l'intestazione nel file (APPEND >>)
echo "" >> "$OUTFILE"
echo "############################################################" >> "$OUTFILE"
echo "# LOG AGGIUNTO IL: $DATA" >> "$OUTFILE"
echo "# CONTENUTO: Ultimi $N commit" >> "$OUTFILE"
echo "############################################################" >> "$OUTFILE"
echo "" >> "$OUTFILE"

# Scrive i log di git (con diff completi) nel file
git log -p -n "$N" >> "$OUTFILE"

# Conferma finale
echo "✅ Fatto! Aggiunti gli ultimi $N commit a '$OUTFILE'."
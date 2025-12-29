# 📄 **Commercializzazione di un AI Insegnante**
*Basato su modelli open-source (Mistral/Llama) con portale dual-role per studenti e insegnanti*

---

## 📌 **1. Analisi delle Licenze**
### **1.1 Licenze dei Modelli Open-Source**
| Modello          | Licenza               | Uso Commerciale | Requisiti                                                                                     | Link                                                                                     |
|------------------|-----------------------|-----------------|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **Mistral 7B**   | Apache 2.0            | ✅ Sì           | Attribuzione a Mistral AI. Non usare il marchio "Mistral" per il tuo prodotto.              | [Licenza](https://github.com/mistralai/mistral-src/blob/main/LICENSE)                   |
| **Llama 2**      | Llama 2 Community     | ✅ Sì           | Max 700M utenti mensili. Non per applicazioni che violano diritti umani.                 | [Licenza](https://ai.meta.com/llama/license/)                                             |
| **Falcon**       | Apache 2.0            | ✅ Sì           | Attribuzione richiesta.                                                                       | [Hugging Face](https://huggingface.co/tiiuae/falcon-7b)                                      |
| **Ollama**       | MIT                   | ✅ Sì           | Nessuna restrizione.                                                                          | [GitHub](https://github.com/jmorganca/ollama)                                             |

### **1.2 Costi e Restrizioni**
- **Modelli**: Gratis (open-source).
- **Hosting**:
    - Locale: Gratis (richiede GPU con ~8GB VRAM).
    - Cloud: ~$0.002 per 1000 token (Hugging Face/AWS).
- **Restrizioni**:
    - Non rivendere il modello stesso.
    - Attribuire la paternità (es. "Basato su Mistral 7B").
    - Non usare marchi registrati (es. "Mistral", "Llama").

### **1.3 Licenze per il Tuo Software**
- **Codice**: MIT o GPL (a tua scelta).
- **Contenuti generati**: Di tua proprietà, ma non puoi rivendicare la paternità del modello.

---

## 📌 **2. Architettura del Portale Dual-Role**
### **2.1 Ruoli e Funzionalità**
| Ruolo        | Funzionalità                                                                                     | Esempi di Prompt                                                                                     |
|--------------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| **Studente** | - Lezioni ed esercizi interattivi.                                                            | "Spiegami le equazioni di secondo grado con esempi pratici."                                         |
|              | - Feedback immediato.                                                                           | "Ho risolto \(x^2 - 5x + 6 = 0\) e ho trovato \(x = 1, x = 6\). È corretto?"                          |
|              | - Tracciamento progressi (spaced repetition).                                                  | "Quali argomenti devo ripassare oggi?"                                                              |
| **Insegnante** | - Creazione/modifica di lezioni.                                                               | "Crea una lezione sugli integrali per studenti di livello medio con 5 esercizi."                     |
|              | - Monitoraggio progressi della classe.                                                        | "Mostra i risultati degli studenti sulla lezione sulle equazioni quadratiche."                      |
|              | - Generazione di report.                                                                        | "Genera un report sui progressi di Giovanni Ugolini negli ultimi 30 giorni."                        |

### **2.2 Esempio di Backend (FastAPI)**
```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
from typing import Literal

app = FastAPI()

class UserRequest(BaseModel):
    prompt: str
    role: Literal["student", "teacher"]
    topic: str
    difficulty: str = "medium"

@app.post("/generate")
def generate_response(request: UserRequest):
    if request.role == "student":
        prompt = f"""
        Sei un insegnante paziente. {request.prompt}
        Fornisci una risposta chiara e passo-passo, con esempi pratici.
        Se l'utente ha sbagliato, spiega gentilmente l'errore e fornisci la soluzione corretta.
        """
    elif request.role == "teacher":
        prompt = f"""
        Sei un assistente per insegnanti. {request.prompt}
        Fornisci contenuti dettagliati, esercizi con soluzioni, e suggerimenti pedagogici.
        Se richiesto, genera report o analisi sui progressi degli studenti.
        """
    else:
        raise HTTPException(status_code=400, detail="Ruolo non valido")

    response = ollama.generate(model="mistral", prompt=prompt)
    return {"response": response["response"]}

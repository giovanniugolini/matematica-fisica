/**
 * Asset Registry - Registro degli asset disponibili
 *
 * In futuro questo può essere generato automaticamente
 * da una scansione della cartella o caricato da API.
 */

import { AssetRegistryEntry } from "./types";

/**
 * Registro statico degli asset.
 * Chiave: assetId (es: "vettori/scomposizione")
 */
export const assetRegistry: Record<string, AssetRegistryEntry> = {
    // ========== VETTORI ==========
    // Asset originali
    "vettori/scomposizione": {
        id: "vettori/scomposizione",
        type: "image",
        category: "vettori",
        name: "Scomposizione vettore",
        alt: "Scomposizione di un vettore nelle componenti cartesiane",
        extension: "svg",
        path: "vettori/scomposizione.svg",
        width: 400,
        height: 300,
    },

    // Aggiungi anche queste varianti per compatibilità
    "vettori/scomposizione.svg": {
        id: "vettori/scomposizione.svg",
        type: "image",
        category: "vettori",
        name: "Scomposizione vettore",
        alt: "Scomposizione di un vettore nelle componenti cartesiane",
        extension: "svg",
        path: "vettori/scomposizione.svg",
        width: 400,
        height: 300,
    },

    "lezione/vettori/scomposizione": {
        id: "lezione/vettori/scomposizione",
        type: "image",
        category: "vettori",
        name: "Scomposizione vettore",
        alt: "Scomposizione di un vettore nelle componenti cartesiane",
        extension: "svg",
        path: "vettori/scomposizione.svg",
        width: 400,
        height: 300,
    },

    "lezione/vettori/scomposizione.svg": {
        id: "lezione/vettori/scomposizione.svg",
        type: "image",
        category: "vettori",
        name: "Scomposizione vettore",
        alt: "Scomposizione di un vettore nelle componenti cartesiane",
        extension: "svg",
        path: "vettori/scomposizione.svg",
        width: 400,
        height: 300,
    },
    "vettori/componenti-xy": {
        id: "vettori/componenti-xy",
        type: "image",
        category: "vettori",
        name: "Componenti X e Y",
        alt: "Componenti Ax e Ay di un vettore",
        extension: "svg",
        path: "vettori/componenti-xy.svg",
        width: 400,
        height: 300,
    },
    "vettori/quadranti": {
        id: "vettori/quadranti",
        type: "image",
        category: "vettori",
        name: "Segni nei quadranti",
        alt: "Segni delle componenti nei quattro quadranti",
        extension: "svg",
        path: "vettori/quadranti.svg",
        width: 400,
        height: 400,
    },
    "vettori/angolo-theta": {
        id: "vettori/angolo-theta",
        type: "image",
        category: "vettori",
        name: "Angolo theta",
        alt: "Angolo theta formato dal vettore con l'asse x",
        extension: "svg",
        path: "vettori/angolo-theta.svg",
        width: 350,
        height: 300,
    },
    "vettori/triangolo-rettangolo": {
        id: "vettori/triangolo-rettangolo",
        type: "image",
        category: "vettori",
        name: "Triangolo rettangolo",
        alt: "Triangolo rettangolo formato dal vettore e le componenti",
        extension: "svg",
        path: "vettori/triangolo-rettangolo.svg",
        width: 400,
        height: 300,
    },

    // ========== SHARED ==========
    "shared/assi-cartesiani": {
        id: "shared/assi-cartesiani",
        type: "image",
        category: "shared",
        name: "Assi cartesiani",
        alt: "Sistema di assi cartesiani x-y",
        extension: "svg",
        path: "shared/assi-cartesiani.svg",
        width: 400,
        height: 400,
    },
    "shared/placeholder": {
        id: "shared/placeholder",
        type: "image",
        category: "shared",
        name: "Placeholder",
        alt: "Immagine placeholder",
        extension: "svg",
        path: "shared/placeholder.svg",
        width: 200,
        height: 200,
    },

};

/**
 * Helper per aggiungere asset a runtime (es. upload utente)
 */
export function registerAsset(entry: AssetRegistryEntry): void {
    assetRegistry[entry.id] = entry;
}

/**
 * Helper per rimuovere asset
 */
export function unregisterAsset(assetId: string): boolean {
    if (assetRegistry[assetId]) {
        delete assetRegistry[assetId];
        return true;
    }
    return false;
}
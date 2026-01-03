/**
 * Asset Types - Interfacce stabili per gestione asset
 */

export type AssetType = "image" | "video" | "audio" | "document";

export type AssetCategory =
    | "vettori"
    | "cinematica"
    | "dinamica"
    | "elettromagnetismo"
    | "algebra"
    | "analisi"
    | "geometria"
    | "trigonometria"
    | "shared"
    | "user";

export interface AssetMetadata {
    id: string;
    type: AssetType;
    category: AssetCategory;
    name: string;
    description?: string;
    alt?: string;
    extension: string;
    width?: number;
    height?: number;
    duration?: number;
}

export interface AssetRegistryEntry extends AssetMetadata {
    /** Path relativo dal base URL */
    path: string;
}

export interface IAssetProvider {
    getUrl(assetId: string): string | null;
    exists(assetId: string): boolean;
    getMetadata(assetId: string): AssetMetadata | null;
    listByCategory(category: AssetCategory): AssetMetadata[];
    preload(assetIds: string[]): Promise<void>;
}
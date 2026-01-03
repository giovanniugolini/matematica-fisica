/**
 * AssetManager - Gestione centralizzata degli asset
 *
 * Questa classe fornisce un'interfaccia unificata per accedere agli asset.
 * L'implementazione può essere sostituita per supportare:
 * - Asset locali (public/)
 * - CDN esterno
 * - API backend (Node.js)
 * - Storage cloud (S3, Cloudinary, etc.)
 */

import { AssetMetadata, AssetCategory, IAssetProvider } from "./types";
import { assetRegistry } from "./registry";

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

export interface AssetManagerConfig {
    /** Base URL per gli asset (default: /images/lezioni) */
    baseUrl: string;
    /** Abilita preload automatico */
    autoPreload: boolean;
    /** Usa cache in memoria */
    useCache: boolean;
    /** Fallback se asset non trovato */
    fallbackImage?: string;
    /** Provider custom (per Node.js/API) */
    provider?: IAssetProvider;
}
const publicUrl = process.env.PUBLIC_URL || "";
const defaultConfig: AssetManagerConfig = {
    baseUrl: `${publicUrl}/images/lezioni`,
    autoPreload: false,
    useCache: true,
};

// ============================================================================
// ASSET MANAGER
// ============================================================================

class AssetManagerClass implements IAssetProvider {

    private config: AssetManagerConfig;
    private cache: Map<string, string> = new Map();
    private preloadedImages: Set<string> = new Set();

    constructor(config: Partial<AssetManagerConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    /** Configura l'AssetManager */
    configure(config: Partial<AssetManagerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /** Ottiene l'URL completo di un asset */
    getUrl(assetId: string): string | null {
        console.log(`🔍 AssetManager.getUrl chiamato con: "${assetId}"`);

        if (this.config.provider) {
            return this.config.provider.getUrl(assetId);
        }

        if (this.config.useCache && this.cache.has(assetId)) {
            return this.cache.get(assetId)!;
        }

        const entry = assetRegistry[assetId];
        if (!entry) {
            console.warn(`[AssetManager] Asset non trovato: ${assetId}`);
            return this.config.fallbackImage || null;
        }

        let url: string;
        if (entry.path.startsWith("http://") || entry.path.startsWith("https://")) {
            url = entry.path;
        } else {
            url = `${this.config.baseUrl}/${entry.path}`;
        }

        if (this.config.useCache) {
            this.cache.set(assetId, url);
        }

        return url;
    }

    /** Verifica se un asset esiste nel registry */
    exists(assetId: string): boolean {
        if (this.config.provider) {
            return this.config.provider.exists(assetId);
        }
        return assetId in assetRegistry;
    }

    /** Ottiene i metadati di un asset */
    getMetadata(assetId: string): AssetMetadata | null {
        if (this.config.provider) {
            return this.config.provider.getMetadata(assetId);
        }
        return assetRegistry[assetId] || null;
    }

    /** Lista asset per categoria */
    listByCategory(category: AssetCategory): AssetMetadata[] {
        if (this.config.provider) {
            return this.config.provider.listByCategory(category);
        }
        return Object.values(assetRegistry).filter((a) => a.category === category);
    }

    /** Lista tutti gli asset */
    listAll(): AssetMetadata[] {
        return Object.values(assetRegistry);
    }

    /** Precarica immagini per performance */
    async preload(assetIds: string[]): Promise<void> {
        if (this.config.provider) {
            return this.config.provider.preload(assetIds);
        }

        const imagePromises = assetIds
            .filter((id) => {
                const meta = this.getMetadata(id);
                return meta?.type === "image" && !this.preloadedImages.has(id);
            })
            .map((id) => {
                return new Promise<void>((resolve) => {
                    const url = this.getUrl(id);
                    if (!url) {
                        resolve();
                        return;
                    }
                    const img = new Image();
                    img.onload = () => {
                        this.preloadedImages.add(id);
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn(`[AssetManager] Errore preload: ${id}`);
                        resolve();
                    };
                    img.src = url;
                });
            });

        await Promise.all(imagePromises);
    }

    /** Precarica tutti gli asset di una categoria */
    async preloadCategory(category: AssetCategory): Promise<void> {
        const assets = this.listByCategory(category);
        await this.preload(assets.map((a) => a.id));
    }

    /** Svuota la cache */
    clearCache(): void {
        this.cache.clear();
        this.preloadedImages.clear();
    }

    /** Risolve riferimenti asset nel testo (asset:id -> URL) */
    resolveInText(text: string): string {
        return text.replace(/asset:([a-zA-Z0-9_\-/]+)/g, (_, assetId) => {
            return this.getUrl(assetId) || assetId;
        });
    }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const AssetManager = new AssetManagerClass();
export { AssetManagerClass };

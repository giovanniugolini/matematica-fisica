/**
 * Assets Module - Export centralizzato
 */

export type { 
    AssetType, 
    AssetCategory, 
    AssetMetadata, 
    AssetRegistryEntry,
    IAssetProvider 
} from "./types";

export { AssetManager, AssetManagerClass } from "./AssetManager";
export type { AssetManagerConfig } from "./AssetManager";

export { assetRegistry, registerAsset, unregisterAsset } from "./registry";

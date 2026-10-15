/**
 * CALL OF PADUA — asset-first 3D pipeline.
 * Separate from the currently published low-poly renderer.
 * Never silently substitute box/cylinder people or buildings when an asset is missing.
 */
export class AssetPipeline {
  constructor({ loader, scene, onProgress = () => {} }) {
    if (typeof loader !== 'function') throw new TypeError('loader(url) must return a glTF scene');
    if (!scene || typeof scene.add !== 'function') throw new TypeError('A 3D scene is required');
    this.loader = loader;
    this.scene = scene;
    this.onProgress = onProgress;
    this.instances = new Map();
  }

  async loadManifest(url = './next/assets.json') {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Manifest unavailable: HTTP ' + response.status);
    const manifest = await response.json();
    validateManifest(manifest);
    this.manifest = manifest;
    return manifest;
  }

  async loadScene(sceneId, { signal } = {}) {
    if (!this.manifest) throw new Error('Load the manifest first');
    const spec = this.manifest.scenes.find(s => s.id === sceneId);
    if (!spec) throw new Error('Unknown scene: ' + sceneId);
    const loaded = [];
    try {
      for (const instance of spec.instances) {
        if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
        const asset = this.manifest.assets.find(a => a.id === instance.asset);
        if (!asset) throw new Error('Missing asset declaration: ' + instance.asset);
        const gltf = await this.loader(asset.url);
        const node = gltf?.scene?.clone?.(true);
        if (!node) throw new Error('Invalid glTF scene: ' + asset.url);
        node.position.set(...instance.position);
        node.rotation.y = instance.rotationY ?? 0;
        const scale = instance.scale ?? 1;
        node.scale.set(scale, scale, scale);
        node.userData = { ...(node.userData || {}), assetId: asset.id, semanticRole: asset.role, placeId: spec.id };
        this.scene.add(node);
        loaded.push(node);
        this.onProgress({ scene: sceneId, complete: loaded.length, total: spec.instances.length });
      }
      this.instances.set(sceneId, loaded);
      return loaded;
    } catch (error) {
      for (const node of loaded) this.scene.remove(node);
      throw error;
    }
  }

  unloadScene(sceneId) {
    for (const node of this.instances.get(sceneId) ?? []) this.scene.remove(node);
    this.instances.delete(sceneId);
  }
}

export function validateManifest(manifest) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.assets) || !Array.isArray(manifest.scenes)) {
    throw new Error('Invalid asset manifest format');
  }
  const assets = new Map();
  for (const asset of manifest.assets) {
    if (typeof asset.id !== 'string' || !asset.id || assets.has(asset.id)) throw new Error('Invalid or repeated asset ID');
    if (!['architecture','character','weapon','vehicle','prop'].includes(asset.role)) throw new Error('Invalid asset role: ' + asset.id);
    if (typeof asset.url !== 'string' || !/^\.\/assets\/[\w./-]+\.glb$/i.test(asset.url) || asset.url.includes('..')) {
      throw new Error('Use local, versioned GLB files: ' + asset.id);
    }
    if (asset.role === 'character' && (!Array.isArray(asset.animations) || !['idle','walk','run'].every(x => asset.animations.includes(x)))) {
      throw new Error('Character requires idle/walk/run animations: ' + asset.id);
    }
    if (!asset.license || !asset.credit) throw new Error('Missing asset provenance: ' + asset.id);
    assets.set(asset.id, asset);
  }
  for (const spec of manifest.scenes) {
    if (!spec.id || !Array.isArray(spec.instances)) throw new Error('Invalid scene');
    for (const inst of spec.instances) {
      if (!assets.has(inst.asset)) throw new Error('Undeclared asset: ' + inst.asset);
      if (!Array.isArray(inst.position) || inst.position.length !== 3 || !inst.position.every(Number.isFinite)) {
        throw new Error('Invalid coordinates for ' + inst.asset);
      }
    }
  }
  return true;
}

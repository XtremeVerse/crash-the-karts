// Dynamic asset index using Vite import.meta.glob
// Discovers GLB cars and characters from top-level /cars and /characters folders,
// falling back to /placeholder/cars and /placeholder/characters if needed.

const carUrls = {
  ...(import.meta.glob('/cars/*.glb', { as: 'url', eager: true })),
  ...(import.meta.glob('/placeholder/cars/*.glb', { as: 'url', eager: true })),
};

const charUrls = {
  ...(import.meta.glob('/characters/*.glb', { as: 'url', eager: true })),
  ...(import.meta.glob('/charaters/*.glb', { as: 'url', eager: true })),
  ...(import.meta.glob('/placeholder/characters/*.glb', { as: 'url', eager: true })),
  ...(import.meta.glob('/placeholder/charaters/*.glb', { as: 'url', eager: true })),
};

function basename(p) {
  const parts = p.split('/');
  const file = parts[parts.length - 1];
  return file.replace(/\.[^.]+$/, '');
}

const carsByName = {};
Object.entries(carUrls).forEach(([path, url]) => {
  carsByName[basename(path)] = url;
});

const charsByName = {};
Object.entries(charUrls).forEach(([path, url]) => {
  charsByName[basename(path)] = url;
});

export function listCarNames() {
  return Object.keys(carsByName);
}
export function listCharacterNames() {
  return Object.keys(charsByName);
}
export function urlForCar(name) {
  return carsByName[name] || null;
}
export function urlForCharacter(name) {
  return charsByName[name] || null;
}

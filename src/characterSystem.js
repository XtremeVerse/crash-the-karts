export const Characters = ['Driver1', 'Driver2', 'Driver3'];
export function getCharacterColor(name) {
    if (name === 'Driver1') return 'white';
    if (name === 'Driver2') return 'cyan';
    return 'magenta';
}

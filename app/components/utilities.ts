export function hexToString(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const hexCode = parseInt(hex.substring(i, i + 2), 16);
    str += String.fromCharCode(hexCode);
  }
  return str;
}

export function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}
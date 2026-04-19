export const C = {
  linen:    '#f5efe4',
  paper:    '#ecdfc7',
  ivory:    '#faf5ea',
  bark:     '#2b1d14',
  cocoa:    '#4a3324',
  mocha:    '#7a5a45',
  dust:     '#a88f73',
  crema:    '#c49764',
  hairline: '#d9cdb6',
} as const;

export const FD = '"Cormorant Garamond", ui-serif, Georgia, serif';
export const FS = '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif';
export const FM = '"DM Mono", ui-monospace, monospace';

export function fmt(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export const CURRENCY_ENUM = {
  USD: ['CNY', 'RUB'],
  CNY: ['RUB', 'USD'],
  RUB: ['CNY', 'USD'],
} as const;

export const SYMBOL_MAP = {
  USD: '$',
  CNY: '¥',
  RUB: '₽',
} as const;

export const CURRENCY_OPTIONS = [
  { key: 'RUB', label: '卢布', value: 'RUB' },
  { key: 'CNY', label: '人民币', value: 'CNY' },
  { key: 'USD', label: '美元', value: 'USD' },
];

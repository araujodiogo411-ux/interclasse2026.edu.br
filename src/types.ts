export interface Order {
  id: string;
  studentName: string;
  shirtName: string;
  number: number;
  size: ShirtSize;
  createdAt: string;
}

export type ShirtSize =
  | 'RN (Recém-Nascido)'
  | 'PP'
  | 'P (INFANTIL)'
  | 'P (ADULTO)'
  | 'M (ADULTO)'
  | 'G'
  | 'GG (ADULTO)'
  | 'XG';

export const SHIRT_SIZES: ShirtSize[] = [
  'RN (Recém-Nascido)',
  'PP',
  'P (INFANTIL)',
  'P (ADULTO)',
  'M (ADULTO)',
  'G',
  'GG (ADULTO)',
  'XG',
];

export interface SizeDescription {
  size: ShirtSize;
  badge: string;
  category: 'infantil' | 'adulto' | 'especial';
}

export const SIZE_DETAILS: Record<ShirtSize, { label: string; desc: string }> = {
  'RN (Recém-Nascido)': { label: 'RN', desc: 'Recém-Nascido (Bebê)' },
  'PP': { label: 'PP', desc: 'Extra Pequeno' },
  'P (INFANTIL)': { label: 'P INF', desc: 'Pequeno Infantil' },
  'P (ADULTO)': { label: 'P ADU', desc: 'Pequeno Adulto' },
  'M (ADULTO)': { label: 'M ADU', desc: 'Médio Adulto Padrão' },
  'G': { label: 'G', desc: 'Grande Padrão' },
  'GG (ADULTO)': { label: 'GG', desc: 'Extra Grande Adulto' },
  'XG': { label: 'XG', desc: 'Super Grande' },
};

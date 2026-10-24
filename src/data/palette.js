export const PALETTE = [
  { id: 'red', label: 'red', hex: '#E33B2E' },
  { id: 'blue', label: 'blue', hex: '#1F7BE0' },
  { id: 'green', label: 'green', hex: '#2BA84A' },
  { id: 'yellow', label: 'yellow', hex: '#FFC523' },
  { id: 'orange', label: 'orange', hex: '#F5811F' },
  { id: 'purple', label: 'purple', hex: '#8A4FC8' },
  { id: 'pink', label: 'pink', hex: '#FF6EA6' },
  { id: 'brown', label: 'brown', hex: '#96602F' },
  { id: 'grey', label: 'grey', hex: '#8B93A6' },
  { id: 'black', label: 'black', hex: '#14204A' },
];

export const byId = (id) => PALETTE.find((c) => c.id === id);

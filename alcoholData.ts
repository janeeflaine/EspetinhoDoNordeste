
import { Product } from './types';

// ARQUIVO ISOLADO: Este conteúdo não será incluído no bundle inicial.
// Só será carregado via import() dinâmico após verificação de idade.

export const RESTRICTED_PRODUCTS: Product[] = [
  {
    id: '16',
    name: 'Skol Latão 473ml',
    price: 6.00,
    category: 'Bebidas',
    icon: '🍺',
    image: 'https://picsum.photos/id/16/200/200',
    available: true
  },
  {
    id: '17',
    name: 'Brahma Latão 473ml',
    price: 6.00,
    category: 'Bebidas',
    icon: '🍺',
    image: 'https://picsum.photos/id/17/200/200',
    available: true
  },
  {
    id: '18',
    name: 'Skol Latinha 350ml',
    price: 5.00,
    category: 'Bebidas',
    icon: '🍺',
    image: 'https://picsum.photos/id/18/200/200',
    available: true
  },
  {
    id: '19',
    name: 'Brahma Latinha 350ml',
    price: 5.00,
    category: 'Bebidas',
    icon: '🍺',
    image: 'https://picsum.photos/id/19/200/200',
    available: true
  },
];

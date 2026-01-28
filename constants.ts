
import { Product, CategoryItem } from './types';

export const PHONE_NUMBER = '5533999488193';

export const CATEGORIES: CategoryItem[] = [
  { id: 'Todos', label: 'Todos', icon: '🍽️', active: true },
  { id: 'Espetinhos', label: 'Espetinhos', icon: '🍢', active: true },
  { id: 'Jantinha', label: 'Jantinha', icon: '🍲', active: true },
  { id: 'Bebidas', label: 'Bebidas', icon: '🍺', active: true },
  { id: 'Refrigerantes', label: 'Refrigerantes', icon: '🥤', active: true },
];

// NOTE: Restricted products (Alcohol) have been moved to alcoholData.ts 
// and are loaded dynamically to comply with Ad/Crawler policies.
export const PRODUCTS: Product[] = [
  // Espetinhos
  {
    id: '1',
    name: 'Espetinho de Frango',
    price: 6.00,
    category: 'Espetinhos',
    icon: '🍗',
    image: 'https://picsum.photos/id/1/200/200',
    available: true
  },
  {
    id: '2',
    name: 'Espetinho de Boi',
    price: 7.00,
    category: 'Espetinhos',
    icon: '🥩',
    image: 'https://picsum.photos/id/2/200/200',
    available: true
  },
  {
    id: '3',
    name: 'Espetinho de Linguiça',
    price: 5.00,
    category: 'Espetinhos',
    icon: '🥖',
    image: 'https://picsum.photos/id/3/200/200',
    available: true
  },
  {
    id: '4',
    name: 'Espetinho de Queijo Coalho',
    price: 9.00,
    category: 'Espetinhos',
    icon: '🧀',
    image: 'https://picsum.photos/id/4/200/200',
    available: true
  },
  {
    id: '5',
    name: 'Espetinho de Coração',
    price: 8.00,
    category: 'Espetinhos',
    icon: '❤️',
    image: 'https://picsum.photos/id/5/200/200',
    available: true
  },
  {
    id: '6',
    name: 'Espetinho de Asa',
    price: 7.00,
    category: 'Espetinhos',
    icon: '🍗',
    image: 'https://picsum.photos/id/6/200/200',
    available: true
  },
  {
    id: '7',
    name: 'Espetinho de Porco',
    price: 6.00,
    category: 'Espetinhos',
    icon: '🐷',
    image: 'https://picsum.photos/id/7/200/200',
    available: true
  },
  {
    id: '8',
    name: 'Espetinho de Sambiquira',
    price: 5.00,
    category: 'Espetinhos',
    icon: '🐔',
    image: 'https://picsum.photos/id/8/200/200',
    available: true
  },
  // Jantinha
  {
    id: '9',
    name: 'Jantinha Completa',
    description: 'Arroz, Feijão Tropeiro e Vinagrete',
    price: 15.00,
    category: 'Jantinha',
    icon: '🍲',
    image: 'https://picsum.photos/id/9/200/200',
    available: true
  },
  // Refrigerantes
  {
    id: '10',
    name: 'Coca Lata 350ml',
    price: 6.00,
    category: 'Refrigerantes',
    icon: '🥤',
    image: 'https://picsum.photos/id/10/200/200',
    available: true
  },
  {
    id: '11',
    name: 'Fanta Uva Lata 350ml',
    price: 6.00,
    category: 'Refrigerantes',
    icon: '🥤',
    image: 'https://picsum.photos/id/11/200/200',
    available: true
  },
  {
    id: '12',
    name: 'Pepsi Lata 350ml',
    price: 6.00,
    category: 'Refrigerantes',
    icon: '🥤',
    image: 'https://picsum.photos/id/12/200/200',
    available: true
  },
  {
    id: '13',
    name: 'Guaraná Lata 350ml',
    price: 6.00,
    category: 'Refrigerantes',
    icon: '🥤',
    image: 'https://picsum.photos/id/13/200/200',
    available: true
  },
  {
    id: '14',
    name: 'Sukita Uva Lata 300ml',
    price: 6.00,
    category: 'Refrigerantes',
    icon: '🥤',
    image: 'https://picsum.photos/id/14/200/200',
    available: true
  },
  {
    id: '15',
    name: 'Pepsi Zero Lata 350ml',
    price: 6.00,
    category: 'Refrigerantes',
    icon: '🥤',
    image: 'https://picsum.photos/id/15/200/200',
    available: true
  },
];

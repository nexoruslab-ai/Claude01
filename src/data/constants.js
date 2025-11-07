// EMPRESAS - Fuentes de Ingreso
export const EMPRESAS = [
  'Bravium Emperium',
  'SwissJust',
  'Nexorus LLC',
  'Airbnb',
  'OFAI'
];

// MÉTODOS DE COBRO/PAGO (alfabéticamente ordenados)
export const METODOS_COBRO = [
  'Banco Galicia',
  'Banco Patagonia',
  'Binance',
  'Cuenta Just',
  'Efectivo ARS',
  'Efectivo USD',
  'LemonCash',
  'Mercado Pago',
  'Mercury',
  'PayPal',
  'Stripe',
  'Wallbit'
];

// TIPOS DE PAGO
export const TIPOS_PAGO = [
  'Pago Completo',
  'Cuota',
  'Adelanto',
  'Pago Parcial'
];

// MONEDAS
export const MONEDAS = ['ARS', 'USD'];

// CATEGORÍAS DE GASTOS
export const CATEGORIAS = [
  'Comida',
  'Gimnasio',
  'Jiujitsu',
  'Suplementación',
  'Tarjeta Credito 01',
  'Tarjeta Credito 02',
  'Tarjeta ADS',
  'Bravium Emperium',
  'SwissJust',
  'Nexorus LLC',
  'Airbnb',
  'OFAI',
  'Membresias Software',
  'Membresia Knowledge',
  'Pago a padre',
  'Regalos',
  'Ofrendas',
  'Viajes',
  'Estilo de vida'
];

// SISTEMA DE PRIORIDADES CON METAS
// Orden estricto de distribución en cascada
export const PRIORIDADES = [
  // PRIORIDAD 01 - Crítico (Rojo)
  {
    numero: 0,
    categoria: 'SAGRADO 40%',
    meta: 0, // Se calcula automáticamente como 40% del total
    prioridad: 1,
    color: '#dc2626',
    colorBg: '#fee2e2',
    nivelNombre: 'PRIORIDAD 01 - Crítico',
    esSagrado: true
  },
  {
    numero: 1,
    categoria: 'Tarjeta Credito 01',
    meta: 0,
    prioridad: 1,
    color: '#dc2626',
    colorBg: '#fee2e2',
    nivelNombre: 'PRIORIDAD 01 - Crítico'
  },
  {
    numero: 2,
    categoria: 'Tarjeta Credito 02',
    meta: 0,
    prioridad: 1,
    color: '#dc2626',
    colorBg: '#fee2e2',
    nivelNombre: 'PRIORIDAD 01 - Crítico'
  },
  {
    numero: 3,
    categoria: 'Tarjeta ADS',
    meta: 0,
    prioridad: 1,
    color: '#dc2626',
    colorBg: '#fee2e2',
    nivelNombre: 'PRIORIDAD 01 - Crítico'
  },
  {
    numero: 4,
    categoria: 'Comida',
    meta: 200,
    prioridad: 1,
    color: '#dc2626',
    colorBg: '#fee2e2',
    nivelNombre: 'PRIORIDAD 01 - Crítico'
  },

  // PRIORIDAD 02 - Importante (Naranja)
  {
    numero: 5,
    categoria: 'Gimnasio',
    meta: 20,
    prioridad: 2,
    color: '#ea580c',
    colorBg: '#ffedd5',
    nivelNombre: 'PRIORIDAD 02 - Importante'
  },
  {
    numero: 6,
    categoria: 'Suplementación',
    meta: 40,
    prioridad: 2,
    color: '#ea580c',
    colorBg: '#ffedd5',
    nivelNombre: 'PRIORIDAD 02 - Importante'
  },
  {
    numero: 7,
    categoria: 'Jiujitsu',
    meta: 20,
    prioridad: 2,
    color: '#ea580c',
    colorBg: '#ffedd5',
    nivelNombre: 'PRIORIDAD 02 - Importante'
  },
  {
    numero: 8,
    categoria: 'Pago a padre',
    meta: 250,
    prioridad: 2,
    color: '#ea580c',
    colorBg: '#ffedd5',
    nivelNombre: 'PRIORIDAD 02 - Importante'
  },

  // PRIORIDAD 03 - Inversiones (Amarillo)
  {
    numero: 9,
    categoria: 'Membresias Software',
    meta: 100,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },
  {
    numero: 10,
    categoria: 'Membresia Knowledge',
    meta: 100,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },
  {
    numero: 11,
    categoria: 'Bravium Emperium',
    meta: 100,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },
  {
    numero: 12,
    categoria: 'SwissJust',
    meta: 100,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },
  {
    numero: 13,
    categoria: 'Nexorus LLC',
    meta: 100,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },
  {
    numero: 14,
    categoria: 'Airbnb',
    meta: 0,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },
  {
    numero: 15,
    categoria: 'OFAI',
    meta: 0,
    prioridad: 3,
    color: '#ca8a04',
    colorBg: '#fef9c3',
    nivelNombre: 'PRIORIDAD 03 - Inversiones'
  },

  // PRIORIDAD 04 - Calidad de vida (Verde)
  {
    numero: 16,
    categoria: 'Regalos',
    meta: 50,
    prioridad: 4,
    color: '#16a34a',
    colorBg: '#dcfce7',
    nivelNombre: 'PRIORIDAD 04 - Calidad de vida'
  },
  {
    numero: 17,
    categoria: 'Ofrendas',
    meta: 50,
    prioridad: 4,
    color: '#16a34a',
    colorBg: '#dcfce7',
    nivelNombre: 'PRIORIDAD 04 - Calidad de vida'
  },
  {
    numero: 18,
    categoria: 'Viajes',
    meta: 700,
    prioridad: 4,
    color: '#16a34a',
    colorBg: '#dcfce7',
    nivelNombre: 'PRIORIDAD 04 - Calidad de vida'
  },
  {
    numero: 19,
    categoria: 'Estilo de vida',
    meta: 0,
    prioridad: 4,
    color: '#16a34a',
    colorBg: '#dcfce7',
    nivelNombre: 'PRIORIDAD 04 - Calidad de vida'
  }
];

// Colores de gráficos para las empresas
export const COLORES_EMPRESAS = {
  'Bravium Emperium': '#3b82f6',
  'SwissJust': '#8b5cf6',
  'Nexorus LLC': '#ec4899',
  'Airbnb': '#f97316',
  'OFAI': '#14b8a6'
};

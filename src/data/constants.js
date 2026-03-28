// EMPRESAS - Fuentes de Ingreso
export const EMPRESAS = [
  'Bravium Emperium',
  'SwissJust',
  'Nexorus LLC',
  'Airbnb',
  'OFAI'
];

// MÉTODOS DE COBRO/PAGO
export const METODOS_COBRO = [
  'Banco Patagonia',
  'Banco Galicia',
  'Mercado Pago',
  'Mercury',
  'Stripe',
  'Binance',
  'Efectivo ARS',
  'Efectivo USD',
  'Cuenta Just'
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
// Palette: Silver / Black / Gray — sin colores externos
export const PRIORIDADES = [
  // PRIORIDAD 01 — Crítico (silver brillante)
  {
    numero: 0,
    categoria: 'SAGRADO 40%',
    meta: 0,
    prioridad: 1,
    color: '#e8e8e8',
    colorBg: 'rgba(232, 232, 232, 0.08)',
    nivelNombre: 'PRIORIDAD 01 — Crítico',
    esSagrado: true
  },
  {
    numero: 1,
    categoria: 'Tarjeta Credito 01',
    meta: 0,
    prioridad: 1,
    color: '#e8e8e8',
    colorBg: 'rgba(232, 232, 232, 0.08)',
    nivelNombre: 'PRIORIDAD 01 — Crítico'
  },
  {
    numero: 2,
    categoria: 'Tarjeta Credito 02',
    meta: 0,
    prioridad: 1,
    color: '#e8e8e8',
    colorBg: 'rgba(232, 232, 232, 0.08)',
    nivelNombre: 'PRIORIDAD 01 — Crítico'
  },
  {
    numero: 3,
    categoria: 'Tarjeta ADS',
    meta: 0,
    prioridad: 1,
    color: '#e8e8e8',
    colorBg: 'rgba(232, 232, 232, 0.08)',
    nivelNombre: 'PRIORIDAD 01 — Crítico'
  },
  {
    numero: 4,
    categoria: 'Comida',
    meta: 200,
    prioridad: 1,
    color: '#e8e8e8',
    colorBg: 'rgba(232, 232, 232, 0.08)',
    nivelNombre: 'PRIORIDAD 01 — Crítico'
  },

  // PRIORIDAD 02 — Importante (silver)
  {
    numero: 5,
    categoria: 'Gimnasio',
    meta: 20,
    prioridad: 2,
    color: '#c0c0c0',
    colorBg: 'rgba(192, 192, 192, 0.08)',
    nivelNombre: 'PRIORIDAD 02 — Importante'
  },
  {
    numero: 6,
    categoria: 'Suplementación',
    meta: 40,
    prioridad: 2,
    color: '#c0c0c0',
    colorBg: 'rgba(192, 192, 192, 0.08)',
    nivelNombre: 'PRIORIDAD 02 — Importante'
  },
  {
    numero: 7,
    categoria: 'Jiujitsu',
    meta: 20,
    prioridad: 2,
    color: '#c0c0c0',
    colorBg: 'rgba(192, 192, 192, 0.08)',
    nivelNombre: 'PRIORIDAD 02 — Importante'
  },
  {
    numero: 8,
    categoria: 'Pago a padre',
    meta: 250,
    prioridad: 2,
    color: '#c0c0c0',
    colorBg: 'rgba(192, 192, 192, 0.08)',
    nivelNombre: 'PRIORIDAD 02 — Importante'
  },

  // PRIORIDAD 03 — Inversiones (silver opaco)
  {
    numero: 9,
    categoria: 'Membresias Software',
    meta: 100,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },
  {
    numero: 10,
    categoria: 'Membresia Knowledge',
    meta: 100,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },
  {
    numero: 11,
    categoria: 'Bravium Emperium',
    meta: 100,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },
  {
    numero: 12,
    categoria: 'SwissJust',
    meta: 100,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },
  {
    numero: 13,
    categoria: 'Nexorus LLC',
    meta: 100,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },
  {
    numero: 14,
    categoria: 'Airbnb',
    meta: 0,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },
  {
    numero: 15,
    categoria: 'OFAI',
    meta: 0,
    prioridad: 3,
    color: '#a0a0a0',
    colorBg: 'rgba(160, 160, 160, 0.08)',
    nivelNombre: 'PRIORIDAD 03 — Inversiones'
  },

  // PRIORIDAD 04 — Calidad de vida (gris profundo)
  {
    numero: 16,
    categoria: 'Regalos',
    meta: 50,
    prioridad: 4,
    color: '#808080',
    colorBg: 'rgba(128, 128, 128, 0.08)',
    nivelNombre: 'PRIORIDAD 04 — Calidad de vida'
  },
  {
    numero: 17,
    categoria: 'Ofrendas',
    meta: 50,
    prioridad: 4,
    color: '#808080',
    colorBg: 'rgba(128, 128, 128, 0.08)',
    nivelNombre: 'PRIORIDAD 04 — Calidad de vida'
  },
  {
    numero: 18,
    categoria: 'Viajes',
    meta: 700,
    prioridad: 4,
    color: '#808080',
    colorBg: 'rgba(128, 128, 128, 0.08)',
    nivelNombre: 'PRIORIDAD 04 — Calidad de vida'
  },
  {
    numero: 19,
    categoria: 'Estilo de vida',
    meta: 0,
    prioridad: 4,
    color: '#808080',
    colorBg: 'rgba(128, 128, 128, 0.08)',
    nivelNombre: 'PRIORIDAD 04 — Calidad de vida'
  }
];

// Colores de gráficos — Shades de gris/plata
export const COLORES_EMPRESAS = {
  'Bravium Emperium': '#e8e8e8',
  'SwissJust':        '#c0c0c0',
  'Nexorus LLC':      '#a0a0a0',
  'Airbnb':           '#808080',
  'OFAI':             '#606060'
};

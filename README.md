# FinFlow - Aplicación Web Financiera

**FinFlow** es una aplicación web interactiva de gestión financiera que replica y mejora tu sistema de Excel con una regla fundamental: el **Sagrado 40%**.

## 🎯 Características Principales

### Sistema de Cascada Automática

La aplicación implementa un sistema único de distribución de ingresos:

1. **Sagrado 40%**: El 40% de TODOS los ingresos se aparta automáticamente SIEMPRE
2. **Distribución 60%**: El 60% restante se distribuye en cascada por 4 niveles de prioridad
3. **Cascada Estricta**: Una prioridad solo recibe dinero si las anteriores están completadas

### Niveles de Prioridad

#### 🔴 PRIORIDAD 01 - Crítico
- Tarjetas de crédito (01, 02, ADS)
- Comida

#### 🟠 PRIORIDAD 02 - Importante
- Gimnasio
- Suplementación
- Jiujitsu
- Pago a padre

#### 🟡 PRIORIDAD 03 - Inversiones
- Membresías (Software, Knowledge)
- Inversiones en empresas (Bravium Emperium, SwissJust, Nexorus LLC, Airbnb, OFAI)

#### 🟢 PRIORIDAD 04 - Calidad de vida
- Regalos
- Ofrendas
- Viajes
- Estilo de vida

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Pantallas

### 1. Dashboard Principal
- Balance general con métricas clave
- Gráfico de torta: Distribución de ingresos por empresa
- Gráfico de barras: Comparación entre empresas
- Indicador destacado del Sagrado 40%

### 2. Sistema de Prioridades
- Vista completa de todas las categorías agrupadas por nivel
- Barras de progreso visuales para cada categoría
- Estado de cumplimiento (OK/PENDIENTE)
- Montos asignados, gastados y disponibles

### 3. Formulario de Ingreso
- Registro rápido de ingresos
- Campos: Fecha, Empresa, Método de Cobro, Tipo de Pago, Moneda, Monto, Descripción, Cliente
- Recálculo automático al guardar

### 4. Formulario de Gasto
- Registro rápido de gastos
- Campos: Fecha, Categoría, Método de Pago, Moneda, Monto, Descripción
- Recálculo automático al guardar

### 5. Historial de Transacciones
- Lista completa de ingresos y gastos
- Filtros avanzados: empresa, categoría, moneda, rango de fechas
- Opción de eliminar transacciones

## 💾 Almacenamiento de Datos

Los datos se guardan automáticamente en **localStorage** del navegador:

```javascript
{
  "finflow_ingresos": [...],
  "finflow_gastos": [...]
}
```

### Estructura de Ingreso
```javascript
{
  "id": "uuid",
  "fecha": "2025-01-15",
  "empresa": "SwissJust",
  "metodoCobro": "Efectivo ARS",
  "tipoPago": "Pago Completo",
  "moneda": "ARS",
  "monto": 45000,
  "descripcion": "Venta esencia",
  "cliente": "María García"
}
```

### Estructura de Gasto
```javascript
{
  "id": "uuid",
  "fecha": "2025-01-15",
  "categoria": "Comida",
  "metodoPago": "Efectivo ARS",
  "moneda": "ARS",
  "monto": 15000,
  "descripcion": "Supermercado"
}
```

## 🛠️ Tecnologías

- **React 18** - Framework de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Chart.js** - Gráficos interactivos
- **react-chartjs-2** - Integración de Chart.js con React
- **uuid** - Generación de IDs únicos
- **localStorage** - Persistencia de datos

## 📂 Estructura del Proyecto

```
finflow/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── SistemaPrioridades.jsx
│   │   ├── FormularioIngreso.jsx
│   │   ├── FormularioGasto.jsx
│   │   └── Historial.jsx
│   ├── data/
│   │   └── constants.js
│   ├── utils/
│   │   └── calculations.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Diseño

- **Mobile-first**: Optimizado para uso en móvil
- **Responsive**: Se adapta a tablets y desktop
- **Colores de Prioridad**:
  - Rojo (#dc2626): Crítico
  - Naranja (#ea580c): Importante
  - Amarillo (#ca8a04): Inversiones
  - Verde (#16a34a): Calidad de vida
- **Animaciones sutiles**: Transiciones suaves
- **Navegación intuitiva**: Barra inferior fija

## 🔧 Lógica de Cálculos

El archivo `src/utils/calculations.js` contiene toda la lógica del sistema de cascada:

1. Calcula el total de ingresos
2. Aparta el Sagrado 40% (SIEMPRE primero)
3. Calcula el disponible 60%
4. Distribuye en cascada por orden de prioridad
5. Para cada categoría: asignado = min(meta, dineroRestante)
6. Calcula porcentajes y estados

## 📊 Empresas y Categorías

### Fuentes de Ingreso (5)
- Bravium Emperium
- SwissJust
- Nexorus LLC
- Airbnb
- OFAI

### Categorías de Gastos (19)
Ver lista completa en `src/data/constants.js`

### Métodos de Cobro/Pago (9)
- Banco Patagonia
- Banco Galicia
- Mercado Pago
- Mercury
- Stripe
- Binance
- Efectivo ARS
- Efectivo USD
- Cuenta Just

## 📱 Uso Móvil

La aplicación está optimizada para uso móvil:
- Inputs de tamaño adecuado (16px mínimo)
- Dropdowns fáciles de usar
- Botones con área táctil grande
- Navegación con barra inferior fija
- Diseño responsive

## 🔒 Privacidad

Todos los datos se almacenan localmente en tu navegador. No se envía información a ningún servidor externo.

## 🤝 Contribuciones

Este es un proyecto personal. Si deseas adaptarlo a tus necesidades, siéntete libre de hacer fork y modificar.

## 📄 Licencia

Este proyecto es de uso personal.

---

**Creado con ❤️ para gestión financiera eficiente**
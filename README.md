# 🍵 Juyasia - Sistema de Gestión de Cafetería

Una aplicación React + TypeScript + Vite para gestionar una cafetería con control de inventario, ventas y administración.

## 🚀 Rutas de la Aplicación

### Página Principal
- **URL**: `/`
- **Descripción**: Página de selección de rol (Cajero/Administrador)

### Cajero
- **URL**: `/caja`
- **Descripción**: Interfaz para cajeros - gestión de ventas y pedidos

### Administrador
- **URL Base**: `/admin`

#### Sub-rutas del Administrador:
- `/admin/` → Redirige automáticamente a `/admin/productos`
- `/admin/productos` → Gestión de productos de venta
- `/admin/insumos` → Gestión de insumos de cafetería
- `/admin/equipos` → Gestión de equipos
- `/admin/cierre-caja` → Control de apertura/cierre de caja
- `/admin/reportes` → Reportes de ventas

## 🛠️ Tecnologías

- **React 19** con TypeScript
- **React Router DOM** para enrutamiento
- **Vite** como bundler
- **ESLint** para linting

## 📦 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── pages/           # Páginas principales
│   ├── Caja.tsx     # Interfaz de cajero
│   ├── admin.tsx    # Dashboard de administrador
│   ├── cierrecaja.tsx # Control de caja
│   ├── Inventario.tsx # Gestión de inventario
│   └── Reporte.tsx  # Reportes
├── hooks/           # Hooks personalizados
├── services/        # Servicios/API
├── styles/          # Estilos CSS
├── Components/      # Componentes reutilizables
└── App.tsx          # Configuración de rutas
```

## 🔧 Configuración de ESLint

Para aplicaciones de producción, se recomienda actualizar la configuración de ESLint para habilitar reglas de linting conscientes de tipos:

```js
// eslint.config.js
export default defineConfig([
  // Configuración existente...
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // o tseslint.configs.strictTypeChecked para reglas más estrictas
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

También puedes instalar plugins específicos de React:
- [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)
- [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

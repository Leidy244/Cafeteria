export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/login`,
  PRODUCTOS: `${API_BASE_URL}/productos`,
  PEDIDOS: `${API_BASE_URL}/pedidos`,
  VENTAS: `${API_BASE_URL}/ventas`,
  CAJA: `${API_BASE_URL}/caja`,
  CAJA_ESTADO: `${API_BASE_URL}/caja/estado`,
  CAJA_ABRIR: `${API_BASE_URL}/caja/abrir`,
  CAJA_CERRAR: (id: number) => `${API_BASE_URL}/caja/cerrar/${id}`,
  CAJA_RESUMEN: (id: number) => `${API_BASE_URL}/caja/resumen-turno/${id}`,
  REPORTE_BALANCE: `${API_BASE_URL}/reporte/balance-completo`,
  IMAGEN: (path: string) => `${API_BASE_URL}/imagenes/${path.replace('/imagenes/', '')}`,
} as const;

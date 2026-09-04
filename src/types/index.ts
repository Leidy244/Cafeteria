export interface Producto {
  id: number;
  nombre: string;
  precioIngreso: number;
  precioVenta: number;
  cantidad: number;
  descripcion: string;
  fecha: string;
  tipo: TipoProducto;
  subTipo: string;
  metodoPago: MetodoPago;
  imagen: string | null;
}

export type TipoProducto = 'venta' | 'insumo' | 'equipo';
export type MetodoPago = 'efectivo' | 'nequi';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface CarritoItem {
  id: number;
  nombre: string;
  precioVenta: number;
  cantidad: number;
  imagen: string | null;
  subTipo: string;
  tipo: TipoProducto;
}

export interface Pedido {
  id: number;
  mesa: string | number;
  total: number;
  carrito: CarritoItem[];
  estado: 'pendiente' | 'pagado';
}

export interface VentaData {
  carrito: CarritoItem[];
  total: number;
  mesa: string;
  metodoPago: MetodoPago;
  turnoId: number;
  montoRecibido: number;
}

export interface CajaInfo {
  id: number;
  estado: 'abierto' | 'cerrado';
  montoInicial: number;
  montoNequi: number;
  fechaApertura: string;
}

export interface ResumenCaja {
  productos: number;
  insumos: number;
  equipos: number;
  efectivo: number;
  nequi: number;
  totalAcumulado: number;
  saldoNequiActual: number;
  gastosEfectivo: number;
  gastosNequi: number;
}

export interface Usuario {
  id: number;
  correo: string;
  rol: 'admin' | 'cajero';
  nombre?: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token?: string;
}

export interface ReporteVenta {
  nombre: string;
  metodoPago: string;
  metodo_pago?: string;
  cant: number;
  subtotal: number;
}

export interface ReporteGasto {
  nombre: string;
  nombreGasto?: string;
  metodoPago: string;
  metodo_pago?: string;
  tipo: string;
  total: number;
  monto?: number;
}

export interface ReporteData {
  ventas: ReporteVenta[];
  gastos: ReporteGasto[];
  totalVentas: number;
  totalGastos: number;
  utilidadNeta: number;
}

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ApiError {
  error: string;
}

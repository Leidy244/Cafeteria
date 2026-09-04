import api from './api';
import type { CajaInfo, ResumenCaja } from '../types';
import { API_ENDPOINTS } from '../config/api';

const emptyResumen: ResumenCaja = {
  productos: 0, insumos: 0, equipos: 0,
  efectivo: 0, nequi: 0, totalAcumulado: 0,
  saldoNequiActual: 0, gastosEfectivo: 0, gastosNequi: 0,
};

export const cashRegisterService = {
  async getEstado(): Promise<CajaInfo | null> {
    try {
      const { data } = await api.get<CajaInfo>(API_ENDPOINTS.CAJA_ESTADO);
      return data;
    } catch {
      return null;
    }
  },

  async getResumen(turnoId: number): Promise<ResumenCaja> {
    try {
      const { data } = await api.get<ResumenCaja>(API_ENDPOINTS.CAJA_RESUMEN(turnoId));
      return data;
    } catch {
      return emptyResumen;
    }
  },

  async abrir(montoInicial: number, montoNequi: number): Promise<boolean> {
    const { data } = await api.post<{ id?: number }>(API_ENDPOINTS.CAJA_ABRIR, { montoInicial, montoNequi });
    return !!data.id;
  },

  async cerrar(id: number): Promise<boolean> {
    const { data } = await api.put<{ success: boolean }>(API_ENDPOINTS.CAJA_CERRAR(id));
    return !!data.success;
  },
};

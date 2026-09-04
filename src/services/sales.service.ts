import api from './api';
import type { VentaData } from '../types';
import { API_ENDPOINTS } from '../config/api';

export const salesService = {
  async create(venta: VentaData): Promise<boolean> {
    try {
      await api.post(API_ENDPOINTS.VENTAS, venta);
      return true;
    } catch {
      return false;
    }
  },

  async checkCajaAbierta(): Promise<{ id: number; estado: string } | null> {
    try {
      const { data } = await api.get<{ id: number; estado: string }>(API_ENDPOINTS.CAJA_ESTADO);
      return data;
    } catch {
      return null;
    }
  },
};

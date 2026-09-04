import api from './api';
import type { ReporteData } from '../types';
import { API_ENDPOINTS } from '../config/api';

export const reportsService = {
  async getBalanceCompleto(): Promise<ReporteData | null> {
    try {
      const { data } = await api.get<ReporteData>(API_ENDPOINTS.REPORTE_BALANCE);
      return data;
    } catch {
      return null;
    }
  },
};

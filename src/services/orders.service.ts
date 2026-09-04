import api from './api';
import type { Pedido } from '../types';
import { API_ENDPOINTS } from '../config/api';

export const ordersService = {
  async getAll(): Promise<Pedido[]> {
    try {
      const { data } = await api.get<Pedido[]>(API_ENDPOINTS.PEDIDOS);
      return data;
    } catch {
      return [];
    }
  },

  async create(pedido: Omit<Pedido, 'id'>): Promise<Pedido | null> {
    try {
      const { data } = await api.post<Pedido>(API_ENDPOINTS.PEDIDOS, pedido);
      return data;
    } catch {
      return null;
    }
  },

  async update(id: number, pedido: Partial<Pedido>): Promise<boolean> {
    const { data } = await api.put<Pedido>(`${API_ENDPOINTS.PEDIDOS}/${id}`, pedido);
    return !!data;
  },
};

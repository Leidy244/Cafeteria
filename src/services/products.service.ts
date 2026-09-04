import api from './api';
import type { Producto } from '../types';
import { API_ENDPOINTS } from '../config/api';

export const productService = {
  async getAll(): Promise<Producto[]> {
    const { data } = await api.get<Producto[]>(API_ENDPOINTS.PRODUCTOS);
    return data;
  },

  async create(formData: FormData) {
    const { data } = await api.post(API_ENDPOINTS.PRODUCTOS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: number, formData: FormData) {
    const { data } = await api.put(`${API_ENDPOINTS.PRODUCTOS}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async delete(id: number) {
    await api.delete(`${API_ENDPOINTS.PRODUCTOS}/${id}`);
  },
};

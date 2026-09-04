import api from './api';
import type { LoginResponse } from '../types';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, {
      correo,
      contrasena,
    });
    return data;
  },
};

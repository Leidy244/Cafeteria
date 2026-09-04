import { useCallback } from 'react';
import { useCashRegister } from '../contexts';

export const useCaja = () => {
  const {
    cajaInfo, resumen, isLoading: cargando,
    refrescar, abrirCaja: abrir, cerrarCaja: cerrar,
  } = useCashRegister();

  const abrirCaja = useCallback(
    async (montoInicial: number, montoNequi: number) => {
      const ok = await abrir(montoInicial, montoNequi);
      return { success: ok };
    },
    [abrir]
  );

  const cerrarCaja = useCallback(
    async (idCaja: number) => {
      const ok = await cerrar(idCaja);
      return { success: ok };
    },
    [cerrar]
  );

  return { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar };
};

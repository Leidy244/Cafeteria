import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CajaInfo, ResumenCaja } from '../types';
import { cashRegisterService } from '../services';

interface CashRegisterContextValue {
  cajaInfo: CajaInfo | null;
  resumen: ResumenCaja;
  isLoading: boolean;
  isOpen: boolean;
  refrescar: () => Promise<void>;
  abrirCaja: (montoInicial: number, montoNequi: number) => Promise<boolean>;
  cerrarCaja: (id: number) => Promise<boolean>;
}

const emptyResumen: ResumenCaja = {
  productos: 0, insumos: 0, equipos: 0,
  efectivo: 0, nequi: 0, totalAcumulado: 0,
  saldoNequiActual: 0, gastosEfectivo: 0, gastosNequi: 0,
};

const CashRegisterContext = createContext<CashRegisterContextValue | null>(null);

export function CashRegisterProvider({ children }: { children: ReactNode }) {
  const [cajaInfo, setCajaInfo] = useState<CajaInfo | null>(null);
  const [resumen, setResumen] = useState<ResumenCaja>(emptyResumen);
  const [isLoading, setIsLoading] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      const info = await cashRegisterService.getEstado();
      if (!info || info.estado !== 'abierto') {
        setCajaInfo(null);
        setResumen(emptyResumen);
        return;
      }
      setCajaInfo(info);
      const data = await cashRegisterService.getResumen(info.id);
      setResumen({
        productos: Number(data.productos || 0),
        insumos: Number(data.insumos || 0),
        equipos: Number(data.equipos || 0),
        efectivo: Number(data.efectivo || 0),
        nequi: Number(data.nequi || 0),
        totalAcumulado:
          Number(info.montoInicial || 0) + Number(data.efectivo || 0) - Number(data.gastosEfectivo || 0),
        saldoNequiActual:
          Number(info.montoNequi || 0) + Number(data.nequi || 0) - Number(data.gastosNequi || 0),
        gastosEfectivo: Number(data.gastosEfectivo || 0),
        gastosNequi: Number(data.gastosNequi || 0),
      });
    } catch (err) {
      console.error('Error al actualizar balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const abrirCaja = useCallback(
    async (montoInicial: number, montoNequi: number) => {
      const ok = await cashRegisterService.abrir(montoInicial, montoNequi);
      if (ok) await refrescar();
      return ok;
    },
    [refrescar]
  );

  const cerrarCaja = useCallback(
    async (id: number) => {
      const ok = await cashRegisterService.cerrar(id);
      if (ok) {
        setCajaInfo(null);
        setResumen(emptyResumen);
        await refrescar();
      }
      return ok;
    },
    [refrescar]
  );

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const isOpen = cajaInfo?.estado === 'abierto';

  const value = useMemo(
    () => ({ cajaInfo, resumen, isLoading, isOpen, refrescar, abrirCaja, cerrarCaja }),
    [cajaInfo, resumen, isLoading, isOpen, refrescar, abrirCaja, cerrarCaja]
  );

  return <CashRegisterContext.Provider value={value}>{children}</CashRegisterContext.Provider>;
}

export function useCashRegister(): CashRegisterContextValue {
  const ctx = useContext(CashRegisterContext);
  if (!ctx) throw new Error('useCashRegister must be used within CashRegisterProvider');
  return ctx;
}

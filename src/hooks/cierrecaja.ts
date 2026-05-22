import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/caja';

export interface ResumenCaja {
  productos: number;
  insumos: number;
  equipos: number;
  efectivo: number;
  nequi: number;
  totalAcumulado: number;
  saldoNequiActual: number;
}

export const useCaja = () => {
  const [cajaInfo, setCajaInfo] = useState<any>(null);
  const [resumen, setResumen] = useState<ResumenCaja>({
    productos: 0, insumos: 0, equipos: 0, efectivo: 0, nequi: 0, totalAcumulado: 0, saldoNequiActual: 0
  });
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/estado`);
      
      // Si no hay caja abierta (404), reseteamos todo a cero
      if (res.status === 404) {
        setCajaInfo(null);
        setResumen({ productos: 0, insumos: 0, equipos: 0, efectivo: 0, nequi: 0, totalAcumulado: 0, saldoNequiActual: 0 });
        return;
      }

      const data = await res.json();

      if (data && data.estado === 'abierto') {
        setCajaInfo(data);
        const turnoId = data.id;

        // Pedimos el resumen detallado al backend
        const resResumen = await fetch(`${API_BASE}/resumen-turno/${turnoId}`);
        const dataResumen = await resResumen.json();

        setResumen({
          productos: Number(dataResumen.productos || 0),
          insumos: Number(dataResumen.insumos || 0),
          equipos: Number(dataResumen.equipos || 0),
          efectivo: Number(dataResumen.efectivo || 0),
          nequi: Number(dataResumen.nequi || 0),
          
          // BALANCE EFECTIVO: Base + Ventas Efectivo - Gastos Efectivo
          totalAcumulado: (Number(data.montoInicial || 0) + Number(dataResumen.efectivo || 0)) -
                          (Number(dataResumen.gastosEfectivo || 0)), 
          
          // BALANCE NEQUI: Base + Ventas Nequi - Gastos Nequi
          saldoNequiActual: (Number(data.montoNequi || 0) + Number(dataResumen.nequi || 0)) - 
                            (Number(dataResumen.gastosNequi || 0))
        });
      }
    } catch (err) {
      console.error("Error al actualizar balance:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const abrirCaja = async (montoInicial: number, montoNequi: number) => {
    try {
      const res = await fetch(`${API_BASE}/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoInicial, montoNequi }),
      });
      const data = await res.json();
      if (data.id) {
        await refrescar(); 
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error al abrir caja:", error);
      return { success: false };
    }
  };

  const cerrarCaja = async (idCaja: number) => {
    try {
      const res = await fetch(`${API_BASE}/cerrar/${idCaja}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);

      await res.json();
      setCajaInfo(null);
      setResumen({ productos: 0, insumos: 0, equipos: 0, efectivo: 0, nequi: 0, totalAcumulado: 0, saldoNequiActual: 0 });
      await refrescar();
      return { success: true };

    } catch (error) {
      console.error("Error al cerrar:", error);
      return { success: false };
    }
  };

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  return { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar };
};
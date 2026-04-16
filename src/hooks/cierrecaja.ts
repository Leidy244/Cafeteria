import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/caja'; 

export interface ResumenCaja {
  productos: number;
  insumos: number;
  equipos: number;
  efectivo: number;
  nequi: number;
  totalAcumulado: number;
}

export const useCaja = () => {
  const [cajaInfo, setCajaInfo] = useState<any>(null);
  const [resumen, setResumen] = useState<ResumenCaja>({
    productos: 0, insumos: 0, equipos: 0, efectivo: 0, nequi: 0, totalAcumulado: 0
  });
  const [cargando, setCargando] = useState(true);
const refrescar = useCallback(async () => {
  try {
    const res = await fetch(`${API_BASE}/estado`);
    if (res.status === 404) { setCajaInfo(null); return; }
    const data = await res.json();

    if (data && data.estado === 'abierto') {
      setCajaInfo(data);
      const turnoId = data.id;

      // Pedimos los totales de ventas y gastos al servidor
      const [resPagos, resTipos] = await Promise.all([
        fetch(`http://localhost:3001/ventas/resumen-pagos/${turnoId}`).then(r => r.json()),
        fetch(`http://localhost:3001/ventas/resumen-cierre/${turnoId}`).then(r => r.json())
      ]);

      setResumen({
        productos: Number(resTipos.venta || 0),
        insumos: Number(resTipos.insumo || 0),   // <--- Aquí se cargan los gastos
        equipos: Number(resTipos.equipo || 0),   // <--- Aquí se cargan los gastos
        efectivo: Number(resPagos.efectivo || 0), 
        nequi: Number(resPagos.nequi || 0),
        totalAcumulado: (Number(data.montoInicial || 0) + Number(resPagos.efectivo || 0)) - (Number(resTipos.insumo || 0) + Number(resTipos.equipo || 0))
      });
    }
  } catch (err) {
    console.error("Error al actualizar balance:", err);
  } finally {
    setCargando(false);
  }}, []);

  const abrirCaja = async (montoInicial: number) => {
    try {
      const res = await fetch(`${API_BASE}/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montoInicial })
      });
      const data = await res.json();
      if (res.ok) {
        await refrescar(); 
        return { success: true };
      }
      return { success: false, msg: data.message };
    } catch (err) {
      return { success: false, msg: "Error de conexión" };
    }
  };

  const cerrarCaja = async (id: number, montoFinal: number) => {
    try {
      const res = await fetch(`${API_BASE}/cerrar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, montoFinal })
      });
      if (res.ok) {
        await refrescar();
        return { success: true };
      }
      const errorData = await res.json();
      return { success: false, msg: errorData.message };
    } catch (err) {
      return { success: false, msg: "Error de conexión" };
    }
  };

  // UN SOLO useEffect es suficiente para cargar todo al inicio
  useEffect(() => {
    refrescar();
  }, [refrescar]);

  
  return { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar};
};
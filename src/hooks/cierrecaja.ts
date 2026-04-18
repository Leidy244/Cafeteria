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
    if (res.status === 404) {
      setCajaInfo(null);
      setResumen({ productos: 0, insumos: 0, equipos: 0, efectivo: 0, nequi: 0, totalAcumulado: 0 });
      return; }
      const data = await res.json();

      if (data && data.estado === 'abierto') {
        setCajaInfo(data);
        const turnoId = data.id;

        const resResumen = await fetch(`http://localhost:3001/caja/resumen-turno/${turnoId}`);
        const dataResumen = await resResumen.json();

        setResumen({
          productos: Number(dataResumen.productos || 0),
          insumos: Number(dataResumen.insumos || 0),
          equipos: Number(dataResumen.equipos || 0),
          efectivo: Number(dataResumen.efectivo || 0),
          nequi: Number(dataResumen.nequi || 0),

          // CORRECCIÓN AQUÍ: 
          // Usamos 'efectivo' en lugar de 'productos' para el total físico (amarillo)
          totalAcumulado: (Number(data.montoInicial || 0) + Number(dataResumen.efectivo || 0)) -
            (Number(dataResumen.insumos || 0) + Number(dataResumen.equipos || 0))
        });
      }
    } catch (err) {
      console.error("Error al actualizar balance:", err);
    } finally {
      setCargando(false);
    }
  }, []);

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
  // En tu hook useCaja o donde tengas cerrarCaja (Línea 70 aprox)
  const cerrarCaja = async (idCaja: number) => {
    try {
      const res = await fetch(`http://localhost:3001/caja/cerrar/${idCaja}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      // Verificamos si la respuesta es correcta antes de intentar leer el JSON
      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.status}`);
      }

      const data = await res.json();
      alert("Caja cerrada con éxito ✅");

      return { success: true, data }; // Ahora sí devolvemos el objeto con 'success'

    } catch (error) {
      console.error("Error al cerrar:", error);
      alert("No se pudo cerrar la caja. Revisa la conexión con el servidor.");
      return { success: false, msg: "Error de conexión" }; // Devolvemos algo seguro
    } finally {
      // Reiniciamos todo localmente para que la app siga funcionando
      setCajaInfo(null);
      setResumen({ productos: 0, insumos: 0, equipos: 0, efectivo: 0, nequi: 0, totalAcumulado: 0 });
      await refrescar();
    }
  };


  // UN SOLO useEffect es suficiente para cargar todo al inicio
  useEffect(() => {
    refrescar();
  }, [refrescar]);


  return { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar };
};
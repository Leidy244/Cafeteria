import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const API_BASE = "http://localhost:3001";

export const useReporte = () => {
  const [data, setData] = useState<any>(null);

  const obtenerReporte = async () => {
    try {
      const res = await fetch(`${API_BASE}/reporte/balance-completo`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error al obtener reporte:", error);
    }
  };

  useEffect(() => {
    obtenerReporte();
  }, []);

 const exportarExcel = () => {
  if (!data) return;

  // 1. Formatear Ventas (Ingresos) - ¡Asegúrate de que esta variable esté aquí!
  const ventasFormateadas = data.ventas.map((v: any) => ({
    "Categoría": "INGRESO",
    "Concepto": v.nombre,
    "Método": (v.metodoPago || v.metodo_pago || "Efectivo").toUpperCase(),
    "Cant": v.cant,
    "Total": Number(v.subtotal) || 0
  }));

  // 2. Formatear Gastos (Egresos) - Con la limpieza de "COMPRA: "
  const gastosFormateados = data.gastos.map((g: any) => ({
    "Categoría": "EGRESO",
    "Concepto": (g.nombreGasto || g.nombre || "Gasto").replace("COMPRA: ", ""),
    "Método": (g.metodoPago || g.metodo_pago || "Efectivo").toUpperCase(),
    "Cant": 1,
    "Total": -(Number(g.total || g.monto) || 0)
  }));

  // 3. ORGANIZAR POR GRUPOS (Esto es lo que te da error si lo de arriba falta)
  const gastosNequi = gastosFormateados.filter((g: any) => g.Método === 'NEQUI');
  const gastosEfectivo = gastosFormateados.filter((g: any) => g.Método === 'EFECTIVO');

  const ingresosNequi = ventasFormateadas.filter((v: any) => v.Método === 'NEQUI');
  const ingresosEfectivo = ventasFormateadas.filter((v: any) => v.Método === 'EFECTIVO');

  // 4. UNIR TODO EN EL ORDEN SOLICITADO
  const reporteFinal = [
    ...gastosNequi,
    ...gastosEfectivo,
    {}, // Espacio separador
    ...ingresosNequi,
    ...ingresosEfectivo,
    {}, // Espacio separador
    { "Concepto": "TOTAL VENTAS", "Total": Number(data.totalVentas) || 0 },
    { "Concepto": "TOTAL GASTOS", "Total": -(Number(data.totalGastos) || 0) },
    { "Concepto": "UTILIDAD NETA", "Total": Number(data.utilidadNeta) || 0 }
  ];

  // 5. Generar el archivo XLSX (Asegúrate de tener importado * as XLSX from 'xlsx')
  const ws = XLSX.utils.json_to_sheet(reporteFinal);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `Reporte_Juyasia_${new Date().toLocaleDateString()}.xlsx`);
};

  return { data, exportarExcel };
};
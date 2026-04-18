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

    // 1. Formateamos las ventas para el Excel
    const filasVentas = data.ventas.map((v: any) => ({
      "Categoría": "INGRESO",
      "Concepto/Producto": v.nombre,
      "Cantidad": v.cant,
      "Total": v.subtotal
    }));

    // 2. Formateamos los gastos
   const filasGastos = data.gastos.map((g: any) => ({
  "Categoría": "EGRESO",
  "Nombre/Insumo": g.nombreGasto || g.nombre, 
  "Tipo": g.tipo,
  "Total": -g.monto
}));

    // 3. Unimos todo y añadimos una fila de Balance Final
    const consolidado = [
      ...filasVentas,
      {}, // Fila vacía separadora
      ...filasGastos,
      {},
      { "Concepto/Producto": "TOTAL VENTAS", "Total": data.totalVentas },
      { "Concepto/Producto": "TOTAL GASTOS", "Total": -data.totalGastos },
      { "Concepto/Producto": "UTILIDAD NETA", "Total": data.utilidadNeta }
    ];

    const ws = XLSX.utils.json_to_sheet(consolidado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance Juyasia");

    XLSX.writeFile(wb, `Reporte_Juyasia_${new Date().toLocaleDateString()}.xlsx`);
  };

  return { data, exportarExcel };
};
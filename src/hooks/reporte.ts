import { useEffect, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { ReporteData } from '../types';
import { reportsService } from '../services';

export const useReporte = () => {
  const [data, setData] = useState<ReporteData | null>(null);

  const obtenerReporte = useCallback(async () => {
    const result = await reportsService.getBalanceCompleto();
    if (result) setData(result);
  }, []);

  useEffect(() => {
    obtenerReporte();
  }, [obtenerReporte]);

  const exportarExcel = useCallback(() => {
    if (!data) return;

    const ventasFormateadas = data.ventas.map((v) => ({
      Categoría: 'INGRESO',
      Concepto: v.nombre,
      Método: (v.metodoPago || v.metodo_pago || 'Efectivo').toUpperCase(),
      Cant: v.cant,
      Total: Number(v.subtotal) || 0,
    }));

    const gastosFormateados = data.gastos.map((g) => ({
      Categoría: 'EGRESO',
      Concepto: (g.nombreGasto || g.nombre || 'Gasto').replace('COMPRA: ', ''),
      Método: (g.metodoPago || g.metodo_pago || 'Efectivo').toUpperCase(),
      Cant: 1,
      Total: -(Number(g.total || g.monto) || 0),
    }));

    const gastosNequi = gastosFormateados.filter((g) => g.Método === 'NEQUI');
    const gastosEfectivo = gastosFormateados.filter((g) => g.Método === 'EFECTIVO');
    const ingresosNequi = ventasFormateadas.filter((v) => v.Método === 'NEQUI');
    const ingresosEfectivo = ventasFormateadas.filter((v) => v.Método === 'EFECTIVO');

    const reporteFinal = [
      ...gastosNequi, ...gastosEfectivo, {},
      ...ingresosNequi, ...ingresosEfectivo, {},
      { Concepto: 'TOTAL VENTAS', Total: Number(data.totalVentas) || 0 },
      { Concepto: 'TOTAL GASTOS', Total: -(Number(data.totalGastos) || 0) },
      { Concepto: 'UTILIDAD NETA', Total: Number(data.utilidadNeta) || 0 },
    ];

    const ws = XLSX.utils.json_to_sheet(reporteFinal);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `Reporte_Juyasia_${new Date().toLocaleDateString()}.xlsx`);
  }, [data]);

  return { data, exportarExcel };
};

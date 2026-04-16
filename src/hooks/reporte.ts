import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";

export const useReporte = () => {
  const [data, setData] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);

  const obtenerReporte = async () => {
    try {
      const res = await fetch(`${API_BASE}/reporte`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error al obtener reporte:", error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API_BASE}/productos`);
      const json = await res.json();
      setProductos(json);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerReporte();
    obtenerProductos();
  }, []);

  const getPrecioVenta = (nombreProducto: string) => {
    const producto = productos.find(p => p.nombre === nombreProducto);
    return producto ? Number(producto.precioVenta) : 0;
  };

  const calcularTotalVenta = (nombreProducto: string, cantidadVendida: number) => {
    const precioVenta = getPrecioVenta(nombreProducto);
    return precioVenta * cantidadVendida;
  };

  return {
    data,
    calcularTotalVenta
  };
};
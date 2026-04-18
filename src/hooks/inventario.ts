import { useState, useEffect } from "react";

const API_URL = "http://localhost:3001/productos";

export const useInventario = () => {
  const [nombre, setNombre] = useState("");
  const [precioIngreso, setPrecioIngreso] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [lista, setLista] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const obtenerProductos = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener datos");
      const data = await res.json();
      setLista(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setPrecioIngreso("");
    setPrecioVenta("");
    setCantidad("");
    setDescripcion("");
    setImagen(null);
    setEditandoId(null);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const guardarProducto = async (tipoActual: string) => {
    if (!nombre.trim() || !precioIngreso || !tipoActual) {
      alert("⚠️ El nombre, precio de costo y tipo son obligatorios.");
      return;
    }

    // 1. Obtener el turnoId antes de enviar nada
    let turnoIdActivo = null;
    try {
      const resCaja = await fetch("http://localhost:3001/caja/estado");
      const dataCaja = await resCaja.json();
      if (dataCaja && dataCaja.estado === "abierto") {
        turnoIdActivo = dataCaja.id;
      }
    } catch (e) {
      console.error("Caja cerrada o error de conexión");
    }// ... dentro de guardarProducto
const formData = new FormData();
formData.append("nombre", nombre.trim());

// IMPORTANTE: Enviamos el precio unitario
formData.append("precioIngreso", precioIngreso.toString());

// ENVIAMOS LA CANTIDAD: 
// Si el usuario no pone nada, enviamos "1" por defecto para que el cálculo no dé 0
const cantidadFinal = cantidad && Number(cantidad) > 0 ? cantidad.toString() : "1";
formData.append("cantidad", cantidadFinal);

formData.append("precioVenta", precioVenta || "0");
formData.append("descripcion", descripcion || "");
formData.append("tipo", tipoActual.toLowerCase().trim());

// Enviamos el turnoId para que el backend sepa a qué caja restar el dinero
if (turnoIdActivo) {
  formData.append("turnoId", turnoIdActivo.toString());
}

    if (imagen) {
      formData.append("imagen", imagen);
    }

    setCargando(true);
    try {
      const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        // IMPORTANTE: No agregar Headers aquí, el navegador lo hace solo con FormData
        body: formData,
      });

      if (res.ok) {
        alert(`✅ ${tipoActual} guardado con éxito`);
        limpiarFormulario();
        await obtenerProductos(); 
      } else {
        const errorData = await res.json();
        alert("❌ Error 400: " + (errorData.error || "Datos inválidos"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este registro?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const cargarDatosEdicion = (producto: any) => {
    setNombre(producto.nombre);
    setPrecioIngreso(producto.precioIngreso.toString());
    setPrecioVenta(producto.precioVenta?.toString() || "");
    setCantidad(producto.cantidad?.toString() || "");
    setDescripcion(producto.descripcion || "");
    setEditandoId(producto.id);
  };

  return {
    states: { nombre, precioIngreso, precioVenta, cantidad, descripcion, imagen, editandoId, lista, cargando },
    setters: { setNombre, setPrecioIngreso, setPrecioVenta, setCantidad, setDescripcion, setImagen },
    actions: { guardarProducto, eliminarProducto, cargarDatosEdicion, limpiarFormulario }
  };
};
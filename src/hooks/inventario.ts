import { useState, useEffect } from "react";
import axios from "axios";

// Función global para mostrar notificaciones (la vamos a crear)
let showToastGlobal: ((message: string, type: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

export const setToastHandler = (handler: typeof showToastGlobal) => {
  showToastGlobal = handler;
};

const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  if (showToastGlobal) {
    showToastGlobal(message, type);
  } else {
    // Fallback por si no está el handler
    alert(message);
  }
};

export function useInventario() {
  const [lista, setLista] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [precioIngreso, setPrecioIngreso] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [subTipoInsumo, setSubTipoInsumo] = useState("general");
  const [imagen, setImagen] = useState<File | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const API_URL = "http://localhost:3001/productos";

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      setLista(res.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      showNotification("Error al cargar los productos", "error");
    }
  };

  const guardarProducto = async (tipo: string) => {
    // Validaciones básicas
    if (!nombre.trim()) {
      showNotification("Por favor ingresa el nombre del producto", "warning");
      return;
    }
    
    if (!precioIngreso || Number(precioIngreso) <= 0) {
      showNotification("Por favor ingresa un costo unitario válido", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("precioIngreso", precioIngreso);
      formData.append("precioVenta", precioVenta || "0");
      formData.append("cantidad", cantidad);
      formData.append("descripcion", descripcion);
      formData.append("tipo", tipo);
      formData.append("subTipo", subTipoInsumo);
      formData.append("metodoPago", metodoPago);
      if (imagen) formData.append("imagen", imagen);

      let response;
      if (editandoId) {
        response = await axios.put(`${API_URL}/${editandoId}`, formData);
        showNotification("✅ Actualizado correctamente", "success");
      } else {
        response = await axios.post(API_URL, formData);
        showNotification("✅ Guardado correctamente", "success");
      }

      limpiarFormulario();
      obtenerProductos();
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Error al guardar:", error);
      const errorMsg = error.response?.data?.error || "Error al guardar. Intenta nuevamente.";
      showNotification(errorMsg, "error");
      return { success: false, error: errorMsg };
    }
  };

  const cargarDatosEdicion = (item: any) => {
    setEditandoId(item.id);
    setNombre(item.nombre);
    setPrecioIngreso(item.precioIngreso?.toString() || "");
    setPrecioVenta(item.precioVenta?.toString() || "");
    setCantidad(item.cantidad?.toString() || "");
    setDescripcion(item.descripcion || "");
    setSubTipoInsumo(item.subTipo || "general");
    setMetodoPago(item.metodoPago || "efectivo");
    showNotification("Cargando datos para editar", "info");
  };

  const eliminarProducto = async (id: number) => {
    // Usamos confirm nativo (ese no se puede estilizar fácilmente)
    // Pero podemos crear un modal personalizado después
    if (!window.confirm("¿Estás seguro de eliminar este item?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      showNotification("🗑️ Eliminado correctamente", "success");
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showNotification("Error al eliminar el item", "error");
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setPrecioIngreso("");
    setPrecioVenta("");
    setCantidad("");
    setDescripcion("");
    setSubTipoInsumo("general");
    setMetodoPago("efectivo");
    setImagen(null);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return {
    states: {
      lista,
      nombre,
      precioIngreso,
      precioVenta,
      cantidad,
      descripcion,
      metodoPago,
      subTipoInsumo,
      imagen,
      editandoId,
    },
    setters: {
      setNombre,
      setPrecioIngreso,
      setPrecioVenta,
      setCantidad,
      setDescripcion,
      setMetodoPago,
      setSubTipoInsumo,
      setImagen,
    },
    actions: {
      guardarProducto,
      eliminarProducto,
      cargarDatosEdicion,
      limpiarFormulario,
    },
  };
}
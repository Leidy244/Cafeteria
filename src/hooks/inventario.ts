import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../pages/toast";

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
      showToast("Error al cargar los productos", "error");
    }
  };

  const guardarProducto = async (tipo: string) => {
    if (!nombre.trim()) {
      showToast("Por favor ingresa el nombre del producto", "warning");
      return;
    }
    if (!precioIngreso || Number(precioIngreso) <= 0) {
      showToast("Por favor ingresa un costo unitario válido", "warning");
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
        showToast("✅ Actualizado correctamente", "success");
      } else {
        response = await axios.post(API_URL, formData);
        showToast("✅ Guardado correctamente", "success");
      }

      limpiarFormulario();
      obtenerProductos();
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Error al guardar:", error);
      const errorMsg = error.response?.data?.error || "Error al guardar. Intenta nuevamente.";
      showToast(errorMsg, "error");
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
    showToast("Cargando datos para editar", "info");
  };

  // ← SIN window.confirm, la confirmación la maneja el componente
  const eliminarProducto = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      showToast("🗑️ Eliminado correctamente", "success");
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showToast("Error al eliminar el item", "error");
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
      lista, nombre, precioIngreso, precioVenta,
      cantidad, descripcion, metodoPago,
      subTipoInsumo, imagen, editandoId,
    },
    setters: {
      setNombre, setPrecioIngreso, setPrecioVenta,
      setCantidad, setDescripcion, setMetodoPago,
      setSubTipoInsumo, setImagen,
    },
    actions: {
      guardarProducto,
      eliminarProducto,
      cargarDatosEdicion,
      limpiarFormulario,
    },
  };
}
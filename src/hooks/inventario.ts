import { useState, useEffect } from "react";
import axios from "axios";

export function useInventario() {
  const [lista, setLista] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [precioIngreso, setPrecioIngreso] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [subTipoInsumo, setSubTipoInsumo] = useState("general"); // 'general', 'pulpa' o el Nombre de la pulpa
  const [imagen, setImagen] = useState<File | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const API_URL = "http://localhost:3001/productos";

  // Cargar productos al iniciar
  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      setLista(res.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const guardarProducto = async (tipo: string) => {
    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("precioIngreso", precioIngreso);
      formData.append("precioVenta", precioVenta || "0");
      formData.append("cantidad", cantidad);
      formData.append("descripcion", descripcion);
      formData.append("tipo", tipo);
      formData.append("subTipo", subTipoInsumo); // ✨ CRUCIAL: Envía la relación
      formData.append("metodoPago", metodoPago);
      if (imagen) formData.append("imagen", imagen);

      if (editandoId) {
        await axios.put(`${API_URL}/${editandoId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

      limpiarFormulario();
      obtenerProductos();
      alert("✅ Guardado correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al guardar. Revisa la consola.");
    }
  };

  const cargarDatosEdicion = (item: any) => {
    setEditandoId(item.id);
    setNombre(item.nombre);
    setPrecioIngreso(item.precioIngreso.toString());
    setPrecioVenta(item.precioVenta.toString());
    setCantidad(item.cantidad.toString());
    setDescripcion(item.descripcion || "");
    setSubTipoInsumo(item.subTipo || "general");
  };

  const eliminarProducto = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este item?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
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
    setImagen(null);
    // Limpiar input de archivo físicamente
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
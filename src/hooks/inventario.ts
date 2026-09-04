import { useState, useEffect, useCallback } from 'react';
import type { Producto, TipoProducto, MetodoPago } from '../types';
import { productService } from '../services';
import { useToast } from '../contexts';

export function useInventario() {
  const { showToast } = useToast();
  const [lista, setLista] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [precioIngreso, setPrecioIngreso] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [subTipoInsumo, setSubTipoInsumo] = useState('general');
  const [imagen, setImagen] = useState<File | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const obtenerProductos = useCallback(async () => {
    try {
      const data = await productService.getAll();
      setLista(data);
    } catch {
      showToast('Error al cargar los productos', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    obtenerProductos();
  }, [obtenerProductos]);

  const guardarProducto = useCallback(
    async (tipo: TipoProducto) => {
      if (!nombre.trim()) { showToast('Por favor ingresa el nombre del producto', 'warning'); return; }
      if (!precioIngreso || Number(precioIngreso) <= 0) { showToast('Por favor ingresa un costo unitario válido', 'warning'); return; }
      if ((tipo === 'insumo' || tipo === 'equipo') && !fecha) { showToast('Por favor ingresa la fecha de registro', 'warning'); return; }

      try {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('precioIngreso', precioIngreso);
        formData.append('precioVenta', precioVenta || '0');
        formData.append('cantidad', cantidad || '0');
        formData.append('descripcion', tipo === 'venta' ? (descripcion || '') : fecha);
        formData.append('fecha', fecha);
        formData.append('tipo', tipo);
        formData.append('subTipo', subTipoInsumo);
        formData.append('metodoPago', metodoPago);
        if (imagen) formData.append('imagen', imagen);

        if (editandoId) {
          await productService.update(editandoId, formData);
          showToast('Actualizado correctamente', 'success');
        } else {
          await productService.create(formData);
          showToast('Guardado correctamente', 'success');
        }
        limpiarFormulario();
        await obtenerProductos();
        return { success: true };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error al guardar';
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    },
    [nombre, precioIngreso, precioVenta, cantidad, descripcion, fecha, metodoPago, subTipoInsumo, imagen, editandoId, obtenerProductos, showToast]
  );

  const cargarDatosEdicion = useCallback((item: Producto) => {
    setEditandoId(item.id);
    setNombre(item.nombre);
    setPrecioIngreso(item.precioIngreso?.toString() || '');
    setPrecioVenta(item.precioVenta?.toString() || '');
    setCantidad(item.cantidad?.toString() || '');
    setDescripcion(item.descripcion || '');
    setFecha(item.fecha || (item.tipo !== 'venta' ? item.descripcion : '') || '');
    setSubTipoInsumo(item.subTipo || 'general');
    setMetodoPago(item.metodoPago || 'efectivo');
    showToast('Cargando datos para editar', 'info');
  }, [showToast]);

  const eliminarProducto = useCallback(
    async (id: number) => {
      try {
        await productService.delete(id);
        showToast('Eliminado correctamente', 'success');
        await obtenerProductos();
      } catch {
        showToast('Error al eliminar el item', 'error');
      }
    },
    [obtenerProductos, showToast]
  );

  const limpiarFormulario = useCallback(() => {
    setEditandoId(null);
    setNombre('');
    setPrecioIngreso('');
    setPrecioVenta('');
    setCantidad('');
    setDescripcion('');
    setFecha('');
    setSubTipoInsumo('general');
    setMetodoPago('efectivo');
    setImagen(null);
  }, []);

  return {
    states: { lista, nombre, precioIngreso, precioVenta, cantidad, descripcion, fecha, metodoPago, subTipoInsumo, imagen, editandoId },
    setters: { setNombre, setPrecioIngreso, setPrecioVenta, setCantidad, setDescripcion, setFecha, setMetodoPago, setSubTipoInsumo, setImagen },
    actions: { guardarProducto, eliminarProducto, cargarDatosEdicion, limpiarFormulario },
  };
}

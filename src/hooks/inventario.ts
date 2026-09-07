import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { Producto, TipoProducto, MetodoPago } from '../types';
import { productService } from '../services';
import { useToast } from '../contexts';

const normalizarTexto = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const getCampo = (campos: Record<string, unknown>, patrones: string[]) => {
  for (const p of patrones) {
    const v = campos[p];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor === undefined || valor === null || String(valor).trim() === '') continue;
    const norm = normalizarTexto(clave);
    if (norm.includes('alerta') || norm.includes('bajo') || norm.includes('origen') || norm.includes('ganancia')) continue;
    for (const p of patrones) {
      if (norm.includes(p)) return valor;
    }
  }
  return null;
};

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

  const importarDesdeExcel = useCallback(
    async (archivo: File, tipo: TipoProducto) => {
      const patronHoja: Record<TipoProducto, string> = { venta: 'producto', insumo: 'insumo', equipo: 'equipo' };
      try {
        const buffer = await archivo.arrayBuffer();
        const workbook = XLSX.read(buffer);

        let indiceHoja = 0;
        if (workbook.SheetNames.length > 1) {
          const encontrada = workbook.SheetNames.findIndex((n) => normalizarTexto(n).includes(patronHoja[tipo]));
          if (encontrada >= 0) indiceHoja = encontrada;
        }
        const hoja = workbook.Sheets[workbook.SheetNames[indiceHoja]];
        if (!hoja) {
          showToast('No se encontró ninguna hoja en el archivo', 'error');
          return { success: false, importados: 0, omitidos: 0, errores: 0 };
        }

        const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '' });

        const fechaHoy = (() => {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })();

        let importados = 0;
        let omitidos = 0;
        let errores = 0;

        for (const fila of filas) {
          const campos: Record<string, unknown> = {};
          for (const [clave, valor] of Object.entries(fila)) campos[normalizarTexto(clave)] = valor;

          const getStr = (patrones: string[]) => {
            const valor = getCampo(campos, patrones);
            return valor === null ? '' : String(valor).trim();
          };
          const getNum = (patrones: string[]) => {
            const v = getCampo(campos, patrones);
            if (v === null) return 0;
            if (typeof v === 'number') return isNaN(v) ? 0 : v;
            const s = String(v).replace(/\$/g, '').replace(/\s+/g, '');
            const directo = Number(s);
            if (!isNaN(directo)) return directo;
            if (s.includes(',')) {
              const n = Number(s.replace(/\./g, '').replace(/,/g, '.'));
              return isNaN(n) ? 0 : n;
            }
            const n = Number(s.replace(/\./g, ''));
            return isNaN(n) ? 0 : n;
          };
          const getFecha = () => {
            const v = getCampo(campos, ['fecha', 'fecha de registro', 'registro']);
            if (v === null || String(v).trim() === '') return fechaHoy;
            if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
            if (typeof v === 'number' && v > 1000) {
              const ssSSF = XLSX.SSF as unknown as { parse_date_code?: (n: number) => { y: number; m: number; d: number } | undefined };
              const d = ssSSF.parse_date_code?.(Math.round(v));
              if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
            }
            const s = String(v ?? '').trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
            const partes = s.split('/');
            if (partes.length === 3) return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            return fechaHoy;
          };

          const nombre = getStr(['nombre', 'nombre del elemento', 'producto', 'item', 'elemento']);
          if (!nombre) continue;
          const yaExiste = lista.some((p) => p.nombre.trim().toLowerCase() === nombre.toLowerCase());
          if (yaExiste) { omitidos += 1; continue; }

          const precioIngreso = getNum(['costo unitario', 'costo unit', 'precio de ingreso', 'precio ingreso', 'costo', 'ingreso']);
          const cantidad = getNum(['cantidad stock', 'cantidad', 'existencia', 'cant instalados', 'stock', 'cant']);
          const precioVenta = getNum(['precio venta', 'precio de venta', 'precio publico', 'precio']);
          const metodoPago: MetodoPago = getStr(['metodo de pago', 'metodo', 'metodopago']).toLowerCase().includes('nequi') ? 'nequi' : 'efectivo';
          const fecha = getFecha();

          let subTipo = 'general';
          if (tipo === 'venta') {
            const vinculo = getStr(['vinculo pulpa', 'vinculopulpa', 'vinculo', 'subtipo']);
            if (vinculo && vinculo.toLowerCase() !== 'ninguno' && vinculo.toLowerCase() !== 'nap') subTipo = vinculo;
          } else if (tipo === 'insumo') {
            const tipoInsumo = getStr(['tipo de insumo', 'tipo insumo', 'tipo']);
            if (tipoInsumo.toLowerCase().includes('pulpa')) subTipo = 'pulpa';
          }

          const formData = new FormData();
          formData.append('nombre', nombre);
          formData.append('precioIngreso', String(precioIngreso));
          formData.append('precioVenta', String(precioVenta));
          formData.append('cantidad', String(cantidad));
          formData.append('descripcion', tipo === 'venta' ? '' : fecha);
          formData.append('fecha', fecha);
          formData.append('tipo', tipo);
          formData.append('subTipo', subTipo);
          formData.append('metodoPago', metodoPago);

          try {
            await productService.create(formData);
            importados += 1;
          } catch {
            errores += 1;
          }
        }

        await obtenerProductos();

        let mensaje = `Se importaron ${importados} registro(s) correctamente`;
        if (omitidos > 0) mensaje += `, ${omitidos} omitido(s) por ya existir`;
        if (errores > 0) mensaje += `, ${errores} con error`;
        showToast(mensaje, importados > 0 ? 'success' : omitidos > 0 ? 'info' : 'warning');
        return { success: true, importados, omitidos, errores };
      } catch {
        showToast('Error al leer el archivo Excel. Verifica que sea un .xlsx o .xls válido', 'error');
        return { success: false, importados: 0, omitidos: 0, errores: 0 };
      }
    },
    [lista, obtenerProductos, showToast]
  );

  return {
    states: { lista, nombre, precioIngreso, precioVenta, cantidad, descripcion, fecha, metodoPago, subTipoInsumo, imagen, editandoId },
    setters: { setNombre, setPrecioIngreso, setPrecioVenta, setCantidad, setDescripcion, setFecha, setMetodoPago, setSubTipoInsumo, setImagen },
    actions: { guardarProducto, eliminarProducto, cargarDatosEdicion, limpiarFormulario, importarDesdeExcel },
  };
}

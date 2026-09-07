import { useState, useEffect, useMemo, useRef } from 'react';
import { useInventario } from '../hooks/inventario';
import * as XLSX from 'xlsx';
import type { TipoProducto } from '../types';
import { API_ENDPOINTS } from '../config/api';
import '../styles/admin.css';

interface InventarioProps {
  tipo?: TipoProducto;
}

const titulos: Record<TipoProducto, string> = { venta: 'Productos', insumo: 'Insumos Cafetería', equipo: 'Equipos y Materiales' };
const subtitulos: Record<TipoProducto, string> = {
  venta: '🛒 Panel de Control de Productos',
  insumo: '☕ Registro de Insumos Cafetería',
  equipo: '🔌 Inventario de Equipos y Materiales',
};

export function Inventario({ tipo = 'venta' }: InventarioProps) {
  const { states, setters, actions } = useInventario();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pulpasDisponibles, setPulpasDisponibles] = useState<typeof states.lista>([]);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (states.lista) {
      setPulpasDisponibles(states.lista.filter((item) => item.tipo === 'insumo' && item.subTipo === 'pulpa'));
    }
  }, [states.lista]);

  const esGestionInterna = tipo === 'insumo' || tipo === 'equipo';
  const mostrarAlertaStockBajo = tipo === 'venta' || tipo === 'insumo';

  const listaFiltrada = useMemo(() => {
    let lista = states.lista
      .filter((item) => item.tipo === tipo)
      .filter((item) => terminoBusqueda === '' || item.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()))
      .map((producto) => {
        let cantidadReal = producto.cantidad || 0;
        let esVentaConPulpa = false;
        if (tipo === 'venta' && producto.subTipo && producto.subTipo !== 'general') {
          const pulpa = states.lista.find((insumo) => insumo.tipo === 'insumo' && insumo.nombre === producto.subTipo);
          if (pulpa) { cantidadReal = pulpa.cantidad || 0; esVentaConPulpa = true; }
        }
        const stockBajo = mostrarAlertaStockBajo ? cantidadReal <= 5 : false;
        const gananciaUnitaria = tipo === 'venta' ? (producto.precioVenta || 0) - (producto.precioIngreso || 0) : 0;
        return { ...producto, cantidad: cantidadReal, esVentaConPulpa, stockBajo, gananciaUnitaria };
      });
    if (mostrarAlertaStockBajo) {
      lista.sort((a, b) => {
        if (a.stockBajo && !b.stockBajo) return -1;
        if (!a.stockBajo && b.stockBajo) return 1;
        return a.nombre.localeCompare(b.nombre);
      });
    }
    return lista;
  }, [states.lista, tipo, terminoBusqueda, mostrarAlertaStockBajo]);

  useEffect(() => { setPaginaActual(1); }, [terminoBusqueda]);

  const totalItems = listaFiltrada.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(1);
  }, [totalItems, itemsPorPagina, paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = Math.min(indiceInicio + itemsPorPagina, totalItems);
  const itemsPaginaActual = listaFiltrada.slice(indiceInicio, indiceFin);

  const handleGuardar = async () => {
    await actions.guardarProducto(tipo);
    setModalAbierto(false);
    actions.limpiarFormulario();
  };

  const handleCancelar = () => { setModalAbierto(false); actions.limpiarFormulario(); };

  const handleImportarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    await actions.importarDesdeExcel(archivo, tipo);
    e.target.value = '';
  };

  const handleEliminar = (id: number) => {
    if (eliminandoId === id) { actions.eliminarProducto(id); setEliminandoId(null); }
    else { setEliminandoId(id); setTimeout(() => setEliminandoId(null), 4000); }
  };

  const formatFechaToInput = (fecha: string) => {
    if (!fecha) return '';
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) return fecha;
    const partes = fecha.split('/');
    return partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : fecha;
  };

  const formatFechaToDisplay = (fecha: string) => {
    if (!fecha) return '---';
    if (fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) return fecha;
    const partes = fecha.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
  };

  const exportarExcel = () => {
    if (listaFiltrada.length === 0) { alert('No hay datos para exportar.'); return; }
    const datosExportar = listaFiltrada.map((item) => {
      const base: Record<string, unknown> = { 'Nombre': item.nombre, 'Stock': item.cantidad, 'Costo Unit.': item.precioIngreso || 0 };
      if (tipo === 'venta') {
        base['Precio Venta'] = item.precioVenta || 0;
        base['Ganancia Unit.'] = item.gananciaUnitaria;
        base['Vínculo Pulpa'] = item.subTipo && item.subTipo !== 'general' ? item.subTipo : 'Ninguno';
      }
      if (tipo === 'insumo' || tipo === 'equipo') {
        base['Fecha'] = formatFechaToDisplay(item.fecha || '---');
      }
      if (mostrarAlertaStockBajo) base['Alerta Stock'] = item.stockBajo ? 'BAJO STOCK' : 'OK';
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, titulos[tipo]);
    XLSX.writeFile(wb, `Inventario_${titulos[tipo].replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getTableHeaders = () => {
    const base = ['IMAGEN', 'NOMBRE', 'CANT. / STOCK', 'COSTO UNIT.'];
    if (tipo === 'venta') return [...base, 'PRECIO VENTA', 'GANANCIA UNIT.', 'VÍNCULO', 'ACCIONES'];
    return [...base, 'FECHA', 'ACCIONES'];
  };

  const cantidadStockBajo = listaFiltrada.filter((item) => item.stockBajo).length;

  return (
    <div className="inventario-container">
      <header className="inventario-header">
        <p>{subtitulos[tipo]}</p>
        <div className="header-actions">
          <div className="search-bar">
            <i className="fas fa-search search-icon"></i>
            <input type="text" placeholder="Buscar por nombre..." value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} className="search-input" />
            {terminoBusqueda && <button className="search-clear" onClick={() => setTerminoBusqueda('')}><i className="fas fa-times"></i></button>}
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportarExcel} />
          <button className="btn-excel" onClick={() => fileInputRef.current?.click()} style={{ marginRight: '8px' }} title={`Importar ${titulos[tipo]} desde Excel`}>
            <i className="fas fa-file-import"></i> Importar Excel
          </button>
          <button className="btn-excel" onClick={exportarExcel} style={{ marginRight: '8px' }}><i className="fas fa-file-excel"></i> Exportar Excel</button>
          <button className="btn-agregar" onClick={() => { actions.limpiarFormulario(); setModalAbierto(true); }}>
            <i className="fas fa-plus"></i> Agregar {titulos[tipo]}
          </button>
        </div>
      </header>

      {modalAbierto && (
        <div className="modal-overlay" onClick={handleCancelar}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-edit"></i> {states.editandoId ? 'Editar' : 'Nuevo'} {titulos[tipo]}</h3>
              <button className="modal-close" onClick={handleCancelar}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="grid-form-modal">
                <div className="input-group">
                  <label><i className="fas fa-tag"></i> Nombre</label>
                  <input value={states.nombre || ''} onChange={(e) => setters.setNombre(e.target.value)} placeholder="Ej: Jugo de Mango" />
                </div>
                <div className="input-group">
                  <label><i className="fas fa-dollar-sign"></i> Costo Unitario ($)</label>
                  <input type="number" value={states.precioIngreso || ''} onChange={(e) => setters.setPrecioIngreso(e.target.value)} placeholder="0" />
                </div>
                <div className="input-group">
                  <label><i className="fas fa-boxes"></i> Stock inicial</label>
                  <input type="number" value={states.cantidad || ''} onChange={(e) => setters.setCantidad(e.target.value)} placeholder="0" />
                </div>
                {tipo === 'venta' && (
                  <>
                    <div className="input-group">
                      <label><i className="fas fa-link"></i> Vincular a pulpa</label>
                      <select value={states.subTipoInsumo || 'general'} onChange={(e) => setters.setSubTipoInsumo(e.target.value)}>
                        <option value="general">Sin vínculo (Independiente)</option>
                        {pulpasDisponibles.map((pulpa) => <option key={pulpa.id} value={pulpa.nombre}>🔗 Vincular a: {pulpa.nombre}</option>)}
                      </select>
                      <small>* Al vender, se restará stock de la pulpa</small>
                    </div>
                    <div className="input-group">
                      <label><i className="fas fa-tags"></i> Precio Venta ($)</label>
                      <input type="number" value={states.precioVenta || ''} onChange={(e) => setters.setPrecioVenta(e.target.value)} placeholder="0" />
                    </div>
                  </>
                )}
                {esGestionInterna && (
                  <div className="input-group">
                    <label><i className="fas fa-credit-card"></i> Método de Pago</label>
                    <select value={states.metodoPago || 'efectivo'} onChange={(e) => setters.setMetodoPago(e.target.value as never)}>
                      <option value="efectivo">💵 Pago en Efectivo</option>
                      <option value="nequi">📱 Pago por Nequi</option>
                    </select>
                  </div>
                )}
                {tipo === 'insumo' && (
                  <div className="input-group">
                    <label><i className="fas fa-filter"></i> Tipo de Insumo</label>
                    <select value={states.subTipoInsumo || 'general'} onChange={(e) => setters.setSubTipoInsumo(e.target.value)}>
                      <option value="general">Insumo General</option>
                      <option value="pulpa">Pulpa de Fruta</option>
                    </select>
                  </div>
                )}
                {esGestionInterna && (
                  <div className="input-group">
                    <label><i className="fas fa-calendar-alt"></i> Fecha</label>
                    <input type="date" value={formatFechaToInput(states.fecha || '')} onChange={(e) => setters.setFecha(e.target.value)} required />
                    <small>Formato: dd/mm/aaaa</small>
                  </div>
                )}
                <div className="input-group full-width">
                  <label><i className="fas fa-image"></i> Imagen</label>
                  <div className="file-input-wrapper-modal">
                    <label className="file-label">
                      <i className="fas fa-upload"></i> Seleccionar archivo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setters.setImagen(e.target.files?.[0] || null)} />
                    </label>
                    <span className="file-name">{states.imagen?.name || 'Sin archivos seleccionados'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={handleCancelar}><i className="fas fa-times"></i> Cancelar</button>
              <button className="btn-save-modal" onClick={handleGuardar}><i className="fas fa-save"></i> {states.editandoId ? 'Actualizar' : 'Registrar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="inventario-table">
          <thead><tr>{getTableHeaders().map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {itemsPaginaActual.length === 0 ? (
              <tr className="empty-row"><td colSpan={getTableHeaders().length}><i className="fas fa-search"></i><p>No se encontraron resultados para "{terminoBusqueda}"</p></td></tr>
            ) : (
              itemsPaginaActual.map((item) => (
                <tr key={item.id} className={item.stockBajo ? 'stock-bajo-row' : ''}>
                  <td><div className="thumb-container">{item.imagen ? <img src={API_ENDPOINTS.IMAGEN(item.imagen)} alt={item.nombre} /> : <i className="fas fa-image"></i>}</div></td>
                  <td className="txt-bold">{item.nombre}{item.subTipo === 'pulpa' && <span className="badge-pulpa">PULPA</span>}{item.stockBajo && <span className="badge-stock-bajo">⚠️ Stock Bajo</span>}</td>
                  <td className={item.stockBajo ? 'cantidad-baja' : ''}>{item.cantidad}{item.esVentaConPulpa && <span className="stock-hint">(de pulpa)</span>}</td>
                  <td>${Number(item.precioIngreso || 0).toLocaleString()}</td>
                  {tipo === 'venta' && (<>
                    <td className="val-green">${Number(item.precioVenta || 0).toLocaleString()}</td>
                    <td className="val-profit">${Number(item.gananciaUnitaria || 0).toLocaleString()}</td>
                    <td>{item.subTipo && item.subTipo !== 'general' ? <span className="vinculo-badge">🔗 {item.subTipo}</span> : '---'}</td>
                  </>)}
                  {(tipo === 'insumo' || tipo === 'equipo') && <td>{formatFechaToDisplay(item.fecha || item.descripcion || '---')}</td>}
                  <td className="acciones-cell">
                    <button className="btn-icon" onClick={() => { actions.cargarDatosEdicion(item); setModalAbierto(true); }} title="Editar"><i className="fas fa-edit"></i></button>
                    <button className={`btn-icon btn-danger ${eliminandoId === item.id ? 'btn-danger--confirmar' : ''}`} onClick={() => handleEliminar(item.id)}>
                      {eliminandoId === item.id ? <><i className="fas fa-exclamation-triangle"></i> ¿Confirmar?</> : <i className="fas fa-trash-alt"></i>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="pagination-container-simple">
          <div className="pagination-info">
            Mostrando <strong>{indiceInicio + 1}</strong> - <strong>{indiceFin}</strong> de <strong>{totalItems}</strong> registros
            {terminoBusqueda && <span className="search-result-info"><i className="fas fa-filter"></i> Filtrado por: "{terminoBusqueda}"</span>}
            {mostrarAlertaStockBajo && cantidadStockBajo > 0 && <span className="stock-bajo-info"><i className="fas fa-exclamation-triangle"></i> {cantidadStockBajo} productos con stock bajo</span>}
          </div>
          <div className="pagination-controls-simple">
            <div className="pagination-rows-selector">
              <span>Mostrar:</span>
              <select value={itemsPorPagina} onChange={(e) => { setItemsPorPagina(Number(e.target.value)); setPaginaActual(1); }}>
                {[5, 10, 15, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>por página</span>
            </div>
            <div className="pagination-buttons-simple">
              <button className="pagination-btn-simple" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}><i className="fas fa-angle-double-left"></i></button>
              <button className="pagination-btn-simple" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}><i className="fas fa-angle-left"></i></button>
              <span className="pagination-current">Página {paginaActual} de {totalPaginas}</span>
              <button className="pagination-btn-simple" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}><i className="fas fa-angle-right"></i></button>
              <button className="pagination-btn-simple" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas}><i className="fas fa-angle-double-right"></i></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;

import { useState, useEffect } from "react";
import { useInventario } from "../hooks/inventario";
import "../styles/admin.css";

interface InventarioProps {
  tipo?: string;
}

export function Inventario({ tipo = "venta" }: InventarioProps) {
  const { states, setters, actions } = useInventario();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pulpasDisponibles, setPulpasDisponibles] = useState<any[]>([]);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null); // ← NUEVO

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  useEffect(() => {
    if (states.lista) {
      const pulpas = states.lista.filter(
        (item: any) => item.tipo === "insumo" && item.subTipo === "pulpa"
      );
      setPulpasDisponibles(pulpas);
    }
  }, [states.lista]);

  const esGestionInterna = tipo === "insumo" || tipo === "equipo";
  const mostrarAlertaStockBajo = tipo === "venta" || tipo === "insumo";

  let listaFiltrada = states.lista
    .filter((item: any) => item.tipo === tipo)
    .filter((item: any) => {
      if (terminoBusqueda === "") return true;
      return item.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase());
    })
    .map((producto: any) => {
      let cantidadReal = producto.cantidad || 0;
      let esVentaConPulpa = false;
      let stockBajo = false;

      if (tipo === "venta" && producto.subTipo && producto.subTipo !== 'general') {
        const pulpaVinculada = states.lista.find(
          (insumo: any) => insumo.tipo === "insumo" && insumo.nombre === producto.subTipo
        );
        if (pulpaVinculada) {
          cantidadReal = pulpaVinculada.cantidad || 0;
          esVentaConPulpa = true;
        }
      }

      if (mostrarAlertaStockBajo) {
        stockBajo = cantidadReal <= 5;
      }

      return { ...producto, cantidad: cantidadReal, esVentaConPulpa, stockBajo };
    });

  if (mostrarAlertaStockBajo) {
    listaFiltrada = listaFiltrada.sort((a, b) => {
      if (a.stockBajo && !b.stockBajo) return -1;
      if (!a.stockBajo && b.stockBajo) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
  }

  const totalItems = listaFiltrada.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));

  useEffect(() => { setPaginaActual(1); }, [terminoBusqueda]);
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(1);
  }, [totalItems, itemsPorPagina, paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = Math.min(indiceInicio + itemsPorPagina, totalItems);
  const itemsPaginaActual = listaFiltrada.slice(indiceInicio, indiceFin);

  const irPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  const cambiarItemsPorPagina = (cantidad: number) => {
    setItemsPorPagina(cantidad);
    setPaginaActual(1);
  };

  const handleGuardar = async () => {
    await actions.guardarProducto(tipo);
    setModalAbierto(false);
    actions.limpiarFormulario();
  };

  const handleCancelar = () => {
    setModalAbierto(false);
    actions.limpiarFormulario();
  };

  const handleEditar = (item: any) => {
    actions.cargarDatosEdicion(item);
    setModalAbierto(true);
  };

  // ← NUEVO: doble clic sin window.confirm
  const handleEliminar = (id: number) => {
    if (eliminandoId === id) {
      actions.eliminarProducto(id);
      setEliminandoId(null);
    } else {
      setEliminandoId(id);
      setTimeout(() => setEliminandoId(null), 4000);
    }
  };

  const limpiarBusqueda = () => setTerminoBusqueda("");

  const titulos: Record<string, string> = {
    venta: "Productos",
    insumo: "Insumos Cafetería",
    equipo: "Equipos y Materiales"
  };

  const subtitulos: Record<string, string> = {
    venta: "🛒 Panel de Control de Productos",
    insumo: "☕ Registro de Insumos Cafetería",
    equipo: "🔌 Inventario de Equipos y Materiales"
  };

  const cantidadStockBajo = listaFiltrada.filter((item: any) => item.stockBajo).length;

  return (
    <div className="inventario-container">
      <header className="inventario-header">
        <p>{subtitulos[tipo]}</p>
        <div className="header-actions">
          <div className="search-bar">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="search-input"
            />
            {terminoBusqueda && (
              <button className="search-clear" onClick={limpiarBusqueda}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button className="btn-agregar" onClick={() => { actions.limpiarFormulario(); setModalAbierto(true); }}>
            <i className="fas fa-plus"></i> Agregar {titulos[tipo]}
          </button>
        </div>
      </header>

      {modalAbierto && (
        <div className="modal-overlay" onClick={handleCancelar}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit"></i> {states.editandoId ? "Editar" : "Nuevo"} {titulos[tipo]}
              </h3>
              <button className="modal-close" onClick={handleCancelar}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="grid-form-modal">
                <div className="input-group">
                  <label><i className="fas fa-tag"></i> Nombre</label>
                  <input
                    value={states.nombre || ""}
                    onChange={(e) => setters.setNombre(e.target.value)}
                    placeholder={esGestionInterna ? "Ej: Café Especial" : "Ej: Jugo de Mango"}
                  />
                </div>
                <div className="input-group">
                  <label><i className="fas fa-dollar-sign"></i> Costo Unitario ($)</label>
                  <input type="number" value={states.precioIngreso || ""} onChange={(e) => setters.setPrecioIngreso(e.target.value)} placeholder="0" />
                </div>
                <div className="input-group">
                  <label><i className="fas fa-boxes"></i> {esGestionInterna ? "Cantidad (unidades)" : "Stock inicial"}</label>
                  <input type="number" value={states.cantidad || ""} onChange={(e) => setters.setCantidad(e.target.value)} placeholder="0" />
                </div>
                {tipo === "venta" && (
                  <>
                    <div className="input-group">
                      <label><i className="fas fa-link"></i> Vincular a pulpa</label>
                      <select value={states.subTipoInsumo || "general"} onChange={(e) => setters.setSubTipoInsumo(e.target.value)}>
                        <option value="general">Sin vínculo (Independiente)</option>
                        {pulpasDisponibles.map((pulpa) => (
                          <option key={pulpa.id} value={pulpa.nombre}>🔗 Vincular a: {pulpa.nombre}</option>
                        ))}
                      </select>
                      <small>* Al vender, se restará stock de la pulpa</small>
                    </div>
                    <div className="input-group">
                      <label><i className="fas fa-tags"></i> Precio Venta ($)</label>
                      <input type="number" value={states.precioVenta || ""} onChange={(e) => setters.setPrecioVenta(e.target.value)} placeholder="0" />
                    </div>
                  </>
                )}
                {esGestionInterna && (
                  <div className="input-group">
                    <label><i className="fas fa-credit-card"></i> Método de Pago</label>
                    <select value={states.metodoPago || "efectivo"} onChange={(e) => setters.setMetodoPago(e.target.value)}>
                      <option value="efectivo">💵 Pago en Efectivo</option>
                      <option value="nequi">📱 Pago por Nequi</option>
                    </select>
                  </div>
                )}
                {tipo === "insumo" && (
                  <div className="input-group">
                    <label><i className="fas fa-filter"></i> Tipo de Insumo</label>
                    <select value={states.subTipoInsumo || "general"} onChange={(e) => setters.setSubTipoInsumo(e.target.value)}>
                      <option value="general">Insumo General</option>
                      <option value="pulpa">Pulpa de Fruta</option>
                    </select>
                  </div>
                )}
                <div className="input-group">
                  <label><i className="fas fa-calendar-alt"></i> {esGestionInterna ? "Fecha" : "Descripción"}</label>
                  <input
                    type={esGestionInterna ? "date" : "text"}
                    value={states.descripcion || ""}
                    onChange={(e) => setters.setDescripcion(e.target.value)}
                    placeholder={esGestionInterna ? "" : "Descripción corta"}
                  />
                </div>
                <div className="input-group full-width">
                  <label><i className="fas fa-image"></i> Imagen</label>
                  <div className="file-input-wrapper-modal">
                    <label className="file-label">
                      <i className="fas fa-upload"></i> Seleccionar archivo
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setters.setImagen(e.target.files?.[0] || null)} />
                    </label>
                    <span className="file-name">{states.imagen?.name || "Sin archivos seleccionados"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={handleCancelar}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button className="btn-save-modal" onClick={handleGuardar}>
                <i className="fas fa-save"></i> {states.editandoId ? "Actualizar" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="inventario-table">
          <thead>
            <tr>
              <th>IMAGEN</th>
              <th>NOMBRE</th>
              <th>CANT. / STOCK</th>
              <th>COSTO UNIT.</th>
              {!esGestionInterna && <th>PRECIO VENTA</th>}
              <th>FECHA / REGISTRO</th>
              {!esGestionInterna && <th>VÍNCULO</th>}
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {itemsPaginaActual.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={esGestionInterna ? 6 : 8}>
                  <i className="fas fa-search"></i>
                  <p>No se encontraron resultados para "{terminoBusqueda}"</p>
                  {terminoBusqueda && (
                    <button className="btn-clear-search" onClick={limpiarBusqueda}>Limpiar búsqueda</button>
                  )}
                </td>
              </tr>
            ) : (
              itemsPaginaActual.map((item: any) => (
                <tr key={item.id} className={item.stockBajo ? "stock-bajo-row" : ""}>
                  <td>
                    <div className="thumb-container">
                      {item.imagen
                        ? <img src={`http://localhost:3001${item.imagen}`} alt={item.nombre} />
                        : <i className="fas fa-image"></i>}
                    </div>
                  </td>
                  <td className="txt-bold">
                    {item.nombre}
                    {item.subTipo === "pulpa" && <span className="badge-pulpa">PULPA</span>}
                    {item.stockBajo && <span className="badge-stock-bajo">⚠️ Stock Bajo</span>}
                  </td>
                  <td className={item.stockBajo ? "cantidad-baja" : ""}>
                    {item.cantidad}
                    {item.esVentaConPulpa && <span className="stock-hint">(de pulpa)</span>}
                  </td>
                  <td>${Number(item.precioIngreso || 0).toLocaleString()}</td>
                  {!esGestionInterna && (
                    <td className="val-green">${Number(item.precioVenta || 0).toLocaleString()}</td>
                  )}
                  <td>{item.descripcion || "---"}</td>
                  {!esGestionInterna && (
                    <td>
                      {item.subTipo && item.subTipo !== "general"
                        ? <span className="vinculo-badge">🔗 {item.subTipo}</span>
                        : "---"}
                    </td>
                  )}
                  <td className="acciones-cell">
                    <button className="btn-icon" onClick={() => handleEditar(item)} title="Editar">
                      <i className="fas fa-edit"></i>
                    </button>
                    {/* ← BOTÓN CON DOBLE CLIC, sin window.confirm */}
                    <button
                      className={`btn-icon btn-danger ${eliminandoId === item.id ? 'btn-danger--confirmar' : ''}`}
                      onClick={() => handleEliminar(item.id)}
                      title={eliminandoId === item.id ? "Confirmar eliminación" : "Eliminar"}
                    >
                      {eliminandoId === item.id
                        ? <><i className="fas fa-exclamation-triangle"></i> ¿Confirmar?</>
                        : <i className="fas fa-trash-alt"></i>}
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
            {terminoBusqueda && (
              <span className="search-result-info">
                <i className="fas fa-filter"></i> Filtrado por: "{terminoBusqueda}"
              </span>
            )}
            {mostrarAlertaStockBajo && cantidadStockBajo > 0 && (
              <span className="stock-bajo-info">
                <i className="fas fa-exclamation-triangle"></i> {cantidadStockBajo} productos con stock bajo
              </span>
            )}
          </div>
          <div className="pagination-controls-simple">
            <div className="pagination-rows-selector">
              <span>Mostrar:</span>
              <select value={itemsPorPagina} onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>por página</span>
            </div>
            <div className="pagination-buttons-simple">
              <button className="pagination-btn-simple" onClick={() => irPagina(1)} disabled={paginaActual === 1}>
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button className="pagination-btn-simple" onClick={() => irPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                <i className="fas fa-angle-left"></i>
              </button>
              <span className="pagination-current">Página {paginaActual} de {totalPaginas}</span>
              <button className="pagination-btn-simple" onClick={() => irPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                <i className="fas fa-angle-right"></i>
              </button>
              <button className="pagination-btn-simple" onClick={() => irPagina(totalPaginas)} disabled={paginaActual === totalPaginas}>
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;
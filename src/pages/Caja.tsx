import { useState } from "react";
import { useVentas } from "../hooks/caja";
import "../styles/caja.css";

function Caja() {
    const props = useVentas();
    const [modalCargarMesa, setModalCargarMesa] = useState<any>(null);
    const [modalAccionesPedido, setModalAccionesPedido] = useState<any>(null);
    const [busqueda, setBusqueda] = useState("");

    const carritoAgrupado = () => {
        const agrupado: any[] = [];
        props.carrito.forEach(item => {
            const ex = agrupado.find(p => p.id === item.id);
            if (ex) { ex.cantidad++; } else { agrupado.push({ ...item, cantidad: 1 }); }
        });
        return agrupado;
    };

    const manejarImpresion = () => window.print();

    const handleCargarPedido = (pedido: any) => {
        setModalAccionesPedido(pedido);
    };

    const confirmarCargarPedido = () => {
        if (modalCargarMesa) props.cargarPedido(modalCargarMesa);
        setModalCargarMesa(null);
    };

    const cancelarCargarPedido = () => setModalCargarMesa(null);

    const accionCargarYGuardar = async () => {
        props.cargarPedido(modalAccionesPedido);
        setModalAccionesPedido(null);
        setTimeout(() => props.guardarPedido(), 100);
    };

    const accionCargarYPagar = () => {
        props.cargarPedido(modalAccionesPedido);
        setModalAccionesPedido(null);
        setTimeout(() => props.setMostrarPago(true), 100);
    };

    const accionCargarEImprimir = () => {
        props.cargarPedido(modalAccionesPedido);
        setModalAccionesPedido(null);
        setTimeout(() => window.print(), 300);
    };

    const productosFiltrados = props.productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="contenedor">
            <h1 className="titulo"><span className="titulo-texto">Juyasia</span></h1>

            <button
                className="btn-pendientes-toggle"
                onClick={() => props.setMostrarPendientes(!props.mostrarPendientes)}
            >
                📦 Pedidos Guardados ({props.pedidosPendientes.length})
            </button>

            {props.mostrarPendientes && (
                <div className="pendientes-wrapper">
                    {props.pedidosPendientes.length === 0 ? (
                        <div className="empty-state">
                            <span className="icon">📦</span>No hay pedidos guardados
                        </div>
                    ) : (
                        <div className="pendientes-grid">
                            {props.pedidosPendientes.map(p => (
                                <div key={p.id} className="pendiente-card">
                                    <div className="pendiente-info">
                                        <span className="pendiente-mesa">Mesa {p.mesa}</span>
                                        <span className="pendiente-total">${p.total.toLocaleString()}</span>
                                    </div>
                                    <button className="btn-cargar" onClick={() => handleCargarPedido(p)}>
                                        📥 Cargar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ===== MODAL DE ACCIONES DEL PEDIDO ===== */}
            {modalAccionesPedido && (
                <div className="modal-acciones-overlay" onClick={() => setModalAccionesPedido(null)}>
                    <div className="modal-acciones" onClick={e => e.stopPropagation()}>

                        <button className="modal-acciones-cerrar" onClick={() => setModalAccionesPedido(null)}>✕</button>

                        <span className="modal-acciones-icono">📋</span>
                        <h2>Mesa {modalAccionesPedido.mesa}</h2>

                        <div className="modal-acciones-tabla-wrapper">
                            <table className="modal-acciones-tabla">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cant.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalAccionesPedido.carrito?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.nombre}</td>
                                            <td className="text-center">{item.cantidad}</td>
                                            <td className="text-right">${(item.precioVenta * item.cantidad).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-acciones-total">
                            <span>Total</span>
                            <strong>${modalAccionesPedido.total.toLocaleString()}</strong>
                        </div>

                        <p className="modal-acciones-pregunta">¿Qué deseas hacer con este pedido?</p>

                        <div className="modal-acciones-grid">
                            <button className="modal-acciones-btn modal-acciones-btn--guardar" onClick={accionCargarYGuardar}>
                                💾 Guardar Pedido
                            </button>
                            <button className="modal-acciones-btn modal-acciones-btn--pagar" onClick={accionCargarYPagar}>
                                💰 Ir a Pagar
                            </button>
                            <button className="modal-acciones-btn modal-acciones-btn--imprimir" onClick={accionCargarEImprimir}>
                                🖨️ Imprimir Factura
                            </button>
                        </div>

                        <button className="modal-acciones-cancelar" onClick={() => setModalAccionesPedido(null)}>
                            Cancelar
                        </button>

                    </div>
                </div>
            )}

            {/* ===== MODAL CONFIRMAR CARGA ===== */}
            {modalCargarMesa && (
                <div className="modal-overlay" onClick={cancelarCargarPedido}>
                    <div className="modal-content modal-confirmar" onClick={e => e.stopPropagation()}>
                        <button className="btn-cerrar-modal" onClick={cancelarCargarPedido}>✕</button>
                        <div className="modal-confirmar-icon">📋</div>
                        <h2>Cargar Pedido</h2>
                        <div className="modal-confirmar-info">
                            <div className="modal-confirmar-linea">
                                <span>Mesa:</span><strong>{modalCargarMesa.mesa}</strong>
                            </div>
                            <div className="modal-confirmar-linea">
                                <span>Total:</span><strong>${modalCargarMesa.total.toLocaleString()}</strong>
                            </div>
                        </div>
                        <div className="modal-confirmar-botones">
                            <button className="btn-confirmar-cancelar" onClick={cancelarCargarPedido}>Cancelar</button>
                            <button className="btn-confirmar-aceptar" onClick={confirmarCargarPedido}>✅ Cargar Pedido</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL DE PAGO ===== */}
            {props.mostrarPago && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-cerrar-modal" onClick={() => props.setMostrarPago(false)}>✕</button>
                        <h2>Resumen de Pago</h2>
                        <div className="modal-monto-total">
                            <span className="modal-monto-label">Monto a cobrar</span>
                            <span className="modal-monto-valor">${props.total.toLocaleString()}</span>
                        </div>
                        {!props.pasoPagoEfectivo ? (
                            <div className="metodos-pago">
                                <p className="metodos-label">Selecciona el método de pago</p>
                                <button className="metodo-pago-option" onClick={() => { props.setMetodoPago("efectivo"); props.setPasoPagoEfectivo(true); }}>
                                    <span className="icono">💵</span>
                                    <div><strong>Efectivo</strong><span></span></div>
                                </button>
                                <button className="metodo-pago-option" onClick={() => props.procesarPago("nequi")}>
                                    <span className="icono">📱</span>
                                    <div><strong>Nequi</strong><span>(3118971030)</span></div>
                                </button>
                                <button className="btn-modal-cancelar" onClick={() => props.setMostrarPago(false)}>Cancelar</button>
                            </div>
                        ) : (
                            <div className="pago-efectivo-detalles">
                                <div className="pago-input-group">
                                    <label className="pago-input-label">Monto recibido</label>
                                    <div className="turno-input-wrapper">
                                        <span className="turno-input-prefix">$</span>
                                        <input type="number" className="turno-input" placeholder="0"
                                            value={props.montoRecibido}
                                            onChange={e => props.setMontoRecibido(e.target.value)} autoFocus />
                                    </div>
                                </div>
                                <div className={`vuelto-display ${props.vuelto < 0 ? 'vuelto--negativo' : 'vuelto--positivo'}`}>
                                    <span className="vuelto-label">Vuelto</span>
                                    <span className="vuelto-valor">${props.vuelto.toLocaleString()}</span>
                                </div>
                                <div className="botones-finales">
                                    <button className="btn-confirmar" onClick={() => props.procesarPago("efectivo")}
                                        disabled={props.vuelto < 0 || !props.montoRecibido}>✅ Confirmar Venta</button>
                                    <button className="btn-atras" onClick={() => props.setPasoPagoEfectivo(false)}>Atrás</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== MESA + BUSCADOR ===== */}
            <div className="mesa-input-container">
                <label>🪑 Mesa:</label>
                <input
                    type="number"
                    value={props.mesa}
                    onChange={e => props.setMesa(e.target.value)}
                    className="input-mesa"
                    placeholder="0"
                />
                <div className="buscador-wrapper">
                    <span className="buscador-icono">🔍</span>
                    <input
                        type="text"
                        className="input-buscador"
                        placeholder="Buscar producto..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                        <button className="buscador-limpiar" onClick={() => setBusqueda("")}>✕</button>
                    )}
                </div>
            </div>

            {/* ===== CATÁLOGO ===== */}
            <div className="productos-grid">
                {productosFiltrados.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                        <span className="icon">🔍</span>
                        No se encontró "{busqueda}"
                    </div>
                ) : (
                    productosFiltrados.map(p => {
                        const tieneVinculo = p.subTipo && p.subTipo !== 'general' && p.subTipo !== 'pulpa';
                        const estaRealmenteAgotado = p.cantidad <= 0;
                        return (
                            <div key={p.id} className={`producto-card ${estaRealmenteAgotado ? 'sin-stock' : ''}`}>
                                <div className="producto-img-container">
                                    {p.imagen
                                        ? <img src={`http://localhost:3001/imagenes/${p.imagen.replace('/imagenes/', '')}`} alt={p.nombre} className="producto-img" />
                                        : <div className="sin-img">☕</div>}
                                </div>
                                <div className="producto-info">
                                    <strong>{p.nombre}</strong>
                                    <span>${p.precioVenta.toLocaleString()}</span>
                                    <button disabled={estaRealmenteAgotado} onClick={() => props.agregarAlCarrito(p)}>
                                        {estaRealmenteAgotado ? "Agotado" : "Agregar"}
                                    </button>
                                    {tieneVinculo && (
                                        <span className="text-xs text-zinc-500 italic block mt-1">(Usa Pulpa)</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ===== CARRITO ===== */}
            {props.carrito.length > 0 && (
                <div className="carrito-container">
                    <div id="seccion-factura">
                        <table className="tabla-carrito">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cant.</th>
                                    <th>Subtotal</th>
                                    <th className="no-print">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carritoAgrupado().map(item => (
                                    <tr key={item.id}>
                                        <td>{item.nombre}</td>
                                        <td>
                                            <div className="controles-cantidad">
                                                <button className="no-print" onClick={() => props.cambiarCantidad(item.id, -1)}>-</button>
                                                <span className="cantidad-numero">{item.cantidad}</span>
                                                <button className="no-print" onClick={() => props.cambiarCantidad(item.id, 1)}>+</button>
                                            </div>
                                        </td>
                                        <td>${(item.precioVenta * item.cantidad).toLocaleString()}</td>
                                        <td className="no-print">
                                            <button className="btn-eliminar" onClick={() => props.removerProducto(item.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="total-seccion">
                            <h2>Total: ${props.total.toLocaleString()}</h2>
                        </div>
                    </div>
                    <div className="botones-accion">
                        <button onClick={props.guardarPedido} className="btn btn-listo">💾 Guardar Pedido</button>
                        <button onClick={manejarImpresion} className="btn btn-imprimir">🖨️ Imprimir Factura</button>
                        <button onClick={() => props.setMostrarPago(true)} className="btn btn-pagar">💰 Ir a Pagar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Caja;
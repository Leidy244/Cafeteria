// Caja.tsx
import { useVentas } from "../hooks/caja";
import "../styles/caja.css";

function Caja() {
    const props = useVentas();

    // Helper para agrupar productos repetidos en la tabla visual
    const carritoAgrupado = () => {
        const agrupado: any[] = [];
        props.carrito.forEach(item => {
            const ex = agrupado.find(p => p.id === item.id);
            if (ex) {
                ex.cantidad++;
            } else {
                agrupado.push({ ...item, cantidad: 1 });
            }
        });
        return agrupado;
    };

    return (
        <div className="contenedor">
            <h1 className="titulo">
                <span className="titulo-texto">Juyasia</span> ☕🍦
            </h1>

            {/* SECCIÓN DE PEDIDOS PENDIENTES */}
            <button
                className="btn-pendientes-toggle"
                onClick={() => props.setMostrarPendientes(!props.mostrarPendientes)}
            >
                📦 Pedidos Guardados ({props.pedidosPendientes.length})
            </button>

            {/* PEDIDOS GUARDADOS */}
            {props.mostrarPendientes && (
                <div className="pendientes-wrapper">
                    {props.pedidosPendientes.length === 0 ? (
                        <div className="empty-state">
                            <span className="icon">📦</span>
                            No hay pedidos guardados
                        </div>
                    ) : (
                        <div className="pendientes-grid">
                            {props.pedidosPendientes.map(p => (
                                <div key={p.id} className="pendiente-card">
                                    <div className="pendiente-info">
                                        <span className="pendiente-mesa">Mesa {p.mesa}</span>
                                        <span className="pendiente-total">${p.total.toLocaleString()}</span>
                                    </div>
                                    <button className="btn btn-cargar" onClick={() => props.cargarPedido(p)}>
                                        📥 Cargar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE PAGO */}
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

                                <button
                                    className="metodo-pago-option"
                                    onClick={() => {
                                        props.setMetodoPago("efectivo");
                                        props.setPasoPagoEfectivo(true);
                                    }}
                                >
                                    <span className="icono">💵</span>
                                    <div>
                                        <strong>Efectivo</strong>
                                        <span>Pago en billetes o monedas</span>
                                    </div>
                                </button>

                                <button
                                    className="metodo-pago-option"
                                    onClick={() => props.procesarPago("nequi")}
                                >
                                    <span className="icono">📱</span>
                                    <div>
                                        <strong>Nequi</strong>
                                        <span>Transferencia digital</span>
                                    </div>
                                </button>

                                <button className="btn btn-modal-cancelar" onClick={() => props.setMostrarPago(false)}>
                                    Cancelar
                                </button>
                            </div>

                        ) : (
                            <div className="pago-efectivo-detalles">

                                <div className="pago-input-group">
                                    <label className="pago-input-label">Monto recibido</label>
                                    <div className="turno-input-wrapper">
                                        <span className="turno-input-prefix">$</span>
                                        <input
                                            type="number"
                                            className="turno-input"
                                            placeholder="0"
                                            value={props.montoRecibido}
                                            onChange={(e) => props.setMontoRecibido(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className={`vuelto-display ${props.vuelto < 0 ? 'vuelto--negativo' : 'vuelto--positivo'}`}>
                                    <span className="vuelto-label">Vuelto</span>
                                    <span className="vuelto-valor">${props.vuelto.toLocaleString()}</span>
                                </div>

                                <div className="botones-finales">
                                    <button
                                        className="btn btn-confirmar"
                                        onClick={() => props.procesarPago("efectivo")}
                                        disabled={props.vuelto < 0 || !props.montoRecibido}
                                    >
                                        ✅ Confirmar Venta
                                    </button>
                                    <button className="btn btn-atras" onClick={() => props.setPasoPagoEfectivo(false)}>
                                        Atrás
                                    </button>
                                </div>

                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* ENTRADA DE MESA */}
            <div className="mesa-input-container">
                <label>🪑 Mesa:</label>
                <input
                    type="number"
                    value={props.mesa}
                    onChange={(e) => props.setMesa(e.target.value)}
                    className="input-mesa"
                    placeholder="0"
                />
            </div>

            {/* CATÁLOGO DE PRODUCTOS */}
            <div className="productos-grid">
                {props.productos.map(p => (
                    <div key={p.id} className={`producto-card ${p.cantidad <= 0 ? 'sin-stock' : ''}`}>
                        <div className="producto-img-container">
                            {p.imagen ? (
                                <img
                                    src={`http://localhost:3001/imagenes/${p.imagen.replace('/imagenes/', '')}`}
                                    alt={p.nombre}
                                    className="producto-img"
                                />
                            ) : (
                                <div className="sin-img">☕</div>
                            )}
                        </div>

                        <div className="producto-info">
                            <strong>{p.nombre}</strong>
                            <span>${p.precioVenta.toLocaleString()}</span>
                            <button
                                disabled={p.cantidad <= 0}
                                onClick={() => props.agregarAlCarrito(p)}
                            >
                                {p.cantidad <= 0 ? "Agotado" : "Agregar"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* RESUMEN DEL CARRITO */}
            {props.carrito.length > 0 && (
                <div className="carrito-container">
                    <table className="tabla-carrito">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>Subtotal</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carritoAgrupado().map(item => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>
                                        <div className="controles-cantidad">
                                            <button onClick={() => props.cambiarCantidad(item.id, -1)}>-</button>
                                            <span className="cantidad-numero">{item.cantidad}</span>
                                            <button onClick={() => props.cambiarCantidad(item.id, 1)}>+</button>
                                        </div>
                                    </td>
                                    <td>${(item.precioVenta * item.cantidad).toLocaleString()}</td>
                                    <td>
                                        <button className="btn-eliminar" onClick={() => props.removerProducto(item.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="total-seccion">
                        <h2>Total: ${props.total.toLocaleString()}</h2>
                    </div>

                    <div className="botones-accion">
                        <button onClick={props.guardarPedido} className="btn-listo">💾 Guardar Pedido</button>
                        <button onClick={() => props.setMostrarPago(true)} className="btn-pagar">💰 Ir a Pagar</button>
                    </div>
                </div>
            )}


        </div>
    );
}

export default Caja;
import { useState, useEffect, useCallback } from "react";

const API_PRODUCTOS = "http://localhost:3001/productos";
const API_VENTAS = "http://localhost:3001/ventas";
const API_PEDIDOS = "http://localhost:3001/pedidos";

export const useCaja = () => {
    // 1. ESTADOS DE PRODUCTOS E INVENTARIO
    const [productos, setProductos] = useState<any[]>([]);
    const [carrito, setCarrito] = useState<any[]>([]);

    // 2. ESTADOS DE PEDIDOS Y MESAS
    const [mesa, setMesa] = useState<string>("");
    const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
    const [mostrarPendientes, setMostrarPendientes] = useState(false);

    // 3. ESTADOS DE PAGO Y MODAL
    const [mostrarPago, setMostrarPago] = useState(false);
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "nequi">("efectivo");
    const [pasoPagoEfectivo, setPasoPagoEfectivo] = useState(false);
    const [montoRecibido, setMontoRecibido] = useState<string>("");

    // --- CARGA INICIAL (PRODUCTOS Y PEDIDOS DE LA DB) ---
    const cargarProductos = useCallback(async () => {
        try {
            const res = await fetch(API_PRODUCTOS);
            const data = await res.json();
            setProductos(data.filter((p: any) => p.tipo === "venta"));
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    }, []);

    const cargarPedidosDesdeDB = useCallback(async () => {
        try {
            const res = await fetch(API_PEDIDOS);
            if (res.ok) {
                const data = await res.json();
                // Tu backend ya los devuelve filtrados por estado 'pendiente'
                setPedidosPendientes(data);
            }
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        }
    }, []);

    useEffect(() => {
        cargarProductos();
        cargarPedidosDesdeDB();
    }, [cargarProductos, cargarPedidosDesdeDB]);

    // --- LÓGICA DE CARRITO Y VALIDACIÓN DE STOCK ---
    const agregarAlCarrito = (producto: any) => {
        const cantidadEnCarrito = carrito.filter(item => item.id === producto.id).length;

        if (cantidadEnCarrito >= producto.cantidad) {
            return alert(`⚠️ No puedes agregar más. Solo hay ${producto.cantidad} unidades de ${producto.nombre} en stock.`);
        }

        setCarrito([...carrito, { ...producto }]);
    };

    const removerProducto = (id: number) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const cambiarCantidad = (id: number, delta: number) => {
        if (delta > 0) {
            const productoOriginal = productos.find(p => p.id === id);
            const cantidadActual = carrito.filter(item => item.id === id).length;

            if (productoOriginal && cantidadActual >= productoOriginal.cantidad) {
                return alert(`⚠️ Solo hay ${productoOriginal.cantidad} unidades disponibles.`);
            }
            
            const item = productos.find(p => p.id === id);
            setCarrito([...carrito, item]);
        } else {
            const nuevoCarrito = [...carrito];
            const index = carrito.findIndex(item => item.id === id);
            if (index !== -1) {
                nuevoCarrito.splice(index, 1);
                setCarrito(nuevoCarrito);
            }
        }
    };

    // --- CÁLCULOS ---
    const total = carrito.reduce((acc, item) => acc + item.precioVenta, 0);
    const vuelto = montoRecibido ? Number(montoRecibido) - total : 0;

    // --- GESTIÓN DE PEDIDOS (PERSISTENCIA EN DB) ---
   // --- useCaja.ts ---

const guardarPedido = async () => {
    if (!mesa) return alert("Asigna una mesa antes de guardar.");
    if (carrito.length === 0) return alert("El carrito está vacío.");

    // 1. Agrupamos el carrito que tienes en pantalla (que ya incluye lo cargado + lo nuevo)
    const carritoAgrupado = carrito.reduce((acc: any[], item: any) => {
        const existente = acc.find((p) => p.id === item.id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            acc.push({ ...item, cantidad: 1 });
        }
        return acc;
    }, []);

    // 2. Buscamos si la mesa ya existe en la lista de pendientes
    const pedidoExistente = pedidosPendientes.find(p => String(p.mesa) === String(mesa));

    if (pedidoExistente) {
        // --- ACTUALIZAR MESA ---
        // Aquí enviamos el 'total' calculado de TODO el carrito actual
        try {
            const res = await fetch(`${API_PEDIDOS}/${pedidoExistente.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...pedidoExistente,
                    carrito: carritoAgrupado, // Enviamos la lista completa
                    total: total,              // El total de 500 (200 pan + 300 gaseosa)
                    productosNuevos: carrito.filter(item => !pedidoExistente.carrito.some((old: any) => old.id === item.id)) 
                    // Lo anterior es opcional para el stock, lo importante es el total
                })
            });
            if (res.ok) alert(`Mesa ${mesa} actualizada a $${total.toLocaleString()}`);
        } catch (e) {
            alert("Error al actualizar");
        }
    } else {
        // --- CREAR NUEVO ---
        try {
            const res = await fetch(API_PEDIDOS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mesa,
                    total,
                    carrito: carritoAgrupado,
                    estado: "pendiente"
                })
            });
            if (res.ok) alert("Pedido guardado ✅");
        } catch (e) {
            alert("Error al guardar");
        }
    }

    // LIMPIEZA TOTAL
    setCarrito([]);
    setMesa("");
    cargarPedidosDesdeDB();
    cargarProductos();
};

const cargarPedido = (pedido: any) => {
    // IMPORTANTE: Al cargar, reconstruimos el carrito "plano" para que 
    // la lógica de agregarAlCarrito y el cálculo de 'total' funcionen igual
    const carritoReconstruido: any[] = [];
    pedido.carrito.forEach((item: any) => {
        for (let i = 0; i < item.cantidad; i++) {
            carritoReconstruido.push({ ...item });
        }
    });

    setCarrito(carritoReconstruido);
    setMesa(pedido.mesa);
    setMostrarPendientes(false);
};


    // --- PROCESAR VENTA FINAL ---
    const procesarPago = async (metodo: "efectivo" | "nequi") => {
        try {
            const resCaja = await fetch("http://localhost:3001/caja/estado");
            const cajaActiva = await resCaja.json();

            if (!cajaActiva || cajaActiva.estado !== "abierto") {
                return alert("⚠️ La caja debe estar ABIERTA para procesar ventas.");
            }

            const carritoAgrupado = carrito.reduce((acc: any[], item: any) => {
                const existente = acc.find((p) => p.id === item.id);
                if (existente) {
                    existente.cantidad += 1;
                } else {
                    acc.push({ ...item, cantidad: 1 });
                }
                return acc;
            }, []);

            const ventaData = {
                carrito: carritoAgrupado,
                total,
                mesa,
                metodoPago: metodo,
                turnoId: cajaActiva.id,
                montoRecibido: metodo === "efectivo" ? Number(montoRecibido) : total
            };

            const res = await fetch(API_VENTAS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ventaData)
            });

            if (res.ok) {
                // ACTUALIZAR ESTADO DEL PEDIDO (Para que no se borre de la DB pero sí de la vista)
                const pedidoActual = pedidosPendientes.find(p => p.mesa === mesa);
                if (pedidoActual) {
                    await fetch(`${API_PEDIDOS}/${pedidoActual.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...pedidoActual,
                            estado: "pagado"
                        })
                    });
                }

                alert("✅ Venta procesada con éxito");
                setCarrito([]);
                setMesa("");
                setMostrarPago(false);
                setPasoPagoEfectivo(false);
                setMontoRecibido("");
                cargarProductos(); 
                cargarPedidosDesdeDB(); 
            }
        } catch (error) {
            alert("❌ Error de conexión al procesar la venta");
        }
    };

    return {
        productos,
        carrito,
        mesa,
        pedidosPendientes,
        mostrarPendientes,
        mostrarPago,
        metodoPago,
        pasoPagoEfectivo,
        montoRecibido,
        total,
        vuelto,
        setMesa,
        setMostrarPendientes,
        setMostrarPago,
        setMetodoPago,
        setPasoPagoEfectivo,
        setMontoRecibido,
        agregarAlCarrito,
        removerProducto,
        cambiarCantidad,
        guardarPedido,
        cargarPedido,
        procesarPago
    };
};
import React, { useState } from "react";
import Inventario from "./Inventario.tsx"; 
import CierreCaja from "./cierrecaja.tsx"; 
import { useVentas } from "../hooks/caja"; 
import "../styles/admin.css";
import Reporte from "./Reporte.tsx";
import { useCaja } from "../hooks/cierrecaja.ts";

function AdminDashboard() {
  const [tabActiva, setTabActiva] = useState("inventario");
  
  
  const { cajaInfo, cargando } =    useCaja();
  const estadoCaja = cajaInfo?.estado === "abierto" ? "Abierto" : "Cerrado";

  if (cargando) return <div className="loader">Cargando sistema...</div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Juyasia Admin</h2>
          <div className="status-online">● Sistema Online</div>
        </div>
        
        <nav className="sidebar-nav">
          <button className={tabActiva === "cierrecaja" ? "active" : ""} onClick={() => setTabActiva("cierrecaja")}>
            💰 Cierre caja
          </button>
          <button className={tabActiva === "inventario" ? "active" : ""} onClick={() => setTabActiva("inventario")}>
            🛒 Productos
          </button>
          <button className={tabActiva === "cafeteria" ? "active" : ""} onClick={() => setTabActiva("cafeteria")}>
            ☕ Insumos
          </button>
          <button className={tabActiva === "activos" ? "active" : ""} onClick={() => setTabActiva("activos")}>
            🔌 Equipos
          </button>
          <button className={tabActiva === "reporte" ? "active" : ""} onClick={() => setTabActiva("reporte")}>
            📊 Reporte de Ventas
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => window.location.href = "/"}>Volver al Menú</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1>
            {tabActiva === "cierrecaja" ? "Control de Turno" : `Gestión de ${tabActiva}`}
          </h1>
          
          {/* Aquí mostrará dinámicamente si está Abierto o Cerrado */}
          <p className="status-line">Estado de caja: <strong>{estadoCaja}</strong></p>
        </div>

        <section className="inventario-container">
          {tabActiva === "cierrecaja" && <CierreCaja />}
          {tabActiva === "inventario" && <Inventario key="venta" tipo="venta" />}
          {tabActiva === "cafeteria" && <Inventario key="insumo" tipo="insumo" />}
          {tabActiva === "activos" && <Inventario key="equipo" tipo="equipo" />}
          {tabActiva === "reporte" && <Reporte />}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
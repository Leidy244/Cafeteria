import { useState } from "react";
import Inventario from "./Inventario";
import CierreCaja from "./cierrecaja";
import Reporte from "./Reporte";
import "../styles/admin.css";
import { useCaja } from "../hooks/cierrecaja";

function AdminDashboard() {
  const [tabActiva, setTabActiva] = useState("cierrecaja");
  
  const { cajaInfo, cargando } = useCaja();
  const estadoCaja = cajaInfo?.estado === "abierto" ? "Abierto" : "Cerrado";

  if (cargando) return <div className="loader">Cargando sistema...</div>;

  const titulos: Record<string, string> = {
    cierrecaja: "Control de Turno",
    inventario: "Gestión de Productos",
    cafeteria: "Gestión de Insumos",
    activos: "Gestión de Equipos",
    reporte: "Reporte de Ventas"
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Juvasia Admin</h2>
          <div className="status-online">
            <i className="fas fa-circle" style={{ fontSize: "8px" }} />
            <span>Sistema Online</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={tabActiva === "cierrecaja" ? "active" : ""} 
            onClick={() => setTabActiva("cierrecaja")}
          >
            <i className="fas fa-cash-register" />
            <span>Cierre caja</span>
          </button>
          <button 
            className={tabActiva === "inventario" ? "active" : ""} 
            onClick={() => setTabActiva("inventario")}
          >
            <i className="fas fa-shopping-cart" />
            <span>Productos</span>
          </button>
          <button 
            className={tabActiva === "cafeteria" ? "active" : ""} 
            onClick={() => setTabActiva("cafeteria")}
          >
            <i className="fas fa-coffee" />
            <span>Insumos</span>
          </button>
          <button 
            className={tabActiva === "activos" ? "active" : ""} 
            onClick={() => setTabActiva("activos")}
          >
            <i className="fas fa-microchip" />
            <span>Equipos</span>
          </button>
          <button 
            className={tabActiva === "reporte" ? "active" : ""} 
            onClick={() => setTabActiva("reporte")}
          >
            <i className="fas fa-chart-line" />
            <span>Reporte de Ventas</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => window.location.href = "/"}>
            <i className="fas fa-sign-out-alt" />
            <span>Volver al Menú</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1>{titulos[tabActiva]}</h1>
          <p className="status-line">
            Estado de caja: <strong className={estadoCaja === "Abierto" ? "val-green" : "val-red"}>
              {estadoCaja}
            </strong>
          </p>
        </div>

        <section className="inventario-container">
          {tabActiva === "cierrecaja" && <CierreCaja />}
          {tabActiva === "inventario" && <Inventario tipo="venta" />}
          {tabActiva === "cafeteria" && <Inventario tipo="insumo" />}
          {tabActiva === "activos" && <Inventario tipo="equipo" />}
          {tabActiva === "reporte" && <Reporte />}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
import { useState } from "react";
import Caja from "./pages/Caja";
import AdminDashboard from "./pages/admin";
import { setToastHandler } from "./hooks/inventario";
import "./styles/toast.css";
import { showToast, ToastContainer } from "./pages/toast";

// Conectar el handler de notificaciones con el hook de inventario
setToastHandler(showToast);

function App() {
  const [rol, setRol] = useState("cajero");

  return (
    <div>
      {/* Contenedor de notificaciones - se muestra en toda la app */}
      <ToastContainer />
      
      {/* Botones de cambio de rol - puedes darles estilo después */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 100,
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => setRol("admin")}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #e889a9',
            background: rol === 'admin' ? '#e889a9' : 'white',
            color: rol === 'admin' ? 'white' : '#e889a9',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Admin
        </button>
        <button 
          onClick={() => setRol("cajero")}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #e889a9',
            background: rol === 'cajero' ? '#e889a9' : 'white',
            color: rol === 'cajero' ? 'white' : '#e889a9',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Cajero
        </button>
      </div>

      {rol === "admin" ? (
        <AdminDashboard />
      ) : (
        <Caja />
      )}
    </div>
  );
}

export default App;
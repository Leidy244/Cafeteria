import { useState } from "react";
import Caja from "./pages/Caja";
import AdminDashboard from "./pages/admin";
import Login from "./pages/login";
import "./styles/toast.css";
import { ToastContainer } from "./pages/toast";

type Vista = "cajero" | "admin" | "login";

function App() {
  const [vista, setVista] = useState<Vista>("cajero");

 const handleLoginExitoso = (rol: string) => {
  if (rol === "admin") {
    setVista("admin");
  } else {
    setVista("cajero");
  }
};

  const handleCerrarAdmin = () => {
    setVista("cajero");
  };

  return (
    <div>
      <ToastContainer />

      {/* Botones solo visibles en caja */}
      {vista === "cajero" && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setVista("login")}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #e889a9',
              background: 'white',
              color: '#e889a9',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Admin
          </button>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #e889a9',
              background: '#e889a9',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            disabled
          >
            Cajero
          </button>
        </div>
      )}

      {vista === "login"  && (
        <Login
          onLoginExitoso={handleLoginExitoso}
          onVolver={() => setVista("cajero")}
        />
      )}

      {vista === "admin"  && (
        <AdminDashboard onCerrarSesion={handleCerrarAdmin} />
      )}

      {vista === "cajero" && <Caja />}
    </div>
  );
}

export default App;
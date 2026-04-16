import { useState } from "react";
import Caja from "./pages/Caja";
import AdminDashboard from "./pages/admin";

function App() {
  const [rol, setRol] = useState("cajero");

  return (
    <div>
      <button onClick={() => setRol("admin")}>Admin</button>
      <button onClick={() => setRol("cajero")}>Cajero</button>

      {rol === "admin" ? (
        <>
          <AdminDashboard />
        </>
      ) : (
        <Caja />
      )}
    </div>
  );
}

export default App;
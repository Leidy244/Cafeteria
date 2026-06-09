import { useState } from "react";
import "../styles/login.css";

interface Props {
    onLoginExitoso: (rol: string) => void;
    onVolver: () => void;
}


function Login({ onLoginExitoso, onVolver }: Props) {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [verContrasena, setVerContrasena] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setError("");

        try {
            const res = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await res.json();

            if (res.ok) {
                onLoginExitoso(data.usuario.rol);
            } else {
                setError(data.error || "Credenciales incorrectas");
            }
        } catch {
            setError("Error de conexión con el servidor");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-card">

                {/* Logo */}
                <div className="login-logo">
                    <h1 className="login-titulo">Juyasia</h1>
                    <p className="login-subtitulo">Panel de administración</p>
                </div>

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>

                    <div className="login-field">
                        <label>Correo</label>
                        <input
                            type="email"
                            placeholder="admin@gmail.com"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Contraseña</label>
                        <div className="login-password-wrapper">
                            <input
                                type={verContrasena ? "text" : "password"}
                                placeholder="••••••••"
                                value={contrasena}
                                onChange={e => setContrasena(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-toggle-pass"
                                onClick={() => setVerContrasena(!verContrasena)}
                                tabIndex={-1}
                            >
                                {verContrasena ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">⚠️ {error}</div>
                    )}

                    <button type="submit" className="login-btn" disabled={cargando}>
                        {cargando ? "Verificando..." : "Ingresar →"}
                    </button>

                </form>

                <button className="login-volver" onClick={onVolver}>
                    ← Volver a caja
                </button>

            </div>
        </div>
    );
}

export default Login;
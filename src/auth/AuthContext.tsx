/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";

export interface Sesion {
  id: number;
  usuario: string;
  rolId: number;
  rol: string;
  permisos: string[];
  cambioPasswordPendiente: boolean;
}

interface AuthState {
  sesion: Sesion | null;
  verificando: boolean;
  establecerSesion: (sesion: Sesion) => void;
  cerrarSesion: () => Promise<void>;
  tienePermiso: (...permisos: string[]) => boolean;
  refrescar: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [verificando, setVerificando] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      setSesion(await api.get<Sesion>("/auth/me"));
    } catch {
      setSesion(null);
    } finally {
      setVerificando(false);
    }
  }, []);

  useEffect(() => {
    // La sesión se obtiene del servidor una sola vez al montar el proveedor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refrescar();
  }, [refrescar]);

  const cerrarSesion = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      api.resetCsrf();
      setSesion(null);
    }
  }, []);

  const valor = useMemo<AuthState>(() => ({
    sesion,
    verificando,
    establecerSesion: setSesion,
    cerrarSesion,
    tienePermiso: (...permisos) =>
      permisos.some((permiso) => sesion?.permisos.includes(permiso)),
    refrescar,
  }), [cerrarSesion, refrescar, sesion, verificando]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }
  return context;
}

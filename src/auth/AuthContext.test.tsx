import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../api/client";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    resetCsrf: vi.fn(),
  },
}));

function EstadoSesion() {
  const { sesion, verificando, tienePermiso } = useAuth();
  if (verificando) return <span>verificando</span>;
  return (
    <span>
      {sesion?.usuario ?? "sin sesión"}|
      {tienePermiso("Notas") ? "con notas" : "sin notas"}
    </span>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga la sesión y expone los permisos del servidor", async () => {
    vi.mocked(api.get).mockResolvedValue({
      id: 1,
      usuario: "docente",
      rolId: 2,
      rol: "Docente",
      permisos: ["Notas"],
    });

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    await waitFor(() =>
      expect(screen.getByText("docente|con notas")).toBeTruthy(),
    );
  });

  it("mantiene la aplicación como invitado cuando no existe sesión", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("No autenticado"));

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    await waitFor(() =>
      expect(screen.getByText("sin sesión|sin notas")).toBeTruthy(),
    );
  });
});

// components/AuthWrapper.js
"use client";
import { useAuth } from "../hooks/useAuth";

export default function AuthWrapper({ children }) {
  const { isAuthenticated, isLoading, resetAccess } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "18px"
        }}
      >
        🔄 Inizializzazione...
      </div>
    );
  }

  return (
    <div>
      {/* Debug button - rimuovi in produzione */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={resetAccess}
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            padding: "5px 10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "15px",
            fontSize: "12px",
            cursor: "pointer",
            zIndex: 1000,
            opacity: 0.7
          }}
        >
          🔄 Reset Auth
        </button>
      )}

      {children}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [secretKey, setSecretKey] = useState(null);

  useEffect(() => {
    // Controlla se arriva con URL segreto
    const urlParams = new URLSearchParams(window.location.search);
    const caccaId = urlParams.get("caccaId");

    if (caccaId) {
      // Testa il caccaId chiamando una server action di test
      testCaccaId(caccaId).then((isValid) => {
        if (isValid) {
          localStorage.setItem("poop_access_enabled", "true");
          localStorage.setItem("poop_cacca_id", caccaId);
          setSecretKey(caccaId);
          setIsAuthenticated(true);

          // Pulisci l'URL per sicurezza
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          console.log("✅ Accesso abilitato via URL segreto");
        } else {
          console.log("❌ caccaId non valido");
        }
        setIsLoading(false);
      });
    } else {
      // Controlla se è già autenticato da visita precedente
      const saved = localStorage.getItem("poop_access_enabled");
      const savedCaccaId = localStorage.getItem("poop_cacca_id");

      if (saved === "true" && savedCaccaId) {
        // Testa se il caccaId salvato è ancora valido
        testCaccaId(savedCaccaId).then((isValid) => {
          if (isValid) {
            setSecretKey(savedCaccaId);
            setIsAuthenticated(true);
            console.log("✅ Accesso già abilitato da localStorage");
          } else {
            // Chiave non più valida, resetta
            localStorage.removeItem("poop_access_enabled");
            localStorage.removeItem("poop_cacca_id");
            console.log("⚠️ Chiave salvata non più valida");
          }
          setIsLoading(false);
        });
      } else {
        console.log("⚠️ Accesso non abilitato - UI disabilitata");
        setIsLoading(false);
      }
    }
  }, []);

  const getCaccaId = () => secretKey;

  const resetAccess = () => {
    localStorage.removeItem("poop_access_enabled");
    localStorage.removeItem("poop_cacca_id");
    setSecretKey(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    getCaccaId,
    resetAccess
  };
}

// Server action per testare la validità del caccaId
async function testCaccaId(caccaId) {
  try {
    const { validateCaccaId } = await import("../lib/auth-server");
    await validateCaccaId(caccaId);
    return true;
  } catch {
    return false;
  }
}

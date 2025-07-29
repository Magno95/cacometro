"use client";
import { useState, useEffect } from "react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installMethod, setInstallMethod] = useState("");

  useEffect(() => {
    // Rileva il tipo di dispositivo e browser
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Controlla se l'app è già installata
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = window.navigator.standalone === true;

    console.log("PWA Debug:", { isIOS, isAndroid, isChrome, isMobile, isStandalone, isIOSStandalone });

    if (isStandalone || isIOSStandalone) {
      console.log("App già installata, nascondo il pulsante");
      setShowInstallButton(false);
      return;
    }

    // iOS Safari - istruzioni manuali
    if (isIOS && !isStandalone) {
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      console.log("iOS rilevato, Safari:", isSafari);

      if (isSafari) {
        setInstallMethod("ios");
        setShowInstallButton(true);
      } else {
        // Su iOS con browser diversi da Safari, mostra avviso
        setInstallMethod("ios-unsupported");
        setShowInstallButton(true);
      }
      return;
    }

    // Android/Chrome - usa beforeinstallprompt o fallback
    const handleBeforeInstallPrompt = (e) => {
      console.log("beforeinstallprompt ricevuto");
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallMethod("android");
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA installata con successo");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Aggiungi event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Fallback per Android quando beforeinstallprompt non si attiva
    if (isAndroid && isChrome && !isStandalone) {
      // Aspetta un po' per vedere se arriva l'evento
      const fallbackTimer = setTimeout(() => {
        if (!deferredPrompt && !showInstallButton) {
          console.log("Fallback Android: mostro istruzioni manuali");
          setInstallMethod("android-manual");
          setShowInstallButton(true);
        }
      }, 2000);

      return () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    // Cleanup
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt, showInstallButton]);

  const handleInstallClick = async () => {
    if (installMethod === "ios") {
      // Mostra istruzioni per iOS Safari
      const message = `Per installare l'app su iPhone/iPad:

📱 STEP BY STEP:
1. Tocca il pulsante CONDIVIDI (□↗) qui sotto
2. Scorri verso il basso nel menu
3. Tocca "Aggiungi alla schermata Home"
4. Tocca "Aggiungi" per confermare

✨ L'app apparirà nella tua schermata home come un'app nativa!`;

      alert(message);
      return;
    }

    if (installMethod === "ios-unsupported") {
      // Avviso per browser non Safari su iOS
      const message = `⚠️ ATTENZIONE:

Le PWA su iOS funzionano solo con Safari.

🔄 Per installare l'app:
1. Apri questo sito con SAFARI
2. Usa il pulsante Condividi (□↗)
3. Seleziona "Aggiungi alla schermata Home"

Chrome, Firefox ed altri browser iOS non supportano l'installazione di PWA.`;

      alert(message);
      return;
    }

    if (installMethod === "android-manual") {
      // Mostra istruzioni per Android
      alert(
        'Per installare l\'app:\n\n1. Tocca il menu del browser (⋮)\n2. Seleziona "Aggiungi alla schermata Home" o "Installa app"\n3. Conferma l\'installazione'
      );
      return;
    }

    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("Utente ha accettato l'installazione");
      } else {
        console.log("Utente ha rifiutato l'installazione");
      }
    } catch (error) {
      console.error("Errore durante l'installazione:", error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  // Debug: forza la visualizzazione del pulsante (rimuovi in produzione)
  const handleForceShow = () => {
    setInstallMethod("debug");
    setShowInstallButton(true);
  };

  if (!showInstallButton) {
    // Pulsante debug temporaneo - rimuovilo in produzione
    return (
      <button
        onClick={handleForceShow}
        style={{
          position: "fixed",
          bottom: "70px",
          right: "20px",
          padding: "8px 12px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "15px",
          fontSize: "12px",
          zIndex: 999,
          opacity: 0.5
        }}
      >
        🐛 Debug PWA
      </button>
    );
  }

  const getButtonText = () => {
    if (isInstalling) return "Installando...";

    switch (installMethod) {
      case "ios":
        return "Installa su iOS";
      case "ios-unsupported":
        return "Usa Safari";
      case "android-manual":
        return "Come Installare";
      case "debug":
        return "Debug Install";
      default:
        return "Installa App";
    }
  };

  const getButtonIcon = () => {
    switch (installMethod) {
      case "ios":
        return "🍎";
      case "ios-unsupported":
        return "⚠️";
      case "android-manual":
        return "🤖";
      case "debug":
        return "🐛";
      default:
        return "📱";
    }
  };

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "12px 20px",
        backgroundColor: installMethod === "debug" ? "#dc3545" : "#007bff",
        color: "white",
        border: "none",
        borderRadius: "25px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: isInstalling ? "not-allowed" : "pointer",
        boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        opacity: isInstalling ? 0.7 : 1,
        transition: "all 0.2s ease",
        animation: "pulse 2s infinite"
      }}
      onMouseEnter={(e) => {
        if (!isInstalling) {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0 6px 16px rgba(0, 123, 255, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isInstalling) {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(0, 123, 255, 0.3)";
        }
      }}
    >
      {isInstalling ? (
        <>
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #ffffff80",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}
          ></span>
          Installando...
        </>
      ) : (
        <>
          <span style={{ fontSize: "16px" }}>{getButtonIcon()}</span>
          {getButtonText()}
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          }
          50% {
            box-shadow: 0 4px 16px rgba(0, 123, 255, 0.5);
          }
          100% {
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}

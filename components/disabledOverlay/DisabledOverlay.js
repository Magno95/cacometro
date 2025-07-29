// components/DisabledOverlay.js
"use client";

export default function DisabledOverlay({ isVisible, children }) {
  if (!isVisible) {
    return children;
  }

  return (
    <div style={{ position: "relative" }}>
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "18px",
          textAlign: "center",
          borderRadius: "10px",
          zIndex: 10
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>
        <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Accesso Riservato</div>
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          Chiedi URL segreto agli amici!
          <br />
          Poi installa la PWA per non perderlo più 📱
        </div>
      </div>
    </div>
  );
}

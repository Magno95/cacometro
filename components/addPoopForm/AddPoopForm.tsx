"use client";

import React, { useState } from "react";
import { addPoopAction } from "@/actions/poops-actions";
import { useCaccaSession } from "@/hooks/useCaccaSession";
import Link from "next/link";

type Props = {
  onPoopAdded?: () => void;
};

export default function AddPoopForm({ onPoopAdded }: Props) {
  const { pooperName, roomCode } = useCaccaSession();

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pooperName || !roomCode) {
      setStatus("❌ Dati mancanti per aggiungere la poop");
      return;
    }

    const confirm = window.confirm("💩 Hai veramente cacato?");
    if (!confirm) {
      setStatus("❌ Poop non aggiunta, operazione annullata.");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setStatus("💩 Aggiungendo poop...");
    setLoading(true);

    try {
      const result = await addPoopAction({ pooperName, roomCode });

      if (result.success) {
        setStatus(`✅ Poop aggiunta! Totale: ${result.count}`);
        onPoopAdded?.();
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("❌ Qualcosa è andato storto.");
      }
    } catch (error: any) {
      console.error("Errore:", error);
      setStatus(`❌ ${error.message || "Errore sconosciuto"}`);
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!pooperName || !roomCode) {
    return <p style={{ textAlign: "center" }}>⏳ Dati non trovati. Ricarica la pagina.</p>;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>💩 Aggiungi Poop</h2>

      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#ffc107",
            color: "#212529",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "💩 In corso..." : `💩 Aggiungi Poop per ${pooperName}`}
        </button>
      </form>

      {status && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: status.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: status.startsWith("✅") ? "#155724" : "#721c24",
            border: `1px solid ${status.startsWith("✅") ? "#c3e6cb" : "#f5c6cb"}`
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}

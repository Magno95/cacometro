"use client";
import { useState } from "react";
import { addPooperAction } from "actions/poops-actions"; // Aggiusta il path
import Link from "next/link";
export default function AddPooperForm() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("Il nome non può essere vuoto");
      return;
    }

    setStatus("Aggiungendo pooper...");

    try {
      const result = await addPooperAction({ name: name.trim() });

      if (result.success) {
        setStatus(`✅ Pooper "${result.pooper.name}" aggiunto con successo!`);
        setName(""); // Resetta il form

        // Rimuovi il messaggio dopo 3 secondi
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      console.error("Errore:", error);
      setStatus(`❌ ${error.message}`);

      // Rimuovi il messaggio di errore dopo 5 secondi
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>👥 Aggiungi Nuovo Pooper</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Nome del pooper"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={status === "Aggiungendo pooper..."}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: status === "Aggiungendo pooper..." ? "not-allowed" : "pointer",
            opacity: status === "Aggiungendo pooper..." ? 0.7 : 1
          }}
        >
          ➕ Aggiungi Pooper
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

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link
          href="/"
          style={{
            color: "#007bff",
            textDecoration: "none",
            marginRight: "15px"
          }}
        >
          🏠 Torna alla Home
        </Link>
        <Link
          href="/add-poops"
          style={{
            color: "#007bff",
            textDecoration: "none"
          }}
        >
          💩 Aggiungi Poops
        </Link>
      </div>
    </div>
  );
}

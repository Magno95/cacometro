"use client";
import { useState, useEffect } from "react";
import { addPoopAction, listPoopersAction } from "actions/poops-actions";
import Link from "next/link";
import { useAuth } from "hooks/useAuth";

export default function AddPoopForm() {
  const [selectedPooper, setSelectedPooper] = useState("");
  const [poopers, setPoopers] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getCaccaId, isAuthenticated } = useAuth();

  useEffect(() => {
    loadPoopers();
  }, []);

  const loadPoopers = async () => {
    try {
      setLoading(true);
      const poopersList = await listPoopersAction();
      setPoopers(poopersList);

      if (poopersList.length === 0) {
        setStatus("⚠️ Nessun pooper trovato! Aggiungi prima i poopers.");
      }
    } catch (error) {
      console.error("Errore nel caricare i poopers:", error);
      setStatus("❌ Errore nel caricare i poopers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPooper) {
      setStatus("Seleziona un pooper!");
      return;
    }

    setStatus("Aggiungendo poop...");

    const caccaId = getCaccaId();

    try {
      const result = await addPoopAction({ pooperName: selectedPooper, caccaId });

      if (result.success) {
        setStatus(`✅ Poop aggiunta a ${result.pooperName}! Totale: ${result.count}`);
        setSelectedPooper(""); // Resetta la selezione

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

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Caricamento poopers...</div>;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>💩 Aggiungi Poop</h2>

      {poopers.length === 0 ? (
        <div style={{ textAlign: "center" }}>
          <p>⚠️ Nessun pooper disponibile!</p>
          <a
            href="/add-poopers"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              marginTop: "10px"
            }}
          >
            ➕ Aggiungi Poopers
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Seleziona Pooper:</label>
            <select
              value={selectedPooper}
              onChange={(e) => setSelectedPooper(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "16px",
                backgroundColor: "white"
              }}
            >
              <option value="">-- Scegli un pooper --</option>
              {poopers.map((pooper) => (
                <option key={pooper.name} value={pooper.name}>
                  {pooper.name} (💩 {pooper.totalPoops})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={status === "Aggiungendo poop..." || !selectedPooper}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: status === "Aggiungendo poop..." || !selectedPooper ? "not-allowed" : "pointer",
              opacity: status === "Aggiungendo poop..." || !selectedPooper ? 0.7 : 1
            }}
          >
            💩 Aggiungi Poop
          </button>
        </form>
      )}

      {status && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: status.startsWith("✅") ? "#d4edda" : status.startsWith("⚠️") ? "#fff3cd" : "#f8d7da",
            color: status.startsWith("✅") ? "#155724" : status.startsWith("⚠️") ? "#856404" : "#721c24",
            border: `1px solid ${status.startsWith("✅") ? "#c3e6cb" : status.startsWith("⚠️") ? "#ffeaa7" : "#f5c6cb"}`
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
          href="/add-poopers"
          style={{
            color: "#007bff",
            textDecoration: "none"
          }}
        >
          👥 Gestisci Poopers
        </Link>
      </div>
    </div>
  );
}

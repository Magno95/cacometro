// components/Leaderboard.js - ESEMPIO AGGIORNATO
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { listPoopsAction } from "../../actions/poops-actions";

import Link from "next/link";

function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const [poops, setPoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPoops();
  }, []);

  const loadPoops = async () => {
    try {
      setLoading(true);
      const data = await listPoopsAction();
      const sortedData = data.sort((a, b) => b.count - a.count);
      setPoops(sortedData);
    } catch (err) {
      console.error("Errore nel caricare le poops:", err);
      setError("Errore nel caricare i dati");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>❌ {error}</div>;
  }

  return (
    <div>
      <h2>🏆 Leaderboard Cacche</h2>
      {poops.length === 0 ? (
        <p>Nessuna cacca registrata ancora!</p>
      ) : (
        <div>
          {poops.map((poop, index) => (
            <div
              key={poop.pooperName}
              style={{
                padding: "10px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#f9f9f9"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                  </span>
                  <span style={{ marginLeft: "10px", fontSize: "16px" }}>{poop.pooperName}</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>💩 {poop.count}</div>
              </div>
              {poop.lastUpdated && (
                <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  Ultimo aggiornamento: {new Date(poop.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={loadPoops}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          🔄 Aggiorna Leaderboard
        </button>

        {/* Pulsanti disabilitati se non autenticato */}
        <Link
          href="/add-poops"
          style={{
            padding: "10px 20px",
            backgroundColor: isAuthenticated ? "#ffc107" : "#ccc",
            color: isAuthenticated ? "#212529" : "#666",
            textDecoration: "none",
            borderRadius: "5px",
            display: "inline-block",
            marginRight: "10px",
            pointerEvents: isAuthenticated ? "auto" : "none"
          }}
        >
          💩 {isAuthenticated ? "Aggiungi Poop" : "Aggiungi Poop (Disabilitato)"}
        </Link>

        <Link
          href="/add-poopers"
          style={{
            padding: "10px 20px",
            backgroundColor: isAuthenticated ? "#28a745" : "#ccc",
            color: isAuthenticated ? "white" : "#666",
            textDecoration: "none",
            borderRadius: "5px",
            display: "inline-block",
            pointerEvents: isAuthenticated ? "auto" : "none"
          }}
        >
          👥 {isAuthenticated ? "Gestisci Poopers" : "Gestisci Poopers (Disabilitato)"}
        </Link>
      </div>
    </div>
  );
}

export default Leaderboard;

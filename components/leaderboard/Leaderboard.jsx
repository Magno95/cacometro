// components/Leaderboard.js - ESEMPIO AGGIORNATO
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { listPoopersAction, listPoopsAction } from "../../actions/poops-actions";

function Leaderboard({ poopRoomId, pooperName }) {
  const { isAuthenticated } = useAuth();
  const [poops, setPoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("poopRoomId:", poopRoomId);

    loadPoops();
  }, []);

  const loadPoops = async () => {
    try {
      setLoading(true);
      const data = await listPoopersAction(poopRoomId);
      console.log(data);
      const sortedData = data.poopers.sort((a, b) => b.poop_count - a.poop_count);
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
    <div className="px-4 py-8">
      <h2>🏆 Leaderboard Cacche</h2>
      {poops.length === 0 ? (
        <p>Nessuna cacca registrata ancora!</p>
      ) : (
        <div>
          {poops.map((poop, index) => (
            <div
              key={poop.name}
              style={{
                padding: "10px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "5px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                  </span>
                  <span style={{ marginLeft: "10px", fontSize: "16px" }}>{poop.name}</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>💩 {poop.poop_count}</div>
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
    </div>
  );
}

export default Leaderboard;

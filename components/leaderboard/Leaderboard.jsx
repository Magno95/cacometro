// components/Leaderboard.js - ESEMPIO AGGIORNATO
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { listPoopersAction, listPoopsAction } from "../../actions/poops-actions";

const LOADING_BOX = new Array(10).fill(null);

function Leaderboard({ poopRoomId, pooperName }) {
  const { isAuthenticated } = useAuth();
  const [poops, setPoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPoops = useCallback(async () => {
    try {
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
  }, [poopRoomId]);

  useEffect(() => {
    console.log("poopRoomId:", poopRoomId);

    loadPoops();

    // Ascolta per aggiornamenti della leaderboard
    const handlePoopAdded = () => {
      loadPoops();
    };

    window.addEventListener("poopAdded", handlePoopAdded);

    return () => {
      window.removeEventListener("poopAdded", handlePoopAdded);
    };
  }, [poopRoomId, loadPoops]);

  if (loading) {
    return (
      <div>
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }
          .loading-skeleton {
            background: linear-gradient(90deg, #f7f7f700 25%, #e0e0e00a 50%, #f0f0f00d 75%);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
        <div className="p-2">
          {LOADING_BOX.map((_, index) => (
            <div
              key={index}
              className="loading-skeleton"
              style={{
                padding: "10px",
                margin: "5px 0",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                height: "50px",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  className="loading-skeleton"
                  style={{
                    width: "60%",
                    height: "20px",
                    borderRadius: "4px"
                  }}
                ></div>
                <div
                  className="loading-skeleton"
                  style={{
                    width: "30px",
                    height: "20px",
                    borderRadius: "4px"
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div>❌ {error}</div>;
  }

  return (
    <div className="p-2">
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
                borderRadius: "8px",
                height: "50px"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;

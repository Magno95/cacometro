"use client";

import { useEffect, useState } from "react";
import { listPoopsLogByRoomAction } from "@/actions/poops-actions";
import { useCaccaSession } from "@/hooks/useCaccaSession";

export default function PoopsLog() {
  const { roomCode } = useCaccaSession();
  const [log, setLog] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode) return;

    const fetchLog = async () => {
      setLoading(true);
      try {
        const data = await listPoopsLogByRoomAction(roomCode);
        setLog(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [roomCode]);

  if (loading) return <p className="p-4">⏳ Caricamento log...</p>;
  if (error) return <p className="p-4 text-red-600">❌ {error}</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📜 Log delle Poops</h2>
      {log.length === 0 ? (
        <p>Nessuna poop registrata.</p>
      ) : (
        <ul className="space-y-2">
          {log.map((entry) => (
            <li key={entry.id} className="border p-2 rounded text-sm flex justify-between">
              <span>💩 {entry.name}</span>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

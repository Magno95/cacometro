"use client";

import { useState } from "react";
import { checkOrCreatePooperAction } from "@/actions/poops-actions";

type Props = {
  poopRoomCode?: string | null;
  onSave: (roomId: string, name: string, roomCode: string) => void;
};

export default function PoopOverlay({ poopRoomCode, onSave }: Props) {
  const [room, setRoom] = useState(poopRoomCode || "");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await checkOrCreatePooperAction(room.trim(), name.trim());
      onSave(result.poopRoomId, room.trim(), name.trim());
    } catch (e: any) {
      setError(e.message || "Errore sconosciuto");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">🎉 Entra nel Caccometro</h2>

        {!poopRoomCode && (
          <div className="flex flex-col">
            <label htmlFor="room" className="text-sm font-medium text-gray-700 mb-1">
              Codice stanza
            </label>
            <input
              id="room"
              name="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              required
            />
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
            Il tuo nome
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
          Entra
        </button>

        {error && <p className="text-red-600 text-center text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}

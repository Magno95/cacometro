"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkOrCreatePooperAction } from "@/actions/poops-actions";

type Props = {
  poopRoomCode?: string | null;
  onSave: (room: string, name: string, roomCode: string) => void;
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
      onSave(result.poopRoomId, room.trim(), result.pooperName);
    } catch (e: any) {
      setError(e.message || "Errore sconosciuto");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000aa",
        zIndex: 9999
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "30px",
          maxWidth: "400px",
          margin: "10% auto",
          borderRadius: "10px"
        }}
      >
        <h2 className="text-black">🎉 Entra nel Caccometro</h2>

        {!poopRoomCode && (
          <>
            <label className="text-black">
              Codice stanza:
              <input
                id="room"
                name="room"
                className="text-black border-black border-b-1"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
              />
            </label>
            <br />
          </>
        )}

        <label className="text-black">
          Il tuo nome:
          <input
            id="name"
            name="name"
            className="text-black border-b-1 border-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Entra</button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>
    </div>
  );
}

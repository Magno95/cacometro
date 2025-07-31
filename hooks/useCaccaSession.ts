"use client";
import { useEffect, useState } from "react";

export function useCaccaSession() {
  const [pooperName, setPooperName] = useState<string | null>(null);
  const [caccaId, setCaccaId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("poop_room_id");
    const storedCode = localStorage.getItem("poop_room_code");
    const pooperMap = JSON.parse(localStorage.getItem("pooper_by_room") || "{}");
    const name = storedId ? pooperMap[storedId] : null;

    if (storedId && name) {
      setPooperName(name);
      setCaccaId(storedId);
      setRoomCode(storedCode || null);
    }
  }, []);

  function isValid(): boolean {
    return Boolean(pooperName && caccaId);
  }

  function setSession(roomId: string, roomCode: string, name: string) {
    const map = JSON.parse(localStorage.getItem("pooper_by_room") || "{}");
    map[roomId] = name;
    localStorage.setItem("pooper_by_room", JSON.stringify(map));
    localStorage.setItem("poop_room_id", roomId);
    localStorage.setItem("poop_room_code", roomCode);
    setCaccaId(roomId);
    setRoomCode(roomCode);
    setPooperName(name);
  }

  function clear() {
    localStorage.removeItem("poop_room_id");
    localStorage.removeItem("poop_room_code");
    localStorage.removeItem("pooper_by_room");
    setPooperName(null);
    setCaccaId(null);
    setRoomCode(null);
  }

  return {
    pooperName,
    caccaId,
    roomCode,
    isValid,
    setSession,
    clear
  };
}

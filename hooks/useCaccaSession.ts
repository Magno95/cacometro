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

  function setAdminSession(roomId: string, roomCode: string) {
    const adminName = "admin";
    const map = JSON.parse(localStorage.getItem("pooper_by_room") || "{}");
    map[roomId] = adminName;
    localStorage.setItem("pooper_by_room", JSON.stringify(map));
    localStorage.setItem("poop_room_id", roomId);
    localStorage.setItem("poop_room_code", roomCode);
    localStorage.setItem("is_admin", "true");
    setCaccaId(roomId);
    setRoomCode(roomCode);
    setPooperName(adminName);
  }

  function isAdmin(): boolean {
    return localStorage.getItem("is_admin") === "true";
  }

  function clear() {
    localStorage.removeItem("poop_room_id");
    localStorage.removeItem("poop_room_code");
    localStorage.removeItem("pooper_by_room");
    localStorage.removeItem("is_admin");
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
    setAdminSession,
    isAdmin,
    clear
  };
}

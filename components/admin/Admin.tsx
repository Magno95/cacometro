"use client";

import React, { useState, useEffect, useCallback } from "react";
import { listPoopersAction, listPoopsAction, listAllPoopRoomsAction } from "@/actions/poops-actions";
import {
  adminAddPooperAction,
  adminAddPoopAction,
  removePoopAction,
  resetPoopCountAction,
  setPoopCountAction,
  resetAllDataAction,
  removePooperAction
} from "@/actions/admin/poops-admin-actions";
import { Trash2, Plus, Minus, RotateCcw, Settings, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useCaccaSession } from "@/hooks/useCaccaSession";
import { adminLoginAction } from "@/actions/admin/admin-login";
import { PoopRoom } from "@/utils/types";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

export default function AdminPage() {
  const { roomCode, setAdminSession } = useCaccaSession();
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [poopers, setPoopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [newPooperName, setNewPooperName] = useState("");
  const [confirmResetText, setConfirmResetText] = useState("");

  // Nuovi stati per le poop room
  const [allPoopRooms, setAllPoopRooms] = useState<PoopRoom[]>([]);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(roomCode || "");

  const showMessage = (text, type = "info") => {
    toast(text, {
      duration: 4000,
      position: "bottom-center",
      style: {
        background: type === "success" ? "#d4edda" : type === "error" ? "#f8d7da" : "#cce5ff",
        color: type === "success" ? "#155724" : type === "error" ? "#721c24" : "#004085",
        border: type === "success" ? "1px solid #c3e6cb" : type === "error" ? "1px solid #f5c6cb" : "1px solid #b8daff",
        width: "220px",
        textAlign: "center",
        borderRadius: "100px",
        fontSize: "12px",
        height: "40px"
      }
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLoginAction({ password: adminPassword });
      if (res.success) {
        setIsAdminAuthenticated(true);
        // Salva la password nel sessionStorage per il prossimo reload
        sessionStorage.setItem("adminPassword", adminPassword);
        sessionStorage.setItem("isAdminAuthenticated", "true");

        showMessage("Accesso Admin autorizzato", "success");
      } else {
        showMessage("Password admin non valida", "error");
      }
    } catch (err) {
      showMessage("Errore autenticazione", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPoopers = useCallback(async () => {
    if (!selectedRoomCode) return;
    setLoading(true);
    console.log("Loading poopers for room:", selectedRoomCode);
    const res = await listPoopersAction(selectedRoomCode);
    if (res.success) setPoopers(res.poopers);
    else showMessage("Errore nel caricare i poopers", "error");
    setLoading(false);
  }, [selectedRoomCode]);

  const loadAllPoopRooms = useCallback(async () => {
    try {
      console.log("Loading poop rooms...");
      const rooms = await listAllPoopRoomsAction();
      console.log("Received rooms in component:", rooms);
      setAllPoopRooms(rooms);
    } catch (error) {
      console.error("Error in loadAllPoopRooms:", error);
      showMessage("Errore nel caricare le poop room", "error");
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const storedPassword = sessionStorage.getItem("adminPassword");
      if (!storedPassword) return;

      try {
        const res = await adminLoginAction({ password: storedPassword });
        if (res.success) {
          setIsAdminAuthenticated(true);
          setAdminPassword(storedPassword);
        } else {
          sessionStorage.removeItem("adminPassword");
          sessionStorage.removeItem("isAdminAuthenticated");
        }
      } catch {
        sessionStorage.removeItem("adminPassword");
        sessionStorage.removeItem("isAdminAuthenticated");
      }
    };

    checkSession();
  }, []); // Solo inizializzazione, senza dipendenze

  // Effetto separato per gestire roomCode
  useEffect(() => {
    if (roomCode && !selectedRoomCode) {
      setSelectedRoomCode(roomCode);
    }
  }, [roomCode, selectedRoomCode]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAllPoopRooms();
      loadPoopers();
    }
  }, [isAdminAuthenticated, loadPoopers, loadAllPoopRooms]);

  // Effetto per ricaricare i poopers quando cambia la room selezionata
  useEffect(() => {
    if (isAdminAuthenticated && selectedRoomCode) {
      loadPoopers();
    }
  }, [selectedRoomCode, isAdminAuthenticated, loadPoopers]);

  const handleAddPooper = async () => {
    if (!newPooperName.trim()) return;
    if (!selectedRoomCode) {
      showMessage("Seleziona una poop room", "error");
      return;
    }
    try {
      await adminAddPooperAction({ name: newPooperName, roomCode: selectedRoomCode, adminPassword });
      showMessage("Pooper aggiunto", "success");
      setNewPooperName("");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleModifyPoop = async (name, type, count = 1) => {
    try {
      if (type === "add")
        await adminAddPoopAction({ pooperName: name, roomCode: selectedRoomCode, adminPassword, count });
      if (type === "remove")
        await removePoopAction({ pooperName: name, roomCode: selectedRoomCode, adminPassword, count });
      if (type === "reset") await resetPoopCountAction({ pooperName: name, roomCode: selectedRoomCode, adminPassword });
      showMessage("Aggiornamento avvenuto", "success");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleSetCount = async (name, current) => {
    const val = parseInt(prompt("Nuovo valore:", current));
    if (isNaN(val)) return;
    try {
      await setPoopCountAction({ pooperName: name, roomCode: selectedRoomCode, newCount: val, adminPassword });
      showMessage("Conteggio aggiornato", "success");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleResetAll = async () => {
    if (confirmResetText !== "RESET TUTTO") {
      showMessage("Testo conferma errato", "error");
      return;
    }
    try {
      await resetAllDataAction({ adminPassword, confirmText: confirmResetText });
      showMessage("Reset completo eseguito", "success");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleRemovePooper = async (name: string) => {
    if (!confirm(`Vuoi davvero eliminare ${name}?`)) return;

    try {
      await removePooperAction({ pooperName: name, roomCode: selectedRoomCode, adminPassword });
      showMessage("Pooper eliminato", "success");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleRoomChange = (newRoomCode: string) => {
    if (newRoomCode === selectedRoomCode) return; // Evita chiamate inutili

    setPoopers([]); // Pulisce i poopers mentre carica la nuova room
    setSelectedRoomCode(newRoomCode);

    // Se è stata selezionata una room, salva la sessione admin con quella room
    if (newRoomCode) {
      setAdminSession(newRoomCode, newRoomCode);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center">
        <form onSubmit={handleLogin} className="p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2 right-2 text-sm"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
            Accedi
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gestione Poopers</h2>

        {/* Selettore Poop Room */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <label className="block text-sm font-medium mb-2 text-black">Seleziona Poop Room:</label>
          <select
            value={selectedRoomCode}
            onChange={(e) => handleRoomChange(e.target.value)}
            className="w-full p-2 border rounded-lg text-black"
          >
            <option value="">-- Seleziona una room --</option>
            {allPoopRooms.map((room) => (
              <option key={room.id} value={room.code}>
                {room.code || `Room ${room.code}`} ({room.id})
              </option>
            ))}
            {/* Fallback per la room corrente se non è nelle altre */}
            {roomCode && !allPoopRooms.find((room) => room.id === roomCode) && (
              <option value={roomCode}>Room corrente ({roomCode})</option>
            )}
          </select>
          <div className="text-xs text-gray-500 mt-1">Rooms caricate: {allPoopRooms.length}</div>
          {selectedRoomCode && (
            <p className="text-sm text-gray-600 mt-1">
              Room corrente: <span className="font-mono text-black">{selectedRoomCode}</span>
            </p>
          )}
        </div>

        {!selectedRoomCode ? (
          <div className="text-center text-gray-500 py-8">Seleziona una poop room per iniziare a gestire i poopers</div>
        ) : (
          <>
            <div className="mb-4 flex gap-2">
              <input
                value={newPooperName}
                onChange={(e) => setNewPooperName(e.target.value)}
                placeholder="Nome nuovo pooper"
                className="border p-2 rounded flex-1"
              />
              <button onClick={handleAddPooper} className="bg-green-600 text-white px-4 py-2 rounded">
                <Plus size={16} /> Aggiungi
              </button>
            </div>

            <div className="grid gap-3">
              {loading ? (
                <div className="text-center py-4">Caricamento poopers...</div>
              ) : poopers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">Nessun pooper in questa room</div>
              ) : (
                poopers.map((p) => (
                  <div key={p.name} className="border p-3 rounded flex justify-between items-center">
                    <div>
                      <strong>{p.name}</strong> – {p.poop_count} 💩
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModifyPoop(p.name, "add", 1)}
                        className="bg-green-500 text-white p-2 rounded"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleModifyPoop(p.name, "remove", 1)}
                        className="bg-orange-500 text-white p-2 rounded"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleSetCount(p.name, p.poop_count)}
                        className="bg-blue-500 text-white p-2 rounded"
                      >
                        Set
                      </button>
                      <button
                        onClick={() => handleModifyPoop(p.name, "reset")}
                        className="bg-red-500 text-white p-2 rounded"
                      >
                        Reset
                      </button>
                      <button onClick={() => handleRemovePooper(p.name)} className="bg-black text-white p-2 rounded">
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-red-600 mb-2">Reset Completo</h3>
              <input
                value={confirmResetText}
                onChange={(e) => setConfirmResetText(e.target.value)}
                placeholder="Scrivi RESET TUTTO"
                className="border p-2 rounded w-full mb-2"
              />
              <button onClick={handleResetAll} className="bg-red-600 text-white px-4 py-2 rounded w-full">
                🧹 RESET TUTTO
              </button>
            </div>
          </>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded text-center text-white ${
              messageType === "success" ? "bg-green-500" : messageType === "error" ? "bg-red-500" : "bg-blue-500"
            }`}
          >
            {message}
          </div>
        )}
        <Toaster />
      </div>
    </div>
  );
}

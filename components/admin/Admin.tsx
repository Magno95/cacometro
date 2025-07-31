"use client";

import React, { useState, useEffect } from "react";
import { listPoopersAction, listPoopsAction } from "@/actions/poops-actions";
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

export default function AdminPage() {
  const { roomCode } = useCaccaSession();
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [poopers, setPoopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [newPooperName, setNewPooperName] = useState("");
  const [confirmResetText, setConfirmResetText] = useState("");

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLoginAction({ password: adminPassword });
      if (res.success) {
        setIsAdminAuthenticated(true);
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

  const loadPoopers = async () => {
    if (!roomCode) return;
    setLoading(true);
    const res = await listPoopersAction(roomCode);
    if (res.success) setPoopers(res.poopers);
    else showMessage("error");
    setLoading(false);
  };

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
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadPoopers();
    }
  }, [isAdminAuthenticated]);

  const handleAddPooper = async () => {
    if (!newPooperName.trim()) return;
    try {
      await adminAddPooperAction({ name: newPooperName, roomCode, adminPassword });
      showMessage("Pooper aggiunto", "success");
      setNewPooperName("");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleModifyPoop = async (name, type, count = 1) => {
    try {
      if (type === "add") await adminAddPoopAction({ pooperName: name, adminPassword, count });
      if (type === "remove") await removePoopAction({ pooperName: name, adminPassword, count });
      if (type === "reset") await resetPoopCountAction({ pooperName: name, adminPassword });
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
      await setPoopCountAction({ pooperName: name, newCount: val, adminPassword });
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
      await removePooperAction({ pooperName: name, adminPassword });
      showMessage("Pooper eliminato", "success");
      loadPoopers();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Accedi
        </button>
      </form>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestione Poopers</h2>

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
        {poopers.map((p) => (
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
              <button onClick={() => handleModifyPoop(p.name, "reset")} className="bg-red-500 text-white p-2 rounded">
                Reset
              </button>
              <button onClick={() => handleRemovePooper(p.name)} className="bg-black text-white p-2 rounded">
                🗑
              </button>
            </div>
          </div>
        ))}
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

      {message && (
        <div
          className={`mt-4 p-3 rounded text-center text-white ${
            messageType === "success" ? "bg-green-500" : messageType === "error" ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

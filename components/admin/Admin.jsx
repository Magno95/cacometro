"use client";

import React, { useState, useEffect } from "react";
import {
  listPoopersAction,
  listPoopsAction,
  testAdminAction,
  removePooperAction,
  adminAddPoopAction,
  removePoopAction,
  resetPoopCountAction,
  setPoopCountAction,
  resetAllDataAction,
  adminAddPooperAction
} from "../../actions/poops-actions";
import { Trash2, Plus, Minus, RotateCcw, Settings, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("adminPassword") || "";
    }
    return "";
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("isAdminAuthenticated") === "true";
    }
    return false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [poopers, setPoopers] = useState([]);
  const [poops, setPoops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Modals
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showAddPooperModal, setShowAddPooperModal] = useState(false);
  const [newPooperName, setNewPooperName] = useState("");

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await testAdminAction(adminPassword);
      if (result.success) {
        sessionStorage.setItem("isAdminAuthenticated", "true");
        setIsAdminAuthenticated(true);
        showMessage("✅ Accesso admin autorizzato!", "success");
      } else {
        sessionStorage.removeItem("isAdminAuthenticated");
        showMessage("❌ Password admin non valida", "error");
      }
    } catch (error) {
      showMessage("❌ Errore di autenticazione", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [poopersData, poopsData] = await Promise.all([listPoopersAction(), listPoopsAction()]);
      setPoopers(poopersData);
      setPoops(poopsData);
    } catch (error) {
      showMessage("❌ Errore nel caricamento dati", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePooper = async (pooperName) => {
    if (!confirm(`Sei sicuro di voler eliminare ${pooperName} e tutti i suoi poops?`)) return;

    setLoading(true);
    try {
      await removePooperAction({ pooperName, adminPassword });
      showMessage(`✅ ${pooperName} eliminato con successo`, "success");
      loadData();
    } catch (error) {
      showMessage(`❌ Errore nell'eliminazione: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoop = async (pooperName, count = 1) => {
    setLoading(true);
    try {
      await adminAddPoopAction({ pooperName, adminPassword, count });
      showMessage(`✅ Aggiunti ${count} poop(s) a ${pooperName}`, "success");
      loadData();
    } catch (error) {
      showMessage(`❌ Errore: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePoop = async (pooperName, count = 1) => {
    setLoading(true);
    try {
      await removePoopAction({ pooperName, adminPassword, count });
      showMessage(`✅ Rimossi ${count} poop(s) da ${pooperName}`, "success");
      loadData();
    } catch (error) {
      showMessage(`❌ Errore: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetCount = async (pooperName) => {
    if (!confirm(`Sei sicuro di voler resettare il conteggio di ${pooperName}?`)) return;

    setLoading(true);
    try {
      await resetPoopCountAction({ pooperName, adminPassword });
      showMessage(`✅ Conteggio di ${pooperName} resettato`, "success");
      loadData();
    } catch (error) {
      showMessage(`❌ Errore nel reset: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetCount = async (pooperName, newCount) => {
    const count = parseInt(prompt(`Nuovo conteggio per ${pooperName}:`, newCount));
    if (count === null || isNaN(count)) return;

    setLoading(true);
    try {
      await setPoopCountAction({ pooperName, newCount: count, adminPassword });
      showMessage(`✅ Conteggio di ${pooperName} impostato a ${count}`, "success");
      loadData();
    } catch (error) {
      showMessage(`❌ Errore: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    if (resetConfirmText !== "RESET TUTTO") {
      showMessage('❌ Devi scrivere esattamente "RESET TUTTO"', "error");
      return;
    }

    setLoading(true);
    try {
      await resetAllDataAction({ adminPassword, confirmText: resetConfirmText });
      showMessage("🧹 RESET COMPLETO ESEGUITO!", "success");
      setShowResetAllModal(false);
      setResetConfirmText("");
      loadData();
    } catch (error) {
      showMessage(`❌ Errore nel reset: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPooper = async () => {
    if (!newPooperName.trim()) return;

    setLoading(true);
    try {
      await adminAddPooperAction({ name: newPooperName, adminPassword });
      showMessage(`✅ Pooper ${newPooperName} aggiunto`, "success");
      setNewPooperName("");
      setShowAddPooperModal(false);
      loadData();
    } catch (error) {
      showMessage(`❌ Errore: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔐💩</div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600">Inserisci la password admin</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  sessionStorage.setItem("adminPassword", e.target.value);
                }}
                placeholder="Password admin"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 text-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Accedi Admin"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-center ${
                messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : messageType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">👨‍💼💩</span>
                Admin Panel
              </h1>
              <p className="text-gray-600">Gestione completa del Poop Tracker</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddPooperModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Aggiungi Pooper
              </button>
              <button
                onClick={() => setShowResetAllModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <AlertTriangle size={20} />
                Reset Tutto
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "error"
                ? "bg-red-100 text-red-800"
                : messageType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👥</span>
              <div>
                <p className="text-2xl font-bold text-gray-800">{poopers.length}</p>
                <p className="text-gray-600">Poopers Totali</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💩</span>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {poopers.reduce((total, p) => total + p.totalPoops, 0)}
                </p>
                <p className="text-gray-600">Poops Totali</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {poopers.length > 0 ? Math.max(...poopers.map((p) => p.totalPoops)) : 0}
                </p>
                <p className="text-gray-600">Record Massimo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Poopers Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Settings size={24} />
            Gestione Poopers
          </h2>

          {loading && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p>Caricamento...</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {poopers.map((pooper) => (
              <div key={pooper.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow text-black">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{pooper.name}</h3>
                    <p className="text-gray-600">
                      {pooper.totalPoops} poops • Creato: {new Date(pooper.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemovePooper(pooper.name)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Elimina pooper"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAddPoop(pooper.name, 1)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    +1
                  </button>
                  <button
                    onClick={() => handleAddPoop(pooper.name, 5)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    +5
                  </button>
                  <button
                    onClick={() => handleRemovePoop(pooper.name, 1)}
                    className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 flex items-center gap-1 text-sm"
                  >
                    <Minus size={16} />
                    -1
                  </button>
                  <button
                    onClick={() => handleSetCount(pooper.name, pooper.totalPoops)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                  >
                    <Settings size={16} />
                    Set
                  </button>
                  <button
                    onClick={() => handleResetCount(pooper.name)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1 text-sm"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>

          {poopers.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🤷‍♂️</div>
              <p>Nessun pooper trovato</p>
            </div>
          )}
        </div>

        {/* Add Pooper Modal */}
        {showAddPooperModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Aggiungi Nuovo Pooper</h3>
              <input
                type="text"
                value={newPooperName}
                onChange={(e) => setNewPooperName(e.target.value)}
                placeholder="Nome del pooper"
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleAddPooper()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddPooper}
                  disabled={!newPooperName.trim() || loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => {
                    setShowAddPooperModal(false);
                    setNewPooperName("");
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset All Modal */}
        {showResetAllModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <h3 className="text-xl font-bold text-red-600">ATTENZIONE!</h3>
                <p className="text-gray-600 mt-2">
                  Questa azione eliminerà TUTTI i poopers e TUTTI i conteggi. Non è possibile annullare questa
                  operazione!
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Scrivi RESET TUTTO per confermare:</label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="RESET TUTTO"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetAll}
                  disabled={resetConfirmText !== "RESET TUTTO" || loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold"
                >
                  🧹 RESET TUTTO
                </button>
                <button
                  onClick={() => {
                    setShowResetAllModal(false);
                    setResetConfirmText("");
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// actions/poops-actions.js - VERSIONE COMPLETA CON ADMIN
"use server";
import { getStore } from "../lib/storage";
import { validateCaccaId, validateAdminPassword } from "../lib/auth-server";

function poopersStore() {
  return getStore({ name: "poopers", consistency: "strong" });
}

function poopsStore() {
  return getStore({ name: "poops", consistency: "strong" });
}
function poopLog() {
  return getStore({ name: "poopLog", consistency: "strong" });
}

// ===== AUTH ACTIONS =====
export async function testAuthAction(caccaId) {
  try {
    await validateCaccaId(caccaId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function testAdminAction(adminPassword) {
  try {
    await validateAdminPassword(adminPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== POOPERS ACTIONS =====
export async function addPooperAction({ name, caccaId }) {
  await validateCaccaId(caccaId);

  try {
    const trimmedName = name.trim();
    const existingPooper = await poopersStore().get(trimmedName, { type: "json" });

    if (existingPooper) {
      throw new Error("Questo pooper esiste già!");
    }

    const pooperData = {
      name: trimmedName,
      createdAt: new Date().toISOString(),
      totalPoops: 0
    };

    await poopersStore().setJSON(trimmedName, pooperData);
    console.log("Created pooper:", pooperData);

    return { success: true, pooper: pooperData };
  } catch (error) {
    console.error("Error adding pooper:", error);
    throw error;
  }
}

export async function addPoopAction({ pooperName, caccaId }) {
  await validateCaccaId(caccaId);

  try {
    const pooper = await poopersStore().get(pooperName, { type: "json" });
    if (!pooper) {
      throw new Error("Pooper non trovato!");
    }

    const existingPoops = await poopsStore().get(pooperName, { type: "json" });
    let poopCount = 1;
    if (existingPoops) {
      poopCount = existingPoops.count + 1;
    }

    const poopData = {
      pooperName: pooperName,
      count: poopCount,
      lastUpdated: new Date().toISOString()
    };

    await poopsStore().setJSON(pooperName, poopData);
    // Log the poop action
    await poopLog().setJSON(`${pooperName}-${Date.now()}`, {
      pooperName: pooperName,
      count: poopCount,
      timestamp: new Date().toISOString()
    });

    const updatedPooper = {
      ...pooper,
      totalPoops: poopCount
    };
    await poopersStore().setJSON(pooperName, updatedPooper);

    console.log("Added poop for:", pooperName, "New count:", poopCount);
    return { success: true, count: poopCount, pooperName };
  } catch (error) {
    console.error("Error adding poop:", error);
    throw error;
  }
}

// ===== ADMIN ACTIONS =====

// Aggiungi pooper (admin)
export async function adminAddPooperAction({ name, adminPassword }) {
  await validateAdminPassword(adminPassword);

  try {
    const trimmedName = name.trim();
    const existingPooper = await poopersStore().get(trimmedName, { type: "json" });

    if (existingPooper) {
      throw new Error("Questo pooper esiste già!");
    }

    const pooperData = {
      name: trimmedName,
      createdAt: new Date().toISOString(),
      totalPoops: 0
    };

    await poopersStore().setJSON(trimmedName, pooperData);
    console.log("Admin created pooper:", pooperData);

    return { success: true, pooper: pooperData };
  } catch (error) {
    console.error("Error admin adding pooper:", error);
    throw error;
  }
}

// Rimuovi pooper
export async function removePooperAction({ pooperName, adminPassword }) {
  await validateAdminPassword(adminPassword);

  try {
    // Rimuovi il pooper
    await poopersStore().delete(pooperName);

    // Rimuovi anche i suoi poops
    await poopsStore().delete(pooperName);

    console.log("Removed pooper and poops:", pooperName);
    return { success: true, message: `Pooper ${pooperName} rimosso con successo` };
  } catch (error) {
    console.error("Error removing pooper:", error);
    throw error;
  }
}

// Aggiungi poop (admin)
export async function adminAddPoopAction({ pooperName, adminPassword, count = 1 }) {
  await validateAdminPassword(adminPassword);

  try {
    const pooper = await poopersStore().get(pooperName, { type: "json" });
    if (!pooper) {
      throw new Error("Pooper non trovato!");
    }

    const existingPoops = await poopsStore().get(pooperName, { type: "json" });
    let newCount = count;
    if (existingPoops) {
      newCount = existingPoops.count + count;
    }

    const poopData = {
      pooperName: pooperName,
      count: newCount,
      lastUpdated: new Date().toISOString()
    };

    await poopsStore().setJSON(pooperName, poopData);

    const updatedPooper = {
      ...pooper,
      totalPoops: newCount
    };
    await poopersStore().setJSON(pooperName, updatedPooper);

    console.log(`Admin added ${count} poops for:`, pooperName, "New count:", newCount);
    return { success: true, count: newCount, pooperName };
  } catch (error) {
    console.error("Error admin adding poop:", error);
    throw error;
  }
}

// Rimuovi poop
export async function removePoopAction({ pooperName, adminPassword, count = 1 }) {
  await validateAdminPassword(adminPassword);

  try {
    const pooper = await poopersStore().get(pooperName, { type: "json" });
    if (!pooper) {
      throw new Error("Pooper non trovato!");
    }

    const existingPoops = await poopsStore().get(pooperName, { type: "json" });
    if (!existingPoops) {
      throw new Error("Nessun poop da rimuovere!");
    }

    const newCount = Math.max(0, existingPoops.count - count);

    if (newCount === 0) {
      // Se arriva a 0, rimuovi l'entry
      await poopsStore().delete(pooperName);
    } else {
      const poopData = {
        pooperName: pooperName,
        count: newCount,
        lastUpdated: new Date().toISOString()
      };
      await poopsStore().setJSON(pooperName, poopData);
    }

    const updatedPooper = {
      ...pooper,
      totalPoops: newCount
    };
    await poopersStore().setJSON(pooperName, updatedPooper);

    console.log(`Admin removed ${count} poops for:`, pooperName, "New count:", newCount);
    return { success: true, count: newCount, pooperName };
  } catch (error) {
    console.error("Error removing poop:", error);
    throw error;
  }
}

// Reset conteggio poops
export async function resetPoopCountAction({ pooperName, adminPassword }) {
  await validateAdminPassword(adminPassword);

  try {
    const pooper = await poopersStore().get(pooperName, { type: "json" });
    if (!pooper) {
      throw new Error("Pooper non trovato!");
    }

    // Rimuovi l'entry dei poops
    await poopsStore().delete(pooperName);

    // Reset il conteggio nel pooper
    const updatedPooper = {
      ...pooper,
      totalPoops: 0
    };
    await poopersStore().setJSON(pooperName, updatedPooper);

    console.log("Reset poop count for:", pooperName);
    return { success: true, pooperName, message: `Conteggio di ${pooperName} resettato` };
  } catch (error) {
    console.error("Error resetting poop count:", error);
    throw error;
  }
}

// Set conteggio specifico
export async function setPoopCountAction({ pooperName, newCount, adminPassword }) {
  await validateAdminPassword(adminPassword);

  try {
    const pooper = await poopersStore().get(pooperName, { type: "json" });
    if (!pooper) {
      throw new Error("Pooper non trovato!");
    }

    if (newCount <= 0) {
      // Se 0 o negativo, rimuovi l'entry
      await poopsStore().delete(pooperName);
    } else {
      const poopData = {
        pooperName: pooperName,
        count: newCount,
        lastUpdated: new Date().toISOString()
      };
      await poopsStore().setJSON(pooperName, poopData);
    }

    const updatedPooper = {
      ...pooper,
      totalPoops: Math.max(0, newCount)
    };
    await poopersStore().setJSON(pooperName, updatedPooper);

    console.log("Set poop count for:", pooperName, "to:", newCount);
    return { success: true, count: Math.max(0, newCount), pooperName };
  } catch (error) {
    console.error("Error setting poop count:", error);
    throw error;
  }
}

// Reset completo di tutti i dati
export async function resetAllDataAction({ adminPassword, confirmText }) {
  await validateAdminPassword(adminPassword);

  if (confirmText !== "RESET TUTTO") {
    throw new Error("Testo di conferma non corretto!");
  }

  try {
    // Lista tutti i poopers
    const poopersData = await poopersStore().list();
    const poopsData = await poopsStore().list();

    // Elimina tutti i poopers
    for (const blob of poopersData.blobs) {
      await poopersStore().delete(blob.key);
    }

    // Elimina tutti i poops
    for (const blob of poopsData.blobs) {
      await poopsStore().delete(blob.key);
    }

    console.log("🧹 RESET COMPLETO - Tutti i dati eliminati");
    return {
      success: true,
      message: `Reset completo eseguito. Eliminati ${poopersData.blobs.length} poopers e ${poopsData.blobs.length} conteggi.`
    };
  } catch (error) {
    console.error("Error resetting all data:", error);
    throw error;
  }
}

// ===== READ-ONLY ACTIONS =====
export async function listPoopersAction() {
  try {
    const data = await poopersStore().list();
    const poopers = [];

    for (const blob of data.blobs) {
      const pooperData = await poopersStore().get(blob.key, { type: "json" });
      if (pooperData) {
        poopers.push(pooperData);
      }
    }

    return poopers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error listing poopers:", error);
    return [];
  }
}

export async function listPoopsAction() {
  try {
    const data = await poopsStore().list();
    const poops = [];

    for (const blob of data.blobs) {
      const poopData = await poopsStore().get(blob.key, { type: "json" });
      if (poopData) {
        poops.push(poopData);
      }
    }

    return poops.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error listing poops:", error);
    return [];
  }
}

export async function listPoopsLogAction() {
  try {
    const data = await poopLog().list();
    const logs = [];

    for (const blob of data.blobs) {
      const logData = await poopLog().get(blob.key, { type: "json" });
      if (logData) {
        logs.push(logData);
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Error listing poop logs:", error);
    return [];
  }
}

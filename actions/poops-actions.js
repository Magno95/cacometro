"use server";
import { getStore } from "../lib/storage";
import { validateCaccaId } from "../lib/auth-server";

function poopersStore() {
  return getStore({ name: "poopers", consistency: "strong" });
}

function poopsStore() {
  return getStore({ name: "poops", consistency: "strong" });
}

// Server action per testare auth senza effetti collaterali
export async function testAuthAction(caccaId) {
  try {
    await validateCaccaId(caccaId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== POOPERS ACTIONS =====
export async function addPooperAction({ name, caccaId }) {
  // VALIDAZIONE AUTH - BLOCCANTE
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
  // VALIDAZIONE AUTH - BLOCCANTE
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

// ===== READ-ONLY ACTIONS (senza auth per visualizzare la leaderboard) =====
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

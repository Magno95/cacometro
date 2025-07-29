'use server';
import { getStore } from '@netlify/blobs';
import { uploadDisabled } from 'utils';

function poopersStore() {
  return getStore({ name: 'poopers', consistency: 'strong' });
}

function poopsStore() {
  return getStore({ name: 'poops', consistency: 'strong' });
}

// ===== POOPERS ACTIONS =====
export async function addPooperAction({ name }) {
  if (uploadDisabled) throw new Error('Sorry, uploads are disabled');

  try {
    const trimmedName = name.trim();

    // Controlla se il pooper esiste già
    const existingPooper = await poopersStore().get(trimmedName, { type: 'json' });

    if (existingPooper) {
      throw new Error('Questo pooper esiste già!');
    }

    // Crea il nuovo pooper
    const pooperData = {
      name: trimmedName,
      createdAt: new Date().toISOString(),
      totalPoops: 0
    };

    await poopersStore().setJSON(trimmedName, pooperData);
    console.log('Created pooper:', pooperData);

    return { success: true, pooper: pooperData };
  } catch (error) {
    console.error('Error adding pooper:', error);
    throw error;
  }
}

export async function listPoopersAction() {
  try {
    const data = await poopersStore().list();
    const poopers = [];

    for (const blob of data.blobs) {
      const pooperData = await poopersStore().get(blob.key, { type: 'json' });
      poopers.push(pooperData);
    }

    return poopers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error listing poopers:', error);
    return [];
  }
}

// ===== POOPS ACTIONS =====
export async function addPoopAction({ pooperName }) {
  if (uploadDisabled) throw new Error('Sorry, uploads are disabled');

  try {
    // Verifica che il pooper esista
    const pooper = await poopersStore().get(pooperName, { type: 'json' });
    if (!pooper) {
      throw new Error('Pooper non trovato!');
    }

    // Controlla se esiste già un record di poops per questo pooper
    const existingPoops = await poopsStore().get(pooperName, { type: 'json' });

    let poopCount = 1;
    if (existingPoops) {
      poopCount = existingPoops.count + 1;
    }

    // Salva i dati delle poops
    const poopData = {
      pooperName: pooperName,
      count: poopCount,
      lastUpdated: new Date().toISOString()
    };

    await poopsStore().setJSON(pooperName, poopData);

    // Aggiorna il totale del pooper
    const updatedPooper = {
      ...pooper,
      totalPoops: poopCount
    };
    await poopersStore().setJSON(pooperName, updatedPooper);

    console.log('Added poop for:', pooperName, 'New count:', poopCount);

    return { success: true, count: poopCount, pooperName };
  } catch (error) {
    console.error('Error adding poop:', error);
    throw error;
  }
}

export async function listPoopsAction() {
  try {
    const data = await poopsStore().list();
    const poops = [];

    for (const blob of data.blobs) {
      const poopData = await poopsStore().get(blob.key, { type: 'json' });
      poops.push(poopData);
    }

    return poops.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error listing poops:', error);
    return [];
  }
}

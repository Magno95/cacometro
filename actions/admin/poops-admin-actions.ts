// actions/poops-actions.js - VERSIONE COMPLETA CON ADMIN
"use server";
import { validateAdminPassword } from "@/lib/auth-server";
import { supabase } from "@/lib/supabase";

// ===== ADMIN ACTIONS =====

// Aggiungi pooper (admin)
export async function adminAddPooperAction({
  name,
  roomCode,
  adminPassword
}: {
  name: string;
  roomCode: string;
  adminPassword: string;
}) {
  await validateAdminPassword(adminPassword);

  console.log("Adding pooper:", name, "to room:", roomCode, "with admin password:", adminPassword);

  const trimmedName = name.trim();

  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // Controlla se il pooper esiste già nella stanza
  const { data: existingPooper } = await supabase
    .from("poopers")
    .select("id")
    .eq("name", trimmedName)
    .eq("poop_room_id", room.id)
    .maybeSingle();

  if (existingPooper) {
    throw new Error("Questo pooper esiste già!");
  }

  // Inserisci il pooper
  const { error: insertError } = await supabase.from("poopers").insert({
    name: trimmedName,
    poop_room_id: room.id
  });

  if (insertError) {
    throw new Error(`Errore creazione pooper: ${insertError.message}`);
  }

  return {
    success: true,
    pooper: {
      name: trimmedName,
      poop_room_id: room.id
    }
  };
}
// Aggiungi poop (admin)
export async function adminAddPoopAction({
  pooperName,
  roomCode,
  adminPassword,
  count = 1
}: {
  pooperName: string;
  roomCode: string;
  adminPassword: string;
  count?: number;
}) {
  await validateAdminPassword(adminPassword);

  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // Trova il pooper nella stanza specifica
  const { data: pooper, error } = await supabase
    .from("poopers")
    .select("id, name")
    .eq("name", pooperName)
    .eq("poop_room_id", room.id)
    .single();

  if (error || !pooper) {
    throw new Error("Pooper non trovato!");
  }

  // Inserisci count poops
  const now = new Date().toISOString();
  const poops = Array(count)
    .fill(null)
    .map(() => ({
      pooper_id: pooper.id,
      value: 1,
      created_at: now
    }));

  const { error: insertError } = await supabase.from("poops").insert(poops);
  if (insertError) {
    throw new Error(`Errore aggiunta poops: ${insertError.message}`);
  }

  return {
    success: true,
    pooperName,
    count
  };
}

// Rimuovi poop
export async function removePoopAction({
  pooperName,
  roomCode,
  adminPassword,
  count = 1
}: {
  pooperName: string;
  roomCode: string;
  adminPassword: string;
  count?: number;
}) {
  await validateAdminPassword(adminPassword);

  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // Trova il pooper nella stanza specifica
  const { data: pooper, error } = await supabase
    .from("poopers")
    .select("id")
    .eq("name", pooperName)
    .eq("poop_room_id", room.id)
    .single();

  if (error || !pooper) {
    throw new Error("Pooper non trovato!");
  }

  // Trova gli ID delle poops più recenti
  const { data: poopsToDelete } = await supabase
    .from("poops")
    .select("id")
    .eq("pooper_id", pooper.id)
    .order("created_at", { ascending: false })
    .limit(count);

  if (!poopsToDelete?.length) {
    throw new Error("Nessun poop da rimuovere");
  }

  const ids = poopsToDelete.map((p) => p.id);

  const { error: deleteError } = await supabase.from("poops").delete().in("id", ids);

  if (deleteError) {
    throw new Error(`Errore rimozione poops: ${deleteError.message}`);
  }

  return {
    success: true,
    pooperName,
    removed: ids.length
  };
}

// Reset conteggio poops
export async function resetPoopCountAction({
  pooperName,
  roomCode,
  adminPassword
}: {
  pooperName: string;
  roomCode: string;
  adminPassword: string;
}) {
  await validateAdminPassword(adminPassword);

  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // Trova il pooper nella stanza specifica
  const { data: pooper, error } = await supabase
    .from("poopers")
    .select("id")
    .eq("name", pooperName)
    .eq("poop_room_id", room.id)
    .single();

  if (error || !pooper) {
    throw new Error("Pooper non trovato!");
  }

  const { error: deleteError } = await supabase.from("poops").delete().eq("pooper_id", pooper.id);

  if (deleteError) {
    throw new Error(`Errore reset poops: ${deleteError.message}`);
  }

  return {
    success: true,
    pooperName
  };
}

// Set conteggio specifico
export async function setPoopCountAction({
  pooperName,
  roomCode,
  newCount,
  adminPassword
}: {
  pooperName: string;
  roomCode: string;
  newCount: number;
  adminPassword: string;
}) {
  await validateAdminPassword(adminPassword);

  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // Trova il pooper nella stanza specifica
  const { data: pooper, error } = await supabase
    .from("poopers")
    .select("id")
    .eq("name", pooperName)
    .eq("poop_room_id", room.id)
    .single();

  if (error || !pooper) {
    throw new Error("Pooper non trovato!");
  }

  // Rimuovi tutto
  await supabase.from("poops").delete().eq("pooper_id", pooper.id);

  if (newCount <= 0) {
    return {
      success: true,
      pooperName,
      count: 0
    };
  }

  // Re-inserisci le poop nuove
  const now = new Date().toISOString();
  const poops = Array(newCount)
    .fill(null)
    .map(() => ({
      pooper_id: pooper.id,
      value: 1,
      created_at: now
    }));

  const { error: insertError } = await supabase.from("poops").insert(poops);
  if (insertError) {
    throw new Error(`Errore impostazione poops: ${insertError.message}`);
  }

  return {
    success: true,
    pooperName,
    count: newCount
  };
}

// Reset completo di tutti i dati
export async function resetAllDataAction({
  adminPassword,
  confirmText
}: {
  adminPassword: string;
  confirmText: string;
}) {
  await validateAdminPassword(adminPassword);

  if (confirmText !== "RESET TUTTO") {
    throw new Error("Testo di conferma non corretto!");
  }

  const { error: deletePoops } = await supabase.from("poops").delete().neq("id", "");
  const { error: deletePoopers } = await supabase.from("poopers").delete().neq("id", "");

  if (deletePoops || deletePoopers) {
    throw new Error("Errore durante il reset dei dati");
  }

  return {
    success: true,
    message: "Reset completo eseguito"
  };
}

export async function removePooperAction({
  pooperName,
  roomCode,
  adminPassword
}: {
  pooperName: string;
  roomCode: string;
  adminPassword: string;
}) {
  await validateAdminPassword(adminPassword);

  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // Cerca il pooper nella stanza specifica
  const { data: pooper, error } = await supabase
    .from("poopers")
    .select("id")
    .eq("name", pooperName)
    .eq("poop_room_id", room.id)
    .single();

  if (error || !pooper) {
    throw new Error("Pooper non trovato!");
  }

  // Cancella le sue poops
  await supabase.from("poops").delete().eq("pooper_id", pooper.id);

  // Cancella il pooper
  const { error: deleteError } = await supabase.from("poopers").delete().eq("id", pooper.id);

  if (deleteError) {
    throw new Error(`Errore rimozione pooper: ${deleteError.message}`);
  }

  return {
    success: true,
    pooperName
  };
}

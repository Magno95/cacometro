// actions/poops-actions.js - VERSIONE COMPLETA CON ADMIN
"use server";

import { supabase } from "../lib/supabase";
import { Poop, Pooper } from "@/utils/types";

// ===== POOPERS ACTIONS =====
export async function addPooperAction({ name, caccaId }: { name: string; caccaId: string }) {
  const trimmedName = name.trim();

  // Trova la stanza dal caccaId (room code)
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", caccaId).single();

  if (roomError || !room) {
    throw new Error("PoopRoom non trovata!");
  }

  // Verifica che il pooper non esista già
  const { data: existingPooper } = await supabase
    .from("poopers")
    .select("id")
    .eq("name", trimmedName)
    .eq("poop_room_id", room.id)
    .maybeSingle();

  if (existingPooper) {
    throw new Error("Questo pooper esiste già!");
  }

  // Crea il pooper
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

export async function addPoopAction({ pooperName, roomCode }: { pooperName: string; roomCode: string }) {
  // await validateCaccaId(caccaId);

  // Trova la stanza dal roomCode
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata!");
  }

  // Trova il pooper dentro quella stanza
  const { data: pooper, error: pooperError } = await supabase
    .from("poopers")
    .select("id, poop_count")
    .eq("name", pooperName)
    .eq("poop_room_id", room.id)
    .single();

  if (pooperError || !pooper) {
    throw new Error("Pooper non trovato!");
  }

  // Inserisce una nuova poop
  const { error: insertError } = await supabase.from("poops").insert({
    pooper_id: pooper.id,
    value: 1
  });

  if (insertError) {
    throw new Error(`Errore durante l'inserimento della poop: ${insertError.message}`);
  }

  // Rileggi poop_count aggiornato (opzionale)
  const { data: updatedPooper } = await supabase.from("poopers").select("poop_count").eq("id", pooper.id).single();

  return {
    success: true,
    pooperName,
    count: updatedPooper?.poop_count ?? (pooper.poop_count ?? 0) + 1
  };
}
// ===== READ-ONLY ACTIONS =====
export async function listPoopersAction(
  roomCode: string
): Promise<
  { success: true; poopers: Pick<Pooper, "name" | "poop_count" | "created_at">[] } | { success: false; error: string }
> {
  // Trova la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    return { success: false, error: "PoopRoom non trovata" };
  }

  // Leggi i poopers
  const { data: poopers, error } = await supabase
    .from("poopers")
    .select("name, poop_count, created_at")
    .eq("poop_room_id", room.id)
    .order("name", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, poopers };
}

export async function listPoopsAction(): Promise<Pick<Pooper, "name" | "poop_count">[]> {
  const { data, error } = await supabase
    .from("poopers")
    .select("name, poop_count")
    .order("poop_count", { ascending: false });

  if (error) {
    console.error("Error listing poops:", error.message);
    return [];
  }

  return data ?? [];
}

export async function listPoopsLogAction(): Promise<Poop[]> {
  const { data, error } = await supabase
    .from("poops")
    .select("id, pooper_id, value, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing poop logs:", error.message);
    return [];
  }

  return data ?? [];
}

type PoopLogEntry = {
  id: string;
  name: string;
  createdAt: string;
};

export async function listPoopsLogByRoomAction(roomCode: string): Promise<PoopLogEntry[]> {
  // 1. Recupera la stanza
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Poop room non trovata");
  }

  // 2. Recupera i poopers della stanza (con nome e id)
  const { data: poopers, error: pooperError } = await supabase
    .from("poopers")
    .select("id, name")
    .eq("poop_room_id", room.id);

  if (pooperError || !poopers?.length) {
    return [];
  }

  // Mappa pooper_id → nome
  const pooperMap = new Map(poopers.map((p) => [p.id, p.name]));

  // 3. Recupera tutte le poops dei pooper di quella stanza
  const { data: poops, error: poopsError } = await supabase
    .from("poops")
    .select("id, created_at, pooper_id")
    .in("pooper_id", Array.from(pooperMap.keys()))
    .order("created_at", { ascending: false });

  if (poopsError) throw new Error(poopsError.message);

  // 4. Costruisci i log entry
  return (
    poops?.map((p) => ({
      id: p.id,
      name: pooperMap.get(p.pooper_id) ?? "Sconosciuto",
      createdAt: p.created_at
    })) ?? []
  );
}

export async function checkOrCreatePooperAction(roomCode: string, pooperName: string) {
  // Trova l'id stanza da codice
  const { data: room, error: roomError } = await supabase.from("poop_rooms").select("id").eq("code", roomCode).single();

  if (roomError || !room) {
    throw new Error("Stanza non trovata");
  }

  const poopRoomId = room.id;

  // Verifica se il nome è già usato
  const { data: existingPooper } = await supabase
    .from("poopers")
    .select("id")
    .eq("poop_room_id", poopRoomId)
    .eq("name", pooperName)
    .maybeSingle();

  if (existingPooper) {
    throw new Error("⚠️ Nome già usato nella stanza");
  }

  const { error: insertError } = await supabase.from("poopers").insert({
    name: pooperName,
    poop_room_id: poopRoomId
  });

  if (insertError) {
    throw new Error("Errore nella creazione del pooper");
  }

  return {
    success: true,
    poopRoomId,
    pooperName
  };
}

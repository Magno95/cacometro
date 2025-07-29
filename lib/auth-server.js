"use server";

export async function validateCaccaId(caccaId) {
  const SECRET_KEY = process.env.POOP_SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error("🚫 Configurazione auth mancante");
  }

  if (!caccaId || caccaId !== SECRET_KEY) {
    throw new Error("🚫 Accesso negato - caccaId non valido");
  }

  return true;
}

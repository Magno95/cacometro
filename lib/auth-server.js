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
export async function validateAdminPassword(adminPassword) {
  const SECRET_KEY = process.env.POOP_ADMIN_PASSWORD;

  if (!SECRET_KEY) {
    throw new Error("🚫 Configurazione auth mancante");
  }

  if (!adminPassword || adminPassword !== SECRET_KEY) {
    throw new Error("🚫 Accesso negato - password admin non valida");
  }

  return true;
}

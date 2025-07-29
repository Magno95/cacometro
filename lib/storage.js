// lib/storage.js
import fs from "fs/promises";
import path from "path";

const isDev = process.env.NODE_ENV === "development";
const DATA_DIR = path.join(process.cwd(), ".dev-data");

// Classe che simula l'interfaccia dei Netlify Blobs per dev
class DevStorage {
  constructor(storeName) {
    this.storeName = storeName;
    this.storeDir = path.join(DATA_DIR, storeName);
  }

  async ensureDir() {
    try {
      await fs.mkdir(this.storeDir, { recursive: true });
    } catch (error) {
      // Directory già esistente, ignora
    }
  }

  async setJSON(key, data) {
    await this.ensureDir();
    const filePath = path.join(this.storeDir, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async get(key, options = {}) {
    await this.ensureDir();
    const filePath = path.join(this.storeDir, `${key}.json`);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");

      if (options.type === "json") {
        return JSON.parse(fileContent);
      }
      return fileContent;
    } catch (error) {
      if (error.code === "ENOENT") {
        return null; // File non trovato
      }
      throw error;
    }
  }

  async list() {
    await this.ensureDir();

    try {
      const files = await fs.readdir(this.storeDir);
      const blobs = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => ({
          key: file.replace(".json", ""),
          url: path.join(this.storeDir, file)
        }));

      return { blobs };
    } catch (error) {
      return { blobs: [] };
    }
  }

  async delete(key) {
    await this.ensureDir();
    const filePath = path.join(this.storeDir, `${key}.json`);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false; // File non esisteva
      }
      throw error;
    }
  }
}

// Funzione factory che restituisce il storage appropriato
export function getStore({ name, consistency }) {
  if (isDev) {
    return new DevStorage(name);
  } else {
    // In produzione usa Netlify Blobs
    const { getStore: getNetlifyStore } = require("@netlify/blobs");
    return getNetlifyStore({ name, consistency });
  }
}

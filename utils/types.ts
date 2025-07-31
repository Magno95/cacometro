import type { Database } from "@/lib/supabase.types";

// Entities
export type Pooper = Database["public"]["Tables"]["poopers"]["Row"];
export type Poop = Database["public"]["Tables"]["poops"]["Row"];
export type PoopRoom = Database["public"]["Tables"]["poop_rooms"]["Row"];

// Actions
export type NewPooper = Database["public"]["Tables"]["poopers"]["Insert"];
export type NewPoop = Database["public"]["Tables"]["poops"]["Insert"];
export type UpdatePooper = Database["public"]["Tables"]["poopers"]["Update"];
export type UpdatePoop = Database["public"]["Tables"]["poops"]["Update"];

// ============================================================
// supabase.js — Supabase client + helper functions
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ── Config ────────────────────────────────────────────────────
const SUPABASE_URL      = "https://mjsbounrbvuarovnnwhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc2JvdW5yYnZ1YXJvdm5ud2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTk1MDEsImV4cCI6MjA5NDQ5NTUwMX0.11ZfHA-jevsfuoLcK1UKcMLfXcmU2e4OuY319M2toUU";
const TOTAL_LANES       = 32;
const MAX_PER_LANE      = 4;
const STORAGE_BUCKET    = "payment-receipts";

// ── Init client ───────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── LANES ─────────────────────────────────────────────────────

/**
 * Fetch occupancy for all 32 lanes.
 * Counts PENDING + APPROVED registrations per lane.
 */
export async function getLaneOccupancy() {
  // FIXED: Fetch only lanes that are active (not REJECTED)
  const { data, error } = await supabase
    .from("registrations")
    .select("lane_number")
    .in("status", ["PENDING", "APPROVED"]);

  if (error) {
    console.error("Error fetching lane occupancy:", error);
    return [];
  }

  // Build map: { "Lane 1": count, ... }
  const counts = {};
  data.forEach(row => {
    if (row.lane_number) {
      counts[row.lane_number] = (counts[row.lane_number] || 0) + 1;
    }
  });

  // Build full lane list
  const lanes = [];
  for (let i = 1; i <= TOTAL_LANES; i++) {
    const name      = `Lane ${i}`;
    const taken     = counts[name] || 0;
    const remaining = MAX_PER_LANE - taken;
    lanes.push({
      name,
      taken,
      remaining,
      full: remaining <= 0,
    });
  }
  return lanes;
}

// ── REGISTRATIONS ─────────────────────────────────────────────

/**
 * Submit new registration.
 * Uploads receipt to Storage, then inserts row.
 */
export async function submitRegistration({ fullName, icNumber, phone, email, teamName, laneNumber, receiptFile }) {

  // 1 — Upload receipt
  const ext  = receiptFile.name.split(".").pop();
  const path = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, receiptFile, { contentType: receiptFile.type, upsert: false });

  if (uploadError) throw new Error("Gagal upload resit: " + uploadError.message);

  // 2 — Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  const receiptUrl = urlData.publicUrl;

  // 3 — Generate reference number
  const refNum = "REF-" + Date.now().toString(36).toUpperCase();

  // 4 — Insert registration
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      reference_number:    refNum,
      full_name:           fullName,
      ic_number:           icNumber,
      phone,
      email,
      team_name:           teamName || null,
      lane_number:         laneNumber,
      payment_receipt_url: receiptUrl,
      status:              "PENDING",
    })
    .select()
    .single();

  if (error) throw new Error("Gagal daftar: " + error.message);
  return data;
}

/**
 * Get registration by reference number or ID.
 */
export async function getRegistration(query) {
  let dbQuery = supabase.from("registrations").select("*");

  // Regex rule to check if the user is passing a valid UUID format
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

  if (isUUID) {
    // If it's a UUID, search strictly by id
    dbQuery = dbQuery.eq("id", query);
  } else {
    // Otherwise, treat it as a standard reference string
    dbQuery = dbQuery.eq("reference_number", query);
  }

  const { data, error } = await dbQuery.maybeSingle();

  if (error) {
    console.error("Lookup error:", error.message);
    throw error; // Throwing error so status.html catch block displays it properly
  }
  return data;
}

// ── ADMIN ─────────────────────────────────────────────────────

/**
 * Get all registrations (admin only).
 */
export async function getAllRegistrations(filters = {}) {
  let query = supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Approve registration — auto generate official ID.
 */
export async function approveRegistration(id) {
  const { count } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("status", "APPROVED");

  const seq   = String((count || 0) + 1).padStart(4, "0");
  const offId = `BT2026-${seq}`;

  const { data, error } = await supabase
    .from("registrations")
    .update({
      status:                   "APPROVED",
      official_registration_id: offId,
      updated_at:               new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject registration.
 * FIXED: Now properly runs an update statement targeting the specific ID.
 */
export async function rejectRegistration(id) {
  const { data, error } = await supabase
    .from("registrations")
    .update({ 
      status: "REJECTED",
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete registration.
 */
export async function deleteRegistration(id) {
  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Update registration fields.
 * FIXED: Cleaned up copy-paste code, syntax error typo, and bound target payload variables properly.
 */
export async function updateRegistration(id, fields) {
  const { data, error } = await supabase
    .from("registrations")
    .update({
      ...fields,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── UTILS ─────────────────────────────────────────────────────

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ms-MY", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function statusBadge(status) {
  const map = {
    PENDING:  { label: "Pending",  cls: "badge-pending"  },
    APPROVED: { label: "Approved", cls: "badge-approved" },
    REJECTED: { label: "Rejected", cls: "badge-rejected" },
  };
  const s = map[status] || { label: status, cls: "" };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}
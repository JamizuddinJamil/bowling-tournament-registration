// ============================================================
// config.js — Supabase configuration
// Tukar SUPABASE_URL dan SUPABASE_ANON_KEY kepada nilai kau
// Dapat dari: Supabase Dashboard → Project Settings → API
// ============================================================

const CONFIG = {
  SUPABASE_URL:      "https://mjsbounrbvuarovnnwhw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc2JvdW5yYnZ1YXJvdm5ud2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTk1MDEsImV4cCI6MjA5NDQ5NTUwMX0.11ZfHA-jevsfuoLcK1UKcMLfXcmU2e4OuY319M2toUU",

  // Tournament settings
  TOTAL_LANES:       32,
  MAX_PER_LANE:      4,
  FEE:               "RM30",
  EVENT_NAME:        "Sukan Bowling AKPS BSI 2026",
  ORGANIZER:         "Unit Kewangan Dan Pembangunan · JBS · Unit Pematuhan",

  // Admin credentials (simple local auth)
  ADMIN_USERNAME:    "admin",
  ADMIN_PASSWORD:    "P@ssw0rd",

  // Storage bucket name
  STORAGE_BUCKET:    "payment-receipts",
};

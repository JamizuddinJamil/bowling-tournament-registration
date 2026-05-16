-- ============================================================
-- SUPABASE SQL SETUP
-- Jalankan dalam: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. DROP table lama jika ada (SKIP jika tak nak reset)
-- DROP TABLE IF EXISTS registrations;

-- 2. Buat table baru
CREATE TABLE IF NOT EXISTS registrations (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number          text UNIQUE,
  official_registration_id  text UNIQUE,
  full_name                 text NOT NULL,
  ic_number                 text,
  phone                     text NOT NULL,
  email                     text,
  team_name                 text,
  lane_number               text NOT NULL,
  payment_receipt_url       text,
  status                    text DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  remarks                   text,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- 3. Index untuk performance
CREATE INDEX IF NOT EXISTS idx_status      ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_lane        ON registrations(lane_number);
CREATE INDEX IF NOT EXISTS idx_ref_number  ON registrations(reference_number);

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies
CREATE POLICY "allow_anon_upload"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "allow_anon_read"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'payment-receipts');

-- 6. RLS untuk table (optional — disable dulu untuk senang)
-- ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_all" ON registrations FOR ALL USING (true);

-- ============================================================
-- KALAU GUNA TABLE LAMA (dari Apps Script)
-- Jalankan ALTER ni untuk tambah column yang kurang
-- ============================================================

-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS reference_number text UNIQUE;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS official_registration_id text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ic_number text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_name text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS remarks text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

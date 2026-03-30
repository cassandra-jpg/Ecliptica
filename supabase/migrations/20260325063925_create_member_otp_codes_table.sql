/*
  # Create member_otp_codes table

  1. New Tables
    - `member_otp_codes`
      - `id` (uuid, primary key)
      - `email` (text, not null) — the member's email
      - `code` (text, not null) — 5-digit OTP code
      - `expires_at` (timestamptz) — code expiry (10 minutes)
      - `used` (boolean) — whether the code has been consumed
      - `created_at` (timestamptz) — when the code was issued

  2. Security
    - Enable RLS — no direct user access allowed
    - All operations go through the service role via edge functions
    - Index on email for fast lookups

  3. Notes
    - Old codes for an email are deleted before a new one is issued
    - Codes expire after 10 minutes
    - Once used, codes cannot be reused (used = true)
*/

CREATE TABLE IF NOT EXISTS member_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE member_otp_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS member_otp_codes_email_idx ON member_otp_codes(email);

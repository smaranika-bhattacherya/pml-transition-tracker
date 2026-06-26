-- Run this in the Neon SQL Editor to set up the database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS placements (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT        NOT NULL,
  linkedin     TEXT        NOT NULL DEFAULT '',
  prev_company TEXT        NOT NULL DEFAULT '',
  prev_role    TEXT        NOT NULL DEFAULT '',
  new_company  TEXT        NOT NULL DEFAULT '',
  new_role     TEXT        NOT NULL DEFAULT '',
  transition   TEXT        NOT NULL DEFAULT '',
  review       TEXT        NOT NULL DEFAULT '',
  highlight    TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transitions (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Stores pending OTPs; one row per email (upserted on re-send)
CREATE TABLE IF NOT EXISTS otps (
  email      TEXT        PRIMARY KEY,
  code       TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placements_updated_at ON placements;
CREATE TRIGGER placements_updated_at
  BEFORE UPDATE ON placements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

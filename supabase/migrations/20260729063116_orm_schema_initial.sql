/*
# ORM Intelligence Suite — Core Schema

Multi-tenant schema for an ORM platform. Super admin manages clients; each client logs in,
connects platform accounts (Play Store, social, marketplaces), and sees real reviews/mentions.

## New Tables
1. clients — brand accounts (super admin or client), linked to auth.users
2. platform_connections — a client's connected platform API keys / OAuth tokens
3. reviews — reviews/mentions fetched from connected platforms
4. reply_templates — saved quick-reply templates

## Security
RLS on all tables. Super admins see all; clients see only their own rows (by auth_user_id = auth.uid()).
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  company_name text NOT NULL,
  contact_person text DEFAULT '',
  phone text DEFAULT '',
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','pro','enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  is_super_admin boolean NOT NULL DEFAULT false,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select_own_or_admin" ON clients;
CREATE POLICY "clients_select_own_or_admin" ON clients FOR SELECT
  TO authenticated USING (
    auth_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM clients c WHERE c.auth_user_id = auth.uid() AND c.is_super_admin = true)
  );
DROP POLICY IF EXISTS "clients_update_own" ON clients;
CREATE POLICY "clients_update_own" ON clients FOR UPDATE
  TO authenticated USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
DROP POLICY IF EXISTS "clients_insert_admin" ON clients;
CREATE POLICY "clients_insert_admin" ON clients FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM clients c WHERE c.auth_user_id = auth.uid() AND c.is_super_admin = true)
  );
DROP POLICY IF EXISTS "clients_delete_admin" ON clients;
CREATE POLICY "clients_delete_admin" ON clients FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.auth_user_id = auth.uid() AND c.is_super_admin = true)
  );

CREATE TABLE IF NOT EXISTS platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  account_name text NOT NULL DEFAULT '',
  api_key text DEFAULT '',
  access_token text DEFAULT '',
  refresh_token text DEFAULT '',
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','error','disconnected')),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pc_select_own" ON platform_connections;
CREATE POLICY "pc_select_own" ON platform_connections FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "pc_insert_own" ON platform_connections;
CREATE POLICY "pc_insert_own" ON platform_connections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "pc_update_own" ON platform_connections;
CREATE POLICY "pc_update_own" ON platform_connections FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "pc_delete_own" ON platform_connections;
CREATE POLICY "pc_delete_own" ON platform_connections FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_review_id text,
  author_name text NOT NULL,
  author_avatar text DEFAULT '',
  rating int CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  content text NOT NULL,
  sentiment text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative','crisis')),
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','replied','escalated','flagged')),
  reply text DEFAULT '',
  replied_at timestamptz,
  review_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_own" ON reviews;
CREATE POLICY "reviews_select_own" ON reviews FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );

CREATE TABLE IF NOT EXISTS reply_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  sentiment text CHECK (sentiment IS NULL OR sentiment IN ('positive','neutral','negative','crisis')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reply_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rt_select_own" ON reply_templates;
CREATE POLICY "rt_select_own" ON reply_templates FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "rt_insert_own" ON reply_templates;
CREATE POLICY "rt_insert_own" ON reply_templates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "rt_update_own" ON reply_templates;
CREATE POLICY "rt_update_own" ON reply_templates FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );
DROP POLICY IF EXISTS "rt_delete_own" ON reply_templates;
CREATE POLICY "rt_delete_own" ON reply_templates FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id AND (auth_user_id = auth.uid() OR is_super_admin = true))
  );

CREATE INDEX IF NOT EXISTS idx_clients_auth_user ON clients(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_pc_client ON platform_connections(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews(client_id, platform);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(client_id, status);
CREATE INDEX IF NOT EXISTS idx_rt_client ON reply_templates(client_id);

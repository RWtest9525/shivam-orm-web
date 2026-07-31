/*
# Fix infinite RLS recursion on clients table

## Problem
The `clients_select_own_or_admin` policy (and all other table policies) check
admin status by running `SELECT 1 FROM clients WHERE ...` inside the RLS policy
on `clients` itself. This causes infinite recursion → every query against
`clients`, `reviews`, `platform_connections`, and `reply_templates` fails
silently, returning zero rows. Result: login succeeds but all panels appear empty.

## Fix
1. Create a `SECURITY DEFINER` function `is_super_admin(p_user uuid)` that
   queries the `clients` table with RLS bypassed (SECURITY DEFINER runs as the
   owner). This breaks the recursion.
2. Rewrite every RLS policy to use `is_super_admin(auth.uid())` instead of an
   inline subquery on `clients`.
3. The clients table's own SELECT policy uses a direct `auth_user_id = auth.uid()`
   check (no self-reference) plus the function for the admin bypass.
*/

-- ── Helper function (breaks recursion) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients
    WHERE auth_user_id = p_user AND is_super_admin = true
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- ── clients policies ────────────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select_own_or_admin" ON clients;
CREATE POLICY "clients_select_own_or_admin" ON clients FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "clients_update_own" ON clients;
CREATE POLICY "clients_update_own" ON clients FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "clients_insert_admin" ON clients;
CREATE POLICY "clients_insert_admin" ON clients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "clients_delete_admin" ON clients;
CREATE POLICY "clients_delete_admin" ON clients FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- ── platform_connections policies ───────────────────────────────────
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pc_select_own" ON platform_connections;
CREATE POLICY "pc_select_own" ON platform_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "pc_insert_own" ON platform_connections;
CREATE POLICY "pc_insert_own" ON platform_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "pc_update_own" ON platform_connections;
CREATE POLICY "pc_update_own" ON platform_connections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "pc_delete_own" ON platform_connections;
CREATE POLICY "pc_delete_own" ON platform_connections FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = platform_connections.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

-- ── reviews policies ────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_own" ON reviews;
CREATE POLICY "reviews_select_own" ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reviews.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

-- ── reply_templates policies ────────────────────────────────────────
ALTER TABLE reply_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rt_select_own" ON reply_templates;
CREATE POLICY "rt_select_own" ON reply_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "rt_insert_own" ON reply_templates;
CREATE POLICY "rt_insert_own" ON reply_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "rt_update_own" ON reply_templates;
CREATE POLICY "rt_update_own" ON reply_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

DROP POLICY IF EXISTS "rt_delete_own" ON reply_templates;
CREATE POLICY "rt_delete_own" ON reply_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE id = reply_templates.client_id
            AND (auth_user_id = auth.uid() OR public.is_super_admin(auth.uid())))
  );

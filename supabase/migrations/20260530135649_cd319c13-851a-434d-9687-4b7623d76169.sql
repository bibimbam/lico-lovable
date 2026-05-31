-- Drop existing permissive "allow all" policies
DROP POLICY IF EXISTS "students_all_access" ON public.students;
DROP POLICY IF EXISTS "products_all_access" ON public.products;
DROP POLICY IF EXISTS "jobs_all_access" ON public.jobs;

-- Ensure RLS is enabled (defensive)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- STUDENTS: contains real names + financial data.
-- No client policies at all — only service_role (server functions) can touch it.
-- Revoke any prior client grants and keep only service_role.
REVOKE ALL ON public.students FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.students TO service_role;

-- PRODUCTS: shared classroom market — public read is intentional, writes go through server fns.
REVOKE ALL ON public.products FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

CREATE POLICY "products_public_read"
  ON public.products
  FOR SELECT
  USING (true);

-- JOBS: same model as products — public read of catalog, writes via server fns.
REVOKE ALL ON public.jobs FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;

CREATE POLICY "jobs_public_read"
  ON public.jobs
  FOR SELECT
  USING (true);

-- Lock down the purchase_product RPC so only the server can call it.
-- Server functions use service_role; clients (anon/authenticated) cannot bypass server fns.
REVOKE EXECUTE ON FUNCTION public.purchase_product(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_product(uuid) TO service_role;

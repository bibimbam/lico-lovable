-- Atomic stock decrement function for market purchases
CREATE OR REPLACE FUNCTION public.purchase_product(p_id uuid)
RETURNS public.products
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.products;
BEGIN
  UPDATE public.products
  SET stock = stock - 1, updated_at = now()
  WHERE id = p_id AND stock > 0
  RETURNING * INTO updated;

  IF updated.id IS NULL THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;

  RETURN updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_product(uuid) TO anon, authenticated, service_role;

-- Enable realtime on products so all clients sync inventory
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
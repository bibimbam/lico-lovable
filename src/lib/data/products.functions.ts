import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ProductInputSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).default(""),
  price: z.number().int().min(0).max(10_000_000),
  emoji: z.string().min(1).max(8),
  stock: z.number().int().min(0).max(100_000),
});

const UpsertSchema = z.object({
  id: z.string().uuid().optional(),
  product: ProductInputSchema,
});

export const upsertProductFn = createServerFn({ method: "POST" })
  .inputValidator((d) => UpsertSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("products")
        .update(data.product)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("products").insert(data.product);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const purchaseProductFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin.rpc("purchase_product", {
      p_id: data.id,
    });
    if (error) throw new Error(error.message);
    return row;
  });

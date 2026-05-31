import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteProductFn,
  purchaseProductFn,
  upsertProductFn,
} from "./products.functions";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  stock: number;
  created_at?: string;
};

const KEY = ["products"] as const;

export function useProducts() {
  const qc = useQueryClient();

  // Realtime sync: any inventory change anywhere propagates to all clients.
  useEffect(() => {
    const channel = supabase
      .channel("products-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => qc.invalidateQueries({ queryKey: KEY }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

export type ProductInput = Omit<Product, "id" | "created_at">;

export function useUpsertProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: ProductInput & { id?: string }) => {
      const { id, ...rest } = product;
      return upsertProductFn({ data: { id, product: rest } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/**
 * Atomically decrements stock by 1 on the server.
 * Throws "OUT_OF_STOCK" if the item is sold out.
 */
export function usePurchaseProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<Product> =>
      purchaseProductFn({ data: { id } }) as unknown as Promise<Product>,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

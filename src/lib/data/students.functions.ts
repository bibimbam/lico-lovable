import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type StudentRow = {
  id: string;
  name: string;
  assets: number;
  job: string;
  participation: number;
  income: number;
  spending: number;
  tax: number;
  invest_gain: number;
  alerts: string[];
  created_at?: string;
};

export const listStudents = createServerFn({ method: "GET" }).handler(
  async (): Promise<StudentRow[]> => {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as StudentRow[];
  },
);

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  assets: z.number().int().min(0).max(10_000_000).optional(),
});

export const createStudentFn = createServerFn({ method: "POST" })
  .inputValidator((d) => CreateSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("students").insert({
      name: data.name,
      assets: data.assets ?? 0,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z
    .object({
      name: z.string().min(1).max(80).optional(),
      assets: z.number().int().optional(),
      job: z.string().max(80).optional(),
      participation: z.number().int().min(0).max(100).optional(),
      income: z.number().int().optional(),
      spending: z.number().int().optional(),
      tax: z.number().int().optional(),
      invest_gain: z.number().int().optional(),
      alerts: z.array(z.string().max(500)).max(50).optional(),
    })
    .strict(),
});

export const updateStudentFn = createServerFn({ method: "POST" })
  .inputValidator((d) => UpdateSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("students")
      .update(data.patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteStudentFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("students").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const JobInputSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).default(""),
  capacity: z.number().int().min(0).max(200),
  assigned: z.array(z.string().max(80)).max(200),
  intensity: z.enum(["low", "mid", "high"]),
  salary: z.number().int().min(0).max(1_000_000),
});

const UpsertSchema = z.object({
  id: z.string().uuid().optional(),
  job: JobInputSchema,
});

export const upsertJobFn = createServerFn({ method: "POST" })
  .inputValidator((d) => UpsertSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("jobs")
        .update(data.job)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("jobs").insert(data.job);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteJobFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("jobs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

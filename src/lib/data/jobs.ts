import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteJobFn, upsertJobFn } from "./jobs.functions";

export type JobIntensity = "low" | "mid" | "high";

export type Job = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  assigned: string[];
  intensity: JobIntensity;
  salary: number;
  created_at?: string;
};

const KEY = ["jobs"] as const;

export function useJobs() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });
}

export type JobInput = Omit<Job, "id" | "created_at">;

export function useUpsertJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (job: JobInput & { id?: string }) => {
      const { id, ...rest } = job;
      return upsertJobFn({ data: { id, job: rest } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJobFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

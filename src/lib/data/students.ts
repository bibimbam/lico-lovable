import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudentFn,
  deleteStudentFn,
  listStudents,
  updateStudentFn,
  type StudentRow,
} from "./students.functions";

export type Student = StudentRow;

const KEY = ["students"] as const;

export function useStudents() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => listStudents(),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; assets?: number }) =>
      createStudentFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

type UpdatePatch = {
  name?: string;
  assets?: number;
  job?: string;
  participation?: number;
  income?: number;
  spending?: number;
  tax?: number;
  invest_gain?: number;
  alerts?: string[];
};

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Student> & { id: string }) =>
      updateStudentFn({ data: { id, patch: patch as UpdatePatch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudentFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

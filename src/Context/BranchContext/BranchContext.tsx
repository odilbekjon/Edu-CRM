/* eslint-disable react-refresh/only-export-components */
// src/Context/BranchContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { useData } from "../DataContext";
import type { Group, Teacher } from "../../types/crm";

export type BranchId = string;

interface BranchContextValue {
  branch: BranchId;
  setBranch: (b: BranchId) => void;
  branchLabel: string;
  /** Header dropdown uchun: "all" + backenddagi filiallar */
  options: { value: BranchId; label: string }[];
  groups: Group[];
  teachers: Teacher[];
}

const BranchContext = createContext<BranchContextValue | null>(null);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { groups: allGroups, teachers: allTeachers, branches } = useData();
  const [branch, setBranch] = useState<BranchId>("all");

  const options = useMemo(
    () => [{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.name, label: b.name }))],
    [branches],
  );

  const groups = branch === "all" ? allGroups : allGroups.filter((g) => g.branch === branch);
  const teachers = branch === "all" ? allTeachers : allTeachers.filter((t) => t.branch === branch);
  const branchLabel = options.find((o) => o.value === branch)?.label ?? "All branches";

  return (
    <BranchContext.Provider value={{ branch, setBranch, branchLabel, options, groups, teachers }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used inside BranchProvider");
  return ctx;
};

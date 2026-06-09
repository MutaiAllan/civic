export const DEPARTMENT_MAP: Record<string, string> = {
  Infrastructure: "Roads & Transport",
  Health:         "Ministry of Health",
  Sanitation:     "Sanitation Authority",
  Environment:    "Environment & Planning",
  Utilities:      "Water & Sewerage",
  Education:      "Ministry of Education",
  Governance:     "Ethics & Integrity",
  Other:          "General Affairs",
};

export function assignDepartment(category: string): string {
  return DEPARTMENT_MAP[category] ?? "General Affairs";
}

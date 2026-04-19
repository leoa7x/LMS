export const systemRoles = ["ADMIN", "TEACHER", "STUDENT", "SUPPORT"] as const;

export const simulatorKinds = [
  "EMBEDDABLE_EXISTING",
  "THIRD_PARTY_ADAPTER",
  "NATIVE_BASIC",
  "NATIVE_ADVANCED",
] as const;

export type SystemRoleName = (typeof systemRoles)[number];
export type SimulatorKindName = (typeof simulatorKinds)[number];

const truthyValues = new Set(["1", "true", "yes", "on"]);

const readBooleanEnv = (value?: string) => {
  if (!value) return false;
  return truthyValues.has(value.toLowerCase());
};

export const BYPASS_ADMIN_AUTH = readBooleanEnv(process.env["NEXT_PUBLIC_BYPASS_ADMIN_AUTH"]);

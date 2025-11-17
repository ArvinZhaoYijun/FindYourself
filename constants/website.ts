const toBoolean = (value: string | undefined): boolean =>
  value?.toLowerCase() === "true";

export const analyticsConfig = {
  enableInDevelopment: toBoolean(process.env.NEXT_PUBLIC_ANALYTICS_ENABLE_IN_DEVELOPMENT),
};

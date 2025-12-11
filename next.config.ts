import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have type declarations
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Use Turbopack with empty config to silence warning
  turbopack: {},
};

export default withPWA(nextConfig);

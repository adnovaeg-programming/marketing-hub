import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["50.0.0.13"],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
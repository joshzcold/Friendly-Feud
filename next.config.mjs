import createMDX from "@next/mdx";
import process from "process";

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

// https://github.com/vercel/next.js/discussions/57555
if (process.env.NODE_ENV === "production") {
  nextConfig.compiler = {
    removeConsole: true,
  };
}

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);

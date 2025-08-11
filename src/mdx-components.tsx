import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";

const components: MDXComponents = {
  h1: ({ children }) => <h1 className="py-6 text-3xl">{children}</h1>,
  h2: ({ children }) => <h2 className="py-6 text-2xl">{children}</h2>,
  h3: ({ children }) => <h3 className="py-6 text-xl">{children}</h3>,
  h4: ({ children }) => <h4 className="text-l py-6">{children}</h4>,
  hr: () => <hr className="py-3"></hr>,
  p: ({ children }) => <p className="py-4">{children}</p>,
  img: (props) => <Image sizes="100vw" style={{ width: "100%", height: "auto" }} {...(props as ImageProps)} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

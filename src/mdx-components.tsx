import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";

const components: MDXComponents = {
  h1: ({ children }) => <h1 className="py-6 text-3xl font-extrabold text-foreground">{children}</h1>,
  h2: ({ children }) => <h2 className="py-6 text-2xl font-bold text-foreground">{children}</h2>,
  h3: ({ children }) => <h3 className="py-6 text-lg font-bold text-foreground">{children}</h3>,
  h4: ({ children }) => <h4 className="text-l py-6 font-bold text-foreground">{children}</h4>,
  hr: () => <hr className="py-3 text-foreground"></hr>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 bg-secondary-200 px-8 text-foreground">{children}</blockquote>
  ),

  p: ({ children }) => <p className="py-4 text-foreground">{children}</p>,
  pre: ({ children }) => <pre className="py-8 text-foreground">{children}</pre>,
  ol: ({ children }) => <ol className="list-decimal px-4 text-foreground">{children}</ol>,
  ul: ({ children }) => <ul className="list-disc px-4 text-foreground">{children}</ul>,

  img: (props) => <Image sizes="100vw" style={{ width: "100%", height: "auto" }} {...(props as ImageProps)} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

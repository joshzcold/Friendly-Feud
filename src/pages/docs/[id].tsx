import { getPostData, listFilesRecursive, POSTS_DIRECTORY } from "@/src/lib/docs";
import { GetStaticPaths } from "next/types";

interface PostProp {
  contentHtml: string;
}

interface PostProps {
  postData: PostProp;
}

interface StaticPropsParam {
  id: string;
}

interface StaticPropsParams {
  params: StaticPropsParam;
}

export const getStaticPaths = (async (locales) => {
  const files: string[] = listFilesRecursive(POSTS_DIRECTORY);

  let paths: any = [];

  files.forEach((file) => {
    for (const locale in locales) {
      paths.push({
        params: {
          name: file,
        },
        locale,
      });
    }
  });

  console.log("paths", paths);

  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths;

export async function getStaticProps({ params }: StaticPropsParams) {
  // Add the "await" keyword like this:
  console.log("params", params);
  const postData = await getPostData(params.id);

  return {
    props: {
      postData,
    },
  };
}

export default function Post({ postData }: PostProps) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
    </>
  );
}

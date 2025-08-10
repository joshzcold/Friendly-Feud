import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

export const POSTS_DIRECTORY = "./src/public/docs/";

let Files: string[] = [];

export function listFilesRecursive(directory: string) {
  fs.readdirSync(directory).forEach((File: string) => {
    const Absolute = path.join(directory, File);
    if (fs.statSync(Absolute).isDirectory()) return listFilesRecursive(Absolute);
    else return Files.push(Absolute);
  });
  return Files;
}

export async function getPostData(id: string) {
  const fullPath = path.join(POSTS_DIRECTORY, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(fileContents);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
  };
}

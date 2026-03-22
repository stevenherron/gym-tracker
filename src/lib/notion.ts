import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
export const DATA_SOURCE_ID = "270ffbd036c742899ef82c546e1f2d9a";

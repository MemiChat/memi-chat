import { MetadataRoute } from "next";
import { headers } from "next/headers";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers();
  const domain = headersList.get("host") as string;
  const protocol = "https";

  return [
    {
      url: `${protocol}://${domain}`,
      lastModified: new Date(),
    },
  ];
}

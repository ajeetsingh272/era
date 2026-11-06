import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listImages } from "@/server/services/uploads";
import { imageUsage } from "@/server/services/media";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  const usage = imageUsage();
  const items = (await listImages()).map((m) => ({ ...m, usedIn: usage.get(m.url) ?? [] }));
  return <MediaLibrary items={items} />;
}

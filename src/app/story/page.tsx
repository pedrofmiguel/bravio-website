import StoryContent from "@/components/story/StoryContent";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Story",
  description:
    "A private chef and events kitchen based in Porto. Selected evenings from the archive.",
  path: "/story",
  type: "article",
});

export default function StoryPage() {
  return <StoryContent />;
}

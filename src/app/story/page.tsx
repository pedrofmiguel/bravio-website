import StoryContent from "@/components/story/StoryContent";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Story",
  description:
    "A private chef and catering kitchen working out of Lisbon. Selected evenings from the archive.",
  path: "/story",
  type: "article",
});

export default function StoryPage() {
  return <StoryContent />;
}

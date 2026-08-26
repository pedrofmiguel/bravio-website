import type { Metadata } from "next";
import StoryContent from "@/components/story/StoryContent";

export const metadata: Metadata = {
  title: "Story",
  description:
    "A private chef and catering kitchen working out of Lisbon. Selected evenings from the archive.",
};

export default function StoryPage() {
  return <StoryContent />;
}

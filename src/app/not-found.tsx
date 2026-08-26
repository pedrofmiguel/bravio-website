import type { Metadata } from "next";
import NotFoundContent from "@/components/layout/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundContent />;
}

import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us about the night. Send the date, the number of people and anything that matters.",
};

export default function ContactPage() {
  return <ContactContent />;
}

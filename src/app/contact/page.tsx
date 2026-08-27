import ContactContent from "@/components/contact/ContactContent";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell us about the night. Send the date, the number of people and anything that matters.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactContent />;
}

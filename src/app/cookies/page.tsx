import CookiePolicyContent from "@/components/legal/CookiePolicyContent";
import { COOKIE_POLICY } from "@/lib/cookie-policy";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: COOKIE_POLICY.en.meta.title,
  description: COOKIE_POLICY.en.meta.description,
  path: "/cookies",
});

export default function CookiesPage() {
  return <CookiePolicyContent />;
}

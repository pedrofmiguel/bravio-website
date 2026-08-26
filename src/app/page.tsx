import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import Courses from "@/components/home/Courses";
import Services from "@/components/home/Services";
import ScrollGallery from "@/components/home/ScrollGallery";
import ContactSection from "@/components/contact/ContactSection";

/**
 * Home.
 *
 * Section order is a deliberate rhythm of layout families so no two
 * consecutive blocks are composed the same way: brand field with type across
 * it, centred statement, captioned menu grid, sticky stack, horizontal pan,
 * then the split form.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Courses />
      <Services />
      <ScrollGallery />
      <ContactSection id="enquiry" />
    </>
  );
}

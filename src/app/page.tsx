import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import Courses from "@/components/home/Courses";
import Services from "@/components/home/Services";
import Sourcing from "@/components/home/Sourcing";
import GalleryTeaser from "@/components/home/GalleryTeaser";
import ContactSection from "@/components/contact/ContactSection";

/**
 * Home.
 *
 * Section order is a deliberate rhythm of layout families so no two
 * consecutive blocks are composed the same way: asymmetric split, centred
 * statement, captioned menu grid, sticky stack, full bleed colour, offset
 * parallax frames, then the split form.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Courses />
      <Services />
      <Sourcing />
      <GalleryTeaser />
      <ContactSection id="enquiry" />
    </>
  );
}

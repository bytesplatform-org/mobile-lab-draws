import Loader from "@/components/site/Loader";
import FilmTrail from "@/components/site/FilmTrail";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import ScrollReveals from "@/components/site/ScrollReveals";
import ArcParallax from "@/components/site/ArcParallax";
import Cursor from "@/components/site/Cursor";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import Services from "@/components/home/Services";
import DrugScreens from "@/components/home/DrugScreens";
import Treatment from "@/components/home/Treatment";
import CallBand from "@/components/home/CallBand";
import Book from "@/components/home/Book";
import Coverage from "@/components/home/Coverage";
import Reviews from "@/components/home/Reviews";
import Gallery from "@/components/home/Gallery";
import Contact from "@/components/home/Contact";

/**
 * The homepage, in the live site's order. Night and paper sheets alternate,
 * each new one rising over the last on an arc (ArcBg + ArcParallax).
 */
export default function Home() {
  return (
    <>
      {/* First in the body, so the loader paints before anything beneath it. */}
      <Loader />
      <FilmTrail />
      <SiteNav />
      <main id="main">
        <Hero />
        <Statement />
        <Services />
        <DrugScreens />
        <Treatment />
        <CallBand />
        <Book />
        <Coverage />
        <Reviews />
        <Gallery />
        <Contact />
      </main>
      <SiteFooter />
      <ArcParallax />
      <ScrollReveals />
      <Cursor />
    </>
  );
}

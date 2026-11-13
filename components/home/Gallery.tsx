import Image from "next/image";
import { gallery } from "@/lib/content/site";
import GalleryStage from "./GalleryStage";

/**
 * "Explore Our Health and Wellness Photo Gallery": a horizontal drag/scroll
 * gallery of the client's photographs (see GalleryStage). Every card is a
 * duotone plate in GL that develops to colour as it centres, with a glass
 * lens under the pointer; the DOM images are the fallback.
 * TODO(client): several photos are GoDaddy stock (public/images/CREDITS.md).
 */
export default function Gallery() {
  return (
    <section className="sheet night gallery" data-tone="night" aria-labelledby="gallery-title">
      <div data-parallax>
      <div className="wrap gal-head">
        <h2 className="h-xl" id="gallery-title" data-reveal="lines">{gallery.heading}</h2>
      </div>
      <GalleryStage count={gallery.photos.length} srcs={gallery.photos.map(p => p.src)}>
        {gallery.photos.map((p, i) => (
          <li className="gal-card" key={p.src + i} data-plate>
            <figure className="gal-card-in">
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 760px) 70vw, 340px" draggable={false} />
            </figure>
          </li>
        ))}
      </GalleryStage>
      </div>
    </section>
  );
}

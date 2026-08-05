"use client";
import "@brijbyte/md3-react/carousel.css";
import "./multi-browse.css";

import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const photos = [
  { slug: "aurora", label: "Aurora" },
  { slug: "fjord", label: "Fjord" },
  { slug: "dunes", label: "Dunes" },
  { slug: "canopy", label: "Canopy" },
  { slug: "glacier", label: "Glacier" },
  { slug: "lagoon", label: "Lagoon" },
  { slug: "basalt", label: "Basalt" },
  { slug: "tundra", label: "Tundra" },
  { slug: "reef", label: "Reef" },
];

export default function CarouselMultiBrowse() {
  return (
    <Carousel aria-label="Photo highlights" className="demo-carousel">
      {photos.map((photo) => (
        <CarouselItem key={photo.slug}>
          <figure className="demo-carousel-tile">
            {/* Decorative: the caption below already names the photo. */}
            <img className="demo-carousel-image" src={`/carousel/${photo.slug}.svg`} alt="" />
            <figcaption>{photo.label}</figcaption>
          </figure>
        </CarouselItem>
      ))}
    </Carousel>
  );
}

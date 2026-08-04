"use client";
import "@brijbyte/md3-react/carousel.css";
import "./multi-browse.css";

import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const photos = [
  "Aurora",
  "Fjord",
  "Dunes",
  "Canopy",
  "Glacier",
  "Lagoon",
  "Basalt",
  "Tundra",
  "Reef",
];

const tone = (index: number) => ["", " demo-carousel-tile-b", " demo-carousel-tile-c"][index % 3];

export default function CarouselMultiBrowse() {
  return (
    <Carousel aria-label="Photo highlights" className="demo-carousel">
      {photos.map((name, index) => (
        <CarouselItem key={name}>
          <figure className={`demo-carousel-tile${tone(index)}`}>
            <figcaption>{name}</figcaption>
          </figure>
        </CarouselItem>
      ))}
    </Carousel>
  );
}

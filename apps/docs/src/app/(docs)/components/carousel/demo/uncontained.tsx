"use client";
import "@brijbyte/md3-react/carousel.css";
import "./uncontained.css";

import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const tracks = [
  "Slow Tide",
  "Nightjar",
  "Paper Moon",
  "Copper Line",
  "Half Light",
  "Drift",
  "Ember",
  "Salt Flats",
];

const tone = (index: number) =>
  ["", " demo-uncontained-tile-b", " demo-uncontained-tile-c"][index % 3];

export default function CarouselUncontained() {
  return (
    <Carousel
      aria-label="Recently played"
      layout="uncontained"
      itemWidth={150}
      itemSpacing={12}
      className="demo-uncontained"
    >
      {tracks.map((name, index) => (
        <CarouselItem key={name}>
          <figure className={`demo-uncontained-tile${tone(index)}`}>
            <figcaption>{name}</figcaption>
          </figure>
        </CarouselItem>
      ))}
    </Carousel>
  );
}

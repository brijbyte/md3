"use client";
import "@brijbyte/md3-react/carousel.css";
import "./hero.css";

import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const stories = ["Aurora", "Fjord", "Dunes", "Canopy", "Glacier", "Lagoon", "Basalt"];

const tone = (index: number) => ["", " demo-hero-tile-b", " demo-hero-tile-c"][index % 3];

export default function CarouselHero() {
  return (
    <div className="demo-hero-stack">
      <Carousel aria-label="Featured stories" layout="hero" className="demo-hero">
        {stories.map((name, index) => (
          <CarouselItem key={name}>
            <figure className={`demo-hero-tile${tone(index)}`}>
              <figcaption>{name}</figcaption>
            </figure>
          </CarouselItem>
        ))}
      </Carousel>

      <Carousel
        aria-label="Featured stories, centered"
        layout="center-aligned-hero"
        defaultValue={2}
        className="demo-hero"
      >
        {stories.map((name, index) => (
          <CarouselItem key={name}>
            <figure className={`demo-hero-tile${tone(index)}`}>
              <figcaption>{name}</figcaption>
            </figure>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
}

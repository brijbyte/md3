"use client";
import "@brijbyte/md3-react/carousel.css";
import "./hero.css";

import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const stories = [
  { slug: "fjord", label: "Fjord" },
  { slug: "dunes", label: "Dunes" },
  { slug: "canopy", label: "Canopy" },
  { slug: "glacier", label: "Glacier" },
  { slug: "lagoon", label: "Lagoon" },
  { slug: "basalt", label: "Basalt" },
  { slug: "aurora", label: "Aurora" },
];

function Tile({ slug, label }: { slug: string; label: string }) {
  return (
    <figure className="demo-hero-tile">
      <img className="demo-hero-image" src={`/carousel/${slug}.svg`} alt="" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export default function CarouselHero() {
  return (
    <div className="demo-hero-stack">
      <Carousel aria-label="Featured stories" layout="hero" className="demo-hero">
        {stories.map((story) => (
          <CarouselItem key={story.slug}>
            <Tile {...story} />
          </CarouselItem>
        ))}
      </Carousel>

      <Carousel
        aria-label="Featured stories, centered"
        layout="center-aligned-hero"
        defaultValue={2}
        className="demo-hero"
      >
        {stories.map((story) => (
          <CarouselItem key={story.slug}>
            <Tile {...story} />
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
}

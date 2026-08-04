"use client";
import "@brijbyte/md3-react/carousel.css";
import "./uncontained.css";

import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const tracks = [
  { slug: "lagoon", title: "Slow Tide", artist: "Meridian" },
  { slug: "aurora", title: "Nightjar", artist: "Halden" },
  { slug: "dunes", title: "Paper Moon", artist: "Ossa" },
  { slug: "basalt", title: "Copper Line", artist: "Rell" },
  { slug: "glacier", title: "Half Light", artist: "Vessel" },
  { slug: "canopy", title: "Drift", artist: "Meridian" },
  { slug: "reef", title: "Ember", artist: "Ossa" },
  { slug: "tundra", title: "Salt Flats", artist: "Halden" },
];

export default function CarouselUncontained() {
  return (
    <Carousel
      aria-label="Recently played"
      layout="uncontained"
      itemWidth={150}
      itemSpacing={12}
      className="demo-uncontained"
    >
      {tracks.map((track) => (
        <CarouselItem key={track.title}>
          <figure className="demo-uncontained-tile">
            <img className="demo-uncontained-image" src={`/carousel/${track.slug}.svg`} alt="" />
            <figcaption>
              <span className="demo-uncontained-title">{track.title}</span>
              <span className="demo-uncontained-artist">{track.artist}</span>
            </figcaption>
          </figure>
        </CarouselItem>
      ))}
    </Carousel>
  );
}

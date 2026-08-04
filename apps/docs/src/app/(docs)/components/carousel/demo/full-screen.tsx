"use client";
import "@brijbyte/md3-react/carousel.css";
import "./full-screen.css";

import { useState } from "react";
import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const slides = [
  { slug: "glacier", label: "Glacier" },
  { slug: "reef", label: "Reef" },
  { slug: "dunes", label: "Dunes" },
  { slug: "canopy", label: "Canopy" },
];

export default function CarouselFullScreen() {
  const [active, setActive] = useState(0);
  return (
    <div className="demo-full-stack">
      <Carousel
        aria-label="Onboarding"
        layout="full-screen"
        value={active}
        onValueChange={setActive}
        className="demo-full"
      >
        {slides.map((slide) => (
          <CarouselItem key={slide.slug}>
            <figure className="demo-full-tile">
              <img className="demo-full-image" src={`/carousel/${slide.slug}.svg`} alt="" />
              <figcaption>{slide.label}</figcaption>
            </figure>
          </CarouselItem>
        ))}
      </Carousel>
      <p className="demo-full-status">
        Slide {active + 1} of {slides.length}
      </p>
    </div>
  );
}

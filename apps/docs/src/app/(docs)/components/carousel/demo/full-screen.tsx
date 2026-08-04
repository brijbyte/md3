"use client";
import "@brijbyte/md3-react/carousel.css";
import "./full-screen.css";

import { useState } from "react";
import { Carousel, CarouselItem } from "@brijbyte/md3-react/carousel";

const slides = ["Aurora", "Fjord", "Dunes", "Canopy"];

const tone = (index: number) => ["", " demo-full-tile-b", " demo-full-tile-c"][index % 3];

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
        {slides.map((name, index) => (
          <CarouselItem key={name}>
            <figure className={`demo-full-tile${tone(index)}`}>
              <figcaption>{name}</figcaption>
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

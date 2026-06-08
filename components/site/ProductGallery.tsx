"use client";

import type { ProductImage } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(images[0]);
  if (!active) return null;
  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery-thumbs">
        {images.map((image) => (
          <button key={image.id} className={image.id === active.id ? "pdp-thumb active" : "pdp-thumb"} onClick={() => setActive(image)}>
            <Image src={image.src} alt={image.alt} width={120} height={120} />
          </button>
        ))}
      </div>
      <div className="pdp-gallery-main">
        <Image src={active.src} alt={active.alt} width={900} height={900} />
      </div>
    </div>
  );
}

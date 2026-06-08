"use client";

import { useEffect } from "react";

export function BodyClass({ className }: { className: string }) {
  useEffect(() => {
    const classes = className.split(" ").filter(Boolean);
    document.body.classList.add(...classes);
    return () => {
      document.body.classList.remove(...classes);
    };
  }, [className]);

  return null;
}

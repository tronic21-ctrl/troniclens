"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationVariant = "fadeUp" | "fadeLeft" | "fadeRight" | "scaleUp" | "staggerChildren";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  /** CSS selector for child items when variant='staggerChildren' */
  staggerSelector?: string;
  staggerAmount?: number;
  /** Trigger offset — e.g. "top 90%" means trigger when top of element reaches 90% of viewport */
  start?: string;
  style?: React.CSSProperties;
  className?: string;
  /** If true, animation only plays once (default: true) */
  once?: boolean;
}

export default function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.7,
  staggerSelector,
  staggerAmount = 0.08,
  start = "top 88%",
  style,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Determine initial & final states based on variant
    let fromVars: gsap.TweenVars = {};
    let toVars: gsap.TweenVars = {};

    switch (variant) {
      case "fadeUp":
        fromVars = { y: 40, opacity: 0 };
        toVars = { y: 0, opacity: 1 };
        break;
      case "fadeLeft":
        fromVars = { x: -40, opacity: 0 };
        toVars = { x: 0, opacity: 1 };
        break;
      case "fadeRight":
        fromVars = { x: 40, opacity: 0 };
        toVars = { x: 0, opacity: 1 };
        break;
      case "scaleUp":
        fromVars = { scale: 0.92, opacity: 0 };
        toVars = { scale: 1, opacity: 1 };
        break;
      case "staggerChildren":
        // Animate children individually
        break;
    }

    if (variant === "staggerChildren") {
      const selector = staggerSelector || ":scope > *";
      const items = el.querySelectorAll(selector);
      if (items.length === 0) return;

      gsap.set(items, { y: 30, opacity: 0 });

      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once,
        onEnter: () => {
          gsap.to(items, {
            y: 0,
            opacity: 1,
            duration,
            stagger: staggerAmount,
            delay,
            ease: "power3.out",
            clearProps: "transform",
          });
        },
        ...(once
          ? {}
          : {
              onLeaveBack: () => {
                gsap.set(items, { y: 30, opacity: 0 });
              },
            }),
      });

      return () => {
        trigger.kill();
      };
    }

    // Standard single-element animation
    gsap.set(el, fromVars);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once,
      onEnter: () => {
        gsap.to(el, {
          ...toVars,
          duration,
          delay,
          ease: "power3.out",
          clearProps: "transform",
        });
      },
      ...(once
        ? {}
        : {
            onLeaveBack: () => {
              gsap.set(el, fromVars);
            },
          }),
    });

    return () => {
      trigger.kill();
    };
  }, [variant, delay, duration, staggerSelector, staggerAmount, start, once]);

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

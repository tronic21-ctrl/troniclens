"use client";

import { useEffect, useRef, useMemo } from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  style = {},
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  const motionValue = useMotionValue(prevValue.current);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 120,
    restDelta: 0.01,
  });

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals]
  );

  useEffect(() => {
    motionValue.set(value);
    prevValue.current = value;
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${formatter.format(latest)}${suffix}`;
      }
    });

    return unsubscribe;
  }, [springValue, formatter, prefix, suffix]);

  // Set initial text content on mount to avoid blank flash
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = `${prefix}${formatter.format(value || 0)}${suffix}`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatter]);

  return <span ref={ref} className={className} style={style} />;
}

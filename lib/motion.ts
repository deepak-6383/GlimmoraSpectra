import type { Easing } from "framer-motion";

/**
 * Cinematic easing curves used across the app.
 * Typed as Easing tuples to satisfy framer-motion's stricter typing.
 */
export const easeCinema: Easing = [0.22, 1, 0.36, 1];
export const easePremium: Easing = [0.65, 0, 0.35, 1];
export const easeSpring: Easing = [0.34, 1.56, 0.64, 1];

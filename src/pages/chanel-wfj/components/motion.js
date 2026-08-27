/* ─── Shared motion values ───────────────────────────────────────────────────
   Split out of primitives.jsx because that file exports components, and a file
   that exports both components and plain constants breaks React Fast Refresh —
   editing a constant forces a full reload instead of a hot swap.

   These are the site's own values, used verbatim so this route moves like the
   rest of the portfolio even though it looks nothing like it. */

/* The portfolio's entrance curve. */
export const EASE = [0.16, 1, 0.3, 1];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/* Sections reveal on the same terms as the homepage's: once, with an 8% margin,
   so nothing re-animates on the way back up. */
export const revealProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-8%' },
  variants: containerVariants,
};

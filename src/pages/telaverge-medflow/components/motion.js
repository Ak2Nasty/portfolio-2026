/* ─── Shared motion values ───────────────────────────────────────────────────
   Split out of primitives.jsx because that file exports components, and a
   module exporting both components and plain constants breaks React Fast
   Refresh — editing a constant would force a full reload instead of a hot swap.

   These are the portfolio's own values, used verbatim, so this route moves like
   the rest of the site even though it looks nothing like it.

   MOTION POLICY FOR THIS PAGE
   Motion communicates process or state. Nothing here is decorative, and nothing
   is scroll-LINKED except the progress hairline: a scroll-linked element sits
   at an arbitrary fraction whenever the reader stops, which on a diagram reads
   as data. The workflow chain, the risk connectors and the trace chain all draw
   themselves ONCE on arrival and then stay drawn. */

export const EASE = [0.16, 1, 0.3, 1];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/* For chains and sequences where the items should arrive in order rather than
   together — the workflow steps, the trace stages. */
export const stepIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export const chainVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/* Reveal on the same terms as the homepage's: once, with an 8% margin, so
   nothing re-animates on the way back up. */
export const revealProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-8%' },
  variants: containerVariants,
};

export const chainReveal = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-10%' },
  variants: chainVariants,
};

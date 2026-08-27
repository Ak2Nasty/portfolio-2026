import { motion } from 'framer-motion';
import { EASE } from './motion';
import { PORTFOLIO_URL } from '../data/applicationData';

/* ─── Minimal application header ─────────────────────────────────────────────
   Deliberately not the homepage navbar. Navbar13 carries seven section links, a
   time-of-day greeting, a live clock and a hover-pill animation — all correct
   for a portfolio someone is browsing, all wrong for a single-purpose document
   someone was sent a link to. This is the same wordmark and the same type scale
   with nothing else in it.

   Both routes out of the page open the full portfolio in a fresh tab via an
   ordinary anchor with an absolute URL. That is load-bearing, not incidental:
   a client-side <Link> would swap the route inside this document, and the
   homepage's WELCOME intro only plays on a fresh page load. Going out through
   the browser means the recruiter gets the portfolio's real front door, and
   this study stays open in the tab behind them. */

export function ApplicationHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      className="absolute top-0 left-0 right-0 z-40 w-full px-6 md:px-12 lg:px-16 pt-6 md:pt-8"
    >
      <div className="max-w-[120rem] mx-auto flex items-center justify-between gap-4">
        <a
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cw-display cw-display--label text-[13px] lg:text-[15px] text-[var(--cw-ink)] hover:opacity-70 transition-opacity duration-300 shrink-0"
        >
          AKSHATH<span className="text-[var(--cw-muted)]">.</span>
        </a>

        <div className="flex items-center gap-4 md:gap-7 min-w-0">
          {/* Not a link — it names the document you are in. Hidden on the
              narrowest screens, where the portfolio route is the only thing
              worth spending the width on. */}
          <span className="hidden sm:inline font-['Outfit'] text-[9px] md:text-[10px] tracking-[0.24em] uppercase text-[var(--cw-muted)] whitespace-nowrap">
            Application Study
          </span>

          <span aria-hidden="true" className="hidden sm:block w-px h-3.5 bg-[var(--cw-line-strong)]" />

          {/* The restrained version of the primary CTA. The underline rule
              expands from the left on hover and focus — the same calibrated-line
              gesture the page uses throughout, rather than a second button
              competing with the closing section's. */}
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative font-['Outfit'] text-[9px] md:text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--cw-ink-2)] hover:text-[var(--cw-ink)] transition-colors duration-300 whitespace-nowrap py-1"
          >
            Enter the full portfolio
            <span
              aria-hidden="true"
              className="absolute left-0 -bottom-0.5 h-px w-0 bg-[var(--cw-accent)] transition-[width] duration-500 ease-out group-hover:w-full group-focus-visible:w-full motion-reduce:transition-none"
            />
          </a>
        </div>
      </div>
    </motion.header>
  );
}

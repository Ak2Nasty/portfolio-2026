import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from './primitives';
import { fadeUp, revealProps } from './motion';
import {
  PORTFOLIO_URL, RESUME_HREF, RESUME_FILENAME, CONTACT_EMAIL,
} from '../data/applicationData';

/* ─── Closing ────────────────────────────────────────────────────────────────
   CTA hierarchy, in order: the full portfolio, the resume, then contact.

   The portfolio CTA is an ordinary anchor to an absolute URL with target
   _blank. Every part of that is deliberate:

     · absolute URL + fresh document load — the homepage's WELCOME intro is
       gated in Loader.jsx on the route being "/" at mount. A client-side
       <Link> would swap the route inside this already-mounted document and the
       intro would never play. The recruiter would arrive at the portfolio
       through a side door.
     · target _blank — this study stays open in the tab behind them, so they can
       come back to it without a page load or losing their scroll position.
     · rel noopener noreferrer — standard hygiene for any _blank link.

   The WELCOME intro is a 2000ms timer with no localStorage or sessionStorage
   gate, so a fresh tab replays it every time. Nothing needed to be changed on
   the homepage to make this work, and nothing was. */

function ArrowOut() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ApplicationClosing() {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <Section id="closing" label tone="dark" className="pb-20 md:pb-24">
      <motion.div {...revealProps} className="flex flex-col items-start">
        <motion.h2
          id="closing-heading"
          variants={fadeUp}
          className="cw-display cw-display--mast text-[25px] sm:text-[35px] md:text-[44px] xl:text-[54px] text-[var(--cw-ink)] max-w-[12ch]"
        >
          Precision should be invisible.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-['Outfit'] text-[14px] md:text-[16px] leading-[1.75] text-[var(--cw-ink-2)] max-w-[540px] mt-8"
        >
          My role is to make every launch, activation and retail touchpoint feel
          considered, coordinated and ready.
        </motion.p>

        {/* ── Primary: the full portfolio ──────────────────────────────────
            This is the most important control on the page and it was previously
            a text link with a rule under it — indistinguishable in weight from
            the four other links around it. It is now a full-width presentation
            plaque: gold-framed, guilloché ground, corner marks, and the display
            face at its largest size anywhere on the page.

            The whole plaque is one anchor, so the entire surface is the hit
            target rather than the words alone. Everything inside is
            aria-hidden-safe decoration around a single accessible name. */}
        <motion.div variants={fadeUp} className="w-full mt-16 md:mt-20">
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cw-plaque group"
          >
            <span aria-hidden="true" className="cw-plaque__ground" />
            {/* Corner marks — the registration corners of a presentation box.
                They draw outward on hover, so the frame opens as you approach. */}
            <span aria-hidden="true" className="cw-plaque__corner cw-plaque__corner--tl" />
            <span aria-hidden="true" className="cw-plaque__corner cw-plaque__corner--tr" />
            <span aria-hidden="true" className="cw-plaque__corner cw-plaque__corner--bl" />
            <span aria-hidden="true" className="cw-plaque__corner cw-plaque__corner--br" />

            <span className="cw-plaque__inner">
              <span className="font-['Outfit'] text-[9.5px] tracking-[0.3em] uppercase text-[var(--cw-accent)] block mb-6">
                Continue
              </span>

              <span className="cw-display cw-display--mast block text-[26px] sm:text-[36px] md:text-[46px] xl:text-[56px] text-[var(--cw-ink)] leading-[1.08]">
                Enter the full portfolio
              </span>

              <span className="flex items-center gap-5 mt-8">
                <span aria-hidden="true" className="cw-plaque__rule" />
                <span aria-hidden="true" className="cw-plaque__arrow">
                  <ArrowOut />
                </span>
              </span>

              <span className="font-['Outfit'] text-[12.5px] md:text-[13.5px] leading-[1.65] text-[var(--cw-ink-2)] max-w-[420px] block mt-8">
                Continue into the complete Akshathdayan Suresh portfolio
                experience.
                <span className="block text-[var(--cw-muted)] mt-2 text-[11px] tracking-[0.06em]">
                  Opens in a new tab — this study stays where it is.
                </span>
              </span>
            </span>
          </a>
        </motion.div>

        {/* ── Secondary: resume, then contact ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mt-12">
          <a
            href={RESUME_HREF}
            download={RESUME_FILENAME}
            onClick={() => setDownloaded(true)}
            className={`inline-flex items-center justify-center px-9 py-3.5 font-['Outfit'] font-semibold text-[11px] tracking-[0.22em] uppercase border transition-all duration-300 ${
              downloaded
                ? 'bg-transparent border-[var(--cw-go)] text-[var(--cw-go)]'
                /* Solid ink at rest, hollowing out on hover. Both states are
                   token-driven, so on the black closing section this reads as a
                   white button that empties to an outline — the inversion is
                   automatic and needs no dark-mode variant. */
                : 'bg-[var(--cw-ink)] border-[var(--cw-ink)] text-[var(--cw-bg)] hover:bg-transparent hover:text-[var(--cw-ink)]'
            }`}
          >
            {downloaded ? 'Thank you' : 'Download resume'}
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Marketing and Retail Coordinator — Watches & Fine Jewellery')}`}
            className="group inline-flex items-center justify-center gap-3 px-9 py-3.5 font-['Outfit'] font-semibold text-[11px] tracking-[0.22em] uppercase text-[var(--cw-ink-2)] border border-[var(--cw-line-strong)] hover:border-[var(--cw-accent)] hover:text-[var(--cw-ink)] transition-colors duration-300"
          >
            Contact Akshath
            <span className="text-[var(--cw-muted)] group-hover:text-[var(--cw-accent)] transition-colors duration-300">
              <ArrowOut />
            </span>
          </a>
        </motion.div>
      </motion.div>
    </Section>
  );
}

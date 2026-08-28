import { DISCLAIMER, CONTACT_EMAIL } from '../data/applicationData';

/* ─── Footer ─────────────────────────────────────────────────────────────────
   Sits directly beneath the closing actions, which is where the brief requires
   the independent-study disclaimer to appear. It is set at a readable size
   rather than as fine print: the whole page depends on being unambiguous about
   what it is and who made it, and a disclaimer nobody can read does not do that
   job. #8a8a8a on #0C0C0B measures 5.4:1 — past AA for normal text. */

export function ApplicationFooter() {
  return (
    <footer className="w-full border-t border-[var(--cw-line)]">
      <div className="max-w-[120rem] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-16">
          <p className="font-['Outfit'] text-[13.5px] md:text-[14px] leading-[1.75] text-[var(--cw-muted)] max-w-[640px]">
            {DISCLAIMER}
          </p>

          <div className="flex flex-col gap-2 md:items-end shrink-0">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-['Outfit'] text-[13.5px] tracking-[0.06em] text-[var(--cw-ink-2)] hover:text-[var(--cw-ink)] transition-colors duration-300"
            >
              {CONTACT_EMAIL}
            </a>
            <span className="font-['Outfit'] text-[11.5px] tracking-[0.15em] uppercase text-[var(--cw-muted)]">
              © {new Date().getFullYear()} Akshathdayan Suresh
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

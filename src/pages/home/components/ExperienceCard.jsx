import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ─── The experience card template ───────────────────────────────────────────
   One definition, two consumers: Career12 maps over it for the live section,
   and /card-lab renders it in isolation. Edit the card here and both update —
   before this was extracted the markup lived inline in a .map(), so the only
   way to check a change was to scroll a ten-card sticky stack.

   `standalone` drops the sticky positioning and the stack offset so the lab can
   show the card on its own. Nothing else differs: same markup, same hover
   machinery, same CSS. */
export function ExperienceCard({
  exp,
  index = 0,
  cardRef,
  variants,
  onJump,
  standalone = false,
  /* Lab-only geometry overrides. The live section passes none of these, so its
     behaviour is untouched; /card-lab uses them to render the same cards under
     competing stack formulas side by side. */
  topOverride,
  depthTransform,
  depthOpacity,
}) {
  const topOffset = `calc(var(--stack-top, 15vh) + (${index} * var(--stack-step, 20px)))`;

  /* Brand colour is surfaced on hover only. Shown at rest it would be a muddy
     stripe — three of these companies are green and two are brown — but one at
     a time it reads as identity rather than noise, and Foot Locker's
     black-and-white sits inside the system rather than being the odd one out. */
  const bc = exp.brandColor || "#f4f4f4";
  const rgb = [1, 3, 5].map((i) => parseInt(bc.slice(i, i + 2), 16)).join(", ");

  return (
              <motion.div
                ref={cardRef}
                variants={variants}
                style={{
                  ...(standalone ? {} : { top: topOverride || topOffset, zIndex: index }),
                  ...(depthTransform ? { transform: depthTransform, transformOrigin: 'top center' } : {}),
                  ...(depthOpacity !== undefined ? { opacity: depthOpacity } : {}),
                  /* Drives the index tab's horizontal slot — see .exp-tab */
                  "--i": index,
                  "--bc": bc,
                  "--bc-glow": `rgba(${rgb}, 0.30)`,
                  "--bc-edge": `rgba(${rgb}, 0.45)`,
                }}
                className={`exp-card group ${standalone ? 'exp-card--standalone' : 'sticky mb-[10vh] max-md:mb-[5vh] lg:mb-[25vh]'} ${exp.isHighlight ? 'is-highlight' : ''}`}
              >
                {/* Index tab — click or tap jumps the stack to this card. The logo
                    is decorative (the company name is the card's own heading), so
                    the accessible name lives on the button instead.

                    The closing card has no logo and no brand colour, so it gets a
                    ghost tab: an unwritten label carrying the same crosshair that
                    marks every bullet. */}
                <button
                  type="button"
                  className={`exp-tab${exp.logo ? "" : " exp-tab--ghost"}`}
                  onClick={() => onJump && onJump(index)}
                  aria-label={`Jump to ${exp.company}`}
                >
                  {/* tabLogo overrides the watermark art for marks whose canvas
                      carries so much padding that object-contain leaves them
                      illegible at tab size — CUBS rendered 5x4px against a median
                      of 301px², because its ink fills only 38%x19% of its file. */}
                  {exp.logo ? (
                    <img src={exp.tabLogo || exp.logo} alt="" draggable="false" />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                      <path d="M4.5 0v9M0 4.5h9" strokeWidth="1.1" />
                    </svg>
                  )}
                </button>

                {/* The card surface. .exp-card is only the sticky positioner;
                    this element carries the background, border, padding and the
                    overflow that crops the logo watermark bleeding off its
                    corner. */}
                <div className="exp-back">
                <div className="flex flex-col gap-5 max-md:gap-3 flex-1 relative z-10 justify-between">
                  <div>
                    {/* Header (Company & Role) */}
                    {/* On mobile there's no room for a side rail, so the metric
                        rides alongside the company name instead. Hidden at md+,
                        where the rail takes over. */}
                    <div className="flex flex-row items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5 max-md:gap-1 min-w-0">
                        <h4 className={`font-['Outfit'] font-bold text-[24px] sm:text-[28px] md:text-[36px] ${exp.isHighlight ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-[#f4f4f4] group-hover:text-[var(--bc)]'} uppercase tracking-tight leading-none transition-colors duration-500 exp-name`}>
                          {exp.company}
                        </h4>
                        <h5 className={`font-['Outfit'] text-[16px] sm:text-[18px] md:text-[20px] ${exp.isHighlight ? 'text-[#e5e5e5]' : 'text-[#e5e5e5]'} font-medium tracking-wide`}>
                          {exp.role}
                        </h5>
                      </div>

                      {exp.metric && (
                        <div className="min-[1440px]:hidden flex-shrink-0 text-right relative z-10">
                          {/* Two colour regimes. Below md the brand colour is always
                              on, driven by --live: there is no hover on a phone, and
                              forcing :hover on touch would take a tap to trigger.
                              From md to 1440 this stands in for the rail, so it
                              takes the same hover treatment the rail uses. The
                              --live rule is scoped to max-width 767px and sits after
                              @tailwind utilities, so it still wins on mobile. */}
                          <div className="font-['Outfit'] font-medium leading-none tracking-[-0.02em] text-[28px] sm:text-[32px] md:text-[36px] md:transition-all md:duration-500 md:group-hover:text-[var(--bc)] md:group-hover:drop-shadow-[0_0_10px_var(--bc-glow)] exp-metric">
                            {exp.metricPrefix && (
                              <span className="text-[0.5em] align-baseline mr-[0.05em]">{exp.metricPrefix}</span>
                            )}
                            {exp.metric}
                            {exp.metricSuffix && (
                              <span className="text-[0.5em] align-baseline">{exp.metricSuffix}</span>
                            )}
                          </div>
                          {/* 7.5px was below the point where tracked-out caps stay
                              legible on a phone; 9px is the floor used everywhere
                              else on the card. max-w stays at 86px — widening it
                              to fit the longer label on one line stole enough
                              width from the name column that "CORPORATION" no
                              longer fit. Better to let the label wrap. */}
                          <div className="font-['Outfit'] text-[9px] tracking-[0.18em] text-[#a3a3a3] uppercase mt-2 leading-[1.4] max-w-[86px] md:max-w-[120px] ml-auto">
                            {exp.metricLabel}
                          </div>
                        </div>
                      )}
                    </div>

                    <ul className="flex flex-col gap-2 max-md:gap-1.5 mt-4 max-md:mt-3 mb-2">
                      {exp.summary.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {/* Registration-mark tick rather than a glyph bullet: it sits
                              on the same technical-drawing register as the spec rows and
                              hairlines elsewhere, and frees green up to mean only
                              "available for work". Drawn rather than typed so the weight
                              stays consistent across platforms. */}
                          {/* currentColor so the tick picks up the card's brand
                              colour on hover alongside the name and the metric,
                              and spins in place as the card lights up */}
                          <span
                            aria-hidden="true"
                            className={`shrink-0 mt-[7px] md:mt-[9px] transition-[color,transform] duration-500 group-hover:rotate-180 ${exp.isHighlight ? 'opacity-70 text-[#7a7a7a]' : 'text-[#7a7a7a] group-hover:text-[var(--bc)]'} exp-tick`}
                            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                          >
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                              <path d="M4.5 0v9M0 4.5h9" stroke="currentColor" strokeWidth="1" />
                            </svg>
                          </span>
                          <span 
                            className={`font-['Outfit'] text-[13px] sm:text-[14px] md:text-[16px] leading-[1.6] max-md:leading-[1.5] font-light ${exp.isHighlight ? 'text-[#c4c4c4]' : 'text-[#b3b3b3]'} max-w-[600px]`}
                            dangerouslySetInnerHTML={{ __html: point }} 
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4 max-md:gap-2.5 mt-auto pt-6 max-md:pt-4">
                    {/* CTA */}
                    {exp.link && (
                      <Link 
                        to={exp.link}
                        className="flex items-center gap-3 font-['Outfit'] text-[10px] md:text-[11px] font-semibold tracking-[0.2em] text-[#f4f4f4] uppercase transition-all duration-300 border border-white/20 rounded-full px-6 py-2.5 hover:bg-white hover:text-black hover:border-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] w-fit group/cta"
                      >
                        VIEW PROJECT 
                        <span className="transition-transform duration-300 group-hover/cta:translate-x-1.5 font-bold">→</span>
                      </Link>
                    )}

                    {/* Metadata */}
                    {/* #666 measured 3.45:1 against the card — below the 4.5:1
                        WCAG AA floor for text this size, and this is the one line
                        the logo watermark sits behind (61% covered), so its real
                        contrast was worse still. #8a8a8a clears the bar at 5.7:1
                        while staying clearly subordinate to the body copy. */}
                    <p className={`font-['Outfit'] text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] uppercase ${exp.isHighlight ? 'text-[#9a9a9a]' : 'text-[#8a8a8a]'}`}>
                      {exp.metadata}
                    </p>
                  </div>
                </div>

                {/* Achievement metric. Takes the right rail the logo used to
                    occupy, so the number is the thing the eye lands on rather
                    than a figure buried mid-sentence. Cards without a metric
                    simply don't render a rail. */}
                {/* The rail costs ~204px of card width. Above 1440 that is free
                    — every card still settles on the same height. Below it the
                    text column is squeezed hard enough that bullets wrap and
                    cards end up 106px apart at 1280 (285px at 1024), so the
                    metric moves inline instead. 1440 is not a Tailwind stop,
                    hence the arbitrary variant. */}
                {exp.metric && (
                  <div className="hidden min-[1440px]:flex flex-col justify-center flex-shrink-0 relative z-10 pl-6 lg:pl-8 ml-6 lg:ml-8 text-right min-w-[120px] lg:min-w-[140px]">
                    {/* Scoped to the metric block rather than a border on the rail.
                        As a border it inherited the stretched flex item's full card
                        height and ran through the logo watermark. Neutral at rest;
                        takes the brand colour and grows only on hover. */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-white/[0.16] h-[62px] lg:h-[74px] group-hover:bg-[var(--bc)] group-hover:h-[84px] lg:group-hover:h-[100px] transition-all duration-500"
                    />
                    {/* Takes the brand colour on hover with a light halo, same as
                        the company name — the two read as one highlight rather
                        than two competing ones */}
                    <div className={`font-['Outfit'] font-medium leading-none tracking-[-0.02em] text-[40px] lg:text-[52px] 2xl:text-[60px] transition-all duration-500 ${exp.isHighlight ? 'text-white' : 'text-[#f4f4f4] group-hover:text-[var(--bc)] group-hover:drop-shadow-[0_0_10px_var(--bc-glow)]'}`}>
                      {exp.metricPrefix && (
                        <span className="text-[0.5em] align-baseline mr-[0.05em]">{exp.metricPrefix}</span>
                      )}
                      {exp.metric}
                      {exp.metricSuffix && (
                        <span className="text-[0.5em] align-baseline">{exp.metricSuffix}</span>
                      )}
                    </div>
                    <div className="font-['Outfit'] text-[8px] lg:text-[9px] tracking-[0.2em] text-[#a3a3a3] uppercase mt-3 leading-[1.5]">
                      {exp.metricLabel}
                    </div>
                  </div>
                )}

                {/* Logo watermark. Was a solid element in the flex row on desktop;
                    now it bleeds off the corner behind the content at low opacity
                    on every breakpoint — which is what mobile already did — so it
                    reads as atmosphere and leaves the rail to the metric. */}
                {exp.logo && (
                  /* Fixed SQUARE box, not h-auto. With auto height the box grew
                     and shrank with each logo's aspect ratio, so a bottom-anchored
                     watermark put every mark in a different place. A square box
                     centres them all on the same point. */
                  <div
                    /* Bleed scales with the box. A flat -bottom-24 was tuned for
                       the 320px desktop box and cropped nearly half the mark off
                       the 200px mobile one. */
                    className="absolute -right-8 -bottom-6 sm:-bottom-10 md:-right-10 md:-bottom-20 lg:-bottom-24 flex items-center justify-center w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] 2xl:w-[380px] 2xl:h-[380px] pointer-events-none select-none transition-all duration-700 opacity-[0.08] group-hover:opacity-[0.14] mix-blend-screen z-0"
                    /* Faded out towards the top, where the metric label and the
                       card's body text sit. Without it the mark ran straight
                       through the label — the smallest, dimmest text on the card
                       — covering it entirely on some logos. */
                    style={{
                      maskImage: "linear-gradient(to top, #000 0%, #000 45%, transparent 92%)",
                      WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 45%, transparent 92%)",
                    }}
                  >
                    {/* logoScale equalises rendered INK area across logos. The files
                        carry wildly different internal padding — CUBS's artwork fills
                        38%x19% of its canvas, OKHC's 93%x93% — so equal box sizes gave
                        a 16.7x spread in optical weight. Measured, not eyeballed. */}
                    <img
                      src={exp.logo}
                      alt=""
                      className={`w-full h-full object-contain ${exp.logoScale || ""} ${exp.logoClass || "brightness-0 invert"}`}
                      draggable="false"
                    />
                  </div>
                )}

                </div>{/* exp-back */}
              </motion.div>
  );
}

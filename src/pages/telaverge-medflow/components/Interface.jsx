import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, ConceptTag, Ref,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { Icon } from './icons';
import { MedFlowScreen, DeviceFrame } from './screens';
import { WIREFRAMES, SCREENS } from '../data/caseStudyData';

/* ─── 08 · Wireframes ────────────────────────────────────────────────────────
   Deliberately, aggressively low fidelity: grey blocks, no type, no colour, no
   icons. If these looked like a draft of the visual design they would prove
   nothing — the claim this section makes is that the LAYOUT decisions were
   settled by the workflow and the risk analysis, before any styling existed.

   Each wireframe carries one annotation, and that annotation is the rationale
   that survived into the built screen. Read this section and section 09
   together and the derivation is visible: same regions, same order, same
   emphasis.

   The wireframes are drawn as block layouts rather than images so they cost
   nothing to load, scale to any width, and stay legible on a phone. */

/* Block primitives. `w` is a percentage so every wireframe is fluid. */
function Bar({ w = '100%', h = 8, className = '', style }) {
  return <span className={`mf-wire__bar block ${className}`} style={{ width: w, height: h, ...style }} />;
}
function Box({ h = 40, className = '', children, style }) {
  return (
    <span className={`mf-wire__box block ${className}`} style={{ height: h, ...style }}>
      {children}
    </span>
  );
}

/* One layout per screen. These are the actual region decisions — the identity
   band at the top of every safety-significant screen, the split between
   prescribed and editable, the side-by-side comparison on the discrepancy
   screen — expressed as nothing but boxes. */
function WireBody({ id }) {
  const stack = 'flex flex-col gap-2.5 p-3';
  switch (id) {
    case 'dashboard':
      return (
        <span className={stack}>
          <Bar w="55%" h={11} />
          <Bar w="32%" h={6} />
          <Box h={54} style={{ borderStyle: 'solid', borderWidth: 2 }} />
          <Box h={34} />
          <Box h={34} />
          <Box h={34} />
        </span>
      );
    case 'verify':
      return (
        <span className={stack}>
          {/* Identity band — solid, because it is present and permanent */}
          <Bar w="100%" h={26} />
          <Bar w="60%" h={10} />
          <span className="grid grid-cols-2 gap-2.5">
            <Box h={34} /><Box h={34} />
          </span>
          <Box h={62} />
          <span className="grid grid-cols-2 gap-2.5 mt-auto">
            <Box h={30} style={{ borderStyle: 'solid' }} /><Box h={30} />
          </span>
        </span>
      );
    case 'order':
      return (
        <span className={stack}>
          <Bar w="100%" h={26} />
          <Bar w="48%" h={10} />
          <Box h={34} />
          <span className="grid grid-cols-2 gap-2.5">
            <Box h={34} /><Box h={34} />
          </span>
          <Box h={34} />
          <Box h={30} className="mt-auto" style={{ borderStyle: 'solid' }} />
        </span>
      );
    case 'configure':
      return (
        <span className={stack}>
          <Bar w="100%" h={26} />
          <Bar w="52%" h={10} />
          <span className="grid grid-cols-2 gap-2.5">
            <Box h={30} /><Box h={30} />
          </span>
          {/* The divider is the whole point of this wireframe: prescribed above,
              editable below. */}
          <Bar w="100%" h={1} />
          <span className="grid grid-cols-2 gap-2.5">
            <Box h={42} style={{ borderStyle: 'solid', borderWidth: 2 }} />
            <Box h={42} style={{ borderStyle: 'solid', borderWidth: 2 }} />
          </span>
          <Bar w="70%" h={6} />
          <Box h={30} className="mt-auto" style={{ borderStyle: 'solid' }} />
        </span>
      );
    case 'confirm':
      return (
        <span className={stack}>
          <Bar w="100%" h={26} />
          <Bar w="58%" h={10} />
          <span className="grid grid-cols-2 gap-2.5">
            <Box h={30} /><Box h={30} />
          </span>
          <Box h={48} style={{ borderStyle: 'solid', borderWidth: 2 }} />
          <Bar w="55%" h={6} />
          <Bar w="42%" h={6} />
          <span className="grid grid-cols-2 gap-2.5 mt-auto">
            <Box h={30} /><Box h={30} style={{ borderStyle: 'solid' }} />
          </span>
        </span>
      );
    case 'active':
      return (
        <span className={stack}>
          <Bar w="100%" h={26} />
          <Box h={22} style={{ width: '46%', borderStyle: 'solid' }} />
          <Bar w="40%" h={8} />
          <Bar w="34%" h={26} />
          <Bar w="100%" h={6} />
          <span className="flex justify-between">
            <Bar w="44%" h={6} /><Bar w="34%" h={6} />
          </span>
          <span className="grid grid-cols-2 gap-2.5 mt-auto">
            <Box h={30} /><Box h={30} style={{ borderStyle: 'solid' }} />
          </span>
        </span>
      );
    case 'alert':
      return (
        <span className={stack}>
          <Bar w="100%" h={26} />
          <Box h={22} style={{ width: '52%', borderStyle: 'solid', borderWidth: 2 }} />
          <Bar w="58%" h={13} />
          <Bar w="40%" h={7} />
          <Box h={52} style={{ borderStyle: 'solid', borderLeftWidth: 5 }} />
          <span className="grid grid-cols-2 gap-2.5 mt-auto">
            <Box h={30} /><Box h={30} style={{ borderStyle: 'solid', borderWidth: 2 }} />
          </span>
        </span>
      );
    /* The completion frame. Its whole reason for existing is the FULL bar —
        that is the one region where this screen differs structurally from
        'active', and it is the difference the caption is about. The summary
        rows beneath it are the second: a finished infusion reports what was
        delivered, which a running one has no need to. */
    case 'complete':
      return (
        <span className={stack}>
          <Bar w="100%" h={26} />
          <Box h={22} style={{ width: '48%', borderStyle: 'solid', borderWidth: 2 }} />
          <Bar w="40%" h={8} />
          <Bar w="46%" h={26} />
          {/* Full, not partial — the point of the screen. */}
          <Bar w="100%" h={6} style={{ background: 'var(--mf-line-strong)' }} />
          <span className="flex justify-between">
            <Bar w="40%" h={6} /><Bar w="30%" h={6} />
          </span>
          {/* Delivery summary */}
          <Bar w="100%" h={1} />
          <span className="flex justify-between"><Bar w="34%" h={5} /><Bar w="22%" h={5} /></span>
          <span className="flex justify-between"><Bar w="28%" h={5} /><Bar w="20%" h={5} /></span>
          <span className="grid grid-cols-2 gap-2.5 mt-auto">
            <Box h={30} /><Box h={30} style={{ borderStyle: 'solid' }} />
          </span>
        </span>
      );

    default:
      /* A wireframe listed in the data with no case here renders as an empty
         box — which is exactly what happened when 'complete' was added to
         WIREFRAMES and this switch was not updated. Silent in production,
         loud in development. */
      if (import.meta.env.DEV) {
        console.warn(`[medflow] WireBody has no case for "${id}" — it will render blank.`);
      }
      return null;
  }
}

export function Wireframes() {
  return (
    <Section id="wireframes" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="wireframes"
          n="08"
          label="Wireframes"
          heading="From workflow to interface"
          lead="Low-fidelity on purpose. Every layout decision below came from the workflow and the risk analysis rather than from visual styling — which is why these have no colour, no type and no icons to hide behind."
        />

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {WIREFRAMES.map((w, i) => (
            <figure key={w.id} className="m-0 flex flex-col">
              {/* Fixed, not flex-1 + min-height. As a flex child it absorbed
                  whatever the caption left over, so the two wireframes with
                  two-line notes came out 250px against the others' 267px and
                  their captions started 17px higher. A uniform box is what puts
                  every caption on the same line. */}
              <div className="mf-wire flex flex-col" style={{ height: 272 }}>
                <WireBody id={w.id} />
              </div>

              <figcaption className="mt-3.5">
                <span className="flex items-baseline gap-2.5">
                  <span
                    className="font-['Outfit'] text-[11px] font-semibold tabular-nums shrink-0"
                    style={{ color: 'var(--mf-muted)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-['Outfit'] text-[13.5px] font-semibold" style={{ color: 'var(--mf-ink)' }}>
                    {w.title}
                  </span>
                </span>
                <span className="flex items-start gap-2.5 mt-2.5">
                  <span aria-hidden="true" className="mf-annot mt-[1px]">{i + 1}</span>
                  <span className="font-['Outfit'] text-[12.5px] leading-[1.5]" style={{ color: 'var(--mf-ink-2)' }}>
                    {w.note}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 pt-8" style={{ borderTop: '1px solid var(--mf-line)' }}>
          <Prose wide>
            Compare these against the screens in the next section: the same regions, in the same
            order, with the same emphasis. Nothing structural changed once colour and type were
            applied &mdash; which is the outcome this sequence was meant to produce.
          </Prose>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── 09 · Final interface ───────────────────────────────────────────────────
   Eight screens, each with the rationale that produced it and a link back to
   the user need it satisfies. The rationale is not a caption — it is the
   argument, and it is set at body size rather than as small print.

   Screen 05 (the discrepancy state) gets a wider treatment because it is the
   one that carries the study. Everything else demonstrates competence; that
   screen demonstrates understanding of the actual difference between ordinary
   and safety-critical design.

   These are the SAME components the prototype runs, rendered inert. `live` is
   false so forty controls do not appear in the tab order between here and the
   next section. */

function ScreenCard({ s, wide = false }) {
  return (
    <motion.figure
      variants={fadeUp}
      id={`screen-${s.id}`}
      className={`m-0 flex flex-col ${wide ? 'lg:col-span-2' : ''}`}
      style={{ scrollMarginTop: '96px' }}
    >
      <div className={wide ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 lg:gap-10 items-start' : ''}>
        <DeviceFrame className="w-full" style={wide ? { maxWidth: 380 } : undefined}>
          <MedFlowScreen id={s.id} />
        </DeviceFrame>

        <figcaption className={wide ? '' : 'mt-6'}>
          <span className="flex items-baseline gap-3">
            <span
              className="font-['Outfit'] text-[11px] font-semibold tabular-nums"
              style={{ letterSpacing: '0.12em', color: 'var(--mf-accent)' }}
            >
              {s.n}
            </span>
            <span
              className={`font-['Outfit'] font-semibold ${wide ? 'text-[19px] md:text-[22px]' : 'text-[15px]'}`}
              style={{ color: 'var(--mf-ink)', letterSpacing: '-0.01em' }}
            >
              {s.title}
            </span>
          </span>

          <p
            className={`font-['Outfit'] leading-[1.65] mt-3 m-0 ${wide ? 'text-[15px] md:text-[16.5px] max-w-[56ch]' : 'text-[13.5px]'}`}
            style={{ color: 'var(--mf-ink-2)' }}
          >
            {s.rationale}
          </p>

          {s.need && (
            <span className="flex items-center gap-4 mt-3.5">
              <Ref href={`#${s.need}`}>{s.need}</Ref>
            </span>
          )}

          {wide && (
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--mf-line)' }}>
              <p className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0" style={{ color: 'var(--mf-muted)' }}>
                This is a conceptual demonstration of interrupting a foreseeable use error. It is
                not a clinically validated safety control, and the comparison shown is between an
                entered value and a simulated order &mdash; not between a value and any clinical
                limit.
              </p>
            </div>
          )}
        </figcaption>
      </div>
    </motion.figure>
  );
}

export function FinalInterface() {
  const emphasis = SCREENS.find((s) => s.emphasis);
  const rest = SCREENS.filter((s) => !s.emphasis);

  return (
    <Section id="final-interface">
      <motion.div {...revealProps}>
        <SectionHead
          id="final-interface"
          n="09"
          label="Final interface"
          heading="The MedFlow experience"
          lead="Eight screens. Each one carries the reasoning that produced it, and each links back to the user need it exists to satisfy."
        >
          <div className="mt-6">
            <ConceptTag>All eight screens are conceptual &middot; every value is fictional</ConceptTag>
          </div>
        </SectionHead>

        {/* The screen the study rests on, given its own row. */}
        {emphasis && (
          <div
            className="mb-12 md:mb-16 p-5 md:p-8 rounded-[4px]"
            style={{ background: 'var(--mf-bg-alt)', border: '1px solid var(--mf-line-strong)' }}
          >
            <span className="flex items-center gap-2.5 mb-6">
              <span style={{ color: 'var(--mf-attn)' }}><Icon name="diamond" size={13} /></span>
              <Label>The screen this study rests on</Label>
            </span>
            <ScreenCard s={emphasis} wide />
          </div>
        )}

        {/* ── The gallery must never render a screen below its design width ──
            This was `lg:grid-cols-4`, which forces four equal columns whatever
            the room. At 1440px that resolved to 245px per column and 224px of
            actual screen — against a design width of 359px, which is what the
            hero and the prototype give it. Every screen was being run at 62%
            and reflowing in ways it was never designed to: the status chip
            landed 20px on top of the patient identity on all four dashboard
            cards, and the volume field clipped "100" to "10C".

            auto-fill with a 320px floor drops to three columns, or two, rather
            than squeezing. The screens keep their proportions at every width,
            which is the claim section 11 makes about them. */}
        <div
          className="mf-gallery grid gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-14"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
        >
          {rest.map((s) => (
            <ScreenCard key={s.id} s={s} />
          ))}
        </div>
      </motion.div>
    </Section>
  );
}

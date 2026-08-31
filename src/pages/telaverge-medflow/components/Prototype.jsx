import { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, ScopeNote, Chip,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { Icon, StatusGlyph } from './icons';
import { MedFlowScreen, DeviceFrame } from './screens';
import { SCENARIO } from '../data/caseStudyData';

/* ─── 10 · Interaction prototype ─────────────────────────────────────────────
   A genuinely clickable walkthrough, running the same screen components that
   section 09 renders as pictures. That reuse is what makes this honest: there
   is no separate "prototype build" that could drift from the screens above.

   ── The demonstration ──
   The rate field is SEEDED WITH 50 rather than 5. Not an accident, not hidden:
   it is the entire point. A prototype that only walks the happy path
   demonstrates nothing about safety-critical design, because the happy path is
   where nothing goes wrong. This one puts the reader in the position of the
   nurse who has just made a plausible ten-fold entry slip, and shows them what
   the interface does about it.

   ══ TWO KINDS OF MOVEMENT, AND WHY THEY ARE SEPARATE ══════════════════════
   This section has to do two things that pull against each other: let a reader
   go back and re-read a screen, AND demonstrate that the workflow blocks.

   Free navigation would destroy the demonstration. If the rail let you click
   from "Discrepancy" straight to "Confirm", the block stops being a block and
   the entire argument of the section evaporates — the reader would conclude the
   guard is decorative.

   So movement is split:

     THE WORKFLOW    — the device's own buttons. Obeys the rules. The only way
                       past the discrepancy is to go back and fix the value.
                       No override exists.

     REVIEW          — the rail, the prev/next controls, the arrow keys. Moves
                       freely among steps ALREADY REACHED, and cannot enter one
                       that has not been legitimately reached. Reviewing a
                       record is not the same act as performing the workflow,
                       and the interface says so.

   `reached` is the set of steps the workflow has actually granted. Review
   navigation is bounded by it; the workflow is what grows it. A locked step
   states why it is locked rather than simply not responding.
   ═════════════════════════════════════════════════════════════════════════

   ── What this is NOT ──
   No clinical logic is represented. The comparison is between a typed value and
   a fictional order, nothing more: no dose calculation, no rate limit, no drug
   library, no clinical rule of any kind. */

const FLOW = [
  { id: 'dashboard', label: 'Dashboard', note: 'Four patients assigned. One requires infusion setup.' },
  { id: 'verify', label: 'Verify patient', note: 'Identity must be verified before the safety-significant workflow begins. If the scanner will not read, the manual route still has to be completed — it is a designed alternative, not a way past the gate.' },
  { id: 'order', label: 'Review order', note: 'Prescribed values, shown read-only.' },
  { id: 'configure', label: 'Configure', note: 'The rate field is pre-filled with 50 mL/hr — a deliberate ten-fold entry slip.' },
  { id: 'discrepancy', label: 'Discrepancy', note: 'Progression is blocked. The entered rate does not match the order.' },
  { id: 'confirm', label: 'Confirm', note: 'A dedicated review stage immediately before a safety-significant action.' },
  { id: 'active', label: 'Monitor', note: 'Infusion running. State, therapy and rate are all visible at once.' },
  { id: 'alert', label: 'Alert', note: 'An occlusion has interrupted the infusion. Four signals, before colour is counted.' },
  { id: 'complete', label: 'Complete', note: 'Finished, and visibly distinct from paused or interrupted — its own state, glyph, and delivery summary.' },
];

const INITIAL = { verified: false, rate: SCENARIO.mistypedRate, volume: '100' };

export function Prototype() {
  const [stepId, setStepId] = useState('dashboard');
  const [state, setState] = useState(INITIAL);
  const [event, setEvent] = useState(null);
  /* Steps the WORKFLOW has granted. Review navigation may not leave this set. */
  const [reached, setReached] = useState(['dashboard']);
  const railRef = useRef(null);

  const step = useMemo(() => FLOW.find((f) => f.id === stepId) ?? FLOW[0], [stepId]);
  const stepIndex = FLOW.findIndex((f) => f.id === stepId);
  const furthestIndex = useMemo(
    () => Math.max(...reached.map((id) => FLOW.findIndex((f) => f.id === id))),
    [reached],
  );
  /* True when the reader has stepped back to re-read something. */
  const reviewing = stepIndex < furthestIndex;
  const rateMatches = state.rate.trim() === SCENARIO.correctRate;

  /* The workflow granting a step. The ONLY thing that grows `reached`. */
  const advance = useCallback((id) => {
    setStepId(id);
    setReached((r) => (r.includes(id) ? r : [...r, id]));
  }, []);

  const reset = useCallback(() => {
    setStepId('dashboard');
    setState(INITIAL);
    setReached(['dashboard']);
    setEvent('Prototype reset to the beginning.');
  }, []);

  /* Review movement. Bounded by `reached` — it can never grant a step. */
  const review = useCallback(
    (id) => {
      if (!reached.includes(id)) return;
      setStepId(id);
      setEvent(null);
    },
    [reached],
  );

  const reviewableNeighbour = useCallback(
    (dir) => {
      const next = FLOW[stepIndex + dir];
      if (!next || !reached.includes(next.id)) return null;
      return next.id;
    },
    [stepIndex, reached],
  );

  const prevId = reviewableNeighbour(-1);
  const nextId = reviewableNeighbour(1);

  /* ── The workflow state machine ──
     One place, so the routing rules read as a list. Every transition here is
     the workflow granting a step; none of it is reachable from the rail. */
  const onAction = useCallback(
    (action) => {
      setEvent(null);
      switch (stepId) {
        case 'dashboard':
          return advance('verify');

        /* Two routes to the same gate, and the record keeps them apart.
           "Unable to scan" used to land here as well and set `verified` — so
           declining to scan verified the patient, on the screen whose only job
           is the identity check. It no longer reaches the workflow at all: it
           switches the screen to the manual read-back, and only completing that
           produces 'verify-manual'. */
        case 'verify':
          if (action === 'verify') {
            setState((s) => ({ ...s, verified: 'scan' }));
            return setEvent('Wristband scanned. Patient identity verified.');
          }
          if (action === 'verify-manual') {
            setState((s) => ({ ...s, verified: 'manual' }));
            return setEvent(
              'Identity confirmed by manual read-back. Recorded as a manual check, not a scan.',
            );
          }
          return advance('order');

        case 'order':
          return advance('configure');

        /* The check. The only branch, and the one the section exists to show. */
        case 'configure':
          if (state.rate.trim() !== SCENARIO.correctRate) {
            /* Snapshot the value that CAUSED the discrepancy.
               Without this, revisiting step 05 after correcting the rate
               renders "Order 5 / Entered 5" under the heading "Infusion
               settings require review" — an incoherent screen, because it was
               reading the live value rather than the one that triggered it.
               A record of an event shows the event's values. That is the whole
               distinction this section is built on: reviewing a record is not
               the same act as performing the workflow. */
            setState((s) => ({ ...s, flaggedRate: s.rate }));
            setEvent('Entered rate does not match the order. Progression blocked.');
            return advance('discrepancy');
          }
          return advance('confirm');

        case 'discrepancy':
          /* One way out, and it goes backwards. */
          return setStepId('configure');

        case 'confirm':
          if (action === 'back') return setStepId('configure');
          setEvent('Simulated infusion started.');
          return advance('active');

        case 'active':
          return advance('alert');

        case 'alert':
          /* Acknowledging the alert resolves it; the infusion then runs to
             term. Previously this reset the prototype, which meant the one
             state a reader never reached was the one where nothing went
             wrong. */
          setEvent('Alert acknowledged. Infusion resumed and ran to completion.');
          return advance('complete');

        case 'complete':
          return reset();

        default:
          return undefined;
      }
    },
    [stepId, state.rate, advance, reset],
  );

  /* Arrow keys move through REVIEW, not the workflow — so they can never skip
     the guard. Ignored while the caret is in the rate field, where left/right
     belong to text editing. */
  const onKeyDown = (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'ArrowLeft' && prevId) { e.preventDefault(); review(prevId); }
    if (e.key === 'ArrowRight' && nextId) { e.preventDefault(); review(nextId); }
  };

  return (
    <Section id="prototype" alt>
      <motion.div {...revealProps}>
        <SectionHead
          id="prototype"
          n="10"
          label="Interaction prototype"
          heading="Testing the complete flow"
          lead="A clickable walkthrough running the same components as the screens above. The rate field starts at 50 mL/hr against an order of 5 — the discrepancy is the demonstration, not a bug."
        />

        <motion.div variants={fadeUp} className="mb-6">
          <ScopeNote>
            No clinical logic is represented. The prototype compares a typed value against a
            fictional order and nothing else &mdash; there is no dose calculation, rate limit, drug
            library, or clinical rule of any kind behind the check.
          </ScopeNote>
        </motion.div>

        {/* ── The console ──────────────────────────────────────────────────
            The interactive centrepiece gets its own surface and a heavier
            border, so it reads as an instrument embedded in the document
            rather than as more page. */}
        <motion.div
          variants={fadeUp}
          onKeyDown={onKeyDown}
          role="group"
          aria-label="MedFlow interactive prototype"
          className="mf-console rounded-[6px] overflow-hidden"
          style={{ background: 'var(--mf-surface)', border: '1.5px solid var(--mf-line-strong)' }}
        >
          {/* ── Console header: progress meter ── */}
          <div
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 md:px-7 py-4"
            style={{ borderBottom: '1px solid var(--mf-line)', background: 'var(--mf-bg-alt)' }}
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="mf-mark" />
              <span
                className="font-['Outfit'] text-[11px] font-semibold uppercase"
                style={{ letterSpacing: '0.16em', color: 'var(--mf-ink)' }}
              >
                {step.label}
              </span>
              <span
                className="font-['Outfit'] text-[11px] tabular-nums"
                style={{ letterSpacing: '0.1em', color: 'var(--mf-muted)' }}
              >
                {String(stepIndex + 1).padStart(2, '0')} / {FLOW.length}
              </span>
            </span>

            {/* Segmented meter. Filled = reached, outlined = current,
                empty = not yet granted by the workflow. */}
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {FLOW.map((f, i) => {
                const isReached = reached.includes(f.id);
                const isCurrent = i === stepIndex;
                return (
                  <span
                    key={f.id}
                    style={{
                      width: isCurrent ? 22 : 10,
                      height: 4,
                      borderRadius: 2,
                      background: isCurrent
                        ? 'var(--mf-accent)'
                        : isReached
                          ? 'var(--mf-accent-line)'
                          : 'var(--mf-line-strong)',
                      transition: 'width 260ms cubic-bezier(0.16,1,0.3,1), background-color 260ms ease',
                    }}
                  />
                );
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            {/* ── The device ── */}
            {/* White, not the alt grey. The device bezel is --mf-bg-alt
                 everywhere on the page, so a grey column behind it would make
                 the two the same tone and the frame would vanish. Previously
                 this column was grey and the DEVICE was overridden to white to
                 compensate — which fixed the contrast here and made the
                 prototype's device the only one on the page that did not match
                 the others. The backing changes; the device never does. */}
            {/* p-4 below sm, not p-5. Eight pixels, and they are the eight that
                put a 360px phone's screen at 304px rather than 296px — over the
                300px line at which the field pairs stack, which is what keeps
                the device the same 592px here as everywhere else on the page. */}
            <div
              className="p-4 sm:p-5 md:p-7 flex flex-col"
              style={{ background: 'var(--mf-surface)', borderRight: '1px solid var(--mf-line)' }}
            >
              {/* `live` here drives the device clock as well as the screen —
                  this is the one frame on the page that is a running device
                  rather than a picture of one. */}
              <DeviceFrame className="w-full" style={{ maxWidth: 380 }} live>
                <MedFlowScreen
                  id={stepId}
                  live
                  onAction={onAction}
                  state={state}
                  setState={setState}
                />
              </DeviceFrame>

              {/* ── Review controls ──
                  Deliberately below the device and visually quieter than
                  anything on it: these move the reader, the device's own
                  buttons move the workflow. */}
              <div className="mt-5">
                <div className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => prevId && review(prevId)}
                    disabled={!prevId}
                    className="mf-btn mf-btn--secondary flex-1"
                    style={{ fontSize: 12 }}
                  >
                    <Icon name="arrow-left" size={13} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => nextId && review(nextId)}
                    disabled={!nextId}
                    className="mf-btn mf-btn--secondary flex-1"
                    style={{ fontSize: 12 }}
                  >
                    Forward
                    <Icon name="arrow-right" size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 mt-3">
                  <span
                    className="mf-keyhint font-['Outfit'] text-[10.5px] uppercase"
                    style={{ letterSpacing: '0.14em' }}
                  >
                    <span aria-hidden="true">&larr; &rarr;</span> to review
                  </span>
                  <button
                    type="button"
                    onClick={reset}
                    className="mf-ref inline-flex items-center gap-2 font-['Outfit'] text-[11px] font-semibold uppercase pl-2"
                    style={{ letterSpacing: '0.14em', color: 'var(--mf-accent)' }}
                  >
                    <Icon name="refresh" size={13} />
                    Start over
                  </button>
                </div>

                {/* Only appears when the reader has stepped back, and offers
                    the way forward again. */}
                {reviewing && (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 mt-4 px-3.5 py-3 rounded-[4px]"
                    style={{ background: 'var(--mf-info-bg)', border: '1px solid var(--mf-info-line)' }}
                  >
                    <span
                      className="font-['Outfit'] text-[11.5px] font-medium"
                      style={{ color: 'var(--mf-info)' }}
                    >
                      Reviewing an earlier step
                    </span>
                    <button
                      type="button"
                      onClick={() => review(FLOW[furthestIndex].id)}
                      className="inline-flex items-center gap-1.5 font-['Outfit'] text-[10.5px] font-semibold uppercase py-1"
                      style={{ letterSpacing: '0.12em', color: 'var(--mf-info)', minHeight: 24 }}
                    >
                      Return to {FLOW[furthestIndex].label}
                      <Icon name="arrow-right" size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── The rail ── */}
            <div className="p-5 md:p-7">
              <div className="flex items-center justify-between gap-4 mb-4">
                <Label>Flow</Label>
                <span
                  className="font-['Outfit'] text-[10.5px] uppercase"
                  style={{ letterSpacing: '0.13em', color: 'var(--mf-muted)' }}
                >
                  {reached.length} of {FLOW.length} unlocked
                </span>
              </div>

              <ol ref={railRef} className="flex flex-col gap-1 m-0 p-0 list-none">
                {FLOW.map((f, i) => {
                  const isCurrent = f.id === stepId;
                  const isReached = reached.includes(f.id);
                  const isPast = isReached && i < stepIndex;
                  const locked = !isReached;

                  const inner = (
                    <>
                      <span
                        className="font-['Outfit'] text-[11px] font-semibold tabular-nums shrink-0 pt-[3px] flex items-center justify-center"
                        style={{
                          color: isCurrent ? 'var(--mf-accent)' : locked ? 'var(--mf-off)' : 'var(--mf-muted)',
                          minWidth: 18,
                        }}
                      >
                        {locked ? (
                          <Icon name="lock" size={11} />
                        ) : isPast ? (
                          <span style={{ color: 'var(--mf-run)' }}><StatusGlyph shape="check" size={11} /></span>
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>

                      <span className="flex flex-col min-w-0 text-left">
                        <span
                          className="font-['Outfit'] text-[14px] font-semibold leading-tight"
                          style={{
                            color: isCurrent
                              ? 'var(--mf-accent)'
                              : locked
                                ? 'var(--mf-off)'
                                : 'var(--mf-ink-2)',
                          }}
                        >
                          {f.label}
                          {isCurrent && <span className="sr-only"> — current step</span>}
                          {locked && <span className="sr-only"> — not yet reached in the workflow</span>}
                        </span>

                        {isCurrent && (
                          <span
                            className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-1.5"
                            style={{ color: 'var(--mf-accent)' }}
                          >
                            {f.note}
                          </span>
                        )}
                      </span>
                    </>
                  );

                  const boxStyle = {
                    background: isCurrent ? 'var(--mf-accent-bg)' : 'transparent',
                    borderColor: isCurrent ? 'var(--mf-accent-line)' : 'transparent',
                    minHeight: 44,
                  };

                  return (
                    <li key={f.id}>
                      {locked ? (
                        /* Not a button. A locked step is not a thing you can
                           press and have ignore you — it states why. */
                        <div
                          className="flex items-start gap-3.5 px-4 py-3 rounded-[4px] border w-full"
                          style={boxStyle}
                          aria-disabled="true"
                          title="Reach this step through the workflow to unlock it"
                        >
                          {inner}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => review(f.id)}
                          aria-current={isCurrent ? 'step' : undefined}
                          className="mf-row-hover flex items-start gap-3.5 px-4 py-3 rounded-[4px] border w-full"
                          style={boxStyle}
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>

              {/* ── Readout ──
                  aria-live, because the screen changes without focus moving. */}
              <div
                className="mt-5 p-4 rounded-[4px]"
                style={{ background: 'var(--mf-bg-alt)', border: '1px solid var(--mf-line)' }}
              >
                <Label className="mb-2.5">Readout</Label>
                <p
                  aria-live="polite"
                  className="font-['Outfit'] text-[13.5px] leading-[1.6] m-0 min-h-[2.6em]"
                  style={{ color: event ? 'var(--mf-accent)' : 'var(--mf-ink-2)' }}
                >
                  {event || step.note}
                </p>

                {stepId === 'discrepancy' && (
                  <div className="mt-3.5 pt-3.5" style={{ borderTop: '1px solid var(--mf-line)' }}>
                    <Chip tone="attn">Progression blocked</Chip>
                    <p className="font-['Outfit'] text-[12.5px] leading-[1.55] mt-2.5 m-0" style={{ color: 'var(--mf-muted)' }}>
                      There is no override, and the rail cannot skip past it. Go back and change
                      the rate to {SCENARIO.correctRate} to continue &mdash; which is the design
                      response to R-02 being demonstrated rather than described.
                    </p>
                  </div>
                )}

                {stepId === 'configure' && !rateMatches && (
                  <div className="mt-3.5 pt-3.5" style={{ borderTop: '1px solid var(--mf-line)' }}>
                    <p className="font-['Outfit'] text-[12.5px] leading-[1.55] m-0" style={{ color: 'var(--mf-muted)' }}>
                      The field is editable. Correct it to {SCENARIO.correctRate}, or continue
                      as-is and see what the interface does.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 pt-8" style={{ borderTop: '1px solid var(--mf-line)' }}>
          <Prose wide>
            The rail moves you between steps you have already reached; it cannot move you past one
            you have not. Reaching the active infusion still requires going backwards once and
            correcting the value &mdash; and a workflow that can only be completed by fixing an
            error is a more useful thing to demonstrate than one that was never wrong.
          </Prose>
        </motion.div>
      </motion.div>
    </Section>
  );
}

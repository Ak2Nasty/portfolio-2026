import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Section, SectionHead, Prose, Label, ScopeNote, Chip,
} from './primitives';
import { fadeUp, revealProps } from './motion';
import { Icon, StatusGlyph } from './icons';
import { MedFlowScreen, DeviceFrame } from './screens';
import { SCENARIO, CONDITIONS } from '../data/caseStudyData';
import { playCue, isSoundEnabled, setSoundEnabled, subscribeSound } from './sound';

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

     NAVIGATION      — the rail, the prev/next controls, the arrow keys. Opens
                       any screen at any time, in any order. Nothing is locked.

   Navigation used to be bounded by `reached`, and that boundary was doing the
   guard's job: you could not see Confirm without passing the check, so the
   check could not be skipped. Opening the rail took that away, so the guard
   moved rather than vanished — "Start infusion" is now disabled on the confirm
   screen itself whenever the entered rate does not match the order, and it says
   why. A safeguard that only works while the user cannot find another route is
   not a safeguard; a control that refuses a wrong value however you arrived at
   it is.

   `reached` still records which steps the workflow itself granted. It marks
   them with a tick, because a screen you drove the device to and a screen you
   clicked open are different things worth telling apart. It is a note now, not
   a gate.
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
  { id: 'active', label: 'Monitor', note: 'Infusion running. State, therapy and rate are all visible at once. Two things can happen next: it is interrupted, or it runs to term. Neither is something the nurse does, so neither sits on the device.' },
  { id: 'alert', label: 'Alert', note: 'A device condition has been raised. Whether delivery stopped is the first thing the screen answers — carried by the state word, the glyph, the border and the audio pattern before colour is counted.' },
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

  /* Audio is OFF until the reader asks for it, and the flag lives in the sound
     module rather than here so the screens can read it without prop-drilling.
     This mirrors it into state only so the toggle re-renders. */
  const [sound, setSound] = useState(isSoundEnabled);
  useEffect(() => subscribeSound(setSound), []);


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

  /* ── Navigation is free. The GUARD is not. ──────────────────────────────────
     Every step is reachable from the rail, from Back and Forward, and from the
     arrow keys, whether or not the workflow has been through it. Nothing is
     locked.

     That is a real change to how this section defends itself, so the defence
     moved rather than disappeared. Navigation used to be the thing enforcing
     the discrepancy block: you could not reach Confirm without passing the
     check, so the check could not be skipped. With the rail open, a reader can
     land on Confirm with 50 still in the rate field — and if "Start infusion"
     there were live, the block would be decorative after all.

     So the guard now lives on the CONTROL instead of on the route. "Start
     infusion" is disabled wherever the entered rate does not match the order,
     and it says why. That is the stronger arrangement anyway: a safeguard that
     depends on the user not finding another way round is a maze, not a
     safeguard, and real devices are not navigated in one direction either.

     What `reached` still records is which steps the WORKFLOW itself granted —
     useful as a record of what actually happened, no longer a gate on where you
     may look. */
  const review = useCallback((id) => {
    setStepId(id);
    setEvent(null);
  }, []);

  const neighbour = useCallback(
    (dir) => FLOW[stepIndex + dir]?.id ?? null,
    [stepIndex],
  );

  const prevId = neighbour(-1);
  const nextId = neighbour(1);

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
            playCue('confirm');
            return setEvent('Wristband scanned. Patient identity verified.');
          }
          if (action === 'verify-manual') {
            setState((s) => ({ ...s, verified: 'manual' }));
            playCue('confirm');
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
            /* Falling, three pulses. Serious, and audibly NOT the occlusion —
               a block the user caused and a fault the device found should not
               sound alike. */
            playCue('block');
            setEvent('Entered rate does not match the order. Progression blocked.');
            return advance('discrepancy');
          }
          return advance('confirm');

        case 'discrepancy':
          /* One way out, and it goes backwards. */
          return setStepId('configure');

        case 'confirm':
          if (action === 'back') return setStepId('configure');
          playCue('start');
          setEvent('Simulated infusion started.');
          return advance('active');

        /* Only the walkthrough control reaches here. The device's own buttons on
           this screen — pause and view details — are the device's business and
           are handled on the screen itself. They used to call this handler, both
           of them, which is why pressing "View details" produced an occlusion
           alarm.

           An occlusion is not a thing a nurse does. It is a condition the device
           detects, so the control that raises it is labelled as the prototype's
           and sits beside the device rather than on it. */
        case 'active':
          /* TWO WAYS OUT OF THE MONITOR SCREEN, and they are the two things that
             can actually happen to a running infusion: something interrupts it,
             or it finishes. Before this there was only the alarm, which made the
             interrupted path compulsory and left no way to see a therapy simply
             run to term. */
          if (action === 'finish') {
            playCue('complete');
            setEvent('Infusion ran to term without interruption. 100 mL delivered.');
            return advance('complete');
          }
          /* `action` now carries WHICH condition was raised, so one branch
             handles all four rather than four near-identical branches. */
          {
            const c = CONDITIONS.find((x) => x.id === action);
            if (!c) return undefined;
            setState((s) => ({ ...s, condition: c.id }));
            /* The audio ranks it too: two bursts for a stopped delivery, one
               for a condition that has not stopped it. */
            playCue(c.cue);
            setEvent(
              c.delivering
                ? `${c.heading}. Delivery is continuing; the device is asking for attention rather than reporting a stoppage.`
                : `${c.heading}. The device has stopped delivery and raised an alarm.`,
            );
            return advance('alert');
          }

        case 'alert':
          /* Acknowledging the alert resolves it; the infusion then runs to
             term. Previously this reset the prototype, which meant the one
             state a reader never reached was the one where nothing went
             wrong. */
          playCue('complete');
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

            {/* ── Sound, off by default ──
                A case-study page that plays an infusion alarm at whatever
                volume the reader's laptop happens to be at is hostile, and
                browsers refuse to start audio before a gesture anyway. So it is
                opt-in, the control says which state it is in rather than which
                state it would move to, and nothing in the prototype requires it:
                every cue accompanies a state already carried by a word, a glyph
                and a colour. */}
            <button
              type="button"
              onClick={() => { const next = !sound; setSoundEnabled(next); if (next) playCue('confirm'); }}
              aria-pressed={sound}
              className="mf-tap inline-flex items-center gap-2 font-['Outfit'] text-[10.5px] font-semibold uppercase px-2.5 py-1.5 rounded-[3px] transition-colors duration-200"
              style={{
                letterSpacing: '0.13em',
                color: sound ? 'var(--mf-accent)' : 'var(--mf-muted)',
                border: `1px solid ${sound ? 'var(--mf-accent-line)' : 'var(--mf-line-strong)'}`,
                background: sound ? 'var(--mf-accent-bg)' : 'transparent',
              }}
            >
              <Icon name={sound ? 'bell-alert' : 'bell-off'} size={12} />
              {sound ? 'Sound on' : 'Sound off'}
            </button>

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

          {/* 436px, not 380: the device column carries 28px of padding on each
              side, so a 380px track left the DEVICE at 324px — 35px narrower
              than the same device in section 09, and under the 340px line at
              which the screen's container query shrinks the numeric fields. The
              column is the frame plus its padding; the frame is what has to
              match. */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,436px)_minmax(0,1fr)]">
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
                  {reached.length} of {FLOW.length} reached
                </span>
              </div>

              <ol ref={railRef} className="flex flex-col gap-1 m-0 p-0 list-none">
                {/* EVERY ROW IS A BUTTON. There is no locked state and no
                    padlock: any step can be opened at any time, in any order.

                    A tick still marks a step the workflow itself has been
                    through, because that is worth recording — it is the
                    difference between a screen you have read and a screen you
                    have actually driven the device to. It is a note, not a
                    gate. */}
                {FLOW.map((f, i) => {
                  const isCurrent = f.id === stepId;
                  const isDone = reached.includes(f.id) && !isCurrent;

                  const inner = (
                    <>
                      <span
                        className="font-['Outfit'] text-[11px] font-semibold tabular-nums shrink-0 pt-[3px] flex items-center justify-center"
                        style={{
                          color: isCurrent ? 'var(--mf-accent)' : 'var(--mf-muted)',
                          minWidth: 18,
                        }}
                      >
                        {isDone ? (
                          <span style={{ color: 'var(--mf-run)' }}><StatusGlyph shape="check" size={11} /></span>
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>

                      <span className="flex flex-col min-w-0 text-left">
                        <span
                          className="font-['Outfit'] text-[14px] font-semibold leading-tight"
                          style={{ color: isCurrent ? 'var(--mf-accent)' : 'var(--mf-ink-2)' }}
                        >
                          {f.label}
                          {isCurrent && <span className="sr-only"> — current step</span>}
                          {isDone && <span className="sr-only"> — reached in the workflow</span>}
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

                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => review(f.id)}
                        aria-current={isCurrent ? 'step' : undefined}
                        className="mf-row-hover flex items-start gap-3.5 px-4 py-3 rounded-[4px] border w-full"
                        style={{
                          background: isCurrent ? 'var(--mf-accent-bg)' : 'transparent',
                          borderColor: isCurrent ? 'var(--mf-accent-line)' : 'transparent',
                          minHeight: 44,
                        }}
                      >
                        {inner}
                      </button>
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

                {/* ── The one control that belongs to the prototype, not the
                    device ──
                    An occlusion is a condition the pump detects, not an action
                    a nurse performs, so there is no honest button for it on the
                    device. It used to be triggered by the device's own "Pause
                    infusion" and "View details" buttons, which both called the
                    same handler — so reading the screen caused an alarm.

                    Out here it is labelled as what it is, in the readout column
                    where the walkthrough's own commentary lives, visually
                    quieter than anything on the device. */}
                {stepId === 'active' && (
                  <div className="mt-3.5 pt-3.5" style={{ borderTop: '1px solid var(--mf-line)' }}>
                    <span
                      className="font-['Outfit'] text-[10px] font-semibold uppercase block mb-2.5"
                      style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}
                    >
                      Walkthrough control
                    </span>
                    {/* FOUR CONDITIONS, GROUPED BY WHAT THEY MEAN, because an
                        alarm system is not one alarm. Three have stopped
                        delivery; one has not, and that is the distinction a
                        nurse has to make in about a second when several devices
                        are sounding at once.

                        They sit here rather than on the device for the same
                        reason as before: none of these is an action a nurse
                        performs. A pump detects an occlusion, air in the line,
                        an empty reservoir and a failing battery — nobody presses
                        a button to cause one. */}
                    <div className="flex flex-col gap-3">
                      {[
                        ['Stops delivery', CONDITIONS.filter((c) => !c.delivering), 'var(--mf-crit)'],
                        ['Delivery continues', CONDITIONS.filter((c) => c.delivering), 'var(--mf-attn)'],
                      ].map(([heading, list, tone]) => (
                        <div key={heading}>
                          <span
                            className="font-['Outfit'] text-[10px] font-semibold uppercase flex items-center gap-2 mb-2"
                            style={{ letterSpacing: '0.13em', color: tone }}
                          >
                            <StatusGlyph shape={tone === 'var(--mf-crit)' ? 'octagon' : 'triangle'} size={10} />
                            {heading}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {list.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => onAction(c.id)}
                                className="mf-btn mf-btn--secondary"
                                style={{ fontSize: 11.5, flex: '1 1 auto', minWidth: 0 }}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="font-['Outfit'] text-[12px] leading-[1.5] mt-3 m-0" style={{ color: 'var(--mf-muted)' }}>
                      The device&rsquo;s own buttons pause the infusion and open its detail view;
                      none of them can raise a condition, because a pump detects these rather than
                      a nurse causing them. Leave the infusion alone and press{' '}
                      <span style={{ color: 'var(--mf-accent)', fontWeight: 600 }}>Forward</span>{' '}
                      to let it run to term instead.
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

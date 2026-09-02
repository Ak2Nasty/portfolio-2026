import { useState, useId, useEffect } from 'react';
import { Chip } from './primitives';
import { Icon, StatusGlyph } from './icons';
import { SCENARIO, WARD, ESCALATION, TIMING } from '../data/caseStudyData';

/* ─── The MedFlow screens ────────────────────────────────────────────────────
   Nine interface states, built ONCE and rendered in three places: the hero preview,
   the gallery in section 09, and the interactive prototype in section 10.

   That reuse is the reason the prototype can be genuinely clickable rather
   than a slideshow of images. It is also the reason the design system section
   is honest — these really are the same components in every context, which is
   the claim section 11 makes.

   ── State ──
   Screens are presentational. All prototype state (whether identity has been
   verified, what is currently typed into the rate field, whether the alert has
   been acknowledged) is owned by the caller and passed down, with actions
   raised through `onAction`. A screen never decides where the workflow goes
   next — section 10 does, because that routing IS the workflow being
   demonstrated.

   ── `live` ──
   When false the screen renders as a picture: controls are inert and removed
   from the tab order, so the nine static screens in section 09 do not put
   forty phantom tab stops between the reader and the rest of the page. When
   true it is a working interface.

   ── Everything here is fictional ──
   Patient, medication, values, prescriber. "Med-A" is a placeholder precisely
   so that no reader can mistake a UI value for dosing guidance. */

const P = SCENARIO.patient;
const ORDER = SCENARIO.order;
const DOC = SCENARIO.prescriberDetail;

/* ── Live countdown ───────────────────────────────────────────────────────────
   Time remaining, ticking in real seconds. An infusion pump's most-read field
   after the rate, and a static one reads as a screenshot rather than a running
   therapy.

   HH:MM:SS rather than "16 hr 24 min": at minute precision the value changes
   once every sixty seconds, which is indistinguishable from broken. Seconds
   make it legibly alive without the number being any less true — it counts down
   in real time, one second per second.

   Only runs when `live`. The nine static screens in section 09 are pictures;
   nine independent one-second timers behind them would burn a wakeup a second
   for something nobody is watching.

   aria-live is deliberately OFF. A politely-announced value that changes every
   second would talk over everything else on the screen; the remaining duration
   is also stated in plain text beside it, which is what a screen reader should
   land on. */
function Countdown({ live, seconds }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [live]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = Math.floor(left % 60);
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <span className="tabular-nums" aria-hidden="true">
      {h}:{pad(m)}:{pad(s)}
    </span>
  );
}

/* ── Device status bar ────────────────────────────────────────────────────────
   Date and time, at the top of every screen. Every clinical device carries one,
   and it earns its place: a nurse reading "started 10:12 AM, 16 hr remaining"
   needs to know what time it is now to make either number mean anything.

   It shows the SCENARIO's clock, not the reader's system clock — see the note
   in TIMING. Real wall-time would contradict the rest of the screen.

   Deliberately the quietest thing in the frame. It is reference, not content:
   the smallest type on the device, muted, on the bezel's own ground rather than
   the screen's, so it reads as device chrome rather than as part of the
   workflow. */
function DeviceClock({ live }) {
  const [t, setT] = useState(TIMING.nowSeconds);
  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => setT((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [live]);

  const m = Math.floor(t / 60) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const mer = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return <span className="tabular-nums">{h12}:{mm} {mer}</span>;
}

export function DeviceStatusBar({ live }) {
  return (
    <div className="mf-statusbar">
      <span>{TIMING.dateLabel}</span>
      <span className="flex items-center gap-1.5">
        <Icon name="clock" size={10} />
        <DeviceClock live={live} />
      </span>
    </div>
  );
}

/* ── Urgent clinician escalation ──────────────────────────────────────────────
   Present on every screen that has a patient context, which is every screen
   after the dashboard. On the dashboard it is DISABLED with its reason stated:
   "alert the clinician" is meaningless without knowing which patient it is
   about, and an alarm that fires without a subject is worse than no alarm.

   ── Why it confirms ──
   One tap would be faster. One tap would also fire from a pocket, a sleeve, or
   a mis-grab while carrying something, and a channel that cries wolf is a
   channel clinicians learn to discount. The design spends one deliberate
   confirmation to keep the signal worth responding to. That is the same trade
   the discrepancy screen makes: friction placed exactly where being wrong is
   expensive, and nowhere else.

   Local state only. This is presentation, not workflow routing — the prototype
   in section 10 owns where the workflow goes; this owns whether a dialog is
   open. */
function EscalateControl({ live, disabled = false }) {
  const [phase, setPhase] = useState('idle'); // idle | confirm | sent
  const uid = useId();
  const U = ESCALATION.urgent;

  return (
    <>
      <button
        type="button"
        className="mf-escalate"
        aria-label={disabled ? 'Alert clinician — select a patient first' : 'Alert the responsible clinician'}
        aria-describedby={disabled ? `${uid}-why` : undefined}
        disabled={disabled}
        tabIndex={live && !disabled ? 0 : -1}
        onClick={live && !disabled ? () => setPhase('confirm') : undefined}
      >
        <Icon name="bell-alert" size={14} />
      </button>

      {phase !== 'idle' && (
        <div className="mf-overlay" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
          <div className="mf-overlay__panel">
            {phase === 'confirm' ? (
              <>
                <span className="flex items-center gap-2.5 mb-3">
                  <span style={{ color: 'var(--mf-crit)' }}><Icon name="bell-alert" size={17} /></span>
                  <span id={`${uid}-t`} className="text-[15px] font-semibold" style={{ color: 'var(--mf-crit)' }}>
                    {U.confirmTitle}
                  </span>
                </span>
                <p className="text-[13px] leading-[1.6] m-0 mb-5" style={{ color: 'var(--mf-ink-2)' }}>
                  {U.confirmBody}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    className="mf-btn mf-btn--secondary"
                    tabIndex={live ? 0 : -1}
                    onClick={live ? () => setPhase('idle') : undefined}
                  >
                    {U.cancelAction}
                  </button>
                  <button
                    type="button"
                    className="mf-btn mf-btn--critical"
                    tabIndex={live ? 0 : -1}
                    onClick={live ? () => setPhase('sent') : undefined}
                  >
                    {U.confirmAction}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2.5 mb-3">
                  <span style={{ color: 'var(--mf-run)' }}><StatusGlyph shape="check" size={16} /></span>
                  <span id={`${uid}-t`} className="text-[15px] font-semibold" style={{ color: 'var(--mf-run)' }}>
                    {U.sentTitle}
                  </span>
                </span>
                <p aria-live="polite" className="text-[13px] leading-[1.6] m-0 mb-5" style={{ color: 'var(--mf-ink-2)' }}>
                  {U.sentBody}
                </p>
                <button
                  type="button"
                  className="mf-btn mf-btn--secondary w-full"
                  tabIndex={live ? 0 : -1}
                  onClick={live ? () => setPhase('idle') : undefined}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {disabled && (
        <span id={`${uid}-why`} className="sr-only">
          Alerting a clinician requires a patient context. Open a patient first.
        </span>
      )}
    </>
  );
}

/* ── Requesting a revised order ───────────────────────────────────────────────
   THE DISTINCTION THIS COMPONENT EXISTS TO MAKE: this is an escalation, not an
   override.

   The discrepancy screen used to have exactly one exit — correct the value.
   That is right when the nurse mistyped and wrong when she did not, and a
   system whose only answer to "I think the order is wrong" is "type what the
   order says" is a system that teaches its users to route around it.

   The fix is NOT a proceed-anyway button. Letting the nurse authorise her own
   departure from a prescribed order would delete the guard: any blocking state
   with an override becomes a state people learn to override. What the interface
   can safely do is move the decision to the person who owns it. She requests a
   revised order; the prescriber issues one; the new order arrives and the value
   she needs is the value the order now says.

   The guard never opens. The order moves. "Start infusion" stays disabled
   throughout — including after the request is sent — because a pending request
   is not an authorisation.

   The prescriber's response is deliberately NOT simulated. Showing a doctor
   approving a change inside a portfolio prototype would be inventing a clinical
   workflow this study has no basis to depict. It ends at "sent", which is the
   honest end of what the interface can show. */
/* `phase` is owned by the Discrepancy screen rather than by this component.
   It has to be: once a request has been sent, the screen's standing "starting
   is unavailable…" line is saying the same thing this alert says, one element
   further down, and the screen needs to know that in order to drop it. */
function OrderChangePanel({ live, entered, phase, setPhase }) {
  const uid = useId();

  if (phase === 'sent') {
    return (
      <div className="mf-alert mf-alert--info" style={{ padding: '12px 14px' }}>
        <span className="shrink-0 mt-[2px]" style={{ color: 'var(--mf-info)' }}>
          <Icon name="clock" size={14} />
        </span>
        {/* ONE paragraph, not a title and a body.
            This block replaces a 42px button on a screen whose height is now
            fixed, so every line it takes has to come from somewhere. As a
            two-tier alert it was 117px and pushed the screen 43px past its
            frame; as a single lead-in sentence it is 81px and fits with room to
            spare. Nothing that matters was cut — the prescriber is named in the
            sheet the reader just used, and the last clause, which is the whole
            point of the component, is untouched: a pending request is not an
            authorisation, and "Start infusion" stays disabled to prove it. */}
        <p aria-live="polite" className="text-[11.5px] leading-[1.5] m-0" style={{ color: 'var(--mf-info)' }}>
          <span className="font-semibold">Order change requested.</span>{' '}
          Starting stays unavailable until a revised order arrives &mdash; a pending request is
          not an authorisation.
        </p>
      </div>
    );
  }

  /* ── The compose step is an OVERLAY, not an inline panel ──
     It used to expand in place, which pushed the discrepancy screen from 542px
     to 681px — the single largest height change in the whole flow, on the one
     screen a reader is most likely to sit and read. A device screen is a fixed
     piece of hardware; it does not grow a hundred and forty pixels because a
     disclosure opened.

     As a sheet it costs the screen no height at all, and it uses the same
     in-screen overlay the escalation confirmation already uses — so a request
     that leaves the device looks like the other thing on these screens that
     leaves the device. */
  return (
    <>
      <button
        type="button"
        className="mf-btn mf-btn--secondary w-full"
        style={{ minHeight: 42, fontSize: 12.5 }}
        tabIndex={live ? 0 : -1}
        onClick={live ? () => setPhase('compose') : undefined}
      >
        <Icon name="certificate" size={13} />
        Request order change
      </button>

      {phase === 'compose' && (
        <div className="mf-overlay" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
          <div className="mf-overlay__panel">
            <span className="flex items-center gap-2.5 mb-3">
              <span style={{ color: 'var(--mf-attn)' }}><Icon name="certificate" size={16} /></span>
              <span id={`${uid}-t`} className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--mf-attn)' }}>
                Request a revised order from {DOC.short}
              </span>
            </span>
            <dl
              className="flex flex-col gap-1.5 m-0 mb-4 pt-3"
              style={{ borderTop: '1px solid var(--mf-line)' }}
            >
              {[['Patient', P.name], ['Current order', ORDER.rate], ['Requested', `${entered} mL/hr`]].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[10px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mf-muted)' }}>{k}</dt>
                  <dd className="text-[12.5px] font-semibold tabular-nums m-0" style={{ color: 'var(--mf-ink)' }}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className="mf-btn mf-btn--secondary"
                style={{ minHeight: 40, fontSize: 12 }}
                tabIndex={live ? 0 : -1}
                onClick={live ? () => setPhase('idle') : undefined}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mf-btn mf-btn--primary"
                style={{ minHeight: 40, fontSize: 12 }}
                tabIndex={live ? 0 : -1}
                onClick={live ? () => setPhase('sent') : undefined}
              >
                Send request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Prescriber disclosure ────────────────────────────────────────────────────
   "Dr. Chen" is not enough to act on. Which Chen, are they the right person to
   ask, and how is she reached at 3am — those are the questions a nurse has at
   the moment she wants to question an order, and sending her to a separate
   directory to answer them is how a query becomes a workaround.

   Progressive disclosure rather than always-on: the ordering clinician is
   context on a normal run, and only becomes primary information when something
   needs querying. A native disclosure button, so keyboard support is free. */
function PrescriberField({ live }) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-semibold uppercase inline-flex items-center gap-1.5"
        style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}
      >
        <Icon name="lock" size={11} />
        Ordered by
      </span>

      <button
        type="button"
        className="mf-prescriber"
        aria-expanded={open}
        aria-controls={`${uid}-p`}
        tabIndex={live ? 0 : -1}
        onClick={live ? () => setOpen((o) => !o) : undefined}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className="grid place-items-center shrink-0 text-[10.5px] font-semibold"
            style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--mf-accent-bg)', color: 'var(--mf-accent)' }}
          >
            EC
          </span>
          <span className="text-[15px] font-semibold" style={{ color: 'var(--mf-ink)' }}>{DOC.short}</span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 transition-transform duration-300"
          style={{ color: 'var(--mf-muted)', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <Icon name="arrow-down" size={13} />
        </span>
      </button>

      <div id={`${uid}-p`} className={`mf-panel ${open ? 'mf-panel--open' : ''}`}>
        <div>
          <dl className="mf-prescriber__detail">
            {[
              ['Name', `${DOC.full}, ${DOC.credentials}`],
              ['Role', DOC.title],
              ['Specialty', DOC.specialty],
              ['Contact', DOC.contact],
              ['Ordered', DOC.ordered],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-[5px]">
                <dt className="text-[10px] font-semibold uppercase shrink-0" style={{ letterSpacing: '0.12em', color: 'var(--mf-muted)' }}>
                  {k}
                </dt>
                <dd className="text-[12.5px] m-0 text-right" style={{ color: 'var(--mf-ink-2)' }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ── Persistent patient identity ──────────────────────────────────────────────
   This bar IS user need UN-01, and it is why it appears on every
   safety-significant screen rather than only at the start of the workflow.
   Risk R-05 is the case where it does not. */
function IdentityBar({ verified = true, compact = false, live = false }) {
  return (
    <div className="mf-identity">
      {/* Column one: identity + status, wrapping between themselves. */}
      <div className="mf-identity__main">
        <div className="flex items-center gap-3 min-w-0">
        <span
          className="grid place-items-center shrink-0 text-[11px] font-semibold"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: verified ? 'var(--mf-run-bg)' : 'var(--mf-off-bg)',
            color: verified ? 'var(--mf-run)' : 'var(--mf-off)',
          }}
        >
          {P.initials}
        </span>
        {/* No `truncate` on either line. The name and the room/ID are the
            payload of this bar — an ellipsed patient name is a UN-01 failure,
            not a layout nicety. They wrap instead; the bar grows. */}
        <span className="flex flex-col min-w-0">
          <span className="text-[13.5px] font-semibold leading-tight" style={{ color: 'var(--mf-ink)' }}>
            {P.name}
          </span>
          <span
            className="text-[10.5px] leading-tight"
            style={{ color: 'var(--mf-muted)', letterSpacing: '0.05em' }}
          >
            {P.room} &middot; {P.id}
          </span>
        </span>
      </div>
        {/* THREE states, not two. "Verified" and "verified by reading the
            wristband back by hand because the scanner would not read" are not
            the same fact, and a bar that renders them identically has thrown
            away the one piece of information a reviewer would want later. The
            manual route is legitimate — it is not an error state — so it reads
            as verified, in the same green, with the method appended rather than
            a warning attached to it. */}
        {!compact && (
          verified === 'manual' ? (
            <Chip tone="done" shape="check">Verified &middot; manual</Chip>
          ) : verified ? (
            <Chip tone="done" shape="check">Verified</Chip>
          ) : (
            <Chip tone="attn">Unverified</Chip>
          )
        )}
      </div>

      {/* Column two: the escalation, and nothing else. It is the one control
          that must sit in the same place on every screen — a route you reach
          for in an emergency cannot move around depending on how long the
          patient's name happens to be. */}
      <EscalateControl live={live} />
    </div>
  );
}

function ScreenTitle({ children, sub }) {
  return (
    <div className="px-[18px] pt-[18px] pb-1">
      <h3 className="text-[19px] font-semibold leading-tight m-0" style={{ color: 'var(--mf-ink)', letterSpacing: '-0.01em' }}>
        {children}
      </h3>
      {sub ? (
        <p className="text-[13px] leading-[1.55] mt-1.5 m-0" style={{ color: 'var(--mf-muted)' }}>{sub}</p>
      ) : null}
    </div>
  );
}

/* Prescribed value. Read-only by construction: tinted ground, no border, and a
   lock mark. The difference from an editable field is STRUCTURAL, not a colour,
   so it survives greyscale — UN-02. */
function Prescribed({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-semibold uppercase inline-flex items-center gap-1.5"
        style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}
      >
        <Icon name="lock" size={11} />
        {label}
      </span>
      <span className="mf-prescribed">
        <span className="text-[16px] font-semibold tabular-nums" style={{ color: 'var(--mf-ink)' }}>{value}</span>
        {unit ? <span className="text-[13px] font-medium" style={{ color: 'var(--mf-ink-2)' }}>{unit}</span> : null}
      </span>
    </div>
  );
}

/* Editable numeric field. The unit lives INSIDE the field, permanently, and is
   not a separate element that can be scrolled, wrapped or column-headered away
   from the number it belongs to — UN-03. */
function NumericField({ label, value, unit, onChange, error, ok, live, id }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase inline-flex items-center gap-1.5"
        style={{
          letterSpacing: '0.14em',
          color: error ? 'var(--mf-crit)' : ok ? 'var(--mf-run)' : 'var(--mf-muted)',
        }}
      >
        <Icon name="pencil" size={11} />
        {label}
      </label>
      <span className={`mf-field ${error ? 'mf-field--error' : ''} ${ok ? 'mf-field--ok' : ''}`}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          readOnly={!live}
          tabIndex={live ? 0 : -1}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={live && onChange ? (e) => onChange(e.target.value.replace(/[^0-9.]/g, '')) : undefined}
        />
        <span className="mf-field__unit">{unit}</span>
        {/* The tick is the signal; green is the second one. A field that were
            green ALONE would be relying on colour, which is the exact failure
            this interface is built to avoid. */}
        {ok && (
          <span className="mf-field__tick" aria-hidden="true">
            <StatusGlyph shape="check" size={12} />
          </span>
        )}
      </span>
      {ok && <span className="sr-only">Matches the order.</span>}
    </div>
  );
}

/* ── In-screen detail sheet ───────────────────────────────────────────────────
   What "View details" and "View summary" open.

   THE BUG THIS EXISTS TO FIX: both of those buttons used to call onAction('next')
   — the same handler as the primary control beside them — so "View details" on
   the monitor screen produced an occlusion alarm, and "View details" on the
   alert screen ACKNOWLEDGED the alarm. A read-only control performing a
   safety-significant action is the exact failure this study is written about,
   and it was sitting in the study. It is the same defect as the verify screen's
   "Unable to scan", which called the handler that marked the patient verified.

   A detail view is read-only by definition, so this changes no state, advances
   no step and offers exactly one way out. It uses the same overlay as the
   escalation confirmation and the order-change request, so everything that
   opens over the screen looks like the same kind of thing. */
function DetailSheet({ title, icon, tone = 'var(--mf-accent)', rows, note, live, onClose }) {
  const uid = useId();
  return (
    <div className="mf-overlay" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
      <div className="mf-overlay__panel">
        <span className="flex items-center gap-2.5 mb-3">
          <span style={{ color: tone }}><Icon name={icon} size={16} /></span>
          <span id={`${uid}-t`} className="text-[14px] font-semibold leading-tight" style={{ color: tone }}>
            {title}
          </span>
        </span>

        <dl className="flex flex-col gap-1.5 m-0 pt-3" style={{ borderTop: '1px solid var(--mf-line)' }}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3">
              <dt className="text-[10px] uppercase shrink-0" style={{ letterSpacing: '0.1em', color: 'var(--mf-muted)' }}>{k}</dt>
              <dd className="text-[12.5px] font-medium tabular-nums m-0 text-right" style={{ color: 'var(--mf-ink)' }}>{v}</dd>
            </div>
          ))}
        </dl>

        {note && (
          <p className="text-[11.5px] leading-[1.45] mt-3 m-0" style={{ color: 'var(--mf-muted)' }}>{note}</p>
        )}

        <button
          type="button"
          className="mf-btn mf-btn--secondary w-full mt-4"
          style={{ minHeight: 40, fontSize: 12 }}
          tabIndex={live ? 0 : -1}
          onClick={live ? onClose : undefined}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* Actions row. `live` gates both the handler and the tab order. */
function Actions({ children }) {
  return <div className="mt-auto px-[18px] pb-[18px] pt-4 grid grid-cols-2 gap-2.5">{children}</div>;
}

function Btn({ variant = 'primary', children, onClick, live, disabled, className = '', full }) {
  return (
    <button
      type="button"
      className={`mf-btn mf-btn--${variant} ${full ? 'col-span-2' : ''} ${className}`}
      disabled={disabled}
      tabIndex={live && !disabled ? 0 : -1}
      onClick={live && !disabled ? onClick : undefined}
      aria-disabled={disabled ? 'true' : undefined}
    >
      {children}
    </button>
  );
}

/* ═══ 01 · Clinical dashboard ══════════════════════════════════════════════════
   The scanning problem is real here: four patients, only one needing action.
   Priority is carried by position, a state chip and a border — the three other
   patients are legible but visually quiet. */
function Dashboard({ live, onAction }) {
  return (
    <div className="mf-screen">
      <div className="px-[18px] pt-[18px] pb-4" style={{ borderBottom: `1px solid ${'var(--mf-line)'}` }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[19px] font-semibold m-0" style={{ color: 'var(--mf-ink)', letterSpacing: '-0.01em' }}>
              Good morning, {SCENARIO.user.name}
            </h3>
            <p className="text-[13px] mt-1 m-0" style={{ color: 'var(--mf-muted)' }}>4 patients assigned</p>
          </div>
          {/* Disabled here, and only here. "Alert the clinician" needs to know
              which patient it is about; an alarm raised without a subject is
              worse than no alarm. It enables the moment a patient is open. */}
          <EscalateControl live={live} disabled />
        </div>
      </div>

      <div className="px-[18px] py-4 flex flex-col gap-2.5">
        {/* The one that needs action. Accent border, action chip, and it is
            first — three signals, none of them colour alone. */}
        <div
          className="rounded-[4px] p-3.5"
          style={{ border: '1.5px solid var(--mf-accent-line)', background: 'var(--mf-accent-bg)' }}
        >
          {/* flex-wrap, so the chip drops to its own line rather than competing
              with the patient identity for a narrow row. Same rule as the
              identity bar: the name always renders in full. */}
          <div className="flex items-center justify-between flex-wrap gap-y-2.5 gap-x-3">
            <div className="flex items-center gap-3 min-w-0" style={{ flex: '1 1 150px' }}>
              <span
                className="grid place-items-center shrink-0 text-[11px] font-semibold"
                style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--mf-surface)', color: 'var(--mf-accent)' }}
              >
                {P.initials}
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--mf-ink)' }}>{P.name}</span>
                <span className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--mf-muted)' }}>{P.room}</span>
              </span>
            </div>
            <Chip tone="attn">Setup required</Chip>
          </div>
          <button
            type="button"
            className="mf-btn mf-btn--primary w-full mt-3.5"
            tabIndex={live ? 0 : -1}
            onClick={live ? () => onAction('next') : undefined}
          >
            View patient
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        {/* Context, not the task. Reduced priority by tone, not by hiding. */}
        {WARD.map((w) => (
          <div
            key={w.name}
            className="rounded-[4px] p-3.5 flex items-center justify-between flex-wrap gap-y-2.5 gap-x-3"
            style={{ border: '1px solid var(--mf-line)', background: 'var(--mf-surface)' }}
          >
            <div className="flex items-center gap-3 min-w-0" style={{ flex: '1 1 150px' }}>
              <span
                className="grid place-items-center shrink-0 text-[10.5px] font-semibold"
                style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--mf-bg-alt)', color: 'var(--mf-muted)' }}
              >
                {w.initials}
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-[13.5px] font-medium leading-tight truncate" style={{ color: 'var(--mf-ink-2)' }}>{w.name}</span>
                <span className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--mf-muted)' }}>{w.room}</span>
              </span>
            </div>
            <Chip tone={w.tone} shape={w.shape}>{w.state}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 02 · Patient verification ════════════════════════════════════════════════
   The explicit gate before anything safety-significant. "Unable to scan" exists
   because a workflow with only a happy path is a workflow that gets bypassed —
   the alternative has to be designed, not left to the user to improvise. */
function Verify({ live, onAction, state }) {
  const done = state?.verified;
  /* 'scan' until the reader says the scanner will not read. Local, like the
     order-change panel: the prototype owns where the workflow goes, this owns
     which of the two identity routes is on screen. */
  const [mode, setMode] = useState('scan');
  /* The two read-backs, ticked independently. Neither is pre-ticked and there
     is no "check all". */
  const [checks, setChecks] = useState({ dob: false, id: false });
  const bothChecked = checks.dob && checks.id;

  const manual = mode === 'manual' && !done;

  return (
    <div className="mf-screen">
      <IdentityBar verified={done} live={live} />
      <ScreenTitle
        sub={
          done
            ? undefined
            : manual
              ? 'Read each value off the wristband and confirm it against the record.'
              : 'Confirm you are working with the correct patient before continuing.'
        }
      >
        {done ? 'Patient identity verified' : manual ? 'Confirm identity manually' : 'Verify patient identity'}
      </ScreenTitle>

      <div className="px-[18px] py-4 flex flex-col gap-3">
        <div className="mf-pair grid grid-cols-2 gap-3">
          <Prescribed label="Date of birth" value={P.dob} />
          <Prescribed label="Patient ID" value={P.id} />
        </div>

        {done ? (
          <div className="mf-alert mf-alert--info mt-1">
            <span className="shrink-0 mt-[2px]" style={{ color: 'var(--mf-info)' }}>
              <StatusGlyph shape="check" size={14} />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold m-0" style={{ color: 'var(--mf-info)' }}>
                {done === 'manual' ? 'Identity confirmed manually' : 'Identity verified'}
              </p>
              <p className="text-[12.5px] leading-[1.55] mt-1 m-0" style={{ color: 'var(--mf-info)' }}>
                {done === 'manual'
                  ? 'Both values read back from the wristband and confirmed. Recorded as a manual check.'
                  : 'Wristband matched to the assigned patient record.'}
              </p>
            </div>
          </div>
        ) : manual ? (
          /* ── The designed alternative ──
             Two separate confirmations, because the two values fail
             differently: a date of birth is easy to mis-read and a patient ID
             is easy to mis-transcribe. One combined "I confirm the patient"
             tick would be a single acknowledgement standing in for two
             distinct checks, which is the shape of control people learn to
             clear without reading. */
          <div className="flex flex-col gap-2">
            {[
              ['dob', 'Date of birth on the wristband matches'],
              ['id', 'Patient ID on the wristband matches'],
            ].map(([key, label]) => (
              <label key={key} className={`mf-check ${checks[key] ? 'mf-check--on' : ''}`}>
                <input
                  type="checkbox"
                  checked={checks[key]}
                  tabIndex={live ? 0 : -1}
                  onChange={live ? () => setChecks((c) => ({ ...c, [key]: !c[key] })) : undefined}
                  readOnly={!live}
                />
                <span className="mf-check__box" aria-hidden="true">
                  {checks[key] && <StatusGlyph shape="check" size={11} />}
                </span>
                <span className="mf-check__label">{label}</span>
              </label>
            ))}
            {/* Says why the button is dead, next to the thing that will
                enable it — the same rule the discrepancy screen follows. */}
            {!bothChecked && (
              <p className="text-[11.5px] leading-[1.45] mt-0.5 m-0" style={{ color: 'var(--mf-muted)' }}>
                Both values must be confirmed before the workflow continues.
              </p>
            )}
          </div>
        ) : (
          <div
            className="rounded-[4px] grid place-items-center py-7 px-4 text-center"
            style={{ border: '1.5px dashed var(--mf-line-strong)', background: 'var(--mf-bg-alt)' }}
          >
            <span style={{ color: 'var(--mf-muted)' }}><Icon name="scan" size={26} /></span>
            <p className="text-[12.5px] leading-[1.5] mt-2.5 m-0" style={{ color: 'var(--mf-muted)' }}>
              Scan the patient wristband to continue
            </p>
          </div>
        )}
      </div>

      <Actions>
        {done ? (
          <Btn variant="primary" full live={live} onClick={() => onAction('next')}>
            Continue to order
            <Icon name="arrow-right" size={14} />
          </Btn>
        ) : manual ? (
          <>
            <Btn variant="secondary" live={live} onClick={() => { setChecks({ dob: false, id: false }); setMode('scan'); }}>
              Back to scan
            </Btn>
            {/* Disabled until BOTH are ticked, and it says so rather than
                sitting dead. Same rule as the discrepancy screen: a control
                that will not act explains itself where it is. */}
            <Btn variant="primary" live={live} disabled={!bothChecked} onClick={() => onAction('verify-manual')}>
              Confirm identity
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="primary" live={live} onClick={() => onAction('verify')}>Scan wristband</Btn>
            {/* THIS DOES NOT VERIFY.
                It used to call the same handler as "Scan wristband", which
                meant declining to scan marked the patient verified — on the one
                screen whose entire purpose is the identity gate. It now opens
                the manual route, which still has to be completed. */}
            <Btn variant="secondary" live={live} onClick={() => setMode('manual')}>Unable to scan</Btn>
          </>
        )}
      </Actions>
    </div>
  );
}

/* ═══ 03 · Medication order ════════════════════════════════════════════════════
   Everything on this screen is prescribed, so everything is styled as
   prescribed. The visual language of "you cannot edit this" is established here
   so that the editable fields on the next screen read as different — UN-02. */
function Order({ live, onAction }) {
  return (
    <div className="mf-screen">
      <IdentityBar live={live} />
      <ScreenTitle sub="Prescribed values. Review before configuring.">Medication order</ScreenTitle>

      <div className="px-[18px] py-4 flex flex-col gap-3">
        <Prescribed label="Medication" value={ORDER.medication} />
        <div className="mf-pair grid grid-cols-2 gap-3">
          <Prescribed label="Concentration" value="10" unit="mg/mL" />
          <Prescribed label="Prescribed rate" value="5" unit="mL/hr" />
        </div>
        <PrescriberField live={live} />
      </div>

      <Actions>
        <Btn variant="primary" full live={live} onClick={() => onAction('next')}>
          Configure infusion
          <Icon name="arrow-right" size={14} />
        </Btn>
      </Actions>
    </div>
  );
}

/* ═══ 04 · Configure infusion ══════════════════════════════════════════════════
   The first screen with editable values, and the layout says so: prescribed
   context sits above a visible divider, the two editable fields below it. */
function Configure({ live, onAction, state, setState }) {
  const rate = state?.rate ?? SCENARIO.correctRate;
  const volume = state?.volume ?? '100';
  return (
    <div className="mf-screen">
      <IdentityBar live={live} />
      <ScreenTitle sub="Enter the infusion parameters for this order.">Configure infusion</ScreenTitle>

      <div className="px-[18px] py-4 flex flex-col gap-4">
        <div className="mf-pair grid grid-cols-2 gap-3">
          <Prescribed label="Medication" value={ORDER.medication} />
          <Prescribed label="Concentration" value="10" unit="mg/mL" />
        </div>

        <div style={{ height: 1, background: 'var(--mf-line)' }} />

        <div className="mf-pair grid grid-cols-2 gap-3">
          <NumericField
            id="mf-rate"
            label="Infusion rate"
            value={rate}
            unit="mL/hr"
            live={live}
            ok={String(rate).trim() === SCENARIO.correctRate}
            onChange={(v) => setState?.((s) => ({ ...s, rate: v }))}
          />
          <NumericField
            id="mf-volume"
            label="Volume"
            value={volume}
            unit="mL"
            live={live}
            onChange={(v) => setState?.((s) => ({ ...s, volume: v }))}
          />
        </div>

        {/* The ordered value is shown AT the moment of entry, so nothing has to
            be remembered from the previous screen. */}
        <p className="text-[12px] leading-[1.5] m-0" style={{ color: 'var(--mf-muted)' }}>
          Order specifies {ORDER.rate}, {ORDER.volume}.
        </p>
      </div>

      <Actions>
        <Btn variant="primary" full live={live} onClick={() => onAction('next')}>
          Review infusion
          <Icon name="arrow-right" size={14} />
        </Btn>
      </Actions>
    </div>
  );
}

/* ═══ 05 · Discrepancy / safety intervention ═══════════════════════════════════
   The most important screen in the study.

   It does three things a passive validation message does not:
   1. It BLOCKS. Progression stops rather than warning and letting the user
      continue past it.
   2. It shows the ordered value and the entered value SIDE BY SIDE, so the
      comparison is made by the interface rather than from memory.
   3. It names the disabled control and says why it is disabled. A dead button
      with no explanation is its own recovery failure — UN-07.

   This is not a clinically validated safety control. It is a conceptual
   demonstration of interrupting a foreseeable use error. */
function Discrepancy({ live, onAction, state }) {
  /* `flaggedRate` is the value that actually triggered this screen, captured at
     the moment the workflow raised it. It is preferred over the live rate so
     that revisiting this step later — after the value has been corrected —
     still shows what happened, rather than two matching numbers under a
     heading saying they do not match. Falls back to the live rate, then to the
     seeded value for the static render in section 09. */
  const entered = state?.flaggedRate ?? state?.rate ?? SCENARIO.mistypedRate;
  const [request, setRequest] = useState('idle'); // idle | compose | sent
  return (
    <div className="mf-screen">
      <IdentityBar live={live} />

      <div className="px-[18px] pt-[18px]">
        <div className="mf-alert mf-alert--attn">
          <span className="shrink-0 mt-[2px]" style={{ color: 'var(--mf-attn)' }}>
            <StatusGlyph shape="triangle" size={15} />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold m-0 leading-tight" style={{ color: 'var(--mf-attn)' }}>
              Infusion settings require review
            </p>
            <p className="text-[12.5px] leading-[1.55] mt-1.5 m-0" style={{ color: 'var(--mf-attn)' }}>
              The entered infusion rate does not match the simulated medication order.
            </p>
          </div>
        </div>
      </div>

      {/* Side by side, same scale, same units, aligned baselines. The
          comparison is the interface's job, not the reader's. */}
      <div className="px-[18px] py-4">
        {/* NOT .mf-pair — this comparison stays side by side at every width.
            Stacking the ordered value above the entered one destroys the
            comparison the screen exists to make. */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[4px] p-3.5" style={{ background: 'var(--mf-bg-alt)', border: '1px solid var(--mf-line)' }}>
            {/* Tracking lives in CSS (.mf-cmp-label), not inline — an inline
                letter-spacing outranks the container query that tightens it at
                the narrowest screen sizes. */}
            <span className="mf-cmp-label" style={{ color: 'var(--mf-muted)' }}>
              Order
            </span>
            <span className="mf-value mt-2">
              <span className="mf-value__num" style={{ fontSize: 30 }}>{SCENARIO.correctRate}</span>
              <span className="mf-value__unit" style={{ fontSize: 14 }}>mL/hr</span>
            </span>
          </div>
          <div
            className="rounded-[4px] p-3.5"
            style={{ background: 'var(--mf-crit-bg)', border: '1.5px solid var(--mf-crit-line)' }}
          >
            <span className="mf-cmp-label" style={{ color: 'var(--mf-crit)' }}>
              Entered
            </span>
            <span className="mf-value mt-2" style={{ color: 'var(--mf-crit)' }}>
              <span className="mf-value__num" style={{ fontSize: 30 }}>{entered}</span>
              <span className="mf-value__unit" style={{ fontSize: 14, color: 'var(--mf-crit)' }}>mL/hr</span>
            </span>
          </div>
        </div>

        {/* The disabled control explains itself in text, next to itself.
            Dropped once a request has been sent, because the confirmation below
            the buttons then carries the same statement in more specific terms
            ("until a revised order arrives"). Two sentences saying starting is
            unavailable, forty pixels apart, is not twice the clarity — and the
            reason has to stay visible, not stay duplicated. */}
        {request !== 'sent' && (
          <p id="mf-start-why" className="text-[12px] leading-[1.5] mt-3.5 m-0" style={{ color: 'var(--mf-muted)' }}>
            Starting is unavailable until the entered rate matches the order or the discrepancy is resolved.
          </p>
        )}
      </div>

      {/* Two exits, and neither of them is an override.
          Correct the value, or ask the person who owns the order to change it.
          "Start infusion" stays disabled in both cases — see OrderChangePanel. */}
      <div className="mt-auto px-[18px] pb-[18px] pt-4 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Btn variant="primary" live={live} onClick={() => onAction('back')}>Review settings</Btn>
          <Btn variant="primary" live={live} disabled>Start infusion</Btn>
        </div>
        <OrderChangePanel live={live} entered={entered} phase={request} setPhase={setRequest} />
      </div>
    </div>
  );
}

/* ═══ 06 · Final confirmation ══════════════════════════════════════════════════
   A dedicated stage between configuration and initiation — the design response
   to R-03. It restates everything that is about to take effect, plus the two
   checks already completed, so the last thing before a safety-significant
   action is a complete picture rather than a button. */
function Confirm({ live, onAction, state }) {
  const rate = state?.rate ?? SCENARIO.correctRate;
  const volume = state?.volume ?? '100';
  return (
    <div className="mf-screen">
      <IdentityBar live={live} />
      <ScreenTitle sub="These settings will be applied when you start.">Review before starting</ScreenTitle>

      <div className="px-[18px] py-4 flex flex-col gap-3">
        <div className="mf-pair grid grid-cols-2 gap-3">
          <Prescribed label="Medication" value={ORDER.medication} />
          <Prescribed label="Volume" value={volume} unit="mL" />
        </div>

        <div className="rounded-[4px] p-3.5" style={{ background: 'var(--mf-accent-bg)', border: '1px solid var(--mf-accent-line)' }}>
          <span className="text-[10px] font-semibold uppercase block" style={{ letterSpacing: '0.14em', color: 'var(--mf-accent)' }}>
            Infusion rate
          </span>
          <span className="mf-value mt-1.5">
            <span className="mf-value__num" style={{ fontSize: 32, color: 'var(--mf-accent)' }}>{rate}</span>
            <span className="mf-value__unit" style={{ fontSize: 15, color: 'var(--mf-accent)' }}>mL/hr</span>
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {/* Names the method, because the confirmation screen's job is to
              restate what has actually happened rather than that a box was
              ticked somewhere. */}
          <span className="flex items-center gap-2.5 text-[12.5px]" style={{ color: 'var(--mf-ink-2)' }}>
            <span style={{ color: 'var(--mf-run)' }}><StatusGlyph shape="check" size={13} /></span>
            {state?.verified === 'manual'
              ? 'Patient identity confirmed manually'
              : 'Patient identity verified by scan'}
          </span>
          <span className="flex items-center gap-2.5 text-[12.5px]" style={{ color: 'var(--mf-ink-2)' }}>
            <span style={{ color: 'var(--mf-run)' }}><StatusGlyph shape="check" size={13} /></span>
            Order reviewed
          </span>
        </div>
      </div>

      <Actions>
        <Btn variant="secondary" live={live} onClick={() => onAction('back')}>Back</Btn>
        <Btn variant="primary" live={live} onClick={() => onAction('next')}>Start infusion</Btn>
      </Actions>
    </div>
  );
}

/* ═══ 07 · Active infusion ═════════════════════════════════════════════════════
   State first, then therapy, then rate, then progress. The order is the
   priority order a nurse walking up to the device needs — UN-05. */
/* No `onAction`, deliberately. This screen has no control that advances the
   workflow: pause and detail are the device's own, and the occlusion that moves
   the walkthrough on is raised from the prototype's control beside the device,
   because an occlusion is a condition the pump detects rather than an action a
   nurse takes. */
function Active({ live, state }) {
  const rate = state?.rate ?? SCENARIO.correctRate;
  /* Both of these are the device's own business and neither of them is the
     workflow. Pausing is a state this screen holds; the details are a sheet it
     opens. Neither reaches the prototype's state machine, which is why neither
     can produce an occlusion any more. */
  const [paused, setPaused] = useState(false);
  const [confirmPause, setConfirmPause] = useState(false);
  const [details, setDetails] = useState(false);
  const uid = useId();

  return (
    <div className="mf-screen">
      <IdentityBar live={live} />

      <div className="px-[18px] pt-[18px] pb-4">
        {/* PAUSED BY THE NURSE IS NOT INTERRUPTED BY THE DEVICE.
            Both are "not currently delivering", and an interface that lets them
            share a look invites a deliberate pause to be investigated as a fault
            and a fault to be left alone as a pause. So this is the off tone with
            a pause glyph, and the occlusion on the next screen keeps the
            critical tone and its octagon. Same argument as the completion
            screen, one state further along. */}
        {paused ? (
          <Chip tone="off" shape="pause">Infusion paused</Chip>
        ) : (
          <Chip tone="run">Infusion active</Chip>
        )}

        <div className="flex items-baseline gap-2.5 mt-4">
          <span className="text-[15px] font-medium" style={{ color: 'var(--mf-ink-2)' }}>{ORDER.medication}</span>
          <span className="text-[11.5px]" style={{ color: 'var(--mf-muted)' }}>{ORDER.concentration}</span>
        </div>

        <span className="mf-value mt-1.5">
          <span className="mf-value__num">{rate}</span>
          <span className="mf-value__unit">mL/hr</span>
        </span>
      </div>

      <div className="px-[18px] pb-4">
        {/* Progress is drawn AND stated. The bar alone would be a proportion
            with no units and no absolute value. */}
        {/* Seeks up to position on arrival, then creeps forward while live.
            The numbers beside it stay fixed — animating those would be
            inventing data rather than showing liveness. */}
        <div
          className="mf-bar"
          role="img"
          aria-label={`${TIMING.percentDelivered} percent delivered. ${TIMING.remainingMl} millilitres remaining of ${TIMING.volume} millilitres.`}
        >
          {/* The bar stops moving when the infusion is paused, and so does the
              countdown below it. A pump that keeps animating flow while it has
              stopped delivering is telling the room something untrue. */}
          <div
            className={`mf-bar__fill ${live && !paused ? 'mf-bar__fill--live' : ''}`}
            style={{ '--mf-p': `${TIMING.percentDelivered}%`, '--mf-p2': `${TIMING.percentDelivered + 9}%` }}
          >
            {live && !paused && <span className="mf-bar__flow" aria-hidden="true" />}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 mt-2.5 text-[11.5px]" style={{ color: 'var(--mf-muted)' }}>
          <span>{TIMING.remainingMl} mL remaining of {TIMING.volume} mL</span>
          <span className="tabular-nums">Est. complete {TIMING.completesAt}</span>
        </div>

        {/* Time remaining, counting down. The most-read field on a pump after
            the rate. The plain-language duration carries it for screen readers;
            the ticking clock carries it for everyone else. */}
        <div
          className="flex items-center justify-between gap-3 mt-3 pt-3"
          style={{ borderTop: '1px solid var(--mf-line)' }}
        >
          <span className="text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mf-muted)' }}>
            Time remaining
          </span>
          <span className="flex items-baseline gap-2">
            {/* Ink, not green. Green on this page means running, verified or
                complete — all STATES. A countdown is a value, like the rate
                above it, and the rate is set in ink. Colouring it green would
                make green mean a fourth thing, which is how a colour system
                stops carrying meaning. */}
            <span className="text-[16px] font-semibold" style={{ color: 'var(--mf-ink)' }}>
              <Countdown live={live && !paused} seconds={TIMING.remainingSeconds} />
            </span>
            <span className="sr-only">{TIMING.remainingDuration} remaining</span>
          </span>
        </div>
      </div>

      <Actions>
        {/* Neither of these calls onAction. They used to — both of them, to the
            same handler — which is why pressing "View details" produced an
            occlusion alarm. The occlusion is an EVENT the device detects, not
            something a nurse can press a button to cause, so in the prototype it
            arrives from a walkthrough control beside the device rather than from
            the device itself. */}
        {/* Pausing CONFIRMS; resuming does not.
            They are not symmetrical acts. Pausing stops the patient receiving
            the medication and is easy to do by a mis-grab while carrying
            something; resuming restores the therapy the order already
            authorised. Friction goes where being wrong is expensive and nowhere
            else — the same trade the escalation control and the discrepancy
            screen make. */}
        <Btn
          variant="secondary"
          live={live}
          onClick={() => (paused ? setPaused(false) : setConfirmPause(true))}
        >
          {paused ? 'Resume infusion' : 'Pause infusion'}
        </Btn>
        <Btn variant="primary" live={live} onClick={() => setDetails(true)}>View details</Btn>
      </Actions>

      {confirmPause && (
        <div className="mf-overlay" role="dialog" aria-modal="true" aria-labelledby={`${uid}-pause`}>
          <div className="mf-overlay__panel">
            <span className="flex items-center gap-2.5 mb-3">
              <span style={{ color: 'var(--mf-attn)' }}><StatusGlyph shape="pause" size={15} /></span>
              <span id={`${uid}-pause`} className="text-[15px] font-semibold" style={{ color: 'var(--mf-attn)' }}>
                Pause the infusion?
              </span>
            </span>
            <p className="text-[13px] leading-[1.6] m-0 mb-5" style={{ color: 'var(--mf-ink-2)' }}>
              Delivery stops until you resume it, and the patient stops receiving {ORDER.medication}.
              The device will show a paused state rather than an alarm.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className="mf-btn mf-btn--secondary"
                style={{ minHeight: 40, fontSize: 12 }}
                tabIndex={live ? 0 : -1}
                onClick={live ? () => setConfirmPause(false) : undefined}
              >
                Keep infusing
              </button>
              <button
                type="button"
                className="mf-btn mf-btn--critical"
                style={{ minHeight: 40, fontSize: 12 }}
                tabIndex={live ? 0 : -1}
                onClick={live ? () => { setPaused(true); setConfirmPause(false); } : undefined}
              >
                Pause infusion
              </button>
            </div>
          </div>
        </div>
      )}

      {details && (
        <DetailSheet
          title="Infusion detail"
          icon="pump"
          live={live}
          onClose={() => setDetails(false)}
          rows={[
            ['Medication', ORDER.medication],
            ['Concentration', ORDER.concentration],
            ['Rate', `${rate} mL/hr`],
            ['Delivered', `${TIMING.deliveredMl} of ${TIMING.volume} mL`],
            ['Started', TIMING.startedAt],
            ['Est. complete', TIMING.completesAt],
            ['State', paused ? 'Paused' : 'Delivering'],
          ]}
          note="Read-only. Nothing on this sheet changes the infusion."
        />
      )}
    </div>
  );
}

/* ═══ 08 · Alert state ═════════════════════════════════════════════════════════
   Four independent signals before colour is counted: an octagon glyph, the word
   "Interrupted", a heading that names what happened, and a left border. Print
   it in greyscale and every one of them survives — UN-06.

   The copy deliberately stops at "check the line and patient according to
   established clinical procedure". Inventing troubleshooting steps would be
   inventing clinical guidance, which this study has no basis to do. */
function Alert({ live, onAction }) {
  const [details, setDetails] = useState(false);
  return (
    <div className="mf-screen">
      <IdentityBar live={live} />

      <div className="px-[18px] pt-[18px] pb-4">
        <Chip tone="crit">Infusion interrupted</Chip>

        <h3 className="text-[19px] font-semibold mt-3.5 m-0 leading-tight" style={{ color: 'var(--mf-ink)', letterSpacing: '-0.01em' }}>
          Occlusion detected
        </h3>

        <div className="flex items-baseline gap-2.5 mt-2.5">
          <span className="text-[14px] font-medium" style={{ color: 'var(--mf-ink-2)' }}>{P.name}</span>
          <span className="text-[12.5px]" style={{ color: 'var(--mf-muted)' }}>{ORDER.medication}</span>
        </div>
      </div>

      <div className="px-[18px] pb-4 flex flex-col gap-3">
        <div className="mf-alert mf-alert--crit">
          <span className="shrink-0 mt-[2px]" style={{ color: 'var(--mf-crit)' }}>
            <StatusGlyph shape="octagon" size={15} />
          </span>
          <div>
            {/* "Delivery stopped by the device", not "Infusion paused". The
                monitor screen now has a real user-initiated pause, and the whole
                point of that state is that it is not this one — reusing the word
                here would put the same label on the thing the nurse did and the
                thing the device did to her. */}
            <p className="text-[13px] font-semibold m-0" style={{ color: 'var(--mf-crit)' }}>Delivery stopped by the device</p>
            <p className="text-[12.5px] leading-[1.55] mt-1 m-0" style={{ color: 'var(--mf-crit)' }}>
              Check the infusion line and patient according to established clinical procedure.
            </p>
          </div>
        </div>
      </div>

      <Actions>
        {/* "View details" used to call the same handler as "Acknowledge alert",
            so reading the alarm acknowledged it. Acknowledging an alarm is a
            record that a clinician saw it and took it on; a read-only sheet is
            not that, and the two must never share a control. */}
        <Btn variant="secondary" live={live} onClick={() => setDetails(true)}>View details</Btn>
        <Btn variant="critical" live={live} onClick={() => onAction('next')}>Acknowledge alert</Btn>
      </Actions>

      {details && (
        <DetailSheet
          title="Alarm detail"
          icon="bell-alert"
          tone="var(--mf-crit)"
          live={live}
          onClose={() => setDetails(false)}
          rows={[
            ['Condition', 'Occlusion detected'],
            ['Patient', P.name],
            ['Medication', ORDER.medication],
            ['Delivery', 'Stopped'],
            ['Delivered', `${TIMING.deliveredMl} of ${TIMING.volume} mL`],
            ['Detected', TIMING.nowAt],
          ]}
          note="Read-only. Viewing an alarm does not acknowledge it."
        />
      )}
    </div>
  );
}

/* ═══ 09 · Infusion complete ═══════════════════════════════════════════════════
   FINISHED IS NOT PAUSED, AND IT IS NOT INTERRUPTED.

   All three are "the pump is not currently delivering", and an interface that
   lets them share a look invites the wrong response to each: a completed
   infusion investigated as a fault, or a stalled one left alone because it read
   as done. So completion gets its own state word, its own glyph (a tick, not a
   pause bar or an octagon), its own colour, and — the part a status chip cannot
   carry — a summary of what was actually delivered.

   The progress bar is full rather than absent. An empty or hidden bar at 100%
   loses the one piece of evidence that the therapy ran to term. */
function Complete({ live, onAction, state }) {
  const rate = state?.rate ?? SCENARIO.correctRate;
  const volume = state?.volume ?? '100';
  const [summary, setSummary] = useState(false);
  return (
    <div className="mf-screen">
      <IdentityBar live={live} />

      <div className="px-[18px] pt-[18px] pb-4">
        {/* Lands after the bar finishes filling, so the sequence reads as
            "it reached the end, therefore it is complete" rather than the two
            asserting themselves simultaneously. */}
        <span className="mf-pop inline-block">
          <Chip tone="done" shape="check">Infusion complete</Chip>
        </span>

        <div className="flex items-baseline gap-2.5 mt-4">
          <span className="text-[15px] font-medium" style={{ color: 'var(--mf-ink-2)' }}>{ORDER.medication}</span>
          <span className="text-[11.5px]" style={{ color: 'var(--mf-muted)' }}>{ORDER.concentration}</span>
        </div>

        <span className="mf-value mt-1.5">
          <span className="mf-value__num" style={{ color: 'var(--mf-run)' }}>{volume}</span>
          <span className="mf-value__unit" style={{ color: 'var(--mf-run)' }}>mL delivered</span>
        </span>
      </div>

      <div className="px-[18px] pb-4">
        {/* Full, not hidden. The filled bar is the evidence the therapy ran to
            term rather than stopping early. */}
        {/* Fills the remaining distance rather than appearing already full:
            arriving at 100% is the event this screen exists to report. */}
        <div
          className="mf-bar"
          role="img"
          aria-label={`Complete. ${volume} millilitres of ${volume} millilitres delivered.`}
          style={{ background: 'var(--mf-run-bg)' }}
        >
          <div className="mf-bar__fill mf-bar__fill--complete" style={{ '--mf-from': '18%' }} />
        </div>
        <div className="flex items-center justify-between gap-3 mt-2.5 text-[11.5px]" style={{ color: 'var(--mf-muted)' }}>
          <span>{volume} mL of {volume} mL</span>
          <span className="tabular-nums">Finished {TIMING.finishedAt}</span>
        </div>

        <dl className="mt-4 pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--mf-line)' }}>
          {[
            ['Rate delivered at', `${rate} mL/hr`],
            ['Started', TIMING.startedAt],
            ['Duration', TIMING.totalDuration],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="text-[11px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mf-muted)' }}>{k}</dt>
              <dd className="text-[12.5px] font-medium tabular-nums m-0" style={{ color: 'var(--mf-ink-2)' }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Actions>
        {/* Same fix as the two screens before it: "View summary" shared a
            handler with "Acknowledge", so reading the record cleared it — and in
            the prototype, reset the whole walkthrough. */}
        <Btn variant="secondary" live={live} onClick={() => setSummary(true)}>View summary</Btn>
        <Btn variant="primary" live={live} onClick={() => onAction('next')}>Acknowledge</Btn>
      </Actions>

      {summary && (
        <DetailSheet
          title="Delivery record"
          icon="clipboard-check"
          tone="var(--mf-run)"
          live={live}
          onClose={() => setSummary(false)}
          rows={[
            ['Medication', ORDER.medication],
            ['Delivered', `${volume} of ${volume} mL`],
            ['Rate', `${rate} mL/hr`],
            ['Started', TIMING.startedAt],
            ['Finished', TIMING.finishedAt],
            ['Duration', TIMING.totalDuration],
            ['Identity', state?.verified === 'manual' ? 'Manual read-back' : 'Wristband scan'],
          ]}
          note="Read-only. Acknowledging is a separate, deliberate action."
        />
      )}
    </div>
  );
}

/* ── Dispatcher ───────────────────────────────────────────────────────────── */
const MAP = {
  dashboard: Dashboard,
  verify: Verify,
  order: Order,
  configure: Configure,
  discrepancy: Discrepancy,
  confirm: Confirm,
  active: Active,
  alert: Alert,
  complete: Complete,
};

export function MedFlowScreen({ id, live = false, onAction = () => {}, state, setState }) {
  const C = MAP[id];
  if (!C) return null;
  return <C live={live} onAction={onAction} state={state} setState={setState} />;
}

/* ── Device frame ─────────────────────────────────────────────────────────────
   A frame, not a product shot. No glass, no glow, no 3D rotation — every one of
   those makes the screen harder to read, and the screens are the argument. */
export function DeviceFrame({ children, className = '', style, live = false }) {
  return (
    <div className={`mf-device ${className}`} style={style}>
      {/* ON THE BEZEL, not on the screen.
          It was a grey band inside the screen, sitting directly on top of the
          identity bar — which is also a grey band with a rule. Two near-identical
          stacked bands read as one thick, muddled header with a stray line
          through it.

          Out here it is unambiguously device chrome rather than app chrome, and
          the screen now opens on the patient, which is what UN-01 argues the
          first thing in the interface should be. */}
      <DeviceStatusBar live={live} />
      <div className="mf-device__screen">{children}</div>
    </div>
  );
}

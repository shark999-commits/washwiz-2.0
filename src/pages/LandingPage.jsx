import { Link, useNavigate } from 'react-router-dom'
import {
  IconArrowUpRight,
  IconBookOpen,
  IconCheck,
  IconClock,
  IconDroplet,
  IconReceipt,
} from '../components/Icon'

const featureCards = [
  {
    icon: IconBookOpen,
    title: 'Easy booking',
    body: 'Choose a preset, review the service, and get a secure estimate in minutes.',
  },
  {
    icon: IconClock,
    title: 'Smart tracking',
    body: 'Monitor every stage from received to folded and ready for pickup.',
  },
  {
    icon: IconDroplet,
    title: 'Laundry care',
    body: 'From everyday essentials to delicate pieces, every order follows a care plan.',
  },
]

const orderSteps = [
  'Choose your service and preset',
  'Review the total and expected timing',
  'Drop off or schedule a pickup',
  'Track live progress until it is ready',
]

const pricingHighlights = [
  { label: 'Basic wash', value: 'From ₱180' },
  { label: 'Pickup & delivery', value: 'Add-on' },
  { label: 'Premium laundry care', value: 'From ₱350' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-header__brand" aria-label="Back to WashWhiz home page">
          <span className="brand-mark__icon">
            <IconDroplet size={18} />
          </span>
          <span className="brand-mark__word">WashWhiz</span>
        </Link>

        <nav className="landing-header__nav" aria-label="Main navigation">
          <button type="button" className="button-ghost" onClick={() => navigate('/login')}>Login</button>
          <button type="button" className="button-primary" onClick={() => navigate('/login?mode=register')}>Create account</button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__content">
          <span className="eyebrow eyebrow--light">Laundry management, simplified</span>
          <h1>Fresh, reliable laundry care for busy homes and growing teams.</h1>
          <p>
            Book pickup and drop-off, track each stage, and stay informed with a cleaner,
            easier way to manage every wash from start to finish.
          </p>

          <div className="landing-hero__actions">
            <button type="button" className="button-primary" onClick={() => navigate('/login')}>
              Book a wash
              <IconArrowUpRight size={16} />
            </button>
            <button type="button" className="button-secondary" onClick={() => navigate('/login?mode=register')}>
              Create account
            </button>
          </div>

          <div className="landing-proof">
            <div>
              <strong>2,500+</strong>
              <span>Orders delivered</span>
            </div>
            <div>
              <strong>96%</strong>
              <span>Repeat customers</span>
            </div>
            <div>
              <strong>Same day</strong>
              <span>Ready for pickup</span>
            </div>
          </div>
        </div>

        <div className="landing-hero__panel" aria-label="WashWhiz order preview">
          <div className="mini-panel mini-panel--dark">
            <div className="mini-panel__header">
              <span className="eyebrow eyebrow--light">Today’s orders</span>
              <span className="mini-panel__badge">Live</span>
            </div>
            <div className="mini-panel__stats">
              <div>
                <strong>24</strong>
                <span>Active</span>
              </div>
              <div>
                <strong>8</strong>
                <span>Ready</span>
              </div>
            </div>
          </div>

          <div className="mini-panel mini-panel--light">
            <div className="mini-panel__row">
              <span className="mini-panel__label">Queue</span>
              <span className="status-badge status-badge--ready">Ready</span>
            </div>
            <div className="mini-panel__row">
              <span className="mini-panel__label">Current stage</span>
              <strong>Washing</strong>
            </div>
            <div className="mini-panel__row">
              <span className="mini-panel__label">ETA</span>
              <strong>Today, 4:30 PM</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="eyebrow">Why customers choose us</span>
          <h2>Simple, transparent, and built around your schedule.</h2>
        </div>

        <div className="feature-grid">
          {featureCards.map(({ icon: Icon, title, body }) => (
            <article key={title} className="feature-card">
              <div className="feature-card__icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--split">
        <div className="section-heading section-heading--left">
          <span className="eyebrow">How it works</span>
          <h2>From first order to ready-to-pickup in a few steps.</h2>
        </div>

        <div className="steps-list">
          {orderSteps.map((step, index) => (
            <div key={step} className="step-item">
              <span className="step-item__number">0{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--split landing-section--pricing">
        <div className="section-heading section-heading--left">
          <span className="eyebrow">Flexible pricing</span>
          <h2>Clear plans for everyday laundry and convenience extras.</h2>
        </div>

        <div className="pricing-grid">
          {pricingHighlights.map((item) => (
            <div key={item.label} className="pricing-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="eyebrow eyebrow--light">Ready to get started?</span>
          <h2>Book your first order with WashWhiz today.</h2>
        </div>

        <div className="landing-cta__actions">
          <button type="button" className="button-primary" onClick={() => navigate('/login')}>
            Continue to login
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <Link to="/" className="landing-header__brand" aria-label="Back to WashWhiz home page">
          <span className="brand-mark__icon">
            <IconReceipt size={18} />
          </span>
          <span className="brand-mark__word">WashWhiz</span>
        </Link>
        <span>Made for cleaner routines and smoother laundry days.</span>
        <span className="landing-footer__meta">
          <IconCheck size={14} />
          Trusted care. Transparent updates.
        </span>
      </footer>
    </main>
  )
}

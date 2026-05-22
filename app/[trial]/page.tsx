import { notFound } from "next/navigation";
import { getTrialBySlug } from "@/lib/trials";
import TrialForm from "./trial-form";
import { Stethoscope, MapPin, DollarSign, ShieldCheck } from "lucide-react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";

type Props = {
  params: Promise<{ trial: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { trial } = await params;
  const config = getTrialBySlug(trial);
  if (!config) return { title: "Trial Not Found" };
  return {
    title: `${config.subtitle} — ${config.company.name} Clinical Trials`,
    description: config.heroDescription,
  };
}

export default async function TrialPage({ params }: Props) {
  const { trial } = await params;
  const config = getTrialBySlug(trial);

  if (!config) notFound();

  return (
    <>
      {/* ── Nav ── */}
      <nav className="top">
        <div className="row">
          <a href="#" className="logo">
            <span className="mark">{config.company.name[0]}</span>
            <span className="name">{config.company.name} <span>Clinical Trials</span></span>
          </a>
          <a href="#form" className="btn-orange">
            Check eligibility <span className="arrow">→</span>
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            {/* Left: Text */}
            <div className="hero-text">
              <p className="hero-eyebrow">{config.subtitle}</p>
              <h1 className="headline">{config.title}</h1>
              <p className="lede">{config.heroDescription}</p>

              <p className="receive-h">Qualified participants receive</p>
              <ul className="benefits">
                {config.benefits.map((benefit, i) => (
                  <li key={i} className="check-bullet">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="currentColor" opacity=".12"/>
                      <path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {benefit.bold ? (
                      <>Up to <strong>{benefit.bold}</strong> {benefit.text}</>
                    ) : (
                      benefit.text
                    )}
                  </li>
                ))}
              </ul>

              <div className="hero-cta-row">
                <a href="#study" className="btn-ghost">
                  Read about the study <span className="arrow">→</span>
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="hero-form-col">
              <span id="form" style={{ position: "absolute", top: "-80px" }}></span>
              <div className="hero-form-shell">
                <TrialForm
                  trialId={config.trialId}
                  questions={config.questions}
                  contactFields={config.contactFields}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className="trust-strip">
        <div className="inner">
          <span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1 L12 3 V7 C12 9.5 10 11.5 7 12.5 C4 11.5 2 9.5 2 7 V3 L7 1 Z" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7 L6.5 8.5 L9 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {config.trustItems[0]?.label}
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M4 7 L6 9 L10 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {config.trustItems[1]?.label}
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11 V5 L7 2 L12 5 V11" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5 11 V8 H9 V11" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            {config.trustItems[2]?.label}
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4 V7 L9 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            {config.trustItems[3]?.label}
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="stats">
        <div className="stats-grid">
          {config.stats.map((stat, i) => (
            <div key={i} className="stat">
              <div className="k">{stat.label}</div>
              <div className="v">
                {stat.value}
                {stat.unit && <small>{stat.unit}</small>}
              </div>
              <div className="sub">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About the Study ── */}
      <section className="about-study" id="study">
        <div className="wrap">
          <div className="about-study-grid">
            <div className="side-label">01 — The Study</div>
            <div className="study-body">
              <h2>{config.studyHeadline}</h2>
              {config.studyDescription.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <div className="criteria">
                {config.criteria.map((row, i) => (
                  <div key={i} className="criteria-row">
                    <span className="k">{row.label}</span>
                    <span className="v">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <span className="eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>
                Find a paid clinical trial today
              </span>
              <h2>{config.ctaHeadline}</h2>
              <p>{config.ctaDescription}</p>
            </div>
            <div className="cta-right">
              <a href="#form" className="btn-orange lg">
                Check eligibility <span className="arrow">→</span>
              </a>
              {config.ctaStat && (
                <div className="stat-row">
                  <strong>{config.ctaStat.value}</strong>
                  <span>{config.ctaStat.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="why" id="why">
        <div className="wrap">
          <div className="why-grid">
            <div className="side-label">02 — Why join</div>
            <div>
              <h2>Why Participate in Clinical Trials</h2>
              <p className="why-lede">
                Participating in a clinical trial gives you early access to new treatments not yet available to the public — at no cost. You&apos;ll receive care from leading specialists with frequent check-ups throughout.
              </p>
              <ol className="why-list">
                <li>
                  <div className="num-icon">
                    <Stethoscope size={28} strokeWidth={1.5} />
                  </div>
                  <div className="body">
                    <h3>Latest Treatments</h3>
                    <p>Access new therapies and investigational medications before they become available to the general public.</p>
                  </div>
                </li>
                <li>
                  <div className="num-icon">
                    <MapPin size={28} strokeWidth={1.5} />
                  </div>
                  <div className="body">
                    <h3>Local Trials</h3>
                    <p>Find studies at research sites near you — with flexible scheduling and travel support where available.</p>
                  </div>
                </li>
                <li>
                  <div className="num-icon">
                    <DollarSign size={28} strokeWidth={1.5} />
                  </div>
                  <div className="body">
                    <h3>Potential Compensation</h3>
                    <p>Qualified participants are paid for completed visits and reimbursed for related travel expenses.</p>
                  </div>
                </li>
                <li>
                  <div className="num-icon">
                    <ShieldCheck size={28} strokeWidth={1.5} />
                  </div>
                  <div className="body">
                    <h3>Health Insurance Not Required</h3>
                    <p>All study-related care is provided at no cost to you — insurance is never required to enroll or participate.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section className="about-us" id="about">
        <div className="wrap">
          <div className="about-us-grid">
            <div className="side-label">03 — About</div>
            <div className="col">
              <h2>Good Lab <span>Clinical Trials.</span></h2>
              <div className="about-meta">
                <div className="cell">Founded<strong>2021</strong></div>
                <div className="cell">Headquarters<strong>Sydney, AU</strong></div>
                <div className="cell">Active sites<strong>34 in 21 states</strong></div>
                <div className="cell">Total enrolled<strong>14,200+</strong></div>
              </div>
            </div>
            <div className="col">
              <p>Good Lab is a free clinical trial matchmaking service. We partner with a broad range of clinical trial providers across the US to deliver access to cutting-edge treatments &amp; new medications unavailable elsewhere — entirely free of charge.</p>
              <p>The trials on our platform don&apos;t require you to have insurance - this may assist you in getting quality medical care and greater understanding of your disease. There&apos;s no cost to you, ever, and insurance isn&apos;t required to take part.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="wrap">
          {/* Centered top section */}
          <div className="foot-center">
            <div className="foot-logo">
              <span className="mark">{config.company.name[0]}</span>
              <span className="name">GOOD LAB<span>CLINICAL TRIALS</span></span>
            </div>
            <div className="foot-badges">
              {/* Placeholder for HIPAA badges */}
              <span className="badge-placeholder">HIPAA VERIFIED</span>
              <span className="badge-placeholder">HIPAA SEAL OF COMPLIANCE</span>
            </div>
            <div className="foot-links-row">
              <a href="#">Terms of Use</a>
              <span className="sep">|</span>
              <a href="#">Privacy Policy</a>
              <span className="sep">|</span>
              <a href="#">Get In Touch</a>
            </div>
          </div>

          <p className="legal">
            These terms and conditions govern your use of this website; by using this website, you accept these terms and conditions in full. If you disagree with these terms and conditions or any part of these terms and conditions, you must not use this website. You must be at least [18] years of age to use this website. By using this website [and by agreeing to these terms and conditions] you warrant and represent that you are at least [18] years of age. Study participation is voluntary and subject to screening by qualified clinical staff.
          </p>

          <div className="foot-bottom">
            <span>© 2026 Good Lab. All Rights Reserved.</span>
            <div className="links">
              <a href="https://www.facebook.com/GoodLab-Clinical-Trials-101038139196316" target="_blank" rel="noopener noreferrer"><FaFacebookF size={16} /></a>
              <a href="https://www.linkedin.com/company/goodlab" target="_blank" rel="noopener noreferrer"><FaLinkedinIn size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

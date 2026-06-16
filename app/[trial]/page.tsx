import { notFound } from "next/navigation";
import { getTrialBySlug } from "@/lib/trials";
import TrialForm from "./trial-form";
import Faq from "./faq";
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
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="flex items-center justify-between pt-[26px] px-14 max-w-[1240px] mx-auto max-lg:pt-[22px] max-lg:px-8 max-md:pt-[18px] max-md:px-5 max-xs:pt-4 max-xs:px-4">
          <a href="#" className="group/logo inline-flex items-center gap-2.5 no-underline text-[var(--ink)]">
            <span className="w-[30px] h-[30px] rounded-lg bg-[var(--blue-deep)] flex items-center justify-center text-white font-extrabold text-[15px] tracking-[-0.02em] transition-[transform,box-shadow] duration-200 ease-out group-hover/logo:scale-105 group-hover/logo:shadow-[0_4px_12px_rgba(11,46,111,0.25)]">
              {config.company.name[0]}
            </span>
            <span className="font-bold text-[16px] tracking-[-0.005em]">
              {config.company.name} <span className="font-medium text-[var(--ink-3)] ml-1.5">Clinical Trials</span>
            </span>
          </a>
          <a href="#form" className="group/nav inline-flex items-center gap-2 py-[11px] px-5 bg-[var(--orange)] text-white border-0 rounded-lg text-[14px] font-semibold cursor-pointer no-underline transition-[background,transform,box-shadow] duration-150 shadow-[0_1px_0_rgba(0,0,0,.05)] whitespace-nowrap hover:bg-[var(--orange-2)] max-xs:py-2.5 max-xs:px-4 max-xs:text-[13px]">
            Check eligibility <span className="transition-transform duration-200 group-hover/nav:translate-x-[3px]">→</span>
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-pattern pt-[130px] pb-[90px] bg-[var(--bg-tint)] relative z-10 overflow-visible animate-[fadeIn_0.5s_ease-out_both] max-md:pt-[100px] max-md:pb-[60px]">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          <div className="relative grid grid-cols-[3fr_2fr] gap-20 items-start max-md:grid-cols-1 max-md:gap-8">
            {/* Left: Text */}
            <div className="pt-1 min-w-0 flex flex-col space-y-12 animate-[fadeUp_0.6s_ease-out_both] [animation-delay:0.1s]">
              <p className="font-serif italic font-medium text-[30px] leading-none text-[var(--blue)] tracking-[-0.01em] m-0 max-md:text-[24px] max-xs:text-[20px] mb-2">
                {config.subtitle}
              </p>
              <h1 className="font-extrabold text-[40px] leading-[1.08] tracking-[-0.025em] text-[var(--ink)] m-0 text-balance max-md:text-[30px] max-xs:text-[26px] mb-4">
                {config.title}
              </h1>
              <p className="text-[16.5px] leading-[1.6] text-[var(--ink-2)] m-0 max-md:text-[15px] mb-6">
                {config.heroDescription}
              </p>

              <div className="flex flex-col space-y-5 pt-8 border-t border-[var(--rule)]">
                <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)] m-0 mb-2">
                  Qualified participants receive
                </p>
                <ul className="list-none p-0 m-0 flex flex-col gap-4">
                  {config.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15.5px] text-[var(--ink)] font-medium">
                      <svg className="shrink-0 mt-[3px] text-[var(--blue)]" width="18" height="18" viewBox="0 0 20 20" fill="none">
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
              </div>

              <div className="flex items-center gap-[18px] flex-wrap">
                <a href="#study" className="group/ghost inline-flex items-center gap-1.5 bg-transparent text-[var(--ink)] border-0 py-[11px] px-1 font-semibold text-[14.5px] cursor-pointer no-underline whitespace-nowrap hover:text-[var(--blue)] transition-all duration-200">
                  Read about the study <span className="transition-transform duration-200 group-hover/ghost:translate-x-[3px]">→</span>
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="self-start flex min-w-0 relative z-20 animate-[fadeUp_0.6s_ease-out_both] [animation-delay:0.25s]">
              <span id="form" className="absolute -top-20"></span>
              <div className="w-full bg-[var(--blue-2)] rounded-2xl p-[18px] shadow-[0_30px_60px_-28px_rgba(13,46,111,.35)] relative">
                <TrialForm
                  trialId={config.trialId}
                  trialCode={config.leadspediaTrialCode}
                  questions={config.questions}
                  contactFields={config.contactFields}
                  healthmatchTrialId={config.healthmatchTrialId}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white relative z-0 animate-[fadeUp_0.7s_ease-out_both]">
        <div className="grid grid-cols-2 border-y border-[var(--rule)] max-xs:grid-cols-1">
          {config.stats.map((stat, i) => (
            <div
              key={i}
              className="py-9 px-8 border-r border-[var(--rule)] last:border-r-0 text-center animate-[fadeUp_0.5s_ease-out_both] max-md:py-6 max-md:px-5 max-xs:border-r-0 max-xs:border-b max-xs:border-[var(--rule)] max-xs:last:border-b-0"
              style={{ animationDelay: `${(i + 1) * 0.1}s` }}
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-3)] mb-3.5">
                {stat.label}
              </div>
              <div className="text-[42px] font-extrabold leading-none tracking-[-0.025em] text-[var(--ink)] max-md:text-[32px]">
                {stat.value}
                {stat.unit && <small className="text-[16px] text-[var(--ink-2)] ml-1 font-semibold">{stat.unit}</small>}
              </div>
              <div className="text-[13.5px] text-[var(--ink-3)] mt-2.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About the Study ── */}
      <section className="py-[100px] bg-white animate-[fadeUp_0.7s_ease-out_both] max-md:py-[60px]" id="study">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          <div className="grid grid-cols-[0.4fr_1fr] gap-20 items-start max-lg:grid-cols-1 max-lg:gap-8">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--blue)] pt-2">
              01 — The Study
            </div>
            <div className="max-w-[760px]">
              <h2 className="text-[44px] font-extrabold leading-[1.06] tracking-[-0.025em] m-0 mb-7 text-balance max-md:text-[30px]">
                {config.studyHeadline}
              </h2>
              {config.studyDescription.map((para, i) => (
                <p key={i} className="text-[17px] leading-[1.6] text-[var(--ink-2)] m-0 mb-[18px]">
                  {para}
                </p>
              ))}
              <div className="mt-11 border-t border-[var(--rule)]">
                {config.criteria.map((row, i) => (
                  <div key={i} className="grid grid-cols-[200px_1fr] py-[22px] border-b border-[var(--rule-soft)] items-baseline last:border-b-0 max-md:grid-cols-1 max-md:gap-2">
                    <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                      {row.label}
                    </span>
                    <span className="text-[16.5px] text-[var(--ink)] leading-[1.5]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-glow bg-[var(--blue-deep)] text-white py-[100px] relative overflow-hidden animate-[fadeUp_0.7s_ease-out_both] max-md:py-[60px]">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          <div className="relative grid grid-cols-[1.2fr_0.8fr] gap-20 items-center max-lg:grid-cols-1 max-lg:gap-10">
            <div>
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: "rgba(255,255,255,.5)" }}>
                Find a paid clinical trial today
              </span>
              <h2 className="text-[40px] font-extrabold leading-[1.08] tracking-[-0.025em] mt-[18px] mb-[22px] text-balance max-md:text-[30px]">
                {config.ctaHeadline}
              </h2>
              <p className="m-0 text-white/65 text-[16px] max-w-[500px] leading-[1.6]">
                {config.ctaDescription}
              </p>
            </div>
            <div className="flex flex-col gap-7 items-start">
              <a href="#form" className="group/cta inline-flex items-center gap-2 py-4 px-[26px] bg-[var(--orange)] text-white border-0 rounded-[10px] text-[15px] font-semibold cursor-pointer no-underline transition-[background,transform,box-shadow] duration-150 shadow-[0_1px_0_rgba(0,0,0,.05)] whitespace-nowrap hover:bg-[var(--orange-2)]">
                Check eligibility <span className="transition-transform duration-200 group-hover/cta:translate-x-[3px]">→</span>
              </a>
              {config.ctaStat && (
                <div className="flex items-baseline gap-3 text-white/60 text-[14px]">
                  <strong className="text-white text-[34px] font-extrabold tracking-[-0.02em] leading-none">
                    {config.ctaStat.value}
                  </strong>
                  <span>{config.ctaStat.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="bg-[var(--bg-tint)] py-[100px] animate-[fadeUp_0.7s_ease-out_both] max-md:py-[60px]" id="why">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          <div className="grid grid-cols-[0.4fr_1fr] gap-20 max-lg:grid-cols-1 max-lg:gap-8">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--blue)] pt-2">
              02 — Why join
            </div>
            <div>
              <h2 className="text-[44px] font-extrabold leading-[1.06] mt-4 mb-6 tracking-[-0.025em] max-w-[720px] text-balance max-md:text-[30px]">
                Why Participate in Clinical Trials
              </h2>
              <p className="text-[16.5px] leading-[1.65] text-[var(--ink-2)] m-0 mb-14 max-w-[600px]">
                Participating in a clinical trial gives you early access to new treatments not yet available to the public — at no cost. You&apos;ll receive care from leading specialists with frequent check-ups throughout.
              </p>
              <ol className="list-none p-0 m-0">
                {[
                  { icon: <Stethoscope size={28} strokeWidth={1.5} />, title: "Latest Treatments", desc: "Access new therapies and investigational medications before they become available to the general public." },
                  { icon: <MapPin size={28} strokeWidth={1.5} />, title: "Local Trials", desc: "Find studies at research sites near you — with flexible scheduling and travel support where available." },
                  { icon: <DollarSign size={28} strokeWidth={1.5} />, title: "Compensation for Time and Travel", desc: "Qualified participants receive compensation for time and travel — paid for completed visits and reimbursed for related travel expenses." },
                  { icon: <ShieldCheck size={28} strokeWidth={1.5} />, title: "Health Insurance Not Required", desc: "All study-related care is provided at no cost to you — insurance is never required to enroll or participate." },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[60px_1fr] gap-8 py-7 border-t border-[var(--rule)] items-center last:border-b last:border-[var(--rule)] animate-[fadeUp_0.5s_ease-out_both] max-md:grid-cols-[40px_1fr] max-md:gap-5 max-md:py-[22px]"
                    style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                  >
                    <div className="flex items-center justify-center text-[var(--blue)]">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-[22px] font-bold leading-[1.25] m-0 mb-1.5 tracking-[-0.01em]">
                        {item.title}
                      </h3>
                      <p className="m-0 text-[var(--ink-2)] text-[15.5px] leading-[1.55] max-w-[660px]">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section className="bg-white py-[100px] animate-[fadeUp_0.7s_ease-out_both] max-md:py-[60px]" id="about">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          <div className="grid grid-cols-[0.4fr_1fr_1fr] gap-20 items-start max-lg:grid-cols-1 max-lg:gap-10 max-md:gap-8">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--blue)] pt-2">
              03 — About
            </div>
            <div>
              <h2 className="text-[48px] font-extrabold leading-[1.04] tracking-[-0.025em] mt-4 mb-0 max-md:text-[34px]">
                Good Lab <span className="text-[var(--blue)]">Clinical Trials.</span>
              </h2>
              <div className="mt-8 border-t border-[var(--rule)] pt-[22px] grid grid-cols-2 gap-[22px]">
                <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--ink-3)] uppercase">Founded<strong className="block font-sans font-bold text-[var(--ink)] text-[18px] mt-1 tracking-[-0.01em] normal-case">2021</strong></div>
                <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--ink-3)] uppercase">Headquarters<strong className="block font-sans font-bold text-[var(--ink)] text-[18px] mt-1 tracking-[-0.01em] normal-case">Sydney, AU</strong></div>
                <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--ink-3)] uppercase">Active sites<strong className="block font-sans font-bold text-[var(--ink)] text-[18px] mt-1 tracking-[-0.01em] normal-case">34 in 21 states</strong></div>
                <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--ink-3)] uppercase">Total enrolled<strong className="block font-sans font-bold text-[var(--ink)] text-[18px] mt-1 tracking-[-0.01em] normal-case">14,200+</strong></div>
              </div>
            </div>
            <div>
              <p className="text-[var(--ink)] text-[17px] font-medium leading-[1.6] m-0 mb-[18px]">
                Good Lab is a free clinical trial matchmaking service. We partner with a broad range of clinical trial providers across the US to deliver access to cutting-edge treatments &amp; new medications unavailable elsewhere — entirely free of charge.
              </p>
              <p className="text-[16px] leading-[1.6] text-[var(--ink-2)] m-0 mb-[18px]">
                The trials on our platform don&apos;t require you to have insurance - this may assist you in getting quality medical care and greater understanding of your disease. There&apos;s no cost to you, ever, and insurance isn&apos;t required to take part.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[var(--bg-tint)] py-[100px] animate-[fadeUp_0.7s_ease-out_both] max-md:py-[60px]" id="faq">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          <div className="grid grid-cols-[0.4fr_1fr] gap-20 items-start max-lg:grid-cols-1 max-lg:gap-8">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--blue)] pt-2">
              04 — FAQ
            </div>
            <div>
              <h2 className="text-[44px] font-extrabold leading-[1.06] mt-4 mb-6 tracking-[-0.025em] max-w-[720px] text-balance max-md:text-[30px]">
                Frequently asked questions.
              </h2>
              <p className="text-[16.5px] leading-[1.65] text-[var(--ink-2)] m-0 mb-10 max-w-[600px]">
                Quick answers to the questions we hear most often. Still unsure? A study coordinator can walk you through anything before you commit.
              </p>
              <Faq />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white pt-[60px] pb-8 animate-[fadeUp_0.7s_ease-out_both]">
        <div className="max-w-[1240px] mx-auto px-14 max-lg:px-8 max-md:px-5 max-xs:px-4">
          {/* Centered top section */}
          <div className="flex flex-col items-center gap-6 pb-10 max-lg:pb-8">
            <div className="flex flex-col items-center gap-2">
              <span className="w-12 h-12 rounded-xl bg-[var(--blue-deep)] flex items-center justify-center text-white font-extrabold text-[20px] tracking-[-0.02em]">
                {config.company.name[0]}
              </span>
              <span className="font-bold text-[14px] tracking-[0.08em] uppercase text-[var(--ink)] text-center">
                GOOD LAB<span className="block font-normal text-[10px] tracking-[0.14em] text-[var(--ink-3)] mt-0.5">CLINICAL TRIALS</span>
              </span>
            </div>
            <div className="flex items-center gap-3 max-xs:flex-col">
              <span className="inline-flex items-center gap-1.5 border border-[var(--rule)] py-2 px-3.5 rounded-md font-mono text-[10px] tracking-[0.08em] text-[var(--ink-2)] uppercase font-medium">
                HIPAA VERIFIED
              </span>
              <span className="inline-flex items-center gap-1.5 border border-[var(--rule)] py-2 px-3.5 rounded-md font-mono text-[10px] tracking-[0.08em] text-[var(--ink-2)] uppercase font-medium">
                HIPAA SEAL OF COMPLIANCE
              </span>
            </div>
            <div className="flex items-center gap-3 text-[14.5px]">
              <a target="_blank" href="https://goodlab.org/terms.html" className="text-[var(--ink)] no-underline hover:text-[var(--blue)] transition-colors duration-200">Terms of Use</a>
              <span className="text-[var(--ink-3)] text-[12px]">|</span>
              <a target="_blank" href="https://goodlab.org/privacypol.html" className="text-[var(--ink)] no-underline hover:text-[var(--blue)] transition-colors duration-200">Privacy Policy</a>
              <span className="text-[var(--ink-3)] text-[12px]">|</span>
              <a href="#" className="text-[var(--ink)] no-underline hover:text-[var(--blue)] transition-colors duration-200">Get In Touch</a>
            </div>
          </div>

          <p className="max-w-[940px] mx-auto mb-9 text-[11.5px] text-[var(--ink-3)] leading-[1.6] font-mono tracking-[0.01em] text-center border-t border-[var(--rule)] pt-9">
            These terms and conditions govern your use of this website; by using this website, you accept these terms and conditions in full. If you disagree with these terms and conditions or any part of these terms and conditions, you must not use this website. You must be at least [18] years of age to use this website. By using this website [and by agreeing to these terms and conditions] you warrant and represent that you are at least [18] years of age. Study participation is voluntary and subject to screening by qualified clinical staff.
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-[var(--rule)] font-mono text-[11px] tracking-[0.06em] text-[var(--ink-3)] max-md:flex-col max-md:gap-4 max-md:items-center">
            <span>© 2026 Good Lab. All Rights Reserved.</span>
            <div className="flex gap-3.5 items-center">
              <a href="https://www.facebook.com/GoodLab-Clinical-Trials-101038139196316" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-3)] no-underline inline-flex hover:text-[var(--ink)] transition-colors duration-200">
                <FaFacebookF size={16} />
              </a>
              <a href="https://www.linkedin.com/company/goodlabtrials" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-3)] no-underline inline-flex hover:text-[var(--ink)] transition-colors duration-200">
                <FaLinkedinIn size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

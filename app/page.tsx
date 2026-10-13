import type { Metadata, Viewport } from "next";
import Image, { getImageProps } from "next/image";
import localFont from "next/font/local";
const BillingPlan = { STARTER: "STARTER", GROWTH: "GROWTH", PORTFOLIO: "PORTFOLIO" } as const;
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  FileSpreadsheet,
  Languages,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { defaultBillingPlanCatalog } from "./plans";
const COMPANY_NAME = "Mercurion Labs, LLC";
const appOrigin = "https://mercuryreach.net";
const formatCurrencyFromCents = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
import styles from "./landing.module.css";

const geist = localFont({
  src: "./fonts/geist-latin-variable.woff2",
  display: "swap",
  variable: "--font-landing-geist",
  weight: "100 900",
});

const title = "TenantReach | Every resident. One clear message.";
const description =
  "One place for property teams to send resident texts and calls, translate notices, and keep up with replies.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tenantreach.net"),
  title,
  description,
  applicationName: "TenantReach",
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    siteName: "TenantReach",
    type: "website",
    url: "/",
  },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const navigation = [
  ["#demo", "Demo"],
  ["#workflow", "How it works"],
  ["#pricing", "Plans"],
  ["#support", "Support"],
  ["#faq", "FAQ"],
] as const;

const workflowSteps = [
  {
    icon: FileSpreadsheet,
    title: "Bring your people together.",
    text: "Import your Rent Manager or spreadsheet roster. Organize contacts by property and keep past residents disabled, with their history intact.",
  },
  {
    icon: Languages,
    title: "Write it once. Make it clear.",
    text: "Draft your notice in English, preview the Spanish translation, and choose text, voice, or both. Review the audience before you send.",
  },
  {
    icon: MessageSquare,
    title: "Keep the conversation going.",
    text: "Schedule routine updates or send a notice now. Follow delivery history and manage replies without losing the original message.",
  },
];

const faqItems = [
  {
    question: "What kinds of notices can I send?",
    answer:
      "Use text, voice, or both for maintenance updates, inspections, rent reminders, urgent property notices, and everyday community news.",
  },
  {
    question: "Do teams have to write the Spanish notice separately?",
    answer:
      "No. Start with the English notice and generate a Spanish version automatically. Review the translation and preview the voice before sending.",
  },
  {
    question: "Can this stay simple for non-technical staff?",
    answer:
      "Yes. Simple mode keeps the audience, message, and send decision in focus. Additional options are available when your team needs them.",
  },
  {
    question: "Will live texting or calling turn on immediately?",
    answer:
      "No. Setup and rehearsal stay separate from live launch. Your team can review the workflow before provider delivery is enabled. The public demo is simulated and does not contact residents.",
  },
  {
    question: "Can I manage more than one property?",
    answer:
      "Yes. Organize contacts and notices by property within your workspace. Choose a plan that fits your portfolio, with workspace permissions and contact preferences carried through the workflow.",
  },
];

function TenantReachLogo() {
  const { props: darkLogo } = getImageProps({
    src: "/brand/tenantreach/wordmark-dark.png",
    alt: "TenantReach",
    width: 2172,
    height: 724,
    sizes: "224px",
  });

  return (
    <picture className={styles.logo}>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet={darkLogo.srcSet ?? darkLogo.src}
        sizes={darkLogo.sizes}
      />
      {/* The complete supplied artwork is preserved in both color schemes. */}
      <Image
        src="/brand/tenantreach/wordmark-light.png"
        alt="TenantReach"
        width={2172}
        height={724}
        sizes="224px"
      />
    </picture>
  );
}

export default function MarketingHomePage() {
  const session = false;
  const planCatalog = defaultBillingPlanCatalog;
  const featuredPlans = [
    BillingPlan.STARTER,
    BillingPlan.GROWTH,
    BillingPlan.PORTFOLIO,
  ];

  return (
    <div className={`${geist.variable} ${styles.page}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header} data-testid="public-header">
        <div className={styles.headerInner}>
          <a
            aria-label="TenantReach home"
            className={styles.homeLink}
            href="/"
          >
            <TenantReachLogo />
          </a>
          <nav aria-label="Public navigation" className={styles.desktopNav}>
            {navigation.map(([href, label]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <a
              className={styles.loginLink}
              href={`${appOrigin}/login`}
            >
              {session ? "Open dashboard" : "Log in"}
            </a>
            <span
              className={styles.headerSignup}
              data-testid="public-header-signup"
            >
              <a className={styles.button} href={`${appOrigin}/signup`}>
                Start beta setup <ArrowRight aria-hidden="true" size={15} />
              </a>
            </span>
          </div>
        </div>
        <details className={styles.mobileMenu}>
          <summary>
            Explore TenantReach <ChevronDown aria-hidden="true" size={17} />
          </summary>
          <nav aria-label="Mobile section navigation">
            {navigation.map(([href, label]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
            <a href={`${appOrigin}/knowledge-base`}>Help Center</a>
          </nav>
        </details>
      </header>

      <main id="main-content">
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="landing-title"
        >
          <h1 id="landing-title">
            Every resident.
            <br />
            <span>One clear message.</span>
          </h1>
          <p>
            From the everyday update to the message that can’t wait.
            <br className={styles.desktopBreak} /> Bring your property’s texts,
            calls, and replies together in TenantReach.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.button} href={`${appOrigin}/signup`}>
              Start beta setup <ArrowRight aria-hidden="true" size={17} />
            </a>
            <a className={styles.secondaryButton} href="#demo">
              Try the interactive demo{" "}
              <ArrowDown aria-hidden="true" size={16} />
            </a>
          </div>
          <p className={styles.heroNote}>
            Explore the workflow before enabling live delivery.
          </p>
        </section>

        <section
          className={styles.container}
          aria-label="Workspace design preview"
        >
          <figure className={styles.preview}>
            <div className={styles.previewBar}>
              <span>Room for the work that matters.</span>
              <span>Workspace preview</span>
            </div>
            <div className={styles.previewImage}>
              <Image
                src="/brand/tenantreach/workspace-preview.png"
                alt="TenantReach workspace concept showing resident replies, property context, and messages organized by category."
                width={1378}
                height={1090}
                sizes="(max-width: 760px) 100vw, 1120px"
                preload
              />
            </div>
            <figcaption>
              Illustrative workspace preview with sample people and properties.{" "}
              <a href="#demo">
                Try the notice workflow{" "}
                <ArrowRight aria-hidden="true" size={14} />
              </a>
            </figcaption>
          </figure>
          <div
            className={styles.capabilities}
            aria-label="Communication capabilities"
          >
            <span>
              <MessageSquare aria-hidden="true" size={18} /> SMS notices
            </span>
            <span>
              <Phone aria-hidden="true" size={18} /> Voice calls
            </span>
            <span>
              <Languages aria-hidden="true" size={18} /> English + Spanish
            </span>
            <span>
              <ShieldCheck aria-hidden="true" size={18} /> Contact preferences
            </span>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.section}`}
          id="workflow"
          aria-labelledby="workflow-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="workflow-title">
              Less chasing.
              <br />
              More reaching.
            </h2>
            <p>
              A clear path from your contact list to their next update. Built
              around the work property teams do every day.
            </p>
          </div>
          <div className={styles.workflow}>
            {workflowSteps.map((step) => (
              <article key={step.title}>
                <step.icon aria-hidden="true" size={24} strokeWidth={1.5} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.demoSection}
          id="demo"
          aria-labelledby="demo-title"
        >
          <div className={`${styles.container} ${styles.demoGrid}`}>
            <div className={styles.demoIntro}>
              <h2 id="demo-title">
                Your next notice.
                <br />
                Give it a dry run.
              </h2>
              <p>
                Write an update, preview it in Spanish, and hear how it sounds.
                Then walk through a simulated send.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <Check aria-hidden="true" size={18} /> Choose text, voice, or
                  both
                </li>
                <li>
                  <Check aria-hidden="true" size={18} /> Review the message
                  before sending
                </li>
                <li>
                  <Check aria-hidden="true" size={18} /> Try up to five
                  simulated sends
                </li>
              </ul>
              <div className={styles.demoNote}>
                <ShieldCheck aria-hidden="true" size={20} />
                <p>
                  This is a simulation. No resident is contacted, and no account
                  is needed to try it.
                </p>
              </div>
            </div>
            <div className={styles.demoComposer}>
              <div className={styles.staticDemo}><h3>Try a notice, from draft to delivery.</h3><p>Open the interactive demo to explore a sample audience, translation, and voice preview. No resident is contacted.</p><a className={styles.button} href={`${appOrigin}/#demo`}>Open interactive demo <ArrowRight aria-hidden="true" size={17} /></a></div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.section} ${styles.supportSection}`}
          id="support"
          aria-labelledby="support-title"
        >
          <div>
            <h2 id="support-title">
              The details matter.
              <br />
              We keep them close.
            </h2>
            <p>
              Good communication starts with knowing who you’re reaching—and
              what happens next.
            </p>
            <a className={styles.textLink} href={`${appOrigin}/knowledge-base`}>
              Explore the Help Center{" "}
              <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>
          <div className={styles.supportRows}>
            <article>
              <h3>Respect every preference.</h3>
              <p>
                Opt-outs, STOP handling, and no-call or no-text states remain
                part of the send workflow.
              </p>
            </article>
            <article>
              <h3>A workspace of your own.</h3>
              <p>
                Your organization’s contacts, team permissions, branding, and
                billing stay scoped to your workspace.
              </p>
            </article>
            <article>
              <h3>Keep a record. Find an answer.</h3>
              <p>
                Delivery history, reply threads, and support tickets give your
                team somewhere to turn when a notice needs follow-up.
              </p>
            </article>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.section} ${styles.pricingSection}`}
          id="pricing"
          aria-labelledby="pricing-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="pricing-title">A plan for every portfolio.</h2>
            <p>
              Start with the size of your operation. Adjust as your communities
              and communication needs grow.
            </p>
          </div>
          <div className={styles.plans}>
            {featuredPlans.map((plan) => {
              const definition = planCatalog[plan];
              const featured = plan === BillingPlan.GROWTH;
              return (
                <article
                  className={featured ? styles.featuredPlan : styles.plan}
                  key={plan}
                >
                  <div className={styles.planTitle}>
                    <h3>{definition.displayName}</h3>
                    {featured ? <span>Room to grow</span> : null}
                  </div>
                  <p className={styles.planDescription}>
                    {definition.description}
                  </p>
                  <p className={styles.price}>
                    {definition.monthlyPriceCents === 0
                      ? "Custom quote"
                      : formatCurrencyFromCents(definition.monthlyPriceCents)}
                    {definition.monthlyPriceCents === 0 ? null : (
                      <span> / month</span>
                    )}
                  </p>
                  <p className={styles.planLimits}>
                    {definition.propertyLimit} properties ·{" "}
                    {definition.contactLimit.toLocaleString("en-US")} contacts
                    <br />
                    {definition.smsSegmentLimit.toLocaleString("en-US")} SMS
                    segments
                  </p>
                  <a
                    className={
                      featured ? styles.button : styles.secondaryButton
                    }
                    href={`${appOrigin}/signup?plan=${plan.toLowerCase()}`}
                  >
                    Choose {definition.displayName}
                    <ArrowRight aria-hidden="true" size={16} />
                  </a>
                  <ul>
                    {definition.features.slice(0, 3).map((feature) => (
                      <li key={feature}>
                        <Check aria-hidden="true" size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <p className={styles.pricingNote}>
            Need a different fit?{" "}
            <a href={`${appOrigin}/signup`}>
              Compare all options <ArrowRight aria-hidden="true" size={14} />
            </a>
          </p>
        </section>

        <section
          className={`${styles.container} ${styles.section} ${styles.faqSection}`}
          id="faq"
          aria-labelledby="faq-title"
        >
          <div>
            <h2 id="faq-title">
              A few things
              <br />
              you might wonder.
            </h2>
            <a className={styles.textLink} href={`${appOrigin}/knowledge-base`}>
              More in the Help Center{" "}
              <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <ChevronDown aria-hidden="true" size={18} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <div className={styles.container}>
            <h2 id="closing-title">
              A little more clarity.
              <br />A lot more connection.
            </h2>
            <p>Give your team a calmer way to keep residents informed.</p>
            <a className={styles.button} href={`${appOrigin}/signup`}>
              Start beta setup <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <a aria-label="TenantReach home" href="/">
              <TenantReachLogo />
            </a>
            <p>
              Property communication.
              <br />
              Considered from every side.
            </p>
            <a
              className={styles.textLink}
              href={`${appOrigin}/login`}
            >
              {session ? "Open dashboard" : "Existing customer login"}
              <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
          <div className={styles.footerBottom}>
            <p>
              &copy; {new Date().getFullYear()} {COMPANY_NAME}
            </p>
            <nav aria-label="Legal" className={styles.legalLinks}><a href={`${appOrigin}/privacy`}>Privacy Policy</a><a href={`${appOrigin}/terms`}>Terms and Conditions</a><a href="https://mercurionlabs.com">Mercurion Labs, LLC</a></nav>
          </div>
        </div>
      </footer>
      <a className={styles.feedbackLink} href={`${appOrigin}/#demo`}>Try the demo</a>
    </div>
  );
}

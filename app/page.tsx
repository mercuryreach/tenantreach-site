import type { Metadata, Viewport } from "next";
import Image, { getImageProps } from "next/image";
import localFont from "next/font/local";
const BillingPlan = { STARTER: "STARTER", GROWTH: "GROWTH", PORTFOLIO: "PORTFOLIO" } as const;
import {
  ArrowRight,
  ArrowUpRight,
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
const appOrigin = "https://tenantreach.app";
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
  "Message tenants with Tenant Assist AI, automatically categorize messages, and keep texts, calls, and replies together in TenantReach.";

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
  ["#reachassist", "Tenant Assist"],
  ["#pricing", "Plans"],
  ["#faq", "Questions"],
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
    text: "Draft your notice in English and choose text, voice, or both. Growth and Portfolio include live Spanish translation preview. Review the audience before you send.",
  },
  {
    icon: MessageSquare,
    title: "Keep the conversation going.",
    text: "Schedule routine updates or send a notice now. Follow delivery history and manage replies without losing the original message.",
  },
];

const faqItems = [
  {
    question: "Can I talk to Tenant Assist to message tenants?",
    answer:
      "Yes. Tell Tenant Assist who you want to reach and what you want to say. Tenant Assist AI helps prepare your message, so you can review the audience and wording before sending.",
  },
  {
    question: "How does Automatic Message Categorization help?",
    answer:
      "When Automatic Message Categorization is enabled for your workspace, incoming messages are organized by category, helping your team find conversations that need attention and keep track of follow-up.",
  },
  {
    question: "What kinds of notices can I send?",
    answer:
      "Use text, voice, or both for maintenance updates, inspections, rent reminders, urgent property notices, and everyday community news.",
  },
  {
    question: "Which plans include Spanish translation preview?",
    answer:
      "Growth and Portfolio include live Spanish translation preview. English and Spanish delivery is included from Starter. You can try translation in the account-free demo before choosing a plan.",
  },
  {
    question: "Can this stay simple for non-technical staff?",
    answer:
      "Yes. Simple mode keeps the audience, message, and send decision in focus. Additional options are available when your team needs them.",
  },
  {
    question: "Will live texting or calling turn on immediately?",
    answer:
      "No. Setup and rehearsal stay separate from live launch. Your team can review the workflow before real texts or calls are enabled. The public demo is simulated and does not contact residents.",
  },
  {
    question: "Can I manage more than one property?",
    answer:
      "Yes. Organize contacts and notices by property within your workspace. Choose a plan that fits your portfolio, with workspace permissions and contact preferences carried through the workflow.",
  },
];

const featureComparison = [
  { label: "Live Spanish translation preview", availability: [false, true, true] },
  { label: "Your workspace branding", availability: [false, true, true] },
  { label: "Priority setup support", availability: [false, false, true] },
  { label: "Data exports and API access", availability: [false, false, true] },
  { label: "Detailed reporting", availability: [false, false, true] },
] as const;

function TenantReachLogo() {
  const { props: darkLogo } = getImageProps({
    src: "/brand/tenantreach/wordmark-dark.webp",
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
        src="/brand/tenantreach/wordmark-light.webp"
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
            <a className={styles.secondaryButton} href={`${appOrigin}/demo#demo`}>
              Try the demo{" "}
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>
          <p className={styles.heroNote}>
            Demo and setup open in the TenantReach app.
            <br />Try the demo without an account. No resident is contacted.
          </p>
        </section>

        <section
          className={styles.container}
          id="walkthrough"
          aria-label="Application walkthrough"
        >
          <figure className={styles.preview}>
            <div className={styles.previewBar}>
              <span id="walkthrough-title">See TenantReach and Tenant Assist in action.</span>
              <span>40-second walkthrough</span>
            </div>
            <video
              className={`${styles.walkthroughVideo} ${styles.previewVideo}`}
              controls
              playsInline
              preload="none"
              poster="/media/walkthrough-poster.jpg"
              aria-labelledby="walkthrough-title"
            >
              <source src="/media/tenantreach-reachassist-walkthrough.mp4" type="video/mp4" />
              <track kind="captions" src="/media/walkthrough-captions.vtt" srcLang="en" label="English" default />
              Your browser does not support embedded video. <a href="/media/tenantreach-reachassist-walkthrough.mp4">Download the walkthrough</a>.
            </video>
            <figcaption>
              <span>
                Application walkthrough with sample data. No tenant is contacted.
              </span>
              <a href="/media/tenantreach-reachassist-walkthrough.mp4" download>
                Download walkthrough <ArrowRight aria-hidden="true" size={14} />
              </a>
            </figcaption>
          </figure>
          <details className={styles.walkthroughTranscript}>
            <summary>Read the walkthrough transcript <ChevronDown aria-hidden="true" size={17} /></summary>
            <ol>
              <li>Meet TenantReach. Tenant communication, in one workspace.</li>
              <li>Choose the right people and property for every notice.</li>
              <li>Draft your message, with your audience in view.</li>
              <li>Keep incoming texts organized by topic with Automatic Message Categorization.</li>
              <li>With Tenant Assist, describe the notice you want to prepare.</li>
              <li>Review the message and recipients. You confirm before anything is sent.</li>
              <li>From intent to notice. You stay in control. TenantReach dot net.</li>
            </ol>
          </details>
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
            <span>
              <MessageSquare aria-hidden="true" size={18} /> Automatic Message Categorization
            </span>
            <span>
              <MessageSquare aria-hidden="true" size={18} /> Tenant Assist AI
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
          className={`${styles.container} ${styles.section}`}
          id="reachassist"
          aria-labelledby="reachassist-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="reachassist-title">Talk to Tenant Assist.<br />Message your tenants.</h2>
            <p>
              Tell Tenant Assist AI who you want to reach and what you want to say.
              Prepare a notice in conversation, then review your audience and
              message before sending.
            </p>
          </div>
          <figure className={`${styles.preview} ${styles.assistScreenshot}`}>
            <Image
              src="/media/reachassist-workspace.png"
              alt="Tenant Assist preparing a tenant notice inside the application, with a conversation and a draft ready for review in a sample workspace."
              width={1440}
              height={900}
              sizes="(max-width: 760px) 100vw, 1120px"
            />
            <figcaption>
              Tenant Assist application preview · synthetic demo workspace.
              <a href="/media/reachassist-workspace.png" target="_blank" rel="noopener noreferrer">View full-size Tenant Assist screenshot <ArrowUpRight aria-hidden="true" size={14} /></a>
            </figcaption>
          </figure>
          <p className={styles.walkthrough}>
            <a className={styles.textLink} href="#walkthrough">Watch the 40-second walkthrough <ArrowRight aria-hidden="true" size={17} /></a>
          </p>
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
                Start with a familiar maintenance update. In the demo, write
                your own notice, preview the Spanish translation, and hear it read aloud.
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
                  The demo opens in the TenantReach app.
                  It is a simulation: no resident is contacted and no account is needed.
                </p>
              </div>
              <a className={styles.button} href={`${appOrigin}/demo#demo`}>
                Try the demo <ArrowUpRight aria-hidden="true" size={17} />
              </a>
            </div>
            <div className={styles.sampleNotice} aria-label="Sample bilingual notice">
              <div className={styles.sampleHeading}>
                <h3>One notice.<br /><span>Two languages.</span></h3>
                <Languages aria-hidden="true" size={28} strokeWidth={1.3} />
              </div>
              <div className={styles.noticeFlow}>
                <span className={styles.noticeConnection} aria-hidden="true" />
                <article>
                  <h4>English notice</h4>
                  <p>Water will be off at Maple Gardens on Friday from 10 AM to 2 PM for a line repair. Thank you for your patience.</p>
                </article>
                <article lang="es">
                  <h4>Aviso en español</h4>
                  <p>Se cortará el agua en Maple Gardens el viernes de 10 a. m. a 2 p. m. para reparar una tubería. Gracias por su paciencia.</p>
                </article>
              </div>
              <p className={styles.sampleCaption}>Illustrative message · sample property · nothing sent</p>
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
              Every preference.
              <br />
              Every reply. In view.
            </h2>
            <p>
              Keep contact preferences, delivery history, and follow-up
              close to the people and properties they belong to.
            </p>
            <a className={styles.textLink} href={`${appOrigin}/knowledge-base`}>
              Explore the Help Center{" "}
              <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>
          <div className={styles.supportRows}>
            <article>
              <h3>Automatic Message Categorization</h3>
              <p>
                With Automatic Message Categorization enabled, incoming messages are organized by category,
                so your team can find conversations that need attention and
                keep follow-up moving.
              </p>
            </article>
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
              Match your properties, resident list, and monthly text and voice
              usage. Compare every allowance before you choose.
            </p>
          </div>
          <dl className={styles.priceOverview} aria-label="Monthly plan prices">
            {featuredPlans.map(plan => <div key={plan}>
              <dt>{planCatalog[plan].displayName}</dt>
              <dd>{formatCurrencyFromCents(planCatalog[plan].monthlyPriceCents)} <span>/ mo</span></dd>
            </div>)}
          </dl>
          <div className={styles.usageHelp}>
            <p><strong>What is an SMS segment?</strong> A text is billed in parts called segments. Long messages and some characters can use more than one segment per recipient. Calls use voice minutes.</p>
            <p>All three plans include English and Spanish delivery. Growth and Portfolio add live translation preview.</p>
            <p>Prices are in USD. These are monthly allowances; usage beyond them has the rates below. Review your selected plan during setup.</p>
            <p><strong>Resident replies and team access.</strong> Shared Inbox is an optional add-on available on every plan, enabled separately from your subscription. Once enabled, teammates with inbox permissions can view and reply to resident messages; property managers see their assigned properties. Confirm add-on pricing during setup.</p>
          </div>
          <details className={styles.planComparison}>
            <summary>Compare every allowance <ChevronDown aria-hidden="true" size={18} /></summary>
            <div className={styles.comparisonScroll} role="region" aria-label="Monthly plan comparison" tabIndex={0}>
              <table>
                <caption>Monthly plan allowances and additional usage rates</caption>
                <thead><tr><th scope="col">Plan details</th>{featuredPlans.map(plan => <th scope="col" key={plan}>{planCatalog[plan].displayName}</th>)}</tr></thead>
                <tbody>
                  <tr><th scope="row">Monthly price (USD)</th>{featuredPlans.map(plan => <td key={plan}>{formatCurrencyFromCents(planCatalog[plan].monthlyPriceCents)}</td>)}</tr>
                  <tr><th scope="row">Properties</th>{featuredPlans.map(plan => <td key={plan}>{planCatalog[plan].propertyLimit}</td>)}</tr>
                  <tr><th scope="row">Contacts</th>{featuredPlans.map(plan => <td key={plan}>{planCatalog[plan].contactLimit.toLocaleString("en-US")}</td>)}</tr>
                  <tr><th scope="row">Team members</th>{featuredPlans.map(plan => <td key={plan}>{planCatalog[plan].teamMemberLimit}</td>)}</tr>
                  <tr><th scope="row">SMS segments</th>{featuredPlans.map(plan => <td key={plan}>{planCatalog[plan].smsSegmentLimit.toLocaleString("en-US")}</td>)}</tr>
                  <tr><th scope="row">Voice minutes</th>{featuredPlans.map(plan => <td key={plan}>{planCatalog[plan].voiceMinuteLimit.toLocaleString("en-US")}</td>)}</tr>
                  <tr><th scope="row">Per extra SMS segment</th>{featuredPlans.map(plan => <td key={plan}>${(planCatalog[plan].overageSmsSegmentPriceCents / 100).toFixed(2)}</td>)}</tr>
                  <tr><th scope="row">Per extra voice minute</th>{featuredPlans.map(plan => <td key={plan}>${(planCatalog[plan].overageVoiceMinutePriceCents / 100).toFixed(2)}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </details>
          <details className={styles.planComparison}>
            <summary>Compare included features <ChevronDown aria-hidden="true" size={18} /></summary>
            <p className={styles.featureHelp}>Every plan includes resident texts, voice calls, and English and Spanish delivery. Shared Inbox is enabled separately, as described above.</p>
            <div className={styles.comparisonScroll} role="region" aria-label="Plan feature comparison" tabIndex={0}>
              <table>
                <caption>Features included in each plan</caption>
                <thead><tr><th scope="col">Feature</th>{featuredPlans.map(plan => <th scope="col" key={plan}>{planCatalog[plan].displayName}<span className={styles.comparisonPrice}>{formatCurrencyFromCents(planCatalog[plan].monthlyPriceCents)} / mo</span></th>)}</tr></thead>
                <tbody>
                  {featureComparison.map(feature => <tr key={feature.label}><th scope="row">{feature.label}</th>{feature.availability.map((included, index) => <td key={featuredPlans[index]}>{included ? "Included" : "Not included"}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
            <p className={styles.featureHelp}>Workspace branding lets your team use its own identity. Data exports provide downloadable records; API access connects data with your team’s software.</p>
          </details>
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
                    segments / month
                    <br />
                    {definition.voiceMinuteLimit.toLocaleString("en-US")} voice minutes / month
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
                    {definition.features.map((feature) => (
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
            Need more properties, contacts, or team members?{" "}
            <a href={`${appOrigin}/signup?plan=enterprise`}>
              Explore Enterprise setup <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          </p>
          <p className={styles.handoffNote}>Plan selection opens TenantReach account setup. Live delivery is enabled separately.</p>
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
              Make your next
              <br />resident update clearer.
            </h2>
            <p>Give your team a calmer way to keep residents informed.</p>
            <a className={styles.button} href={`${appOrigin}/signup`}>
              Start beta setup <ArrowRight aria-hidden="true" size={17} />
            </a>
            <p className={styles.handoffNote}>Continue in TenantReach to set up your workspace. Rehearse before enabling live texts or calls.</p>
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
    </div>
  );
}

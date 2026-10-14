const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");

const siteUrl = process.env.SITE_URL || "http://127.0.0.1:3115/";
const artifactDir = process.env.SITE_ARTIFACT_DIR || path.join(__dirname, ".checks");
const variants = [
  { name: "desktop-light", width: 1440, height: 1000, colorScheme: "light" },
  { name: "desktop-dark", width: 1440, height: 1000, colorScheme: "dark" },
  { name: "mobile-light", width: 390, height: 844, colorScheme: "light", isMobile: true },
  { name: "mobile-dark", width: 390, height: 844, colorScheme: "dark", isMobile: true },
  { name: "narrow-light", width: 320, height: 740, colorScheme: "light", isMobile: true },
  { name: "narrow-dark", width: 320, height: 740, colorScheme: "dark", isMobile: true },
];
const ignoredDevConsoleErrors = [/WebSocket connection to .*\/_next\/hmr.*ERR_INVALID_HTTP_RESPONSE/];

function messageList(label, values) {
  return `${label}:\n${values.join("\n")}`;
}

async function visibleText(page) {
  return page.locator("main").innerText();
}

async function assertLocalGeist(page) {
  const fontState = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      families: Array.from(document.fonts, (face) => face.family),
      mainFont: getComputedStyle(document.querySelector("main")).fontFamily,
    };
  });

  expect(
    fontState.families.some((family) => /geist/i.test(family)),
    `Expected a locally loaded Geist face; found ${fontState.families.join(", ")}`,
  ).toBe(true);
  expect(fontState.mainFont).toMatch(/geist/i);
}

async function assertNoVisualOverflowOrBrokenAssets(page) {
  const viewportHealth = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth > window.innerWidth,
    bodyOverflow: document.body.scrollWidth > window.innerWidth,
  }));
  const images = page.locator("img");
  const imageCount = await images.count();

  for (let index = 0; index < imageCount; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
  }

  const brokenImages = await images.evaluateAll((nodes) =>
    nodes
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  );

  expect(viewportHealth, "The page must not overflow horizontally.").toEqual({
    documentOverflow: false,
    bodyOverflow: false,
  });
  expect(brokenImages, messageList("Broken images", brokenImages)).toEqual([]);
}

async function runAxe(page) {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => {
    const result = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.html),
    }));
  });

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  return violations;
}

async function assertThemeChangesWithoutReload(page) {
  let navigationCount = 0;
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigationCount += 1;
  });

  const logo = page.getByRole("img", { name: "TenantReach" }).first();
  await logo.scrollIntoViewIfNeeded();
  for (const scheme of ["light", "dark", "light"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.waitForFunction(
      (expected) => getComputedStyle(document.querySelector("main")).colorScheme === expected,
      scheme,
    );
    await expect(logo).toBeVisible();
    await expect.poll(() => logo.evaluate((image) => image.currentSrc), {
      message: `TenantReach logo did not update for ${scheme} mode.`,
    }).toMatch(
      scheme === "dark" ? /wordmark-dark/i : /wordmark-light/i,
    );
  }

  expect(navigationCount, "Changing the system color scheme must not reload the page.").toBe(0);
}

async function assertKeyboardDisclosureBehavior(page, isMobile) {
  const faq = page.locator("summary").filter({ hasText: "What kinds of notices can I send?" });
  const faqDetails = faq.locator("..");
  await faq.focus();
  await expect(faq).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(faqDetails).toHaveJSProperty("open", true);
  await expect(
    page.getByText(
      "Use text, voice, or both for maintenance updates, inspections, rent reminders, urgent property notices, and everyday community news.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.keyboard.press("Space");
  await expect(faqDetails).toHaveJSProperty("open", false);

  const translationFaq = page
    .locator("summary")
    .filter({ hasText: "Which plans include Spanish translation preview?" });
  await expect(translationFaq).toBeVisible();

  if (isMobile) {
    const menu = page.locator("summary").filter({ hasText: "Explore TenantReach" });
    const menuDetails = menu.locator("..");
    await menu.focus();
    await expect(menu).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menuDetails).toHaveJSProperty("open", true);
    await expect(page.getByRole("navigation", { name: "Mobile section navigation" })).toBeVisible();
    await page.keyboard.press("Space");
    await expect(menuDetails).toHaveJSProperty("open", false);
  }
}

async function assertSectionNavigation(page, isMobile) {
  const navigation = isMobile
    ? page.getByRole("navigation", { name: "Mobile section navigation" })
    : page.getByRole("navigation", { name: "Public navigation" });
  const sections = [
    ["#demo", "Demo"],
    ["#workflow", "How it works"],
    ["#reachassist", "ReachAssist"],
    ["#pricing", "Plans"],
    ["#faq", "Questions"],
  ];
  let previousLink;

  if (isMobile) {
    const menu = page.locator("summary").filter({ hasText: "Explore TenantReach" });
    const menuDetails = menu.locator("..");
    await expect(menuDetails).toHaveJSProperty("open", false);
    await menu.click();
    await expect(menuDetails).toHaveJSProperty("open", true);
  }

  await expect(navigation).toBeVisible();
  for (const [href, label] of sections) {
    const link = navigation.getByRole("link", { name: label, exact: true });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href.replace("#", "\\#")}$`));
    await page.mouse.move(0, 0);
    expect(await link.evaluate((node) => node.matches(":hover")), `The pointer must be away from ${label}.`).toBe(false);
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    if (previousLink) {
      await expect(previousLink).toHaveCSS("text-decoration-line", "none");
    }
    previousLink = link;
  }

  if (isMobile) {
    const menu = page.locator("summary").filter({ hasText: "Explore TenantReach" });
    const menuDetails = menu.locator("..");
    await menu.click();
    await expect(menuDetails).toHaveJSProperty("open", false);
  }
}

async function assertReleaseCopyAndLinks(page) {
  const assist = page.getByRole("region", { name: "Talk to ReachAssist. Message your tenants." });
  await expect(assist).toBeVisible();
  await expect(assist.getByRole("img", { name: /ReachAssist preparing a tenant notice/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Automatic Message Categorization", exact: true })).toBeVisible();
  const video = assist.locator("video");
  await expect(video).toHaveAttribute("controls", "");
  await expect(video).not.toHaveAttribute("autoplay", "");
  await video.evaluate((node) => node.load());
  await expect.poll(() => video.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2);
  expect(await video.evaluate((node) => node.duration)).toBeCloseTo(40, 0);
  await video.evaluate((node) => node.play());
  await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await video.evaluate((node) => node.pause());
  const transcript = assist.locator("summary").filter({ hasText: "Read the walkthrough transcript" });
  await transcript.focus();
  await page.keyboard.press("Enter");
  await expect(transcript.locator("..")).toHaveJSProperty("open", true);
  await expect(transcript.locator("..").getByRole("list")).toContainText("Review the draft before sending");
  await page.keyboard.press("Enter");
  await expect(transcript.locator("..")).toHaveJSProperty("open", false);
  await expect(page.getByRole("link", { name: /try the demo/i }).first()).toHaveAttribute(
    "href",
    "https://mercuryreach.net/#demo",
  );

  const copy = await visibleText(page);
  expect(copy).toMatch(/demo and setup[\s\S]{0,100}MercuryReach[\s\S]{0,100}existing application/i);

  const preview = page.getByRole("link", { name: /full[- ]size(?: workspace)? preview/i });
  await expect(preview).toHaveAttribute("href", "/brand/tenantreach/workspace-preview.png");
  await expect(preview).toHaveAttribute("target", "_blank");
  const popupPromise = page.waitForEvent("popup");
  await preview.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  expect(new URL(popup.url()).pathname).toBe("/brand/tenantreach/workspace-preview.png");
  await popup.close();
}

async function assertPlanAllowanceDisclosure(page) {
  const pricing = page.locator("#pricing");
  const usageExplanation = pricing.getByText("What is an SMS segment?", { exact: false }).first();
  const priceOverview = pricing.getByLabel("Monthly plan prices", { exact: true });
  const sharedInboxDisclosure = pricing.getByText(
    "Shared Inbox is an optional add-on available on every plan, enabled separately from your subscription.",
    { exact: false },
  );
  const allowanceSummary = pricing.locator("summary").filter({ hasText: "Compare every allowance" });
  const allowanceDetails = allowanceSummary.locator("..");
  const firstChooseLink = pricing.getByRole("link", { name: /^Choose / }).first();
  await expect(usageExplanation).toBeVisible();
  await expect(priceOverview).toBeVisible();
  await expect(priceOverview).toContainText("Starter");
  await expect(priceOverview).toContainText("$149");
  await expect(priceOverview).toContainText("Growth");
  await expect(priceOverview).toContainText("$349");
  await expect(priceOverview).toContainText("Portfolio");
  await expect(priceOverview).toContainText("$899");
  await expect(sharedInboxDisclosure).toBeVisible();
  await expect(sharedInboxDisclosure).toContainText(/teammates with inbox permissions can view and reply/i);
  await expect(sharedInboxDisclosure).toContainText(/property managers see their assigned properties/i);
  await expect(allowanceSummary).toBeVisible();
  await expect(firstChooseLink).toBeVisible();
  await assertPrecedes(priceOverview, usageExplanation, "The monthly price overview must precede the SMS explanation.");
  await assertPrecedes(usageExplanation, firstChooseLink, "The usage explanation must precede the plan choices.");
  await assertPrecedes(allowanceDetails, firstChooseLink, "The allowance comparison must precede the plan choices.");
  await assertPrecedes(sharedInboxDisclosure, firstChooseLink, "The Shared Inbox disclosure must precede the plan choices.");
  await expect(allowanceDetails).toHaveJSProperty("open", false);
  await allowanceSummary.focus();
  await page.keyboard.press("Enter");
  await expect(allowanceDetails).toHaveJSProperty("open", true);

  const table = allowanceDetails.getByRole("table");
  await expect(table).toBeVisible();
  await expect(table).toContainText("Monthly plan allowances and additional usage rates");
  await expect(table).toContainText("SMS segments");
  await expect(table).toContainText("Voice minutes");
  await expect(table).toContainText("Per extra SMS segment");
  await expect(table).toContainText("Per extra voice minute");
  await expect(pricing).toContainText(/SMS segment[\s\S]*(message|text|part|character|unit)/i);

  for (const [plan, price] of [["Starter", "$149"], ["Growth", "$349"], ["Portfolio", "$899"]]) {
    const planCard = pricing.getByRole("article").filter({
      has: page.getByRole("heading", { name: plan, exact: true }),
    });
    await expect(planCard).toContainText(price);
    await expect(table.getByRole("row", { name: /Monthly price \(USD\)/ })).toContainText(price);
  }

  const featureSummary = pricing.locator("summary").filter({ hasText: "Compare included features" });
  const featureDetails = featureSummary.locator("..");
  await expect(featureSummary).toBeVisible();
  await expect(featureDetails).toHaveJSProperty("open", false);
  await featureSummary.focus();
  await page.keyboard.press("Enter");
  await expect(featureDetails).toHaveJSProperty("open", true);

  const featureTable = featureDetails.getByRole("table", { name: "Features included in each plan" });
  await expect(featureTable).toBeVisible();
  await expect(featureTable).toContainText("Included");
  await expect(featureTable).toContainText("Not included");
  for (const plan of ["Starter", "Growth", "Portfolio"]) {
    await expect(featureTable.getByRole("columnheader", { name: new RegExp(`^${plan}`) })).toBeVisible();
  }
  const translationRow = featureTable.getByRole("row", { name: /Spanish translation preview/ });
  await expect(translationRow).toContainText("Not included");
  await expect(translationRow).toContainText("Included");
}

async function assertPrecedes(first, second, message) {
  const secondHandle = await second.elementHandle();
  if (!secondHandle) throw new Error("Expected the later element to exist.");
  try {
    const precedes = await first.evaluate(
      (node, laterNode) => Boolean(node.compareDocumentPosition(laterNode) & Node.DOCUMENT_POSITION_FOLLOWING),
      secondHandle,
    );
    expect(precedes, message).toBe(true);
  } finally {
    await secondHandle.dispose();
  }
}

async function captureNoticeScreenshots(page, colorScheme) {
  await page.getByRole("region", { name: /Every resident\. One clear message\./ }).screenshot({
    path: path.join(artifactDir, `hero-${colorScheme}.png`),
  });
  await page.locator("#demo").screenshot({ path: path.join(artifactDir, `demo-section-${colorScheme}.png`) });
}

async function assertMobilePreviewDetail(page) {
  const detail = page.getByLabel("Workspace reply detail");
  await expect(detail).toBeVisible();
  for (const text of ["Jamie Ellis", "Lakeside Park", "Unit 204", /Water under (?:the )?kitchen sink/i, "Waiting for your reply"]) {
    await expect(detail).toContainText(text);
  }
}

async function assertNoticeConnectorIsDecorative(page) {
  const notice = page.getByLabel("Sample bilingual notice");
  await expect(notice).toBeVisible();
  const hiddenChildCount = await notice.locator('[aria-hidden="true"]').count();
  expect(hiddenChildCount, "The decorative notice connector must be hidden from assistive technology.").toBeGreaterThan(0);
}

async function assertReducedMotion(browser) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  try {
    await page.goto(siteUrl, { waitUntil: "networkidle" });
    await expect(page.getByRole("main")).toBeVisible();
    await assertNoticeConnectorIsDecorative(page);
    const visibleRunningAnimations = await page.locator("main").evaluate((main) =>
      main
        .getAnimations({ subtree: true })
        .filter((animation) => {
          const target = animation.effect?.target;
          const element = target instanceof Element ? target : target?.parentElement;
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          return animation.playState === "running" && rect.width > 0 && rect.height > 0;
        })
        .map((animation) => animation.animationName || animation.id || animation.playState),
    );
    expect(visibleRunningAnimations, "Reduced motion must stop visible decorative animations.").toEqual([]);
    return { reducedMotion: true, visibleRunningAnimations };
  } finally {
    await page.close();
  }
}

async function assertNoJavaScriptFallback(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "light",
    isMobile: true,
    hasTouch: true,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  try {
    await page.goto(siteUrl, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "English notice", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aviso en español", exact: true })).toBeVisible();
    await assertNoticeConnectorIsDecorative(page);
    await assertKeyboardDisclosureBehavior(page, false);
    await assertPlanAllowanceDisclosure(page);
    return { noJavaScript: true };
  } finally {
    await context.close();
  }
}

async function assertFooterIsNotCovered(page) {
  const fixedDemoCtas = await page.locator("a, button").evaluateAll((controls) =>
    controls
      .filter((control) => /try the demo/i.test(control.textContent || ""))
      .filter((control) => getComputedStyle(control).position === "fixed")
      .map((control) => control.outerHTML),
  );
  expect(fixedDemoCtas, "The landing page must not keep a fixed Try the demo CTA.").toEqual([]);

  const companyLink = page.getByRole("link", { name: /mercurion labs/i });
  await companyLink.scrollIntoViewIfNeeded();
  await expect(companyLink).toBeVisible();
  const covered = await companyLink.evaluate((link) => {
    const rect = link.getBoundingClientRect();
    const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return Boolean(target && target !== link && !link.contains(target) && !target.contains(link));
  });
  expect(covered, "The footer company link is covered by another control.").toBe(false);
}

async function checkVariant(browser, variant) {
  const page = await browser.newPage({
    viewport: { width: variant.width, height: variant.height },
    colorScheme: variant.colorScheme,
    isMobile: Boolean(variant.isMobile),
    hasTouch: Boolean(variant.isMobile),
  });
  const pageErrors = [];
  const consoleErrors = [];
  const failedResponses = [];
  const failedRequests = [];
  const expectedMediaCancellations = [];
  const fontRequests = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !ignoredDevConsoleErrors.some((pattern) => pattern.test(message.text()))
    ) {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText || "failed";
    // Chromium can cancel an MP4 byte-range request after loading or pausing.
    // Playback and duration are asserted separately; HTTP and other failures still fail.
    if (failure === "net::ERR_ABORTED" && request.resourceType() === "media"
      && new URL(request.url()).pathname === "/media/tenantreach-reachassist-walkthrough.mp4") {
      expectedMediaCancellations.push(request.url());
      return;
    }
    failedRequests.push(`${failure} ${request.url()}`);
  });
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });

  try {
    await page.goto(siteUrl, { waitUntil: "networkidle" });
    await expect(page.getByRole("main")).toBeVisible();
    await assertNoticeConnectorIsDecorative(page);
    await assertLocalGeist(page);
    expect(fontRequests.every((url) => new URL(url).origin === new URL(siteUrl).origin)).toBe(true);
    await assertNoVisualOverflowOrBrokenAssets(page);
    await assertSectionNavigation(page, Boolean(variant.isMobile));

    if (variant.name === "desktop-light") {
      await assertThemeChangesWithoutReload(page);
      await assertReleaseCopyAndLinks(page);
      await assertPlanAllowanceDisclosure(page);
      await assertFooterIsNotCovered(page);
      await captureNoticeScreenshots(page, "light");
    } else if (variant.name === "desktop-dark") {
      await captureNoticeScreenshots(page, "dark");
    }

    if (variant.isMobile) {
      await assertMobilePreviewDetail(page);
    }

    if (variant.isMobile && variant.colorScheme === "light") {
      await assertKeyboardDisclosureBehavior(page, true);
    } else if (variant.name === "desktop-dark") {
      await assertKeyboardDisclosureBehavior(page, false);
    }

    const violations = await runAxe(page);
    if (variant.isMobile) {
      await page.getByRole("region", { name: "Workspace design preview" }).screenshot({
        path: path.join(artifactDir, `${variant.name}-preview.png`),
      });
    }
    await page.screenshot({ path: path.join(artifactDir, `${variant.name}.png`), fullPage: true });
    expect(pageErrors, messageList("Uncaught page errors", pageErrors)).toEqual([]);
    expect(consoleErrors, messageList("Console errors", consoleErrors)).toEqual([]);
    expect(failedResponses, messageList("Failed responses", failedResponses)).toEqual([]);
    expect(failedRequests, messageList("Failed requests", failedRequests)).toEqual([]);
    return { variant: variant.name, violations, mediaRangeCancellations: expectedMediaCancellations.length };
  } finally {
    await page.close();
  }
}

(async () => {
  await fs.mkdir(artifactDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    const results = [];
    for (const variant of variants) results.push(await checkVariant(browser, variant));
    const specialModes = [await assertReducedMotion(browser), await assertNoJavaScriptFallback(browser)];
    const evidence = { variants: results, specialModes };
    await fs.writeFile(path.join(artifactDir, "results.json"), JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify({
      variants: results.map(({ variant, violations }) => ({ variant, violations: violations.length })),
      specialModes,
    }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

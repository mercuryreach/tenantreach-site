const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch();
 const results = [];
 for (const variant of [{name:'desktop',width:1440,height:1000,colorScheme:'light'}, {name:'mobile',width:390,height:844,colorScheme:'light'}, {name:'dark',width:1440,height:1000,colorScheme:'dark'}]) {
  const page = await browser.newPage({viewport:variant, colorScheme:variant.colorScheme});
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:3115/', {waitUntil:'networkidle'});
  await expect(page.getByRole('heading', {level:1})).toHaveText('Every resident.One clear message.');
  await expect(page.getByRole('link', {name:'Log in',exact:true})).toHaveAttribute('href', 'https://mercuryreach.net/login');
  await expect(page.getByRole('link', {name:'Choose Growth'})).toHaveAttribute('href', 'https://mercuryreach.net/signup?plan=growth');
  await expect(page.getByRole('link', {name:'Open interactive demo'})).toHaveAttribute('href', 'https://mercuryreach.net/#demo');
  const question = page.getByText('What kinds of notices can I send?', {exact:true});
  await question.click();
  await expect(page.getByText('Use text, voice, or both for maintenance updates, inspections, rent reminders, urgent property notices, and everyday community news.', {exact:true})).toBeVisible();
  if (variant.name === 'mobile') {
   await page.getByText('Explore TenantReach', {exact:true}).click();
   await expect(page.getByRole('navigation', {name:'Mobile section navigation'})).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const brokenImages = await page.locator('img').evaluateAll(imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i=>i.src));
  const localRoutes = await page.locator('a[href]').evaluateAll(as => as.map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/') && h!=='/'));
  expect(overflow).toBe(false); expect(brokenImages).toEqual([]); expect(localRoutes).toEqual([]); expect(errors).toEqual([]); expect(failed).toEqual([]);
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const violations = await page.evaluate(async () => (await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(({id,impact})=>({id,impact})));
  expect(violations).toEqual([]);
  await page.screenshot({path:path.join(__dirname, '..', `tenantreach-pages-${variant.name}.png`),fullPage:true});
  results.push({variant:variant.name, errors,failed,overflow,brokenImages,violations});
  await page.close();
 }
 await browser.close();
 await fs.writeFile(path.join(__dirname, '..', 'tenantreach-pages-checks.json'), JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
})().catch(e => { console.error(e); process.exit(1); });

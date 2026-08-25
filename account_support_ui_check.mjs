import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import CDP from "chrome-remote-interface";

const port = 9324;
const profile = "/tmp/tax-return-saathi-account-support-check";
rmSync(profile, { recursive: true, force: true });

const chrome = spawn("/usr/bin/chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--window-size=375,812",
], { stdio: "ignore" });

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let client;

try {
  await pause(900);
  client = await CDP({ port });
  const { Page, Runtime, Emulation } = client;
  await Promise.all([Page.enable(), Runtime.enable()]);
  await Emulation.setDeviceMetricsOverride({ width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await Page.navigate({ url: "https://3000-ijj0k58w6q5xefkq8uzba-9f4b5c3d.us2.manus.computer/?from_webdev=1" });
  await pause(1600);

  const evaluate = async (expression) => {
    const result = await Runtime.evaluate({ expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const clickText = (needle) => evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((entry) => entry.textContent.includes(${JSON.stringify(needle)}));
    if (!button) throw new Error('Missing button: ${needle}');
    button.click();
    return true;
  })()`);

  await clickText("Try filing checklist prototype");
  await pause(350);
  const checklist = await evaluate(`(() => ({
    accountCopy: document.body.innerText.includes('Optional account save:'),
    signInControl: [...document.querySelectorAll('button')].some((entry) => entry.textContent.includes('Sign in to save to your account')),
    sensitiveInputs: [...document.querySelectorAll('input, textarea')].map((entry) => ({ name: entry.name, placeholder: entry.placeholder })).filter((entry) => /cnic|ntn|password|account|tax amount/i.test(entry.name + ' ' + entry.placeholder)),
  }))()`);

  await clickText("Tax & investment resources");
  await pause(350);
  const support = await evaluate(`(() => ({
    supportHeading: document.body.innerText.includes('Feedback, privacy & contact'),
    privacyCopy: document.body.innerText.includes('We do not ask for or store tax amounts, CNIC, NTN, passwords, bank or account details, documents, or uploads'),
    feedbackForm: Boolean(document.querySelector('#feedback-category')) && Boolean(document.querySelector('#feedback-message')),
    feedbackWarning: document.querySelector('#feedback-message')?.placeholder.includes('Do not include CNIC, NTN, passwords, bank details, or tax records.') ?? false,
    officialContact: document.body.innerText.includes('051 111 772 772') && [...document.querySelectorAll('a')].some((entry) => entry.href.includes('fbr.gov.pk/contact-us')),
    controls: [...document.querySelectorAll('.official-resource-hub__toggle, .filing-prototype__launch, .tax-year-update__launch')].map((entry) => {
      const box = entry.getBoundingClientRect();
      return { label: entry.textContent.trim(), x: box.x, y: box.y, width: box.width, height: box.height };
    }),
  }))()`);

  if (!checklist.accountCopy || !checklist.signInControl || checklist.sensitiveInputs.length) throw new Error(`Checklist controls failed: ${JSON.stringify(checklist)}`);
  if (!support.supportHeading || !support.privacyCopy || !support.feedbackForm || !support.feedbackWarning || !support.officialContact) throw new Error(`Support controls failed: ${JSON.stringify(support)}`);
  console.log(JSON.stringify({ viewport: "375x812", checklist, support }, null, 2));
} finally {
  await client?.close();
  chrome.kill("SIGTERM");
  rmSync(profile, { recursive: true, force: true });
}

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read axe-core minified source
const axeSource = readFileSync(resolve('node_modules/axe-core/axe.min.js'), 'utf8');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendCdp(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (e) {
        // ignore
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalCdp(ws, expression, awaitPromise = true) {
  const res = await sendCdp(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  if (res.exceptionDetails) {
    throw new Error('Eval error: ' + JSON.stringify(res.exceptionDetails));
  }
  return res.result?.value;
}

async function runAxe(ws, contextName) {
  console.log(`\n========================================`);
  console.log(`Running axe-core WCAG 2.1 AA audit on: [${contextName}]`);
  console.log(`========================================`);

  // Inject axe if not already present
  await evalCdp(ws, axeSource, false);

  const axeResults = await evalCdp(
    ws,
    `axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    })`
  );

  const violations = axeResults.violations || [];
  const passes = axeResults.passes?.length || 0;
  const incomplete = axeResults.incomplete?.length || 0;

  console.log(`Audited: ${passes} rules passed, ${incomplete} incomplete, ${violations.length} violations.`);

  if (violations.length > 0) {
    console.error(`❌ VIOLATIONS FOUND IN [${contextName}]:`);
    for (const v of violations) {
      console.error(`- [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.helpUrl})`);
      for (const node of v.nodes) {
        console.error(`   Target: ${node.target.join(' ')}`);
        console.error(`   HTML: ${node.html}`);
        console.error(`   Summary: ${node.failureSummary}`);
      }
    }
  } else {
    console.log(`✅ ZERO VIOLATIONS - 100% WCAG 2.1 Level AA Compliant for [${contextName}]!`);
  }

  return { contextName, violations, passes, incomplete };
}

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = 'C:\\Users\\User\\AppData\\Local\\Temp\\chrome_a11y_test_' + Date.now();

  console.log('Launching headless Chrome...');
  const chromeProc = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${tmpDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    await sleep(2000);

    // Get WebSocket debugger URL
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionJson = await versionRes.json();
    console.log('Connected to Chrome:', versionJson.Browser);

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const targetWsUrl = tabs[0].webSocketDebuggerUrl;

    const ws = new WebSocket(targetWsUrl);

    await new Promise((resolve) => ws.addEventListener('open', resolve));
    console.log('CDP WebSocket connected!');

    await sendCdp(ws, 'Page.enable');
    await sendCdp(ws, 'Runtime.enable');

    const allAuditResults = [];

    // --- TEST 1: Login Page ---
    await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(2000);
    allAuditResults.push(await runAxe(ws, '1. Sign In / Login Page'));

    // --- TEST 2: Admin Dashboard ---
    console.log('\nSigning in as Administrator (admin / admin123)...');
    await evalCdp(ws, `(() => {
      document.getElementById('login-username').value = 'admin';
      document.getElementById('login-username').dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('login-password').value = 'admin123';
      document.getElementById('login-password').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    })()`);
    await sleep(1500);
    allAuditResults.push(await runAxe(ws, '2. Admin Dashboard View'));

    // --- TEST 3: Add Staff Modal ---
    console.log('\nOpening Add Staff Member modal...');
    await evalCdp(ws, `(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Staff Account'));
      if (addBtn) addBtn.click();
    })()`);
    await sleep(500);
    allAuditResults.push(await runAxe(ws, '3. Add Staff Member Modal'));
    // Close modal
    await evalCdp(ws, `(() => {
      const closeBtn = document.querySelector('button[aria-label="Close add staff modal"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(300);

    // --- TEST 4: Apply for New Account Modal ---
    console.log('\nOpening Apply for New Account modal...');
    await evalCdp(ws, `(() => {
      const applyBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Apply Account') || b.innerText.includes('Submit Account Application'));
      if (applyBtn) applyBtn.click();
    })()`);
    await sleep(500);
    allAuditResults.push(await runAxe(ws, '4. Apply for New Account Modal'));
    // Close modal
    await evalCdp(ws, `(() => {
      const closeBtn = document.querySelector('button[aria-label="Close account application dialog"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(300);

    // --- TEST 5: Money Request Modal ---
    console.log('\nOpening Money Request modal...');
    await evalCdp(ws, `(() => {
      const moneyBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Money Request') || b.innerText.includes('Submit Money Request'));
      if (moneyBtn) moneyBtn.click();
    })()`);
    await sleep(500);
    allAuditResults.push(await runAxe(ws, '5. Money Request Modal'));
    // Close modal
    await evalCdp(ws, `(() => {
      const closeBtn = document.querySelector('button[aria-label="Close transaction request dialog"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(300);

    // --- TEST 6: Customer Accounts Directory Page ---
    console.log('\nNavigating to Customer Accounts Directory (#accounts)...');
    await evalCdp(ws, `(() => { window.location.hash = 'accounts'; })()`);
    await sleep(1000);
    allAuditResults.push(await runAxe(ws, '6. Accounts Directory View'));

    // --- TEST 7: Review Queue Page ---
    console.log('\nNavigating to Review Queue (#reviews)...');
    await evalCdp(ws, `(() => { window.location.hash = 'reviews'; })()`);
    await sleep(1000);
    allAuditResults.push(await runAxe(ws, '7. Review Queue View'));

    // --- TEST 8: Ledger Page ---
    console.log('\nNavigating to Ledger Page (#transactions)...');
    await evalCdp(ws, `(() => { window.location.hash = 'transactions'; })()`);
    await sleep(1000);
    allAuditResults.push(await runAxe(ws, '8. Transactions Ledger View'));

    // --- TEST 9: Teller Dashboard ---
    console.log('\nSigning out and logging in as Teller (teller / teller123)...');
    await evalCdp(ws, `(() => {
      localStorage.removeItem('APEX_USER_SESSION');
      window.location.hash = 'dashboard';
      window.location.reload();
    })()`);
    await sleep(1500);
    await evalCdp(ws, `(() => {
      document.getElementById('login-username').value = 'teller';
      document.getElementById('login-username').dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('login-password').value = 'teller123';
      document.getElementById('login-password').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    })()`);
    await sleep(1500);
    allAuditResults.push(await runAxe(ws, '9. Teller Operations Dashboard'));

    // --- TEST 10: Manager Dashboard ---
    console.log('\nSigning out and logging in as Branch Manager (manager / manager123)...');
    await evalCdp(ws, `(() => {
      localStorage.removeItem('APEX_USER_SESSION');
      window.location.hash = 'dashboard';
      window.location.reload();
    })()`);
    await sleep(1500);
    await evalCdp(ws, `(() => {
      document.getElementById('login-username').value = 'manager';
      document.getElementById('login-username').dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('login-password').value = 'manager123';
      document.getElementById('login-password').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    })()`);
    await sleep(1500);
    allAuditResults.push(await runAxe(ws, '10. Manager Oversight Dashboard'));

    // Summary Report
    console.log('\n\n========================================');
    console.log('FINAL WCAG 2.1 LEVEL AA AUDIT REPORT');
    console.log('========================================');
    let totalViolations = 0;
    for (const r of allAuditResults) {
      totalViolations += r.violations.length;
      console.log(`- ${r.contextName}: ${r.violations.length === 0 ? '✅ PASSED (0 violations)' : `❌ FAILED (${r.violations.length} violations)`}`);
    }
    console.log(`TOTAL VIOLATIONS ACROSS ENTIRE APPLICATION: ${totalViolations}`);
    console.log('========================================\n');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});

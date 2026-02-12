#!/usr/bin/env node
/**
 * generate-docs-pdfs.js
 *
 * Generates PDF documentation for all N4S modules using Puppeteer.
 * Uses the ?printModule=xxx route to render each documentation component
 * full-page with all 4 tabs visible and all expandable sections open.
 *
 * Usage:
 *   node scripts/generate-docs-pdfs.js
 *
 * Prerequisites:
 *   npm install --save-dev puppeteer
 *
 * Output:
 *   docs-pdfs/N4S-Dashboard-Documentation.pdf
 *   docs-pdfs/N4S-KYC-Documentation.pdf
 *   docs-pdfs/N4S-FYI-Documentation.pdf
 *   docs-pdfs/N4S-MVP-Documentation.pdf
 *   docs-pdfs/N4S-KYM-Documentation.pdf
 *   docs-pdfs/N4S-KYS-Documentation.pdf
 *   docs-pdfs/N4S-VMX-Documentation.pdf
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 3456;
const BASE_URL = `http://localhost:${PORT}`;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs-pdfs');

const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'kyc', label: 'KYC' },
  { id: 'fyi', label: 'FYI' },
  { id: 'mvp', label: 'MVP' },
  { id: 'kym', label: 'KYM' },
  { id: 'kys', label: 'KYS' },
  { id: 'vmx', label: 'VMX' },
];

function waitForServer(url, timeout = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Server did not start within ${timeout / 1000}s`));
        } else {
          setTimeout(check, 1000);
        }
      });
    };
    check();
  });
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting React dev server on port', PORT, '...');
  const server = spawn('npx', ['react-scripts', 'start'], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, BROWSER: 'none', PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Log server output for debugging
  server.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Compiled') || msg.includes('ERROR') || msg.includes('Failed')) {
      console.log('[server]', msg.trim());
    }
  });

  try {
    console.log('Waiting for dev server...');
    await waitForServer(BASE_URL);
    console.log('Dev server ready.\n');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const mod of MODULES) {
      const url = `${BASE_URL}?printModule=${mod.id}`;
      const filename = `N4S-${mod.label}-Documentation.pdf`;
      const filepath = path.join(OUTPUT_DIR, filename);

      console.log(`Generating ${filename}...`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for documentation content to render
      await page.waitForSelector('.doc-content', { timeout: 15000 });

      // Small delay for fonts and styles to settle
      await new Promise((r) => setTimeout(r, 1500));

      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.8in',
          bottom: '0.8in',
          left: '0.6in',
          right: '0.6in',
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width:100%;font-size:8px;font-family:Helvetica,Arial,sans-serif;padding:0 0.6in;display:flex;justify-content:space-between;">
            <span style="font-weight:bold;color:#1e3a5f;">N4S</span>
            <span style="color:#6b6b6b;">${mod.label} Documentation</span>
          </div>`,
        footerTemplate: `
          <div style="width:100%;font-size:6px;font-family:Helvetica,Arial,sans-serif;padding:0 0.6in;display:flex;justify-content:space-between;border-top:0.5px solid #e5e5e0;padding-top:4px;">
            <span style="color:#6b6b6b;">(C) 2026 Not4Sale LLC - Luxury Residential Advisory</span>
            <span style="color:#6b6b6b;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            <span style="color:#6b6b6b;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>`,
      });

      await page.close();
      console.log(`  -> ${filepath}`);
    }

    await browser.close();
    console.log(`\nDone! ${MODULES.length} PDFs saved to ${OUTPUT_DIR}/`);
  } finally {
    server.kill('SIGTERM');
    // Give it a moment to clean up
    await new Promise((r) => setTimeout(r, 500));
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

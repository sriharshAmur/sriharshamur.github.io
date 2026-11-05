import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Export the built CV itself, so the website and PDF cannot drift apart.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const source = join(dist, "cv/index.html");
const output = join(root, "output/pdf/Sri-Harsh-Amur-CV.pdf");
const chrome = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe"),
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
].find((candidate) => candidate && existsSync(candidate));

if (!existsSync(source)) throw new Error("Build the site first with npm run build.");
if (!chrome) throw new Error("Install Chrome/Chromium or set CHROME_PATH to its executable.");

const embedFonts = (css) => css.replace(
  /url\(["']?(\/fonts\/[^)"']+)["']?\)/g,
  (_, asset) => `url(data:font/woff2;base64,${readFileSync(join(dist, asset)).toString("base64")})`,
);

const html = readFileSync(source, "utf8")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
  .replace(/<link\b[^>]*>/g, (tag) => {
    const href = tag.match(/href="([^"]+)"/)?.[1];
    if (tag.includes('rel="stylesheet"') && href?.startsWith("/")) {
      return `<style>${embedFonts(readFileSync(join(dist, href), "utf8"))}</style>`;
    }
    return tag.includes('rel="preload"') || tag.includes('rel="icon"') ? "" : tag;
  })
  .replace(/(<img\b[^>]*\bsrc=")(\/[^"]+)(")/g, (_, before, asset, after) => {
    const mime = asset.endsWith(".svg") ? "image/svg+xml" : asset.endsWith(".jpg") ? "image/jpeg" : "image/png";
    return `${before}data:${mime};base64,${readFileSync(join(dist, asset)).toString("base64")}${after}`;
  })
  .replace("<head>", '<head><base href="https://sriharsh.com/">')
  .replace(/<title>.*?<\/title>/, "<title>Sri Harsh Amur - CV</title>");

const temp = mkdtempSync(join(tmpdir(), "sri-harsh-cv-"));
try {
  const input = join(temp, "cv.html");
  const generated = join(temp, "cv.pdf");
  writeFileSync(input, html);
  mkdirSync(dirname(output), { recursive: true });
  const args = [
    "--headless", "--disable-gpu", "--disable-extensions", "--disable-background-networking",
    "--no-first-run", "--no-default-browser-check", "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw", "--virtual-time-budget=1500",
    `--user-data-dir=${join(temp, "chrome")}`, `--print-to-pdf=${generated}`,
    pathToFileURL(input).href,
  ];
  await new Promise((resolve, reject) => {
    let printed = false;
    let log = "";
    const child = execFile(chrome, args, { timeout: 45_000 }, (error) => {
      if (error && !printed) reject(new Error(`CV export failed: ${error.message}`));
      else resolve();
    });
    // Some macOS Chrome versions keep running after a successful headless print.
    // Stop only our isolated process, after Chrome confirms it finished writing.
    child.stderr.on("data", (chunk) => {
      log = (log + chunk).slice(-4096);
      if (!printed && log.includes(`bytes written to file ${generated}`)) {
        printed = true;
        child.kill("SIGTERM");
      }
    });
  });
  const pdf = readFileSync(generated);
  if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-")) || !pdf.subarray(-32).includes("%%EOF")) {
    throw new Error("Chrome did not produce a complete CV PDF.");
  }
  renameSync(generated, output);
  console.log(output);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/images/blog");
const BASE = "http://localhost:3099";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

// --- 데스크탑 ---
const desktop = await browser.newPage();
await desktop.setViewport({ width: 1280, height: 800 });
await desktop.goto(BASE, { waitUntil: "networkidle2" });
await wait(2000);

const heroEl = await desktop.$(".hero");
await heroEl.screenshot({ path: path.join(OUT, "hero-desktop.png") });
console.log("✓ hero-desktop.png");

const titleEl = await desktop.$(".hero-content-wrap");
await titleEl.screenshot({ path: path.join(OUT, "hero-title-gradient.png") });
console.log("✓ hero-title-gradient.png");

// --- 모바일 ---
const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 844, isMobile: true });
await mobile.goto(BASE, { waitUntil: "networkidle2" });
await wait(2000);
await mobile.screenshot({ path: path.join(OUT, "hero-mobile.png") });
console.log("✓ hero-mobile.png");

// --- 포스트 목록 (스크롤 후) ---
await desktop.evaluate(() => window.scrollTo(0, 700));
await wait(600);
await desktop.screenshot({ path: path.join(OUT, "homepage-posts.png") });
console.log("✓ homepage-posts.png");

await browser.close();
console.log("완료!");

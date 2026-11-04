// All behaviour for the site. Small, dependency-free, and every effect
// checks for reduced motion and fine pointers before it moves anything.
export {};

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => [...el.querySelectorAll<T>(sel)];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
root.classList.add("js");

/* ---------------------------------------------------------------- Theme */
function setTheme(dark: boolean) {
  root.classList.toggle("dark", dark);
  $("[data-theme-toggle]")?.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}
$("[data-theme-toggle]")?.setAttribute("aria-label", root.classList.contains("dark") ? "Switch to light theme" : "Switch to dark theme");

let themeRun = 0;
$("[data-theme-toggle]")?.addEventListener("click", (e) => {
  const run = ++themeRun;
  const dark = !root.classList.contains("dark");
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reduced.matches) return setTheme(dark);

  // Grow the new theme out of the button as a circle.
  const btn = e.currentTarget as HTMLElement;
  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add("theme-vt");
  const t = doc.startViewTransition(() => setTheme(dark));
  t.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.77, 0, 0.175, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {});
  (t as unknown as { finished: Promise<void> }).finished?.finally(() => {
    if (run === themeRun) root.classList.remove("theme-vt");
  });
});

/* ---------------------------------------------------------------- Clock */
const clocks = $$("[data-clock]");
if (clocks.length) {
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
  const tick = () => {
    const now = new Date();
    const text = fmt.format(now);
    clocks.forEach((c) => {
      c.textContent = text;
      c.setAttribute("datetime", now.toISOString());
    });
  };
  tick();
  setInterval(tick, 15_000);
}

/* ---------------------------------------------------------------- Copy email */
$$("[data-copy]").forEach((btn) => {
  let timer = 0;
  const status = $("[data-copy-status]", btn);
  btn.addEventListener("click", async () => {
    const value = btn.dataset.copy!;
    try {
      await navigator.clipboard.writeText(value);
      if (status) status.textContent = "Copied to clipboard";
    } catch {
      location.href = `mailto:${value}`;
      return;
    }
    btn.classList.add("is-copied");
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      btn.classList.remove("is-copied");
      if (status) status.textContent = "";
    }, 1800);
  });
});

/* ---------------------------------------------------------------- Reveal + stretch on enter */
const io = new IntersectionObserver(
  (entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    }
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
);
$$("[data-reveal], [data-stretch]").forEach((el) => io.observe(el));

/* ---------------------------------------------------------------- Nav: hide on scroll down, sliding pill */
const nav = $("[data-nav]");
const links = $$<HTMLAnchorElement>(".nav__link");
const pill = $("[data-nav-pill]");
const linksWrap = $("[data-nav-links]");

function movePill(target: HTMLElement | null, animate = true) {
  if (!pill || !linksWrap) return;
  if (!target) {
    pill.style.setProperty("--o", "0");
    return;
  }
  const a = target.getBoundingClientRect();
  const b = linksWrap.getBoundingClientRect();
  if (!animate) pill.classList.add("no-anim");
  pill.style.setProperty("--x", `${a.left - b.left}px`);
  pill.style.setProperty("--w", `${a.width}px`);
  pill.style.setProperty("--o", "1");
  if (!animate) requestAnimationFrame(() => pill.classList.remove("no-anim"));
}

function setActive(key: string | null) {
  let found: HTMLElement | null = null;
  links.forEach((l) => {
    const on = l.dataset.key === key;
    l.classList.toggle("is-active", on);
    if (on) l.setAttribute("aria-current", "location");
    else l.removeAttribute("aria-current");
    if (on) found = l;
  });
  movePill(found);
}

const initial = links.find((l) => l.classList.contains("is-active")) ?? null;
movePill(initial, false);
addEventListener("resize", () => movePill(links.find((l) => l.classList.contains("is-active")) ?? null, false));
document.fonts?.ready.then(() => movePill(links.find((l) => l.classList.contains("is-active")) ?? null, false));

// Scrollspy for in-page sections on the home page.
const spySections = links
  .map((l) => ({ key: l.dataset.key!, el: l.hash ? document.getElementById(l.hash.slice(1)) : null }))
  .filter((s) => s.el && l_isLocal(s.key));
function l_isLocal(key: string) {
  const l = links.find((x) => x.dataset.key === key);
  return !!l && l.getAttribute("href")!.startsWith("#");
}

let lastY = scrollY;
let ticking = false;
function onScroll() {
  const y = scrollY;
  if (nav) {
    const down = y > lastY && y > 240;
    nav.classList.toggle("is-hidden", down && !nav.matches(":focus-within"));
  }
  lastY = y;

  if (spySections.length) {
    const mid = innerHeight * 0.4;
    let current: string | null = null;
    for (const s of spySections) {
      const r = s.el!.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) current = s.key;
    }
    if (current !== (links.find((l) => l.classList.contains("is-active"))?.dataset.key ?? null)) setActive(current);
  }

  scrollEffects.forEach((fn) => fn());
  ticking = false;
}
const scrollEffects: Array<() => void> = [];
addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true }
);

/* ---------------------------------------------------------------- Hero: letters respond to the pointer */
const name = $("[data-proximity]");
if (name && finePointer.matches && !reduced.matches) {
  const chars = $$(".ch", name);
  let mx = -9999;
  let my = -9999;
  let raf = 0;
  const update = () => {
    raf = 0;
    for (const c of chars) {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
      const f = clamp(1 - d / 380);
      const e = f * f * (3 - 2 * f); // smoothstep
      c.style.setProperty("--wg", `${850 - e * 520}`);
    }
  };
  // Wait for the entrance to finish before taking over the letters.
  setTimeout(() => {
    name.addEventListener("pointermove", (ev) => {
      if (reduced.matches || !finePointer.matches) return;
      mx = ev.clientX;
      my = ev.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    });
    name.addEventListener("pointerleave", () => {
      mx = my = -9999;
      if (!raf) raf = requestAnimationFrame(update);
    });
  }, 1700);
}

/* ---------------------------------------------------------------- Hero: portrait depth */
const parallax = $("[data-parallax]");
if (parallax && finePointer.matches && !reduced.matches) {
  const layers = $$("[data-depth]", parallax);
  addEventListener("pointermove", (ev) => {
    if (reduced.matches || !finePointer.matches || scrollY > innerHeight) return;
    const nx = ev.clientX / innerWidth - 0.5;
    const ny = ev.clientY / innerHeight - 0.5;
    layers.forEach((l) => {
      const d = parseFloat(l.dataset.depth!);
      l.style.setProperty("--px", `${nx * 28 * d}px`);
      l.style.setProperty("--py", `${ny * 22 * d}px`);
    });
  });
}

/* ---------------------------------------------------------------- Work: featured card settles as it arrives */
const feat = $("[data-feature-media]");
if (feat && !reduced.matches) {
  const run = () => {
    if (reduced.matches) {
      feat.style.removeProperty("--s");
      feat.style.removeProperty("--r");
      return;
    }
    const r = feat.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight * 0.85));
    const e = 1 - Math.pow(1 - p, 3);
    feat.style.setProperty("--s", `${0.86 + e * 0.14}`);
    feat.style.setProperty("--r", `${(1 - e) * -3}deg`);
  };
  scrollEffects.push(run);
  run();
}

/* ---------------------------------------------------------------- Work: preview that follows the cursor */
const float = $("[data-float]");
const rows = $$<HTMLAnchorElement>("[data-row]");
if (float && rows.length && finePointer.matches) {
  const slides = $$("[data-slide]", float);
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0;
  let raf = 0;
  let active = -1;
  const loop = () => {
    const px = x;
    x += (tx - x) * 0.16;
    y += (ty - y) * 0.16;
    vx = x - px;
    float.style.setProperty("--fx", `${x}px`);
    float.style.setProperty("--fy", `${y}px`);
    float.style.setProperty("--rot", `${clamp(vx * 0.35, -8, 8)}deg`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  const show = (i: number) => {
    slides.forEach((s, k) => {
      s.classList.toggle("is-current", k === i);
      s.classList.toggle("is-past", k < i);
    });
    active = i;
  };
  rows.forEach((row) => {
    const i = Number(row.dataset.row);
    row.addEventListener("pointerenter", (ev) => {
      if (reduced.matches || !finePointer.matches) return;
      if (active === -1 || !float.classList.contains("is-on")) {
        x = tx = ev.clientX;
        y = ty = ev.clientY;
        float.style.setProperty("--fx", `${x}px`);
        float.style.setProperty("--fy", `${y}px`);
      }
      show(i);
      float.classList.add("is-on");
      row.classList.add("is-hot");
    });
    row.addEventListener("pointermove", (ev) => {
      if (reduced.matches || !finePointer.matches) return;
      tx = clamp(ev.clientX + 40, 190, innerWidth - 190);
      ty = clamp(ev.clientY, 130, innerHeight - 130);
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener("pointerleave", () => {
      float.classList.remove("is-on");
      row.classList.remove("is-hot");
    });
  });
  // Keep the cover hover animations alive on the floating preview too.
  rows.forEach((row) => row.addEventListener("pointerenter", () => float.classList.add("is-hot")));
}

/* ---------------------------------------------------------------- Stack: explode on scroll, pick a layer */
const stackEl = $("[data-stack]");
if (stackEl) {
  const iso = $(".iso", stackEl)!;
  const slabs = $$("[data-slab]", stackEl);
  const btns = $$<HTMLButtonElement>("[data-layer]", stackEl);

  const select = (i: number | null) => {
    btns.forEach((b, k) => {
      b.setAttribute("aria-expanded", String(k === i));
      const panel = document.getElementById(b.getAttribute("aria-controls")!);
      panel?.setAttribute("aria-hidden", String(k !== i));
    });
    slabs.forEach((s, k) => s.classList.toggle("is-active", k === i));
    iso.classList.toggle("has-active", i !== null);
  };
  btns.forEach((b, i) =>
    b.addEventListener("click", () => select(b.getAttribute("aria-expanded") === "true" ? null : i))
  );
  if (finePointer.matches) {
    btns.forEach((b, i) => {
      b.addEventListener("pointerenter", () => {
        slabs.forEach((s, k) => s.classList.toggle("is-active", k === i));
        iso.classList.add("has-active");
      });
      b.addEventListener("pointerleave", () => {
        const open = btns.findIndex((x) => x.getAttribute("aria-expanded") === "true");
        slabs.forEach((s, k) => s.classList.toggle("is-active", k === open));
        iso.classList.toggle("has-active", open !== -1);
      });
    });
  }
  select(1);

  const run = () => {
    if (reduced.matches) return iso.style.setProperty("--p", "1");
    const r = iso.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight * 0.9));
    iso.style.setProperty("--p", (1 - Math.pow(1 - p, 2)).toFixed(3));
  };
  scrollEffects.push(run);
  run();
}

/* ---------------------------------------------------------------- Route: the line draws as you read */
const route = $("[data-route]");
if (route) {
  const fill = $("[data-route-fill]", route)!;
  const stops = $$("[data-stop]", route);
  const run = () => {
    const r = route.getBoundingClientRect();
    const line = innerHeight * 0.62;
    const p = reduced.matches ? 1 : clamp((line - r.top) / r.height);
    fill.style.setProperty("--progress", p.toFixed(4));
    stops.forEach((s) => {
      const top = s.getBoundingClientRect().top + 12;
      s.classList.toggle("is-past", reduced.matches || top < line);
    });
  };
  scrollEffects.push(run);
  run();
}

/* ---------------------------------------------------------------- CV: print */
$$("[data-print]").forEach((b) => b.addEventListener("click", () => print()));

reduced.addEventListener("change", () => {
  $$(".ch").forEach((el) => el.style.removeProperty("--wg"));
  $$("[data-depth]").forEach((el) => {
    el.style.removeProperty("--px");
    el.style.removeProperty("--py");
  });
  float?.classList.remove("is-on");
  onScroll();
});
addEventListener("resize", () => {
  lastY = scrollY;
  onScroll();
});
addEventListener("pageshow", () => {
  nav?.classList.remove("is-hidden");
  float?.classList.remove("is-on");
});

onScroll();

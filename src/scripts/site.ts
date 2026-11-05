// All behaviour for the site. Small, dependency-free, and every effect
// checks for reduced motion and fine pointers before it moves anything.
//
// Two rules keep the motion smooth:
// 1. Anything that follows the pointer or the scroll is smoothed here, in one
//    requestAnimationFrame loop per element, and written as CSS variables that
//    feed transform and opacity. Those properties never also get a CSS
//    transition, because a transition restarted on every frame stutters.
// 2. Each frame reads layout first and writes styles after, so the browser
//    lays the page out once per frame rather than once per element.
export {};

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const touchPointer = matchMedia("(hover: none), (pointer: coarse)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => [...el.querySelectorAll<T>(sel)];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const canFollowPointer = () => finePointer.matches && !reduced.matches;
root.classList.add("js");

/**
 * Eases a set of numbers towards their targets, frame-rate independent.
 * `speed` is how quickly the gap closes per second (higher is snappier).
 * The loop only runs while something is still moving.
 */
function smooth<K extends string>(initial: Record<K, number>, apply: (v: Record<K, number>) => void, speed = 11) {
  const value = { ...initial };
  const target = { ...initial };
  let raf = 0;
  let last = 0;
  const step = (now: number) => {
    const dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    const k = 1 - Math.exp((-speed * dt) / 1000);
    let moving = false;
    for (const key in target) {
      const gap = target[key] - value[key];
      if (Math.abs(gap) < 0.002) value[key] = target[key];
      else {
        value[key] += gap * k;
        moving = true;
      }
    }
    apply(value);
    if (moving) raf = requestAnimationFrame(step);
    else raf = last = 0;
  };
  return {
    to(next: Partial<Record<K, number>>) {
      Object.assign(target, next);
      if (!raf) raf = requestAnimationFrame(step);
    },
    jump(next: Partial<Record<K, number>>) {
      cancelAnimationFrame(raf);
      raf = last = 0;
      Object.assign(target, next);
      Object.assign(value, next);
      apply(value);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = last = 0;
      Object.assign(target, value);
    },
  };
}

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
        { duration: 600, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
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
      if (c.textContent !== text) c.textContent = text;
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
    celebrate(btn);
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
  { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
);
$$("[data-reveal], [data-stretch]").forEach((el) => io.observe(el));

/* ---------------------------------------------------------------- Scroll: one read pass, then one write pass */
// Each effect measures in its read step and returns the writes to make.
type ScrollEffect = () => (() => void) | void;
const scrollEffects: ScrollEffect[] = [];
let ticking = false;
function onScroll() {
  ticking = false;
  const writes = scrollEffects.map((read) => read());
  writes.forEach((write) => write && write());
}
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

const activeLink = () => links.find((l) => l.classList.contains("is-active")) ?? null;
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

movePill(activeLink(), false);
document.fonts?.ready.then(() => movePill(activeLink(), false));

// Scrollspy for in-page sections on the home page.
const spySections = links
  .filter((l) => l.getAttribute("href")!.startsWith("#"))
  .map((l) => ({ key: l.dataset.key!, el: document.getElementById(l.hash.slice(1)) }))
  .filter((s): s is { key: string; el: HTMLElement } => !!s.el);

let lastY = scrollY;
scrollEffects.push(() => {
  const y = scrollY;
  const hide = y > lastY && y > 240;
  lastY = y;
  let current: string | null = null;
  if (spySections.length) {
    const mid = innerHeight * 0.4;
    for (const s of spySections) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) current = s.key;
    }
  }
  return () => {
    if (nav) nav.classList.toggle("is-hidden", hide && !nav.matches(":focus-within"));
    if (spySections.length && current !== (activeLink()?.dataset.key ?? null)) setActive(current);
  };
});

/* ---------------------------------------------------------------- Hero: variable weight inside stable letter slots */
const name = $("[data-proximity]");
if (name) {
  const chars = $$(".ch", name);
  const glyphs = $$(".ch__glyph", name);
  let centres: { x: number; y: number }[] = [];
  let box: DOMRect | null = null;
  const measure = () => {
    box = name.getBoundingClientRect();
    const b = box;
    centres = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
    });
  };
  const letters = glyphs.map((glyph) => smooth({ weight: 850 }, ({ weight }) => {
    glyph.style.fontWeight = weight.toFixed(2);
  }, 12));
  let ready = false;
  let pointer: { x: number; y: number } | null = null;
  const aim = () => {
    if (!ready || !pointer || !canFollowPointer()) return;
    if (!box) measure();
    const b = box!;
    const point = pointer;
    centres.forEach((p, i) => {
      const proximity = clamp(1 - Math.hypot(point.x - b.left - p.x, point.y - b.top - p.y) / 380);
      letters[i].to({ weight: 850 - proximity * proximity * (3 - 2 * proximity) * 520 });
    });
  };
  const reset = () => {
    pointer = null;
    letters.forEach((letter) => letter.to({ weight: 850 }));
  };
  const stop = () => {
    pointer = null;
    letters.forEach((letter) => letter.jump({ weight: 850 }));
  };
  const forget = () => { box = null; };
  addEventListener("scroll", forget, { passive: true });
  new ResizeObserver(forget).observe(name);
  // Hand over after the actual stagger finishes, including late font loading.
  // A fixed timeout used to let hover and entrance write the same property.
  document.fonts.ready.then(async () => {
    await Promise.allSettled(glyphs.flatMap((glyph) => glyph.getAnimations().map((animation) => animation.finished)));
    forget();
    ready = true;
    aim();
  });
  name.addEventListener("pointermove", (ev) => {
    if (!canFollowPointer() || ev.pointerType !== "mouse") return;
    pointer = { x: ev.clientX, y: ev.clientY };
    aim();
  });
  name.addEventListener("pointerleave", reset);
  addEventListener("blur", stop);
  reduced.addEventListener("change", stop);
  finePointer.addEventListener("change", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
}

/* ---------------------------------------------------------------- A small, optional pointer companion */
const companion = $("[data-companion]");
if (companion) {
  const pupils = $$("[data-companion-pupil]", companion);
  let seen = false;
  let mx = 0, my = 0;
  const follower = smooth({ x: 0, y: 0 }, ({ x, y }) => {
    companion.style.transform = `translate3d(${x - 24}px, ${y - 24}px, 0)`;
    const dx = mx - x, dy = my - y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const gaze = Math.min(3, distance / 10);
    pupils.forEach((pupil) => {
      pupil.style.transform = `translate(${dx / distance * gaze}px, ${dy / distance * gaze}px)`;
    });
  }, 20);
  const hide = () => {
    companion.classList.remove("is-visible", "is-curious", "is-nerd");
    follower.stop();
    seen = false;
  };
  document.addEventListener("pointermove", (ev) => {
    if (!canFollowPointer() || ev.pointerType !== "mouse") return hide();
    const target = ev.target instanceof Element ? ev.target : null;
    const mood = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
    const nerd = mood === "nerd";
    const curious = nerd || mood === "curious";
    // Existing text interactions and floating project previews get the stage.
    const busy = target?.closest('[data-proximity], [data-row], .nav, input, textarea, select, [contenteditable="true"]')
      || (!curious && target?.closest('a, button, [data-magnetic]'));
    if (busy) return hide();
    mx = ev.clientX;
    my = ev.clientY;
    const position = {
      x: clamp(mx + (curious ? 32 : 16), 26, innerWidth - 26),
      y: clamp(my + (curious ? 32 : 16), 26, innerHeight - 26),
    };
    if (!seen) follower.jump(position);
    else follower.to(position);
    seen = true;
    companion.classList.toggle("is-curious", curious);
    companion.classList.toggle("is-nerd", nerd);
    companion.classList.add("is-visible");
  }, { passive: true });
  document.addEventListener("pointerleave", hide);
  document.addEventListener("pointerdown", (ev) => { if (ev.pointerType !== "mouse") hide(); });
  document.addEventListener("keydown", hide);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  addEventListener("scroll", hide, { passive: true });
  addEventListener("blur", hide);
  addEventListener("pagehide", hide);
  reduced.addEventListener("change", hide);
  finePointer.addEventListener("change", hide);
}

/* ---------------------------------------------------------------- Touch celebrations: bounded and disposable */
const bursts = new Map<HTMLElement, { node: HTMLElement; animations: Animation[] }>();
function clearBurst(button: HTMLElement) {
  const burst = bursts.get(button);
  if (!burst) return;
  burst.animations.forEach((animation) => animation.cancel());
  burst.node.remove();
  bursts.delete(button);
}
function celebrate(button: HTMLElement) {
  clearBurst(button);
  if (!touchPointer.matches || reduced.matches) return;
  const node = document.createElement("span");
  node.className = "mobile-burst";
  node.setAttribute("aria-hidden", "true");
  button.append(node);
  const animations = Array.from({ length: 8 }, (_, i) => {
    const petal = document.createElement("span");
    petal.className = "mobile-burst__petal";
    petal.style.background = i % 2 ? "var(--delft)" : "var(--marigold)";
    node.append(petal);
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 54, y = Math.sin(angle) * 54;
    return petal.animate([
      { transform: "translate(-50%, -50%) scale(0.8)", opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${i * 45}deg) scale(0.4)`, opacity: 0 },
    ], { duration: 620, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  });
  bursts.set(button, { node, animations });
  Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    if (bursts.get(button)?.node === node) clearBurst(button);
  });
}
const clearBursts = () => [...bursts.keys()].forEach(clearBurst);
reduced.addEventListener("change", clearBursts);
touchPointer.addEventListener("change", clearBursts);
addEventListener("pagehide", clearBursts);
document.addEventListener("visibilitychange", () => { if (document.hidden) clearBursts(); });
$$("[data-mobile-joy]").forEach((joy) => {
  const button = $("[data-joy-button]", joy)!;
  const status = $("[data-joy-status]", joy)!;
  button.addEventListener("click", () => {
    const delighted = joy.classList.toggle("is-delighted");
    status.textContent = delighted ? "A little sunshine for your day." : "Thanks for stopping by.";
    celebrate(button);
  });
});

/* ---------------------------------------------------------------- Touch: a little hello, no scroll gestures */
const hello = $("[data-hello]");
if (hello) {
  const button = $<HTMLButtonElement>("[data-hello-button]", hello)!;
  const message = $("[data-hello-message]", hello)!;
  const face = $(".hello__face", hello)!;
  const eyes = $$(".hello__eye", hello);
  const glyphs = $$(".ch__glyph");
  const messages = ["Hi there!", "Thanks for stopping by.", "Have a look at what I’m building."];
  let count = 0;
  let animations: Animation[] = [];
  const stop = () => {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  };
  button.addEventListener("click", () => {
    message.textContent = messages[count++ % messages.length];
    hello.classList.add("is-happy");
    hello.classList.toggle("is-nerd", count % 3 === 2);
    celebrate(button);
    stop();
    if (reduced.matches) return;
    animations.push(face.animate([
      { transform: "rotate(0deg)" }, { transform: "rotate(-10deg)", offset: 0.3 },
      { transform: "rotate(7deg)", offset: 0.65 }, { transform: "rotate(0deg)" },
    ], { duration: 380, easing: "ease-in-out" }));
    animations.push(eyes[1].animate([
      { transform: "scaleY(1)" }, { transform: "scaleY(0.15)", offset: 0.45 }, { transform: "scaleY(1)" },
    ], { duration: 280, easing: "ease-out" }));
    glyphs.forEach((glyph, i) => animations.push(glyph.animate([
      { transform: "translateY(0)" }, { transform: "translateY(-0.045em)", offset: 0.4 },
      { transform: "translateY(0)" },
    ], { duration: 340, delay: i * 24, easing: "cubic-bezier(0.23, 1, 0.32, 1)" })));
  });
  reduced.addEventListener("change", stop);
  finePointer.addEventListener("change", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
}

/* ---------------------------------------------------------------- Hero: portrait depth */
const parallax = $("[data-parallax]");
if (parallax) {
  const layers = $$("[data-depth]", parallax).map((el) => ({ el, d: parseFloat(el.dataset.depth!) }));
  const depth = smooth({ x: 0, y: 0 }, ({ x, y }) => {
    for (const l of layers) {
      l.el.style.setProperty("--px", `${(x * 28 * l.d).toFixed(2)}px`);
      l.el.style.setProperty("--py", `${(y * 22 * l.d).toFixed(2)}px`);
    }
  }, 5);
  addEventListener(
    "pointermove",
    (ev) => {
      if (!canFollowPointer() || scrollY > innerHeight) return;
      depth.to({ x: ev.clientX / innerWidth - 0.5, y: ev.clientY / innerHeight - 0.5 });
    },
    { passive: true }
  );
  document.addEventListener("pointerleave", () => depth.to({ x: 0, y: 0 }));
}

/* ---------------------------------------------------------------- Work: featured covers settle as they arrive */
$$("[data-feature-media]").forEach((feat) => {
  scrollEffects.push(() => {
    if (reduced.matches) {
      return () => {
        feat.style.removeProperty("--s");
        feat.style.removeProperty("--r");
      };
    }
    const r = feat.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    const p = clamp((innerHeight - r.top) / (innerHeight * 0.85));
    const e = 1 - Math.pow(1 - p, 3);
    return () => {
      feat.style.setProperty("--s", (0.88 + e * 0.12).toFixed(4));
      feat.style.setProperty("--r", `${((1 - e) * -2.5).toFixed(3)}deg`);
    };
  });
});

/* ---------------------------------------------------------------- Lists: a preview that follows the cursor */
// The cover trails the pointer, leans into the direction it travels, and
// slides up or down to the next project as you move between rows.
const float = $("[data-float]");
const rows = $$<HTMLAnchorElement>("[data-row]");
if (float && rows.length) {
  const slides = $$("[data-slide]", float);
  let tx = 0, ty = 0, x = 0, y = 0, rot = 0;
  let raf = 0;
  let last = 0;
  let visible = false;
  let hideTimer = 0;
  let hiddenAt = 0;
  let current = -1;
  let half = 0;
  const measure = () => (half = float.offsetWidth / 2);
  addEventListener("resize", () => (half = 0));

  const write = () => {
    float.style.setProperty("--fx", `${x.toFixed(1)}px`);
    float.style.setProperty("--fy", `${y.toFixed(1)}px`);
    float.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
  };
  const loop = (now: number) => {
    const dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    const k = 1 - Math.exp((-10 * dt) / 1000);
    const px = x;
    x += (tx - x) * k;
    y += (ty - y) * k;
    // Lean by horizontal speed (pixels per 60fps frame), eased so it never snaps.
    const lean = clamp(((x - px) / dt) * 16.7 * 0.3, -7, 7);
    rot += (lean - rot) * (1 - Math.exp((-14 * dt) / 1000));
    write();
    const settled = Math.abs(tx - x) + Math.abs(ty - y) < 0.3 && Math.abs(rot) < 0.02;
    if (settled) {
      rot = 0;
      write();
      raf = last = 0;
    } else raf = requestAnimationFrame(loop);
  };
  const show = (i: number) => {
    if (i === current) return;
    slides.forEach((s, k) => {
      s.classList.toggle("is-current", k === i);
      s.classList.toggle("is-past", k < i);
    });
    current = i;
  };
  const target = (ev: PointerEvent) => {
    if (!half) measure();
    tx = clamp(ev.clientX + 40, half + 16, innerWidth - half - 16);
    ty = clamp(ev.clientY, half * 0.625 + 16, innerHeight - half * 0.625 - 16);
  };
  const hide = () => {
    visible = false;
    hiddenAt = performance.now();
    float.classList.remove("is-on", "is-hot");
  };

  rows.forEach((row) => {
    const i = Number(row.dataset.row);
    row.addEventListener("pointerenter", (ev) => {
      if (!canFollowPointer()) return;
      clearTimeout(hideTimer);
      target(ev);
      // Only jump to the cursor when the preview has fully faded out;
      // moving between rows keeps it gliding from where it is.
      if (!visible && performance.now() - hiddenAt > 250) {
        x = tx;
        y = ty;
        rot = 0;
        write();
      }
      show(i);
      visible = true;
      float.classList.add("is-on", "is-hot");
      row.classList.add("is-hot");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener("pointermove", (ev) => {
      if (!canFollowPointer()) return;
      target(ev);
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener("pointerleave", () => {
      row.classList.remove("is-hot");
      // Wait a moment: if the pointer lands on the next row, stay visible.
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 90);
    });
  });
  addEventListener("pageshow", hide);
  reduced.addEventListener("change", hide);
}

/* ---------------------------------------------------------------- Cards and images lean towards the pointer */
// [data-tilt="5"] sets the most it leans, in degrees. The pointer is tracked
// over the closest [data-tilt-scope] (the whole card), or the element itself.
$$("[data-tilt]").forEach((el) => {
  const max = parseFloat(el.dataset.tilt || "5");
  const scope = el.closest<HTMLElement>("[data-tilt-scope]") ?? el;
  let box: DOMRect | null = null;
  const tilt = smooth({ rx: 0, ry: 0, lift: 0, gx: 50, gy: 0 }, (v) => {
    el.style.setProperty("--rx", v.rx.toFixed(3));
    el.style.setProperty("--ry", v.ry.toFixed(3));
    el.style.setProperty("--lift", v.lift.toFixed(3));
    el.style.setProperty("--gx", `${v.gx.toFixed(1)}%`);
    el.style.setProperty("--gy", `${v.gy.toFixed(1)}%`);
  }, 9);
  const forget = () => (box = null);
  scope.addEventListener("pointerenter", forget);
  addEventListener("scroll", forget, { passive: true });
  scope.addEventListener("pointermove", (ev) => {
    if (!canFollowPointer()) return;
    box ??= el.getBoundingClientRect();
    const nx = clamp((ev.clientX - box.left) / box.width - 0.5, -0.7, 0.7);
    const ny = clamp((ev.clientY - box.top) / box.height - 0.5, -0.7, 0.7);
    tilt.to({ ry: nx * max, rx: -ny * max * 0.8, lift: 1, gx: (nx + 0.5) * 100, gy: (ny + 0.5) * 100 });
  });
  scope.addEventListener("pointerleave", () => tilt.to({ rx: 0, ry: 0, lift: 0 }));
  reduced.addEventListener("change", () => tilt.jump({ rx: 0, ry: 0, lift: 0 }));
});

/* ---------------------------------------------------------------- Buttons lean towards the pointer */
$$(".btn, [data-magnetic]").forEach((el) => {
  let box: DOMRect | null = null;
  const pull = smooth({ x: 0, y: 0 }, ({ x, y }) => {
    el.style.setProperty("--mx", `${x.toFixed(2)}px`);
    el.style.setProperty("--my", `${y.toFixed(2)}px`);
  }, 14);
  el.addEventListener("pointerenter", () => (box = el.getBoundingClientRect()));
  el.addEventListener("pointermove", (ev) => {
    if (!canFollowPointer()) return;
    // Measured on enter, before the button has moved, so it never chases itself.
    box ??= el.getBoundingClientRect();
    const dx = ev.clientX - (box.left + box.width / 2);
    const dy = ev.clientY - (box.top + box.height / 2);
    pull.to({ x: clamp(dx * 0.22, -7, 7), y: clamp(dy * 0.3, -5, 5) });
  });
  el.addEventListener("pointerleave", () => {
    box = null;
    pull.to({ x: 0, y: 0 });
  });
});

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

  // The scroll sets a target; the layers ease towards it, so a flick of the
  // wheel opens the stack smoothly instead of in steps.
  const spread = smooth({ p: 0 }, ({ p }) => iso.style.setProperty("--p", p.toFixed(4)), 8);
  scrollEffects.push(() => {
    if (reduced.matches) return () => spread.jump({ p: 1 });
    const r = iso.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight * 0.9));
    return () => spread.to({ p: 1 - Math.pow(1 - p, 2) });
  });
}

/* ---------------------------------------------------------------- Route: the line draws as you read */
const route = $("[data-route]");
if (route) {
  const fill = $("[data-route-fill]", route)!;
  const stops = $$("[data-stop]", route);
  scrollEffects.push(() => {
    const r = route.getBoundingClientRect();
    if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
    const line = innerHeight * 0.62;
    const p = reduced.matches ? 1 : clamp((line - r.top) / r.height);
    const past = stops.map((s) => reduced.matches || s.getBoundingClientRect().top + 12 < line);
    return () => {
      fill.style.setProperty("--progress", p.toFixed(4));
      stops.forEach((s, i) => s.classList.toggle("is-past", past[i]));
    };
  });
}

/* ---------------------------------------------------------------- CV: print */
$$("[data-print]").forEach((b) => b.addEventListener("click", () => print()));

reduced.addEventListener("change", () => {
  $$("[data-depth]").forEach((el) => {
    el.style.removeProperty("--px");
    el.style.removeProperty("--py");
  });
  onScroll();
});
addEventListener("resize", () => {
  lastY = scrollY;
  movePill(activeLink(), false);
  onScroll();
});
addEventListener("pageshow", () => {
  nav?.classList.remove("is-hidden");
});

onScroll();

// Single source of truth for everything the site says about Sri Harsh.
// Pages (home, CV, case studies) all read from here, so edit copy in one place.

import type { ImageMetadata } from "astro";
import appsForTableau from "../assets/brands/apps-for-tableau.png";
import munchHero from "../assets/work/munch/hero.jpg";
import munchStory from "../assets/work/munch/story.jpg";
import munchCards from "../assets/work/munch/cards.jpg";
import munchNoticed from "../assets/work/munch/noticed.jpg";
import munchPlaces from "../assets/work/munch/places.jpg";
import longExposureHero from "../assets/work/long-exposure/hero.jpg";
import longExposureHomes from "../assets/work/long-exposure/homes.jpg";
import longExposurePlaces from "../assets/work/long-exposure/places.jpg";
import longExposureYears from "../assets/work/long-exposure/years.jpg";
import longExposureDay from "../assets/work/long-exposure/day.jpg";
import journalHero from "../assets/work/journal/hero.jpg";
import journalExplore from "../assets/work/journal/explore.jpg";
import journalJournal from "../assets/work/journal/journal.jpg";
import journalMemory from "../assets/work/journal/memory.jpg";
import journalLanding from "../assets/work/journal/landing.jpg";

export const profile = {
  name: "Sri Harsh Amur",
  firstName: "Sri Harsh",
  lastName: "Amur",
  role: "Full-stack developer",
  location: "Enschede, the Netherlands",
  timezone: "Europe/Amsterdam",
  email: "sriharshamur@gmail.com",
  links: {
    github: "https://github.com/sriharshAmur",
    linkedin: "https://www.linkedin.com/in/sriharsh-amur/",
  },
  intro:
    "I build the pages customers order through, the monitoring that tells us when they break, and the AI tools that help engineers find out why. Before that, I owned three Tableau extensions end to end.",
  summary:
    "Full-stack developer with five years of professional experience across product front ends, backend services and data visualisation. I've shipped React and Vue applications used inside Tableau and Power BI, built services in Go, Node.js and Kotlin, owned three products end to end, and spoken at Tableau Conference. I care about software that feels quick, reads clearly, and holds up in production.",
};

// One sentence per achievement. `highlight` must appear verbatim in `text`;
// the CV sets it apart so the outcome is what a reader's eye lands on.
export type Achievement = {
  text: string;
  highlight?: string;
};

export const companyLogos: Record<"jet" | "appsForTableau", string | ImageMetadata> = {
  jet: "/img/brands/jet.svg",
  appsForTableau,
};

export type Role = {
  logo: keyof typeof companyLogos;
  title: string;
  company: string;
  place: string;
  start: string;
  end: string;
  startYear: number;
  points: Achievement[];
};

export const experience: Role[] = [
  {
    title: "Full-stack developer",
    company: "Just Eat Takeaway.com",
    logo: "jet",
    place: "Enschede",
    start: "Sept 2024",
    end: "Present",
    startYear: 2024,
    points: [
      {
        text: "Built AI workflows that read a week of customer feedback and Datadog dashboards and write interactive reports for web engineers. They have caught production incidents.",
        highlight: "caught production incidents",
      },
      {
        text: "Took key pages from almost no observability to full coverage, architected per micro frontend: RUM, dashboards, synthetic checks and 25 monitors paging Slack and PagerDuty.",
        highlight: "almost no observability to full coverage",
      },
      {
        text: "Halved p75 Largest Contentful Paint from 2.2s to 1.1s using production telemetry, unblocking a rollout stuck at 50%.",
        highlight: "2.2s to 1.1s",
      },
      {
        text: "Led the migration from CodeceptJS to Playwright across two teams, with an MQTT5 mock broker for testing live order updates in CI.",
        highlight: "CodeceptJS to Playwright",
      },
      {
        text: "Measured real consent choices with RUM before a planned rework, showed it touched about 1,000 users a month, and moved the time to higher-impact work.",
        highlight: "about 1,000 users a month",
      },
      {
        text: "Owned production incidents through to resolution, including a customer-data privacy issue coordinated across security, platform and observability teams.",
      },
      {
        text: "Shipped across the stack, from the React post-order experience now default for all web users to Kotlin, Kafka and DynamoDB fixes in live order routing.",
      },
    ],
  },
  {
    title: "Software developer",
    company: "AppsForTableau",
    logo: "appsForTableau",
    place: "Hardenberg",
    start: "Sept 2021",
    end: "Aug 2024",
    startYear: 2021,
    points: [
      {
        text: "Grew from developer to owner of three extensions, setting direction, estimating every feature and leading delivery with product management.",
        highlight: "owner of three extensions",
      },
      {
        text: "Became the technical voice on customer calls, turning feedback into features and following up with clients until they shipped.",
      },
      {
        text: "Rebuilt a sprawl of features into guided products with wizards, tooltips and faster rendering, then added AI-assisted analysis and sparklines to SuperTables.",
        highlight: "AI-assisted analysis",
      },
      {
        text: "Built React and Vue extensions for Tableau and Power BI, with the Go and Node.js services behind them.",
      },
    ],
  },
];

export const cv = {
  description:
    "Sri Harsh Amur, full-stack developer building AI developer tools, frontends and observability that hold up in production.",
  lede:
    "At Just Eat Takeaway.com, I build the pages customers order through, the monitoring that tells us when they break, and the AI tools that help engineers find out why.",
  skills: [
    {
      icon: "design",
      label: "Design",
      line: "Sketch the flow in Figma, then build it to the pixel.",
      tools: ["Figma", "Prototyping", "Design systems", "UX writing"],
    },
    {
      icon: "frontend",
      label: "Frontend",
      line: "Fast, accessible interfaces across micro frontends, tuned with real-user data.",
      tools: ["TypeScript", "React", "Vue", "Next.js", "Core Web Vitals"],
    },
    {
      icon: "backend",
      label: "Backend",
      line: "Event-driven services and APIs behind live order flows.",
      tools: ["Kotlin", "Spring Boot", "Go", "Node.js", "Kafka", "DynamoDB"],
    },
    {
      icon: "observability",
      label: "Observability",
      line: "Monitoring built around user journeys, so problems surface before customers report them.",
      tools: ["Datadog RUM", "APM", "Synthetics", "Alerting", "PagerDuty"],
    },
    {
      icon: "ai",
      label: "AI & tooling",
      line: "LLM workflows and test and release tooling that make a whole team faster.",
      tools: ["LLM agents", "Playwright", "GitHub Actions", "Cloudflare Workers"],
    },
  ],
  projects: [
    {
      slug: "long-exposure",
      detail: "Turns a Google Maps Timeline export into a story of everywhere you have lived and travelled. Parses 190,000 points in about a second, without the file leaving the browser.",
      tools: ["MapLibre GL", "Web Workers", "SVG"],
    },
    {
      slug: "munch",
      detail: "Plays a year of food-delivery orders back as stories, charts and a guess at your next order. One TypeScript core powers both the CLI and the web app.",
      tools: ["TypeScript", "Bun", "React"],
    },
  ],
  speaking: {
    event: "Tableau Conference 2024",
    place: "San Diego",
    year: "2024",
    title: "How to build your first viz extension",
    detail: "A hands-on session teaching developers to build and ship their own Tableau extension.",
    href: "https://content-appsfortableau.infotopics.com/tc24",
  },
};

export const education = [
  {
    school: "University of Twente",
    place: "Enschede, the Netherlands",
    years: "2019 – 2022",
    detail: "Computer Science",
  },
  {
    school: "Navy Children School",
    place: "New Delhi, India",
    years: "2015 – 2019",
    detail: "Secondary school",
  },
];

// The full stack, literally. Ordered from what people see to what keeps it running.
export const stack = [
  {
    layer: "Design",
    line: "Wireframes and interfaces in Figma before a line of code.",
    tools: ["Figma", "Prototyping", "Design systems"],
  },
  {
    layer: "Front end",
    line: "Typed, component-driven apps that stay fast as they grow.",
    tools: ["React", "Next.js", "Vue", "TypeScript", "Redux-Saga", "Tailwind"],
  },
  {
    layer: "API",
    line: "Clear contracts between the screen and the service.",
    tools: ["REST", "tRPC", "Event-driven messaging"],
  },
  {
    layer: "Back end",
    line: "Services that own their domain and survive real traffic.",
    tools: ["Kotlin", "Spring Boot", "Go", "Node.js", "Flask", "Kafka", "DynamoDB", "Prisma"],
  },
  {
    layer: "Delivery",
    line: "Pipelines and platforms that get it to production safely.",
    tools: ["GitHub Actions", "Kubernetes", "ArgoCD", "Cloudflare Workers"],
  },
];

export type Work = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  tagline: string;
  summary: string;
  tools: string[];
  cover: { type: "image"; src: ImageMetadata; alt: string } | { type: "mock"; variant: "viz" | "jobs" | "chat" };
  tint: string;
  /** Shown large on the home page, with a direct link to the live app. */
  featured?: boolean;
  /** Line under the case study's cover image. */
  coverNote?: string;
  links: { label: string; href: string }[];
  problem: string;
  approach: string[];
  /** Later work on speed, robustness and finish, shown as its own section. */
  polish?: string[];
  outcome: string;
  gallery?: { src: ImageMetadata; alt: string; caption: string }[];
};

export const work: Work[] = [
  {
    slug: "journal",
    title: "Journal",
    kind: "Personal project",
    year: "2026",
    featured: true,
    tagline: "A plain place to write, that remembers where you've been.",
    summary:
      "A journal that looks like a notebook rather than a product: one page to write on, a look back over your months, and an AI that only ever answers with your own words as its sources. Built on Cloudflare Workers and D1, behind Cloudflare Access for the real one.",
    tools: ["TypeScript", "React 19", "Vite", "Hono", "Cloudflare Workers", "D1", "R2", "Zod"],
    cover: {
      type: "image",
      src: journalHero,
      alt: "Journal's Write page: the date, a small toolbar, and a short entry typed straight onto warm paper",
    },
    coverNote: "Screenshots show the local sandbox's fictional entries, never a real journal.",
    tint: "#1b1a18",
    links: [
      { label: "Try the demo", href: "https://journal.sriharsh.com/demo" },
    ],
    problem:
      "Most journaling apps feel like software: forms, streaks, scores, a dashboard of your own life. I wanted a place that felt safe to be honest in and worth coming back to, where an AI could help me notice patterns without ever putting words in my mouth. My first design went the other way and overshot: a lamplit, serif, pill-studded room that looked like a template for a journal app rather than a tool I would actually use.",
    approach: [
      "I rebuilt the design from the materials of this site: warm paper, graphite ink and one marigold accent, Public Sans for everything you read and operate, Newsreader only for titles. The writing sits straight on the paper with nothing drawn around it, so casual notes look like notes. The room darkens on its own in the evening.",
      "Explore reads like a letter about a stretch of time rather than a dashboard: how often you wrote, month by month; what the reflections say about it; what helped and what was hard, side by side and never weighed; what filled it and who was in it. Nothing is scored or coloured good or bad.",
      "Every claim the journal makes carries its sources. A memory says whether it is your words or the model's reading, and opens the passages it came from. You can correct it in place, forget it, or delete it, and the correction is respected later.",
      "Talk is a chat column with the composer pinned to the bottom of the window, four optional approaches in its foot (listen, reflect, challenge, plan) and an incognito switch that keeps a conversation out of storage entirely. Each reply lists the passages it drew on.",
      "The real journal runs as a separate Worker behind Cloudflare Access with its own private D1 and media bucket; the public site is a browser-only demo with no account, keys or model calls. Privacy boundaries are written down beside the code and checked before each change.",
    ],
    outcome:
      "It finally feels like mine: a plain notebook I open without thinking, with the analysis one step away instead of in my face. The design decisions, the AI's short character brief and the privacy rules are written down next to the code, so the next change keeps all three.",
    gallery: [
      { src: journalExplore, alt: "The Explore page: a strip of monthly bars, reflection lines with their dates, and two columns for what helped and what was hard", caption: "The look back: how often you wrote, what the time held, and what helped and what was hard side by side." },
      { src: journalJournal, alt: "The Journal page: search, plain filters, and entries listed under month headings with the day number in the margin", caption: "Entries and conversations in one chronology, with the months that had nothing written shown as gaps." },
      { src: journalMemory, alt: "The Memory page: short sentences the journal remembers, each with its date, sources and a Change link", caption: "What the journal remembers, each sentence marked as your words or a reading, with its sources one click away." },
      { src: journalLanding, alt: "The landing page: a large serif headline on warm paper above a short introduction and a demo button", caption: "The public page is the same notebook seen from the doorway, with a browser-only demo." },
    ],
  },
  {
    slug: "munch",
    title: "Munch",
    kind: "Personal project",
    year: "2026",
    featured: true,
    tagline: "A year of dinners, read at a glance.",
    summary:
      "Your Thuisbezorgd order history, read back in your browser: when you get hungry, the places you keep going back to, what an order really costs, and what you'll probably order next.",
    tools: ["TypeScript", "Bun", "React 19", "Vite", "TanStack Router", "Motion", "Tailwind", "Cloudflare Workers"],
    cover: {
      type: "image",
      src: munchHero,
      alt: "Munch's home page: a row of story rings above the headline “87 orders since November 2025”",
    },
    coverNote: "Screenshots use a fictional demo person, with made-up orders from made-up restaurants.",
    tint: "#25221f",
    links: [
      { label: "Open Munch", href: "/munch/" },
      { label: "Source on GitHub", href: "https://github.com/sriharshAmur/munch" },
    ],
    problem:
      "A delivery app knows a lot about your evenings: the nights you couldn't face cooking, the place you quietly stopped ordering from, how much of each order went on fees. All it gives you back is a list of receipts, newest first, and you can't read a list of receipts as a year.",
    approach: [
      "A small Bun command-line tool fetches your own order history with your own signed-in session. It makes one polite request at a time and keeps the session in memory, never on disk.",
      "Raw responses are saved first and normalised into one JSON file afterwards, so a parser fix never needs a refetch. Names, phone numbers and street addresses are dropped on the way.",
      "The web app opens that file in your browser, and nothing is uploaded. One TypeScript core holds the schema, the analysis and the predictions, shared by the command line, the tests and the page.",
      "Story rings play your year, then each month. Question cards answer one thing each in large type, with small hand-built charts underneath, and every bar opens the orders behind it.",
      "Findings are pinned up like kitchen tickets, shown only when your history supports them, next to an order type (night owl, regular, explorer) and a guess at your next order with its honest hit rate.",
    ],
    polish: [
      "The app used to ship as one 885 KB script. Now each page loads its own code once your data is ready, so the start page downloads about 195 KB compressed instead of 280 KB.",
      "Screenshots moved from JPEG to WebP at the size they are shown, from 655 KB down to 138 KB. Build files are cached for a year, so a second visit only fetches the page itself.",
      "The animations stayed, but nothing waits more than 150 ms to start. On a simulated mid-range phone, the Lighthouse score went from 84 to 91 and the first load from 754 KB to 423 KB.",
      "The story player works from the keyboard wherever focus is, Escape returns you to the ring you opened, and holding to pause no longer skips a slide.",
      "“Today” and “yesterday” now count calendar days in Amsterdam time. Every push runs the type check, 47 tests and both builds before Cloudflare gets the new version.",
    ],
    outcome:
      "A live demo with a made-up person's year of orders, and a tool I run on my own. Thuisbezorgd keeps about a year of history, so Munch is designed around a year: weeks rather than months, and months as stories.",
    gallery: [
      { src: munchStory, alt: "A story slide naming the demo person's number one restaurant of the year", caption: "Your year plays as a story, then each month gets one of its own." },
      { src: munchCards, alt: "Cards answering when the demo person orders and where from", caption: "One question per card, answered in large type with the evidence underneath." },
      { src: munchNoticed, alt: "Small findings shown as kitchen tickets hanging from a rail", caption: "Things we noticed, pinned up like tickets in a kitchen." },
      { src: munchPlaces, alt: "A table of restaurants with a status and a year of activity for each", caption: "Every restaurant gets a status, a year of activity and a page of its own." },
    ],
  },
  {
    slug: "long-exposure",
    title: "Long Exposure",
    kind: "Personal project",
    year: "2026",
    featured: true,
    tagline: "Every place your phone remembers, in one picture.",
    summary:
      "A browser-only story built from a Google Maps Timeline export: a decade of location history glowing on a night map, with the years unfolding around it.",
    tools: ["JavaScript", "Web Workers", "MapLibre GL", "SVG", "Cloudflare Workers"],
    cover: { type: "image", src: longExposureHero, alt: "Years of location history glowing as points on a dark world map" },
    coverNote: "Screenshots use a fictional demo person, with made-up location history.",
    tint: "#1d1f22",
    links: [
      { label: "Open Long Exposure", href: "/long-exposure/" },
      { label: "Source on GitHub", href: "https://github.com/sriharshAmur/long-exposure" },
    ],
    problem:
      "Google Maps quietly keeps a diary of everywhere you have been, sometimes for over a decade. The only way to get it out is a Timeline.json file that nobody can read, and handing it to a server means handing over your life's movements.",
    approach: [
      "Your Timeline file is processed locally in the browser tab, with no sign-up or upload. The finished story is saved in your browser so you can return to it.",
      "Parsing happens in a Web Worker off the main thread, turning around 190,000 raw points into the story's data in about a second.",
      "Homes are inferred from where you slept; favourite places, travel modes and weekly rhythms come out of the same pass.",
      "Reverse geocoding works offline against 31,000 world cities from GeoNames. An optional OpenStreetMap lookup sends selected coordinates to name homes and favourite places; you can skip it.",
      "The story is a single scroll: MapLibre GL for the map and hand-built SVG charts for everything else.",
    ],
    polish: [
      "The opening text used to wait for the map style and its first tiles. Now it is written straight away, and MapLibre only loads once a story opens.",
      "MapLibre and the fonts are served from my own domain instead of unpkg and Google Fonts, so nothing from another site blocks the first paint. The preview image is AVIF, 18 KB on phones instead of 185 KB.",
      "The calendar's 3,900 day squares are built as one piece of markup per year, with three event listeners on the wall instead of three on every square.",
      "On a simulated mid-range phone, the demo's Lighthouse score went from 43 to between 75 and 90, and what it downloads went from 1.4 MB to 0.7 MB.",
      "iPhone exports now work alongside Android ones, and timelines with no trips, no time abroad or only a few recorded months no longer break the story. Every push checks that the iPhone and Android versions of the same history tell the same story.",
    ],
    outcome:
      "A live way to look back at your own years while keeping the raw file on your device. Drop in your file and watch the map light up one year at a time, then click any day in the calendar to replay it hour by hour.",
    gallery: [
      { src: longExposureHomes, alt: "Panel describing life around each home", caption: "Life around each home, found from where you slept." },
      { src: longExposurePlaces, alt: "Panel listing most visited places", caption: "Your places, with habits like “usually Saturdays around 11:00”." },
      { src: longExposureYears, alt: "Year by year summary view", caption: "Pick any year to see where home was and where you went." },
      { src: longExposureDay, alt: "A single day replayed on the map", caption: "Every day is one square. Click it to replay that day." },
    ],
  },
  {
    slug: "vizextensions",
    title: "Extensions for Tableau and Power BI",
    kind: "AppsForTableau, Infotopics",
    year: "2021 – 2024",
    tagline: "Visuals and workflows the BI tools don't ship with.",
    summary:
      "Three years building extensions that run inside Tableau and Power BI dashboards, and owning three of them end to end. Ended with a talk at Tableau Conference 2024.",
    tools: ["React", "Vue", "TypeScript", "Go", "Node.js", "Tableau Extensions API"],
    cover: { type: "mock", variant: "viz" },
    tint: "#2d2a26",
    links: [{ label: "AppsForTableau", href: "https://appsfortableau.com/" }],
    problem:
      "Analysts build their reporting inside Tableau and Power BI, but the built-in charts and interactions only go so far. Extensions fill the gap, and they have to feel native, render quickly on large data, and work across many customers' setups.",
    approach: [
      "Built extension front ends in React and Vue that run inside the host dashboard and respond to its filters and selections.",
      "Wrote the backend services and desktop applications behind them in Go and Node.js.",
      "As owner of three extensions, set roadmaps, prioritised features and spoke directly with clients on sales and support calls.",
      "Presented VizExtensions on stage at Tableau Conference 2024 in San Diego.",
    ],
    outcome:
      "Extensions used by Tableau and Power BI customers, shaped by direct conversations with the people using them. Owning products taught me to weigh what to build as carefully as how to build it.",
  },
  {
    slug: "hireo",
    title: "Hireo",
    kind: "Side project",
    year: "2022",
    tagline: "A freelancing marketplace for finding work and hiring talent.",
    summary:
      "A full-stack freelancing platform: create a profile, search for jobs, and get hired. Type-safe from the database to the browser.",
    tools: ["Next.js", "tRPC", "Prisma", "Tailwind", "NextAuth"],
    cover: { type: "mock", variant: "jobs" },
    tint: "#f2a516",
    links: [],
    problem:
      "Build a freelancing web application that brings profiles, job discovery and hiring into one place, while exploring a type-safe full-stack architecture.",
    approach: [
      "Profile creation gives freelancers a place to introduce themselves and their skills.",
      "Job search connects the profile and hiring parts of the application.",
      "tRPC connects the Next.js application to its API, with Prisma handling database access.",
      "Authentication with NextAuth and a UI built in Tailwind.",
    ],
    outcome:
      "A personal project exploring profiles, job search and hiring with Next.js, tRPC and Prisma.",
  },
  {
    slug: "teams",
    title: "Microsoft Teams clone",
    kind: "Side project",
    year: "2021",
    tagline: "Real-time team chat, built from scratch.",
    summary:
      "A real-time chat application with teams, channels and private messages, built on React and Firebase.",
    tools: ["React", "Firebase", "Tailwind"],
    cover: { type: "mock", variant: "chat" },
    tint: "#2d2a26",
    links: [
      { label: "Live demo", href: "https://teams-sigma.vercel.app/" },
      { label: "Source", href: "https://github.com/sriharshAmur/teams" },
    ],
    problem:
      "I wanted to understand what makes collaboration tools feel instant: how messages, presence and membership stay in sync across every open client.",
    approach: [
      "Create and manage teams, invite members and organise conversations.",
      "Search for any user and start a private chat.",
      "Firebase listeners push every new message to connected clients in real time.",
      "A responsive React and Tailwind interface modelled on the patterns people already know from Teams.",
    ],
    outcome:
      "A deployed, working chat app, and a practical education in real-time data, optimistic UI and access rules.",
  },
];

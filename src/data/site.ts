// Single source of truth for everything the site says about Sri Harsh.
// Pages (home, CV, case studies) all read from here, so edit copy in one place.

export const profile = {
  name: "Sri Harsh Amur",
  firstName: "Sri Harsh",
  lastName: "Amur",
  role: "Full-stack developer",
  location: "Enschede, the Netherlands",
  timezone: "Europe/Amsterdam",
  email: "sriharshamur@gmail.com",
  phone: "+31 645363925",
  links: {
    github: "https://github.com/sriharshAmur",
    linkedin: "https://www.linkedin.com/in/sriharsh-amur/",
  },
  intro:
    "I build web products end to end, from the interface people touch to the services and pipelines behind it. Right now that means ordering software at Just Eat Takeaway.",
  summary:
    "Full-stack developer with five years of professional experience across product front ends, backend services and data visualisation. I've shipped React and Vue applications used inside Tableau and Power BI, built services in Go, Node.js and Kotlin, owned products as a Product Owner, and spoken at Tableau Conference. I care about software that feels quick, reads clearly, and holds up in production.",
};

export type Role = {
  title: string;
  company: string;
  place: string;
  start: string;
  end: string;
  startYear: number;
  points: string[];
  tools: string[];
};

export const experience: Role[] = [
  {
    title: "Full-stack developer",
    company: "Just Eat Takeaway.com",
    place: "Enschede",
    start: "Sept 2024",
    end: "Present",
    startYear: 2024,
    points: [
      "Build and maintain React applications, migrating legacy components and shipping new features with Redux and Redux-Saga.",
      "Build and run backend microservices in Spring Boot (Kotlin) on Kafka, SNS/SQS and DynamoDB.",
      "Contribute to the migration of services to a hexagonal architecture, separating domain logic from infrastructure.",
    ],
    tools: ["React", "Redux-Saga", "Kotlin", "Spring Boot", "Kafka", "SNS/SQS", "DynamoDB"],
  },
  {
    title: "Web developer and Product Owner",
    company: "AppsForTableau, Infotopics",
    place: "Hardenberg",
    start: "Sept 2021",
    end: "Aug 2024",
    startYear: 2021,
    points: [
      "Developed Tableau and Power BI extensions in React and Vue.",
      "Built backend services and desktop applications in Go and Node.js.",
      "Led three extensions as Product Owner: features, roadmaps and client relationships, including sales and support calls.",
      "Spoke at Tableau Conference 2024 in San Diego about VizExtensions.",
    ],
    tools: ["React", "Vue", "TypeScript", "Go", "Node.js", "Tableau", "Power BI"],
  },
];

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
  cover: { type: "image"; src: string; alt: string } | { type: "mock"; variant: "viz" | "jobs" | "chat" };
  tint: string;
  links: { label: string; href: string }[];
  problem: string;
  approach: string[];
  outcome: string;
  gallery?: { src: string; alt: string; caption: string }[];
};

export const work: Work[] = [
  {
    slug: "long-exposure",
    title: "Long Exposure",
    kind: "Personal project",
    year: "2026",
    tagline: "Every place your phone remembers, in one picture.",
    summary:
      "A browser-only story built from a Google Maps Timeline export: a decade of location history glowing on a night map, with the years unfolding around it.",
    tools: ["JavaScript", "Web Workers", "MapLibre GL", "SVG", "Cloudflare Workers"],
    cover: { type: "image", src: "/img/work/long-exposure/hero.jpg", alt: "Years of location history glowing as points on a dark world map" },
    tint: "#1b2142",
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
    outcome:
      "A live way to look back at your own years while keeping the raw file on your device. Drop in your file and watch the map light up one year at a time, then click any day in the calendar to replay it hour by hour.",
    gallery: [
      { src: "/img/work/long-exposure/homes.jpg", alt: "Panel describing life around each home", caption: "Life around each home, found from where you slept." },
      { src: "/img/work/long-exposure/places.jpg", alt: "Panel listing most visited places", caption: "Your places, with habits like “usually Saturdays around 11:00”." },
      { src: "/img/work/long-exposure/years.jpg", alt: "Year by year summary view", caption: "Pick any year to see where home was and where you went." },
      { src: "/img/work/long-exposure/day.jpg", alt: "A single day replayed on the map", caption: "Every day is one square. Click it to replay that day." },
    ],
  },
  {
    slug: "vizextensions",
    title: "Extensions for Tableau and Power BI",
    kind: "AppsForTableau, Infotopics",
    year: "2021 – 2024",
    tagline: "Visuals and workflows the BI tools don't ship with.",
    summary:
      "Three years building extensions that run inside Tableau and Power BI dashboards, and owning three of them as Product Owner. Ended with a talk at Tableau Conference 2024.",
    tools: ["React", "Vue", "TypeScript", "Go", "Node.js", "Tableau Extensions API"],
    cover: { type: "mock", variant: "viz" },
    tint: "#2849c9",
    links: [{ label: "AppsForTableau", href: "https://appsfortableau.com/" }],
    problem:
      "Analysts build their reporting inside Tableau and Power BI, but the built-in charts and interactions only go so far. Extensions fill the gap, and they have to feel native, render quickly on large data, and work across many customers' setups.",
    approach: [
      "Built extension front ends in React and Vue that run inside the host dashboard and respond to its filters and selections.",
      "Wrote the backend services and desktop applications behind them in Go and Node.js.",
      "As Product Owner for three extensions, set roadmaps, prioritised features and spoke directly with clients on sales and support calls.",
      "Presented VizExtensions on stage at Tableau Conference 2024 in San Diego.",
    ],
    outcome:
      "Extensions used by Tableau and Power BI customers, shaped by direct conversations with the people using them. The Product Owner role taught me to weigh what to build as carefully as how to build it.",
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
    tint: "#5b5fc7",
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

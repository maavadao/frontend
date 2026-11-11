export const site = {
  name: "maavaDao",
  long: "Community-Governed AI & Blockchain Technologies for Education",
  url: "https://maavadao.com",
  tagline:
    "Education spans hundreds of fields, and maava covers them all. Whether you’re a schoolchild, a college or university student, a trainee doctor, a health professional, a finance trainee or a researcher, maava supports your learning and training in every subject and at every level.",
  subline:
    "And for schools, colleges, universities and training providers, maava’s automation agents handle the work behind the scenes, from emails and admissions to invoices, timetables and reporting. Everything education needs, from A to Z. Created by a non-profit community of AI developers, and free for education.",
  ask: "Teaching, learning or running a school? Ask maava.",
  description:
    "maavaDao brings together agentic AI and blockchain technologies to create an open, community-owned ecosystem for education. Developers build and list AI agents on the maava Marketplace; educators, students and content creators use them for free. When a product earns money, 60% rewards the contributors who built it and 40% helps children in need: deserving children, orphans and street children, through maava's schools.",
  mission:
    "To build a community-owned ecosystem of agentic AI for education, where every contribution is a recorded stake in what the community builds, and a share of every success funds education for the children who need it most.",
  // TODO: confirm the contact inbox and replace the placeholder community links.
  email: "[yet to be added]",
  links: {
    github: "https://github.com/maavadao",
    agentsGithub: "https://github.com/Maava-Community-Agents",
    discord: "https://discord.gg/your-invite-code",
    x: "https://x.com/maavadao",
  },
};

/** False while site.email is still the "[yet to be added]" placeholder. */
export const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email);

export const nav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/directory", label: "Directory" },
  { href: "/repos", label: "AI repos" },
  { href: "/developers", label: "Developers" },
  { href: "/agents", label: "Agents" },
  { href: "/chat", label: "maava AI" },
  { href: "/vote", label: "Vote" },
  { href: "/#governance", label: "Governance" },
  { href: "/get-involved", label: "Get involved" },
];

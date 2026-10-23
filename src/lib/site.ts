export const site = {
  name: "maavaDao",
  long: "Community-Governed AI & Blockchain Technologies for Education",
  url: "https://maavadao.com",
  tagline:
    "Build it. Own it. Share it. Free for everyone, with a share of every success going to children who need it most.",
  subline: "Contribute and get rewarded for your work, while helping children in need.",
  description:
    "maavaDao brings together agentic AI and blockchain technologies to create an open, community-owned ecosystem for education. Developers build and list AI agents on the maava Marketplace; educators, students and content creators use them for free. When a product earns money, 60% rewards the contributors who built it and 40% helps children in need: deserving children, orphans and street children, through maava's schools.",
  mission:
    "To build a community-owned ecosystem of agentic AI for education, where every contribution is a recorded stake in what the community builds, and a share of every success funds education for the children who need it most.",
  // TODO: confirm the contact inbox and replace the placeholder community links.
  email: "[yet to be added]",
  links: {
    github: "https://github.com/maavadao",
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
  { href: "/vote", label: "Vote" },
  { href: "/#governance", label: "Governance" },
  { href: "/get-involved", label: "Get involved" },
];

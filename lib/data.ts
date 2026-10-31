export type Dataset = "DB1" | "DB2";

export type DrugRecord = {
  id: string;
  dataset: Dataset;
  name: string;
  company: string;
  partner: string;
  route: string;
  device: string;
  dose: string;
  phase: string;
  indication: string;
  therapyArea: string;
  frequency: string;
  pharmacology: string;
  volume?: string;
};

export const services = [
  { title: "Commercial Strategy", eyebrow: "01", text: "Frame delivery choices around market needs, differentiation, and practical commercialization decisions." },
  { title: "Drug Delivery Assessment", eyebrow: "02", text: "Evaluate route, device, formulation, and volume considerations with a focused delivery lens." },
  { title: "Business Development", eyebrow: "03", text: "Translate technical signals into partner conversations, opportunity maps, and next steps." },
  { title: "Competitive Intelligence", eyebrow: "04", text: "Bring scattered delivery signals into a clear, decision-ready view for your team." }
];

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Publications", href: "/publications" },
  { label: "Contact", href: "/contact" }
];


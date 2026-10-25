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

export const demoRecords: DrugRecord[] = [
  {
    id: "demo-001",
    dataset: "DB1",
    name: "Example SubQ Candidate A",
    company: "Demo company — confirm",
    partner: "Not available",
    route: "Subcutaneous",
    device: "Autoinjector / demo record",
    dose: "Not available",
    phase: "Demo status",
    indication: "Illustrative record only",
    therapyArea: "Drug delivery",
    frequency: "Not available",
    pharmacology: "Not available",
    volume: "Not available"
  },
  {
    id: "demo-002",
    dataset: "DB1",
    name: "Example High-Volume Formulation",
    company: "Placeholder pending schema review",
    partner: "Not available",
    route: "Subcutaneous",
    device: "On-body delivery system",
    dose: "Not available",
    phase: "Demo status",
    indication: "Illustrative record only",
    therapyArea: "Formulation strategy",
    frequency: "Not available",
    pharmacology: "Not available",
    volume: "Not available"
  },
  {
    id: "demo-003",
    dataset: "DB2",
    name: "Example Injectable Asset B",
    company: "Demo company — confirm",
    partner: "Not available",
    route: "Injectable",
    device: "Prefilled syringe / demo record",
    dose: "Not available",
    phase: "Demo status",
    indication: "Illustrative record only",
    therapyArea: "Injectable delivery",
    frequency: "Not available",
    pharmacology: "Not available"
  }
];

export const services = [
  { title: "Commercial Strategy", eyebrow: "01", text: "Frame delivery choices around market needs, differentiation, and practical commercialization decisions." },
  { title: "Drug Delivery Assessment", eyebrow: "02", text: "Evaluate route, device, formulation, and volume considerations with a focused delivery lens." },
  { title: "Business Development", eyebrow: "03", text: "Translate technical signals into partner conversations, opportunity maps, and next steps." },
  { title: "Competitive Intelligence", eyebrow: "04", text: "Bring scattered delivery signals into a clear, decision-ready view for your team." }
];

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Leadership", href: "/leadership" },
  { label: "Services", href: "/services" },
  { label: "Drug Insights", href: "/drug-insights" },
  { label: "Clients", href: "/clients" },
  { label: "Contact", href: "/contact" }
];


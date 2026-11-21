export interface HeroContent {
  badge: string;
  title_line1: string;
  title_highlight: string;
  title_line2: string;
  title_line3: string;
  title_line4: string;
  description: string;
  primary_btn_text: string;
  primary_btn_link: string;
  banner_image: string;
  banner_image_alt: string;
  banner_images?: string[];
  citation?: string;
}

export interface StrategicLeadershipContent {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  image_alt: string;
}

export interface LeadershipSpotlightContent {
  name: string;
  role_badge: string;
  title_subtitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  image_alt: string;
  badge_text: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  points?: string[];
}

export interface FocusedAreaItem {
  tag: string;
  title: string;
  description: string;
  footer: string;
  image: string;
}

export interface TestimonialItem {
  logo: string;
  quote: string;
  attribution: string;
}

export interface ExpertiseSectionContent {
  title: string;
  badge: string;
  lead_text: string;
  slider_images: string[];
}

export interface HomePageContent {
  hero: HeroContent;
  strategic_leadership: StrategicLeadershipContent;
  leadership_spotlight: LeadershipSpotlightContent;
  services_list: ServiceItem[];
  focused_areas: FocusedAreaItem[];
  testimonials: TestimonialItem[];
  expertise_section?: ExpertiseSectionContent;
}

export interface OperatingPrinciple {
  icon: string;
  title: string;
  text: string;
}

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  intro_p1: string;
  intro_p2: string;
  principles_eyebrow: string;
  principles_title: string;
  principles_description: string;
  principles: OperatingPrinciple[];
  footnote: string;
}

export interface ContactPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  email: string;
  location: string;
  phone: string;
  leadership_name: string;
  leadership_role: string;
  summary: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  authors: string;
  journal: string;
  volume: string;
  year: string;
  doi?: string;
  link?: string;
  badge?: string;
  status?: string;
}

export interface PublicationsPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: PublicationItem[];
}

export interface SiteContentSchema {
  home: HomePageContent;
  about: AboutPageContent;
  contact: ContactPageContent;
  publications: PublicationsPageContent;
}

export const defaultHomePageContent: HomePageContent = {
  hero: {
    badge: "Drug Delivery Advisory",
    title_line1: "CHESAPEAKE PHARMA:",
    title_highlight: "STRATEGIC DRUG DELIVERY",
    title_line2: "AND PHARMACEUTICAL",
    title_line3: "PIPELINE INSIGHTS",
    title_line4: "",
    description:
      "Expert guidance on combination products, novel injectables, and IV-to-subcutaneous transitions to derisk pharmaceutical pipeline investments.",
    primary_btn_text: "SCHEDULE A CONSULTATION",
    primary_btn_link: "/contact",
    banner_image: "/assets/docx_images/image2.png",
    banner_image_alt: "Chesapeake Pharma consulting banner",
    banner_images: [
      "/assets/docx_images/image2.png",
      "/assets/docx_images/image3.png",
      "/assets/docx_images/image4.jpeg"
    ],
    citation:
      "*From: Lyness A, Burke J. Investigating imaging modalities to characterize injection deposition for LVSC device design. PDA Universe of Pre-Filled Syringes and Injection Devices; 2026 Oct 6-7; Palm Springs, CA, USA."
  },
  strategic_leadership: {
    title: "Advancing Drug Delivery & Biologics Commercialization",
    subtitle: "Strategic guidance for novel drug-device combination products, injectables, and portfolio evolution",
    paragraph1:
      "With over four decades of experience across global pharma and medical technology—including executive roles at Merck, Becton-Dickinson, and Novartis (Zyma SA)—Chesapeake Pharma under the leadership of Dr Phil Green provides commercial and strategic advisory services to pharmaceutical innovators and drug delivery developers.",
    paragraph2:
      "Backed by a doctoral foundation in pharmaceutical chemistry, he specializes in translating complex drug-device technologies into viable market leaders, offering deep expertise in combination product positioning, competitive intelligence, and IV-to-subcutaneous formulation transitions that optimize emerging pipelines and elevate patient-centric care.",
    image: "/assets/Picture1.png",
    image_alt: "Advancing drug delivery and biologics commercialization"
  },
  leadership_spotlight: {
    name: "Philip Green, Ph.D.",
    role_badge: "President",
    title_subtitle: "President & Founder, Chesapeake Pharma LLC · Weehawken, NJ, USA",
    paragraph1:
      "Dr. Green specializes in the commercialization of drug delivery technologies, spanning commercial strategy and market positioning of combination products including novel injectables, and high dose/large volume subcutaneous products. Currently, he consults with leading biopharmaceutical companies, packaging and drug delivery companies, on commercial strategies, business development, competitive intelligence, and trend analysis of emerging pharma pipelines.",
    paragraph2:
      "Previously Dr Green served as Executive Director of Biologics Device Strategy at Merck US. In this role, he developed and executed commercial device strategies for multiple launched biosimilar and oncology-focused combination products, including leading commercial efforts for a new SC formulation of the anti-cancer agent Pembrolizumab (Keytruda®). Before Merck, Phil spent 16 years at Becton-Dickinson, where he led advanced delivery technology initiatives, forming key partnerships with pharmaceutical companies. His work focused on technologies such as transdermal, intradermal, microneedle delivery systems, high-volume subcutaneous pumps, and various self-injection devices. Prior to Becton-Dickinson, Phil held several roles within transdermal and topical drug delivery at Novartis (Zyma) and L’Oréal/Galderma. Dr Green holds a BSc in Chemistry and an MSc in Medical Sciences from Bristol University (UK), a PhD in Pharmaceutical Chemistry from University of Wales, Cardiff (Welsh School of Pharmacy), and completed his post-doctoral training at the University of California, San Francisco.",
    image: "/assets/image.png",
    image_alt: "Philip Green, Ph.D. — President, Chesapeake Pharma",
    badge_text: "Verified Biopharma Executive"
  },
  expertise_section: {
    title: "EXPERTISE",
    badge: "Key Services",
    lead_text:
      "With over four decades of experience across global pharma and medical technology—including executive roles at Merck, Becton-Dickinson, and Novartis (Zyma SA)—Chesapeake Pharma under the leadership of Dr Phil Green provides commercial and strategic advisory services to pharmaceutical innovators and drug delivery developers.",
    slider_images: [
      "/assets/docx_images/image6.png",
      "/assets/docx_images/image7.jpeg",
      "/assets/docx_images/image8.png",
      "/assets/docx_images/image9.png",
      "/assets/docx_images/image5.png"
    ]
  },
  services_list: [
    {
      title: "Strategic Guidance",
      description:
        "Commercial and technological guidance across complex drug/device combination systems and novel skin-based formulations.",
      icon: "CommercialStrategy",
      points: [
        "Drug/device combination products",
        "High dose/large volume subcutaneous delivery",
        "Novel injectable and skin-based delivery technologies"
      ]
    },
    {
      title: "Business Development",
      description:
        "Actionable partnership opportunities, matching molecules to delivery platforms, and comprehensive commercial forecasting.",
      icon: "BusinessDev",
      points: [
        "Opportunity assessment (matching drugs to devices)",
        "High level commercial forecasting",
        "Deal structuring"
      ]
    },
    {
      title: "Pharmaceutical Pipeline Assessments",
      description:
        "Rigorous intelligence and trend monitoring across global developmental biopharmaceutical pipelines.",
      icon: "CompetitiveIntel",
      points: [
        "Identification of key emerging trends",
        "Competitive Intelligence."
      ]
    }
  ],
  focused_areas: [
    {
      tag: "Biologics Modality",
      title: "Monoclonal Antibodies (mAbs)",
      description:
        "Strategic commercialization and device selection for standard and high-concentration mAbs transitioning from hospital IV infusions to rapid, patient-administered subcutaneous formulations.",
      footer: "SC formulation & autoinjector integration",
      image: "/assets/monoclonal antibodies 1.png"
    },
    {
      tag: "Dual-Targeting",
      title: "Bispecific Antibodies",
      description:
        "Navigating complex dose optimization, target affinity balance, immunogenicity risks, and wearable infuser requirements for next-generation multi-specific antibody formats.",
      footer: "T-cell engagers & on-body delivery",
      image: "/assets/bispecific antibodies 1.png"
    },
    {
      tag: "Genetic Medicines",
      title: "Nucleic Acids & Oligonucleotides",
      description:
        "Formulation stabilization, lipid nanoparticle (LNP) delivery pathways, cold-chain considerations, and target delivery routing across mRNA, siRNA, and gene therapies.",
      footer: "mRNA, siRNA & LNP delivery pathways",
      image: "/assets/nucleic acids 1.png"
    }
  ],
  testimonials: [
    {
      logo: "Merck",
      quote: "Dr. Green pharmaceutical clients to penetration pharma pharmaceutical company key clients.",
      attribution: "Biologics Device Advisory"
    },
    {
      logo: "Novartis",
      quote: "Dr. Green has a highest pharmaceutical sporadically inovartis.",
      attribution: "Combination Strategy Review"
    },
    {
      logo: "Novartis",
      quote: "Dr. Green has distinguished pharmaceutical surg strategy and usen imvental nnovartis.",
      attribution: "Subcutaneous Transition"
    },
    {
      logo: "Merck",
      quote: "Dr. Green has euntelization pharmaceutical analytics and consultantfy pharmaceutial dest.",
      attribution: "Formulation Analytics Lead"
    }
  ]
};

export const defaultAboutPageContent: AboutPageContent = {
  eyebrow: "About Chesapeake Pharma",
  title: "A clearer delivery conversation.",
  intro_p1:
    "Chesapeake Pharma is building a specialized consulting and intelligence platform for drug-delivery decisions across pharmaceutical and biotech teams.",
  intro_p2:
    "This initial site is a reviewable product foundation. Company history, leadership biographies, client relationships, and contact details remain placeholders until verified source material is approved.",
  principles_eyebrow: "Operating principles",
  principles_title: "Useful enough for the next decision.",
  principles_description:
    "The experience is designed around the way specialist teams actually work: clarify the question, find the signal, and make the trade-off explicit.",
  principles: [
    {
      icon: "Compass",
      title: "Context first",
      text: "Delivery decisions only make sense in their technical and commercial context."
    },
    {
      icon: "Eye",
      title: "Signal over noise",
      text: "A clean view of the relevant fields is more useful than another crowded dashboard."
    },
    {
      icon: "Scale",
      title: "Transparent boundaries",
      text: "Known, unknown, demo, pending, and active states should never be blurred."
    }
  ],
  footnote: "Content placeholders are intentionally marked for owner confirmation."
};

export const defaultContactPageContent: ContactPageContent = {
  eyebrow: "Contact",
  title: "Bring us the question behind the question.",
  subtitle: "Use this draft form to frame a conversation.",
  email: "chesapeakepharm@gmail.com",
  location: "Weehawken, NJ, USA",
  phone: "",
  leadership_name: "Philip Green, Ph.D.",
  leadership_role: "President, Chesapeake Pharma LLC",
  summary:
    "Specialized commercial strategy and technical advisory for drug delivery technologies, device integration, and IV-to-subcutaneous formulation transitions."
};

export const defaultPublicationsPageContent: PublicationsPageContent = {
  eyebrow: "Research & Insights",
  title: "Publications & Industry Papers",
  subtitle:
    "Peer-reviewed literature, systematic reviews, and industry insights on subcutaneous formulation, combination products, and biologics delivery technology.",
  items: [
    {
      id: "pub-1",
      title:
        "Navigating large-volume subcutaneous injections of biopharmaceuticals: a systematic review of clinical pipelines and approved products",
      authors: "Green, P., Schneider, A., & Lange, J.",
      journal: "mAbs",
      volume: "16(1)",
      year: "2024",
      doi: "https://doi.org/10.1080/19420862.2024.2402713",
      link: "https://doi.org/10.1080/19420862.2024.2402713",
      badge: "Systematic Review",
      status: "Published"
    },
    {
      id: "pub-2",
      title: "The arrival of subcutaneous antineoplastic cancer therapies",
      authors: "Green P, Lyness A, Mlynarczyk A and Burgess B",
      journal: "Cancer Treatment Reviews",
      volume: "in press",
      year: "2026",
      doi: "",
      link: "",
      badge: "Oncology Delivery",
      status: "In Press"
    }
  ]
};


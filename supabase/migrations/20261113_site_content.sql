-- =========================================================================
-- Migration: Create single site_content table for all dynamic website data
-- =========================================================================

-- 1. Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_content
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content"
  ON public.site_content
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admins to update/insert site content
DROP POLICY IF EXISTS "Admins can insert and update site content" ON public.site_content;
CREATE POLICY "Admins can insert and update site content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role bypasses RLS automatically.

-- 2. Seed default data for all sections
INSERT INTO public.site_content (key, data, updated_at)
VALUES
(
  'home',
  '{
    "hero": {
      "badge": "Drug Delivery Advisory",
      "title_line1": "CHESAPEAKE PHARMA:",
      "title_highlight": "DELIVERING STRATEGIC DRUG",
      "title_line2": "INSIGHTS & DELIVERY",
      "title_line3": "TECHNOLOGY",
      "title_line4": "COMMERCIALIZATION",
      "description": "Expert guidance on combination products, novel injectables, and IV-to-subcutaneous transitions to derisk pharmaceutical pipeline investments.",
      "primary_btn_text": "SCHEDULE A CONSULTATION",
      "primary_btn_link": "/contact",
      "secondary_btn_text": "Explore Key Services",
      "secondary_btn_link": "/services",
      "banner_image": "/assets/banner.png",
      "banner_image_alt": "Dr. Philip Green in biotechnology consulting laboratory"
    },
    "strategic_leadership": {
      "title": "Advancing Drug Delivery & Biologics Commercialization",
      "subtitle": "Strategic guidance for novel drug-device combination products, injectables, and portfolio evolution",
      "paragraph1": "With over three decades of leadership across global pharma and medical technology—including executive roles at Merck, Becton-Dickinson, and Novartis—Chesapeake Pharma under the leadership of Phil provides high-impact commercial and strategic advisory services to pharmaceutical innovators and drug delivery developers.",
      "paragraph2": "Backed by a doctoral foundation in pharmaceutical chemistry, he specializes in translating complex drug-device technologies into viable market leaders, offering deep expertise in combination product positioning, competitive intelligence, and IV-to-subcutaneous formulation transitions that optimize emerging pipelines and elevate patient-centric care.",
      "image": "/assets/Picture1.png",
      "image_alt": "Advancing drug delivery and biologics commercialization"
    },
    "leadership_spotlight": {
      "name": "Philip Green, Ph.D.",
      "role_badge": "President",
      "title_subtitle": "President & Founder, Chesapeake Pharma LLC · Weehawken, NJ, USA",
      "paragraph1": "Dr. Green has a distinguished career specializing in the commercialization of drug delivery technologies, spanning commercial strategy and market positioning of combination products, novel injectables, and IV-to-subcutaneous transitions. Currently, he consults with leading pharmaceutical and biotech companies on commercial strategy, business development, and pipeline optimization.",
      "paragraph2": "Previously, Dr. Green served as Executive Director of Biologics Device Strategy at Merck US (where he led Keytruda SubQ formulation marketing), and spent 16 years at Becton-Dickinson directing advanced delivery initiatives (transdermal, microneedle, and high-volume subcutaneous pumps). He holds a PhD in Pharmaceutical Chemistry from Cardiff University and completed post-doctoral training at the University of California, San Francisco (UCSF).",
      "image": "/assets/image.png",
      "image_alt": "Philip Green, Ph.D. — President, Chesapeake Pharma",
      "badge_text": "Verified Biopharma Executive"
    },
    "services_list": [
      {
        "title": "Commercial\nStrategy",
        "description": "Frame delivery choices around market needs, physician adoption, competitive differentiation, and practical payer positioning.",
        "icon": "CommercialStrategy"
      },
      {
        "title": "Drug Delivery\nAssessment",
        "description": "Evaluate route, device, autoinjector, and large-volume formulation compatibility to select optimal combination systems.",
        "icon": "DrugDelivery"
      },
      {
        "title": "Business\nDevelopment",
        "description": "Translate technical delivery signals into strategic partnership structures, licensing agreements, and co-development terms.",
        "icon": "BusinessDev"
      },
      {
        "title": "Competitive\nIntelligence",
        "description": "Continuously monitor competing drug delivery technologies, patent landscapes, formulation patents, and competitor pipeline milestones.",
        "icon": "CompetitiveIntel"
      }
    ],
    "focused_areas": [
      {
        "tag": "Biologics Modality",
        "title": "Monoclonal Antibodies (mAbs)",
        "description": "Strategic commercialization and device selection for standard and high-concentration mAbs transitioning from hospital IV infusions to rapid, patient-administered subcutaneous formulations.",
        "footer": "SC formulation & autoinjector integration",
        "image": "/assets/monoclonal antibodies 1.png"
      },
      {
        "tag": "Dual-Targeting",
        "title": "Bispecific Antibodies",
        "description": "Navigating complex dose optimization, target affinity balance, immunogenicity risks, and wearable infuser requirements for next-generation multi-specific antibody formats.",
        "footer": "T-cell engagers & on-body delivery",
        "image": "/assets/bispecific antibodies 1.png"
      },
      {
        "tag": "Genetic Medicines",
        "title": "Nucleic Acids & Oligonucleotides",
        "description": "Formulation stabilization, lipid nanoparticle (LNP) delivery pathways, cold-chain considerations, and target delivery routing across mRNA, siRNA, and gene therapies.",
        "footer": "mRNA, siRNA & LNP delivery pathways",
        "image": "/assets/nucleic acids 1.png"
      }
    ],
    "testimonials": [
      {
        "logo": "Merck",
        "quote": "Dr. Green pharmaceutical clients to penetration pharma pharmaceutical company key clients.",
        "attribution": "Biologics Device Advisory"
      },
      {
        "logo": "Novartis",
        "quote": "Dr. Green has a highest pharmaceutical sporadically inovartis.",
        "attribution": "Combination Strategy Review"
      },
      {
        "logo": "Novartis",
        "quote": "Dr. Green has distinguished pharmaceutical surg strategy and usen imvental nnovartis.",
        "attribution": "Subcutaneous Transition"
      },
      {
        "logo": "Merck",
        "quote": "Dr. Green has euntelization pharmaceutical analytics and consultantfy pharmaceutial dest.",
        "attribution": "Formulation Analytics Lead"
      }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE
SET data = EXCLUDED.data, updated_at = now();

INSERT INTO public.site_content (key, data, updated_at)
VALUES
(
  'about',
  '{
    "eyebrow": "About Chesapeake Pharma",
    "title": "A clearer delivery conversation.",
    "intro_p1": "Chesapeake Pharma is building a specialized consulting and intelligence platform for drug-delivery decisions across pharmaceutical and biotech teams.",
    "intro_p2": "This initial site is a reviewable product foundation. Company history, leadership biographies, client relationships, and contact details remain placeholders until verified source material is approved.",
    "principles_eyebrow": "Operating principles",
    "principles_title": "Useful enough for the next decision.",
    "principles_description": "The experience is designed around the way specialist teams actually work: clarify the question, find the signal, and make the trade-off explicit.",
    "principles": [
      {
        "icon": "Compass",
        "title": "Context first",
        "text": "Delivery decisions only make sense in their technical and commercial context."
      },
      {
        "icon": "Eye",
        "title": "Signal over noise",
        "text": "A clean view of the relevant fields is more useful than another crowded dashboard."
      },
      {
        "icon": "Scale",
        "title": "Transparent boundaries",
        "text": "Known, unknown, demo, pending, and active states should never be blurred."
      }
    ],
    "footnote": "Content placeholders are intentionally marked for owner confirmation."
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE
SET data = EXCLUDED.data, updated_at = now();

INSERT INTO public.site_content (key, data, updated_at)
VALUES
(
  'contact',
  '{
    "eyebrow": "Contact",
    "title": "Bring us the question behind the question.",
    "subtitle": "Use this draft form to frame a conversation.",
    "email": "Philgreen2236@hotmail.com",
    "location": "Weehawken, NJ, USA",
    "phone": "",
    "leadership_name": "Philip Green, Ph.D.",
    "leadership_role": "President, Chesapeake Pharma LLC",
    "summary": "Specialized commercial strategy and technical advisory for drug delivery technologies, device integration, and IV-to-subcutaneous formulation transitions."
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE
SET data = EXCLUDED.data, updated_at = now();

INSERT INTO public.site_content (key, data, updated_at)
VALUES
(
  'publications',
  '{
    "eyebrow": "Research & Insights",
    "title": "Publications & Industry Papers",
    "subtitle": "Peer-reviewed literature, systematic reviews, and industry insights on subcutaneous formulation, combination products, and biologics delivery technology.",
    "items": [
      {
        "id": "pub-1",
        "title": "Navigating large-volume subcutaneous injections of biopharmaceuticals: a systematic review of clinical pipelines and approved products",
        "authors": "Green, P., Schneider, A., & Lange, J.",
        "journal": "mAbs",
        "volume": "16(1)",
        "year": "2024",
        "doi": "https://doi.org/10.1080/19420862.2024.2402713",
        "link": "https://doi.org/10.1080/19420862.2024.2402713",
        "badge": "Systematic Review",
        "status": "Published"
      },
      {
        "id": "pub-2",
        "title": "The arrival of subcutaneous antineoplastic cancer therapies",
        "authors": "Green P, Lyness A, Mlynarczyk A and Burgess B",
        "journal": "Cancer Treatment Reviews",
        "volume": "in press",
        "year": "2026",
        "doi": "",
        "link": "",
        "badge": "Oncology Delivery",
        "status": "In Press"
      }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE
SET data = EXCLUDED.data, updated_at = now();


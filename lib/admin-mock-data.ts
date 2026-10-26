export interface AdminDrug {
  id: string;
  dataset_type: "DB1" | "DB2";
  drug_name: string;
  company: string;
  partner?: string;
  route: string;
  iv_shift_nce?: "IV to SC Shift" | "NCE Subcutaneous" | "Primary Injectable" | "N/A";
  type?: string;
  device_formulation?: string;
  dose?: string;
  iv_dose_mg?: string;
  sc_dose_mg?: string;
  est_sc_volume_ml?: string;
  frequency?: string;
  phase: string;
  pharmacology?: string;
  indication: string;
  field?: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  references?: Array<{
    id: string;
    source: string;
    title: string;
    year?: string;
    url?: string;
  }>;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  role: "admin" | "subscriber";
  approval_status: "pending" | "approved" | "rejected";
  requested_packs: "DB1" | "DB2" | "DB1 & DB2";
  created_at: string;
  last_sign_in?: string;
  notes?: string;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  company_name: string;
  dataset_type: "DB1" | "DB2";
  status: "active" | "expired" | "pending" | "deactivated";
  starts_at: string;
  expires_at: string;
  renewal_date: string;
  activated_by: string;
  payment_reference: string;
  admin_notes: string;
  created_at: string;
}

export interface AdminImportJob {
  id: string;
  dataset_type: "DB1" | "DB2";
  file_name: string;
  file_size_kb: number;
  uploaded_by: string;
  status: "completed" | "failed" | "processing" | "staged";
  total_rows: number;
  inserted_count: number;
  updated_count: number;
  skipped_count: number;
  failed_count: number;
  created_at: string;
  matching_strategy: "drug_name_company" | "compound_id" | "exact_match";
  errors?: string[];
}

export const INITIAL_MOCK_DRUGS: AdminDrug[] = [
  // DB1 Records (High-volume subcutaneous)
  {
    id: "db1-001",
    dataset_type: "DB1",
    drug_name: "Trastuzumab (Herceptin SC)",
    company: "Roche / Genentech",
    partner: "Halozyme Therapeutics",
    route: "Subcutaneous",
    iv_shift_nce: "IV to SC Shift",
    type: "Monoclonal Antibody (HER2)",
    device_formulation: "Vial with recombinant human hyaluronidase (rHuPH20)",
    dose: "600 mg fixed dose",
    iv_dose_mg: "8 mg/kg loading, 6 mg/kg maintenance",
    sc_dose_mg: "600 mg",
    est_sc_volume_ml: "5.0 mL",
    frequency: "Every 3 weeks",
    phase: "Approved / Commercial",
    pharmacology: "HER2/neu receptor antagonist",
    indication: "HER2-positive breast cancer",
    field: "Oncology",
    entry_date: "2024-01-15",
    created_at: "2024-01-15T09:30:00Z",
    updated_at: "2024-06-12T14:20:00Z",
    references: [
      { id: "ref-1", source: "FDA Package Insert", title: "Herceptin Hylecta Approval Label", year: "2019", url: "https://fda.gov" },
      { id: "ref-2", source: "Lancet Oncology", title: "HannaH phase 3 study of subcutaneous trastuzumab", year: "2012" }
    ]
  },
  {
    id: "db1-002",
    dataset_type: "DB1",
    drug_name: "Daratumumab (Darzalex Faspro)",
    company: "Johnson & Johnson",
    partner: "Halozyme Therapeutics",
    route: "Subcutaneous",
    iv_shift_nce: "IV to SC Shift",
    type: "Monoclonal Antibody (CD38)",
    device_formulation: "Co-formulation with rHuPH20 (1,800 mg / 30,000 U)",
    dose: "1,800 mg fixed dose",
    iv_dose_mg: "16 mg/kg IV infusion (3-7 hours)",
    sc_dose_mg: "1,800 mg",
    est_sc_volume_ml: "15.0 mL",
    frequency: "Weekly to monthly depending on cycle",
    phase: "Approved / Commercial",
    pharmacology: "CD38-directed cytolytic antibody",
    indication: "Multiple myeloma, Light chain amyloidosis",
    field: "Hematology / Oncology",
    entry_date: "2024-02-10",
    created_at: "2024-02-10T11:00:00Z",
    updated_at: "2024-08-01T16:45:00Z",
    references: [
      { id: "ref-3", source: "Blood Journal", title: "COLUMBA Phase 3 Non-inferiority Study", year: "2020" }
    ]
  },
  {
    id: "db1-003",
    dataset_type: "DB1",
    drug_name: "Nivolumab SC (Opdivo SubQ)",
    company: "Bristol Myers Squibb",
    partner: "Halozyme Therapeutics",
    route: "Subcutaneous",
    iv_shift_nce: "IV to SC Shift",
    type: "PD-1 Inhibitor mAb",
    device_formulation: "Co-formulation with rHuPH20 manual syringe push (3-5 min)",
    dose: "1,200 mg co-formulated",
    iv_dose_mg: "240 mg Q2W or 480 mg Q4W",
    sc_dose_mg: "1,200 mg",
    est_sc_volume_ml: "10.0 mL",
    frequency: "Every 4 weeks",
    phase: "Registration / Under FDA Review",
    pharmacology: "Programmed death receptor-1 blocking antibody",
    indication: "Solid tumors across approved Opdivo indications",
    field: "Immuno-Oncology",
    entry_date: "2024-04-05",
    created_at: "2024-04-05T08:15:00Z",
    updated_at: "2024-09-18T10:30:00Z",
    references: [
      { id: "ref-4", source: "BMS Press Release", title: "CheckMate-67T Phase 3 Subcutaneous Study Results", year: "2024" }
    ]
  },
  {
    id: "db1-004",
    dataset_type: "DB1",
    drug_name: "Rozanolixizumab (Rystiggo)",
    company: "UCB Pharma",
    partner: "None (High-concentration standard SC)",
    route: "Subcutaneous",
    iv_shift_nce: "NCE Subcutaneous",
    type: "Humanized IgG4 anti-FcRn mAb",
    device_formulation: "Vial with syringe driver infusion system",
    dose: "Weight-tiered (<50kg: 420mg, 50-100kg: 840mg, >100kg: 1260mg)",
    iv_dose_mg: "N/A (Developed directly as SC)",
    sc_dose_mg: "420 - 1,260 mg",
    est_sc_volume_ml: "3.0 - 9.0 mL",
    frequency: "Once weekly for 6-week cycles",
    phase: "Approved / Commercial",
    pharmacology: "Neonatal Fc receptor (FcRn) blocker",
    indication: "Generalized Myasthenia Gravis (gMG)",
    field: "Neurology / Immunology",
    entry_date: "2024-05-20",
    created_at: "2024-05-20T13:25:00Z",
    updated_at: "2024-07-22T09:10:00Z"
  },
  {
    id: "db1-005",
    dataset_type: "DB1",
    drug_name: "Pegcetacoplan (Empaveli)",
    company: "Apellis Pharmaceuticals",
    partner: "Enable Injections (enFuse)",
    route: "Subcutaneous",
    iv_shift_nce: "NCE Subcutaneous",
    type: "Targeted C3 Complement Inhibitor peptide",
    device_formulation: "On-body delivery system / wearable infuser (20 mL syringe)",
    dose: "1,080 mg twice weekly",
    iv_dose_mg: "N/A",
    sc_dose_mg: "1,080 mg",
    est_sc_volume_ml: "20.0 mL",
    frequency: "Twice weekly (or every 3 days)",
    phase: "Approved / Commercial",
    pharmacology: "Synthetic cyclic peptide regulating C3 complement",
    indication: "Paroxysmal nocturnal hemoglobinuria (PNH)",
    field: "Hematology",
    entry_date: "2024-06-11",
    created_at: "2024-06-11T15:00:00Z",
    updated_at: "2024-08-30T11:20:00Z"
  },

  // DB2 Records (Broad injectable drug database)
  {
    id: "db2-001",
    dataset_type: "DB2",
    drug_name: "Dupilumab (Dupixent)",
    company: "Sanofi / Regeneron",
    partner: "Sanofi",
    route: "Subcutaneous Injectable",
    type: "Fully human mAb (IL-4Rα)",
    device_formulation: "Prefilled syringe with needle shield & prefilled pen autoinjector",
    dose: "300 mg / 2 mL or 200 mg / 1.14 mL",
    frequency: "Every 2 weeks",
    phase: "Approved / Commercial",
    pharmacology: "Dual inhibitor of IL-4 and IL-13 signaling",
    indication: "Atopic dermatitis, Asthma, CRSwNP, Prurigo nodularis, EoE, COPD",
    field: "Immunology / Respiratory",
    entry_date: "2024-02-14",
    created_at: "2024-02-14T10:00:00Z",
    updated_at: "2024-09-02T16:15:00Z",
    references: [
      { id: "ref-5", source: "NEJM", title: "Two Phase 3 Trials of Dupilumab in Atopic Dermatitis", year: "2016" }
    ]
  },
  {
    id: "db2-002",
    dataset_type: "DB2",
    drug_name: "Tirzepatide (Mounjaro / Zepbound)",
    company: "Eli Lilly and Company",
    partner: "None",
    route: "Subcutaneous Injectable",
    type: "Dual GIP and GLP-1 Receptor Agonist synthetic peptide",
    device_formulation: "Single-dose auto-injector pen (0.5 mL)",
    dose: "2.5 mg to 15 mg weekly escalation",
    frequency: "Once weekly",
    phase: "Approved / Commercial",
    pharmacology: "Glucose-dependent insulinotropic polypeptide & GLP-1 receptor agonist",
    indication: "Type 2 Diabetes, Chronic Weight Management",
    field: "Endocrinology / Cardiometabolic",
    entry_date: "2024-03-01",
    created_at: "2024-03-01T11:45:00Z",
    updated_at: "2024-09-15T14:10:00Z"
  },
  {
    id: "db2-003",
    dataset_type: "DB2",
    drug_name: "Teclistamab (Tecvayli)",
    company: "Janssen / Johnson & Johnson",
    partner: "Genmab (DuoBody platform)",
    route: "Subcutaneous Injectable",
    type: "Bispecific BCMA × CD3 T-cell engaging antibody",
    device_formulation: "Single-dose vial for weight-based subcutaneous injection",
    dose: "Step-up dosing to 1.5 mg/kg maintenance",
    frequency: "Weekly or biweekly after response",
    phase: "Approved / Commercial",
    pharmacology: "Redirects CD3+ T cells to lyse BCMA-expressing myeloma cells",
    indication: "Relapsed/Refractory Multiple Myeloma",
    field: "Hematology / Oncology",
    entry_date: "2024-03-25",
    created_at: "2024-03-25T14:30:00Z",
    updated_at: "2024-07-10T12:00:00Z"
  },
  {
    id: "db2-004",
    dataset_type: "DB2",
    drug_name: "Semaglutide (Ozempic / Wegovy)",
    company: "Novo Nordisk",
    partner: "None",
    route: "Subcutaneous Injectable",
    type: "GLP-1 receptor agonist peptide",
    device_formulation: "Multi-dose and single-dose pen autoinjector",
    dose: "0.25 mg up to 2.4 mg weekly",
    frequency: "Once weekly",
    phase: "Approved / Commercial",
    pharmacology: "Selective GLP-1 receptor agonist",
    indication: "Type 2 diabetes, Obesity, Cardiovascular risk reduction",
    field: "Endocrinology / Cardiometabolic",
    entry_date: "2024-04-18",
    created_at: "2024-04-18T09:00:00Z",
    updated_at: "2024-08-20T13:40:00Z"
  },
  {
    id: "db2-005",
    dataset_type: "DB2",
    drug_name: "Ocrelizumab SC (Ocrevus SubQ)",
    company: "Roche / Genentech",
    partner: "Halozyme Therapeutics",
    route: "Subcutaneous Injectable",
    type: "Humanized anti-CD20 mAb",
    device_formulation: "Co-formulation with rHuPH20 (920 mg / 23,000 U in 23 mL)",
    dose: "920 mg fixed dose administered in ~10 mins",
    frequency: "Every 6 months (twice yearly)",
    phase: "Approved / Commercial (FDA Sept 2024)",
    pharmacology: "Selective B-cell CD20 depleting antibody",
    indication: "Relapsing MS and Primary Progressive MS",
    field: "Neurology",
    entry_date: "2024-09-28",
    created_at: "2024-09-28T16:00:00Z",
    updated_at: "2024-10-05T11:00:00Z"
  }
];

export const INITIAL_MOCK_USERS: AdminUser[] = [
  {
    id: "usr-001",
    full_name: "Dr. Eleanor Vance",
    email: "e.vance@novartis-pharma.com",
    company_name: "Novartis Pharmaceuticals",
    role: "subscriber",
    approval_status: "pending",
    requested_packs: "DB1 & DB2",
    created_at: "2026-10-24T08:14:00Z",
    notes: "Head of Formulation Innovation. Requesting research access for subcutaneous portfolio."
  },
  {
    id: "usr-002",
    full_name: "Marcus Lindqvist",
    email: "m.lindqvist@astrazeneca-biotech.com",
    company_name: "AstraZeneca Biologics",
    role: "subscriber",
    approval_status: "pending",
    requested_packs: "DB1",
    created_at: "2026-10-25T14:22:00Z",
    notes: "Device strategy lead evaluating high-volume on-body systems."
  },
  {
    id: "usr-003",
    full_name: "Dr. Sarah Chen",
    email: "sarah.chen@pfizer-delivery.com",
    company_name: "Pfizer Global R&D",
    role: "subscriber",
    approval_status: "approved",
    requested_packs: "DB1 & DB2",
    created_at: "2026-09-12T10:00:00Z",
    last_sign_in: "2026-10-22T16:30:00Z",
    notes: "Approved executive subscriber under annual agreement #AZ-2026-09."
  },
  {
    id: "usr-004",
    full_name: "David Thornton",
    email: "dthornton@amgen-strategy.com",
    company_name: "Amgen Inc.",
    role: "subscriber",
    approval_status: "approved",
    requested_packs: "DB2",
    created_at: "2026-08-01T09:15:00Z",
    last_sign_in: "2026-10-18T11:45:00Z",
    notes: "Commercial intelligence subscriber with single DB2 pack."
  },
  {
    id: "usr-005",
    full_name: "Julian Meyer",
    email: "jmeyer@unverified-domain.org",
    company_name: "Meyer Research Consult",
    role: "subscriber",
    approval_status: "rejected",
    requested_packs: "DB1 & DB2",
    created_at: "2026-10-15T18:00:00Z",
    notes: "Non-corporate email address and unverifiable corporate affiliation."
  },
  {
    id: "usr-000",
    full_name: "Philip Green, Ph.D.",
    email: "philgreen2236@hotmail.com",
    company_name: "Chesapeake Pharma LLC",
    role: "admin",
    approval_status: "approved",
    requested_packs: "DB1 & DB2",
    created_at: "2024-01-01T00:00:00Z",
    last_sign_in: "2026-10-26T07:30:00Z",
    notes: "Primary Administrator Profile."
  }
];

export const INITIAL_MOCK_SUBSCRIPTIONS: AdminSubscription[] = [
  // DB1 Subscription for Dr. Sarah Chen
  {
    id: "sub-101",
    user_id: "usr-003",
    user_name: "Dr. Sarah Chen",
    user_email: "sarah.chen@pfizer-delivery.com",
    company_name: "Pfizer Global R&D",
    dataset_type: "DB1",
    status: "active",
    starts_at: "2026-01-15",
    expires_at: "2027-01-15",
    renewal_date: "2026-12-15",
    activated_by: "Philip Green (Admin)",
    payment_reference: "WIRE-PFZ-2026-011",
    admin_notes: "Contract term: 1 Year Enterprise Subcutaneous intelligence pack.",
    created_at: "2026-01-15T10:00:00Z"
  },
  // DB2 Subscription for Dr. Sarah Chen (independent dates)
  {
    id: "sub-102",
    user_id: "usr-003",
    user_name: "Dr. Sarah Chen",
    user_email: "sarah.chen@pfizer-delivery.com",
    company_name: "Pfizer Global R&D",
    dataset_type: "DB2",
    status: "active",
    starts_at: "2026-04-01",
    expires_at: "2027-04-01",
    renewal_date: "2027-03-01",
    activated_by: "Philip Green (Admin)",
    payment_reference: "WIRE-PFZ-2026-048",
    admin_notes: "Added DB2 injectable database 3 months into contract.",
    created_at: "2026-04-01T14:30:00Z"
  },
  // DB2 Subscription for David Thornton
  {
    id: "sub-103",
    user_id: "usr-004",
    user_name: "David Thornton",
    user_email: "dthornton@amgen-strategy.com",
    company_name: "Amgen Inc.",
    dataset_type: "DB2",
    status: "active",
    starts_at: "2025-11-20",
    expires_at: "2026-11-20",
    renewal_date: "2026-10-20",
    activated_by: "Philip Green (Admin)",
    payment_reference: "INV-AMG-88219",
    admin_notes: "Renewal alert sent. Customer reviewing contract extension.",
    created_at: "2025-11-20T09:00:00Z"
  },
  // Expired DB1 Subscription for a former customer
  {
    id: "sub-104",
    user_id: "usr-009",
    user_name: "Helena Rostova",
    user_email: "h.rostova@bayer-delivery.de",
    company_name: "Bayer AG",
    dataset_type: "DB1",
    status: "expired",
    starts_at: "2025-08-01",
    expires_at: "2026-08-01",
    renewal_date: "2026-07-01",
    activated_by: "Philip Green (Admin)",
    payment_reference: "SEPA-BAY-9902",
    admin_notes: "Completed 1-year access cycle; project concluded.",
    created_at: "2025-08-01T11:00:00Z"
  }
];

export const INITIAL_MOCK_IMPORTS: AdminImportJob[] = [
  {
    id: "imp-001",
    dataset_type: "DB1",
    file_name: "2026_Q3_SubQ_HighVolume_Batch_v3.xlsx",
    file_size_kb: 485,
    uploaded_by: "Philip Green (Admin)",
    status: "completed",
    total_rows: 42,
    inserted_count: 38,
    updated_count: 4,
    skipped_count: 0,
    failed_count: 0,
    created_at: "2026-10-18T14:32:00Z",
    matching_strategy: "drug_name_company",
    errors: []
  },
  {
    id: "imp-002",
    dataset_type: "DB2",
    file_name: "Injectables_Catalog_2026_Master.csv",
    file_size_kb: 1250,
    uploaded_by: "Philip Green (Admin)",
    status: "completed",
    total_rows: 154,
    inserted_count: 140,
    updated_count: 12,
    skipped_count: 2,
    failed_count: 0,
    created_at: "2026-09-30T10:15:00Z",
    matching_strategy: "drug_name_company",
    errors: ["Row 14: Warning - phase text normalized to 'Phase 2'", "Row 88: Partner field empty; skipped partner linking"]
  },
  {
    id: "imp-003",
    dataset_type: "DB1",
    file_name: "SubQ_Draft_October_Update.xlsx",
    file_size_kb: 210,
    uploaded_by: "Philip Green (Admin)",
    status: "failed",
    total_rows: 18,
    inserted_count: 0,
    updated_count: 0,
    skipped_count: 0,
    failed_count: 18,
    created_at: "2026-10-10T09:40:00Z",
    matching_strategy: "drug_name_company",
    errors: [
      "Header verification failed: missing mandatory column 'device_formulation'",
      "Column 'est_sc_volume_ml' contained non-numeric strings on rows 4, 7, 12",
      "Import transaction rolled back automatically; no records altered"
    ]
  }
];

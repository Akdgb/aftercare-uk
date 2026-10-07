import type { IntakeFormData, ActionPlanTask } from "@/types";
import { getFaiths } from "@/lib/faith";

// Task IDs are stable slugs so saved progress survives changes to the plan.
// Plans saved before slugs existed stored progress under sequential numbers
// ("1", "2", …) — `legacyId` reproduces that numbering so `normaliseTaskKeys`
// can migrate them. Tasks added after the switch pass `legacy: false` and
// must not change the order of the legacy-numbered tasks.
let legacyCounter = 0;
function makeTask(
  id: string,
  overrides: Omit<ActionPlanTask, "id" | "status"> & { status?: ActionPlanTask["status"] },
  { legacy = true }: { legacy?: boolean } = {}
): ActionPlanTask & { legacyId?: string } {
  const task: ActionPlanTask & { legacyId?: string } = { id, status: "pending", ...overrides };
  if (legacy) task.legacyId = String(++legacyCounter);
  return task;
}

/**
 * Converts a saved status/assignee map that may use legacy numeric keys into
 * one keyed by stable slugs. Slug keys win over legacy keys when both exist.
 */
export function normaliseTaskKeys(
  data: IntakeFormData,
  saved: Record<string, string> | null | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!saved) return out;
  for (const task of buildTasks(data)) {
    if (task.legacyId && saved[task.legacyId] !== undefined) out[task.id] = saved[task.legacyId];
    if (saved[task.id] !== undefined) out[task.id] = saved[task.id];
  }
  return out;
}

export function generateActionPlan(data: IntakeFormData): ActionPlanTask[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return buildTasks(data).map(({ legacyId, ...task }) => task);
}

function buildTasks(data: IntakeFormData) {
  legacyCounter = 0;
  const tasks: (ActionPlanTask & { legacyId?: string })[] = [];

  // ── Immediate ──────────────────────────────────────────────────────────────
  if (data.currentLocation === "hospital" || data.currentLocation === "hospice") {
    tasks.push(
      makeTask("collect-mccd", {
        title: "Collect Medical Certificate of Cause of Death (MCCD)",
        description:
          "Ask the hospital or hospice doctor for the MCCD. You will need this to register the death.",
        category: "immediate",
        priority: "urgent",
        link: "https://www.gov.uk/register-a-death",
      })
    );
  }

  if (data.currentLocation !== "funeral-director") {
    tasks.push(
      makeTask("contact-funeral-director", {
        title: "Contact a funeral director",
        description:
          "A funeral director can collect the deceased and advise you on next steps. You are not obliged to choose the first one you contact.",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  tasks.push(
    makeTask(
      "compare-funeral-prices",
      {
        title: "Compare funeral prices before you agree",
        description:
          "Prices for the same funeral can differ by thousands of pounds. Get two or three quotes in writing and see our simple ways to save — you can change funeral director even after they've collected the body.",
        category: "financial",
        priority: "urgent",
        link: "/help/save-money",
      },
      { legacy: false }
    )
  );

  tasks.push(
    makeTask("register-death", {
      title: "Register the death",
      description: `You must register ${data.deceasedFirstName}'s death within 5 days in England, Wales, and Northern Ireland (8 days in Scotland). Visit your local register office.`,
      category: "immediate",
      priority: "urgent",
      link: "https://www.gov.uk/register-a-death/find-register-office",
    }),
    makeTask("notify-family", {
      title: "Notify immediate family and close friends",
      description: "Let people know as soon as you feel ready. You don't have to contact everyone at once.",
      category: "immediate",
      priority: "urgent",
    }),
    makeTask("death-certificate-copies", {
      title: "Obtain multiple certified copies of the death certificate",
      description:
        "Order at least 5–10 copies. You will need these for banks, pension providers, HMRC, and insurers. Copies cost £12.50 each in England and Wales when ordered at registration (prices differ in Scotland and Northern Ireland).",
      category: "immediate",
      priority: "urgent",
    })
  );

  // ── Legal ──────────────────────────────────────────────────────────────────
  tasks.push(
    makeTask("locate-will", {
      title: "Locate and review the will",
      description:
        "Check whether a will exists. It may be held by a solicitor, the Probate Registry, or at home. A will names executors and beneficiaries.",
      category: "legal",
      priority: "this-week",
    }),
    makeTask("contact-solicitor", {
      title: "Contact a solicitor if required",
      description:
        "If the estate is complex, there is no will, or the estate is worth over £10,000, consider engaging a solicitor.",
      category: "legal",
      priority: "this-week",
    }),
    makeTask("apply-probate", {
      title: "Apply for a Grant of Probate or Letters of Administration",
      description:
        "If the estate includes property or significant assets, you will need probate before you can distribute assets. Apply via the Probate Service.",
      category: "legal",
      priority: "this-month",
      link: "https://www.gov.uk/applying-for-probate",
    })
  );

  // ── Government ─────────────────────────────────────────────────────────────
  tasks.push(
    makeTask("tell-us-once", {
      title: "Use the Tell Us Once service",
      description:
        "Tell Us Once lets you notify multiple government departments — including DWP, HMRC, DVLA, and the Passport Office — in a single step.",
      category: "government",
      priority: "this-week",
      link: "https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once",
    }),
    makeTask("notify-dwp", {
      title: "Notify the Department for Work and Pensions (DWP)",
      description:
        "Report the death to stop any benefits payments. You may also be able to claim bereavement support if you were their spouse or civil partner.",
      category: "government",
      priority: "this-week",
      phone: "0800 151 2012",
    }),
    makeTask("notify-hmrc", {
      title: "Notify HMRC",
      description:
        "HMRC needs to know about the death to stop tax credits and update self-assessment records. There may be an overpayment or underpayment to resolve.",
      category: "government",
      priority: "this-week",
      link: "https://www.gov.uk/tell-hmrc-change-of-details/bereavement",
    })
  );

  // ── Financial ──────────────────────────────────────────────────────────────
  tasks.push(
    makeTask("notify-banks", {
      title: "Notify the deceased's bank(s)",
      description:
        "Contact each bank to freeze accounts and begin the process of transferring funds. Bring death certificates.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask("notify-pensions", {
      title: "Notify pension providers",
      description:
        "Contact workplace and personal pension providers. There may be a death-in-service payment or spouse's pension to claim.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask("notify-life-insurance", {
      title: "Notify life insurance providers",
      description: "Contact any life insurance companies and begin the claims process.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask("cancel-direct-debits", {
      title: "Cancel direct debits and standing orders",
      description: "Ask the bank to cancel regular payments, but keep utility accounts open until the property is sorted.",
      category: "financial",
      priority: "this-month",
    })
  );

  // ── Financial help ─────────────────────────────────────────────────────────
  if (data.needsFinancialHelp === "yes" || data.needsFinancialHelp === "unsure") {
    tasks.push(
      makeTask("funeral-expenses-payment", {
        title: "Apply for Funeral Expenses Payment",
        description:
          "If you receive certain benefits, you may be eligible for a Funeral Expenses Payment from the DWP to help cover funeral costs.",
        category: "financial",
        priority: "urgent",
        link: "https://www.gov.uk/funeral-payments",
      })
    );
  }

  if (data.relationship === "Spouse / Partner") {
    tasks.push(
      makeTask("bereavement-support-payment", {
        title: "Apply for Bereavement Support Payment",
        description:
          "If your spouse or civil partner paid National Insurance contributions, you may be entitled to Bereavement Support Payment — a monthly payment for up to 18 months.",
        category: "financial",
        priority: "this-week",
        link: "https://www.gov.uk/bereavement-support-payment",
      })
    );
  }

  // ── Housing ────────────────────────────────────────────────────────────────
  if (data.housingType === "council") {
    tasks.push(
      makeTask("council-housing-office", {
        title: "Contact the council housing office",
        description:
          "Notify the local council of the death. Depending on your relationship to the deceased, you may have the right to succeed to (take over) the tenancy.",
        category: "housing",
        priority: "this-week",
      }),
      makeTask("council-tenancy-succession", {
        title: "Review tenancy succession rights",
        description:
          "In England and Wales, spouses, civil partners, and some family members have a statutory right to succeed to a council tenancy. Ask the housing officer for written guidance.",
        category: "housing",
        priority: "this-week",
      })
    );
  }

  if (data.housingType === "private-rental") {
    tasks.push(
      makeTask("contact-landlord", {
        title: "Contact the landlord or letting agent",
        description:
          "Notify the landlord in writing. Review the tenancy agreement to understand notice periods and what happens to deposits.",
        category: "housing",
        priority: "this-week",
      }),
      makeTask("review-tenancy", {
        title: "Review the tenancy agreement",
        description:
          "Check whether the tenancy was in the deceased's name alone, or jointly held. A sole tenancy ends on death; joint tenancies may pass to the survivor.",
        category: "housing",
        priority: "this-week",
      })
    );
  }

  if (data.housingType === "owned") {
    tasks.push(
      makeTask("notify-mortgage", {
        title: "Notify the mortgage provider (if applicable)",
        description:
          "Contact the mortgage lender. There may be a life insurance policy that covers the outstanding mortgage.",
        category: "housing",
        priority: "this-month",
      }),
      makeTask("notify-land-registry", {
        title: "Notify the Land Registry",
        description:
          "If property was held in the deceased's sole name, the Land Registry needs to be updated as part of the probate process.",
        category: "housing",
        priority: "this-month",
        link: "https://www.gov.uk/update-property-records-someone-died",
      })
    );
  }

  // ── Utilities & subscriptions ─────────────────────────────────────────────
  tasks.push(
    makeTask("notify-utilities", {
      title: "Notify utility providers",
      description: "Contact gas, electricity, and water suppliers. Transfer accounts if the property will be occupied, or close if empty.",
      category: "financial",
      priority: "this-month",
    }),
    makeTask("cancel-subscriptions", {
      title: "Cancel subscriptions and memberships",
      description:
        "Cancel TV, phone, internet, gym memberships, and any recurring subscriptions to prevent further charges.",
      category: "financial",
      priority: "this-month",
    }),
    makeTask("redirect-mail", {
      title: "Redirect mail",
      description:
        "Set up a Royal Mail redirection service to ensure important correspondence reaches the right person.",
      category: "personal",
      priority: "this-month",
      link: "https://www.royalmail.com/personal/receiving-mail/redirection",
    })
  );

  // ── Added after the switch to slug IDs (no legacy number) ──────────────────
  tasks.push(
    makeTask(
      "value-estate",
      {
        title: "Value the estate and check for Inheritance Tax",
        description:
          "Add up the deceased's money, property and possessions, minus debts. You need this figure to apply for probate and to tell HMRC whether Inheritance Tax is due.",
        category: "legal",
        priority: "this-month",
        link: "https://www.gov.uk/valuing-estate-of-someone-who-died",
      },
      { legacy: false }
    ),
    makeTask(
      "bereavement-support",
      {
        title: "Look after yourself",
        description:
          "Grief can be overwhelming, especially alongside all this admin. Cruse Bereavement Support offers free, confidential support by phone and online.",
        category: "personal",
        priority: "future",
        link: "https://www.cruse.org.uk/get-support/",
        phone: "0808 808 1677",
      },
      { legacy: false }
    ),
    makeTask(
      "family-far-away",
      {
        title: "Help family far away join the funeral",
        description:
          "Relatives abroad can watch live. Ask the venue about a webcast, or stream it yourselves on WhatsApp, Zoom or YouTube.",
        category: "personal",
        priority: "this-week",
        link: "/help/streaming",
      },
      { legacy: false }
    ),
    makeTask(
      "memorial-page",
      {
        title: "Set up a place for condolences and memories",
        description:
          "An online memorial or funeral notice lets people share messages and photos, find the funeral details, or give to a charity in their name.",
        category: "personal",
        priority: "future",
        link: "/help/memorials",
      },
      { legacy: false }
    )
  );

  // ── Faith-specific (several can apply) ────────────────────────────────────
  const faiths = getFaiths(data);
  if (faiths.includes("muslim")) {
    tasks.push(
      makeTask("contact-mosque", {
        title: "Contact your local mosque for funeral guidance",
        description:
          "Islamic tradition requires swift burial, often within 24 hours. Your local mosque can guide you through the Ghusl (washing) and Salat al-Janazah (funeral prayer).",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  if (faiths.includes("jewish")) {
    tasks.push(
      makeTask("contact-chevra-kadisha", {
        title: "Contact the Chevra Kadisha (Jewish burial society)",
        description:
          "The Chevra Kadisha conducts ritual washing (Tahara) and handles burial arrangements. Jewish law requires burial as soon as possible.",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  if (faiths.includes("hindu") || faiths.includes("sikh")) {
    tasks.push(
      makeTask("contact-temple", {
        title: "Contact your local temple or religious community",
        description:
          "Your religious community can advise on cremation rites, prayers, and cultural requirements.",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  // Traditions without a specific step above still get a pointer to their community
  if (faiths.some((f) => ["christian", "humanist", "african-caribbean", "other"].includes(f))) {
    tasks.push(
      makeTask(
        "contact-faith-community",
        {
          title: "Speak to your faith or cultural community",
          description:
            "A minister, celebrant or community elder can help plan the funeral and any traditions that matter to the family — for example a wake or nine-night. Let the funeral director know early.",
          category: "personal",
          priority: "this-week",
        },
        { legacy: false }
      )
    );
  }

  return tasks;
}

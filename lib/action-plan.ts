import type { IntakeFormData, ActionPlanTask } from "@/types";
import { getFaiths } from "@/lib/faith";
import { traditionTasks } from "@/lib/cultures";

// Task IDs are stable slugs so saved progress survives changes to the plan.
// Plans saved before slugs existed stored progress under sequential numbers
// ("1", "2", …): `legacyId` reproduces that numbering so `normaliseTaskKeys`
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
        title: "Wait for the medical certificate to be sent to the register office",
        description:
          "A doctor completes the Medical Certificate of Cause of Death. In England and Wales a medical examiner reviews it and sends it straight to the register office, so you do not need to collect it. The hospital, the medical examiner's office or the register office will contact you when you can book an appointment to register.",
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
          "A funeral director can bring your loved one into their care and explain the next steps. You do not have to use the first one you contact, and you can compare prices before you agree to anything.",
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
          "Prices for the same funeral can differ by thousands of pounds. Get two or three quotes in writing and see our simple ways to save. You can change funeral director even after they have collected the body.",
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
      description: `Register ${data.deceasedFirstName}'s death within 5 days in England, Wales and Northern Ireland, or within 8 days in Scotland. In England and Wales the 5 days usually start when the register office receives the medical certificate. If a coroner is involved, the register office will tell you when you can register. It is quickest to use the register office in the area where the death happened.`,
      category: "immediate",
      priority: "urgent",
      link: "https://www.gov.uk/register-a-death",
    }),
    makeTask("notify-family", {
      title: "Notify immediate family and close friends",
      description: "Let people know when you feel ready. You do not have to contact everyone at once, and you can ask someone to help.",
      category: "immediate",
      priority: "urgent",
    }),
    makeTask("death-certificate-copies", {
      title: "Order copies of the death certificate",
      description:
        "Most families need 5 to 10 certified copies for banks, pension providers and insurers. In England and Wales they cost £12.50 each when you buy them at registration, and more if you order them later. Prices are different in Scotland and Northern Ireland.",
      category: "immediate",
      priority: "urgent",
    })
  );

  // ── Legal ──────────────────────────────────────────────────────────────────
  tasks.push(
    makeTask("locate-will", {
      title: "Locate and review the will",
      description:
        "Check whether there is a will. It may be at home, with a solicitor or bank, or stored with the Probate Service. The will names the executors, who deal with the estate.",
      category: "legal",
      priority: "this-week",
    }),
    makeTask("contact-solicitor", {
      title: "Decide whether you need a solicitor",
      description:
        "Many people deal with a simple estate themselves. A solicitor can help if there is no will, the estate is complicated, there is Inheritance Tax to pay or the family disagrees. Fees vary, so ask for a fixed quote.",
      category: "legal",
      priority: "this-week",
    }),
    makeTask("apply-probate", {
      title: "Check whether you need probate",
      description:
        "You usually need probate (called confirmation in Scotland) if the person owned property in their name alone or had large savings. Each bank sets its own limit, often between £5,000 and £50,000. In England and Wales the application fee is £526 for estates worth more than £5,000.",
      category: "legal",
      priority: "this-month",
      link: "https://www.gov.uk/applying-for-probate",
    })
  );

  // ── Government ─────────────────────────────────────────────────────────────
  tasks.push(
    makeTask("tell-us-once", {
      title: "Use Tell Us Once to inform government",
      description:
        "In England, Scotland and Wales, the registrar gives you a Tell Us Once reference so you can report the death to most government organisations at once, including DWP, HMRC, DVLA, HM Passport Office and the council. It is not available in Northern Ireland. It does not tell banks, pension companies or utility suppliers.",
      category: "government",
      priority: "this-week",
      link: "https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once",
    }),
    makeTask("notify-dwp", {
      title: "Contact the DWP Bereavement Service",
      description:
        "If you did not use Tell Us Once, call the Bereavement Service to report the death and stop benefit payments. They can also check whether you can claim bereavement benefits.",
      category: "government",
      priority: "this-week",
      phone: "0800 151 2012",
    }),
    makeTask("notify-hmrc", {
      title: "Check the person's tax affairs with HMRC",
      description:
        "If you used Tell Us Once, HMRC has been told. The executor may still need to sort out tax owed or a refund, especially if the person filed Self Assessment tax returns.",
      category: "government",
      priority: "this-week",
      link: "https://www.gov.uk/tell-hmrc-change-of-details",
    })
  );

  // ── Financial ──────────────────────────────────────────────────────────────
  tasks.push(
    makeTask("notify-banks", {
      title: "Tell their bank or building society",
      description:
        "Tell each bank about the death. The free Death Notification Service lets you tell several banks at once. Many banks will pay the funeral invoice from the person's account if you show it to them.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask("notify-pensions", {
      title: "Notify pension providers",
      description:
        "Contact workplace and personal pension providers. There may be a lump sum or a pension for a partner or dependant to claim.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask("notify-life-insurance", {
      title: "Contact any life insurance providers",
      description: "Tell any life insurance companies about the death and ask how to make a claim. Check paperwork and bank statements for policies.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask("cancel-direct-debits", {
      title: "Stop regular payments",
      description: "Ask the bank to stop direct debits and standing orders. Do not close accounts until the executor agrees, and keep essential utilities running while the home is being sorted.",
      category: "financial",
      priority: "this-month",
    })
  );

  // ── Financial help ─────────────────────────────────────────────────────────
  if (data.needsFinancialHelp === "yes" || data.needsFinancialHelp === "unsure") {
    tasks.push(
      makeTask("funeral-expenses-payment", {
        title: "Check if you can get help with funeral costs",
        description:
          "If you get certain benefits, such as Universal Credit or Pension Credit, you may be able to get a Funeral Expenses Payment. In Scotland, apply for a Funeral Support Payment instead. Claim within 6 months of the funeral.",
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
          "If you were married, in a civil partnership or living together with children, you may be able to get Bereavement Support Payment. It is a first payment followed by up to 18 monthly payments. Claim within 3 months of the death to get the full amount.",
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
        title: "Contact the council or housing association",
        description:
          "Tell the landlord about the death. Depending on your relationship to the person, you may be able to take over the tenancy.",
        category: "housing",
        priority: "this-week",
      }),
      makeTask("council-tenancy-succession", {
        title: "Check who can take over the tenancy",
        description:
          "In England, a husband, wife, civil partner or partner who lived there usually has the right to take over the tenancy. Other relatives may qualify depending on the tenancy and the landlord's policy. Rules are different in Wales, Scotland and Northern Ireland. Shelter and Citizens Advice can help.",
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
          "Tell the landlord in writing. Ask about the notice period, the rent and how the deposit will be returned.",
        category: "housing",
        priority: "this-week",
      }),
      makeTask("review-tenancy", {
        title: "Review the tenancy agreement",
        description:
          "Check whether the tenancy was in the person's name only or shared. A joint tenancy usually passes to the other tenant. A sole tenancy does not end automatically, so the executor needs to agree an end date with the landlord.",
        category: "housing",
        priority: "this-week",
      })
    );
  }

  if (data.housingType === "owned") {
    tasks.push(
      makeTask("notify-mortgage", {
        title: "Contact the mortgage lender",
        description:
          "If there is a mortgage, tell the lender. A life insurance or mortgage protection policy may pay off what is owed.",
        category: "housing",
        priority: "this-month",
      }),
      makeTask("notify-land-registry", {
        title: "Update the property records",
        description:
          "If the home was owned jointly, the surviving owner can update HM Land Registry. If it was in the person's name only, the executor deals with it after probate.",
        category: "housing",
        priority: "this-month",
        link: "https://www.gov.uk/update-property-records-someone-died",
      })
    );
  }

  // ── Utilities & subscriptions ─────────────────────────────────────────────
  tasks.push(
    makeTask("notify-utilities", {
      title: "Contact utility suppliers",
      description: "Tell the gas, electricity and water suppliers. Take meter readings, and transfer or close the accounts depending on who will live in the home.",
      category: "financial",
      priority: "this-month",
    }),
    makeTask("cancel-subscriptions", {
      title: "Cancel subscriptions and memberships",
      description:
        "Cancel phone, internet, TV, gym and other subscriptions. Bank statements can show which ones they had.",
      category: "financial",
      priority: "this-month",
    }),
    makeTask("redirect-mail", {
      title: "Redirect mail",
      description:
        "Set up a Royal Mail redirection so important letters reach the person dealing with the estate. You can also register with the Bereavement Register to reduce unwanted post.",
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
          "Add up the value of the person's money, property and belongings, minus any debts. You need this figure to apply for probate and to check whether Inheritance Tax is due. Most estates do not pay it.",
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
          "Grief can be overwhelming, especially alongside all these tasks. Free, confidential support is available by phone and online, including from Cruse Bereavement Support (Cruse Scotland in Scotland).",
        category: "personal",
        priority: "future",
        link: "/help/support",
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
  const COMMUNITY: string[] = ["christian", "christian-pentecostal", "christian-orthodox", "buddhist", "traditional", "humanist", "african-caribbean", "other"];
  if (faiths.some((f) => COMMUNITY.includes(f))) {
    tasks.push(
      makeTask(
        "contact-faith-community",
        {
          title: "Speak to your faith or cultural community",
          description:
            "A minister, priest, celebrant or community elder can help plan the funeral and the traditions that matter to the family. Tell the funeral director about these early.",
          category: "personal",
          priority: "this-week",
        },
        { legacy: false }
      )
    );
  }

  // Steps for the cultural backgrounds chosen and where they will be laid to rest
  for (const t of traditionTasks(data)) tasks.push(makeTask(t.id, t, { legacy: false }));

  return tasks;
}

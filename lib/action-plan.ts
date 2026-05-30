import type { IntakeFormData, ActionPlanTask } from "@/types";

let taskId = 0;
function makeTask(
  overrides: Omit<ActionPlanTask, "id" | "status"> & { status?: ActionPlanTask["status"] }
): ActionPlanTask {
  return { id: String(++taskId), status: "pending", ...overrides };
}

export function generateActionPlan(data: IntakeFormData): ActionPlanTask[] {
  taskId = 0;
  const tasks: ActionPlanTask[] = [];

  // ── Immediate ──────────────────────────────────────────────────────────────
  if (data.currentLocation === "hospital" || data.currentLocation === "hospice") {
    tasks.push(
      makeTask({
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
      makeTask({
        title: "Contact a funeral director",
        description:
          "A funeral director can collect the deceased and advise you on next steps. You are not obliged to choose the first one you contact.",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  tasks.push(
    makeTask({
      title: "Register the death",
      description: `You must register ${data.deceasedFirstName}'s death within 5 days in England, Wales, and Northern Ireland (8 days in Scotland). Visit your local register office.`,
      category: "immediate",
      priority: "urgent",
      link: "https://www.gov.uk/register-a-death/find-register-office",
    }),
    makeTask({
      title: "Notify immediate family and close friends",
      description: "Let people know as soon as you feel ready. You don't have to contact everyone at once.",
      category: "immediate",
      priority: "urgent",
    }),
    makeTask({
      title: "Obtain multiple certified copies of the death certificate",
      description:
        "Order at least 5–10 copies. You will need these for banks, pension providers, HMRC, and insurers. Each copy costs £11.",
      category: "immediate",
      priority: "urgent",
    })
  );

  // ── Legal ──────────────────────────────────────────────────────────────────
  tasks.push(
    makeTask({
      title: "Locate and review the will",
      description:
        "Check whether a will exists. It may be held by a solicitor, the Probate Registry, or at home. A will names executors and beneficiaries.",
      category: "legal",
      priority: "this-week",
    }),
    makeTask({
      title: "Contact a solicitor if required",
      description:
        "If the estate is complex, there is no will, or the estate is worth over £10,000, consider engaging a solicitor.",
      category: "legal",
      priority: "this-week",
    }),
    makeTask({
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
    makeTask({
      title: "Use the Tell Us Once service",
      description:
        "Tell Us Once lets you notify multiple government departments — including DWP, HMRC, DVLA, and the Passport Office — in a single step.",
      category: "government",
      priority: "this-week",
      link: "https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once",
    }),
    makeTask({
      title: "Notify the Department for Work and Pensions (DWP)",
      description:
        "Report the death to stop any benefits payments. You may also be able to claim bereavement support if you were their spouse or civil partner.",
      category: "government",
      priority: "this-week",
      phone: "0800 151 2012",
    }),
    makeTask({
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
    makeTask({
      title: "Notify the deceased's bank(s)",
      description:
        "Contact each bank to freeze accounts and begin the process of transferring funds. Bring death certificates.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask({
      title: "Notify pension providers",
      description:
        "Contact workplace and personal pension providers. There may be a death-in-service payment or spouse's pension to claim.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask({
      title: "Notify life insurance providers",
      description: "Contact any life insurance companies and begin the claims process.",
      category: "financial",
      priority: "this-week",
    }),
    makeTask({
      title: "Cancel direct debits and standing orders",
      description: "Ask the bank to cancel regular payments, but keep utility accounts open until the property is sorted.",
      category: "financial",
      priority: "this-month",
    })
  );

  // ── Financial help ─────────────────────────────────────────────────────────
  if (data.needsFinancialHelp === "yes" || data.needsFinancialHelp === "unsure") {
    tasks.push(
      makeTask({
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
      makeTask({
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
      makeTask({
        title: "Contact the council housing office",
        description:
          "Notify the local council of the death. Depending on your relationship to the deceased, you may have the right to succeed to (take over) the tenancy.",
        category: "housing",
        priority: "this-week",
      }),
      makeTask({
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
      makeTask({
        title: "Contact the landlord or letting agent",
        description:
          "Notify the landlord in writing. Review the tenancy agreement to understand notice periods and what happens to deposits.",
        category: "housing",
        priority: "this-week",
      }),
      makeTask({
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
      makeTask({
        title: "Notify the mortgage provider (if applicable)",
        description:
          "Contact the mortgage lender. There may be a life insurance policy that covers the outstanding mortgage.",
        category: "housing",
        priority: "this-month",
      }),
      makeTask({
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
    makeTask({
      title: "Notify utility providers",
      description: "Contact gas, electricity, and water suppliers. Transfer accounts if the property will be occupied, or close if empty.",
      category: "financial",
      priority: "this-month",
    }),
    makeTask({
      title: "Cancel subscriptions and memberships",
      description:
        "Cancel TV, phone, internet, gym memberships, and any recurring subscriptions to prevent further charges.",
      category: "financial",
      priority: "this-month",
    }),
    makeTask({
      title: "Redirect mail",
      description:
        "Set up a Royal Mail redirection service to ensure important correspondence reaches the right person.",
      category: "personal",
      priority: "this-month",
      link: "https://www.royalmail.com/personal/receiving-mail/redirection",
    })
  );

  // ── Faith-specific ─────────────────────────────────────────────────────────
  if (data.faith === "muslim") {
    tasks.push(
      makeTask({
        title: "Contact your local mosque for funeral guidance",
        description:
          "Islamic tradition requires swift burial, often within 24 hours. Your local mosque can guide you through the Ghusl (washing) and Salat al-Janazah (funeral prayer).",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  if (data.faith === "jewish") {
    tasks.push(
      makeTask({
        title: "Contact the Chevra Kadisha (Jewish burial society)",
        description:
          "The Chevra Kadisha conducts ritual washing (Tahara) and handles burial arrangements. Jewish law requires burial as soon as possible.",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  if (data.faith === "hindu" || data.faith === "sikh") {
    tasks.push(
      makeTask({
        title: "Contact your local temple or religious community",
        description:
          "Your religious community can advise on cremation rites, prayers, and cultural requirements.",
        category: "immediate",
        priority: "urgent",
      })
    );
  }

  return tasks;
}

import type { ActionPlanTask, IntakeFormData } from "@/types";

// The plan when a baby or child has died. Adult steps such as probate, the
// estate, pensions and tenancies do not apply, so this is a separate list.
// Facts checked against GOV.UK, gov.wales, mygov.scot and nidirect; where the
// rules differ between the UK nations we say so rather than guess.

type Task = Omit<ActionPlanTask, "status">;

export const isChildPlan = (data: Pick<IntakeFormData, "ageGroup">) =>
  data.ageGroup === "baby" || data.ageGroup === "child";

export function childTasks(data: IntakeFormData): Task[] {
  const name = data.deceasedFirstName.trim() || "your child";
  const baby = data.ageGroup === "baby";
  const inHospital = data.currentLocation === "hospital" || data.currentLocation === "hospice";
  const tasks: Task[] = [];

  // ── First few days ─────────────────────────────────────────────────────────
  if (baby) {
    tasks.push({
      id: "child-bereavement-midwife",
      title: "Talk to the hospital bereavement midwife",
      description: `The bereavement midwife or bereavement team can explain what happens next, help you spend time with ${name}, and talk you through options such as photographs, hand and footprints, and a funeral. There is no rush to decide.`,
      category: "immediate",
      priority: "urgent",
    });
  } else if (inHospital) {
    tasks.push({
      id: "child-hospital-team",
      title: "Speak to the hospital bereavement team",
      description: `The hospital bereavement team can explain what happens next, including the medical certificate, and help you spend time with ${name} if you would like to.`,
      category: "immediate",
      priority: "urgent",
    });
  }

  tasks.push({
    id: "child-death-review",
    title: baby ? "Understand the hospital review" : "Understand the child death review",
    description: baby
      ? "Hospitals review every stillbirth and the death of every baby in their care, to understand what happened and learn from it. You will be asked if you have questions you want answered, and offered a meeting to talk through the findings. If your baby was born alive, a child death review also takes place. This is routine and does not mean anyone is being blamed."
      : "When a child dies, the death is reviewed. In England a key worker should be named to support you and explain each step, and there are similar processes elsewhere in the UK. If the death was sudden or unexpected, a coroner (or the procurator fiscal in Scotland) and sometimes the police will be involved. This is routine and does not mean anyone is being blamed.",
    category: "legal",
    priority: "urgent",
    ...(baby ? {} : { link: "https://www.gov.uk/government/publications/child-death-review-statutory-and-operational-guidance-england" }),
  });

  tasks.push(
    baby
      ? {
          id: "child-register-baby",
          title: "Register your baby",
          description:
            "If your baby was stillborn after 24 weeks of pregnancy, you register a stillbirth. This is within 42 days in England and Wales and 21 days in Scotland; the hospital will give you a certificate to take. If your baby was born alive and then died, you register both the birth and the death, often at the same appointment. In Northern Ireland, the hospital can tell you what to do. Before 24 weeks there is no legal registration, but in England you can ask for a baby loss certificate.",
          category: "immediate",
          priority: "urgent",
          link: "https://www.gov.uk/register-stillbirth",
        }
      : {
          id: "child-register-death",
          title: "Register the death",
          description: `Register ${name}'s death within 5 days in England, Wales and Northern Ireland, or 8 days in Scotland. If a coroner or procurator fiscal is involved, the register office will tell you when you can register. You can ask someone you trust to come with you.`,
          category: "immediate",
          priority: "urgent",
          link: "https://www.gov.uk/register-a-death",
        }
  );

  tasks.push({
    id: "child-funeral",
    title: "Think about the funeral when you are ready",
    description: baby
      ? "The hospital may be able to arrange a simple funeral for your baby, or you can choose a funeral director. Many funeral directors do not charge for a baby's funeral. Take your time; you can ask for what feels right for your family."
      : "A funeral director can care for your child and help you plan a funeral that feels right. Many funeral directors charge little or nothing for a child's funeral, so ask. You do not have to decide everything at once.",
    category: "immediate",
    priority: "urgent",
  });

  tasks.push({
    id: "child-funeral-fund",
    title: "Get help with funeral costs",
    description:
      "In England, the Children's Funeral Fund pays burial or cremation fees and some other costs for a child under 18, or a baby stillborn after 24 weeks. Wales has the same kind of fund. In Scotland, councils do not charge burial or cremation fees for a child. The funeral director or the council can usually claim this for you. In Northern Ireland, ask your council what help is available." +
      (data.needsFinancialHelp === "no"
        ? ""
        : " If you get certain benefits, you may also get a Funeral Expenses Payment towards other costs, such as the funeral director's fees."),
    category: "financial",
    priority: "urgent",
    link: "https://www.gov.uk/child-funeral-costs",
  });

  tasks.push({
    id: "child-tell-family",
    title: "Tell close family and friends",
    description:
      "Let people know when you feel able to. You can ask one person to pass the news on for you, so you do not have to have the same conversation many times.",
    category: "immediate",
    priority: "urgent",
  });

  // ── This week ──────────────────────────────────────────────────────────────
  tasks.push({
    id: "child-bereavement-leave",
    title: "Take time off work",
    description:
      "If you are a parent, you have the right to 2 weeks' Parental Bereavement Leave after the death of a child under 18 or a stillbirth after 24 weeks, and you may get pay. You can take it at any time in the first year. Tell your employer when you can; you do not need to give notice for the first weeks." +
      (baby ? " If your baby was stillborn after 24 weeks or was born alive, maternity and paternity leave and pay usually still apply." : ""),
    category: "government",
    priority: "this-week",
    link: "https://www.gov.uk/parental-bereavement-pay-leave",
  });

  if (!baby) {
    tasks.push(
      {
        id: "child-school",
        title: "Tell the school, nursery or college",
        description: `Let ${name}'s school know, and their brothers' and sisters' schools too, so staff can support them and avoid upsetting letters or messages.`,
        category: "personal",
        priority: "this-week",
      },
      {
        id: "child-benefit",
        title: "Tell the Child Benefit Office",
        description:
          "Child Benefit carries on for up to 8 weeks after a child dies. Tell Us Once can tell the Child Benefit Office and other government services for you when you register the death.",
        category: "government",
        priority: "this-week",
        link: "https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once",
      },
      {
        id: "child-health",
        title: "Tell your GP and cancel appointments",
        description: `Tell your family's GP, and any hospital, dentist or other services ${name} saw, so appointment letters stop. Your GP can also support you and the rest of the family.`,
        category: "personal",
        priority: "this-week",
      }
    );
  } else {
    tasks.push({
      id: "child-health-visitor",
      title: "Let your GP and health visitor know",
      description:
        "The hospital usually tells them, but it is worth checking so you do not get routine baby appointments or letters. Your GP can support you with your recovery and how you are feeling.",
      category: "personal",
      priority: "this-week",
    });
  }

  tasks.push({
    id: "child-siblings",
    title: baby ? "Support brothers and sisters" : "Support brothers, sisters and friends",
    description:
      "Children grieve too, often in short bursts. Simple, honest words help. Child Bereavement UK and Winston's Wish have free advice and helplines; you can find their numbers on our support page.",
    category: "personal",
    priority: "this-week",
    link: "/help/support",
  });

  // ── Later ──────────────────────────────────────────────────────────────────
  if (!baby) {
    tasks.push({
      id: "child-savings",
      title: "Deal with any savings in their name",
      description: `If ${name} had a Junior ISA, Child Trust Fund or bank account, contact the provider. Small amounts can usually be released without probate.`,
      category: "financial",
      priority: "this-month",
    });
  }

  tasks.push(
    {
      id: "child-memories",
      title: "Keep memories close",
      description:
        "Some families make a memory box, keep a favourite item of clothing or plan a way to remember them on special dates. There is no right way to do this.",
      category: "personal",
      priority: "future",
      link: "/help/memorials",
    },
    {
      id: "child-support",
      title: "Look after yourself",
      description:
        "The death of a child is one of the hardest things anyone can face. Your GP and NHS talking therapies can help, and our support page lists free helplines from parents who understand, including Sands and The Compassionate Friends.",
      category: "personal",
      priority: "future",
      link: "/help/support",
    }
  );

  return tasks;
}

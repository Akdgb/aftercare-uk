import type { ActionPlanTask, BurialPlace, FaithOption, IntakeFormData } from "@/types";
import { getFaiths } from "@/lib/faith";

// Cultural backgrounds, grouped by region. Specific enough that the plan can
// reflect real customs (a Ghanaian one-week gathering is not a Jamaican nine
// night), without trying to list every ethnic group. People can choose several
// and describe anything we have missed. Ethnic origin is special category data,
// so it is only kept with explicit consent, like faith.

export type Background = { id: string; label: string; group?: string };
export type Region = { id: string; label: string; backgrounds: Background[] };

export const REGIONS: Region[] = [
  {
    id: "west-africa",
    label: "West African",
    backgrounds: [
      { id: "nigerian-yoruba", label: "Yoruba", group: "Nigerian" },
      { id: "nigerian-igbo", label: "Igbo", group: "Nigerian" },
      { id: "nigerian-edo", label: "Edo (Benin)", group: "Nigerian" },
      { id: "nigerian-hausa-fulani", label: "Hausa or Fulani", group: "Nigerian" },
      { id: "nigerian-other", label: "Other Nigerian", group: "Nigerian" },
      { id: "ghanaian-akan", label: "Akan (including Asante, Fante, Kwahu)", group: "Ghanaian" },
      { id: "ghanaian-ga", label: "Ga", group: "Ghanaian" },
      { id: "ghanaian-ewe", label: "Ewe", group: "Ghanaian" },
      { id: "ghanaian-other", label: "Other Ghanaian", group: "Ghanaian" },
      { id: "sierra-leonean-krio", label: "Sierra Leonean Krio", group: "Other West African" },
      { id: "sierra-leonean-other", label: "Other Sierra Leonean", group: "Other West African" },
      { id: "liberian", label: "Liberian", group: "Other West African" },
      { id: "west-african-other", label: "Other West African", group: "Other West African" },
    ],
  },
  {
    id: "horn-of-africa",
    label: "Horn of Africa and Sudan",
    backgrounds: [
      { id: "somali", label: "Somali" },
      { id: "eritrean", label: "Eritrean" },
      { id: "ethiopian", label: "Ethiopian" },
      { id: "sudanese", label: "Sudanese" },
      { id: "south-sudanese", label: "South Sudanese" },
    ],
  },
  {
    id: "east-africa",
    label: "East African",
    backgrounds: [
      { id: "kenyan-luo", label: "Luo", group: "Kenyan" },
      { id: "kenyan-kikuyu", label: "Kikuyu", group: "Kenyan" },
      { id: "kenyan-other", label: "Other Kenyan", group: "Kenyan" },
      { id: "ugandan-baganda", label: "Baganda", group: "Ugandan" },
      { id: "ugandan-other", label: "Other Ugandan", group: "Ugandan" },
      { id: "tanzanian", label: "Tanzanian", group: "Other East African" },
    ],
  },
  {
    id: "southern-central-africa",
    label: "Southern and Central African",
    backgrounds: [
      { id: "zimbabwean-shona", label: "Shona", group: "Zimbabwean" },
      { id: "zimbabwean-ndebele", label: "Ndebele", group: "Zimbabwean" },
      { id: "south-african", label: "South African", group: "Other" },
      { id: "zambian", label: "Zambian", group: "Other" },
      { id: "malawian", label: "Malawian", group: "Other" },
      { id: "congolese-drc", label: "Congolese (DRC)", group: "Other" },
      { id: "central-african-other", label: "Other Central African", group: "Other" },
    ],
  },
  {
    id: "caribbean",
    label: "Caribbean",
    backgrounds: [
      { id: "jamaican", label: "Jamaican" },
      { id: "trinidadian-tobagonian", label: "Trinidadian or Tobagonian" },
      { id: "barbadian", label: "Barbadian" },
      { id: "guyanese", label: "Guyanese" },
      { id: "st-lucian", label: "St Lucian" },
      { id: "dominican", label: "Dominican" },
      { id: "grenadian", label: "Grenadian" },
      { id: "vincentian", label: "Vincentian" },
      { id: "haitian", label: "Haitian" },
      { id: "caribbean-other", label: "Other Caribbean" },
    ],
  },
  {
    id: "south-asia",
    label: "South Asian",
    backgrounds: [
      { id: "indian", label: "Indian" },
      { id: "pakistani", label: "Pakistani" },
      { id: "bangladeshi", label: "Bangladeshi" },
      { id: "sri-lankan-tamil", label: "Sri Lankan Tamil" },
      { id: "sri-lankan-other", label: "Other Sri Lankan" },
      { id: "nepali", label: "Nepali" },
    ],
  },
  {
    id: "east-asia",
    label: "East and South-East Asian",
    backgrounds: [
      { id: "chinese", label: "Chinese" },
      { id: "hong-kong", label: "Hong Kong" },
      { id: "vietnamese", label: "Vietnamese" },
      { id: "filipino", label: "Filipino" },
    ],
  },
  {
    id: "europe",
    label: "Irish and European",
    backgrounds: [
      { id: "irish", label: "Irish" },
      { id: "polish", label: "Polish" },
      { id: "eastern-european-other", label: "Other Eastern European" },
      { id: "greek-greek-cypriot", label: "Greek or Greek Cypriot" },
      { id: "turkish-cypriot-turkish", label: "Turkish or Turkish Cypriot" },
      { id: "southern-european", label: "Portuguese, Spanish or Italian" },
    ],
  },
  {
    id: "gypsy-roma-traveller",
    label: "Gypsy, Roma and Traveller",
    backgrounds: [
      { id: "romany-gypsy", label: "Romany Gypsy" },
      { id: "irish-traveller", label: "Irish Traveller" },
      { id: "roma", label: "Roma" },
    ],
  },
];

const ALL = new Map(REGIONS.flatMap((r) => r.backgrounds.map((b) => [b.id, { ...b, region: r.id }] as const)));
export const isBackgroundId = (id: string) => ALL.has(id);
export const backgroundLabel = (id: string) => {
  const b = ALL.get(id);
  return b ? (b.group && !b.label.includes(b.group.replace(/n$/, "")) ? `${b.group}: ${b.label}` : b.label) : id;
};

export const BURIAL_PLACES: { value: BurialPlace; label: string }[] = [
  { value: "uk", label: "In the UK" },
  { value: "abroad", label: "In another country" },
  { value: "both", label: "A UK service, then burial or a ceremony abroad" },
  { value: "unsure", label: "Not decided yet" },
];

/** Backgrounds recorded on a plan. Like faith, they only count with consent. */
export function getBackgrounds(data: Pick<IntakeFormData, "backgrounds" | "faithConsent">): string[] {
  if (!data.faithConsent) return [];
  return [...new Set(data.backgrounds ?? [])].filter(isBackgroundId);
}

// ── Tailored steps ─────────────────────────────────────────────────────────────

type Ctx = { b: Set<string>; f: Set<FaithOption>; place: BurialPlace | undefined };
type Step = Omit<ActionPlanTask, "status"> & { when: (c: Ctx) => boolean };

const inRegion = (c: Ctx, ...regions: string[]) => [...c.b].some((id) => regions.includes(ALL.get(id)?.region ?? ""));
const has = (c: Ctx, ...ids: string[]) => ids.some((id) => c.b.has(id));
const starts = (c: Ctx, ...prefixes: string[]) => [...c.b].some((id) => prefixes.some((p) => id.startsWith(p)));
const AFRICA = ["west-africa", "horn-of-africa", "east-africa", "southern-central-africa"];
const abroad = (c: Ctx) => c.place === "abroad" || c.place === "both";

const STEPS: Step[] = [
  // Urgent
  {
    id: "request-urgent-release",
    title: "Ask for the body to be released quickly",
    description:
      "Tell the hospital, doctor and registrar that your faith asks for burial as soon as possible. If the coroner is involved, ask their office whether they can prioritise the release. Many offer out-of-hours contact for urgent religious burials.",
    category: "immediate",
    priority: "urgent",
    when: (c) => c.f.has("muslim") || c.f.has("jewish"),
  },
  {
    id: "decide-burial-place",
    title: "Agree where they will be laid to rest",
    description:
      "Talk with close family about whether the burial or cremation will be in the UK or in another country. This decision affects almost every other step, so it helps to settle it early.",
    category: "immediate",
    priority: "urgent",
    when: (c) =>
      (c.place === undefined || c.place === "unsure") &&
      (inRegion(c, ...AFRICA, "caribbean", "europe") || has(c, "pakistani", "bangladeshi", "indian")),
  },
  {
    id: "start-repatriation",
    title: "Speak to an international funeral director",
    description:
      "Ask for a written, itemised quote that covers embalming, the coffin, flights, consular fees and mortuary storage. Published prices to West Africa and the Caribbean usually start at around £3,200 to £3,900. Sending ashes abroad instead usually costs much less.",
    category: "immediate",
    priority: "urgent",
    when: abroad,
  },
  {
    id: "notify-coroner-repatriation",
    title: "Make sure the coroner is told before the body travels",
    description:
      "In England and Wales, taking a body abroad needs notice to the coroner (Form 104) at least four clear days before it leaves, even if the death was expected. Your funeral director usually sends it. Do not book flights until the coroner's authorisation arrives. In Scotland and Northern Ireland, ask your funeral director about the local process.",
    category: "legal",
    priority: "urgent",
    when: abroad,
  },
  {
    id: "call-family-meeting",
    title: "Arrange a family meeting",
    description:
      "Many families hold a meeting to agree the funeral date, the burial place, who leads the rites and how costs are shared. You can include elders in other countries by phone or video call.",
    category: "personal",
    priority: "urgent",
    when: (c) => starts(c, "nigerian-", "ghanaian-", "sierra-leonean-", "kenyan-", "ugandan-", "zimbabwean-") || has(c, "congolese-drc", "zambian", "liberian", "west-african-other"),
  },
  {
    id: "inform-relatives-abroad",
    title: "Let relatives in other countries know",
    description:
      "Share the news with family overseas and agree who will announce the death more widely. Relatives may need time to arrange travel, which can affect the funeral date.",
    category: "personal",
    priority: "urgent",
    when: (c) => inRegion(c, ...AFRICA, "caribbean") || has(c, "filipino", "polish", "irish"),
  },
  // This week
  {
    id: "check-repatriation-documents",
    title: "Check what the embassy or high commission needs",
    description:
      "Each country has its own list of documents. For example, Ghana needs nothing extra if the person held a valid Ghanaian passport, Jamaica needs an import permit from its health ministry, Zimbabwe needs a health ministry letter of no objection and Nigeria needs consular approval. Your funeral director can usually help.",
    category: "legal",
    priority: "this-week",
    when: abroad,
  },
  {
    id: "plan-one-week-gathering",
    title: "Plan the one-week gathering",
    description:
      "Many Ghanaian families hold a gathering about a week after the death to receive condolences and announce the funeral date. You may need a hall or space at home, refreshments and a notice or poster.",
    category: "personal",
    priority: "this-week",
    when: (c) => starts(c, "ghanaian-"),
  },
  {
    id: "plan-nine-night",
    title: "Plan the set-up and nine night",
    description:
      "Many Caribbean families welcome visitors in the evenings after a death, with the nine night as the main gathering. Think about space, food, hymn sheets and who will lead the singing and prayers.",
    category: "personal",
    priority: "this-week",
    when: (c) => has(c, "jamaican", "trinidadian-tobagonian", "guyanese", "grenadian", "vincentian", "caribbean-other"),
  },
  {
    id: "arrange-wake",
    title: "Arrange a wake or vigil",
    description:
      "Decide whether the wake or vigil will be at home, at church or at the funeral home, and on which evening. Tell the funeral director if you would like the person brought home the night before the funeral.",
    category: "personal",
    priority: "this-week",
    when: (c) =>
      has(c, "nigerian-yoruba", "nigerian-igbo", "nigerian-edo", "nigerian-other", "sierra-leonean-krio", "zambian", "congolese-drc", "irish", "filipino", "polish", "st-lucian", "dominican", "haitian", "romany-gypsy", "irish-traveller", "roma") ||
      starts(c, "kenyan-") ||
      c.f.has("christian-pentecostal"),
  },
  {
    id: "receive-visitors",
    title: "Prepare to receive visitors at home",
    description:
      "Many families welcome visitors at home for several days after a death, and friends often bring food so the family does not need to cook. You could ask one relative to coordinate visits.",
    category: "personal",
    priority: "this-week",
    when: (c) => c.f.has("muslim") || has(c, "somali", "eritrean", "ethiopian", "sudanese", "south-sudanese", "congolese-drc", "zambian"),
  },
  {
    id: "check-cemetery-rules",
    title: "Check the cemetery's rules early",
    description:
      "If the family would like to fill in the grave themselves, use a double or triple depth plot, or have a large casket or large floral tributes, ask the cemetery in advance so there are no problems on the day.",
    category: "personal",
    priority: "this-week",
    when: (c) => inRegion(c, "caribbean", "gypsy-roma-traveller") || has(c, "greek-greek-cypriot"),
  },
  {
    id: "ask-community-support",
    title: "Ask about family, church or community support",
    description:
      "Hometown associations, church welfare teams, burial societies and mosque committees often help with costs and organising. Check whether the person had a funeral plan or repatriation cover.",
    category: "financial",
    priority: "this-week",
    when: (c) => inRegion(c, ...AFRICA, "caribbean") || has(c, "pakistani", "bangladeshi"),
  },
  {
    id: "agree-dress-code",
    title: "Agree the family dress code",
    description:
      "Decide on any matching cloth, such as aso ebi, or colours such as red and black or black and white, and tell guests in good time. If outfits are being made, allow time for tailoring.",
    category: "personal",
    priority: "this-week",
    when: (c) => starts(c, "nigerian-", "ghanaian-") || has(c, "chinese", "hong-kong", "vietnamese", "romany-gypsy", "irish-traveller"),
  },
  // This month
  {
    id: "prepare-programme",
    title: "Prepare the order of service or funeral brochure",
    description:
      "Gather photos, a life story, tributes and hymns. Many printers need one to two weeks, so it helps to start early.",
    category: "personal",
    priority: "this-month",
    when: (c) => inRegion(c, ...AFRICA, "caribbean") || has(c, "filipino", "irish"),
  },
  {
    id: "plan-thanksgiving-service",
    title: "Plan a thanksgiving service",
    description:
      "Many families hold a thanksgiving service, often on the Sunday after the funeral. Speak to your minister about the date and who will give thanks.",
    category: "personal",
    priority: "this-month",
    when: (c) => starts(c, "ghanaian-") || has(c, "nigerian-yoruba", "nigerian-igbo", "nigerian-edo", "sierra-leonean-krio") || c.f.has("christian-pentecostal"),
  },
  {
    id: "plan-memorial-prayers",
    title: "Plan the memorial prayer days",
    description:
      "Many traditions hold prayers or gatherings on set days, such as the 3rd, 7th, 9th, 13th, 40th or 49th day, or a month's mind Mass. Ask your priest, imam, temple or gurdwara which days your family will keep.",
    category: "personal",
    priority: "this-month",
    when: (c) =>
      has(c, "eritrean", "ethiopian", "greek-greek-cypriot", "sierra-leonean-krio", "trinidadian-tobagonian", "turkish-cypriot-turkish", "chinese", "hong-kong", "vietnamese", "filipino", "irish", "polish") ||
      ["christian-orthodox", "hindu", "sikh", "buddhist", "muslim"].some((f) => c.f.has(f as FaithOption)),
  },
  {
    id: "decide-about-ashes",
    title: "Decide what will happen to the ashes",
    description:
      "Some families scatter ashes at a permitted place in the UK, and others take them abroad. Ashes do not need the coroner's permission to leave the UK, but the destination country may need a permit, so check with the airline and the embassy.",
    category: "personal",
    priority: "this-month",
    when: (c) => ["hindu", "sikh", "buddhist"].some((f) => c.f.has(f as FaithOption)) || has(c, "vietnamese"),
  },
  {
    id: "agree-rites-and-roles",
    title: "Agree which rites the family will hold",
    description:
      "Talk openly about which traditional and church rites the family will hold, and who will lead them, so everyone feels respected. In some traditions this can affect inheritance in the home country, so legal advice there may help.",
    category: "personal",
    priority: "this-month",
    when: (c) =>
      has(c, "nigerian-edo", "nigerian-igbo", "ugandan-baganda", "south-african") ||
      starts(c, "zimbabwean-") ||
      ((c.f.has("christian-pentecostal") || c.f.has("traditional")) && inRegion(c, ...AFRICA)),
  },
  {
    id: "record-contributions",
    title: "Keep a record of gifts and contributions",
    description:
      "Many families receive money gifts or donations. A simple list makes thank-you messages easier and helps when sharing costs.",
    category: "financial",
    priority: "this-month",
    when: (c) => starts(c, "ghanaian-", "nigerian-", "kenyan-", "zimbabwean-") || has(c, "chinese", "hong-kong", "filipino", "congolese-drc"),
  },
  // Later
  {
    id: "plan-ceremony-back-home",
    title: "Plan any ceremony in the home country",
    description:
      "Some families hold a further funeral or final rites in their home town, sometimes months later. You can set a date and budget once you feel ready.",
    category: "personal",
    priority: "future",
    when: (c) => c.place !== "abroad" && (has(c, "nigerian-igbo", "nigerian-edo", "nigerian-yoruba", "kenyan-luo", "ugandan-baganda") || starts(c, "ghanaian-")),
  },
  {
    id: "plan-one-year-remembrance",
    title: "Think about the one-year remembrance",
    description:
      "Many families mark about one year with a ceremony such as kurova guva, umbuyiso, the last funeral rites, a memorial service or a headstone unveiling. Talk with family about whether and how you would like to mark it.",
    category: "personal",
    priority: "future",
    when: (c) => starts(c, "zimbabwean-") || has(c, "south-african", "ugandan-baganda", "greek-greek-cypriot", "eritrean", "ethiopian", "jamaican"),
  },
  {
    id: "arrange-headstone",
    title: "Arrange the headstone",
    description:
      "Most cemeteries ask you to wait several months before a headstone is put in, so the ground can settle. Some families hold a small unveiling service.",
    category: "personal",
    priority: "future",
    when: (c) => c.place !== "abroad" && (inRegion(c, ...AFRICA, "caribbean", "gypsy-roma-traveller") || has(c, "greek-greek-cypriot")),
  },
  {
    id: "mourning-period",
    title: "Plan for a longer mourning period",
    description:
      "Some traditions keep a longer mourning period, such as a widow's iddah of four months and ten days, or wearing black for a year. It may help to tell your employer and ask about compassionate or flexible leave.",
    category: "personal",
    priority: "future",
    when: (c) => c.f.has("muslim") || has(c, "romany-gypsy", "irish-traveller", "sierra-leonean-krio", "eritrean", "ethiopian"),
  },
];

/** Steps tailored to the faiths, backgrounds and burial place on a plan. */
export function traditionTasks(data: IntakeFormData): Omit<ActionPlanTask, "status">[] {
  const c: Ctx = {
    b: new Set(getBackgrounds(data)),
    f: new Set(getFaiths(data)),
    // Where the burial will be is not sensitive, so it applies with or without consent
    place: data.burialPlace,
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return STEPS.filter((s) => s.when(c)).map(({ when, ...task }) => task);
}

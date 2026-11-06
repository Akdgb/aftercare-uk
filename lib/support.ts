// Where we point people for help, kept in one place so every page says the
// same thing. NHS services come first. Charities are listed second, as phone
// numbers only, on the "More support" page. Check these at every content review.

export const NHS_GRIEF_URL = "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/grief-bereavement-loss/";
export const NHS_URGENT_URL = "https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/";
export const NHS_TALKING_THERAPIES_URL = "https://www.nhs.uk/service-search/mental-health/find-an-nhs-talking-therapies-service";

export type Helpline = { name: string; what: string; phone?: string; text?: string; hours: string; where: string };

/** Free national helplines, shown after the NHS options. Phone numbers only, no links out. */
export const HELPLINES: { group: string; lines: Helpline[] }[] = [
  {
    group: "If you are struggling to cope",
    lines: [
      { name: "Samaritans", what: "For anyone who is struggling to cope. You do not have to be suicidal to call.", phone: "116 123", hours: "Any time, day or night", where: "UK and Ireland" },
      { name: "Shout", what: "A text service if you would rather not talk.", text: "Text SHOUT to 85258", hours: "Any time, day or night", where: "UK" },
    ],
  },
  {
    group: "Bereavement support",
    lines: [
      { name: "Cruse Bereavement Support", what: "Trained volunteers who listen and can arrange further support.", phone: "0808 808 1677", hours: "Weekdays, with some evening hours", where: "England, Wales and Northern Ireland" },
      { name: "Cruse Scotland", what: "A separate charity offering the same support in Scotland.", phone: "0808 802 6161", hours: "Weekdays and weekend mornings", where: "Scotland" },
      { name: "Marie Curie Support Line", what: "For anyone affected by terminal illness or a death, including free bereavement sessions.", phone: "0800 090 2309", hours: "Every day", where: "UK" },
      { name: "Muslim Bereavement Support Service", what: "Support for bereaved Muslim women, in line with Islamic values.", phone: "020 3468 7333", hours: "Weekdays", where: "UK" },
    ],
  },
  {
    group: "Particular situations",
    lines: [
      { name: "Child Bereavement UK", what: "For grieving children and young people, and families after the death of a child.", phone: "0800 02 888 40", hours: "Weekdays 9am to 5pm", where: "UK" },
      { name: "Winston's Wish", what: "For children and young people after the death of a parent or sibling.", phone: "08088 020 021", hours: "Weekdays 8am to 8pm", where: "UK" },
      { name: "Sands", what: "After the death of a baby during pregnancy or after birth.", phone: "0808 164 3332", hours: "Weekdays, with some evening hours", where: "UK" },
      { name: "The Compassionate Friends", what: "Support from other parents after the death of a son or daughter of any age.", phone: "0345 123 2304", hours: "Every day, 10am to 4pm and 7pm to 10pm", where: "UK" },
      { name: "Survivors of Bereavement by Suicide", what: "For adults bereaved by suicide, from people who have been through it.", phone: "0300 111 5065", hours: "Every day, 9am to 7pm", where: "UK" },
    ],
  },
];

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

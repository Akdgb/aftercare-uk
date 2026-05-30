export interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: number;
  lastUpdated: string;
  content: string;
}

export const articles: Record<string, Article> = {
  "what-happens-after-someone-dies": {
    slug: "what-happens-after-someone-dies",
    title: "What happens after someone dies?",
    category: "Getting started",
    readTime: 5,
    lastUpdated: "January 2025",
    content: `
## The first hours

When a person dies, a doctor must confirm the death and issue a Medical Certificate of Cause of Death (MCCD). This is the document you will need to register the death.

If the death was unexpected, the coroner may need to be involved before the MCCD is issued. The coroner's office will contact you if this is the case.

**If the death happened at home**, call a GP or, if outside surgery hours, call 111. If emergency services were involved, they will arrange for a doctor to attend.

**If the death happened in hospital**, the ward staff will guide you through the next steps and tell you where to collect the MCCD.

## What needs to happen in the first few days

### 1. Collect the MCCD

Ask the doctor, hospital, or hospice for the Medical Certificate of Cause of Death. Without this, you cannot register the death.

### 2. Contact a funeral director

A funeral director can collect the deceased and look after them until the funeral. You are under no obligation to use the first director you contact — get quotes and ask for an itemised price list.

### 3. Register the death

You must register the death within **5 days** in England, Wales, and Northern Ireland (8 days in Scotland). Take the MCCD to your local register office and book an appointment. The registrar will give you:
- A death certificate
- A Certificate for Burial or Cremation (the 'green form')
- A form for the DWP (BD8)

### 4. Use Tell Us Once

After registering, use the government's Tell Us Once service to notify HMRC, DWP, DVLA, and your local council in a single step.

## What to do in the first week

- Obtain multiple copies of the death certificate (you will need 5–10)
- Notify close family and friends
- Secure the deceased's property
- Check for a will
- Begin planning the funeral

## What to do in the coming weeks

- Notify banks, pension providers, and insurance companies
- Apply for Bereavement Support Payment if you were a spouse or civil partner
- Apply for Funeral Expenses Payment if you need financial help
- Begin the probate process if required
- Notify utilities, landlord or mortgage provider

## Getting support

Bereavement is one of the hardest experiences a person can face. You do not need to manage everything at once. AfterCare's personalised plan will help you prioritise what matters most.

**Source:** GOV.UK — What to do after someone dies
    `.trim(),
  },

  "registering-a-death": {
    slug: "registering-a-death",
    title: "Registering a death",
    category: "Legal",
    readTime: 4,
    lastUpdated: "January 2025",
    content: `
## When must you register?

You must register a death within **5 days** in England, Wales, and Northern Ireland, and within **8 days** in Scotland.

## Who can register?

In order of preference:
1. A relative who was present at the death
2. A relative living in the area
3. A relative who has taken responsibility for the arrangements
4. Any other relative
5. A person present at the death
6. The occupier of the premises where the death occurred
7. The person responsible for arranging the funeral

## Where to register

You must register at the register office in the district where the death took place. You can find your nearest register office on GOV.UK.

Most register offices require an appointment. Book as soon as possible, as appointments can fill up quickly.

## What you need to bring

**Essential:**
- The Medical Certificate of Cause of Death (issued by the doctor or hospital)

**Also bring if available:**
- The deceased's NHS medical card
- The deceased's birth certificate
- The deceased's marriage or civil partnership certificate (if applicable)

## What you will receive

- A **death certificate** — this is the official record. Order at least 5–10 certified copies at £11 each
- A **Certificate for Burial or Cremation** (the 'green form') — give this to the funeral director
- A **BD8 form** — for notifying the DWP about pension and benefits

## Informing others after registration

After registration, use the **Tell Us Once** service to notify:
- HMRC
- DWP
- DVLA
- Passport Office
- Your local council

**Source:** GOV.UK — Register a death
    `.trim(),
  },

  "probate-explained": {
    slug: "probate-explained",
    title: "Probate explained",
    category: "Legal",
    readTime: 7,
    lastUpdated: "January 2025",
    content: `
## What is probate?

Probate is the legal process that gives someone the authority to deal with the assets of a person who has died. In England and Wales, this is called a **Grant of Probate** (if there is a will) or **Letters of Administration** (if there is no will).

## When is probate needed?

You usually need probate if:
- The deceased owned property in their sole name
- The estate is worth more than £10,000 (most banks require it)
- The deceased held stocks and shares in their sole name
- There are significant assets that need to be transferred

You may **not** need probate if:
- The estate is very small (under £5,000–£10,000, depending on the institution)
- Assets are jointly held (e.g., a joint bank account) — these pass automatically to the survivor
- Assets are held in trust

## How long does probate take?

- **Application to Grant:** Typically 12–20 weeks from submission to HMRC and the Probate Registry
- **Full estate administration:** 6–18 months for a straightforward estate; longer if property is involved or if there are disputes

## How to apply

You can apply online through GOV.UK or through a solicitor.

**Steps:**
1. Gather all assets information and value the estate
2. Complete Inheritance Tax forms (even if no tax is owed)
3. Submit your probate application online or by post
4. Pay the probate fee (£273 for estates over £5,000)
5. Receive the Grant of Probate
6. Use the grant to access and distribute assets

## Do I need a solicitor?

A solicitor is not always required, but may be worth engaging if:
- The estate is complex
- There is no will
- There are disputes between beneficiaries
- The estate is large and Inheritance Tax is payable
- There are overseas assets

Solicitor fees are typically 1–3% of the estate value.

## Inheritance Tax

Inheritance Tax is payable on estates worth more than £325,000 (the 'nil-rate band'). The standard rate is 40% on the amount above the threshold.

Spouses and civil partners inherit tax-free. Unused nil-rate band can be transferred to a surviving spouse, potentially doubling the threshold to £650,000.

**Source:** GOV.UK — Applying for probate; HMRC — Inheritance Tax
    `.trim(),
  },

  "funeral-costs-explained": {
    slug: "funeral-costs-explained",
    title: "Funeral costs explained",
    category: "Funerals",
    readTime: 6,
    lastUpdated: "January 2025",
    content: `
## How much does a funeral cost?

Funeral costs vary significantly depending on what you choose and where you are in the UK. As of 2024, typical costs are:

| Type | Average cost |
|------|-------------|
| Traditional burial | £4,200–£6,500 |
| Traditional cremation | £3,200–£5,200 |
| Direct cremation | £700–£1,800 |

Costs in London and the South East are typically 20–30% higher than the national average.

## What you are paying for

**Funeral director's fees** (the largest element, typically £1,500–£3,200):
- Collecting and caring for the deceased
- Organising and conducting the funeral
- All administration and documentation

**Third-party charges** (passed directly to you):
- Burial fee (£500–£2,500 depending on cemetery and location)
- Cremation fee (£350–£1,100)
- Minister or officiant fee (£150–£350)
- Doctor's fees for cremation paperwork (£100–£200, being phased out)

**Optional elements:**
- Coffin: £200–£3,500+
- Flowers: £0–£900
- Funeral cars (hearse + limousine): £200–£1,400
- Death certificates: £11 each
- Catering/wake: variable

## How to keep costs down

- **Get at least 3 itemised quotes** — funeral directors are legally required by the FCA to provide a standardised price list
- **Consider direct cremation** — no service, but significantly cheaper; a memorial can be held separately
- **Choose a simple coffin** — the legal minimum is a sealed container; most coffins are similar in quality internally
- **Buy flowers from a local florist** rather than through the funeral director
- **Hold the wake at home** rather than a venue
- **Ask about council or charity assistance** if you are on a low income

## Your rights as a consumer

The Financial Conduct Authority (FCA) regulates funeral plan providers. All funeral directors must:
- Provide a clear price list on their website
- Give you an itemised quote before you commit
- Not pressure you into purchasing more than you need

**Source:** SunLife Cost of Dying Report 2024; FCA; GOV.UK
    `.trim(),
  },

  "council-housing-after-death": {
    slug: "council-housing-after-death",
    title: "Council housing after death",
    category: "Housing",
    readTime: 5,
    lastUpdated: "January 2025",
    content: `
## What is tenancy succession?

When a council tenant dies, certain family members may have the legal right to **take over (succeed to) the tenancy**. This is known as tenancy succession.

## Who has the automatic right to succeed?

Under English law, the following people have an automatic right to succeed:

1. **The surviving spouse or civil partner** of the deceased tenant (as long as they lived in the property as their only or principal home)
2. **A cohabiting partner** who lived with the tenant for at least 12 months before death

## Who may qualify (but not automatically)?

Other family members — children, siblings, parents — may be entitled to succeed if they:
- Lived with the tenant for at least 12 months before the death
- Used the property as their only or principal home
- No one else has already succeeded to the tenancy

**Important:** Succession can only happen once. If the person who died was themselves a successor, there is no right to succeed again.

## What if you do not have the right to succeed?

The council may:
- Offer you an alternative tenancy (often on different terms)
- Serve notice requiring you to leave the property

You should seek advice from **Shelter** or a housing solicitor if you are at risk of losing your home.

## What to do

1. **Notify the housing department immediately** — call the council's housing team as soon as possible after the death
2. **Ask for a succession to tenancy form** in writing
3. **Provide evidence** of your relationship and length of residency (utility bills, bank statements, etc.)
4. **Do not ignore correspondence** from the council — respond to any letters promptly

## Rent payments

Keep paying rent during this period. Falling into arrears will weaken your position when applying to succeed to the tenancy.

**Source:** Shelter — Council housing and succession rights; GOV.UK — Social housing tenancies
    `.trim(),
  },

  "funeral-support-payments": {
    slug: "funeral-support-payments",
    title: "Funeral support payments",
    category: "Financial support",
    readTime: 5,
    lastUpdated: "January 2025",
    content: `
## Funeral Expenses Payment

The Funeral Expenses Payment (also called a Funeral Payment) is a grant from the DWP to help cover funeral costs.

**Who can apply?**
You may qualify if you are:
- A spouse, civil partner, or close family member of the deceased
- Responsible for arranging the funeral
- Receiving one of the following benefits:
  - Universal Credit
  - Income Support
  - Income-based Jobseeker's Allowance
  - Income-related Employment and Support Allowance
  - Pension Credit
  - Housing Benefit
  - Child Tax Credit
  - Working Tax Credit (if also receiving a disability element)

**How much will you receive?**
The payment covers:
- The full cost of burial fees or cremation fees
- Up to £1,000 for other expenses

Any money paid by the estate or from insurance will be deducted from the payment.

**How to apply:**
Call the DWP Bereavement Service on **0800 731 0469** or apply online. You must apply within **6 months** of the funeral.

---

## Bereavement Support Payment

If you were married to or in a civil partnership with the deceased, you may be entitled to Bereavement Support Payment.

**Who qualifies?**
- You were married to or in a civil partnership with the deceased
- The deceased paid National Insurance contributions for at least 25 weeks
- You were under State Pension age when they died

**How much?**
- Higher rate (if you have children): £3,500 lump sum + £350/month for 18 months
- Lower rate (no children): £2,500 lump sum + £100/month for 18 months

**Apply within 3 months** to receive the full amount. Applications accepted up to 21 months after the death.

Call: **0800 731 0469**

---

## Council assistance

Some councils have a Discretionary Fund or local welfare scheme that can help with funeral costs. Contact your local authority's welfare benefits team.

---

## Charity support

**Down to Earth** (run by Quaker Social Action) helps people on low incomes who are not eligible for DWP support. They can provide direct financial help or guide you to other sources.

Visit: quakersocialaction.org.uk/down-to-earth

**Source:** GOV.UK — Funeral Expenses Payment; Bereavement Support Payment
    `.trim(),
  },

  "burial-vs-cremation": {
    slug: "burial-vs-cremation",
    title: "Burial vs cremation",
    category: "Funerals",
    readTime: 5,
    lastUpdated: "January 2025",
    content: `
## The choice

Approximately 80% of funerals in the UK now involve cremation. However, both options have distinct advantages, and the right choice depends on personal, religious, and practical factors.

## Burial

**What happens:**
The body is placed in a coffin and buried in a grave at a cemetery or churchyard. A graveside service is usually held.

**Cost:** £4,200–£6,500 on average, including the grave purchase

**Advantages:**
- A permanent, physical place to visit
- Some religions require burial (e.g., Islam, Judaism, some Christian denominations)
- Natural or woodland burial is available in many areas
- Remains stay together in a fixed location

**Disadvantages:**
- Significantly more expensive than cremation
- Limited cemetery space in some areas
- Ongoing grave maintenance costs
- Less flexibility in how remains are handled

## Cremation

**What happens:**
The body is placed in a coffin and cremated at a crematorium. Ashes are returned to the family in an urn, and can be kept, scattered, buried, or made into a memorial.

**Cost:** £3,200–£5,200 on average

**Advantages:**
- Cheaper than burial
- More flexible — ashes can be scattered in a meaningful place
- No ongoing grave maintenance
- Wide variety of memorialisation options

**Disadvantages:**
- Some religions prohibit or discourage cremation
- Cannot be undone — there is no permanent grave to visit unless ashes are interred
- Some people find it less tangible than burial

## Faith considerations

| Faith | Traditional preference |
|-------|----------------------|
| Islam | Burial required |
| Judaism | Burial preferred; cremation is generally not permitted |
| Hindu | Cremation preferred |
| Sikh | Cremation preferred |
| Christian | Both are accepted by most denominations |
| Buddhist | Cremation common, but burial is also practised |

Always discuss wishes with a religious leader or the family's faith community.

## Questions to consider

- Did the deceased express a preference, verbally or in writing?
- Are there religious or cultural requirements?
- Is there a family grave or burial plot?
- What is the family's budget?
- Would you prefer a permanent physical location to visit?

**Source:** Cremation Society of Great Britain; GOV.UK
    `.trim(),
  },

  "direct-cremation-explained": {
    slug: "direct-cremation-explained",
    title: "Direct cremation explained",
    category: "Funerals",
    readTime: 4,
    lastUpdated: "January 2025",
    content: `
## What is direct cremation?

Direct cremation is a simple cremation with no funeral service or ceremony attached. The body is collected, cremated, and the ashes are returned to the family.

Roughly 20% of all cremations in the UK are now direct cremations, up from near zero a decade ago.

## What is included?

- Collection of the deceased from the place of death
- Care of the deceased prior to cremation
- A simple coffin
- Cremation at a local crematorium (often at an off-peak time)
- Return of ashes in a basic urn

## What is not included?

- No hearse or funeral vehicles
- No flowers
- No formal church, chapel, or graveside service
- No embalming (unless requested)
- No viewing of the deceased (though some providers offer this as an add-on)

## How much does it cost?

Typically **£700–£1,800** depending on provider and location. This compares to £3,200–£5,200 for a traditional cremation with a service.

## Is it right for your family?

Direct cremation may be suitable if:
- Budget is a primary consideration
- The family wants to hold a separate, personal memorial service at a later date
- The deceased lived far from where they died and repatriation is not desired
- The family prefers a low-key, private farewell

It may not be suitable if:
- The family needs a formal ceremony to say goodbye
- Religious or cultural traditions require a service
- Mourners need a structured event to grieve together

## Holding a separate memorial

Many families choose direct cremation and then hold a **celebration of life** or **memorial service** at a later date — at home, in a park, at a favourite restaurant, or in any meaningful location. This can be more personal and less expensive than a traditional funeral.

## Providers

Established direct cremation providers in the UK include Pure Cremation, Simplicity Cremations, and many local funeral directors. Always check reviews and ask for an itemised price list.

**Source:** FCA; Cremation Society of Great Britain
    `.trim(),
  },

  "tell-us-once": {
    slug: "tell-us-once",
    title: "Tell Us Once — notifying the government",
    category: "Government",
    readTime: 3,
    lastUpdated: "January 2025",
    content: `
## What is Tell Us Once?

Tell Us Once is a free government service that allows you to report a death to multiple government departments in a single step, rather than contacting each separately.

## Which departments are notified?

- **HMRC** — to stop tax credits and update self-assessment
- **DWP** — to stop benefits and initiate any survivor's pension
- **DVLA** — to cancel the driving licence and Vehicle Excise Duty
- **Passport Office** — to cancel the deceased's passport
- **Veterans UK** — if the deceased received a war pension
- **Your local council** — for council tax, housing benefit, and the Blue Badge scheme
- **Electoral registration** office

## How to use it

1. **Register the death** at your local register office
2. The registrar will give you a **Tell Us Once reference number** (valid for 28 days)
3. Use it online at **gov.uk/tell-us-once** or by calling **0800 085 7308**
4. Provide the details requested about the deceased

The process takes approximately 15 minutes online.

## What Tell Us Once does NOT cover

Tell Us Once does **not** notify:
- Banks and building societies
- Pension providers (workplace or personal)
- Insurance companies
- Utility companies
- Subscription services

You will need to contact these separately.

## After Tell Us Once

Once you have used Tell Us Once, you should receive confirmation letters from the relevant departments. Keep these for your records.

**Source:** GOV.UK — Tell Us Once
    `.trim(),
  },

  "repatriation-explained": {
    slug: "repatriation-explained",
    title: "Repatriation explained",
    category: "Funerals",
    readTime: 5,
    lastUpdated: "January 2025",
    content: `
## What is repatriation?

Repatriation is the process of returning the body of a person who has died in one country to their home country for burial or cremation.

## Who arranges it?

Most families use a specialist repatriation funeral director or an international funeral company. Some local funeral directors can also arrange repatriation.

If the death occurred abroad, your travel insurance may cover repatriation costs — check the policy immediately.

## What documentation is required?

**UK documents required:**
- A certified copy of the death certificate (translated if required)
- An Out of England form (for burial or cremation abroad)
- An embalming certificate (in most cases)
- A Freedom from Infection certificate (in some countries)

**Documents required by the receiving country:**
- These vary by country — the funeral director or embassy can advise

## How long does it take?

Typically 5–14 days, depending on the destination country and documentation requirements.

## How much does it cost?

Costs vary widely depending on:
- The destination country
- Distance and transport method (air freight)
- Embalming requirements
- Documentation costs

A typical European repatriation costs £2,000–£5,000. Long-haul destinations can cost £5,000–£12,000 or more.

## Travel insurance

If the deceased had travel insurance when they died abroad, repatriation costs may be fully covered. Contact the insurer as soon as possible.

## Who can help?

- **The Foreign, Commonwealth and Development Office (FCDO)**: Can provide consular support if the death occurred abroad (call 020 7008 5000)
- **Your funeral director**: Can organise the repatriation process end-to-end
- **The deceased's embassy in the UK**: For advice on documentation requirements

**Source:** GOV.UK — Death abroad; FCDO
    `.trim(),
  },
};

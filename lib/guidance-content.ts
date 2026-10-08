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
    lastUpdated: "October 2026",
    content: `
This guide is mainly for England and Wales. Some steps are different in Scotland and Northern Ireland, and we point these out where they matter.

## The first hours

When a person dies, a doctor or nurse needs to confirm the death.

**If the death happened at home**, call the person's GP or, outside surgery hours, call 111. If the death was sudden or unexpected, call 999.

**If the death happened in hospital or a hospice**, the staff will explain what happens next.

## The medical certificate

Since 9 September 2024 in England and Wales, a medical examiner reviews the cause of death. The doctor's Medical Certificate of Cause of Death (MCCD) is then sent to the register office electronically. You do not need to collect it.

The register office or the medical examiner's office will contact you when the certificate is ready. You can then book an appointment to register the death.

If the death was unexpected or the cause is not clear, the doctor may refer it to the coroner. The coroner's office will contact you and the register office will tell you when you can register.

In Scotland and Northern Ireland the process is slightly different, but the doctor's certificate is still sent to the registrar or you will be told what to do.

## What needs to happen in the first few days

### 1. Contact a funeral director

A funeral director can bring the person who died into their care and look after them until the funeral. You do not have to use the first funeral director you contact. Every funeral director has to show a Standardised Price List, so you can compare prices. Ask for a written, itemised quote.

### 2. Register the death

In England, Wales and Northern Ireland, you need to register the death within **5 days**. In England and Wales this is usually counted from when the register office receives the medical certificate. In Scotland it is within **8 days**.

The registrar will give you:
- A death certificate (you can buy extra certified copies)
- A Certificate for Burial or Cremation (the 'green form'), unless a coroner is involved
- A Tell Us Once reference number, where the service is available

### 3. Use Tell Us Once

In England, Scotland and Wales, Tell Us Once lets you report the death to many government organisations at the same time, including HMRC, DWP, DVLA, the Passport Office and the local council. It is not available in Northern Ireland.

## What to do in the first week

- Buy enough certified copies of the death certificate (many families need 5 to 10)
- Tell close family and friends
- Make the person's home and property secure
- Check whether there is a will
- Start planning the funeral

## What to do in the coming weeks

- Tell banks, pension providers and insurance companies
- Check whether you may be able to get Bereavement Support Payment if you were married, in a civil partnership or living together with children
- Check whether you may be able to get a Funeral Expenses Payment if you need help with funeral costs
- Find out whether probate is needed (called confirmation in Scotland)
- Tell utility companies, the landlord or the mortgage provider

## Getting support

Losing someone is one of the hardest things a person can go through. You do not need to do everything at once. AfterCare's personalised plan can help you decide what to do first.

**Source:** GOV.UK: What to do after someone dies
    `.trim(),
  },

  "registering-a-death": {
    slug: "registering-a-death",
    title: "Registering a death",
    category: "Legal",
    readTime: 4,
    lastUpdated: "October 2026",
    content: `
## When do you need to register?

- **England and Wales:** within **5 days**, usually counted from when the register office receives the medical certificate
- **Northern Ireland:** within **5 days**
- **Scotland:** within **8 days**

If a coroner is involved, the register office will tell you when you can register.

## The medical certificate

Since 9 September 2024 in England and Wales, a medical examiner reviews the cause of death and the Medical Certificate of Cause of Death (MCCD) is sent to the register office electronically. You do not need to collect it or take it with you.

Wait for the register office or the medical examiner's office to contact you, then book your appointment.

## Who can register?

Usually, in this order:
1. A relative who was present at the death
2. A relative who was present during the last illness
3. A relative who lives in the area where the death happened
4. Someone who was present at the death
5. The person in charge of the building where the death happened
6. The person arranging the funeral (not the funeral director)

## Where to register

In England and Wales you can register at any register office. Registering in the area where the death happened is quickest, because the documents can be issued straight away.

Most register offices need an appointment. Book as soon as you are contacted, as appointments can fill up quickly.

## What to take with you

If you have them, it helps to bring:
- The person's NHS number or medical card
- Their birth certificate
- Their marriage or civil partnership certificate (if applicable)
- Proof of address, such as a utility bill

## What you will receive

- A **death certificate**: this is the official record. Certified copies cost £12.50 each in England and Wales when you buy them at registration (fees may change from 9 November 2026). Many families need 5 to 10 copies.
- A **Certificate for Burial or Cremation** (the 'green form'): give this to the funeral director
- A **Tell Us Once reference number** in England, Scotland and Wales
- A **BD8 form**: you may get one if you cannot use Tell Us Once. It is used to tell the DWP about the death.

## Telling others after registration

In England, Scotland and Wales, use **Tell Us Once** to tell organisations such as:
- HMRC
- DWP
- DVLA
- HM Passport Office
- The local council

In Northern Ireland, Tell Us Once is not available. Contact each organisation yourself. The nidirect website explains who to tell.

**Source:** GOV.UK: Register a death; nidirect; mygov.scot
    `.trim(),
  },

  "probate-explained": {
    slug: "probate-explained",
    title: "Probate explained",
    category: "Legal",
    readTime: 7,
    lastUpdated: "October 2026",
    content: `
This guide is for England and Wales. In Scotland, the equivalent process is called **confirmation**. Northern Ireland has its own probate office and rules.

## What is probate?

Probate is the legal right to deal with the money, property and possessions (the estate) of a person who has died. In England and Wales you apply for a **Grant of Probate** if there is a will, or **Letters of Administration** if there is no will.

## When is probate needed?

You usually need probate if:
- The person owned property or land in their sole name
- A bank or other organisation asks for it before releasing money
- The person held shares or investments in their sole name

Each bank sets its own limit for when it needs to see probate. This is often between £5,000 and £50,000. Ask each organisation what it needs.

You may **not** need probate if:
- The estate is small and each organisation agrees to release the money without it
- Everything was jointly owned. Jointly owned accounts usually pass to the surviving owner. Check with the bank.
- Assets are held in a trust

## How long does probate take?

- **Getting the grant:** this can take several months. Check GOV.UK for current processing times.
- **Dealing with the whole estate:** often 6 to 18 months for a straightforward estate, and longer if property needs to be sold or there are disputes

## How to apply

You can apply online through GOV.UK, by post, or through a solicitor.

**Steps:**
1. Find out what the estate is worth, including money, property and debts
2. Check whether you need to send Inheritance Tax forms. Since January 2022 most estates with no tax to pay ("excepted estates") do not need to send them.
3. Apply for probate online or by post
4. Pay the probate fee: **£526** for estates over £5,000 (since 13 July 2026). There is no fee if the estate is £5,000 or less. Extra copies of the grant cost £2 each.
5. Receive the grant
6. Use the grant to collect money and property, pay debts, and share out the estate

## Do I need a solicitor?

You do not always need a solicitor, but it may help if:
- The estate is complicated
- There is no will
- There are disputes between beneficiaries
- Inheritance Tax needs to be paid
- There are assets abroad

Solicitor fees vary. Ask for a fixed quote.

## Inheritance Tax

Inheritance Tax is usually only paid if the estate is worth more than the **nil-rate band of £325,000**. The standard rate is 40% on the amount above the threshold.

- A further **residence nil-rate band** of up to £175,000 may apply when a home passes to children or grandchildren.
- Gifts to a husband, wife or civil partner are usually free of Inheritance Tax.
- Any unused allowance can usually be passed to a surviving spouse or civil partner, so a couple may be able to pass on up to **£1 million** without Inheritance Tax.
- Both allowances are frozen until April 2031.
- From 6 April 2027, most unused pension funds will count towards the estate for Inheritance Tax.

This is general information, not tax advice. Check GOV.UK or speak to a professional about your situation.

**Source:** GOV.UK: Applying for probate; HMRC: Inheritance Tax
    `.trim(),
  },

  "funeral-costs-explained": {
    slug: "funeral-costs-explained",
    title: "Funeral costs explained",
    category: "Funerals",
    readTime: 6,
    lastUpdated: "October 2026",
    content: `
## How much does a funeral cost?

Funeral costs vary a lot depending on what you choose and where you live. The SunLife Cost of Dying Report 2026 (based on 2025 data) gives these UK averages:

| Type | Average cost |
|------|-------------|
| Traditional funeral (all types) | £4,510 |
| Traditional burial | about £5,440 |
| Traditional cremation | about £4,200 |
| Simple attended funeral | £3,828 |
| Direct cremation | £1,628 |

Costs in London and the South East are usually higher than the national average.

## What you are paying for

**Funeral director's fees** (usually the largest part of the bill):
- Bringing the person into their care and looking after them
- Organising and leading the funeral
- Paperwork and administration

**Third-party costs** (paid on your behalf, sometimes called disbursements):
- Burial fees (these vary widely by cemetery and area, and may include buying the grave)
- Cremation fees
- A minister, celebrant or officiant

**Optional extras:**
- Coffin upgrades
- Flowers
- Funeral cars (hearse and limousines)
- Death certificate copies: £12.50 each in England and Wales when bought at registration
- Catering or a wake

## How to keep costs down

- **Compare prices.** Every funeral director has to show a Standardised Price List in their premises and on their website. Ask for a written, itemised quote.
- **Consider a direct cremation.** There is no service at the crematorium, but you can hold a memorial separately.
- **Choose a simple coffin.** There is no legal minimum coffin. Crematoria and cemeteries set their own rules, and a simple or eco coffin is usually accepted.
- **Buy flowers from a local florist** rather than through the funeral director
- **Hold the wake at home** or somewhere free
- **Check whether you may be able to get help** with costs, such as a Funeral Expenses Payment

## Your rights as a consumer

The Competition and Markets Authority (CMA) Funerals Market Investigation Order 2021 requires every funeral director to show a Standardised Price List in their premises and on their website.

The Financial Conduct Authority (FCA) regulates pre-paid funeral plans only.

You do not have to buy anything you do not want. Take your time and ask questions.

**Source:** SunLife Cost of Dying Report 2026; Competition and Markets Authority; GOV.UK
    `.trim(),
  },

  "council-housing-after-death": {
    slug: "council-housing-after-death",
    title: "Council housing after death",
    category: "Housing",
    readTime: 5,
    lastUpdated: "October 2026",
    content: `
This guide is mainly for England. Rules are different in Wales, Scotland and Northern Ireland.

## What is tenancy succession?

When a council tenant dies, certain people may have the right to **take over (succeed to) the tenancy**. This is called tenancy succession.

## Who usually has the right to succeed? (England)

For council tenancies that started on or after 1 April 2012, a **husband, wife, civil partner or partner** who lived in the home as their only or main home usually has the right to take over the tenancy. There is no 12-month rule for them.

## Who else may qualify?

Other relatives, such as adult children, may be able to take over:
- An older tenancy (one that started before 1 April 2012), or
- A tenancy where the council's own policy allows it

The rules depend on when the tenancy started and on the tenancy agreement.

**Important:** Usually a tenancy can only be passed on once. If the person who died had already taken over the tenancy from someone else, there may be no further right to succeed.

## What if you do not have the right to succeed?

The council may:
- Offer you a different home or tenancy
- Ask you to leave the property, giving proper notice

Get advice from **Shelter** or **Citizens Advice** as soon as possible if you are worried about losing your home.

## What to do

1. **Tell the council's housing team** about the death as soon as you can
2. **Ask about succession** and whether there is a form to fill in
3. **Provide evidence** of your relationship and that you lived there (for example, letters or bank statements sent to the address)
4. **Reply to any letters** from the council promptly

## Rent payments

Keep paying the rent while this is sorted out, if you can. Rent arrears can make things harder.

**Source:** Shelter; Citizens Advice; GOV.UK
    `.trim(),
  },

  "funeral-support-payments": {
    slug: "funeral-support-payments",
    title: "Funeral support payments",
    category: "Financial support",
    readTime: 5,
    lastUpdated: "October 2026",
    content: `
## Funeral Expenses Payment (England, Wales and Northern Ireland)

A Funeral Expenses Payment can help with the cost of a funeral if you get certain benefits and are responsible for the funeral.

**Who may be able to get it?**
You may be able to get it if you are:
- The partner of the person who died, or
- A close relative or close friend of the person who died, or
- The parent of a baby or child who died

and you, or your partner, get one of these benefits:
- Universal Credit
- Pension Credit
- Income Support
- Income-based Jobseeker's Allowance
- Income-related Employment and Support Allowance
- Housing Benefit

**What does it pay?**
- Necessary burial or cremation fees
- Up to £1,000 for other funeral costs, such as the funeral director's fees, flowers or a coffin (£120 if there is a funeral plan)

Money from the estate or some other sources may be taken off the payment.

**How to apply:**
Claim within **6 months** of the funeral. Contact the DWP Bereavement Service on **0800 151 2012** (Relay UK: 18001 then 0800 731 0469; Welsh language: 0800 731 0453), or apply by post. In Northern Ireland, apply through the Department for Communities.

---

## Funeral Support Payment (Scotland)

In Scotland, Social Security Scotland gives a Funeral Support Payment instead. It can pay burial or cremation costs plus £1,327.75 for other costs (£162.05 if there is a funeral plan). Apply within 6 months of the funeral.

Phone **0800 182 2222** or visit mygov.scot/funeral-support-payment.

---

## Children's Funeral Fund (England)

If a child under 18 dies, or a baby is stillborn after 24 weeks of pregnancy, and the funeral is in England, the Children's Funeral Fund can pay burial or cremation fees and up to £300 towards a coffin. It is not means tested. The funeral director usually claims it for you. Wales and Northern Ireland have their own schemes.

---

## Bereavement Support Payment

You may be able to get Bereavement Support Payment if your husband, wife, civil partner or partner died.

**You may qualify if:**
- You were married, in a civil partnership, or living together with children
- The person who died paid National Insurance contributions for at least 25 weeks, or died because of an accident at work or a disease caused by work
- You were under State Pension age when they died

**How much?**
- Higher rate: £3,500 first payment, then 18 monthly payments of £350
- Lower rate: £2,500 first payment, then 18 monthly payments of £100

**Claim within 3 months** of the death to get the full amount. You can claim up to 21 months after the death, but if you claim more than 12 months after, you will not get the first payment.

Call the DWP Bereavement Service: **0800 151 2012**

---

## Council help

Help from councils varies. Some have local welfare schemes. If no one is able to pay for a funeral, the council must arrange a public health funeral. Contact your local council to ask.

---

## Charity support

**Down to Earth** (run by Quaker Social Action) gives free advice and support to help people arrange an affordable funeral. It does not give money.

Phone: **020 8983 5055**
Visit: https://quakersocialaction.org.uk/we-can-help/helping-funerals/down-earth

**Source:** GOV.UK: Funeral Expenses Payment; GOV.UK: Bereavement Support Payment; mygov.scot; Quaker Social Action
    `.trim(),
  },

  "burial-vs-cremation": {
    slug: "burial-vs-cremation",
    title: "Burial vs cremation",
    category: "Funerals",
    readTime: 5,
    lastUpdated: "October 2026",
    content: `
## The choice

Cremation is chosen for around 80% of UK funerals. Both options have advantages, and the right choice depends on personal, religious and practical factors.

## Burial

**What happens:**
The person is placed in a coffin and buried in a grave at a cemetery, churchyard or natural burial ground. A service may be held at the graveside or beforehand.

**Cost:** a traditional burial costs about £5,440 on average, but grave and burial fees vary a lot by area

**Advantages:**
- A permanent place to visit
- Some faiths require burial (for example, Islam and Orthodox Judaism)
- Natural or woodland burial is available in many areas

**Things to consider:**
- Usually more expensive than cremation
- Limited cemetery space in some areas
- There may be ongoing costs for grave upkeep or a headstone

## Cremation

**What happens:**
The person is placed in a coffin and cremated at a crematorium. The ashes are returned to the family. They can be kept, scattered, buried or placed in a memorial.

**Cost:** a traditional cremation costs about £4,200 on average. A direct cremation costs about £1,628.

**Advantages:**
- Usually cheaper than burial
- More flexible: ashes can be scattered somewhere meaningful
- No ongoing grave upkeep
- Many ways to create a memorial

**Things to consider:**
- Some faiths do not allow or discourage cremation
- There is no grave to visit unless the ashes are buried
- It cannot be undone

## Faith considerations

| Faith | Traditional practice |
|-------|----------------------|
| Islam | Burial is required |
| Judaism | Orthodox Judaism requires burial; some Progressive communities accept cremation |
| Hinduism | Cremation is usual |
| Sikhism | Cremation is usual |
| Christianity | Most denominations accept both |
| Buddhism | Cremation is common, but burial is also practised |

Talk to a faith leader or the family's community if you are unsure.

## Questions to consider

- Did the person say what they wanted, in a will or otherwise?
- Are there religious or cultural requirements?
- Is there a family grave or burial plot?
- What can the family afford?
- Would the family like a permanent place to visit?

**Source:** SunLife Cost of Dying Report 2026; Cremation Society; GOV.UK
    `.trim(),
  },

  "direct-cremation-explained": {
    slug: "direct-cremation-explained",
    title: "Direct cremation explained",
    category: "Funerals",
    readTime: 4,
    lastUpdated: "October 2026",
    content: `
## What is direct cremation?

Direct cremation is a simple cremation without a funeral service at the crematorium. The person is collected, cremated, and the ashes are returned to the family.

About 1 in 5 funerals in the UK (21%) is now a direct cremation.

## What is usually included?

- Bringing the person into the provider's care
- Care before the cremation
- A simple coffin
- Cremation, often at a quieter time of day
- Return of the ashes

## What is usually not included?

- Hearse or funeral cars
- Flowers
- A service at the crematorium
- Embalming
- Viewing the person (some providers offer this for an extra cost)

## How much does it cost?

The average cost of a direct cremation is about **£1,628**, though prices vary by provider and area. A traditional cremation with a service costs about £4,200 on average.

## Is it right for your family?

Direct cremation may suit you if:
- Cost is an important consideration
- The family would like to hold a personal memorial later
- The family prefers a quiet, private farewell

It may not suit you if:
- The family wants a formal ceremony to say goodbye
- Religious or cultural traditions require a service
- People would find it helpful to gather together at the funeral

## Holding a separate memorial

Many families choose direct cremation and then hold a **celebration of life** or **memorial service** later, at home, outdoors or in another meaningful place. This can be personal and cost less than a traditional funeral.

## Choosing a provider

Many national companies and local funeral directors offer direct cremation. Compare their Standardised Price Lists, check reviews and ask for a written, itemised quote. If you are buying a pre-paid funeral plan, check the provider is authorised by the Financial Conduct Authority (FCA).

**Source:** SunLife Cost of Dying Report 2026; Competition and Markets Authority; FCA
    `.trim(),
  },

  "tell-us-once": {
    slug: "tell-us-once",
    title: "Tell Us Once: notifying the government",
    category: "Government",
    readTime: 3,
    lastUpdated: "October 2026",
    content: `
## What is Tell Us Once?

Tell Us Once is a free government service that lets you report a death to many government organisations at the same time, rather than contacting each one separately.

It is available in England, Scotland and Wales. It is not available in Northern Ireland. In Northern Ireland, contact each organisation yourself. The nidirect website explains who to tell.

## Who does it tell?

- **HMRC**: about tax
- **DWP**: about benefits and State Pension
- **DVLA**: about the driving licence and vehicles
- **HM Passport Office**: to cancel the passport
- **Veterans UK**: if the person got a war pension or Armed Forces Compensation
- **The local council**: for example council tax, Housing Benefit, Blue Badges and electoral registration
- Some public sector pension schemes

## How to use it

1. **Register the death**
2. The registrar will give you a **Tell Us Once reference number** (it lasts 28 days)
3. Use it online at **gov.uk/tell-us-once** or by calling **0800 085 7308**
4. Give the details asked for about the person who died

## What Tell Us Once does not cover

Tell Us Once does **not** tell:
- Banks and building societies
- Private or workplace pension providers
- Insurance companies
- Utility companies
- Subscription services

You will need to contact these yourself.

## After Tell Us Once

You should get letters from the organisations that were told. Keep these for your records.

**Source:** GOV.UK: Tell Us Once; nidirect
    `.trim(),
  },

  "repatriation-explained": {
    slug: "repatriation-explained",
    title: "Repatriation explained",
    category: "Funerals",
    readTime: 5,
    lastUpdated: "October 2026",
    content: `
## What is repatriation?

Repatriation means moving the body of a person who has died to another country for burial or cremation. It can mean bringing someone home to the UK, or taking someone from the UK to another country.

## Who arranges it?

Most families use a funeral director who specialises in international funerals. Some local funeral directors can also arrange it.

If the person died abroad, their travel insurance may cover repatriation. Check the policy as soon as you can.

## Moving a body out of England or Wales

The funeral director needs to give notice to the coroner (Form 104) at least 4 clear days before the body is moved. You need to wait for the coroner's authorisation before the body can leave. Scotland and Northern Ireland have their own arrangements.

## What documents are needed?

**From the UK, usually:**
- A certified copy of the death certificate (translated if needed)
- The coroner's authorisation to move the body out of England or Wales
- An embalming certificate (in most cases)
- A certificate confirming freedom from infection (some countries)

**For the receiving country:**
- These vary. The funeral director or the country's embassy can advise.

## How long does it take?

It often takes 1 to 2 weeks, depending on the country and the paperwork needed.

## How much does it cost?

Costs vary a lot depending on:
- The destination country
- Distance and how the body is transported (usually by air)
- Embalming requirements
- Document fees

As a rough guide, repatriation within Europe may cost £2,000 to £5,000, and long-haul destinations may cost £5,000 to £12,000 or more. Ask for a written, itemised quote.

## Travel insurance

If the person had travel insurance when they died abroad, the costs may be covered. Contact the insurer as soon as possible.

## Who can help?

- **The Foreign, Commonwealth and Development Office (FCDO)**: can give consular support if the death happened abroad (020 7008 5000)
- **Your funeral director**: can organise the whole process
- **The relevant embassy**: can advise on documents

**Source:** GOV.UK: Death abroad; GOV.UK: Moving a body out of England or Wales; FCDO
    `.trim(),
  },
};

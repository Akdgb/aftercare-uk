// The tester checklist, shared by the feedback page and the email it sends
export const FEEDBACK_SECTIONS: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: "Making a plan",
    items: [
      { id: "questions", label: "Answered all the questions without getting stuck" },
      { id: "plan", label: "The plan appeared at the end" },
      { id: "tick", label: "Ticking a task off worked" },
      { id: "undo", label: "Undo worked" },
      { id: "notyet", label: "\"Not yet\" moved the task along" },
      { id: "remove", label: "\"This doesn't apply to us\" removed a task" },
    ],
  },
  {
    title: "Different situations",
    items: [
      { id: "adult", label: "A plan for an adult made sense" },
      { id: "child", label: "A plan for a child or baby made sense" },
      { id: "faith", label: "Faith or background added sensible steps" },
    ],
  },
  {
    title: "Saving and signing in",
    items: [
      { id: "email", label: "Entered my email on \"Keep your plan safe\"" },
      { id: "arrived", label: "The email arrived" },
      { id: "opened", label: "Opening the email showed my plan" },
      { id: "signin", label: "Signing in again later worked" },
    ],
  },
  {
    title: "Sharing",
    items: [
      { id: "invite", label: "Invited someone and they could open the plan" },
      { id: "pdf", label: "\"Save as PDF\" worked" },
      { id: "message", label: "\"Send as a message\" worked" },
    ],
  },
  {
    title: "Other",
    items: [
      { id: "support", label: "\"It has been a while. I need support\" worked" },
      { id: "help", label: "Found what I looked for in Help" },
      { id: "logo", label: "Tapping the AfterCare logo took me home" },
    ],
  },
];

export const FEEDBACK_ANSWERS = { yes: "Worked", no: "Didn't work", skip: "Didn't try" } as const;
export type FeedbackAnswer = keyof typeof FEEDBACK_ANSWERS;
export const FEEDBACK_TEXT = [
  { id: "problems", label: "Problems you found (what you did, what happened)" },
  { id: "confusing", label: "Anything confusing or badly worded" },
  { id: "ideas", label: "Anything you'd add or change" },
] as const;

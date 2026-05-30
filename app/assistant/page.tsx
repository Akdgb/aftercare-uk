"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowUp, Bot, ExternalLink, Loader2, MessageCircle, RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How much does a burial cost in London?",
  "What documents do I need to register a death?",
  "Can I inherit my parent's council flat?",
  "How long does probate take?",
  "What is Tell Us Once and how do I use it?",
  "What is a direct cremation?",
  "Am I entitled to Bereavement Support Payment?",
  "What happens to a pension when someone dies?",
];

const STARTER_CONTENT = `I am your AfterCare bereavement assistant. I can help you with questions about:\n\n- **Registering a death** and the documents you need\n- **Funeral options** — burial, cremation, and costs\n- **Probate** and estate administration\n- **Government support** — DWP benefits and Tell Us Once\n- **Council housing** succession and tenancy rights\n- **Pensions, banks, and insurance** notifications\n- **Local services** near you\n\nPlease note: I provide guidance based on UK law and government information. For legal advice specific to your situation, please consult a qualified solicitor.`;

async function getAssistantResponse(messages: Message[]): Promise<{ content: string; sources: string[] }> {
  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!response.ok) throw new Error("API error");
    return response.json();
  } catch {
    return {
      content: getFallbackResponse(messages[messages.length - 1]?.content ?? ""),
      sources: [],
    };
  }
}

function getFallbackResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("probate")) {
    return "**Probate** is the legal process of administering a deceased person's estate.\n\n**How long does it take?**\nA straightforward probate application typically takes 16 weeks from application to receiving the Grant of Probate. The full estate administration, including selling property and distributing assets, can take 6–12 months.\n\n**When do you need probate?**\n- When the deceased owned property in their sole name\n- When the estate is worth more than £10,000\n- When financial institutions require it\n\n**How to apply**\nYou can apply online at GOV.UK or through a solicitor. The fee is £273 for estates over £5,000.\n\n**Source:** GOV.UK — Applying for Probate";
  }

  if (q.includes("council") && (q.includes("flat") || q.includes("house") || q.includes("tenancy"))) {
    return "**Inheriting a council tenancy** is called **succession**.\n\n**Who can succeed?**\n- A spouse or civil partner automatically has the right to succeed\n- Other family members who lived with the tenant for 12 months before death may succeed\n- Succession can only happen once\n\n**What to do:**\n1. Notify the council's housing department immediately\n2. Ask for a Succession to Tenancy form\n3. Provide proof of your relationship and residency\n\n**Important:** If you do not have an automatic right to succeed, the council may offer an alternative tenancy or require you to vacate.\n\n**Source:** Shelter — Council housing and succession rights";
  }

  if (q.includes("direct cremation")) {
    return "**Direct cremation** is a simple cremation with no funeral service or ceremony.\n\n**What's included:**\n- Collection of the deceased\n- Cremation at a local crematorium\n- Return of ashes in a simple urn\n\n**What's not included:**\n- No hearse, limousine, or flowers\n- No church, chapel, or graveside service\n- No formal viewing\n\n**Cost:** Typically £700–£1,800 depending on provider and location — significantly less than a full funeral.\n\n**Who it's suitable for:**\n- Families on a tight budget\n- Those who prefer a private, low-key farewell\n- When a memorial service will be held separately at a later date\n\nDirect cremations have grown rapidly in the UK — roughly 20% of cremations are now direct.\n\n**Source:** SunLife Cost of Dying Report 2024; GOV.UK";
  }

  if (q.includes("register") && q.includes("death")) {
    return "**Registering a death in England and Wales**\n\n**When:** You must register within 5 days of the death (8 days in Scotland).\n\n**Who can register:**\n- A relative who was present at the death\n- A relative living in the area\n- Any person present at the death\n- The funeral director (if no family is available)\n\n**What you need:**\n- The Medical Certificate of Cause of Death (from the doctor or hospital)\n- The deceased's NHS medical card (if available)\n- Any NHS or DWP paperwork\n\n**Where to go:**\nVisit your local register office. You must book an appointment. Find your nearest office at GOV.UK.\n\n**What you'll receive:**\n- The death certificate (you'll need multiple certified copies — approximately £11 each)\n- A Certificate for Burial or Cremation (the 'green form')\n- A BD8 form for the DWP\n\n**Source:** GOV.UK — Register a Death";
  }

  if (q.includes("bereavement support payment") || q.includes("bsp")) {
    return "**Bereavement Support Payment (BSP)**\n\nThis replaced the old Bereavement Allowance in April 2017.\n\n**Who qualifies:**\n- You were married to or in a civil partnership with the deceased\n- They paid National Insurance contributions for at least 25 weeks\n- You were under State Pension age when they died\n\n**How much:**\n- **Higher rate:** £3,500 lump sum + £350/month for 18 months (if you have dependent children)\n- **Lower rate:** £2,500 lump sum + £100/month for 18 months (no dependent children)\n\n**Important deadlines:**\n- You must apply within **3 months** of bereavement to receive the full amount\n- You can still apply up to 21 months after the death, but you will receive fewer monthly payments\n\n**How to apply:**\nCall the DWP Bereavement Service: **0800 731 0469**\n\n**Source:** GOV.UK — Bereavement Support Payment";
  }

  if (q.includes("tell us once")) {
    return "**Tell Us Once** is a free government service that allows you to report a death to multiple government departments in one go.\n\n**Departments notified:**\n- DWP (Department for Work and Pensions)\n- HMRC (tax and benefits)\n- DVLA (driving licence)\n- Passport Office\n- Veterans UK\n- Local council (for council tax, housing benefit, blue badge)\n\n**How to use it:**\n1. Register the death at the register office\n2. The registrar will give you a Tell Us Once reference number\n3. Use this number at gov.uk/tell-us-once or call **0800 085 7308**\n4. You have 28 days to use the reference number\n\n**Note:** You must use Tell Us Once separately for each government department — they do not share information with banks, pension providers, or utilities.\n\n**Source:** GOV.UK — Tell Us Once";
  }

  if (q.includes("pension")) {
    return "**What happens to a pension when someone dies?**\n\n**Workplace pension (defined contribution):**\n- Contact the pension provider directly with a death certificate\n- The provider will ask for a nominated beneficiary form (if the deceased completed one)\n- Lump sum payments are usually tax-free if the deceased was under 75\n- The provider's discretion normally applies — nominations are not legally binding\n\n**State pension:**\n- Notify the DWP via Tell Us Once or directly\n- State Pension payments stop on death\n- Married partners may be entitled to some of the deceased's State Pension\n\n**Defined benefit (final salary) pension:**\n- A spouse or civil partner's pension is usually payable automatically\n- Contact the pension scheme administrator\n\n**Action steps:**\n1. Locate all pension paperwork or P60s\n2. Contact each pension provider in writing with a certified death certificate\n3. Complete any claim forms promptly — there is usually no time limit, but delays can cause complications\n\n**Source:** Money and Pensions Service; GOV.UK";
  }

  if (q.includes("cost") || q.includes("price") || q.includes("how much")) {
    return "**Average funeral costs in the UK (2024)**\n\n| Type | Average cost |\n|------|-------------|\n| Traditional burial | £4,200–£6,500 |\n| Traditional cremation | £3,200–£5,200 |\n| Direct cremation | £700–£1,800 |\n\n**What affects the cost:**\n- Your location (London and the South East are significantly more expensive)\n- Type of coffin\n- Whether you include a service, flowers, and limousines\n- The funeral director you choose\n\n**Cost-saving tips:**\n- Get at least 3 written quotes (required by law under FCA rules)\n- Direct cremation is the most affordable option\n- Consider a simple coffin — the legal minimum requirement is a sealed container\n- Ask funeral directors for an itemised price list\n\n**Financial help:**\n- Funeral Expenses Payment (if on qualifying benefits)\n- Bereavement Support Payment (if spouse/partner)\n- Some councils and charities offer grants\n\n**Source:** SunLife Cost of Dying Report 2024";
  }

  return "Thank you for your question. I'm here to help you navigate bereavement administration.\n\nI can provide guidance on:\n\n- **Registering a death** — what you need and where to go\n- **Funeral options and costs** — burial, cremation, direct cremation\n- **Probate** — when it's needed and how to apply\n- **Government support** — Bereavement Support Payment, Funeral Expenses Payment\n- **Council housing** — tenancy succession rights\n- **Pensions and banks** — who to notify and how\n\nPlease try asking a specific question from the suggestions below, or describe your situation and I will do my best to help.\n\n*Note: For legal advice specific to your circumstances, always consult a qualified solicitor.*";
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const { content: reply, sources } = await getAssistantResponse(allMessages);

    const assistantMsg: Message = {
      id: `a${Date.now()}`,
      role: "assistant",
      content: reply,
      sources,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n- /g, "<br/>• ")
      .replace(/\n\*/g, "<br/>•")
      .replace(/\n/g, "<br/>")
      .replace(/\|(.*?)\|/g, (match) => `<span class="font-mono text-xs">${match}</span>`);
  };

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Bereavement Assistant</h1>
              <p className="text-sm text-slate-500">
                Ask questions about what to do, what you&apos;re entitled to, and how things work.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {messages.length === 0 ? (
          <div>
            {/* Welcome */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div
                  className="text-sm text-slate-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(STARTER_CONTENT) }}
                />
              </div>
            </div>

            {/* Suggested questions */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Suggested questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-slate-700 hover:border-slate-400 hover:shadow-sm transition-all"
                  >
                    <MessageCircle className="h-3.5 w-3.5 inline mr-2 text-slate-400" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-2xl rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-slate-700 text-white rounded-tr-md"
                      : "bg-white border border-stone-200 text-slate-700 rounded-tl-md"
                  )}
                >
                  <div
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      {msg.sources.map((s) => (
                        <a
                          key={s}
                          href={s}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {s}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}

            {/* Quick suggestions after conversation starts */}
            {!loading && messages.length > 0 && messages.length < 6 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-slate-600 hover:border-slate-400 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask a question about bereavement, funerals, probate, or financial support..."
                rows={1}
                className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[46px] max-h-36"
                style={{ height: "auto" }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-stone-200 transition-colors flex-shrink-0"
                title="New conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Guidance only — not legal advice. Always consult a qualified professional for your specific situation.
          </p>
        </div>
      </div>
    </div>
  );
}

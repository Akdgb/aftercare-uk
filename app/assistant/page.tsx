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

const STARTER_CONTENT = `I am an AI assistant, not a person. My answers are generated automatically and can be wrong, so please check important details with the official source. I can help you with questions about:\n\n- **Registering a death** and the documents you need\n- **Funeral options**: burial, cremation and costs\n- **Probate** and dealing with an estate\n- **Government support**: DWP benefits and Tell Us Once\n- **Council housing** and taking over a tenancy\n- **Pensions, banks and insurance**: who to tell\n- **Local services** near you\n\nPlease note: I give general guidance based on UK government information. Most of it applies to England and Wales, and rules can differ in Scotland and Northern Ireland. For legal or financial advice about your situation, please speak to a qualified professional.`;

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
    return "**Probate** is the legal right to deal with the estate (money, property and possessions) of a person who has died. This answer is for England and Wales. In Scotland the process is called confirmation.\n\n**How long does it take?**\nGetting the grant can take several months. Check GOV.UK for current processing times. Dealing with the whole estate, including selling property and sharing out the money, often takes 6 to 18 months.\n\n**When do you need probate?**\n- When the person owned property or land in their sole name\n- When a bank or other organisation asks for it. Each bank sets its own limit, often between £5,000 and £50,000.\n- When the person held shares or investments in their sole name\n\n**How to apply**\nYou can apply online at GOV.UK, by post, or through a solicitor. The fee is £526 for estates over £5,000. There is no fee if the estate is £5,000 or less. Extra copies of the grant cost £2 each.\n\nCheck whether you need to send Inheritance Tax forms. Most estates with no tax to pay do not need to.\n\n**Source:** GOV.UK: Applying for probate";
  }

  if (q.includes("council") && (q.includes("flat") || q.includes("house") || q.includes("tenancy"))) {
    return "**Taking over a council tenancy** is called **succession**. This answer is for England. Rules are different in Wales, Scotland and Northern Ireland.\n\n**Who can take over the tenancy?**\n- For tenancies that started on or after 1 April 2012, a husband, wife, civil partner or partner who lived in the home usually has the right to take over the tenancy. There is no 12-month rule for them.\n- Other relatives may qualify if the tenancy is older, or under the council's own policy.\n- Usually a tenancy can only be passed on once.\n\n**What to do:**\n1. Tell the council's housing team as soon as you can\n2. Ask about succession and whether there is a form to fill in\n3. Provide proof of your relationship and that you lived there\n4. Keep paying the rent if you can\n\nIf you are worried about losing your home, get advice from Shelter or Citizens Advice.\n\n**Source:** Shelter; Citizens Advice; GOV.UK";
  }

  if (q.includes("direct cremation")) {
    return "**Direct cremation** is a simple cremation without a funeral service at the crematorium.\n\n**What is usually included:**\n- Bringing the person into the provider's care\n- A simple coffin\n- Cremation at a crematorium\n- Return of the ashes\n\n**What is usually not included:**\n- Hearse, funeral cars or flowers\n- A service at the crematorium\n- Viewing the person (some providers offer this for an extra cost)\n\n**Cost:** about £1,628 on average, though prices vary by provider and area.\n\n**It may suit families who:**\n- Need to keep costs down\n- Prefer a quiet, private farewell\n- Would like to hold a memorial later\n\nAbout 1 in 5 funerals in the UK (21%) is now a direct cremation.\n\n**Source:** SunLife Cost of Dying Report 2026";
  }

  if (q.includes("register") && q.includes("death")) {
    return "**Registering a death**\n\n**When:** In England, Wales and Northern Ireland, within 5 days. In England and Wales this is usually counted from when the register office receives the medical certificate. In Scotland, within 8 days. If a coroner is involved, the register office will tell you when you can register.\n\n**The medical certificate:** Since 9 September 2024 in England and Wales, a medical examiner reviews the cause of death and the Medical Certificate of Cause of Death is sent to the register office electronically. You do not need to collect it. Wait for the register office or the medical examiner's office to contact you, then book your appointment.\n\n**Who can register:**\n- A relative of the person who died\n- Someone who was present at the death\n- The person in charge of the building where the death happened\n- The person arranging the funeral (not the funeral director)\n\n**What to take, if you have them:**\n- The person's NHS number or medical card\n- Their birth certificate and marriage or civil partnership certificate\n\n**Where to go:**\nIn England and Wales you can register at any register office, but registering in the area where the death happened is quickest.\n\n**What you will receive:**\n- A death certificate. Certified copies cost £12.50 each in England and Wales when bought at registration (fees may change from 9 November 2026).\n- A Certificate for Burial or Cremation (the 'green form')\n- A Tell Us Once reference number, or a BD8 form if you cannot use Tell Us Once\n\n**Source:** GOV.UK: Register a death";
  }

  if (q.includes("bereavement support payment") || q.includes("bsp")) {
    return "**Bereavement Support Payment**\n\nThis replaced Bereavement Allowance in April 2017.\n\n**You may be able to get it if:**\n- You were married, in a civil partnership, or living together with children\n- The person who died paid National Insurance contributions for at least 25 weeks, or died because of an accident at work or a disease caused by work\n- You were under State Pension age when they died\n\n**How much:**\n- **Higher rate:** £3,500 first payment, then 18 monthly payments of £350\n- **Lower rate:** £2,500 first payment, then 18 monthly payments of £100\n\n**Deadlines:**\n- Claim within **3 months** of the death to get the full amount\n- You can claim up to 21 months after the death, but if you claim more than 12 months after, you will not get the first payment\n\n**How to claim:**\nCall the DWP Bereavement Service on **0800 151 2012** (Relay UK: 18001 then 0800 731 0469; Welsh language: 0800 731 0453).\n\n**Source:** GOV.UK: Bereavement Support Payment";
  }

  if (q.includes("tell us once")) {
    return "**Tell Us Once** is a free government service that lets you report a death to many government organisations at the same time. It is available in England, Scotland and Wales, but not in Northern Ireland.\n\n**Who it tells:**\n- DWP (benefits and State Pension)\n- HMRC (tax)\n- DVLA (driving licence and vehicles)\n- HM Passport Office\n- Veterans UK\n- The local council (for example council tax, Housing Benefit and Blue Badges)\n\n**How to use it:**\n1. Register the death\n2. The registrar will give you a Tell Us Once reference number\n3. Use it at gov.uk/tell-us-once or call **0800 085 7308**\n4. The reference number lasts 28 days\n\n**Note:** Tell Us Once does not tell banks, private or workplace pension providers, or utility companies. You will need to contact these yourself.\n\nIn Northern Ireland, contact each organisation yourself. The nidirect website explains who to tell.\n\n**Source:** GOV.UK: Tell Us Once; nidirect";
  }

  if (q.includes("pension")) {
    return "**What happens to a pension when someone dies?**\n\n**Workplace or personal pension (defined contribution):**\n- Contact the pension provider with a copy of the death certificate\n- The provider will check whether the person filled in a form saying who they wanted to receive the money\n- The provider usually decides who receives any lump sum\n- Tax rules for pensions after death are changing from April 2027. Check with the provider.\n\n**State Pension:**\n- Tell the DWP using Tell Us Once, or contact them directly\n- State Pension payments stop when someone dies\n- A husband, wife or civil partner may be able to get extra State Pension, depending on their circumstances\n\n**Defined benefit (final salary) pension:**\n- A pension for a husband, wife or civil partner is often payable\n- Contact the scheme administrator\n\n**What to do:**\n1. Find any pension paperwork or annual statements\n2. Contact each pension provider with a copy of the death certificate\n3. Fill in any claim forms as soon as you can\n\n**Source:** MoneyHelper; GOV.UK";
  }

  if (q.includes("cost") || q.includes("price") || q.includes("how much")) {
    return "**Average funeral costs in the UK**\n\n- Traditional funeral: about £4,510 (burial about £5,440, cremation about £4,200)\n- Simple attended funeral: £3,828\n- Direct cremation: £1,628\n\n**What affects the cost:**\n- Where you live (London and the South East are usually more expensive)\n- The coffin\n- Whether you have a service, flowers and funeral cars\n- The funeral director you choose\n\n**Ways to keep costs down:**\n- Compare funeral directors. Every funeral director has to show a Standardised Price List in their premises and on their website.\n- Ask for a written, itemised quote\n- Consider a direct cremation\n- There is no legal minimum coffin. A simple or eco coffin is usually accepted.\n\n**Financial help:**\n- You may be able to get a Funeral Expenses Payment if you get certain benefits (Funeral Support Payment in Scotland)\n- You may be able to get Bereavement Support Payment if your husband, wife, civil partner or partner died\n- Help from councils varies. Down to Earth gives free advice on arranging an affordable funeral (020 8983 5055).\n\n**Source:** SunLife Cost of Dying Report 2026; Competition and Markets Authority";
  }

  return "Thank you for your question. I am here to help with the practical things that need to be done after someone dies.\n\nI can give guidance on:\n\n- **Registering a death**: what happens and where to go\n- **Funeral options and costs**: burial, cremation and direct cremation\n- **Probate**: when it is needed and how to apply\n- **Government support**: Bereavement Support Payment and Funeral Expenses Payment\n- **Council housing**: taking over a tenancy\n- **Pensions and banks**: who to tell and how\n\nPlease try one of the suggested questions, or describe your situation and I will do my best to help.\n\n*This is general guidance, not legal or financial advice. For advice about your situation, speak to a qualified professional.*";
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = {
      id: `u${nextId.current++}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const { content: reply, sources } = await getAssistantResponse(allMessages);

    const assistantMsg: Message = {
      id: `a${nextId.current++}`,
      role: "assistant",
      content: reply,
      sources,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  // Escape first: replies are rendered as HTML, so raw text must never become markup
  const formatContent = (content: string) => {
    return content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|\n)[-*] /g, "$1• ")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-stone-50 border-b border-stone-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ink-700 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900">Ask a question</h1>
              <p className="text-sm text-ink-500">
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
                <div className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div
                  className="text-sm text-ink-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(STARTER_CONTENT) }}
                />
              </div>
            </div>

            {/* Suggested questions */}
            <div>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">
                Suggested questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-ink-700 hover:border-ink-400 hover:shadow-sm transition-all"
                  >
                    <MessageCircle className="h-3.5 w-3.5 inline mr-2 text-ink-400" />
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
                  <div className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-2xl rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-ink-700 text-white rounded-tr-md"
                      : "bg-white border border-stone-200 text-ink-700 rounded-tl-md"
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
                          className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-700"
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
                    <User className="h-4 w-4 text-ink-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 text-ink-400 animate-spin" />
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
                    className="text-left px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-ink-600 hover:border-ink-400 transition-all"
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
                className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-400 min-h-[46px] max-h-36"
                style={{ height: "auto" }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send question"
              className="w-11 h-11 bg-ink-700 rounded-xl flex items-center justify-center text-white hover:bg-ink-800 disabled:opacity-40 disabled:pointer-events-none transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center text-ink-500 hover:bg-stone-200 transition-colors flex-shrink-0"
                title="New conversation"
                aria-label="Start a new conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-ink-400 mt-2">
            AI assistant: answers are generated automatically and can be wrong. Do not share personal details such as names, addresses or account numbers. This is general guidance, not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  PoundSterling,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Answer a few questions",
    description: "Tell us about your situation in under 5 minutes. No account needed to start.",
  },
  {
    number: "02",
    title: "Receive your personal plan",
    description: "Get a step-by-step roadmap tailored to your circumstances and location.",
  },
  {
    number: "03",
    title: "Take action with confidence",
    description: "Follow your plan with local resources, guidance, and AI support alongside you.",
  },
];

const features = [
  {
    icon: FileText,
    title: "Personal Action Plan",
    description:
      "A prioritised roadmap of what you need to do — right now, this week, and in the weeks ahead.",
    href: "/plan",
  },
  {
    icon: MapPin,
    title: "Local Resources",
    description:
      "Find your nearest registry office, funeral directors, cemeteries, and crematoriums.",
    href: "/resources",
  },
  {
    icon: PoundSterling,
    title: "Financial Support",
    description:
      "Check whether you qualify for Funeral Expenses Payment, Bereavement Support Payment, or other help.",
    href: "/financial-support",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description:
      "Ask anything — from probate timelines to council housing rights — and get clear, sourced answers.",
    href: "/assistant",
  },
  {
    icon: Users,
    title: "Family Workspace",
    description:
      "Invite family members, assign tasks, and coordinate everything in one shared space.",
    href: "/family",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Guidance",
    description:
      "Plain-English explanations of every process — registering a death, probate, repatriation, and more.",
    href: "/guidance",
  },
];

const testimonials = [
  {
    quote:
      "I had no idea where to start. AfterCare gave me a clear list of what to do first — it made an impossible situation feel manageable.",
    name: "Sarah M.",
    role: "Lost her father",
  },
  {
    quote:
      "The local resources tool helped me find a funeral director near Mum's home within minutes. I was too exhausted to search myself.",
    name: "James T.",
    role: "Lost his mother",
  },
  {
    quote:
      "I didn't know we qualified for the Funeral Expenses Payment until AfterCare flagged it. That was a genuine relief.",
    name: "Priya K.",
    role: "Lost her husband",
  },
];

const checklistItems = [
  "Register the death",
  "Obtain death certificates",
  "Notify government departments",
  "Contact banks and pension providers",
  "Arrange the funeral",
  "Apply for financial support",
  "Handle housing and tenancy",
  "Begin probate if required",
];

export default function HomePage() {
  return (
    <div className="bg-stone-50">
      {/* Hero */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 mb-8">
              <Heart className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
              <span className="text-xs text-slate-600 font-medium">Bereavement Support for UK Families</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Helping families know{" "}
              <span className="text-slate-600">what to do next</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl">
              Receive a personalised bereavement plan, local guidance, support information, and practical
              next steps after losing a loved one.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/intake">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/guidance">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Guidance
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Free to use. No account required to get started.
            </p>
          </div>
        </div>
      </section>

      {/* What needs doing banner */}
      <section className="bg-slate-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-3">After someone dies, there is a lot to manage.</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                AfterCare creates your personalised checklist so nothing is missed during the most difficult time.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How AfterCare works</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Less than 5 minutes to a complete, personalised bereavement roadmap.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-stone-200" />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-slate-700 text-white rounded-xl flex items-center justify-center text-sm font-bold mb-5">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/intake">
              <Button size="lg">
                Get Your Personalised Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need in one place</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              From immediate actions to long-term estate administration — AfterCare covers every step.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href} className="group">
                  <Card className="h-full hover:border-slate-300 hover:shadow-md transition-all duration-200">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                        <Icon className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-slate-600 text-sm font-medium">
                        Learn more
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-14">
            Supporting families across the UK
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-800">Ready in 5 minutes</p>
                <p className="text-sm text-slate-500">Answer a short questionnaire to get your plan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-800">Safe and private</p>
                <p className="text-sm text-slate-500">Your information is protected and never sold</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-800">Local to you</p>
                <p className="text-sm text-slate-500">Resources and guidance specific to your area</p>
              </div>
            </div>
            <div>
              <Link href="/intake">
                <Button size="lg">
                  Start Your Plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

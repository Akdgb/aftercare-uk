"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, MessageSquare, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlanSummary {
  id: string;
  role: "owner" | "member";
  intake_data: { deceasedFirstName: string; deceasedLastName: string };
}

const FEATURES = [
  { icon: UserPlus, title: "Invite by email", desc: "Add brothers, sisters, children or friends. They sign in with their own email — no passwords." },
  { icon: CheckCircle2, title: "Share the tasks", desc: "Everyone sees the same plan. Tick tasks off and say who's doing what, so nothing is done twice." },
  { icon: MessageSquare, title: "Leave notes", desc: "Record what the bank said or which funeral director you called, right on the task." },
];

export default function FamilyPage() {
  const [plans, setPlans] = useState<PlanSummary[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then(async (r) => {
        setSignedIn(r.ok);
        setPlans(r.ok ? ((await r.json()).plans ?? []) : []);
      })
      .catch(() => {
        setSignedIn(false);
        setPlans([]);
      });
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-gradient-to-b from-white to-stone-50 border-b border-stone-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-ink-500 text-sm mb-2">
            <Users className="h-4 w-4" /> Family Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900">Share the plan with your family</h1>
          <p className="text-ink-500 mt-2 max-w-2xl">
            There&apos;s a lot to do after someone dies, and it shouldn&apos;t all fall on one person. Invite family
            members to your plan so you can divide up tasks and keep each other informed.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title}>
                <CardContent className="p-5">
                  <Icon className="h-5 w-5 text-ink-600 mb-3" />
                  <p className="text-sm font-semibold text-ink-800">{f.title}</p>
                  <p className="text-sm text-ink-500 mt-1">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {plans === null ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
          </div>
        ) : !signedIn ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-ink-700 font-medium mb-2">Start with a plan, then invite your family</p>
              <p className="text-sm text-ink-500 mb-6">
                Create your plan (it takes about 3 minutes), save it, and use &ldquo;Invite family member&rdquo; inside it.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/intake">
                  <Button>
                    Create my plan <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/signin?next=/family">
                  <Button variant="outline">Sign in</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-ink-700 font-medium mb-2">You don&apos;t have any saved plans yet</p>
              <p className="text-sm text-ink-500 mb-6">
                Create a plan first — then you can invite family members to it. If someone has invited you, ask them to
                check they used this email address.
              </p>
              <Link href="/intake">
                <Button>
                  Create my plan <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-ink-700">Your plans</h2>
            {plans.map((p) => (
              <Link key={p.id} href={`/plan/${p.id}#family`} className="block group">
                <Card className="hover:shadow-md hover:border-ink-300 transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {p.intake_data.deceasedFirstName} {p.intake_data.deceasedLastName}
                      </p>
                      <p className="text-xs text-ink-400">
                        {p.role === "owner" ? "You can invite family to this plan" : "Shared with you"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-ink-700" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

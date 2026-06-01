import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Save your plan</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Create a free account to save your plan and come back to it any time
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: "shadow-sm border border-stone-200 rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border border-stone-200 hover:bg-stone-50",
              formButtonPrimary: "bg-slate-700 hover:bg-slate-800 text-sm",
              footerActionLink: "text-slate-700 font-medium",
            },
          }}
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}

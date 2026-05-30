import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Heart className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Page not found</h1>
        <p className="text-slate-500 mb-8">
          We could not find the page you were looking for. Return to the homepage to continue.
        </p>
        <Link href="/">
          <Button size="lg">Back to homepage</Button>
        </Link>
      </div>
    </div>
  );
}

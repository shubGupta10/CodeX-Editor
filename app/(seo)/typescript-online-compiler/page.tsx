import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "TypeScript Online Compiler - Run TS Code in Browser",
  description: "Run TypeScript code online with no setup. Write and execute TS directly in your browser.",
};

export default function Page() {
  return (
    <div className="bg-[#1e1e1e] min-h-screen text-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
        Run TypeScript Code Online
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
        Run TypeScript code online with no setup. Write and execute TS directly in your browser.
      </p>
      
      <Link href="/editor?lang=typescript">
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 text-[15px] font-medium rounded-lg flex items-center justify-center transition-colors">
          Open Editor
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </Link>

      <div className="mt-12 text-sm text-gray-500 max-w-lg">
        <p>CodeX provides a powerful browser-based environment for TypeScript developers. Simply open the editor, write your code, and click run.</p>
      </div>
    </div>
  );
}

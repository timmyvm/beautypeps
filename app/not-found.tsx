import type { Metadata } from "next";
import { NotFoundContent } from "@/components/info/not-found-content";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Page not found",
};

// Unmatched URLs render outside the (site) layout, so include the site chrome here.
export default function RootNotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </div>
  );
}

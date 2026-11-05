import Link from "next/link";
import { Route, ArrowRight, ChevronRight, MessageSquareText, FileText, ListChecks, BadgeCheck } from "lucide-react";

const steps = [
  { icon: MessageSquareText, t: "You ask", d: "Tell us what you want to do with your property." },
  { icon: FileText, t: "We analyse", d: "AI4Planning checks your property and provides a personalised insight." },
  { icon: ListChecks, t: "We recommend", d: "See the best next steps and relevant services for your project." },
  { icon: BadgeCheck, t: "You get results", d: "Progress with confidence, with expert support when needed." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        <header className="how-head">
          <span className="how-icon"><Route size={26} color="var(--cyan)" /></span>
          <div>
            <h2>From planning question to the right solution</h2>
            <p>A simple, guided journey with expert support when you need it.</p>
          </div>
          <Link href="/check/unsure?actor=homeowner" className="how-all">Try it now <ArrowRight size={14} /></Link>
        </header>
        <ol className="how-steps">
          {steps.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="how-step">
              <Icon size={38} strokeWidth={1.3} color={i === 1 ? "#a98bff" : "var(--cyan)"} />
              <div><h3>{t}</h3><p>{d}</p></div>
              {i < steps.length - 1 && <ChevronRight className="how-arrow" size={18} />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

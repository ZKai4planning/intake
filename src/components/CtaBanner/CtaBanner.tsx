import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";

const perks = ["Track progress", "Save and compare options", "Get personalised recommendations"];

export default function CtaBanner() {
  return (
    <section className="cta-section">
      <div className={`container cta-banner`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cta-phone" src="/images/home/app-phone.jpg" alt="The AI4Planning app showing a property boundary on a map" width={505} height={338} loading="lazy" decoding="async" />
        <div className="cta-text">
          <h2>Take your project further</h2>
          <p>Save your project, add services, and get expert support all in one place.</p>
        </div>
        <Link href="/signup" className="cta-cta">Create a free account <ArrowRight size={16} /></Link>
        <ul className="cta-perks">
          {perks.map((p) => (<li key={p}><CircleCheck size={18} color="var(--cyan)" /> {p}</li>))}
        </ul>
      </div>
    </section>
  );
}

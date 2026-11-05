import Link from "next/link";
import { Database, MapPin, BrainCircuit, Users, ArrowRight } from "lucide-react";

const items = [
  { icon: Database, t: "Authoritative data", d: "Live and trusted sources" },
  { icon: MapPin, t: "Local planning rules", d: "Accurate to your area" },
  { icon: BrainCircuit, t: "AI-powered analysis", d: "Clear, plain English insights" },
  { icon: Users, t: "Human expertise", d: "Vetted professionals" },
];

export default function TrustedData() {
  return (
    <section className="td-section">
      <div className={`container td-grid`}>
        <div>
          <h2>Trusted data. Real planning intelligence.</h2>
          <p className="td-lead">We combine authoritative datasets with AI to give you accurate, location-specific insights.</p>
          <ul className="td-items">
            {items.map(({ icon: Icon, t, d }) => (
              <li key={t}><Icon size={32} strokeWidth={1.3} color="var(--cyan)" /><strong>{t}</strong><small>{d}</small></li>
            ))}
          </ul>
        </div>
        <aside className="td-panel">
          <h3>See the data behind your insights</h3>
          <p>Learn how our data sources work together<br />to give you reliable results.</p>
          <Link href="/#how-it-works" className="btn btnOutline">How it works <ArrowRight size={16} /></Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="td-visual" src="/images/home/data-layers.jpg" alt="Layers of planning data — maps, boundaries and constraints — combined into one view" width={506} height={338} loading="lazy" decoding="async" />
        </aside>
      </div>
    </section>
  );
}

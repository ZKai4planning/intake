import Link from "next/link";
import { Database } from "lucide-react";

// [name (alt text), caption, logo file in /public/logos/partners]
const partners = [
  ["Ordnance Survey", "Maps & geography", "os-official.svg"],
  ["HM Land Registry", "Property ownership", "hmlr-official.webp"],
  ["Environment Agency", "Flood risk & environment", "environment-agency-official.webp"],
  ["Historic England", "Heritage & conservation", "historic-england-official.svg"],
  ["Ministry of Housing, Communities & Local Government", "Planning policy & housing", "mhclg-official.svg"],
  ["British Geological Survey", "Geology & ground data", "bgs-official.webp"],
  ["Office for National Statistics", "Statistics & census", "ons-official.svg"],
  ["Ofcom", "Communications & coverage", "ofcom-official.svg"],
  ["Ofsted", "Schools & education", "ofsted-official.webp"],
  ["GOV.UK", "National datasets", "govuk-official.svg"],
] as const;

export default function TrustedBar() {
  return (
    <section className="tb-bar">
      <div className={`container tb-inner`}>
        <div className="tb-lead">
          <Database size={34} color="var(--cyan)" />
          <div>
            <strong>Trusted property data<br />&amp; integrations</strong>
            <small>Real data. Real insight. A clearer picture.</small>
          </div>
        </div>
        {/* Only this strip scrolls — lead + "more" stay fixed. Two copies for a seamless loop. */}
        <div className="tb-marquee">
          <ul className="tb-track">
            {[0, 1].map((copy) => partners.map(([name, caption, file]) => (
              <li key={`${copy}-${name}`} aria-hidden={copy === 1}>
                <span className="tb-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/logos/partners/${file}`} alt={copy === 1 ? "" : name} draggable={false} />
                </span>
                <small>{caption}</small>
              </li>
            )))}
          </ul>
        </div>
        <Link href="/#partner-models-heading" className="tb-more">+ more</Link>
      </div>
    </section>
  );
}

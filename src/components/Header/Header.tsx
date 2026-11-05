import Link from "next/link";
import { Search, ShoppingCart, ChevronRight } from "lucide-react";

const nav = ["Home", "How it works", "Project types", "Services", "Pricing", "Guides", "About"];

export default function Header() {
  return (
    <header className="hdr-header">
      <div className={`container hdr-inner`}>
        <Link href="/" className="hdr-logo">
          <span className="hdr-mark" aria-hidden>▲</span>
          <span className="hdr-name">AI4Planning</span>
        </Link>
        <p className="hdr-tagline">Smarter planning<br />for a brighter tomorrow</p>
        <nav className="hdr-nav" aria-label="Main">
          {nav.map((n, i) => (
            <Link key={n} href="#" className={i === 0 ? "hdr-active" : ""}>{n}</Link>
          ))}
        </nav>
        <div className="hdr-actions">
          <button aria-label="Search"><Search size={20} /></button>
          <Link href="#" className="hdr-project">
            <ShoppingCart size={18} /> My Project <span className="hdr-badge">2</span>
            <ChevronRight size={16} />
          </Link>
          <span className="hdr-avatar">2K</span>
        </div>
      </div>
    </header>
  );
}

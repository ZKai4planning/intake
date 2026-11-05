"use client";

import { useRouter } from "next/navigation";
import { Home, Users, ArrowRight, CircleCheck } from "lucide-react";
import type { ActorId } from "@/types";

const cards = [
  {
    key: "home", actorId: "homeowner" as ActorId, img: "homeowner", icon: Home, title: "I'm a homeowner",
    text: "Get clear guidance for your property project.\nFrom initial ideas to application and beyond.",
    cta: "Start my project", filled: true,
    list: ["Explore what's possible", "Understand constraints", "Get expert support when needed"],
  },
  {
    key: "pro", actorId: "business" as ActorId, img: "professional", icon: Users, title: "I'm a business / professional",
    text: "Win more work and run your business\nmore efficiently.",
    cta: "Explore professional tools", filled: false,
    list: ["Access powerful planning tools", "Manage projects and clients", "Grow your business with AI4Planning"],
  },
];

export default function Audience() {
  const router = useRouter();

  const handleSelect = (actorId: ActorId) => {
    if (actorId === "business") {
      window.location.href = "https://planningconsultant.vercel.app/";
      return;
    }

    // Homeowners go to the guided Project Intake chat (details → property →
    // project → questions → verify email). See components/intake/.
    router.push("/start");
  };

  return (
    <section className="aud-section">
      <div className="container aud-grid">
        {cards.map(({ key, actorId, img, icon: Icon, title, text, cta, filled, list }) => (
          <article key={key} className={`aud-card aud-${key}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/home/${img}.jpg`} alt="" className="aud-photo" width={506} height={335} decoding="async" />
            <div className="aud-content">
              <span className="aud-icon"><Icon size={30} /></span>
              <h2>{title}</h2>
              <p>{text}</p>
              <div className="aud-actions">
                <button type="button" onClick={() => handleSelect(actorId)} className={`btn ${filled ? "btnPrimary" : "btnOutline"}`}>
                  {cta} <ArrowRight size={16} />
                </button>
                <button type="button" onClick={() => handleSelect(actorId)} className="aud-circle" aria-label={cta}>
                  <ArrowRight size={18} />
                </button>
              </div>
              <ul>
                {list.map((l) => (<li key={l}><CircleCheck size={18} color="var(--cyan)" /> {l}</li>))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

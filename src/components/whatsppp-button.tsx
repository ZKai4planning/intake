// import { FaWhatsapp } from "react-icons/fa";

// const WhatsAppButton = ({
//   inline = false,
// }: {
//   inline?: boolean
// }) => {
//   // IMPORTANT: wa.me numbers must NOT include "+"
//   const phoneNumber = "447777788885";
//   const message = "Hello! I have a query.";

//   const handleClick = () => {
//     const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <button
//       onClick={handleClick}
//       aria-label="Chat on WhatsApp"
//       className={
//         inline
//           ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:h-14 sm:w-14"
//           : "fixed bottom-20 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:bottom-21 sm:right-6 sm:h-14 sm:w-14"
//       }
//     >
//       <FaWhatsapp className="text-white text-2xl sm:text-3xl" />
//     </button>
//   );
// };

// export default WhatsAppButton;

"use client"

import { usePathname } from "next/navigation";

const WhatsAppButton = ({
  inline = false,
}: {
  inline?: boolean
}) => {
  const pathname = usePathname();
  // The dashboard has its own in-app support (Get Help + the assistant
  // widget) — don't stack the WhatsApp bubble on top of that everywhere
  // a signed-in user navigates. Every other surface (landing page,
  // admin, agentx) keeps it.
  const isDashboard = pathname?.startsWith("/dashboard");

  // IMPORTANT: wa.me numbers must NOT include "+"
  const phoneNumber = "447777788885";
  const message = "Hello! I have a query.";

  if (isDashboard) return null;

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className={
        inline
          ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:h-14 sm:w-14"
          : "fixed bottom-20 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 sm:bottom-21 sm:right-6 sm:h-14 sm:w-14"
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-6 w-6 text-white sm:h-7 sm:w-7"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.09c-.24.68-1.4 1.33-1.93 1.4-.49.07-1.11.1-1.79-.11a16 16 0 0 1-1.64-.6c-2.9-1.25-4.79-4.17-4.93-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.13 1.01-2.42.26-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.64.77 1.92.91.29.14.48.21.55.33.07.12.07.68-.17 1.36z"/>
      </svg>
    </button>
  );
};

export default WhatsAppButton;
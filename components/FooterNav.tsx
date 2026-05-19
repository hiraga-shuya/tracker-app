"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "ホーム",
    icon: "🏠",
  },
  {
    href: "/habit",
    label: "習慣",
    icon: "📘",
  },
  {
    href: "/profile",
    label: "プロフィール",
    icon: "🧙",
  },
];

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <footer
      className="
        fixed bottom-0 left-0 w-full
        border-t-4 border-black
        bg-[#2a1f1a]
        text-white
        z-50
        shadow-[0_-4px_0_#000]
      "
    >
      <nav className="max-w-[900px] mx-auto">
        <ul className="grid grid-cols-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center
                    py-3
                    border-r-2 border-black
                    transition-all
                    ${
                      isActive
                        ? "bg-[#facc15] text-black"
                        : "bg-[#3b2f2f] hover:bg-[#4b3b3b]"
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>

                  <span
                    className="
                      text-[11px]
                      tracking-wider
                      font-bold
                      mt-1
                    "
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
}

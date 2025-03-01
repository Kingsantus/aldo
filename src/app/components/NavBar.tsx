"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="max-w-[90%] mx-auto">
      <nav className="bg-transparent p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <span className="text-xl font-semibold dark:text-white">ALDO</span>
        </Link>
        <div className="hidden md:flex space-x-4">
          <NavLink href="/" active={pathname === "/"}>Home</NavLink>
          <NavLink href="/create-mint" active={pathname === "/create-mint"}>Mint Token</NavLink>
          <NavLink href="/message" active={pathname === "/message"}>Chat User</NavLink>
          <NavLink href="/send-token" active={pathname === "/send-token"}>Send Token</NavLink>
        </div>
        <div className="flex md:order-2 space-x-3">
          <WalletMultiButton
                style={{
                     backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "25px 5px 40px 25px",
                    color: "white",
                    padding: "14px 30px",
                    fontWeight: "bold",
                    backdropFilter: "blur(8px)",
                }}
                />
        </div>
        <MobileNav />
      </nav>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active: boolean;
}

function NavLink({ href, children, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`text-white dark:text-white px-3 cursor-pointer py-2 rounded-md text-xl font-medium ${active ? 'bg-blue-900 dark:bg-gray-700' : ''}`}
    >
      {children}
    </Link>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <button 
        className="px-4 py-2 border rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-transparent dark:bg-gray-800 shadow-lg rounded-md flex flex-col space-y-2 p-2 z-50">
          <NavLink href="/" active={pathname === "/"}>Home</NavLink>
          <NavLink href="/create-mint" active={pathname === "/create-mint"}>Mint Token</NavLink>
          <NavLink href="/message" active={pathname === "/message"}>Chat User</NavLink>
          <NavLink href="/send-token" active={pathname === "/send-token"}>Send Token</NavLink>
          <NavLink href="/market-data" active={pathname === "/market-data"}>NFT Market</NavLink>
        </div>
      )}
    </div>
  );
}
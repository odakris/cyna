import Link from "next/link"
import React from "react"
import { Linkedin, FileText, Mail, Copyright, ExternalLink } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#302082] text-white shadow-inner">
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-3">
              <Image
                src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
                alt="CYNA Logo"
                width={140}
                height={35}
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-sm text-gray-300 text-center md:text-left">
              Solutions de cybersécurité professionnelles pour protéger votre
              entreprise
            </p>
          </div>

          {/* Liens rapides */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 relative pb-2">
              Liens rapides
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-[#FF6B00] rounded"></span>
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/mentions-legales"
                className="flex items-center text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Mentions Légales
              </Link>
              <Link
                href="/contact"
                className="flex items-center text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </nav>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 relative pb-2">
              Nous suivre
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-[#FF6B00] rounded"></span>
            </h3>
            <Link
              href="https://www.linkedin.com/company/cyna-it/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
              <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
            </Link>
          </div>
        </div>
      </div>

      {/* Section copyright */}
      <div className="border-t border-white/10 bg-[#231968]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-300">
          <div className="flex items-center mb-2 sm:mb-0">
            <Copyright className="h-3 w-3 mr-1" />
            <span>
              {new Date().getFullYear()} CYNA IT. Tous droits réservés.
            </span>
          </div>
          <div>Site développé avec Next.js et Tailwind CSS</div>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import React from "react"
import { Linkedin } from "lucide-react"

export function Footer() {
  return (
    <div className="cyna-bg-primary-color">
      <div className="flex justify-between max-w-7xl mx-auto px-10 py-4 w-full underline hover:no-underline cyna-text-color">
        <Link href="/mentions-legales">Mentions Légales</Link>
        <Link href="https://www.linkedin.com/company/cyna-it/" target="_blank">
          <Linkedin />
        </Link>
      </div>
    </div>
  )
}

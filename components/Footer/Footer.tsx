import Link from "next/link"
import React from "react"

export function Footer() {
  return (
    <div className="cyna-bg-primary-color">
      <div className="max-w-7xl mx-auto px-10 py-4 w-full underline hover:no-underline cyna-text-color">
        <Link href="./mentions-legales">Mentions Légales</Link>
      </div>
    </div>
  )
}

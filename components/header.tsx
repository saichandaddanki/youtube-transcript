"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Download, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-effect shadow-md py-3" : "bg-transparent py-5",
      )}
    >
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold shadow-md">
              <Youtube className="h-5 w-5" />
            </span>
            <span
              className={cn(
                "font-bold text-lg transition-colors",
                isScrolled ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-white",
              )}
            >
              Transcript Extractor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-500 dark:hover:text-brand-400",
                isScrolled ? "text-gray-700 dark:text-gray-300" : "text-gray-700 dark:text-gray-300",
              )}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-500 dark:hover:text-brand-400",
                isScrolled ? "text-gray-700 dark:text-gray-300" : "text-gray-700 dark:text-gray-300",
              )}
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-500 dark:hover:text-brand-400",
                isScrolled ? "text-gray-700 dark:text-gray-300" : "text-gray-700 dark:text-gray-300",
              )}
            >
              Benefits
            </Link>
            <Link
              href="#faq"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-500 dark:hover:text-brand-400",
                isScrolled ? "text-gray-700 dark:text-gray-300" : "text-gray-700 dark:text-gray-300",
              )}
            >
              FAQ
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="outline"
              className={cn(
                "rounded-full border-brand-200 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800",
                isScrolled
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-brand-600 dark:text-brand-400 bg-white/80 dark:bg-gray-900/80",
              )}
            >
              Sign In
            </Button>
            <Button className="rounded-full gradient-bg hover:opacity-90 text-white shadow-md">
              <Download className="mr-2 h-4 w-4" /> Start Extracting
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-effect border-t border-gray-100 dark:border-gray-800 absolute top-full left-0 right-0 shadow-lg">
          <div className="container px-4 py-4 flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-gray-700 dark:text-gray-300 font-medium py-2 hover:text-brand-500 dark:hover:text-brand-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 dark:text-gray-300 font-medium py-2 hover:text-brand-500 dark:hover:text-brand-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-gray-700 dark:text-gray-300 font-medium py-2 hover:text-brand-500 dark:hover:text-brand-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefits
            </Link>
            <Link
              href="#faq"
              className="text-gray-700 dark:text-gray-300 font-medium py-2 hover:text-brand-500 dark:hover:text-brand-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="pt-2 flex flex-col space-y-3">
              <Button
                variant="outline"
                className="w-full justify-center rounded-lg border-brand-200 dark:border-gray-700"
              >
                Sign In
              </Button>
              <Button className="w-full justify-center rounded-lg gradient-bg">
                <Download className="mr-2 h-4 w-4" /> Start Extracting
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

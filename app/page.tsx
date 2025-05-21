import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, FileText, Search, CheckCircle, ArrowRight, Play, Youtube } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import TestimonialCarousel from "@/components/testimonial-carousel"
import FeatureCard from "@/components/feature-card"
import StepGuide from "@/components/step-guide"
import Header from "@/components/header"
import TranscriptForm from "@/components/transcript-form"
import FAQSection from "@/components/faq-section"
import PricingSection from "@/components/pricing-section"
import EnterpriseFeatures from "@/components/enterprise-features"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        id="hero"
        className="w-full pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-brand-50 via-accent1-50 to-accent2-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="bg-brand-500 hover:bg-brand-600 shadow-sm">Enterprise SaaS</Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none gradient-text">
                  Extract YouTube Captions Others Can't Access
                </h1>
                <p className="max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl">
                  Our enterprise-grade API extracts transcripts from any YouTube video, even those with restricted
                  captions.
                </p>
              </div>
              <TranscriptForm variant="hero" />
              <div className="flex items-center space-x-4 pt-4">
                <Button
                  variant="outline"
                  className="rounded-full border-brand-200 bg-white/50 backdrop-blur-sm hover:bg-brand-50 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Play className="mr-2 h-4 w-4 text-brand-500" /> Watch Demo
                </Button>
                <Button
                  variant="link"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[500px] h-[300px] overflow-hidden rounded-xl border border-brand-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-accent1-500/10 z-10"></div>
                <Image
                  src="/placeholder-2r9o1.png"
                  alt="YouTube Transcript Extractor Demo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-lg">
                    <Youtube className="h-8 w-8 text-brand-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
              >
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                Enterprise-Grade Features
              </h2>
              <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Extract transcripts that other tools can't access
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-brand-500" />}
              title="Restricted Caption Access"
              description="Extract captions from videos with restricted programmatic access."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-brand-500" />}
              title="Multiple Export Formats"
              description="Download transcripts in .txt, .srt, .csv, or .vtt formats for any use case."
            />
            <FeatureCard
              icon={<Search className="h-10 w-10 text-brand-500" />}
              title="Enterprise API Access"
              description="Integrate our enterprise transcript extraction API into your applications."
            />
          </div>
          <div className="mt-12 text-center">
            <Button className="rounded-full bg-brand-50 text-brand-500 hover:bg-brand-100 hover:text-brand-600 px-8 py-6 text-lg font-medium dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-gray-700">
              Explore All Features <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
              >
                How It Works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                How It Works
              </h2>
              <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Extract YouTube transcripts in just four simple steps
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
            <StepGuide
              number={1}
              title="Paste YouTube URL"
              description="Copy and paste any YouTube video URL into the input field."
            />
            <StepGuide
              number={2}
              title="Select Language"
              description="Choose your preferred language for the transcript."
            />
            <StepGuide
              number={3}
              title="View & Search"
              description="Browse through the transcript and search for specific content."
            />
            <StepGuide
              number={4}
              title="Download Format"
              description="Choose your preferred format and download the transcript."
            />
          </div>
          <div className="mt-16 flex justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-2xl w-full border border-brand-100 dark:border-gray-700">
              <TranscriptForm buttonText="Extract Now" />
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <EnterpriseFeatures />

      {/* Pricing Section */}
      <PricingSection />

      {/* SEO Content Section */}
      <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
                >
                  Benefits
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                  Why Use Our Enterprise API?
                </h2>
                <p className="max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Unlock the full potential of your video content
                </p>
              </div>
              <ul className="grid gap-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Access Restricted Captions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our enterprise API can extract captions from videos where other tools fail, using advanced browser
                      simulation techniques.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Multi-language Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extract transcripts in any language available on the video, making your content accessible to a
                      global audience.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">API Integration</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Integrate our transcript extraction capabilities directly into your applications with our robust
                      API.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Enterprise-grade Reliability</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Built for businesses that need consistent, reliable transcript extraction at scale.
                    </p>
                  </div>
                </li>
              </ul>
              <div className="pt-4">
                <Button className="rounded-lg gradient-bg hover:opacity-90 text-white px-6 py-2 font-medium shadow-md transition-all hover:shadow-lg">
                  Start Extracting <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Tabs defaultValue="txt" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-4 p-1 bg-brand-50 dark:bg-gray-800">
                  <TabsTrigger
                    value="txt"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-brand-500 dark:data-[state=active]:text-brand-400"
                  >
                    .TXT
                  </TabsTrigger>
                  <TabsTrigger
                    value="srt"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-brand-500 dark:data-[state=active]:text-brand-400"
                  >
                    .SRT
                  </TabsTrigger>
                  <TabsTrigger
                    value="vtt"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-brand-500 dark:data-[state=active]:text-brand-400"
                  >
                    .VTT
                  </TabsTrigger>
                  <TabsTrigger
                    value="csv"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-brand-500 dark:data-[state=active]:text-brand-400"
                  >
                    .CSV
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="txt"
                  className="border rounded-lg p-4 mt-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-inner"
                >
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-[300px]">
                    {`0:00
Hello and welcome to this video.
0:03
Today we're going to talk about transcript extraction.
0:07
This is an example of what your transcript will look like in TXT format.
0:12
Simple, clean, and easy to read.
...`}
                  </pre>
                </TabsContent>
                <TabsContent
                  value="srt"
                  className="border rounded-lg p-4 mt-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-inner"
                >
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-[300px]">
                    {`1
00:00:00,000 --> 00:00:03,000
Hello and welcome to this video.

2
00:00:03,000 --> 00:00:07,000
Today we're going to talk about transcript extraction.

3
00:00:07,000 --> 00:00:12,000
This is an example of what your transcript will look like in SRT format.
...`}
                  </pre>
                </TabsContent>
                <TabsContent
                  value="vtt"
                  className="border rounded-lg p-4 mt-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-inner"
                >
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-[300px]">
                    {`WEBVTT

00:00:00.000 --> 00:00:03.000
Hello and welcome to this video.

00:00:03.000 --> 00:00:07.000
Today we're going to talk about transcript extraction.

00:00:07.000 --> 00:00:12.000
This is an example of what your transcript will look like in VTT format.
...`}
                  </pre>
                </TabsContent>
                <TabsContent
                  value="csv"
                  className="border rounded-lg p-4 mt-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-inner"
                >
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-[300px]">
                    {`start,end,text
0,3,"Hello and welcome to this video."
3,7,"Today we're going to talk about transcript extraction."
7,12,"This is an example of what your transcript will look like in CSV format."
12,16,"Simple, clean, and easy to read."
...`}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
              >
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                What Our Users Say
              </h2>
              <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of content creators who use our tool every day
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl mt-12">
            <TestimonialCarousel />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">Ready to Get Started?</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Extract Transcripts Others Can't Access
              </h2>
              <p className="max-w-[900px] text-white/90 md:text-xl/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed">
                Join thousands of businesses who rely on our enterprise-grade API
              </p>
            </div>
            <div className="w-full max-w-lg space-y-4 bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20">
              <TranscriptForm variant="cta" buttonText="Extract Transcript Now" />
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                </div>
                <span className="text-white text-sm">Enterprise API</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                </div>
                <span className="text-white text-sm">Restricted Caption Access</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="h-5 w-5 rounded-full bg-green-400/20 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                </div>
                <span className="text-white text-sm">Enterprise Support</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20"></div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 md:py-12 bg-gray-900 text-gray-300">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
                  <Youtube className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-medium">YouTube Transcript Extractor</h3>
              </div>
              <p className="text-sm text-gray-400">Extract, view, and download YouTube captions instantly.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#hero" className="hover:text-brand-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-brand-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-brand-400 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-brand-400 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-brand-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-400 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-brand-400 transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-400 transition-colors">
                    Feedback
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-400 transition-colors">
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>© 2025 YouTube Transcript Extractor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

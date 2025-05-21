"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How does the YouTube Transcript Extractor work?",
    answer:
      "Our tool uses YouTube's API to access the closed captions/subtitles that are available on videos. When you paste a YouTube URL, we extract the video ID, fetch all available captions, and convert them into readable formats that you can download.",
  },
  {
    question: "Is this tool completely free to use?",
    answer:
      "Yes! The YouTube Transcript Extractor is 100% free to use with no limitations. There's no signup required, no hidden fees, and no usage limits. We believe in making content accessibility tools available to everyone.",
  },
  {
    question: "What if a YouTube video doesn't have captions?",
    answer:
      "Our tool can only extract captions that already exist on the video. If the video creator hasn't added captions or if YouTube's automatic captions aren't available, we won't be able to extract a transcript. You'll receive a notification if no captions are available.",
  },
  {
    question: "Which file formats can I download the transcript in?",
    answer:
      "We currently support four formats: TXT (plain text with timestamps), SRT (SubRip subtitle format), VTT (Web Video Text Tracks format), and CSV (comma-separated values for spreadsheets and data analysis).",
  },
  {
    question: "Can I extract transcripts in languages other than English?",
    answer:
      "Yes! Our tool can extract captions in any language that's available on the video. If the video has multiple language tracks, we'll extract the default language. In a future update, we plan to add language selection.",
  },
  {
    question: "Is there a limit to how many transcripts I can extract?",
    answer:
      "There are no limits on our end. You can extract as many transcripts as you need. However, please be mindful of YouTube's terms of service regarding content usage.",
  },
  {
    question: "Do you store the transcripts or video information?",
    answer:
      "No, we don't store any transcripts or video information on our servers. All processing happens in your browser session, and once you leave the page or close your browser, the data is gone. We prioritize your privacy.",
  },
  {
    question: "Can I use the transcripts for commercial purposes?",
    answer:
      "While our tool is free to use, the content of YouTube videos is subject to copyright. You should check the video's license and potentially contact the content creator before using transcripts commercially.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
            >
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know about our YouTube Transcript Extractor
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md",
                openIndex === index
                  ? "border-brand-300 dark:border-brand-700 shadow-md"
                  : "border-gray-200 dark:border-gray-700",
              )}
            >
              <button
                className="flex justify-between items-center w-full p-6 text-left"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="font-medium text-lg">{faq.question}</h3>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-brand-500 dark:text-brand-400 transition-transform duration-200",
                    openIndex === index ? "transform rotate-180" : "",
                  )}
                />
              </button>
              <div
                id={`faq-answer-${index}`}
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-96" : "max-h-0",
                )}
                aria-hidden={openIndex !== index}
              >
                <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "/smiling-woman-short-hair.png",
    content:
      "This tool has saved me countless hours of manual transcription work. I use it to repurpose my YouTube videos into blog posts and social media content.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Educator",
    avatar: "/smiling-asian-man-glasses.png",
    content:
      "As a teacher, I use YouTube Transcript Extractor to create study materials for my students. The multiple format options make it incredibly versatile.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Podcast Host",
    avatar: "/latina-woman-smiling.png",
    content:
      "I've tried many transcript tools, but this one is by far the most accurate and user-friendly. It's become an essential part of my content workflow.",
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow bg-white dark:bg-gray-900">
                <CardContent className="p-6 md:p-10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                      <Quote className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic md:text-lg">"{testimonial.content}"</p>
                    <div className="pt-4 flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-brand-200 dark:border-gray-700 shadow-md">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-gray-800"
          onClick={prev}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4 text-brand-500 dark:text-brand-400" />
        </Button>
        {testimonials.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 p-0 rounded-full ${
              index === current ? "bg-brand-500 dark:bg-brand-400" : "bg-gray-300 dark:bg-gray-600"
            }`}
            onClick={() => {
              setAutoplay(false)
              setCurrent(index)
            }}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:hover:bg-gray-800"
          onClick={next}
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4 text-brand-500 dark:text-brand-400" />
        </Button>
      </div>
    </div>
  )
}

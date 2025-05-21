"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckIcon, XIcon } from "lucide-react"

export default function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
            >
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              Choose Your Plan
            </h2>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Simple, transparent pricing for all your transcript needs
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-8 mb-12">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${!annual ? "font-medium text-brand-600" : "text-gray-600"}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} className="data-[state=checked]:bg-brand-500" />
            <span className={`text-sm ${annual ? "font-medium text-brand-600" : "text-gray-600"}`}>
              Annual{" "}
              <Badge className="ml-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Save 20%</Badge>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 justify-center">
          {/* Free Plan */}
          <Card className="flex flex-col border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>For occasional use</CardDescription>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                <span className="text-4xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>5 transcripts per day</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Basic language support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>TXT, SRT, VTT, CSV formats</span>
                </li>
                <li className="flex items-center">
                  <XIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-500">No API access</span>
                </li>
                <li className="flex items-center">
                  <XIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-500">Standard support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col relative border-brand-200 dark:border-brand-800 shadow-md">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <Badge className="bg-brand-500 hover:bg-brand-600">Popular</Badge>
            </div>
            <CardHeader className="pb-8">
              <CardTitle className="text-xl">Pro</CardTitle>
              <CardDescription>For content creators</CardDescription>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                <span className="text-4xl font-extrabold tracking-tight">${annual ? "9" : "12"}</span>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>100 transcripts per day</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>All language support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>All export formats</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Basic API access</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full gradient-bg hover:opacity-90">Subscribe Now</Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="flex flex-col border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <CardDescription>For businesses</CardDescription>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                <span className="text-4xl font-extrabold tracking-tight">${annual ? "39" : "49"}</span>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited transcripts</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>All language support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>All export formats</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Full API access</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Dedicated support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include secure processing and data privacy. Need a custom plan?{" "}
            <a href="#contact" className="text-brand-500 hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}

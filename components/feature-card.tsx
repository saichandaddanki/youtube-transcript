import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-100 hover:border-brand-200 dark:border-gray-800 dark:hover:border-gray-700 group">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-brand-100 dark:bg-gray-800 w-16 h-16 flex items-center justify-center group-hover:bg-brand-200 dark:group-hover:bg-gray-700 transition-colors shadow-sm group-hover:shadow-md">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        <div className="pt-2">
          <span className="inline-flex items-center text-brand-500 dark:text-brand-400 text-sm font-medium group-hover:underline">
            Learn more <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

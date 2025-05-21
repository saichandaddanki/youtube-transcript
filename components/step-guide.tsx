interface StepGuideProps {
  number: number
  title: string
  description: string
}

export default function StepGuide({ number, title, description }: StepGuideProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 group">
      <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-105">
        {number}
      </div>
      <div className="h-1 w-12 bg-brand-200 dark:bg-gray-700 hidden lg:block lg:absolute lg:top-8 lg:right-0 lg:translate-x-1/2"></div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  )
}

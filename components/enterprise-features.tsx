import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Code, Database, Lock, Shield, Users } from "lucide-react"

export default function EnterpriseFeatures() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-brand-200 text-brand-500 px-4 py-1 dark:border-gray-700 dark:text-brand-400"
            >
              Enterprise
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              Enterprise-Grade Solutions
            </h2>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our professional API is built for businesses that need reliable transcript extraction at scale
            </p>
          </div>
        </div>

        <div className="grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <CardTitle>Advanced API Access</CardTitle>
              <CardDescription>Integrate transcript extraction directly into your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">RESTful API with comprehensive documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Multiple authentication methods</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Rate limits customized to your needs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <CardTitle>Restricted Caption Access</CardTitle>
              <CardDescription>Extract captions that other tools can't access</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced browser simulation techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Multiple extraction methods for maximum reliability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Works with videos that have restricted captions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>Process multiple videos simultaneously</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Upload CSV files with multiple video URLs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Parallel processing for faster results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Bulk download in your preferred format</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>Keep your data safe and secure</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">End-to-end encryption for all data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">GDPR and CCPA compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">SOC 2 Type II certified infrastructure</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>Work together on transcript projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Multi-user access with role-based permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Shared transcript libraries</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Activity logs and audit trails</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-brand-500 dark:text-brand-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="M8 11h8" />
                  <path d="M12 15V7" />
                </svg>
              </div>
              <CardTitle>SLA Guarantees</CardTitle>
              <CardDescription>Reliable service with guaranteed uptime</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">99.9% uptime guarantee</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">24/7 priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated account manager</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

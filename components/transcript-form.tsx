"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Download, Loader2, Search, Youtube, AlertCircle, Bug, Globe } from "lucide-react"
import { extractTranscript, downloadTranscript } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface TranscriptFormProps {
  className?: string
  buttonText?: string
  showIcon?: boolean
  variant?: "default" | "hero" | "cta"
}

export default function TranscriptForm({
  className = "",
  buttonText = "Get Transcript",
  showIcon = true,
  variant = "default",
}: TranscriptFormProps) {
  const [loading, setLoading] = useState(false)
  const [transcript, setTranscript] = useState<any[] | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [activeFormat, setActiveFormat] = useState("txt")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any | null>(null)
  const [debugLoading, setDebugLoading] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const { toast } = useToast()

  // Extract video ID from URL for preview
  useEffect(() => {
    const input = document.querySelector('input[name="youtubeUrl"]') as HTMLInputElement
    if (!input) return

    const handleInput = () => {
      try {
        const url = input.value
        if (!url) {
          setVideoThumbnail(null)
          setVideoId(null)
          return
        }

        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        const match = url.match(regex)
        if (match && match[1]) {
          const id = match[1]
          setVideoId(id)
          setVideoThumbnail(`https://img.youtube.com/vi/${id}/mqdefault.jpg`)
        } else {
          setVideoThumbnail(null)
          setVideoId(null)
        }
      } catch (e) {
        setVideoThumbnail(null)
        setVideoId(null)
      }
    }

    input.addEventListener("input", handleInput)
    return () => input.removeEventListener("input", handleInput)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTranscript(null)
    setSearchTerm("")
    setError(null)
    setDebugInfo(null)
    setAvailableLanguages([])

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("language", selectedLanguage)
      const result = await extractTranscript(formData)

      if (result.error) {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.success && result.transcript) {
        setTranscript(result.transcript)
        setVideoId(result.videoId)
        setVideoTitle(result.videoTitle)

        if (result.availableLanguages && result.availableLanguages.length > 0) {
          setAvailableLanguages(result.availableLanguages)
        }

        toast({
          title: "Success!",
          description: `Transcript extracted successfully using ${result.method || "API"}.`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: string) => {
    if (!videoId) return

    setDownloadLoading(true)
    setActiveFormat(format)

    try {
      const formData = new FormData()
      formData.append("videoId", videoId)
      formData.append("format", format)

      const result = await downloadTranscript(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.success && result.content) {
        // Create a blob and download it
        const blob = new Blob([result.content], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Downloaded!",
          description: `Transcript downloaded in ${format.toUpperCase()} format.`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleDebug = async () => {
    if (!videoId) return

    setDebugLoading(true)
    setDebugInfo(null)

    try {
      const response = await fetch(`/api/debug?videoId=${videoId}`)
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Debug error:", error)
      setDebugInfo({ error: "Failed to debug. See console for details." })
    } finally {
      setDebugLoading(false)
    }
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
  }

  // Filter transcript based on search term
  const filteredTranscript = transcript
    ? transcript.filter((entry) => entry.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  // Different styling based on variant
  const getFormClasses = () => {
    switch (variant) {
      case "hero":
        return "w-full max-w-md space-y-2"
      case "cta":
        return "w-full max-w-lg space-y-4 bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg"
      default:
        return `w-full ${className}`
    }
  }

  const getInputClasses = () => {
    switch (variant) {
      case "hero":
        return "h-12 rounded-lg border-gray-200 bg-white px-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:focus-visible:ring-brand-400"
      case "cta":
        return "h-14 rounded-lg border-transparent bg-white/90 px-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-white text-lg dark:bg-gray-800/90 dark:text-white"
      default:
        return "h-12 rounded-lg border-gray-200 bg-white px-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:focus-visible:ring-brand-400"
    }
  }

  const getButtonClasses = () => {
    switch (variant) {
      case "hero":
        return "h-12 rounded-lg gradient-bg hover:opacity-90 px-6 font-medium text-white shadow-md transition-all hover:shadow-lg"
      case "cta":
        return "h-14 rounded-lg bg-white px-6 font-medium text-brand-600 hover:bg-white/90 shadow-md transition-all hover:shadow-lg text-lg dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-gray-800/90"
      default:
        return "h-12 rounded-lg gradient-bg hover:opacity-90 px-6 font-medium text-white shadow-md transition-all hover:shadow-lg"
    }
  }

  return (
    <div className={getFormClasses()}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            name="youtubeUrl"
            className={getInputClasses()}
            placeholder="Paste YouTube URL here..."
            type="url"
            required
            disabled={loading}
          />
          <Button type="submit" className={getButtonClasses()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <span>{buttonText}</span>
                {showIcon && <ArrowRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </div>

        {/* Language selector */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Globe className="h-4 w-4" />
          <span>Language:</span>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="English" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="zh-Hans">Chinese (Simplified)</SelectItem>
              <SelectItem value="zh-Hant">Chinese (Traditional)</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      {/* Video Preview */}
      {videoThumbnail && !transcript && !loading && (
        <div className="mt-4 flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
            <Image src={videoThumbnail || "/placeholder.svg"} alt="Video thumbnail" fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Youtube className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ready to extract transcript</p>
            <p className="text-sm font-medium truncate">Click the button to start</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={handleDebug}
            disabled={debugLoading || !videoId}
            title="Debug caption availability"
          >
            {debugLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
          <h4 className="font-medium mb-2">Debug Information</h4>
          {debugInfo.error ? (
            <p className="text-red-500">{debugInfo.error}</p>
          ) : (
            <>
              <p>
                <span className="font-medium">Video Title:</span> {debugInfo.videoDetails?.title}
              </p>
              <p>
                <span className="font-medium">Channel:</span> {debugInfo.videoDetails?.channelTitle}
              </p>
              <p>
                <span className="font-medium">Has Captions:</span>{" "}
                <span className={debugInfo.hasCaptions ? "text-green-500" : "text-red-500"}>
                  {debugInfo.hasCaptions ? "Yes" : "No"}
                </span>
              </p>

              {/* Additional caption information */}
              <div className="mt-2 space-y-1">
                <p>
                  <span className="font-medium">Captions enabled in video details:</span>{" "}
                  <span className={debugInfo.captionsEnabledInVideoDetails ? "text-green-500" : "text-red-500"}>
                    {debugInfo.captionsEnabledInVideoDetails ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Caption tracks found:</span>{" "}
                  <span className={debugInfo.captionTracksFound ? "text-green-500" : "text-red-500"}>
                    {debugInfo.captionTracksFound ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Has timed text URL:</span>{" "}
                  <span className={debugInfo.hasTimedTextUrl ? "text-green-500" : "text-red-500"}>
                    {debugInfo.hasTimedTextUrl ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Has auto-generated captions:</span>{" "}
                  <span className={debugInfo.hasAutoGeneratedCaptions ? "text-green-500" : "text-red-500"}>
                    {debugInfo.hasAutoGeneratedCaptions ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Has transcript API:</span>{" "}
                  <span className={debugInfo.hasTranscriptApi ? "text-green-500" : "text-red-500"}>
                    {debugInfo.hasTranscriptApi ? "Yes" : "No"}
                  </span>
                </p>
              </div>

              {debugInfo.captionTracks && debugInfo.captionTracks.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Available Caption Tracks:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {debugInfo.captionTracks.map((track: any, index: number) => (
                      <li key={index}>
                        {track.name} ({track.languageCode}){track.isAutoGenerated && " - Auto-generated"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-2">
                <span className="font-medium">API Key Working:</span>{" "}
                <span className={debugInfo.apiKeyWorking ? "text-green-500" : "text-red-500"}>
                  {debugInfo.apiKeyWorking ? "Yes" : "No"}
                </span>
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transcript && transcript.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              {videoThumbnail && (
                <div className="relative w-12 h-12 rounded overflow-hidden mr-3 hidden sm:block">
                  <Image
                    src={videoThumbnail || "/placeholder.svg"}
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-medium">{videoTitle || "Transcript"}</h3>
            </div>

            {/* Language selector if available languages exist */}
            {availableLanguages.length > 0 && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.languageCode} value={lang.languageCode}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload("txt")}
                disabled={downloadLoading}
                className={`${
                  activeFormat === "txt" && downloadLoading ? "opacity-50" : ""
                } border-brand-200 dark:border-gray-700`}
              >
                {downloadLoading && activeFormat === "txt" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3 w-3" />
                )}
                TXT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload("srt")}
                disabled={downloadLoading}
                className={`${
                  activeFormat === "srt" && downloadLoading ? "opacity-50" : ""
                } border-brand-200 dark:border-gray-700`}
              >
                {downloadLoading && activeFormat === "srt" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3 w-3" />
                )}
                SRT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload("vtt")}
                disabled={downloadLoading}
                className={`${
                  activeFormat === "vtt" && downloadLoading ? "opacity-50" : ""
                } border-brand-200 dark:border-gray-700`}
              >
                {downloadLoading && activeFormat === "vtt" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3 w-3" />
                )}
                VTT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload("csv")}
                disabled={downloadLoading}
                className={`${
                  activeFormat === "csv" && downloadLoading ? "opacity-50" : ""
                } border-brand-200 dark:border-gray-700`}
              >
                {downloadLoading && activeFormat === "csv" ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3 w-3" />
                )}
                CSV
              </Button>
            </div>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-brand-200 dark:border-gray-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Card className="max-h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-inner">
            <Tabs defaultValue="preview">
              <TabsList className="mb-4 bg-white dark:bg-gray-900">
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-brand-50 data-[state=active]:text-brand-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-brand-400"
                >
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="raw"
                  className="data-[state=active]:bg-brand-50 data-[state=active]:text-brand-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-brand-400"
                >
                  Raw Data
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="space-y-4">
                {searchTerm && filteredTranscript.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No results found for "{searchTerm}"
                  </div>
                ) : filteredTranscript.length > 0 ? (
                  filteredTranscript.map((entry, index) => (
                    <div
                      key={index}
                      className="pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
                        {formatTime(entry.offset / 1000)} - {formatTime((entry.offset + entry.duration) / 1000)}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {searchTerm ? highlightSearchTerm(entry.text, searchTerm) : entry.text}
                      </p>
                    </div>
                  ))
                ) : (
                  transcript.map((entry, index) => (
                    <div
                      key={index}
                      className="pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
                        {formatTime(entry.offset / 1000)} - {formatTime((entry.offset + entry.duration) / 1000)}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{entry.text}</p>
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="raw">
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-[300px] bg-white dark:bg-gray-900 p-4 rounded-md">
                  {JSON.stringify(transcript, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

// Helper function to highlight search terms
function highlightSearchTerm(text: string, searchTerm: string) {
  if (!searchTerm) return text

  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={i} className="bg-brand-200 dark:bg-brand-900 font-medium rounded px-1">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

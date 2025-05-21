import TranscriptBookmarklet from "@/components/transcript-bookmarklet"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "YouTube Transcript Bookmarklet - Extract Captions Directly",
  description:
    "Use our bookmarklet to extract transcripts directly from YouTube's interface for any video with captions.",
}

export default function BookmarkletPage() {
  return (
    <div className="container px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text mb-4">
          YouTube Transcript Bookmarklet
        </h1>
        <p className="text-gray-600 dark:text-gray-300 md:text-xl max-w-2xl mx-auto">
          Extract transcripts directly from YouTube's interface when our automatic methods don't work
        </p>
      </div>

      <TranscriptBookmarklet />

      <div className="max-w-3xl mx-auto mt-16 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The bookmarklet is the most reliable way to extract transcripts from YouTube videos, as it works directly in
          your browser with your YouTube session.
        </p>
        <Button asChild variant="outline" className="mx-auto">
          <Link href="/">Return to main transcript extractor</Link>
        </Button>
      </div>
    </div>
  )
}

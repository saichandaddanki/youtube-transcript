"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyIcon, BookmarkIcon, InfoIcon, CheckIcon, AlertTriangleIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function TranscriptBookmarklet() {
  const [copied, setCopied] = useState(false)
  const bookmarkletRef = useRef<HTMLAnchorElement>(null)
  const { toast } = useToast()
  const [isBookmarkletDraggable, setIsBookmarkletDraggable] = useState(true)

  // Check if we're on a mobile device where drag-to-bookmark isn't supported
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsBookmarkletDraggable(!isMobile)
  }, [])

  // This is the bookmarklet code that will extract the transcript directly from YouTube's UI
  const bookmarkletCode = `javascript:(function(){
    function extractTranscript() {
      // Check if we're on YouTube
      if (!window.location.hostname.includes('youtube.com')) {
        alert('This bookmarklet only works on YouTube video pages.');
        return;
      }
      
      // Check if we're on a video page
      if (!window.location.pathname.includes('/watch')) {
        alert('Please navigate to a YouTube video page first.');
        return;
      }
      
      // Create a status overlay
      const statusOverlay = document.createElement('div');
      statusOverlay.style.position = 'fixed';
      statusOverlay.style.top = '20px';
      statusOverlay.style.right = '20px';
      statusOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      statusOverlay.style.color = 'white';
      statusOverlay.style.padding = '10px 20px';
      statusOverlay.style.borderRadius = '5px';
      statusOverlay.style.zIndex = '9999';
      statusOverlay.style.fontSize = '14px';
      statusOverlay.textContent = 'Looking for transcript...';
      document.body.appendChild(statusOverlay);
      
      // Method 1: Try to find the transcript button and click it
      const menuButtons = Array.from(document.querySelectorAll('button'));
      const transcriptButton = menuButtons.find(button => 
        button.textContent && button.textContent.includes('Show transcript')
      );
      
      if (transcriptButton) {
        statusOverlay.textContent = 'Found transcript button, clicking...';
        transcriptButton.click();
        setTimeout(() => getTranscriptContent(statusOverlay), 1000); // Wait for transcript to load
      } else {
        // Method 2: If button not found, try to open the ... menu first
        statusOverlay.textContent = 'Looking for more options menu...';
        const moreButton = menuButtons.find(button => 
          button.getAttribute('aria-label') === 'More actions'
        );
        
        if (moreButton) {
          statusOverlay.textContent = 'Found more options menu, clicking...';
          moreButton.click();
          setTimeout(() => {
            const menuItems = Array.from(document.querySelectorAll('tp-yt-paper-item, yt-formatted-string, span'));
            const transcriptMenuItem = menuItems.find(item => 
              item.textContent && item.textContent.includes('Show transcript')
            );
            
            if (transcriptMenuItem && transcriptMenuItem.closest('tp-yt-paper-item, button, ytd-menu-service-item-renderer')) {
              statusOverlay.textContent = 'Found transcript option, clicking...';
              transcriptMenuItem.closest('tp-yt-paper-item, button, ytd-menu-service-item-renderer').click();
              setTimeout(() => getTranscriptContent(statusOverlay), 1000);
            } else {
              // Method 3: Try to find the transcript panel directly
              statusOverlay.textContent = 'Looking for transcript panel...';
              setTimeout(() => {
                const transcriptPanel = document.querySelector('ytd-transcript-renderer, ytd-transcript-search-panel-renderer');
                if (transcriptPanel) {
                  statusOverlay.textContent = 'Found transcript panel directly!';
                  setTimeout(() => getTranscriptContent(statusOverlay), 500);
                } else {
                  // Method 4: Try to trigger the transcript via keyboard shortcut
                  statusOverlay.textContent = 'Trying keyboard shortcut...';
                  // Simulate pressing 'c' key which sometimes shows captions menu
                  document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'c'}));
                  setTimeout(() => {
                    // Now try to find the transcript option again
                    const transcriptOptions = Array.from(document.querySelectorAll('button, span, div')).filter(el => 
                      el.textContent && el.textContent.includes('transcript')
                    );
                    
                    if (transcriptOptions.length > 0) {
                      statusOverlay.textContent = 'Found transcript option via keyboard shortcut!';
                      transcriptOptions[0].click();
                      setTimeout(() => getTranscriptContent(statusOverlay), 1000);
                    } else {
                      statusOverlay.textContent = 'Could not find transcript. The video might not have captions.';
                      setTimeout(() => {
                        document.body.removeChild(statusOverlay);
                      }, 3000);
                    }
                  }, 500);
                }
              }, 500);
            }
          }, 500);
        } else {
          // Method 5: Try to find any element that might be related to transcripts
          statusOverlay.textContent = 'Searching for any transcript-related elements...';
          const possibleTranscriptElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && 
            (el.textContent.toLowerCase().includes('transcript') || 
             el.textContent.toLowerCase().includes('caption') ||
             el.textContent.toLowerCase().includes('subtitle'))
          );
          
          if (possibleTranscriptElements.length > 0) {
            statusOverlay.textContent = 'Found possible transcript element, clicking...';
            possibleTranscriptElements[0].click();
            setTimeout(() => getTranscriptContent(statusOverlay), 1000);
          } else {
            statusOverlay.textContent = 'Could not find any transcript options. The video might not have captions.';
            setTimeout(() => {
              document.body.removeChild(statusOverlay);
            }, 3000);
          }
        }
      }
    }
    
    function getTranscriptContent(statusOverlay) {
      // Find the transcript panel
      const transcriptItems = document.querySelectorAll('yt-formatted-string.segment-text, span.segment-text, div.segment-text');
      
      if (transcriptItems && transcriptItems.length > 0) {
        statusOverlay.textContent = 'Found transcript content! Extracting...';
        
        // Extract text and timestamps
        let transcript = '';
        const timestamps = document.querySelectorAll('div.segment-timestamp, span.segment-timestamp');
        
        for (let i = 0; i < transcriptItems.length; i++) {
          const time = timestamps[i] ? timestamps[i].textContent.trim() : '';
          const text = transcriptItems[i].textContent.trim();
          transcript += time + '\\n' + text + '\\n\\n';
        }
        
        // Create a textarea with the transcript
        const textArea = document.createElement('textarea');
        textArea.value = transcript;
        textArea.style.position = 'fixed';
        textArea.style.top = '10px';
        textArea.style.left = '10px';
        textArea.style.width = '80%';
        textArea.style.height = '80%';
        textArea.style.zIndex = '9999';
        textArea.style.padding = '20px';
        textArea.style.fontSize = '14px';
        textArea.style.fontFamily = 'Arial, sans-serif';
        textArea.style.backgroundColor = 'white';
        textArea.style.color = 'black';
        textArea.style.border = '2px solid #065fd4';
        textArea.style.borderRadius = '8px';
        textArea.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'fixed';
        closeButton.style.top = '20px';
        closeButton.style.right = '20px';
        closeButton.style.zIndex = '10000';
        closeButton.style.padding = '8px 16px';
        closeButton.style.backgroundColor = '#065fd4';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
          document.body.removeChild(textArea);
          document.body.removeChild(closeButton);
          document.body.removeChild(copyButton);
          document.body.removeChild(downloadButton);
          document.body.removeChild(statusOverlay);
        };
        
        // Add a copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy to Clipboard';
        copyButton.style.position = 'fixed';
        copyButton.style.top = '20px';
        copyButton.style.right = '100px';
        copyButton.style.zIndex = '10000';
        copyButton.style.padding = '8px 16px';
        copyButton.style.backgroundColor = '#065fd4';
        copyButton.style.color = 'white';
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '4px';
        copyButton.style.cursor = 'pointer';
        copyButton.onclick = function() {
          textArea.select();
          document.execCommand('copy');
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy to Clipboard';
          }, 2000);
        };
        
        // Add a download button
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download as TXT';
        downloadButton.style.position = 'fixed';
        downloadButton.style.top = '20px';
        downloadButton.style.right = '260px';
        downloadButton.style.zIndex = '10000';
        downloadButton.style.padding = '8px 16px';
        downloadButton.style.backgroundColor = '#065fd4';
        downloadButton.style.color = 'white';
        downloadButton.style.border = 'none';
        downloadButton.style.borderRadius = '4px';
        downloadButton.style.cursor = 'pointer';
        downloadButton.onclick = function() {
          const blob = new Blob([transcript], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const videoTitle = document.querySelector('h1.title')?.textContent || 'youtube-transcript';
          a.href = url;
          a.download = videoTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-transcript.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };
        
        document.body.appendChild(textArea);
        document.body.appendChild(closeButton);
        document.body.appendChild(copyButton);
        document.body.appendChild(downloadButton);
        
        textArea.select();
        statusOverlay.textContent = 'Transcript extracted successfully!';
      } else {
        // Try one more time after a delay
        statusOverlay.textContent = 'Transcript panel not found yet, trying again...';
        setTimeout(() => {
          const secondAttemptItems = document.querySelectorAll('yt-formatted-string.segment-text, span.segment-text, div.segment-text, div.cue-group');
          
          if (secondAttemptItems && secondAttemptItems.length > 0) {
            statusOverlay.textContent = 'Found transcript on second attempt!';
            getTranscriptContent(statusOverlay);
          } else {
            statusOverlay.textContent = 'Could not find transcript content. Please try again.';
            setTimeout(() => {
              document.body.removeChild(statusOverlay);
            }, 3000);
          }
        }, 2000);
      }
    }
    
    extractTranscript();
  })();`

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The bookmarklet code has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl gradient-text">YouTube Transcript Bookmarklet</CardTitle>
        <CardDescription>Use this bookmarklet to extract transcripts directly from YouTube's interface</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Why use a bookmarklet?</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Some YouTube videos have captions that are difficult to access programmatically. This bookmarklet
                extracts transcripts directly from YouTube's user interface, just like you would manually.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="instructions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">How to Use</TabsTrigger>
            <TabsTrigger value="code">Bookmarklet Code</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Step 1: Add the bookmarklet to your browser</h3>

              {isBookmarkletDraggable ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Drag this button to your bookmarks bar:</p>
                  <div className="flex justify-center my-4">
                    <a
                      ref={bookmarkletRef}
                      href={bookmarkletCode}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
                      onClick={(e) => e.preventDefault()}
                      draggable="true"
                    >
                      <BookmarkIcon className="mr-2 h-4 w-4" />
                      Extract YouTube Transcript
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                    (Drag the button above to your bookmarks bar)
                  </p>
                </>
              ) : (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 my-4">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-orange-800 dark:text-orange-300">Mobile Device Detected</h3>
                      <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                        It looks like you're on a mobile device where dragging to bookmarks isn't supported. Please use
                        the manual method below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-6">
                <h3 className="font-medium text-lg">Manual Method:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Create a new bookmark in your browser</li>
                  <li>Name it "Extract YouTube Transcript"</li>
                  <li>Copy the code from the "Bookmarklet Code" tab</li>
                  <li>Paste the code as the URL/location of the bookmark</li>
                </ol>
                <Button size="sm" className="mt-2" variant="outline" onClick={handleCopy}>
                  {copied ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
                  Copy Bookmarklet Code
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <h3 className="font-medium text-lg">Step 2: Use on YouTube</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Go to any YouTube video that has captions</li>
                <li>Click the bookmarklet in your bookmarks bar</li>
                <li>The bookmarklet will try multiple methods to find and extract the transcript</li>
                <li>The transcript will appear in a text box on the page</li>
                <li>You can copy or download the transcript</li>
              </ol>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-lg">Visual Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm font-medium">
                    Step 1: Click the bookmarklet
                  </div>
                  <div className="p-2">
                    <Image
                      src="/browser-bookmarks-transcript.png"
                      alt="Click the bookmarklet in your browser"
                      width={300}
                      height={200}
                      className="rounded border"
                    />
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm font-medium">Step 2: Get the transcript</div>
                  <div className="p-2">
                    <Image
                      src="/youtube-transcript-box.png"
                      alt="Transcript appears in a text box"
                      width={300}
                      height={200}
                      className="rounded border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md overflow-auto text-xs max-h-[300px]">
                {bookmarkletCode}
              </pre>
              <Button size="sm" className="absolute top-2 right-2" variant="outline" onClick={handleCopy}>
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Copy this code and create a new bookmark with it as the URL.
            </p>
          </TabsContent>
        </Tabs>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium mb-2">How it works</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This bookmarklet tries multiple methods to extract transcripts:
          </p>
          <ol className="list-decimal list-inside mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>It looks for the "Show transcript" button and clicks it</li>
            <li>If that fails, it tries to open the "More actions" menu and find the transcript option</li>
            <li>It then tries to find the transcript panel directly</li>
            <li>As a fallback, it tries keyboard shortcuts and other methods</li>
            <li>Once it finds the transcript, it extracts the text and timestamps</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This works with any video that has captions available in YouTube's player, even if our API-based methods
            can't access them.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Troubleshooting Tips</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 mt-1 space-y-1 list-disc list-inside">
                <li>Make sure your browser's bookmarks bar is visible</li>
                <li>If the bookmarklet doesn't work the first time, try clicking it again</li>
                <li>Some videos might require you to be logged in to YouTube</li>
                <li>If you're using Chrome, make sure JavaScript is enabled for YouTube</li>
                <li>Try refreshing the YouTube page before using the bookmarklet</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

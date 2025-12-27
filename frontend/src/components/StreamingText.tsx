import { useState, useEffect } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'

interface StreamingTextProps {
  text: string
  speed?: number
  chunkSize?: number
  onComplete?: () => void
  onUpdate?: () => void
}

export function StreamingText({ text, speed = 1, chunkSize = 10, onComplete, onUpdate }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Add multiple characters at once for faster streaming
        // Use larger chunks for faster rendering
        const nextChunk = text.slice(currentIndex, currentIndex + chunkSize)
        setDisplayedText(prev => prev + nextChunk)
        setCurrentIndex(prev => prev + chunkSize)
        
        // Trigger scroll update every few chunks for better performance
        if (onUpdate && currentIndex % 30 === 0) {
          onUpdate()
        }
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete && currentIndex >= text.length && text.length > 0) {
      onComplete()
      // Final scroll after complete
      if (onUpdate) {
        onUpdate()
      }
    }
  }, [currentIndex, text, speed, chunkSize, onComplete, onUpdate])

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
  }, [text])

  return <MarkdownRenderer content={displayedText} />
}


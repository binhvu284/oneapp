import { useState, useRef, useEffect } from 'react'
import { IconMenu } from '../Icons'
import styles from './FloatingButton.module.css'

interface FloatingButtonProps {
  onClick: () => void
  hidden?: boolean
}

export function FloatingButton({ onClick, hidden = false }: FloatingButtonProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oneapp_floating_button_position')
        if (saved) {
          const parsed = JSON.parse(saved)
          return { x: parsed.x || 20, y: parsed.y || 20 }
        }
      }
    } catch {
      // Ignore errors
    }
    return { x: 20, y: 20 }
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [hasDragged, setHasDragged] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('oneapp_floating_button_position', JSON.stringify(position))
      }
    } catch {
      // Ignore errors
    }
  }, [position])

  const snapToEdge = (x: number, y: number): { x: number; y: number } => {
    const buttonSize = 56 // Button size
    const padding = 16 // Padding from edge
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // Snap to left or right edge
    if (x < windowWidth / 2) {
      x = padding
    } else {
      x = windowWidth - buttonSize - padding
    }

    // Snap to top or bottom edge, but keep within bounds
    if (y < padding) {
      y = padding
    } else if (y > windowHeight - buttonSize - padding) {
      y = windowHeight - buttonSize - padding
    } else {
      // Snap to top or bottom if close enough
      const distanceToTop = y
      const distanceToBottom = windowHeight - y - buttonSize
      if (distanceToTop < 50) {
        y = padding
      } else if (distanceToBottom < 50) {
        y = windowHeight - buttonSize - padding
      }
    }

    return { x, y }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    e.preventDefault()
    setIsDragging(true)
    setHasDragged(false)
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setHasDragged(false)
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart) return
      setHasDragged(true)
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      const snapped = snapToEdge(newX, newY)
      setPosition(snapped)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStart) return
      setHasDragged(true)
      const touch = e.touches[0]
      const newX = touch.clientX - dragStart.x
      const newY = touch.clientY - dragStart.y
      const snapped = snapToEdge(newX, newY)
      setPosition(snapped)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragStart(null)
      // Reset hasDragged after a short delay to allow click handler to check it
      setTimeout(() => setHasDragged(false), 100)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      setDragStart(null)
      // Reset hasDragged after a short delay to allow click handler to check it
      setTimeout(() => setHasDragged(false), 100)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragStart])

  const handleClick = () => {
    // Only trigger onClick if we didn't drag
    if (!hasDragged && !isDragging) {
      onClick()
    }
  }

  return (
    <button
      ref={buttonRef}
      className={`${styles.floatingButton} ${isDragging ? styles.dragging : ''} ${hidden ? styles.hidden : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      aria-label="Toggle menu"
    >
      <IconMenu />
    </button>
  )
}


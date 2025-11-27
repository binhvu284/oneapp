import { useState, useRef, useEffect } from 'react'
import styles from './ColorPicker.module.css'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  return (
    <div className={styles.colorPicker}>
      <label className={styles.label}>{label}</label>
      <div className={styles.pickerContainer} ref={pickerRef}>
        <button
          className={styles.colorButton}
          onClick={() => setShowPicker(!showPicker)}
          type="button"
        >
          <div
            className={styles.colorSwatch}
            style={{ backgroundColor: value }}
          />
          <span className={styles.colorValue}>{value}</span>
        </button>
        {showPicker && (
          <div className={styles.picker}>
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                setShowPicker(false)
              }}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className={styles.textInput}
            />
          </div>
        )}
      </div>
    </div>
  )
}


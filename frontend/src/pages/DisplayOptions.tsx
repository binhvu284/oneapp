import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisplay, TextSize, FontFamily, IconSize, BorderRadius } from '@/contexts/DisplayContext'
import { IconChevronLeft } from '@/components/Icons'
import styles from './DisplayOptions.module.css'

export function DisplayOptions() {
  const navigate = useNavigate()
  const {
    preferences,
    setFontFamily,
    setTextSize,
    setLineHeight,
    setLetterSpacing,
    setIconSize,
    setBorderRadius,
  } = useDisplay()

  const [localLineHeight, setLocalLineHeight] = useState(preferences.lineHeight)
  const [localLetterSpacing, setLocalLetterSpacing] = useState(preferences.letterSpacing)

  useEffect(() => {
    setLocalLineHeight(preferences.lineHeight)
    setLocalLetterSpacing(preferences.letterSpacing)
  }, [preferences.lineHeight, preferences.letterSpacing])

  const handleLineHeightChange = (value: number) => {
    setLocalLineHeight(value)
    setLineHeight(value)
  }

  const handleLetterSpacingChange = (value: number) => {
    setLocalLetterSpacing(value)
    setLetterSpacing(value)
  }

  return (
    <div className={styles.displayOptions}>
      <button className={styles.backButton} onClick={() => navigate('/customization/interface')}>
        <IconChevronLeft />
        <span>Back to Interface</span>
      </button>
      <div className={styles.content}>
        {/* Font Family */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Font Family</h2>
              <button
                className={styles.defaultButton}
                onClick={() => setFontFamily('system')}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Choose the font family for the entire application. System uses your device's default font.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.optionsGrid}>
              {(['system', 'sans-serif', 'serif', 'monospace'] as FontFamily[]).map((font) => (
                <button
                  key={font}
                  onClick={() => setFontFamily(font)}
                  className={`${styles.optionButton} ${preferences.fontFamily === font ? styles.active : ''}`}
                >
                  <div className={styles.fontPreview} style={{ fontFamily: getFontFamilyValue(font) }}>
                    Aa
                  </div>
                  <span className={styles.optionLabel}>{font.charAt(0).toUpperCase() + font.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Size */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Text Size</h2>
              <button
                className={styles.defaultButton}
                onClick={() => setTextSize('medium')}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Adjust the base text size for better readability. This affects all text throughout the application.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.optionsGrid}>
              {(['small', 'medium', 'large'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`${styles.optionButton} ${preferences.textSize === size ? styles.active : ''}`}
                >
                  <div className={styles.textSizePreview} data-size={size}>
                    <span>The quick brown fox</span>
                  </div>
                  <span className={styles.optionLabel}>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Line Height */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Line Height</h2>
              <button
                className={styles.defaultButton}
                onClick={() => {
                  setLineHeight(1.5)
                  setLocalLineHeight(1.5)
                }}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Control the spacing between lines of text. Higher values improve readability for longer text.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={localLineHeight}
                onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>1.0</span>
                <span className={styles.currentValue}>{localLineHeight.toFixed(1)}</span>
                <span>2.0</span>
              </div>
              <div className={styles.previewText} style={{ lineHeight: localLineHeight }}>
                <p>This is a preview of how your text will look with the selected line height. Multiple lines help you see the spacing effect.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Letter Spacing */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Letter Spacing</h2>
              <button
                className={styles.defaultButton}
                onClick={() => {
                  setLetterSpacing(0)
                  setLocalLetterSpacing(0)
                }}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Adjust the spacing between individual characters. Can improve readability for certain fonts.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="-1"
                max="2"
                step="0.1"
                value={localLetterSpacing}
                onChange={(e) => handleLetterSpacingChange(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>-1px</span>
                <span className={styles.currentValue}>{localLetterSpacing.toFixed(1)}px</span>
                <span>2px</span>
              </div>
              <div className={styles.previewText} style={{ letterSpacing: `${localLetterSpacing}px` }}>
                <p>This preview shows how letter spacing affects text appearance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Icon Size */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Icon Size</h2>
              <button
                className={styles.defaultButton}
                onClick={() => setIconSize('medium')}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Choose the size of icons throughout the application. Larger icons are easier to see and click.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.optionsGrid}>
              {(['small', 'medium', 'large'] as IconSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setIconSize(size)}
                  className={`${styles.optionButton} ${preferences.iconSize === size ? styles.active : ''}`}
                >
                  <div className={styles.iconPreview} data-size={size}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                  </div>
                  <span className={styles.optionLabel}>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Border Radius</h2>
              <button
                className={styles.defaultButton}
                onClick={() => setBorderRadius('medium')}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Control the roundness of buttons, cards, and other UI elements. Affects the overall visual style.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.optionsGrid}>
              {(['none', 'small', 'medium', 'large'] as BorderRadius[]).map((radius) => (
                <button
                  key={radius}
                  onClick={() => setBorderRadius(radius)}
                  className={`${styles.optionButton} ${preferences.borderRadius === radius ? styles.active : ''}`}
                >
                  <div className={styles.borderRadiusPreview} data-radius={radius}>
                    <div></div>
                  </div>
                  <span className={styles.optionLabel}>{radius.charAt(0).toUpperCase() + radius.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function getFontFamilyValue(font: FontFamily): string {
  const fontMap: Record<FontFamily, string> = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'sans-serif': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, "Times New Roman", Times, serif',
    monospace: '"Fira Code", "Courier New", Courier, monospace',
  }
  return fontMap[font]
}


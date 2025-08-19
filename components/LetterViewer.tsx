'use client'

import { useState, useEffect } from 'react'
import styles from './LetterViewer.module.scss'
import { Letter } from '@root/lib/supabase'

interface LetterViewerProps {
  letter: Letter
}

export default function LetterViewer({ letter }: LetterViewerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  useEffect(() => {
    // Start animation automatically when component mounts
    const timer = setTimeout(() => {
      setIsAnimating(true)
      // Show letter content after card slides out
      setTimeout(() => {
        setShowLetter(true)
      }, 2400) // 75% of previous timing
    }, 1500) // 75% of previous timing

    return () => clearTimeout(timer)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={styles.container}>
      {!showLetter && (
        <div className={styles.envelopeContainer}>
          <div className={`${styles.envelope} ${isAnimating ? styles.opened : ''}`}>
            <div className={styles.envelopeFront}>
              <div className={styles.envelopeFlap}></div>
            </div>
          </div>
          <div className={`${styles.card} ${isAnimating ? styles.slideOut : ''}`}>
            <div className={styles.cardContent}>
              🌻
            </div>
          </div>
        </div>
      )}

      {showLetter && (
        <div className={`${styles.letterContent} ${styles.fadeIn}`}>
          <div className={styles.letterHeader}>
            <div className={styles.letterDate}>
              {formatDate(letter.created_at)}
            </div>
          </div>

          <div className={styles.letterGreeting}>
            <p>dear {letter.recipient_name},</p>
          </div>
          
          <div className={styles.letterBody}>
            {letter.content.split('\n').map((paragraph, index) => (
              <p key={index} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.letterSignature}>
            <p>keep shining,</p>
            {letter.sender_name && <p>{letter.sender_name}</p>}
            {letter.return_address && (
              <p>
                <a 
                  href={`/?recipient=${encodeURIComponent(letter.return_address)}${letter.sender_name ? `&recipient_name=${encodeURIComponent(letter.sender_name)}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.returnAddressLink}
                >
                  send back a letter 🌻
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
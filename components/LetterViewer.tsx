'use client'

import { useState, useEffect } from 'react'
import { importKey, decrypt } from '@root/lib/crypto'
import styles from './LetterViewer.module.scss'
import { Letter } from '@root/lib/supabase'

interface LetterViewerProps {
  letter: Letter
}

export default function LetterViewer({ letter }: LetterViewerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [decryptError, setDecryptError] = useState(false)

  useEffect(() => {
    const decryptContent = async () => {
      try {
        const keyData = window.location.hash.slice(1)
        if (!keyData) {
          setDecryptError(true)
          return
        }
        
        const key = await importKey(keyData)
        const decryptedContent = await decrypt(letter.ciphertext, letter.iv, key)
        setContent(decryptedContent)
      } catch {
        setDecryptError(true)
      }
    }

    decryptContent()
  }, [letter])

  useEffect(() => {
    if (content !== null || decryptError) {
      const timer = setTimeout(() => {
        setIsAnimating(true)
        setTimeout(() => {
          setShowLetter(true)
        }, 2400)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [content, decryptError])

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
          {decryptError ? (
            <div className={styles.letterBody}>
              <p>This letter cannot be opened without the correct link.</p>
              <p>Please make sure you have the complete URL with the decryption key.</p>
            </div>
          ) : content ? (
            <>
              <div className={styles.letterHeader}>
                <div className={styles.letterDate}>
                  {formatDate(letter.created_at)}
                </div>
              </div>

              <div className={styles.letterGreeting}>
                <p>dear {letter.recipient_name},</p>
              </div>
              
              <div className={styles.letterBody}>
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.letterBody}>
              <p>Decrypting letter...</p>
            </div>
          )}

          {content && (
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
          )}
        </div>
      )}
    </div>
  )
}
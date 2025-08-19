'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './LetterComposer.module.scss'

export default function LetterComposer() {
  const searchParams = useSearchParams()
  const [content, setContent] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [returnAddress, setReturnAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [shakeButton, setShakeButton] = useState(false)
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set())
  const [showTitle, setShowTitle] = useState(false)
  const [hideTitle, setHideTitle] = useState(false)
  const [showTextArea, setShowTextArea] = useState(false)
  const [showInputs, setShowInputs] = useState(false)

  useEffect(() => {
    const recipient = searchParams?.get('recipient')
    const recipientName = searchParams?.get('recipient_name')
    
    if (recipient) {
      setRecipientEmail(recipient)
    }
    if (recipientName) {
      setRecipientName(recipientName)
    }
  }, [searchParams])

  useEffect(() => {
    // Cascading fade-in/out animation sequence
    const timer1 = setTimeout(() => setShowTitle(true), 600) // Title fades in
    const timer2 = setTimeout(() => setHideTitle(true), 3400) // Title starts fading out (200ms before textarea)
    const timer3 = setTimeout(() => setShowTextArea(true), 3600) // Textarea fades in as title fades out
    const timer4 = setTimeout(() => setShowInputs(true), 4600) // Inputs fade in

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for missing required fields
    const missingFields = new Set<string>()
    if (!content.trim()) missingFields.add('content')
    if (!recipientEmail.trim()) missingFields.add('recipientEmail')
    if (!recipientName.trim()) missingFields.add('recipientName')
    
    if (missingFields.size > 0) {
      // Shake the button
      setShakeButton(true)
      setTimeout(() => setShakeButton(false), 600)
      
      // Show error placeholders
      setErrorFields(missingFields)
      setTimeout(() => setErrorFields(new Set()), 2000)
      
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/send-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          recipient_email: recipientEmail.trim(),
          recipient_name: recipientName.trim(),
          sender_name: senderName.trim() || 'Anonymous',
          return_address: returnAddress.trim() || null
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Letter sent successfully!')
        setContent('')
        setRecipientEmail('')
        setRecipientName('')
        setSenderName('')
        setReturnAddress('')
      } else {
        setMessage(result.error || 'Failed to send letter')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.letterForm}>
        {showTitle && !hideTitle && (
          <h1 className={`${styles.title} ${styles.fadeIn}`}>send a letter to someone you care about</h1>
        )}
        {hideTitle && (
          <h1 className={`${styles.title} ${styles.fadeOut}`}>send a letter to someone you care about</h1>
        )}
        
        <form onSubmit={handleSubmit}>
          {showTextArea && (
            <textarea
              className={`${styles.textArea} ${styles.fadeIn}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={errorFields.has('content') ? 'fill me out!' : "your message goes here, it's just one giant text box 🌻"}
              disabled={isLoading}
            />
          )}
          
          {showInputs && (
            <div className={`${styles.inputGrid} ${styles.fadeIn}`}>
              <div className={styles.inputColumn}>
                <input
                  className={styles.input}
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="your name"
                  disabled={isLoading}
                />
                
                <input
                  className={styles.input}
                  type="email"
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  placeholder="return_address@gmail.com"
                  disabled={isLoading}
                />
              </div>
              
              <div className={styles.inputColumn}>
                <input
                  className={styles.input}
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={errorFields.has('recipientName') ? 'fill me out!' : "a special person's name *"}
                  disabled={isLoading}
                />
                
                <input
                  className={styles.input}
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder={errorFields.has('recipientEmail') ? 'fill me out!' : "their_email@gmail.com *"}
                  disabled={isLoading}
                />
              </div>
              
              <button 
                type="submit" 
                className={`${styles.sendButton} ${shakeButton ? styles.shake : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'sending...' : 'send'}
              </button>
            </div>
          )}
        </form>

        {message && (
          <div className={`${styles.message} ${message.includes('successfully') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
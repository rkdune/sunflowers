'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { generateKey, encrypt, exportKey } from '@root/lib/crypto'
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
  const [showSunflower, setShowSunflower] = useState(false)
  const [sunflowerLines, setSunflowerLines] = useState(0)
  const [showInfoMode, setShowInfoMode] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'poem' | 'why' | 'other'>('poem')
  const [showInfoContent, setShowInfoContent] = useState(false)

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
    const timer4 = setTimeout(() => setShowInputs(true), 6600) // Inputs fade in (increased by 2s)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Sunflower ASCII animation
  useEffect(() => {
    if (showSunflower) {
      const sunflowerAscii = [
        '                     _',
        '                  _(_)_                          wWWWw   _',
        '      @@@@       (_)@(_)   vVVVv     _     @@@@  (___) _(_)_',
        '     @@()@@ wWWWw  (_)\\    (___)   _(_)_  @@()@@   Y  (_)@(_)',
        '      @@@@  (___)     `|/    Y    (_)@(_)  @@@@   \\|/   (_)\\',
        '       /      Y       \\|    \\|/    /(_)    \\|      |/      |',
        '    \\ |     \\ |/       | / \\ | /  \\|/       |/    \\|      \\|/',
        'jgs \\\\|//   \\\\|///  \\\\\\|//\\\\\\|/// \\|///  \\\\\\|//  \\\\|//  \\\\\\|//',
        '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^'
      ]

      const animateLines = () => {
        if (sunflowerLines < sunflowerAscii.length) {
          setSunflowerLines(prev => prev + 1)
        }
      }

      const timer = setTimeout(animateLines, 100) // 0.1s delay
      return () => clearTimeout(timer)
    }
  }, [showSunflower, sunflowerLines])

  const renderSunflower = () => {
    const sunflowerAscii = [
      '                     _',
      '                  _(_)_                          wWWWw   _',
      '      @@@@       (_)@(_)   vVVVv     _     @@@@  (___) _(_)_',
      '     @@()@@ wWWWw  (_)\\    (___)   _(_)_  @@()@@   Y  (_)@(_)',
      '      @@@@  (___)     `|/    Y    (_)@(_)  @@@@   \\|/   (_)\\',
      '       /      Y       \\|    \\|/    /(_)    \\|      |/      |',
      '    \\ |     \\ |/       | / \\ | /  \\|/       |/    \\|      \\|/',
      'jgs \\\\|//   \\\\|///  \\\\\\|//\\\\\\|/// \\|///  \\\\\\|//  \\\\|//  \\\\\\|//',
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^'
    ]
    
    return sunflowerAscii.slice(0, sunflowerLines).map((line, index) => (
      <div key={index}>{line}</div>
    ))
  }

  const handleInfoClick = () => {
    if (showInfoMode) {
      // Going back to email fields
      setShowInfoContent(false)
      setTimeout(() => {
        setShowInfoMode(false)
        setShowInputs(true) // Show email inputs with fade
      }, 300) // Wait for fade out
    } else {
      // Going to info mode
      setShowInputs(false)
      setTimeout(() => {
        setShowInfoMode(true)
        setShowInfoContent(true)
      }, 300) // Wait for fade out
    }
  }

  const handleTabClick = (tab: 'poem' | 'why' | 'other') => {
    setSelectedTab(tab)
  }

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
      const key = await generateKey()
      const encrypted = await encrypt(content.trim(), key)
      const keyData = await exportKey(key)
      
      const response = await fetch('/api/send-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          recipient_email: recipientEmail.trim(),
          recipient_name: recipientName.trim(),
          sender_name: senderName.trim() || 'Anonymous',
          return_address: returnAddress.trim() || null,
          key: keyData
        })
      })

      const result = await response.json()

      if (response.ok) {
        const letterUrl = `${window.location.origin}/letter/${result.letterId}#${keyData}`
        setMessage(`Letter sent! Share this link: ${letterUrl}`)
        setShowSunflower(true)
        setSunflowerLines(0)
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
          
          {showInputs && !showInfoMode && (
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
              
              <div className={styles.buttonColumn}>
                <button 
                  type="button"
                  className={styles.infoButton}
                  onClick={handleInfoClick}
                >
                </button>
                <button 
                  type="submit" 
                  className={`${styles.sendButton} ${shakeButton ? styles.shake : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : 'send'}
                </button>
              </div>
            </div>
          )}

          {showInfoMode && showInfoContent && (
            <div className={`${styles.infoSection} ${styles.fadeIn}`}>
              <div className={styles.infoContent}>
                <div className={styles.tabButtons}>
                  <button 
                    type="button"
                    className={`${styles.tabButton} ${selectedTab === 'poem' ? styles.activeTab : ''}`}
                    onClick={() => handleTabClick('poem')}
                  >
                    poem
                  </button>
                  <button 
                    type="button"
                    className={`${styles.tabButton} ${selectedTab === 'why' ? styles.activeTab : ''}`}
                    onClick={() => handleTabClick('why')}
                  >
                    why
                  </button>
                  <button 
                    type="button"
                    className={`${styles.tabButton} ${selectedTab === 'other' ? styles.activeTab : ''}`}
                    onClick={() => handleTabClick('other')}
                  >
                    other
                  </button>
                </div>
                
                <div className={styles.tabContent}>
                  {selectedTab === 'poem' && (
                    <div className={styles.poemContent}>
                      <p>i want to create a field of flowers.</p>
                      <p>the sky is a perfect blue.</p>
                      <p>we're overlooking a cliff, the sun is setting.</p>
                      <br />
                      <p>interspersed within the tall grass is you, your flower.</p>
                      <p>what you mean to me</p>
                      <p>in my heart.</p>
                    </div>
                  )}
                  {selectedTab === 'why' && (
                    <div className={styles.poemContent}>
                      <p>i made this site as a gift to my friends. thank you for being important parts of my life.
                      </p>
                      <hr></hr> 
                      <p>

                        words that are too important, too personal, to send over a text deserve a place of their own.

                        when you trade the convenience of a text to write a letter, you are sending more than the words you write. the method confers meaning. 🌻
                      </p>
                    </div>
                  )}
                  {selectedTab === 'other' && (
                    <div className={styles.poemContent}>
                      <p>all sunflowers are end-to-end encrypted</p>
                      <a href="https://github.com/rkdune/letters">source code (github)</a>
                      <p></p>
                      <a href="https://www.youtube.com/shorts/W5TVfUNZAvQ">the most personal is the most creative (video)</a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.buttonColumn}>
                <button 
                  type="button"
                  className={styles.infoButton}
                  onClick={handleInfoClick}
                >
                </button>
                <button 
                  type="submit" 
                  className={`${styles.sendButton} ${shakeButton ? styles.shake : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : 'send'}
                </button>
              </div>
            </div>
          )}
        </form>

        {message && (
          <div className={`${styles.message} ${message.includes('successfully') || message.includes('Letter sent') ? styles.success : styles.error}`}>
            {showSunflower ? (
              <div className={styles.sunflowerContainer}>
                <pre className={styles.sunflowerArt}>
                  {renderSunflower()}
                </pre>
              </div>
            ) : (
              message
            )}
          </div>
        )}
      </div>
    </div>
  )
}
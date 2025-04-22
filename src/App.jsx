import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [qrValue, setQrValue] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [qrSize, setQrSize] = useState(256)
  const [logo, setLogo] = useState(null)
  const qrRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleGenerate = () => {
    setError('')
    if (!url.trim()) {
      setError('Please enter a URL or text')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setQrValue(url)
      setIsLoading(false)
    }, 500)
  }

  const handleDownload = () => {
    if (qrRef.current) {
      setIsLoading(true)
      const svg = qrRef.current.querySelector('svg')
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const pngUrl = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.href = pngUrl
        downloadLink.download = `qr-code-${Date.now()}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        setIsLoading(false)
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 500000) {
        setError('Logo file size should be less than 500KB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          if (img.width > 1000 || img.height > 1000) {
            setError('Logo dimensions should be less than 1000x1000 pixels')
            return
          }
          setLogo(e.target.result)
          setError('')
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogo(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Free Online QR Code Generator</h1>
        <p className="subtitle">Create custom QR codes with logo overlay for your business, marketing, or personal use</p>
      </header>

      <main>
        <section className="features">
          <h2>Key Features</h2>
          <ul>
            <li>Generate QR codes for URLs, text, and more</li>
            <li>Add your logo to create branded QR codes</li>
            <li>Download high-quality QR codes instantly</li>
            <li>Customize QR code size</li>
            <li>Free to use with no watermarks</li>
          </ul>
        </section>

        <section className="input-section">
          <h2>Create Your QR Code</h2>
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL or text"
              className="url-input"
              aria-label="Enter URL or text for QR code"
            />
            <button 
              onClick={handleGenerate} 
              className="generate-btn"
              disabled={isLoading}
              aria-label="Generate QR code"
            >
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
          
          {error && <p className="error-message" role="alert">{error}</p>}

          <div className="logo-upload-section">
            <h3>Add Your Logo (Optional)</h3>
            <div className="logo-controls">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                ref={fileInputRef}
                className="logo-input"
                id="logo-upload"
                aria-label="Upload logo for QR code"
              />
              <label htmlFor="logo-upload" className="logo-upload-btn">
                {logo ? 'Change Logo' : 'Add Logo'}
              </label>
              {logo && (
                <button onClick={removeLogo} className="remove-logo-btn" aria-label="Remove logo">
                  Remove Logo
                </button>
              )}
            </div>
          </div>

          <div className="size-control">
            <label>
              QR Code Size:
              <input 
                type="range" 
                min="128" 
                max="512" 
                value={qrSize} 
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                aria-label="Adjust QR code size"
              />
              <span>{qrSize}px</span>
            </label>
          </div>
        </section>
        
        {qrValue && (
          <section className="qr-section" aria-label="Generated QR code">
            <div className="qr-container" ref={qrRef}>
              <div className="qr-wrapper">
                <QRCodeSVG
                  value={qrValue}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                  aria-label="QR code"
                />
                {logo && (
                  <div 
                    className="logo-overlay"
                    style={{
                      width: `${qrSize * 0.25}px`,
                      height: `${qrSize * 0.25}px`,
                    }}
                    aria-label="Logo overlay"
                  >
                    <img 
                      src={logo} 
                      alt="Logo" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}
              </div>
              <button 
                onClick={handleDownload} 
                className="download-btn"
                disabled={isLoading}
                aria-label="Download QR code"
              >
                {isLoading ? 'Downloading...' : 'Download QR Code'}
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} QR Code Generator. All rights reserved.</p>
        <p>Create professional QR codes for your business, marketing campaigns, and personal use.</p>
      </footer>
    </div>
  )
}

export default App

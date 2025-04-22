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
  const [logoSize, setLogoSize] = useState(30)
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
        <h1>QR Code Generator</h1>
        <p className="subtitle">Create and download QR codes for any URL or text</p>
      </header>

      <div className="input-section">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL or text"
            className="url-input"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate} 
            className="generate-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}

        <div className="logo-upload-section">
          <div className="logo-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              ref={fileInputRef}
              className="logo-input"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="logo-upload-btn">
              {logo ? 'Change Logo' : 'Add Logo'}
            </label>
            {logo && (
              <button onClick={removeLogo} className="remove-logo-btn">
                Remove Logo
              </button>
            )}
          </div>
          {logo && (
            <div className="logo-size-control">
              <label>
                Logo Size:
                <input 
                  type="range" 
                  min="20" 
                  max="35"
                  value={logoSize} 
                  onChange={(e) => setLogoSize(parseInt(e.target.value))}
                />
                <span>{logoSize}%</span>
              </label>
            </div>
          )}
        </div>

        <div className="size-control">
          <label>
            QR Size:
            <input 
              type="range" 
              min="128" 
              max="512" 
              value={qrSize} 
              onChange={(e) => setQrSize(parseInt(e.target.value))}
            />
            <span>{qrSize}px</span>
          </label>
        </div>
      </div>
      
      {qrValue && (
        <div className="qr-section">
          <div className="qr-container" ref={qrRef}>
            <div className="qr-wrapper">
              <QRCodeSVG
                value={qrValue}
                size={qrSize}
                level="H"
                includeMargin={true}
              />
              {logo && (
                <div 
                  className="logo-overlay"
                  style={{
                    width: `${(logoSize / 100) * qrSize}px`,
                    height: `${(logoSize / 100) * qrSize}px`,
                    padding: '8px',
                    backgroundColor: 'white',
                  }}
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
            >
              {isLoading ? 'Downloading...' : 'Download QR Code'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

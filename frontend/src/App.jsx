import { useEffect, useRef, useState } from 'react'
import { fetchFonts, convertText, convertImage } from './api'

const CHARSETS = [
  { value: 'standard', label: 'standard  @%#*+=-:.' },
  { value: 'detailed', label: 'detailed  $@B%8&WM#*...' },
  { value: 'blocks', label: 'blocks    █▓▒░' },
  { value: 'minimal', label: 'minimal   #+.' },
]

export default function App() {
  const [mode, setMode] = useState('text')
  const [fonts, setFonts] = useState(['standard'])
  const [font, setFont] = useState('standard')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [width, setWidth] = useState(100)
  const [charset, setCharset] = useState('standard')
  const [invert, setInvert] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchFonts()
      .then(setFonts)
      .catch(() => setError('Backend unreachable — is the Django server running on :8000?'))
  }, [])

  async function handleGenerate() {
    setError('')
    setCopied(false)
    setLoading(true)
    try {
      let result
      if (mode === 'text') {
        if (!text.trim()) throw new Error('Enter some text first.')
        result = await convertText(text, font)
      } else {
        if (!file) throw new Error('Choose an image first.')
        result = await convertImage(file, { width, charset, invert })
      }
      setOutput(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleDownload() {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-art.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function acceptFile(f) {
    if (f && f.type.startsWith('image/')) {
      setFile(f)
      setError('')
    } else {
      setError('That file is not an image.')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    acceptFile(e.dataTransfer.files[0])
  }

  return (
    <div className="terminal">
      <header className="titlebar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="title">ascii-forge — user@localhost:~</span>
      </header>

      <div className="screen">
        <pre className="banner">{String.raw`
   ___   __________ ____   ____
  / _ | / __/ ___/ /  _/  / __/__  _______ ____
 / __ |_\ \/ /__/ // /   / _// _ \/ __/ _ '/ -_)
/_/ |_/___/\___/_/___/  /_/  \___/_/  \_, /\__/
                                     /___/      `}</pre>
        <p className="tagline">$ convert text &amp; images into ASCII art_</p>

        <div className="tabs">
          <button
            className={mode === 'text' ? 'tab active' : 'tab'}
            onClick={() => { setMode('text'); setError('') }}
          >
            [ TEXT ]
          </button>
          <button
            className={mode === 'image' ? 'tab active' : 'tab'}
            onClick={() => { setMode('image'); setError('') }}
          >
            [ IMAGE ]
          </button>
        </div>

        {mode === 'text' ? (
          <div className="panel">
            <label className="field">
              <span className="prompt">&gt; input:</span>
              <input
                type="text"
                value={text}
                maxLength={200}
                placeholder="type something..."
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </label>
            <label className="field">
              <span className="prompt">&gt; font:</span>
              <select value={font} onChange={(e) => setFont(e.target.value)}>
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="panel">
            <div
              className={dragOver ? 'dropzone over' : 'dropzone'}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <span className="filename">📄 {file.name}</span>
              ) : (
                <span>drop an image here or click to browse</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => acceptFile(e.target.files[0])}
              />
            </div>
            <div className="controls-row">
              <label className="field">
                <span className="prompt">&gt; width: {width}</span>
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </label>
              <label className="field">
                <span className="prompt">&gt; charset:</span>
                <select value={charset} onChange={(e) => setCharset(e.target.value)}>
                  {CHARSETS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="field checkbox">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                />
                <span className="prompt">invert (dark background)</span>
              </label>
            </div>
          </div>
        )}

        <button className="generate" onClick={handleGenerate} disabled={loading}>
          {loading ? '[ GENERATING... ]' : '[ ▶ GENERATE ]'}
        </button>

        {error && <p className="error">! error: {error}</p>}

        {output && (
          <div className="output-wrap">
            <div className="output-bar">
              <span className="prompt">&gt; output:</span>
              <div className="output-actions">
                <button onClick={handleCopy}>
                  {copied ? '[ ✓ copied ]' : '[ copy ]'}
                </button>
                <button onClick={handleDownload}>[ download .txt ]</button>
              </div>
            </div>
            <pre className="output">{output}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

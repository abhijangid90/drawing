'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [history, setHistory] = useState<string[]>([])
  const [redoHistory, setRedoHistory] = useState<string[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth * 0.8
    canvas.height = window.innerHeight * 0.6
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctxRef.current = ctx
  }, [])

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctxRef.current.lineWidth = brushSize
    }
  }, [color, brushSize, tool])

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctxRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    )
    setDrawing(true)
  }

  const draw = (e: React.MouseEvent) => {
    if (!drawing || !ctxRef.current) return
    ctxRef.current.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    )
    ctxRef.current.stroke()
  }

  const stopDrawing = () => {
    if (!ctxRef.current || !canvasRef.current) return
    ctxRef.current.closePath()
    setDrawing(false)
    const url = canvasRef.current.toDataURL()
    setHistory([...history, url])
    setRedoHistory([])
  }

  const undo = () => {
    if (!canvasRef.current || history.length === 0) return
    const newHistory = [...history]
    const last = newHistory.pop()
    setRedoHistory([...redoHistory, history[history.length - 1]])
    setHistory(newHistory)
    const img = new Image()
    img.src = newHistory[newHistory.length - 1] || ''
    img.onload = () => {
      if (!ctxRef.current || !canvasRef.current) return
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctxRef.current.drawImage(img, 0, 0)
    }
  }

  const redo = () => {
    if (!canvasRef.current || redoHistory.length === 0) return
    const img = new Image()
    const lastRedo = redoHistory[redoHistory.length - 1]
    setRedoHistory(redoHistory.slice(0, -1))
    setHistory([...history, lastRedo])
    img.src = lastRedo
    img.onload = () => {
      if (!ctxRef.current || !canvasRef.current) return
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctxRef.current.drawImage(img, 0, 0)
    }
  }

  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHistory([])
    setRedoHistory([])
  }

  const saveImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'drawing.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 text-xl font-semibold flex justify-between items-center">
        <span>Digital Drawing App By Abhishek jangid</span>
        <button onClick={saveImage} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save as Image</button>
      </nav>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-6 p-4"
      >
        <div className="flex flex-col gap-4 w-full md:w-1/5 bg-white p-4 rounded shadow">
          <label className="flex flex-col">
            Tool:
            <select value={tool} onChange={(e) => setTool(e.target.value as any)} className="mt-1 border p-1 rounded">
              <option value="brush">Brush</option>
              <option value="eraser">Eraser</option>
            </select>
          </label>

          <label className="flex flex-col">
            Color:
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>

          <label className="flex flex-col">
            Brush Size:
            <input
              type="range"
              min={1}
              max={30}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </label>

          <button onClick={undo} className="bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600">Undo</button>
          <button onClick={redo} className="bg-purple-500 text-white py-1 rounded hover:bg-purple-600">Redo</button>
          <button onClick={clearCanvas} className="bg-red-500 text-white py-1 rounded hover:bg-red-600">Clear</button>
        </div>

        <div className="w-full md:w-4/5">
          <canvas
            ref={canvasRef}
            className="border rounded bg-white shadow w-full h-[500px]"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </motion.section>

      <footer className="mt-auto text-center py-4 text-gray-500">
        &copy; 2025 ABHISHEK JANGID. All rights reserved.
      </footer>
    </main>
  )
}
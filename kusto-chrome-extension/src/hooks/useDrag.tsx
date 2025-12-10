import { useState, useCallback, useRef, useEffect } from 'react'

interface IUseDragParams {
  initialPosition: { top: number; left: number }
}

interface IUseDragReturn {
  position: { top: number; left: number }
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
}

export const useDrag = (args: IUseDragParams): IUseDragReturn => {
  const { initialPosition } = args
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionRef = useRef(position)

  useEffect(() => {
    setPosition(initialPosition)
    positionRef.current = initialPosition
  }, [initialPosition.top, initialPosition.left])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - positionRef.current.left,
      y: e.clientY - positionRef.current.top,
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newLeft = e.clientX - dragStartRef.current.x
      const newTop = e.clientY - dragStartRef.current.y

      const clampedLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 340))
      const clampedTop = Math.max(0, Math.min(newTop, window.innerHeight - 100))

      const newPosition = { top: clampedTop, left: clampedLeft }
      positionRef.current = newPosition
      setPosition(newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return {
    position,
    isDragging,
    handleMouseDown,
  }
}

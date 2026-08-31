import type { IVChart } from '@visactor/vchart'
import { useCallback, useEffect, useRef } from 'react'

function getLegendLabel(event: unknown): string | null {
  if (!event || typeof event !== 'object') return null
  const value = (event as { value?: unknown }).value
  if (!value || typeof value !== 'object') return null
  const record = value as { data?: unknown; label?: unknown }
  const data = record.data
  const dataLabel =
    data && typeof data === 'object'
      ? (data as { label?: unknown }).label
      : undefined
  const label = dataLabel ?? record.label
  return typeof label === 'string' && label ? label : null
}

export function useVChartLegendInteractions() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IVChart | null>(null)
  const hoveredLabelRef = useRef<string | null>(null)

  const handleLegendHover = useCallback((event: unknown) => {
    hoveredLabelRef.current = getLegendLabel(event)
  }, [])

  const handleLegendUnhover = useCallback(() => {
    hoveredLabelRef.current = null
  }, [])

  const handleChartReady = useCallback(
    (chart: IVChart) => {
      if (chartRef.current === chart) return
      if (chartRef.current) {
        chartRef.current.off('legendItemHover', handleLegendHover)
        chartRef.current.off('legendItemUnHover', handleLegendUnhover)
      }
      chartRef.current = chart
      chart.on('legendItemHover', handleLegendHover)
      chart.on('legendItemUnHover', handleLegendUnhover)
    },
    [handleLegendHover, handleLegendUnhover]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleAuxClick = (event: MouseEvent) => {
      if (event.button !== 1 || !hoveredLabelRef.current) return
      event.preventDefault()
      event.stopPropagation()
      chartRef.current?.setLegendSelectedDataByIndex(0, [
        hoveredLabelRef.current,
      ])
    }
    const stopMiddleButton = (event: MouseEvent | PointerEvent) => {
      if (event.button !== 1 || !hoveredLabelRef.current) return
      event.preventDefault()
      event.stopPropagation()
    }

    container.addEventListener('auxclick', handleAuxClick, true)
    container.addEventListener('mousedown', stopMiddleButton, true)
    container.addEventListener('mouseup', stopMiddleButton, true)
    container.addEventListener('pointerdown', stopMiddleButton, true)
    container.addEventListener('pointerup', stopMiddleButton, true)

    return () => {
      container.removeEventListener('auxclick', handleAuxClick, true)
      container.removeEventListener('mousedown', stopMiddleButton, true)
      container.removeEventListener('mouseup', stopMiddleButton, true)
      container.removeEventListener('pointerdown', stopMiddleButton, true)
      container.removeEventListener('pointerup', stopMiddleButton, true)
    }
  }, [])

  useEffect(
    () => () => {
      if (!chartRef.current) return
      chartRef.current.off('legendItemHover', handleLegendHover)
      chartRef.current.off('legendItemUnHover', handleLegendUnhover)
    },
    [handleLegendHover, handleLegendUnhover]
  )

  return { containerRef, handleChartReady }
}

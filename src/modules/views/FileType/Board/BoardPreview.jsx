import cx from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

import { useClient } from 'cozy-client'
import { useCozyTheme } from 'cozy-ui-plus/dist/providers/CozyTheme'

import styles from './board.styl'

import logger from '@/lib/logger'
import { isExcalidrawScene } from '@/modules/views/Excalidraw/helpers'
import { fetchFileBinary } from '@/modules/views/editor/helpers'

// Scenes already read, by file id and revision, so going back to the page or
// scrolling does not download every board again.
const sceneCache = new Map()

const getRevision = file => `${file._id}:${file.md5sum ?? file.updated_at}`

const fetchScene = async (client, { fileId, driveId, revision }) => {
  const key = revision
  if (!sceneCache.has(key)) {
    sceneCache.set(
      key,
      fetchFileBinary(client, fileId, driveId)
        .then(response => response.json())
        .catch(error => {
          sceneCache.delete(key)
          throw error
        })
    )
  }
  return sceneCache.get(key)
}

const renderSvg = async (scene, isDark) => {
  await import('@/modules/views/Excalidraw/setupAssetPath')
  const { exportToSvg } = await import('@excalidraw/excalidraw')
  const svg = await exportToSvg({
    elements: scene.elements.filter(element => !element.isDeleted),
    appState: {
      ...scene.appState,
      exportBackground: false,
      exportWithDarkMode: isDark,
      exportPadding: 16
    },
    files: scene.files ?? {}
  })
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  return svg
}

/**
 * Miniature of a board, drawn from its scene once the tile shows on screen.
 * Gives the drawing itself rather than a file icon, as the VK Board list.
 *
 * @param {object} props - Component props
 * @param {object} [props.file] - The io.cozy.files board to draw
 * @param {object[]} [props.elements] - Elements to draw instead of a file
 * @param {string} [props.className] - Extra class, to size the miniature
 */
export const BoardPreview = ({ file, elements, className }) => {
  const client = useClient()
  const { type: theme } = useCozyTheme()
  const containerRef = useRef(null)
  // Without IntersectionObserver (tests, old browsers), draw right away.
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  )
  const [status, setStatus] = useState('loading')
  // The list gives a new file object on each render: draw again only when
  // the board itself changes.
  const fileId = file?._id ?? null
  const driveId = file?.driveId
  const revision = file ? getRevision(file) : null

  useEffect(() => {
    const node = containerRef.current
    if (!node || isVisible) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    let isMounted = true
    const draw = async () => {
      try {
        const scene = elements
          ? { elements }
          : await fetchScene(client, { fileId, driveId, revision })
        if (!isExcalidrawScene(scene) || scene.elements.length === 0) {
          if (isMounted) setStatus('empty')
          return
        }
        const svg = await renderSvg(scene, theme === 'dark')
        if (!isMounted || !containerRef.current) return
        containerRef.current.replaceChildren(svg)
        setStatus('loaded')
      } catch (error) {
        logger.warn('Could not draw the board preview', error)
        if (isMounted) setStatus('empty')
      }
    }
    draw()
    return () => {
      isMounted = false
    }
  }, [client, elements, fileId, driveId, revision, isVisible, theme])

  return (
    <div className={cx(styles['boardPreview'], className)} data-status={status}>
      <div ref={containerRef} className={styles['boardPreview-drawing']} />
    </div>
  )
}

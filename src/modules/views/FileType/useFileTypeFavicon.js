import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { FAVICON_BY_MIMETYPE } from '@/hooks/useUpdateFavicon/constants'
import { updateFavicon } from '@/hooks/useUpdateFavicon/helpers'

/**
 * Shows the favicon of the page file type (the office one, same drawing as
 * the Home entrypoint) and restores the Drive favicon when leaving the page.
 *
 * The file viewer restores the favicon it found when it closes, so the type
 * favicon is applied again on every location change of the page.
 */
export const useFileTypeFavicon = fileType => {
  const { pathname } = useLocation()
  const originalFaviconUrlRef = useRef()
  const faviconUrl = FAVICON_BY_MIMETYPE[fileType]

  useEffect(() => {
    const originalFavicon = document.querySelector("link[rel~='icon']")
    if (originalFavicon) originalFaviconUrlRef.current = originalFavicon.href

    return () => {
      if (originalFaviconUrlRef.current) {
        updateFavicon(originalFaviconUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (faviconUrl) updateFavicon(faviconUrl)
  }, [faviconUrl, pathname])
}

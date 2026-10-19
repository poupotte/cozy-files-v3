import { useEffect, useState } from 'react'

/**
 * Whether a node has come near the screen once, so that a tile downloads its
 * file only when it is about to be seen. Without IntersectionObserver (tests,
 * old browsers), it is right away.
 *
 * @param {object} ref - Ref of the node to watch
 * @returns {boolean}
 */
export const useIsNearViewport = ref => {
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  )

  useEffect(() => {
    const node = ref.current
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
  }, [ref, isVisible])

  return isVisible
}

import { useCallback, useEffect, useState } from 'react'

import { useClient } from 'cozy-client'

import {
  fetchHiddenTemplateIds,
  saveHiddenTemplateIds
} from './hiddenTemplates'

import logger from '@/lib/logger'

/**
 * Templates of a page the user removed, with hide removing one more and
 * restore showing them all again.
 */
export const useHiddenTemplates = fileType => {
  const client = useClient()
  const [hiddenIds, setHiddenIds] = useState([])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const ids = await fetchHiddenTemplateIds(client, fileType)
        if (isMounted) setHiddenIds(ids)
      } catch (error) {
        logger.warn('Could not fetch the removed templates', error)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [client, fileType])

  const save = useCallback(
    async ids => {
      const previous = hiddenIds
      setHiddenIds(ids)
      try {
        await saveHiddenTemplateIds(client, fileType, ids)
      } catch (error) {
        setHiddenIds(previous)
        throw error
      }
    },
    [client, fileType, hiddenIds]
  )

  const hide = useCallback(
    templateId => save([...new Set([...hiddenIds, templateId])]),
    [hiddenIds, save]
  )
  const restore = useCallback(() => save([]), [save])

  return { hiddenIds, hide, restore }
}

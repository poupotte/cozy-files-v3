import { useCallback, useEffect, useState } from 'react'

import { useClient } from 'cozy-client'

import { fetchUserTemplates } from './userTemplates'

import logger from '@/lib/logger'

/**
 * Templates the user saved for a type, fetched again with refresh after one
 * is saved or removed.
 */
export const useUserTemplates = fileType => {
  const client = useClient()
  const [templates, setTemplates] = useState([])
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion(value => value + 1), [])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const result = await fetchUserTemplates(client, fileType)
        if (isMounted) setTemplates(result)
      } catch (error) {
        logger.warn('Could not fetch the user templates', error)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [client, fileType, version])

  return { templates, refresh }
}

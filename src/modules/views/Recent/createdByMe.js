import { useMemo } from 'react'

import { useClient } from 'cozy-client'
import { useSharingContext } from 'cozy-sharing'

const ALWAYS_OWNER = () => true

const getHost = url => {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

/**
 * Whether I created the file: it was created on my instance. Only the hosts
 * are compared: behind a proxy, the stack may record createdOn in http while
 * the app runs in https. A file without cozyMetadata falls back to the
 * sharing owner, like the Sharings tabs.
 */
export const isCreatedByMe = (file, { cozyUrl, isOwner }) => {
  const createdOn = file.cozyMetadata?.createdOn
  if (!createdOn) return isOwner(file._id ?? file.id)
  const host = getHost(createdOn)
  return host !== null && host === getHost(cozyUrl)
}

/**
 * Keeps the files I created in a query result, when `enabled`.
 */
export const useCreatedByMe = (result, enabled) => {
  const client = useClient()
  const { isOwner = ALWAYS_OWNER } = useSharingContext()

  return useMemo(() => {
    if (!enabled) return result
    const cozyUrl = client.getStackClient().uri
    const data = (result?.data ?? []).filter(file =>
      isCreatedByMe(file, { cozyUrl, isOwner })
    )
    return { ...result, data, count: data.length }
  }, [client, enabled, isOwner, result])
}

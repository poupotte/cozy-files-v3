import { useParams, useLocation } from 'react-router-dom'

import { FROM_APPS_ROUTE, ROOT_DIR_ID, TRASH_DIR_ID } from '@/constants/config'

const useCurrentFolderId = () => {
  const { folderId } = useParams()
  const { pathname = '' } = useLocation()

  if (folderId) {
    return folderId
  } else if (
    pathname === '/folder' ||
    // From apps lists the app folders of the root.
    pathname === `/${FROM_APPS_ROUTE}` ||
    pathname.startsWith(`/${FROM_APPS_ROUTE}/`)
  ) {
    return ROOT_DIR_ID
  } else if (pathname === '/trash') {
    return TRASH_DIR_ID
  }
  return null
}

export default useCurrentFolderId

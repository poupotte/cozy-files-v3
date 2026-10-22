import { useEffect, useState } from 'react'

import { useClient } from 'cozy-client'
import log from 'cozy-logger'

import { fetchFolder, useFolder } from '@/modules/breadcrumb/utils/fetchFolder'

/**
 * @typedef {Object} BreadcrumbPath
 * @property {string} name - The name of the folder.
 * @property {string} id - The ID of the folder.
 * @property {string} [to] - Route opened instead of the folder, for a root
 * @property {object} [icon] - Icon shown instead of the name, for a root
 */

/**
 * Custom hook that retrieves the breadcrumb path for a given folder.
 *
 * @param {Object} options - The options for retrieving the breadcrumb path.
 * @param {string} options.currentFolderId - The ID of the current folder.
 * @param {BreadcrumbPath} options.rootBreadcrumbPath - The root breadcrumb path object.
 * @param {string[]} [options.sharedDocumentIds] - The IDs of shared documents.
 * @param {(topFolder: object) => BreadcrumbPath|null} [options.getRootBreadcrumbPath] -
 * Root shown instead of rootBreadcrumbPath, from the folder right under it
 * @returns {BreadcrumbPath[]} - The breadcrumb path as an array of objects.
 */
export const useBreadcrumbPath = ({
  currentFolderId,
  rootBreadcrumbPath,
  sharedDocumentIds,
  driveId,
  getRootBreadcrumbPath
}) => {
  const client = useClient()
  const [paths, setPaths] = useState([])

  const { folder, fetchStatus } = useFolder({
    folderId: currentFolderId,
    driveId
  })
  const folderAttributes = {
    id: folder?.id,
    name: folder?.name,
    dirId: folder?.dir_id
  }

  useEffect(() => {
    if (rootBreadcrumbPath && currentFolderId === rootBreadcrumbPath.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaths([rootBreadcrumbPath])
      return
    }

    if (!folderAttributes.id || !folderAttributes.name) {
      // While the folder query is in flight we keep the path empty so the
      // breadcrumb can show its loading skeleton. Once the query has settled
      // without a usable folder (inaccessible or deleted target), fall back to
      // the root so the skeleton doesn't spin forever.
      const isSettled = fetchStatus === 'loaded' || fetchStatus === 'failed'
      setPaths(isSettled && rootBreadcrumbPath ? [rootBreadcrumbPath] : [])
      return
    }

    const hasAccessToSharedDocument = id => {
      if (!sharedDocumentIds) return true
      return !sharedDocumentIds.includes(id)
    }

    let isSubscribed = true
    let topFolder = null
    const returnedPaths = [
      { name: folderAttributes.name, id: folderAttributes.id }
    ]

    const shouldContinueLoop = id => {
      return !!id && id !== rootBreadcrumbPath?.id
    }

    const processFolder = async id => {
      const folder = await fetchFolder({ client, driveId, folderId: id })
      if (!folder) return undefined

      topFolder = folder
      returnedPaths.unshift({ name: folder.name, id: folder.id })
      return hasAccessToSharedDocument(folder.id) ? folder.dir_id : undefined
    }

    const shouldAddRootPath = () => {
      return (
        rootBreadcrumbPath?.name !== 'Public' &&
        returnedPaths[0]?.id !== rootBreadcrumbPath.id
      )
    }

    const getRootPath = async () => {
      if (!getRootBreadcrumbPath) return rootBreadcrumbPath
      const folder =
        topFolder ??
        (await fetchFolder({ client, driveId, folderId: folderAttributes.id }))
      return (folder && getRootBreadcrumbPath(folder)) ?? rootBreadcrumbPath
    }

    const handleBreadcrumbError = error => {
      if (rootBreadcrumbPath?.name === 'Public') {
        if (isSubscribed) {
          setPaths(returnedPaths)
        }
      } else {
        if (isSubscribed && rootBreadcrumbPath) {
          const pathsWithRoot =
            returnedPaths[0]?.id === rootBreadcrumbPath.id
              ? returnedPaths
              : [rootBreadcrumbPath, ...returnedPaths]
          setPaths(pathsWithRoot)
        }
        log(
          'error',
          `Error while fetching folder for breadcrumbs of folder id: ${folderAttributes.id}, here is the error: ${error}`
        )
      }
    }

    const fetchBreadcrumbs = async () => {
      let id = folderAttributes.dirId
      while (shouldContinueLoop(id)) {
        id = await processFolder(id)
      }

      if (isSubscribed) {
        if (shouldAddRootPath()) {
          returnedPaths.unshift(await getRootPath())
        }
        if (isSubscribed) setPaths(returnedPaths)
      }
    }

    fetchBreadcrumbs().catch(handleBreadcrumbError)

    return () => {
      isSubscribed = false
    }
  }, [
    client,
    sharedDocumentIds,
    rootBreadcrumbPath,
    getRootBreadcrumbPath,
    driveId,
    fetchStatus,
    folderAttributes.id,
    folderAttributes.name,
    folderAttributes.dirId,
    currentFolderId
  ])

  return paths
}

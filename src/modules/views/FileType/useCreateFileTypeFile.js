import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useClient } from 'cozy-client'

import { ensureFileTypeFolder } from './fileTypeFolder'

import { ROOT_DIR_ID } from '@/constants/config'
import logger from '@/lib/logger'

/**
 * Creates a file of the page type in its folder (Doc, Spreadsheet,
 * Presentation or Board), creating that folder first when it does not exist.
 * The editor then goes back to the page, with its filters, not to the folder.
 * A board can start from one of its templates, given by id.
 */
export const useCreateFileTypeFile = (fileType, page) => {
  const client = useClient()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [isCreating, setIsCreating] = useState(false)

  const createFile = useCallback(
    async (templateId = null) => {
      // Without edition the create route only shows the paywall: do not create
      // a folder for nothing.
      let folderId = ROOT_DIR_ID
      if (page.canCreate()) {
        setIsCreating(true)
        try {
          const folder = await ensureFileTypeFolder(client, fileType, page)
          folderId = folder._id
        } catch (error) {
          logger.error(`Could not get the ${fileType} folder`, error)
        } finally {
          setIsCreating(false)
        }
      }
      const params = new URLSearchParams({
        redirectLink: `drive#${pathname}${search}`
      })
      if (typeof templateId === 'string') params.append('template', templateId)
      navigate(`${page.createPath(folderId)}?${params}`)
    },
    [client, fileType, navigate, page, pathname, search]
  )

  return { createFile, isCreating }
}

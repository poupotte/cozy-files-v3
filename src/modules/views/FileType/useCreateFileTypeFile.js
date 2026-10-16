import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useClient } from 'cozy-client'

import { ensureFileTypeFolder } from './fileTypeFolder'

import { ROOT_DIR_ID } from '@/constants/config'
import logger from '@/lib/logger'
import { canWriteOfficeDocument } from '@/modules/views/OnlyOffice/helpers'

/**
 * Creates a file of the page type in its folder (Doc, Spreadsheet or
 * Presentation), creating that folder first when it does not exist.
 */
export const useCreateFileTypeFile = (fileType, page) => {
  const client = useClient()
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)

  const createFile = useCallback(async () => {
    // Without office edition the create route only shows the paywall: do not
    // create a folder for nothing.
    let folderId = ROOT_DIR_ID
    if (canWriteOfficeDocument()) {
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
    navigate(`/onlyoffice/create/${folderId}/${page.createClass}`)
  }, [client, fileType, navigate, page])

  return { createFile, isCreating }
}

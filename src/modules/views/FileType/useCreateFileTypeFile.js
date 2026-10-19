import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useClient } from 'cozy-client'

import { createFromUserTemplate } from './UserTemplates/userTemplates'
import { ensureFileTypeFolder } from './fileTypeFolder'

import { ROOT_DIR_ID } from '@/constants/config'
import logger from '@/lib/logger'
import { makeExcalidrawFileRoute } from '@/modules/views/Excalidraw/helpers'
import { makeOnlyOfficeFileRoute } from '@/modules/views/OnlyOffice/helpers'

/**
 * Creates a file of the page type in its folder (Doc, Spreadsheet,
 * Presentation or Board), creating that folder first when it does not exist.
 * The editor then goes back to the page, with its filters, not to the folder.
 * A file can start from one of the templates of the page, given by id, or
 * from a template the user saved, given as a file.
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

  const createFromTemplateFile = useCallback(
    async template => {
      setIsCreating(true)
      try {
        const file = await createFromUserTemplate({
          client,
          template,
          fileType,
          page
        })
        const from = `${pathname}${search}`
        navigate(
          page.home === 'board'
            ? makeExcalidrawFileRoute(file._id, { fromPathname: from })
            : makeOnlyOfficeFileRoute(file._id, {
                fromCreate: true,
                fromRedirect: `drive#${from}`
              })
        )
      } catch (error) {
        logger.error(`Could not create a ${fileType} from a template`, error)
        setIsCreating(false)
      }
    },
    [client, fileType, navigate, page, pathname, search]
  )

  return { createFile, createFromTemplateFile, isCreating }
}

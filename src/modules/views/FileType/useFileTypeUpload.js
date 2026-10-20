import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useClient } from 'cozy-client'
import { useSharingContext } from 'cozy-sharing'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'
import { useI18n } from 'twake-i18n'

import { makeUploadedFile, sortDroppedFiles } from './fileTypeDrop'
import { ensureFileTypeFolder } from './fileTypeFolder'

import logger from '@/lib/logger'
import { uploadFiles } from '@/modules/navigation/duck'
import { useNewItemHighlightContext } from '@/modules/upload/NewItemHighlightProvider'

/**
 * Uploads the files dropped on a file type page in its folder, as its Create
 * button does for new files. Files of another type are not uploaded: an
 * alert names them.
 *
 * @param {string} fileType - Type of the page
 * @param {object} page - The file type page
 * @param {Function} [onUploaded] - Called once each file is uploaded
 */
export const useFileTypeUpload = (fileType, page, onUploaded) => {
  const client = useClient()
  const { t } = useI18n()
  const { showAlert } = useAlert()
  const sharingState = useSharingContext()
  const dispatch = useDispatch()
  const { addItems } = useNewItemHighlightContext()

  return useCallback(
    async entries => {
      const { accepted, rejected } = sortDroppedFiles(entries, fileType)
      if (rejected.length > 0) {
        showAlert({
          message: t(`FileTypeDrop.rejected.${fileType}`, {
            smart_count: rejected.length,
            name: rejected[0]
          }),
          severity: 'error'
        })
      }
      if (accepted.length === 0) return

      try {
        const folder = await ensureFileTypeFolder(client, fileType, page)
        dispatch(
          uploadFiles(
            accepted.map(file => makeUploadedFile(file, page)),
            folder._id,
            sharingState,
            onUploaded,
            { client, showAlert, t },
            undefined,
            addItems
          )
        )
      } catch (error) {
        logger.error(
          `Could not upload the files to the ${fileType} folder`,
          error
        )
        showAlert({ message: t('FileTypeDrop.error'), severity: 'error' })
      }
    },
    [
      addItems,
      client,
      dispatch,
      fileType,
      onUploaded,
      page,
      sharingState,
      showAlert,
      t
    ]
  )
}

import { useEffect, useState, useMemo } from 'react'

import { useClient } from 'cozy-client'
import { uploadFileWithConflictStrategy } from 'cozy-client/dist/models/file'
import { useI18n } from 'twake-i18n'

import logger from '@/lib/logger'
import {
  applyOfficeTemplate,
  hasOfficeTemplate
} from '@/modules/views/FileType/Office/officeTemplates'
import {
  makeExtByClass,
  makeMimeByClass
} from '@/modules/views/OnlyOffice/helpers'

// File type pages name the spreadsheets sheet.
const getFileTypeOfClass = fileClass =>
  fileClass === 'spreadsheet' ? 'sheet' : fileClass

const useCreateFile = (
  folderId,
  fileClass,
  driveId = undefined,
  templateId = null
) => {
  const [status, setStatus] = useState('pending')
  const [fileId, setFileId] = useState(null)
  const { t } = useI18n()
  const client = useClient()

  const fileExt = useMemo(() => makeExtByClass(fileClass), [fileClass])
  const fileMime = useMemo(() => makeMimeByClass(fileClass), [fileClass])
  const fileUrl = useMemo(
    () => `/onlyOffice/${fileClass}.${fileExt}`,
    [fileClass, fileExt]
  )
  const fileType = getFileTypeOfClass(fileClass)
  const template = hasOfficeTemplate(fileType, templateId) ? templateId : null
  const fileName = useMemo(
    () =>
      (template
        ? t(`OfficeHome.templates.${template}.name`)
        : t(`OnlyOffice.createFileName.${fileClass}`)) + `.${fileExt}`,
    [t, fileClass, fileExt, template]
  )

  useEffect(() => {
    const doCreate = async () => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const content = template
            ? applyOfficeTemplate(reader.result, fileType, template, t)
            : reader.result
          const { data: createdFile } = await uploadFileWithConflictStrategy(
            client,
            content,
            {
              name: fileName,
              dirId: folderId,
              conflictStrategy: 'rename',
              driveId,
              contentType: fileMime
            }
          )
          setStatus('loaded')
          setFileId(createdFile.id)
        } catch (error) {
          logger.error(`Creating Only Office file failed: ${error}`)
          setStatus('error')
        }
      }

      try {
        const res = await fetch(fileUrl)
        const data = await res.blob()
        reader.readAsArrayBuffer(data)
      } catch (error) {
        logger.error(`Fetching Only Office template file failed: ${error}`)
        setStatus('error')
      }
    }

    doCreate()
  }, [
    fileClass,
    fileUrl,
    folderId,
    fileMime,
    fileName,
    driveId,
    client,
    fileType,
    template,
    t
  ])

  return { status, fileId }
}

export default useCreateFile

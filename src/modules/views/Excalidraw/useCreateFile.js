import { useEffect, useState } from 'react'

import { useClient } from 'cozy-client'
import { uploadFileWithConflictStrategy } from 'cozy-client/dist/models/file'
import { useI18n } from 'twake-i18n'

import logger from '@/lib/logger'
import {
  makeEmptyScene,
  EXCALIDRAW_EXTENSION,
  EXCALIDRAW_MIME
} from '@/modules/views/Excalidraw/helpers'
import {
  getBoardTemplate,
  makeTemplateElements
} from '@/modules/views/FileType/Board/boardTemplates'

/**
 * Creates a new, empty Excalidraw file in the given folder and exposes its
 * creation status and resulting id.
 *
 * Unlike OnlyOffice, the template does not need a static asset: the empty scene
 * is generated in memory.
 *
 * @param {string} folderId - Destination folder id
 * @param {string} [driveId] - Shared drive id, when relevant
 * @param {string|null} [templateId] - Board template to start from
 * @returns {{ status: string, fileId: string|null }}
 */
export const useCreateFile = (
  folderId,
  driveId = undefined,
  templateId = null
) => {
  const [status, setStatus] = useState('pending')
  const [fileId, setFileId] = useState(null)
  const { t } = useI18n()
  const client = useClient()

  useEffect(() => {
    let cancelled = false

    const doCreate = async () => {
      try {
        const template = getBoardTemplate(templateId)
        const fileName = `${
          template
            ? t(`BoardHome.templates.${template.id}.name`)
            : t('Excalidraw.createFileName')
        }.${EXCALIDRAW_EXTENSION}`
        // The file body is the scene: a .excalidraw is a JSON file the editor
        // reads from and writes back to. Seed its source with the instance URL.
        const source = client.getStackClient().uri
        const scene = makeEmptyScene(source)
        if (template) {
          scene.elements = await makeTemplateElements(template, t)
        }
        if (cancelled) return
        const content = JSON.stringify(scene)
        const { data: createdFile } = await uploadFileWithConflictStrategy(
          client,
          content,
          {
            name: fileName,
            dirId: folderId,
            conflictStrategy: 'rename',
            driveId,
            contentType: EXCALIDRAW_MIME
          }
        )
        if (cancelled) return
        setFileId(createdFile.id)
        setStatus('loaded')
      } catch (error) {
        logger.error(`Creating Excalidraw file failed: ${error}`)
        if (!cancelled) setStatus('error')
      }
    }

    doCreate()

    return () => {
      cancelled = true
    }
  }, [client, t, folderId, driveId, templateId])

  return { status, fileId }
}

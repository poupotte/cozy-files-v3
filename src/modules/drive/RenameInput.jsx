import React from 'react'
import { connect } from 'react-redux'

import { useClient } from 'cozy-client'
import { splitFilename } from 'cozy-client/dist/models/file'
import useBrowserOffline from 'cozy-ui/transpiled/react/hooks/useBrowserOffline'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'
import { useI18n } from 'twake-i18n'

import { abortRenaming } from './rename'

import logger from '@/lib/logger'
import FilenameInput from '@/modules/filelist/FilenameInput'
import { restoreExcalidrawMime } from '@/modules/views/Excalidraw/restoreExcalidrawMime'

// If we set the _rev then CozyClient tries to update. Else
// it tries to create
export const updateFileNameQuery = async (client, file, newName) => {
  const result = await client
    .collection('io.cozy.files', { driveId: file.driveId })
    .update({
      ...file,
      name: newName,
      _rev: file._rev || file.meta.rev
    })
  // The stack types a renamed board by its name, which it does not know.
  try {
    await restoreExcalidrawMime(client, { ...file, ...result?.data })
  } catch (error) {
    logger.warn('Could not restore the type of the renamed board', error)
  }
  return result
}

export const RenameInput = ({
  onAbort,
  file,
  refreshFolderContent,
  className,
  style,
  withoutExtension
}) => {
  const client = useClient()
  const { showAlert } = useAlert()
  const { t } = useI18n()

  const { filename, extension } = splitFilename(file)
  const name = withoutExtension ? filename : file.name
  const isOffline = useBrowserOffline()

  return (
    <FilenameInput
      className={className}
      style={style}
      name={name}
      file={file}
      onSubmit={async newValue => {
        const newName = withoutExtension ? newValue + extension : newValue
        try {
          if (isOffline) {
            showAlert({
              message: t('alert.offline'),
              severity: 'error',
              duration: 4000
            })
          } else {
            await updateFileNameQuery(client, file, newName)
            if (refreshFolderContent) refreshFolderContent()
          }
        } catch (error) {
          if (
            error.message.includes(
              'NetworkError when attempting to fetch resource.'
            )
          ) {
            showAlert({
              message: t('upload.alert.network'),
              severity: 'error',
              duration: 4000
            })
          } else if (
            error.message.includes(
              'Invalid filename containing illegal character(s):'
            )
          ) {
            showAlert({
              message: t('alert.file_name_illegal_characters', {
                fileName: newName,
                characters: error.message.split(
                  'Invalid filename containing illegal character(s): '
                )[1]
              }),
              severity: 'error',
              duration: 4000
            })
          } else if (error.message.includes('Invalid filename:')) {
            showAlert({
              message: t('alert.file_name_illegal_name', { fileName: newName }),
              severity: 'error',
              duration: 4000
            })
          } else if (error.message.includes('Missing name argument')) {
            showAlert({
              message: t('alert.file_name_missing'),
              severity: 'error',
              duration: 4000
            })
          } else {
            showAlert({
              message: t('alert.file_name', { fileName: newName }),
              severity: 'error',
              duration: 4000
            })
          }
        } finally {
          onAbort()
        }
      }}
      onAbort={onAbort}
    />
  )
}

const mapDispatchToProps = dispatch => ({
  onAbort: () => dispatch(abortRenaming())
})

export default connect(null, mapDispatchToProps)(RenameInput)

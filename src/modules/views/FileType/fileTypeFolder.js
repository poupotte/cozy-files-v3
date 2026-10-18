import { Q } from 'cozy-client'
import { createFolderWithReference } from 'cozy-client/dist/models/folder'

import { TRASH_DIR_PATH } from '@/constants/config'
import logger from '@/lib/logger'

// Like the Notes folder, each file type page stores its new files in a
// folder found through a reference rather than its path: the user can rename
// or move it, and it is created again at the root once deleted.
export const getFileTypeFolderReference = fileType => ({
  _type: 'io.cozy.apps',
  _id: `io.cozy.apps/drive/${fileType}`
})

const isInTrash = folder =>
  folder.path === TRASH_DIR_PATH ||
  Boolean(folder.path?.startsWith(`${TRASH_DIR_PATH}/`))

// The latest referenced folder out of the trash. Unlike getReferencedFolder of
// cozy-client, a folder put in the trash is left out: a directory has no
// trashed attribute, only its path tells it is there.
export const findFileTypeFolder = async (client, fileType) => {
  const { included = [] } = await client.query(
    Q('io.cozy.files')
      .partialIndex({ type: 'directory' })
      .referencedBy(getFileTypeFolderReference(fileType))
  )
  const folders = included
    .filter(folder => folder.type === 'directory' && !isInTrash(folder))
    .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
  return folders.pop() ?? null
}

// The folder is customized like its app, unless the user customized it. Its
// look failing to be saved does not keep the file from being created in it.
const decorate = async (client, folder, page) => {
  if (folder.metadata?.decorations) return folder
  try {
    const { data } = await client.save({
      ...folder,
      _type: 'io.cozy.files',
      metadata: { ...folder.metadata, decorations: page.folderDecorations }
    })
    return data
  } catch (error) {
    logger.warn('Could not customize the file type folder', error)
    return folder
  }
}

export const ensureFileTypeFolder = async (client, fileType, page) => {
  const folder =
    (await findFileTypeFolder(client, fileType)) ??
    (await createFolderWithReference(
      client,
      `/${page.folderName}`,
      getFileTypeFolderReference(fileType)
    ))

  return decorate(client, folder, page)
}

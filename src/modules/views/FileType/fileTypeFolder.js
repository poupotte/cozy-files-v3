import {
  createFolderWithReference,
  getReferencedFolder
} from 'cozy-client/dist/models/folder'

import logger from '@/lib/logger'

// Like the Notes folder, each file type page stores its new files in a
// folder found through a reference rather than its path: the user can rename
// or move it, and it is created again at the root once deleted.
export const getFileTypeFolderReference = fileType => ({
  _type: 'io.cozy.apps',
  _id: `io.cozy.apps/drive/${fileType}`
})

export const findFileTypeFolder = (client, fileType) =>
  getReferencedFolder(client, getFileTypeFolderReference(fileType))

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

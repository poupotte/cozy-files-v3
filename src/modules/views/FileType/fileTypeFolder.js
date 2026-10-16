import {
  createFolderWithReference,
  getReferencedFolder
} from 'cozy-client/dist/models/folder'

// Like the Notes folder, each file type page stores its new files in a
// folder found through a reference rather than its path: the user can rename
// or move it, and it is created again at the root once deleted.
export const getFileTypeFolderReference = fileType => ({
  _type: 'io.cozy.apps',
  _id: `io.cozy.apps/drive/${fileType}`
})

export const findFileTypeFolder = (client, fileType) =>
  getReferencedFolder(client, getFileTypeFolderReference(fileType))

export const ensureFileTypeFolder = async (client, fileType, page) => {
  const existingFolder = await findFileTypeFolder(client, fileType)
  if (existingFolder) return existingFolder

  return createFolderWithReference(
    client,
    `/${page.folderName}`,
    getFileTypeFolderReference(fileType)
  )
}

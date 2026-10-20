import { EXCALIDRAW_MIME, isExcalidraw } from './helpers'

import { fetchFileBinary } from '@/modules/views/editor/helpers'

/**
 * Gives a board back its mime type when the stack lost it. The stack does
 * not know the .excalidraw extension: renaming a board gives it the
 * application/octet-stream type of its name, and its copies keep it, so the
 * Board page, listing the boards by mime type, no longer shows them. Only a
 * new content sets the type: the board is uploaded again, as it is.
 *
 * @param {object} client - CozyClient
 * @param {object} file - An io.cozy.files doc
 * @returns {Promise<object>} The file, with its type
 */
export const restoreExcalidrawMime = async (client, file) => {
  if (!isExcalidraw(file) || file.mime === EXCALIDRAW_MIME) return file
  const fileId = file._id ?? file.id
  const response = await fetchFileBinary(client, fileId, file.driveId)
  const content = await response.arrayBuffer()
  const { data } = await client
    .collection('io.cozy.files', file.driveId ? { driveId: file.driveId } : {})
    .updateFile(content, {
      fileId,
      name: file.name,
      contentType: EXCALIDRAW_MIME
    })
  return data
}

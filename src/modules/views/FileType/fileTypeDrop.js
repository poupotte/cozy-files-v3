import { getSharingsEntryFileType } from '@/modules/views/Sharings/matchSharingsFilters'

// A file dropped from a folder has the path of that folder.
const isInDroppedFolder = file =>
  (file.path ?? '').replace(/^\.?\//, '').includes('/')

/**
 * Type of a file dropped from the computer, as the Type filter of the page
 * would classify it once uploaded, from its name and mime type.
 * @param {File} file - The dropped file
 * @returns {string|null}
 */
export const getDroppedFileType = file =>
  getSharingsEntryFileType({
    type: 'file',
    name: file.name,
    mime: file.type || 'application/octet-stream'
  })

/**
 * Splits the files dropped on a file type page between the ones of its type,
 * to upload, and the others, folders included, to tell the user about.
 * @param {{ file: File, isDirectory: boolean }[]} entries - Dropped items
 * @param {string} fileType - Type of the page
 * @returns {{ accepted: File[], rejected: string[] }} The files to upload,
 *   and the names of the others
 */
export const sortDroppedFiles = (entries, fileType) => {
  const accepted = []
  const rejected = []
  for (const { file, isDirectory } of entries) {
    if (!file) continue
    if (
      !isDirectory &&
      !isInDroppedFolder(file) &&
      getDroppedFileType(file) === fileType
    ) {
      accepted.push(file)
    } else {
      rejected.push(file.name)
    }
  }
  return { accepted, rejected }
}

/**
 * The file to upload: a page listing its files by mime type gets that mime
 * type, as the browser does not know the one of a board.
 * @param {File} file - A dropped file of the type
 * @param {object} page - The file type page
 * @returns {File}
 */
export const makeUploadedFile = (file, page) =>
  page.mimes ? new File([file], file.name, { type: page.mimes[0] }) : file

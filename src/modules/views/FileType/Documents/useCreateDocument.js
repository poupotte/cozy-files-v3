import { getFileTypePage } from '../helpers'
import { useCreateFileTypeFile } from '../useCreateFileTypeFile'

const TEXT_PAGE = getFileTypePage('text')
const SHEET_PAGE = getFileTypePage('sheet')
const SLIDE_PAGE = getFileTypePage('slide')

/**
 * Creates a document, a spreadsheet or a presentation from the Documents
 * page, in the folder of its own page, the editor going back to the
 * Documents page.
 * @returns {{ createDocument: Function, isCreating: boolean }}
 */
export const useCreateDocument = () => {
  const text = useCreateFileTypeFile('text', TEXT_PAGE)
  const sheet = useCreateFileTypeFile('sheet', SHEET_PAGE)
  const slide = useCreateFileTypeFile('slide', SLIDE_PAGE)
  const creators = { text, sheet, slide }

  return {
    createDocument: fileType => creators[fileType].createFile(),
    isCreating: text.isCreating || sheet.isCreating || slide.isCreating
  }
}

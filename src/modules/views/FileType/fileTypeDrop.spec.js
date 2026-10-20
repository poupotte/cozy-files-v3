import { makeUploadedFile, sortDroppedFiles } from './fileTypeDrop'
import { getFileTypePage } from './helpers'

const makeFile = (name, type = '', path) => {
  const file = new File(['content'], name, { type })
  if (path) Object.defineProperty(file, 'path', { value: path })
  return file
}

const entry = (file, isDirectory = false) => ({ file, isDirectory })

describe('sortDroppedFiles', () => {
  it.each([
    ['text', 'Report.docx', ''],
    ['text', 'Notes.odt', ''],
    [
      'text',
      'Letter.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ['sheet', 'Budget.xlsx', ''],
    ['sheet', 'Budget.ods', ''],
    ['slide', 'Pitch.pptx', ''],
    ['slide', 'Pitch.odp', ''],
    ['excalidraw', 'Plan.excalidraw', '']
  ])('accepts on the %s page %s', (fileType, name, type) => {
    const file = makeFile(name, type)

    expect(sortDroppedFiles([entry(file)], fileType)).toEqual({
      accepted: [file],
      rejected: []
    })
  })

  it('refuses the files of another type and the folders', () => {
    const report = makeFile('Report.docx')
    const entries = [
      entry(report),
      entry(makeFile('Photo.png', 'image/png')),
      entry(makeFile('Budget.xlsx')),
      entry(makeFile('Archive'), true),
      entry(makeFile('Old.docx', '', './Archive/Old.docx'))
    ]

    expect(sortDroppedFiles(entries, 'text')).toEqual({
      accepted: [report],
      rejected: ['Photo.png', 'Budget.xlsx', 'Archive', 'Old.docx']
    })
  })
})

describe('makeUploadedFile', () => {
  it('gives a board the mime type of the Board page', () => {
    const board = makeUploadedFile(
      makeFile('Plan.excalidraw'),
      getFileTypePage('excalidraw')
    )

    expect(board.type).toBe('application/vnd.excalidraw+json')
    expect(board.name).toBe('Plan.excalidraw')
  })

  it('keeps an Office file as it is', () => {
    const file = makeFile('Report.docx')

    expect(makeUploadedFile(file, getFileTypePage('text'))).toBe(file)
  })
})

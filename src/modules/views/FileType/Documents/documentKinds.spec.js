import { filterDocuments } from './documentKinds'

const file = (name, mime, fileClass) => ({
  _id: name,
  type: 'file',
  name,
  mime,
  class: fileClass
})

const report = file(
  'Report.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text'
)
const budget = file(
  'Budget.xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'spreadsheet'
)
const pitch = file(
  'Pitch.odp',
  'application/vnd.oasis.opendocument.presentation',
  'slide'
)
const invoice = file('Invoice.pdf', 'application/pdf', 'pdf')
const files = [report, budget, pitch, invoice]

describe('filterDocuments', () => {
  it.each([
    ['all', files],
    ['text', [report]],
    ['sheet', [budget]],
    ['slide', [pitch]],
    ['pdf', [invoice]]
  ])('keeps with the %s filter the documents of that kind', (filter, kept) => {
    expect(filterDocuments(files, filter)).toEqual(kept)
  })
})

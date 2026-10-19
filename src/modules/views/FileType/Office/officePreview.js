import { strFromU8, unzipSync } from 'fflate'

export const DOC_KIND = 'text'
export const SHEET_KIND = 'sheet'
export const SLIDE_KIND = 'slide'

// Only Office Open XML files can be read: their content is XML in a zip.
const KIND_BY_EXTENSION = {
  docx: DOC_KIND,
  xlsx: SHEET_KIND,
  pptx: SLIDE_KIND
}

// Bigger files are not downloaded for a miniature.
export const MAX_PREVIEW_SIZE = 15 * 1024 * 1024

export const DOC_LINE_COUNT = 10
export const SHEET_ROW_COUNT = 6
export const SHEET_COLUMN_COUNT = 5

/**
 * Kind of preview a file can show, from its extension, or null when its
 * content cannot be read.
 * @param {object} file - An io.cozy.files doc
 * @returns {string|null}
 */
export const getOfficePreviewKind = file => {
  const extension = file?.name?.split('.').pop()?.toLowerCase()
  const kind = KIND_BY_EXTENSION[extension] ?? null
  if (!kind || Number(file.size) > MAX_PREVIEW_SIZE) return null
  return kind
}

const parseXml = text =>
  new DOMParser().parseFromString(text, 'application/xml')

const readXml = (entries, path) =>
  entries[path] ? parseXml(strFromU8(entries[path])) : null

const byName = (node, name) =>
  node ? Array.from(node.getElementsByTagNameNS('*', name)) : []

const textOf = node =>
  byName(node, 't')
    .map(text => text.textContent)
    .join('')

/**
 * First paragraphs of a document, the empty ones left out.
 * @param {object} entries - Files of the docx, by path
 * @returns {{ lines: string[] }}
 */
export const readDocPreview = entries => {
  const document = readXml(entries, 'word/document.xml')
  const lines = byName(document, 'p')
    .map(paragraph => textOf(paragraph).trim())
    .filter(Boolean)
    .slice(0, DOC_LINE_COUNT)
  return { lines }
}

// Column index of a cell reference: A1 is 0, AB3 is 27.
const getColumnIndex = reference => {
  const letters = reference.match(/^[A-Z]+/)?.[0] ?? ''
  return (
    [...letters].reduce(
      (index, letter) => index * 26 + letter.charCodeAt(0) - 64,
      0
    ) - 1
  )
}

const getRowIndex = reference => Number(reference.match(/\d+$/)?.[0] ?? 0) - 1

const getCellValue = (cell, sharedStrings) => {
  const type = cell.getAttribute('t')
  if (type === 'inlineStr') return textOf(cell)
  const value = byName(cell, 'v')[0]?.textContent ?? ''
  if (type === 's') return sharedStrings[Number(value)] ?? ''
  return value
}

/**
 * Top left cells of the first sheet, and how many sheets there are.
 * @param {object} entries - Files of the xlsx, by path
 * @returns {{ rows: string[][], sheetCount: number }}
 */
export const readSheetPreview = entries => {
  const sheetCount = byName(readXml(entries, 'xl/workbook.xml'), 'sheet').length
  const sharedStrings = byName(
    readXml(entries, 'xl/sharedStrings.xml'),
    'si'
  ).map(textOf)
  const rows = Array.from({ length: SHEET_ROW_COUNT }, () =>
    Array(SHEET_COLUMN_COUNT).fill('')
  )
  for (const cell of byName(
    readXml(entries, 'xl/worksheets/sheet1.xml'),
    'c'
  )) {
    const reference = cell.getAttribute('r') ?? ''
    const row = getRowIndex(reference)
    const column = getColumnIndex(reference)
    if (
      row >= 0 &&
      row < SHEET_ROW_COUNT &&
      column >= 0 &&
      column < SHEET_COLUMN_COUNT
    ) {
      rows[row][column] = getCellValue(cell, sharedStrings)
    }
  }
  return { rows, sheetCount }
}

/**
 * Picture of the first slide, saved in the file by the editor, its title as a
 * fallback, and how many slides there are.
 * @param {object} entries - Files of the pptx, by path
 * @returns {{ thumbnail: Blob|null, title: string, slideCount: number }}
 */
export const readSlidePreview = entries => {
  const thumbnail = entries['docProps/thumbnail.jpeg']
    ? new Blob([entries['docProps/thumbnail.jpeg']], { type: 'image/jpeg' })
    : null
  const slideCount = Number(
    byName(readXml(entries, 'docProps/app.xml'), 'Slides')[0]?.textContent ?? 0
  )
  const title =
    byName(readXml(entries, 'ppt/slides/slide1.xml'), 'p')
      .map(paragraph => textOf(paragraph).trim())
      .find(Boolean) ?? ''
  return { thumbnail, title, slideCount }
}

const READERS = {
  [DOC_KIND]: {
    paths: ['word/document.xml'],
    read: readDocPreview
  },
  [SHEET_KIND]: {
    paths: [
      'xl/workbook.xml',
      'xl/sharedStrings.xml',
      'xl/worksheets/sheet1.xml'
    ],
    read: readSheetPreview
  },
  [SLIDE_KIND]: {
    paths: [
      'docProps/thumbnail.jpeg',
      'docProps/app.xml',
      'ppt/slides/slide1.xml'
    ],
    read: readSlidePreview
  }
}

/**
 * Reads the preview of an Office file from its content, unzipping only the
 * parts it needs.
 * @param {ArrayBuffer} buffer - Content of the file
 * @param {string} kind - DOC_KIND, SHEET_KIND or SLIDE_KIND
 * @returns {object} Preview of the kind
 */
export const readOfficePreview = (buffer, kind) => {
  const { paths, read } = READERS[kind]
  const entries = unzipSync(new Uint8Array(buffer), {
    filter: entry => paths.includes(entry.name)
  })
  return read(entries)
}

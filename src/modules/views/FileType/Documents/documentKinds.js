import { getSharingsEntryFileType } from '@/modules/views/Sharings/matchSharingsFilters'

// Filters of the Documents page, as the tabs of the Mail.ru Documents: every
// document, then each type of document.
export const DOCUMENT_FILTERS = ['all', 'text', 'sheet', 'slide', 'pdf']

/**
 * Type of a document of the Documents page: text, sheet, slide or pdf.
 * @param {object} file - An io.cozy.files doc
 * @returns {string|null}
 */
export const getDocumentKind = file => getSharingsEntryFileType(file)

/**
 * Documents of the page shown by a filter.
 * @param {object[]} files - Documents of the page
 * @param {string} filter - One of DOCUMENT_FILTERS
 * @returns {object[]}
 */
export const filterDocuments = (files, filter) =>
  filter === 'all'
    ? files
    : files.filter(file => getDocumentKind(file) === filter)

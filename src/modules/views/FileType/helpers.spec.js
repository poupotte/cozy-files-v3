import { getFileTypePage, getFileTypeSectionFromPath } from './helpers'

import { EXCALIDRAW_MIME } from '@/modules/views/Excalidraw/helpers'
import { buildRecentByClassQuery, buildRecentByMimeQuery } from '@/queries'

describe('getFileTypePage', () => {
  it('finds boards by their mime type and creates them in Excalidraw', () => {
    const page = getFileTypePage('excalidraw')

    expect(page.mimes).toEqual([EXCALIDRAW_MIME])
    expect(page.appName).toBe('Twake Board')
    expect(page.createPath('folder-id')).toBe('/excalidraw/create/folder-id')
  })

  it('creates office files in OnlyOffice', () => {
    expect(getFileTypePage('sheet').createPath('folder-id')).toBe(
      '/onlyoffice/create/folder-id/spreadsheet'
    )
  })

  it.each(['text', 'sheet', 'slide'])(
    'opens the Documents page for the %s type',
    fileType => {
      expect(getFileTypePage(fileType).openedIn).toBe('documents')
    }
  )

  it('keeps the Documents and Board pages', () => {
    expect(getFileTypePage('documents').openedIn).toBeUndefined()
    expect(getFileTypePage('excalidraw').openedIn).toBeUndefined()
  })

  it('knows no page of an unknown type', () => {
    expect(getFileTypePage('unknown')).toBeNull()
  })
})

describe('file type page queries', () => {
  it('builds the queries of the office and board pages', () => {
    expect(
      buildRecentByClassQuery(['text']).definition().partialFilter
    ).toMatchObject({ class: { $in: ['text'] } })
    expect(
      buildRecentByMimeQuery([EXCALIDRAW_MIME]).definition().partialFilter
    ).toMatchObject({ mime: { $in: [EXCALIDRAW_MIME] } })
  })
})

describe('getFileTypeSectionFromPath', () => {
  it.each([
    ['/type/text', ''],
    ['/type/text/file/123', ''],
    ['/type/excalidraw/recent', 'recent'],
    ['/type/sheet/created-by-me', 'created-by-me'],
    ['/type/slide/sharings/with-me', 'sharings'],
    ['/type/excalidraw/trash/destroy', 'trash'],
    ['/recent', null]
  ])('finds the section of %s', (pathname, section) => {
    expect(getFileTypeSectionFromPath(pathname)).toBe(section)
  })
})

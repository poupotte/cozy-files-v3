import { getFileTypePage } from './helpers'

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

import { renderHook } from '@testing-library/react'

import { useFilteredRecents } from './useFilteredRecents'

jest.mock('cozy-sharing', () => ({
  useSharingContext: jest.fn()
}))

const mockUseSharingContext = require('cozy-sharing').useSharingContext

const pdf = {
  _id: 'file-pdf',
  name: 'report.pdf',
  type: 'file',
  class: 'pdf',
  mime: 'application/pdf'
}
const image = {
  _id: 'file-image',
  name: 'photo.jpg',
  type: 'file',
  class: 'image',
  mime: 'image/jpeg'
}
const sharedWithMe = {
  _id: 'file-shared-with-me',
  name: 'notes.pdf',
  type: 'file',
  class: 'pdf',
  mime: 'application/pdf'
}

const alice = { status: 'owner', name: 'Alice', email: 'alice@example.com' }
const bob = { status: 'ready', name: 'Bob', email: 'bob@example.com' }
const me = { status: 'ready', name: 'Me', email: 'me@example.com' }

const recipientsByDocId = {
  'file-pdf': [{ status: 'owner', name: 'Me', email: 'me@example.com' }, bob],
  'file-shared-with-me': [alice, me]
}

const result = {
  fetchStatus: 'loaded',
  data: [pdf, image, sharedWithMe]
}

const setup = filters => {
  mockUseSharingContext.mockReturnValue({
    allLoaded: true,
    getRecipients: docId => recipientsByDocId[docId] ?? [],
    isOwner: docId => docId !== 'file-shared-with-me'
  })

  return renderHook(() => useFilteredRecents({ result, filters })).result
    .current
}

describe('useFilteredRecents', () => {
  it('returns the result untouched without active filters', () => {
    const { filteredResult } = setup({ type: null, contact: null })

    expect(filteredResult).toBe(result)
  })

  it('offers the contacts each entry shows in the Sharings view', () => {
    const { contactFilterOptions } = setup({ type: null, contact: null })

    expect(contactFilterOptions.map(option => option.value)).toEqual([
      'person:alice@example.com',
      'person:bob@example.com'
    ])
  })

  it('filters by file type', () => {
    const { filteredResult } = setup({ type: 'pdf', contact: null })

    expect(filteredResult.data).toEqual([pdf, sharedWithMe])
    expect(filteredResult.count).toBe(2)
  })

  it('filters by contact', () => {
    const { filteredResult } = setup({
      type: null,
      contact: 'person:alice@example.com'
    })

    expect(filteredResult.data).toEqual([sharedWithMe])
  })

  it('combines filters', () => {
    const { filteredResult } = setup({
      type: 'image',
      contact: 'person:bob@example.com'
    })

    expect(filteredResult.data).toEqual([])
  })
})

import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'

import { ensureFileTypeFolder } from './fileTypeFolder'
import { getFileTypePage } from './helpers'
import { useCreateFileTypeFile } from './useCreateFileTypeFile'

import { ROUTER_FUTURE_FLAGS } from '@/constants/config'

jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  useClient: () => ({})
}))
jest.mock('cozy-flags', () => jest.fn(() => true))
jest.mock('./fileTypeFolder', () => ({
  ensureFileTypeFolder: jest.fn()
}))

describe('useCreateFileTypeFile', () => {
  it('creates a board in its folder, to go back to the page after', async () => {
    ensureFileTypeFolder.mockResolvedValue({ _id: 'board-folder' })
    const wrapper = ({ children }) => (
      <MemoryRouter
        future={ROUTER_FUTURE_FLAGS}
        initialEntries={['/type/excalidraw?f.contact=alice']}
      >
        {children}
      </MemoryRouter>
    )
    const { result } = renderHook(
      () => ({
        create: useCreateFileTypeFile(
          'excalidraw',
          getFileTypePage('excalidraw')
        ),
        location: useLocation()
      }),
      { wrapper }
    )

    await act(() => result.current.create.createFile())

    const { pathname, search } = result.current.location
    expect(pathname).toBe('/excalidraw/create/board-folder')
    expect(new URLSearchParams(search).get('redirectLink')).toBe(
      'drive#/type/excalidraw?f.contact=alice'
    )
  })
})

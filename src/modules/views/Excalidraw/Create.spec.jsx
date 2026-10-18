import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { ROUTER_FUTURE_FLAGS } from '@/constants/config'
import Create from '@/modules/views/Excalidraw/Create'
import { useCreateFile } from '@/modules/views/Excalidraw/useCreateFile'

jest.mock('@/modules/views/Excalidraw/useCreateFile', () => ({
  useCreateFile: jest.fn()
}))

const Opened = () => {
  const { pathname, search } = useLocation()
  return (
    <div data-testid="opened">
      {pathname} {new URLSearchParams(search).get('redirectLink')}
    </div>
  )
}

const renderCreate = entry =>
  render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS} initialEntries={[entry]}>
      <Routes>
        <Route path="excalidraw/create/:folderId" element={<Create />} />
        <Route path="excalidraw/:fileId" element={<Opened />} />
      </Routes>
    </MemoryRouter>
  )

describe('Create', () => {
  beforeEach(() => {
    useCreateFile.mockReturnValue({ status: 'loaded', fileId: 'file-id' })
  })

  it('goes back to the folder of the new drawing', () => {
    renderCreate('/excalidraw/create/folder-id')

    expect(screen.getByTestId('opened').textContent).toBe(
      '/excalidraw/file-id drive#/folder/folder-id'
    )
  })

  it('goes back where the creation was asked from, when said', () => {
    renderCreate(
      `/excalidraw/create/folder-id?${new URLSearchParams({
        redirectLink: 'drive#/type/excalidraw'
      })}`
    )

    expect(screen.getByTestId('opened').textContent).toBe(
      '/excalidraw/file-id drive#/type/excalidraw'
    )
  })
})

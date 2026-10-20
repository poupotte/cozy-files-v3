import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'

import { DocumentsCreateMenu } from './DocumentsCreateMenu'
import { useCreateDocument } from './useCreateDocument'
import { getFileTypePage } from '../helpers'

jest.mock('twake-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))
jest.mock('cozy-flags', () => jest.fn(() => true))
jest.mock('./useCreateDocument', () => ({
  useCreateDocument: jest.fn()
}))
jest.mock('../useFileTypeUpload', () => ({
  useFileTypeUpload: () => jest.fn()
}))

const setup = () => {
  const createDocument = jest.fn()
  useCreateDocument.mockReturnValue({ createDocument, isCreating: false })
  render(
    <BreakpointsProvider>
      <DocumentsCreateMenu
        fileType="documents"
        page={{ ...getFileTypePage('documents'), canCreate: () => true }}
        renderButton={({ onClick }) => (
          <button data-testid="create" onClick={onClick} />
        )}
      />
    </BreakpointsProvider>
  )
  fireEvent.click(screen.getByTestId('create'))
  return { createDocument }
}

describe('DocumentsCreateMenu', () => {
  it('creates a blank document of each kind', () => {
    const { createDocument } = setup()

    fireEvent.click(screen.getByTestId('documents-menu-slide'))

    expect(createDocument).toHaveBeenCalledWith('slide')
  })

  it('imports the files picked', () => {
    setup()

    expect(screen.queryByText('toolbar.menu_upload')).toBeInTheDocument()
    expect(
      screen.queryByText('toolbar.menu_onlyOffice.spreadsheet')
    ).toBeInTheDocument()
  })
})

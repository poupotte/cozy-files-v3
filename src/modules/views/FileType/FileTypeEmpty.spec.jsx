import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import { FileTypeEmpty } from './FileTypeEmpty'
import { getFileTypePage } from './helpers'
import { TestI18n } from 'test/components/AppLike'

import { ROUTER_FUTURE_FLAGS } from '@/constants/config'

jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  useClient: () => ({})
}))

jest.mock('./fileTypeFolder', () => ({
  findFileTypeFolder: jest.fn().mockResolvedValue(null)
}))

describe('FileTypeEmpty', () => {
  it('welcomes the user and creates a file of the page type', () => {
    const onCreate = jest.fn()

    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
        <TestI18n>
          <FileTypeEmpty
            fileType="sheet"
            page={getFileTypePage('sheet')}
            onCreate={onCreate}
          />
        </TestI18n>
      </MemoryRouter>
    )

    expect(screen.getByText('Welcome on Twake Spreadsheet')).toBeTruthy()
    expect(screen.getByText('Twake Drive').getAttribute('href')).toBe(
      '/folder/io.cozy.files.root-dir'
    )
    fireEvent.click(screen.getByText('Create a spreadsheet'))
    expect(onCreate).toHaveBeenCalled()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { DocumentsCreateStrip } from './DocumentsCreateStrip'

jest.mock('twake-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))
jest.mock('cozy-flags', () => jest.fn(() => true))

const setup = (props = {}) => {
  const onCreate = jest.fn()
  const onImport = jest.fn()
  render(
    <DocumentsCreateStrip
      createTypes={['text', 'sheet', 'slide']}
      onCreate={onCreate}
      onImport={onImport}
      canCreate={true}
      isCreating={false}
      renderTemplates={type => <div data-testid={`templates-of-${type}`} />}
      {...props}
    />
  )
  return { onCreate, onImport }
}

describe('DocumentsCreateStrip', () => {
  it('creates each kind of document', () => {
    const { onCreate } = setup()

    fireEvent.click(screen.getByTestId('documents-create-sheet'))

    expect(onCreate).toHaveBeenCalledWith('sheet')
  })

  it('imports the files picked as dropped files', () => {
    const { onImport } = setup()
    const report = new File(['content'], 'Report.docx')

    fireEvent.change(screen.getByTestId('documents-import-input'), {
      target: { files: [report] }
    })

    expect(onImport).toHaveBeenCalledWith([
      { file: report, isDirectory: false }
    ])
  })

  it('only offers to import without edition', () => {
    setup({ canCreate: false })

    expect(screen.queryByTestId('documents-create-text')).toBe(null)
    expect(screen.queryByTestId('documents-import')).toBeInTheDocument()
  })

  it('opens the templates of a kind in a menu with its arrow', () => {
    const { onCreate } = setup()

    expect(screen.queryByTestId('documents-templates-menu')).toBe(null)
    fireEvent.click(screen.getByTestId('documents-templates-sheet'))

    expect(onCreate).not.toHaveBeenCalled()
    expect(screen.queryByTestId('templates-of-sheet')).toBeInTheDocument()
    expect(
      screen
        .getByTestId('documents-templates-sheet')
        .getAttribute('aria-expanded')
    ).toBe('true')
  })
})

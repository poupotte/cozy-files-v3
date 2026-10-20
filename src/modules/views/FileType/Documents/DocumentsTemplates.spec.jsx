import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { DocumentsTemplates } from './DocumentsTemplates'
import { useTemplateStrip } from '../UserTemplates/useTemplateStrip'

jest.mock('twake-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))
jest.mock('cozy-flags', () => jest.fn(() => true))
jest.mock('../UserTemplates/useTemplateStrip', () => ({
  useTemplateStrip: jest.fn()
}))
jest.mock('../Office/officeTemplates', () => ({
  getOfficeTemplateIds: () => ['budget'],
  makeOfficeTemplatePreview: () => ({ lines: [], rows: [] })
}))
jest.mock('../Office/OfficePreview', () => ({
  OfficeTemplatePreview: ({ shape }) => <div data-shape={shape} />
}))

describe('DocumentsTemplates', () => {
  it('offers the templates of a type, in the Documents tiles', () => {
    const createFile = jest.fn()
    useTemplateStrip.mockReturnValue({
      createFile,
      isCreating: false,
      templateStripProps: {}
    })
    render(<DocumentsTemplates fileType="sheet" />)

    fireEvent.click(screen.getByTestId('office-template-budget'))

    expect(screen.queryByTestId('office-create-blank')).toBe(null)
    expect(useTemplateStrip).toHaveBeenCalledWith(
      'sheet',
      expect.objectContaining({ home: 'office' }),
      { shape: 'document' }
    )
    expect(createFile).toHaveBeenCalledWith('budget')
  })
})

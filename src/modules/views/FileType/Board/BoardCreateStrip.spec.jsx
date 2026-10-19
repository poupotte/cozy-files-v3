import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { BoardCreateStrip } from './BoardCreateStrip'

jest.mock('twake-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))
jest.mock('./boardTemplates', () => ({
  BOARD_TEMPLATES: [{ id: 'mindmap' }, { id: 'kanban' }],
  makeTemplateElements: () => new Promise(() => {})
}))

describe('BoardCreateStrip', () => {
  it('creates a blank board first, then from each template', () => {
    const onCreate = jest.fn()
    render(<BoardCreateStrip onCreate={onCreate} isCreating={false} />)

    fireEvent.click(screen.getByTestId('board-template-blank'))
    fireEvent.click(screen.getByTestId('board-template-kanban'))

    expect(onCreate.mock.calls).toEqual([[null], ['kanban']])
  })

  it('does not create twice while a board is being created', () => {
    const onCreate = jest.fn()
    render(<BoardCreateStrip onCreate={onCreate} isCreating={true} />)

    fireEvent.click(screen.getByTestId('board-template-mindmap'))

    expect(onCreate).not.toHaveBeenCalled()
  })
})

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

  it('edits a template of the page from its id', () => {
    const onEditTemplate = jest.fn()
    render(
      <BoardCreateStrip
        onCreate={jest.fn()}
        isCreating={false}
        onEditTemplate={onEditTemplate}
      />
    )

    fireEvent.click(screen.getAllByTestId('user-template-edit')[1])

    expect(onEditTemplate).toHaveBeenCalledWith('kanban')
  })

  it('shows the template the user edited in place of the original', () => {
    render(
      <BoardCreateStrip
        onCreate={jest.fn()}
        isCreating={false}
        renderCustomizedTemplate={id =>
          id === 'kanban' ? <li key={id} data-testid="my-kanban" /> : null
        }
      />
    )

    expect(screen.queryByTestId('board-template-kanban')).toBe(null)
    expect(screen.queryByTestId('my-kanban')).toBeInTheDocument()
    expect(screen.queryByTestId('board-template-mindmap')).toBeInTheDocument()
  })

  it('leaves out the templates the user removed, and can show them again', () => {
    const onRemoveTemplate = jest.fn()
    const onRestoreTemplates = jest.fn()
    render(
      <BoardCreateStrip
        onCreate={jest.fn()}
        isCreating={false}
        hiddenTemplateIds={['mindmap']}
        onRemoveTemplate={onRemoveTemplate}
        onRestoreTemplates={onRestoreTemplates}
      />
    )

    expect(screen.queryByTestId('board-template-mindmap')).toBe(null)
    fireEvent.click(screen.getByTestId('user-template-remove'))
    fireEvent.click(screen.getByTestId('templates-restore'))

    expect(onRemoveTemplate).toHaveBeenCalledWith('kanban')
    expect(onRestoreTemplates).toHaveBeenCalled()
  })
})

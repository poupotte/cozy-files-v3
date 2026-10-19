import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { BoardGrid } from './BoardGrid'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))
jest.mock('twake-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))
jest.mock('cozy-ui/transpiled/react/Spinner', () => () => null)
jest.mock('./BoardCard', () => ({
  BoardCard: () => <li data-testid="board-card" />
}))

const files = Array.from({ length: 10 }, (_, index) => ({ _id: `${index}` }))
const result = { lastFetch: 1, hasMore: true, fetchStatus: 'loaded' }

describe('BoardGrid', () => {
  it('shows the latest boards only and links to all of them', () => {
    render(
      <BoardGrid
        result={result}
        files={files}
        actions={[]}
        title="Recently modified"
        limit={8}
        seeAllPath="/type/excalidraw/recent"
      />
    )

    expect(screen.getAllByTestId('board-card')).toHaveLength(8)
    expect(screen.queryByText('table.load_more')).toBe(null)

    fireEvent.click(screen.getByTestId('board-grid-see-all'))

    expect(mockNavigate).toHaveBeenCalledWith('/type/excalidraw/recent')
  })

  it('shows every board without a limit', () => {
    render(
      <BoardGrid result={result} files={files} actions={[]} title={null} />
    )

    expect(screen.getAllByTestId('board-card')).toHaveLength(10)
    expect(screen.queryByTestId('board-grid-see-all')).toBe(null)
    expect(screen.queryByText('table.load_more')).toBeInTheDocument()
  })
})

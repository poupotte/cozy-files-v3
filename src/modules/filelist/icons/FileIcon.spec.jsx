import { render } from '@testing-library/react'
import React from 'react'

import FileIcon from './FileIcon'

jest.mock('cozy-flags', () => () => true)

jest.mock('cozy-ui-plus/dist/FileImageLoader', () => () => (
  <div data-testid="FileImageLoader" />
))

jest.mock('@/modules/views/FileType/Board/BoardPreview', () => ({
  BoardPreview: () => <div data-testid="BoardPreview" />
}))

describe('FileIcon', () => {
  it('should return file image loader when file is image', () => {
    // Given
    const file = { class: 'image' }

    // When
    const { getByTestId } = render(<FileIcon file={file} />)

    // Then
    expect(getByTestId('FileImageLoader')).toBeInTheDocument()
  })

  it('should return file image loader when file is pdf', () => {
    // Given
    const file = { class: 'pdf' }

    // When
    const { getByTestId } = render(<FileIcon file={file} />)

    // Then
    expect(getByTestId('FileImageLoader')).toBeInTheDocument()
  })

  it('should draw a board in the grid view', () => {
    // Given
    const file = { name: 'Plan.excalidraw' }

    // When
    const { queryByTestId } = render(<FileIcon file={file} viewType="grid" />)

    // Then
    expect(queryByTestId('BoardPreview')).toBeInTheDocument()
  })

  it('should keep the board icon in the list view', () => {
    // Given
    const file = { name: 'Plan.excalidraw' }

    // When
    const { queryByTestId } = render(<FileIcon file={file} viewType="list" />)

    // Then
    expect(queryByTestId('BoardPreview')).toBe(null)
  })
})

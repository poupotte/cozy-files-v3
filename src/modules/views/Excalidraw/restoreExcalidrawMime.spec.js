import { restoreExcalidrawMime } from './restoreExcalidrawMime'

import { fetchFileBinary } from '@/modules/views/editor/helpers'

jest.mock('@/modules/views/editor/helpers', () => ({
  fetchFileBinary: jest.fn(async () => ({
    arrayBuffer: async () => 'scene'
  }))
}))

const makeClient = () => {
  const collection = {
    updateFile: jest.fn(async (content, { fileId, contentType }) => ({
      data: { _id: fileId, mime: contentType }
    }))
  }
  return { collection: () => collection, files: collection }
}

describe('restoreExcalidrawMime', () => {
  it('uploads a board that lost its type again, with it', async () => {
    const client = makeClient()

    const board = await restoreExcalidrawMime(client, {
      _id: 'board',
      name: 'Plan.excalidraw',
      mime: 'application/octet-stream'
    })

    expect(client.files.updateFile).toHaveBeenCalledWith('scene', {
      fileId: 'board',
      name: 'Plan.excalidraw',
      contentType: 'application/vnd.excalidraw+json'
    })
    expect(board.mime).toBe('application/vnd.excalidraw+json')
  })

  it('leaves the other files and the typed boards as they are', async () => {
    const client = makeClient()
    const typed = {
      name: 'Plan.excalidraw',
      mime: 'application/vnd.excalidraw+json'
    }
    const report = { name: 'Report.docx', mime: 'application/octet-stream' }

    expect(await restoreExcalidrawMime(client, typed)).toBe(typed)
    expect(await restoreExcalidrawMime(client, report)).toBe(report)
    expect(fetchFileBinary).not.toHaveBeenCalled()
  })
})

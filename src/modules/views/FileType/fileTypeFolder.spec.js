import { ensureFileTypeFolder } from './fileTypeFolder'
import { getFileTypePage } from './helpers'

jest.mock('@/lib/logger', () => ({ warn: jest.fn() }))
jest.mock('cozy-client/dist/models/folder', () => ({
  createFolderWithReference: jest.fn(),
  getReferencedFolder: jest.fn()
}))

const {
  createFolderWithReference,
  getReferencedFolder
} = require('cozy-client/dist/models/folder')

const client = { save: jest.fn(doc => Promise.resolve({ data: doc })) }
const reference = { _type: 'io.cozy.apps', _id: 'io.cozy.apps/drive/slide' }

describe('ensureFileTypeFolder', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reuses the referenced folder, even renamed or moved', async () => {
    const folder = {
      _id: 'moved-folder',
      path: '/Work/My slides',
      metadata: { decorations: { color: '#e53935' } }
    }
    getReferencedFolder.mockResolvedValue(folder)

    await expect(
      ensureFileTypeFolder(client, 'slide', getFileTypePage('slide'))
    ).resolves.toBe(folder)
    expect(getReferencedFolder).toHaveBeenCalledWith(client, reference)
    expect(createFolderWithReference).not.toHaveBeenCalled()
  })

  it('creates the folder at the root when missing', async () => {
    const folder = { _id: 'new-folder', path: '/Presentation' }
    getReferencedFolder.mockResolvedValue(null)
    createFolderWithReference.mockResolvedValue(folder)

    await expect(
      ensureFileTypeFolder(client, 'slide', getFileTypePage('slide'))
    ).resolves.toMatchObject({
      _id: 'new-folder',
      metadata: {
        decorations: {
          color: '#FF9500',
          icon: 'PieChart',
          icon_color: '#FFFFFF'
        }
      }
    })
    expect(createFolderWithReference).toHaveBeenCalledWith(
      client,
      '/Presentation',
      reference
    )
  })

  it('keeps the look the user gave the folder', async () => {
    getReferencedFolder.mockResolvedValue({
      _id: 'folder',
      metadata: { decorations: { color: '#e53935' } }
    })

    await ensureFileTypeFolder(client, 'slide', getFileTypePage('slide'))

    expect(client.save).not.toHaveBeenCalled()
  })

  it('still gives the folder when its look cannot be saved', async () => {
    const folder = { _id: 'folder' }
    getReferencedFolder.mockResolvedValue(folder)
    client.save.mockRejectedValueOnce(new Error('offline'))

    await expect(
      ensureFileTypeFolder(client, 'excalidraw', getFileTypePage('excalidraw'))
    ).resolves.toBe(folder)
  })
})

import { ensureFileTypeFolder } from './fileTypeFolder'
import { getFileTypePage } from './helpers'

jest.mock('cozy-client/dist/models/folder', () => ({
  createFolderWithReference: jest.fn(),
  getReferencedFolder: jest.fn()
}))

const {
  createFolderWithReference,
  getReferencedFolder
} = require('cozy-client/dist/models/folder')

const client = {}
const reference = { _type: 'io.cozy.apps', _id: 'io.cozy.apps/drive/slide' }

describe('ensureFileTypeFolder', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reuses the referenced folder, even renamed or moved', async () => {
    const folder = { _id: 'moved-folder', path: '/Work/My slides' }
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
    ).resolves.toBe(folder)
    expect(createFolderWithReference).toHaveBeenCalledWith(
      client,
      '/Presentation',
      reference
    )
  })
})

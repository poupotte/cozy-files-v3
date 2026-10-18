import { ensureFileTypeFolder, findFileTypeFolder } from './fileTypeFolder'
import { getFileTypePage } from './helpers'

jest.mock('@/lib/logger', () => ({ warn: jest.fn() }))
jest.mock('cozy-client/dist/models/folder', () => ({
  createFolderWithReference: jest.fn()
}))

const { createFolderWithReference } = require('cozy-client/dist/models/folder')

const reference = { _type: 'io.cozy.apps', _id: 'io.cozy.apps/drive/slide' }

const aClient = (referenced = []) => ({
  query: jest.fn().mockResolvedValue({ included: referenced }),
  save: jest.fn(doc => Promise.resolve({ data: doc }))
})

const aFolder = (attributes = {}) => ({
  _id: 'folder',
  type: 'directory',
  path: '/Presentation',
  created_at: '2026-10-01T00:00:00Z',
  ...attributes
})

describe('findFileTypeFolder', () => {
  it('finds the latest folder referenced by the page', async () => {
    const client = aClient([
      aFolder({ _id: 'old', created_at: '2026-01-01T00:00:00Z' }),
      aFolder({ _id: 'new', created_at: '2026-10-01T00:00:00Z' })
    ])

    await expect(findFileTypeFolder(client, 'slide')).resolves.toMatchObject({
      _id: 'new'
    })
    expect(client.query.mock.calls[0][0].referenced).toEqual(reference)
  })

  it('leaves out a folder put in the trash, or in a trashed folder', async () => {
    const client = aClient([
      aFolder({ _id: 'kept', created_at: '2026-01-01T00:00:00Z' }),
      aFolder({ _id: 'trashed', path: '/.cozy_trash/Presentation' }),
      aFolder({ _id: 'inside', path: '/.cozy_trash/Work/Presentation' })
    ])

    await expect(findFileTypeFolder(client, 'slide')).resolves.toMatchObject({
      _id: 'kept'
    })
  })

  it('finds nothing when the only folder is in the trash', async () => {
    const client = aClient([aFolder({ path: '/.cozy_trash/Presentation' })])

    await expect(findFileTypeFolder(client, 'slide')).resolves.toBeNull()
  })
})

describe('ensureFileTypeFolder', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reuses the referenced folder, even renamed or moved', async () => {
    const folder = aFolder({
      _id: 'moved-folder',
      path: '/Work/My slides',
      metadata: { decorations: { color: '#e53935' } }
    })
    const client = aClient([folder])

    await expect(
      ensureFileTypeFolder(client, 'slide', getFileTypePage('slide'))
    ).resolves.toBe(folder)
    expect(createFolderWithReference).not.toHaveBeenCalled()
  })

  it('creates the folder at the root, customized, when missing', async () => {
    const client = aClient([aFolder({ path: '/.cozy_trash/Presentation' })])
    createFolderWithReference.mockResolvedValue(aFolder({ _id: 'new-folder' }))

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
    const client = aClient([
      aFolder({ metadata: { decorations: { color: '#e53935' } } })
    ])

    await ensureFileTypeFolder(client, 'slide', getFileTypePage('slide'))

    expect(client.save).not.toHaveBeenCalled()
  })

  it('still gives the folder when its look cannot be saved', async () => {
    const folder = aFolder()
    const client = aClient([folder])
    client.save.mockRejectedValueOnce(new Error('offline'))

    await expect(
      ensureFileTypeFolder(client, 'excalidraw', getFileTypePage('excalidraw'))
    ).resolves.toBe(folder)
  })
})

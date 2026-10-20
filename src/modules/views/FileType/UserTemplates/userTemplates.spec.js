import { uploadFileWithConflictStrategy } from 'cozy-client/dist/models/file'

import {
  createFromUserTemplate,
  createUserTemplate,
  getReplacedTemplateId,
  getUserTemplateReference,
  isUserTemplate,
  saveAsUserTemplate
} from './userTemplates'

jest.mock('cozy-client/dist/models/file', () => ({
  ...jest.requireActual('cozy-client/dist/models/file'),
  uploadFileWithConflictStrategy: jest.fn(async (client, content, options) => ({
    data: { id: 'new-template', name: options.name, dir_id: options.dirId }
  }))
}))
jest.mock('@/modules/views/Excalidraw/restoreExcalidrawMime', () => ({
  restoreExcalidrawMime: async (client, file) => ({
    ...file,
    mime: 'application/vnd.excalidraw+json'
  })
}))
jest.mock('../Board/boardTemplates', () => ({
  getBoardTemplate: id => (id === 'kanban' ? { id } : null),
  makeTemplateElements: async () => [{ id: 'column' }]
}))
jest.mock('../fileTypeFolder', () => ({
  ensureFileTypeFolder: async () => ({ _id: 'board-dir', path: '/Board' })
}))

const reference = getUserTemplateReference('excalidraw')

const makeClient = ({ takenNames = [] } = {}) => {
  const collection = {
    copy: jest.fn(async (id, name, dirId) => {
      if (takenNames.includes(name)) throw { status: 409 }
      return {
        data: {
          _id: `copy-of-${id}`,
          name,
          dir_id: dirId,
          referenced_by:
            id === 'template'
              ? [{ type: reference._type, id: reference._id }]
              : []
        }
      }
    }),
    statByPath: jest.fn(async () => ({ data: { _id: 'templates-dir' } })),
    createDirectoryByPath: jest.fn(),
    addReferencedBy: jest.fn(),
    removeReferencedBy: jest.fn()
  }
  return {
    collection: () => collection,
    files: collection,
    getStackClient: () => ({ uri: 'https://alice.example' })
  }
}

describe('isUserTemplate', () => {
  it('finds the templates of the type by their reference', () => {
    const template = {
      relationships: {
        referenced_by: { data: [{ type: reference._type, id: reference._id }] }
      }
    }

    expect(isUserTemplate(template, 'excalidraw')).toBe(true)
    expect(isUserTemplate(template, 'text')).toBe(false)
    expect(isUserTemplate({ referenced_by: [] }, 'excalidraw')).toBe(false)
  })
})

describe('saveAsUserTemplate', () => {
  it('copies the file in the Templates folder and references it', async () => {
    const client = makeClient({ takenNames: ['Plan.excalidraw'] })

    const template = await saveAsUserTemplate({
      client,
      file: { _id: 'plan', name: 'Plan.excalidraw' },
      fileType: 'excalidraw',
      page: {},
      t: key => key
    })

    expect(client.files.statByPath).toHaveBeenCalledWith(
      '/Board/UserTemplates.folder'
    )
    expect(template.name).toBe('Plan (2).excalidraw')
    expect(template.dir_id).toBe('templates-dir')
    expect(client.files.addReferencedBy).toHaveBeenCalledWith(template, [
      reference
    ])
  })
})

describe('createFromUserTemplate', () => {
  it('creates a file in the type folder that is not a template', async () => {
    const client = makeClient()

    const file = await createFromUserTemplate({
      client,
      template: { _id: 'template', name: 'Retro.excalidraw' },
      fileType: 'excalidraw',
      page: {}
    })

    expect(file.dir_id).toBe('board-dir')
    expect(file.mime).toBe('application/vnd.excalidraw+json')
    expect(client.files.removeReferencedBy).toHaveBeenCalledWith(file, [
      reference
    ])
  })
})

describe('createUserTemplate', () => {
  it('creates an empty board in the Templates folder and references it', async () => {
    const client = makeClient()

    const template = await createUserTemplate({
      client,
      fileType: 'excalidraw',
      page: {},
      t: key => key
    })

    const [, content, options] = uploadFileWithConflictStrategy.mock.calls[0]
    expect(JSON.parse(content).elements).toEqual([])
    expect(options).toMatchObject({
      name: 'UserTemplates.new_name.excalidraw',
      dirId: 'templates-dir',
      conflictStrategy: 'rename'
    })
    expect(template._id).toBe('new-template')
    expect(client.files.addReferencedBy).toHaveBeenCalledWith(template, [
      reference
    ])
  })
})

describe('editing a template of the page', () => {
  const kanbanReference = {
    _type: 'io.cozy.apps',
    _id: `${reference._id}/kanban`
  }

  it('copies it in the Templates folder, in its place', async () => {
    uploadFileWithConflictStrategy.mockClear()
    const client = makeClient()

    const template = await createUserTemplate({
      client,
      fileType: 'excalidraw',
      page: {},
      t: key => key,
      templateId: 'kanban'
    })

    const [, content, options] = uploadFileWithConflictStrategy.mock.calls[0]
    expect(JSON.parse(content).elements).toEqual([{ id: 'column' }])
    expect(options.name).toBe('BoardHome.templates.kanban.name.excalidraw')
    expect(client.files.addReferencedBy).toHaveBeenCalledWith(template, [
      reference,
      kanbanReference
    ])
  })

  it('finds the template of the page a template takes the place of', () => {
    const toReference = ({ _type, _id }) => ({ type: _type, id: _id })
    const custom = {
      referenced_by: [toReference(reference), toReference(kanbanReference)]
    }
    const own = { referenced_by: [toReference(reference)] }

    expect(getReplacedTemplateId(custom, 'excalidraw')).toBe('kanban')
    expect(getReplacedTemplateId(own, 'excalidraw')).toBe(null)
  })
})

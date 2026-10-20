import {
  fetchHiddenTemplateIds,
  saveHiddenTemplateIds
} from './hiddenTemplates'

const makeClient = settings => ({
  query: jest.fn(async () => ({ data: settings ? [settings] : [] })),
  save: jest.fn()
})

describe('hidden templates', () => {
  it('reads the templates removed from a page', async () => {
    const client = makeClient({
      attributes: { hiddenFileTypeTemplates: { text: ['report'] } }
    })

    expect(await fetchHiddenTemplateIds(client, 'text')).toEqual(['report'])
    expect(await fetchHiddenTemplateIds(client, 'sheet')).toEqual([])
  })

  it('saves them along the other settings and pages', async () => {
    const client = makeClient({
      _id: 'settings',
      attributes: {
        preferredOfficeViewType: 'grid',
        hiddenFileTypeTemplates: { sheet: ['budget'] }
      }
    })

    await saveHiddenTemplateIds(client, 'text', ['report'])

    expect(client.save).toHaveBeenCalledWith({
      _id: 'settings',
      attributes: {
        preferredOfficeViewType: 'grid',
        hiddenFileTypeTemplates: { sheet: ['budget'], text: ['report'] }
      }
    })
  })
})

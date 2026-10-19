import {
  ROOT_TAB_APPS,
  ROOT_TAB_MINE,
  filterRootTab,
  isAppFolder
} from './helpers'

const appReference = id => ({
  relationships: { referenced_by: { data: [{ type: 'io.cozy.apps', id }] } }
})

const notes = {
  _id: 'notes',
  type: 'directory',
  path: '/Notes',
  ...appReference('io.cozy.apps/notes')
}
const photos = { _id: 'photos', type: 'directory', path: '/Photos' }
const projects = { _id: 'projects', type: 'directory', path: '/Projects' }
const video = { _id: 'video', type: 'file', path: '/video.mp4' }

describe('isAppFolder', () => {
  it('finds the folders an app references or the stack creates', () => {
    expect(isAppFolder(notes)).toBe(true)
    expect(isAppFolder(photos)).toBe(true)
  })

  it('leaves out the user folders and the files', () => {
    expect(isAppFolder(projects)).toBe(false)
    expect(isAppFolder({ ...video, ...appReference('io.cozy.apps/x') })).toBe(
      false
    )
  })

  it('leaves out the folders shared with the user', () => {
    expect(
      isAppFolder({
        ...projects,
        relationships: {
          referenced_by: { data: [{ type: 'io.cozy.sharings', id: 's' }] }
        }
      })
    ).toBe(false)
  })
})

describe('filterRootTab', () => {
  const results = [
    { fetchStatus: 'loaded', data: [notes, photos, projects], count: 3 },
    { fetchStatus: 'loaded', data: [video], count: 1 }
  ]

  it('keeps the user folders and files in the user tab', () => {
    const [folders, files] = filterRootTab(results, ROOT_TAB_MINE)

    expect(folders.data).toEqual([projects])
    expect(folders.count).toBe(1)
    expect(files.data).toEqual([video])
  })

  it('keeps the app folders only in the apps tab', () => {
    const [folders, files] = filterRootTab(results, ROOT_TAB_APPS)

    expect(folders.data).toEqual([notes, photos])
    expect(files.data).toEqual([])
    expect(folders.fetchStatus).toBe('loaded')
  })
})

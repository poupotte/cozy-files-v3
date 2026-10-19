import { isCreatedByMe } from './createdByMe'

describe('isCreatedByMe', () => {
  const cozyUrl = 'https://alice.example.com'
  const isOwner = jest.fn(() => false)

  it('keeps the files created on my instance', () => {
    const file = {
      _id: 'mine',
      cozyMetadata: { createdOn: 'https://alice.example.com/' }
    }

    expect(isCreatedByMe(file, { cozyUrl, isOwner })).toBe(true)
  })

  it('keeps them when the stack recorded my instance in http', () => {
    const file = {
      _id: 'mine',
      cozyMetadata: { createdOn: 'http://alice.example.com/' }
    }

    expect(isCreatedByMe(file, { cozyUrl, isOwner })).toBe(true)
  })

  it('leaves out the files created on another instance', () => {
    const file = {
      _id: 'shared-with-me',
      cozyMetadata: { createdOn: 'https://bob.example.com/' }
    }

    expect(isCreatedByMe(file, { cozyUrl, isOwner })).toBe(false)
  })

  it('asks the sharing owner for a file without metadata', () => {
    isOwner.mockReturnValueOnce(true)

    expect(isCreatedByMe({ _id: 'old' }, { cozyUrl, isOwner })).toBe(true)
    expect(isOwner).toHaveBeenCalledWith('old')
  })
})

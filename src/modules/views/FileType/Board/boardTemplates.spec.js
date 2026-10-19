import { BOARD_TEMPLATES, getBoardTemplate } from './boardTemplates'

describe('boardTemplates', () => {
  it('finds a template by id, and none for an unknown one', () => {
    expect(getBoardTemplate('retro')?.id).toBe('retro')
    expect(getBoardTemplate('unknown')).toBe(null)
    expect(getBoardTemplate(null)).toBe(null)
  })

  it('labels every template with translated texts', () => {
    const t = jest.fn(key => key)
    BOARD_TEMPLATES.forEach(template => template.makeSkeleton(t))

    const keys = t.mock.calls.map(([key]) => key)
    expect(keys.every(key => key.startsWith('BoardHome.templates.'))).toBe(true)
  })

  it('links each arrow of the mind map to shapes of the map', () => {
    const elements = getBoardTemplate('mindmap').makeSkeleton(key => key)
    const ids = elements.map(({ id }) => id).filter(Boolean)
    const arrows = elements.filter(({ type }) => type === 'arrow')

    expect(arrows).toHaveLength(4)
    arrows.forEach(({ start, end }) => {
      expect(ids).toContain(start.id)
      expect(ids).toContain(end.id)
    })
  })

  it('keeps the labels of invisible frames visible', () => {
    BOARD_TEMPLATES.flatMap(template => template.makeSkeleton(key => key))
      .filter(
        ({ label, strokeColor }) => label && strokeColor === 'transparent'
      )
      .forEach(({ label }) => {
        expect(label.strokeColor).not.toBe('transparent')
        expect(label.strokeColor).toBeDefined()
      })
  })
})

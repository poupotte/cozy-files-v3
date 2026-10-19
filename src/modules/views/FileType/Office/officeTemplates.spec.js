import fs from 'fs'
import path from 'path'

import { readOfficePreview } from './officePreview'
import {
  applyOfficeTemplate,
  getOfficeTemplateIds,
  hasOfficeTemplate,
  makeOfficeTemplatePreview
} from './officeTemplates'

const t = key => key.split('.').pop()

const readBlank = name =>
  fs.readFileSync(path.join(__dirname, '../../../../assets/onlyOffice', name))

describe('office templates', () => {
  it('offers templates for the three Office pages only', () => {
    expect(getOfficeTemplateIds('text')).toContain('meeting_notes')
    expect(getOfficeTemplateIds('sheet')).toContain('budget')
    expect(getOfficeTemplateIds('slide')).toContain('pitch')
    expect(getOfficeTemplateIds('excalidraw')).toEqual([])
    expect(hasOfficeTemplate('text', 'budget')).toBe(false)
  })

  it('writes a document template in the blank document', () => {
    const content = applyOfficeTemplate(
      readBlank('text.docx'),
      'text',
      'meeting_notes',
      t
    )

    const { lines } = readOfficePreview(content.buffer, 'text')
    expect(lines.slice(0, 3)).toEqual(['title', 'info', 'agenda'])
    expect(lines).toContain('•\ttopic1')
  })

  it('writes a spreadsheet template with its numbers and formulas', () => {
    const content = applyOfficeTemplate(
      readBlank('spreadsheet.xlsx'),
      'sheet',
      'budget',
      t
    )

    const { rows, sheetCount } = readOfficePreview(content.buffer, 'sheet')
    expect(sheetCount).toBe(1)
    expect(rows[0][0]).toBe('title')
    expect(rows[1]).toEqual(['category', 'planned', 'actual', 'difference', ''])
    expect(rows[2].slice(0, 3)).toEqual(['housing', '900', '900'])
  })

  it('writes a presentation template with one slide per part', () => {
    const content = applyOfficeTemplate(
      readBlank('slide.pptx'),
      'slide',
      'pitch',
      t
    )

    const preview = readOfficePreview(content.buffer, 'slide')
    expect(preview.title).toBe('title')
    expect(preview.slideCount).toBe(6)
    expect(preview.thumbnail).toBeNull()
  })

  it('previews a template as the file it creates', () => {
    expect(makeOfficeTemplatePreview('slide', 'kickoff', t)).toEqual({
      thumbnail: null,
      title: 'title',
      slideCount: 6
    })
    expect(makeOfficeTemplatePreview('sheet', 'todo', t).rows[1][0]).toBe(
      'task'
    )
  })
})

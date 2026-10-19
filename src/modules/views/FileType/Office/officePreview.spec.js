import { strToU8, zipSync } from 'fflate'

import { getOfficePreviewKind, readOfficePreview } from './officePreview'

const zip = files =>
  zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, text]) => [
        name,
        new Uint8Array(strToU8(text))
      ])
    )
  ).buffer

describe('getOfficePreviewKind', () => {
  it('reads the Office Open XML files only', () => {
    expect(getOfficePreviewKind({ name: 'Report.docx', size: '10' })).toBe(
      'text'
    )
    expect(getOfficePreviewKind({ name: 'Budget.XLSX', size: '10' })).toBe(
      'sheet'
    )
    expect(getOfficePreviewKind({ name: 'Pitch.pptx', size: '10' })).toBe(
      'slide'
    )
    expect(getOfficePreviewKind({ name: 'Report.odt', size: '10' })).toBe(null)
  })

  it('does not download the big files', () => {
    expect(
      getOfficePreviewKind({ name: 'Big.pptx', size: `${50 * 1024 * 1024}` })
    ).toBe(null)
  })
})

describe('readOfficePreview', () => {
  it('reads the shared texts and the inline texts of a spreadsheet', () => {
    const buffer = zip({
      'xl/workbook.xml':
        '<workbook xmlns="main"><sheets><sheet name="A"/><sheet name="B"/></sheets></workbook>',
      'xl/sharedStrings.xml':
        '<sst xmlns="main"><si><t>Name</t></si><si><r><t>Ag</t></r><r><t>e</t></r></si></sst>',
      'xl/worksheets/sheet1.xml':
        '<worksheet xmlns="main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Ann</t></is></c><c r="B2"><v>42</v></c><c r="Z2"><v>1</v></c></row></sheetData></worksheet>'
    })

    const { rows, sheetCount } = readOfficePreview(buffer, 'sheet')

    expect(sheetCount).toBe(2)
    expect(rows[0].slice(0, 2)).toEqual(['Name', 'Age'])
    expect(rows[1].slice(0, 2)).toEqual(['Ann', '42'])
  })
})

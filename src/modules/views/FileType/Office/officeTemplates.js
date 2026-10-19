import { strFromU8, strToU8 as encode, unzipSync, zipSync } from 'fflate'

// zipSync takes an array of another realm than its own for a folder: the
// encoder may give one (it does in the tests), so the text is copied.
const strToU8 = text => new Uint8Array(encode(text))

// Templates of the Office pages, on the model of the Google Docs, Sheets and
// Slides template galleries. Their texts are in the locales, under
// OfficeHome.templates.<id>; a new file starts from the blank file of its
// type, its content written in it.

const DOC = 'text'
const SHEET = 'sheet'
const SLIDE = 'slide'

// Blocks of a document: title, subtitle, heading, paragraph or bullet,
// with the locale key of their text.
const DOC_TEMPLATES = {
  meeting_notes: [
    ['title', 'title'],
    ['subtitle', 'info'],
    ['heading', 'agenda'],
    ['bullet', 'topic1'],
    ['bullet', 'topic2'],
    ['heading', 'notes'],
    ['paragraph', 'notes_text'],
    ['heading', 'actions'],
    ['bullet', 'action1'],
    ['bullet', 'action2']
  ],
  project_proposal: [
    ['title', 'title'],
    ['subtitle', 'info'],
    ['heading', 'overview'],
    ['paragraph', 'overview_text'],
    ['heading', 'goals'],
    ['bullet', 'goal1'],
    ['bullet', 'goal2'],
    ['heading', 'timeline'],
    ['bullet', 'phase1'],
    ['bullet', 'phase2'],
    ['heading', 'budget'],
    ['paragraph', 'budget_text']
  ],
  letter: [
    ['paragraph', 'sender'],
    ['paragraph', 'date'],
    ['paragraph', 'recipient'],
    ['paragraph', 'greeting'],
    ['paragraph', 'body'],
    ['paragraph', 'closing'],
    ['paragraph', 'signature']
  ],
  resume: [
    ['title', 'title'],
    ['subtitle', 'info'],
    ['heading', 'experience'],
    ['bullet', 'job1'],
    ['bullet', 'job2'],
    ['heading', 'education'],
    ['bullet', 'school'],
    ['heading', 'skills'],
    ['paragraph', 'skills_text']
  ]
}

// Rows of a spreadsheet: a cell is a locale key ('key'), a number, or a
// formula ({ f }). The first row is the title, the second the header.
const SHEET_TEMPLATES = {
  todo: {
    widths: [32, 18, 14, 14],
    rows: [
      ['title'],
      ['task', 'owner', 'due', 'status'],
      ['task1', 'owner1', 'due1', 'todo'],
      ['task2', 'owner2', 'due2', 'doing'],
      ['task3', 'owner1', 'due3', 'done']
    ]
  },
  budget: {
    widths: [24, 14, 14, 14],
    rows: [
      ['title'],
      ['category', 'planned', 'actual', 'difference'],
      ['housing', 900, 900, { f: 'B3-C3' }],
      ['food', 400, 435, { f: 'B4-C4' }],
      ['transport', 120, 95, { f: 'B5-C5' }],
      ['leisure', 150, 180, { f: 'B6-C6' }],
      ['total', { f: 'SUM(B3:B6)' }, { f: 'SUM(C3:C6)' }, { f: 'B7-C7' }]
    ]
  },
  schedule: {
    widths: [10, 16, 16, 16, 16, 16],
    rows: [
      ['title'],
      ['time', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      ['h9', 'event1'],
      ['h10'],
      ['h11', null, 'event2'],
      ['h14', null, null, null, 'event3'],
      ['h16']
    ]
  },
  invoice: {
    widths: [32, 12, 14, 14],
    rows: [
      ['title'],
      ['description', 'quantity', 'unit_price', 'amount'],
      ['item1', 2, 150, { f: 'B3*C3' }],
      ['item2', 1, 480, { f: 'B4*C4' }],
      ['item3', 5, 20, { f: 'B5*C5' }],
      ['total', null, null, { f: 'SUM(D3:D5)' }]
    ]
  }
}

// Slides of a presentation: the first is the title slide, the others a
// title and bullets.
const SLIDE_TEMPLATES = {
  pitch: [
    ['title', 'subtitle'],
    ['problem', 'problem1', 'problem2'],
    ['solution', 'solution1', 'solution2'],
    ['market', 'market1', 'market2'],
    ['team', 'team1', 'team2'],
    ['ask', 'ask1', 'ask2']
  ],
  kickoff: [
    ['title', 'subtitle'],
    ['goals', 'goal1', 'goal2'],
    ['scope', 'scope1', 'scope2'],
    ['timeline', 'phase1', 'phase2', 'phase3'],
    ['roles', 'role1', 'role2'],
    ['next', 'next1', 'next2']
  ],
  team_update: [
    ['title', 'subtitle'],
    ['wins', 'win1', 'win2'],
    ['progress', 'progress1', 'progress2'],
    ['blockers', 'blocker1'],
    ['next_week', 'next1', 'next2']
  ]
}

const TEMPLATES_BY_TYPE = {
  [DOC]: DOC_TEMPLATES,
  [SHEET]: SHEET_TEMPLATES,
  [SLIDE]: SLIDE_TEMPLATES
}

/**
 * Template ids of an Office page type, in the order they are offered.
 * @param {string} fileType - text, sheet or slide
 * @returns {string[]}
 */
export const getOfficeTemplateIds = fileType =>
  Object.keys(TEMPLATES_BY_TYPE[fileType] ?? {})

export const hasOfficeTemplate = (fileType, templateId) =>
  getOfficeTemplateIds(fileType).includes(templateId)

const makeText = (t, templateId, key) =>
  t(`OfficeHome.templates.${templateId}.${key}`)

/**
 * Preview of a template, in the shape the Office tiles show (see
 * officePreview.js), so its tile looks like the file it creates.
 */
export const makeOfficeTemplatePreview = (fileType, templateId, t) => {
  const text = key => makeText(t, templateId, key)
  if (fileType === DOC) {
    return { lines: DOC_TEMPLATES[templateId].map(([, key]) => text(key)) }
  }
  if (fileType === SHEET) {
    const rows = SHEET_TEMPLATES[templateId].rows.slice(0, 6).map(row =>
      Array.from({ length: 5 }, (_, index) => {
        const cell = row[index]
        if (typeof cell === 'string') return text(cell)
        if (typeof cell === 'number') return String(cell)
        return ''
      })
    )
    return { rows, sheetCount: 1 }
  }
  const slides = SLIDE_TEMPLATES[templateId]
  return {
    thumbnail: null,
    title: text(slides[0][0]),
    slideCount: slides.length
  }
}

const escapeXml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Document

const DOC_RUN_PROPERTIES = {
  title: '<w:b/><w:sz w:val="44"/>',
  subtitle: '<w:color w:val="666666"/><w:sz w:val="24"/>',
  heading: '<w:b/><w:color w:val="1F4E79"/><w:sz w:val="28"/>',
  paragraph: '<w:sz w:val="22"/>',
  bullet: '<w:sz w:val="22"/>'
}

const DOC_PARAGRAPH_PROPERTIES = {
  title: '<w:spacing w:after="120"/>',
  subtitle: '<w:spacing w:after="240"/>',
  heading: '<w:spacing w:before="240" w:after="120"/>',
  paragraph: '<w:spacing w:after="160"/>',
  bullet: '<w:spacing w:after="80"/><w:ind w:left="360" w:hanging="360"/>'
}

const makeDocParagraph = (type, text) =>
  `<w:p><w:pPr>${DOC_PARAGRAPH_PROPERTIES[type]}</w:pPr><w:r><w:rPr>${
    DOC_RUN_PROPERTIES[type]
  }</w:rPr><w:t xml:space="preserve">${escapeXml(
    type === 'bullet' ? `•\t${text}` : text
  )}</w:t></w:r></w:p>`

const applyDocTemplate = (entries, templateId, t) => {
  const paragraphs = DOC_TEMPLATES[templateId]
    .map(([type, key]) => makeDocParagraph(type, makeText(t, templateId, key)))
    .join('')
  const document = strFromU8(entries['word/document.xml']).replace(
    /<w:body>[\s\S]*?(<w:sectPr)/,
    `<w:body>${paragraphs}$1`
  )
  return { ...entries, 'word/document.xml': strToU8(document) }
}

// Spreadsheet

// Cell formats: 0 default, 1 header, 2 title, 3 amount
const SHEET_STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><b/><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><b/><sz val="16"/><color rgb="FF1F4E79"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDCE6F1"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0"/></styleSheet>`

const getColumnLetter = index => String.fromCharCode(65 + index)

const makeSheetCell = (cell, reference, style, text) => {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'number') {
    return `<c r="${reference}" s="${style || 3}"><v>${cell}</v></c>`
  }
  if (typeof cell === 'object') {
    return `<c r="${reference}" s="${style || 3}"><f>${escapeXml(cell.f)}</f></c>`
  }
  return `<c r="${reference}" t="inlineStr"${
    style ? ` s="${style}"` : ''
  }><is><t xml:space="preserve">${escapeXml(text(cell))}</t></is></c>`
}

const applySheetTemplate = (entries, templateId, t) => {
  const { widths, rows } = SHEET_TEMPLATES[templateId]
  const text = key => makeText(t, templateId, key)
  const cols = widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    )
    .join('')
  const sheetRows = rows
    .map((row, rowIndex) => {
      const style = rowIndex === 0 ? 2 : rowIndex === 1 ? 1 : 0
      const cells = row
        .map((cell, columnIndex) =>
          makeSheetCell(
            cell,
            `${getColumnLetter(columnIndex)}${rowIndex + 1}`,
            style,
            text
          )
        )
        .join('')
      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${cols}</cols><sheetData>${sheetRows}</sheetData></worksheet>`
  return {
    ...entries,
    'xl/worksheets/sheet1.xml': strToU8(sheet),
    'xl/styles.xml': strToU8(SHEET_STYLES)
  }
}

// Presentation

const makeSlideParagraph = text =>
  `<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${escapeXml(
    text
  )}</a:t></a:r></a:p>`

const makeContentSlide = (title, bullets) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Title 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${makeSlideParagraph(
    title
  )}</p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Content 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${bullets
    .map(makeSlideParagraph)
    .join(
      ''
    )}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`

const CONTENT_SLIDE_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout2.xml"/></Relationships>`

const SLIDE_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'

const applySlideTemplate = (entries, templateId, t) => {
  const text = key => makeText(t, templateId, key)
  const [[titleKey, subtitleKey], ...contentSlides] =
    SLIDE_TEMPLATES[templateId]
  const result = { ...entries }

  // The title slide is the one of the blank file: its two placeholders get
  // the title and the subtitle.
  const emptyParagraph = /<a:p><a:endParaRPr[^>]*\/><\/a:p>/
  result['ppt/slides/slide1.xml'] = strToU8(
    strFromU8(entries['ppt/slides/slide1.xml'])
      .replace(emptyParagraph, makeSlideParagraph(text(titleKey)))
      .replace(emptyParagraph, makeSlideParagraph(text(subtitleKey)))
  )

  let presentation = strFromU8(entries['ppt/presentation.xml'])
  let presentationRels = strFromU8(entries['ppt/_rels/presentation.xml.rels'])
  let contentTypes = strFromU8(entries['[Content_Types].xml'])
  contentSlides.forEach(([titleKey, ...bulletKeys], index) => {
    const number = index + 2
    const relId = `rIdTemplate${number}`
    result[`ppt/slides/slide${number}.xml`] = strToU8(
      makeContentSlide(text(titleKey), bulletKeys.map(text))
    )
    result[`ppt/slides/_rels/slide${number}.xml.rels`] =
      strToU8(CONTENT_SLIDE_RELS)
    presentation = presentation.replace(
      '</p:sldIdLst>',
      `<p:sldId id="${255 + number}" r:id="${relId}"/></p:sldIdLst>`
    )
    presentationRels = presentationRels.replace(
      '</Relationships>',
      `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${number}.xml"/></Relationships>`
    )
    contentTypes = contentTypes.replace(
      '</Types>',
      `<Override PartName="/ppt/slides/slide${number}.xml" ContentType="${SLIDE_CONTENT_TYPE}"/></Types>`
    )
  })
  result['ppt/presentation.xml'] = strToU8(presentation)
  result['ppt/_rels/presentation.xml.rels'] = strToU8(presentationRels)
  result['[Content_Types].xml'] = strToU8(contentTypes)
  result['docProps/app.xml'] = strToU8(
    strFromU8(entries['docProps/app.xml']).replace(
      /<Slides>\d+<\/Slides>/,
      `<Slides>${contentSlides.length + 1}</Slides>`
    )
  )

  // The picture of the blank first slide would not match: the editor saves a
  // new one.
  delete result['docProps/thumbnail.jpeg']
  result['_rels/.rels'] = strToU8(
    strFromU8(entries['_rels/.rels']).replace(
      /<Relationship [^>]*Target="docProps\/thumbnail\.jpeg"\/>/,
      ''
    )
  )
  return result
}

const APPLY_BY_TYPE = {
  [DOC]: applyDocTemplate,
  [SHEET]: applySheetTemplate,
  [SLIDE]: applySlideTemplate
}

/**
 * Writes a template in the blank file of its type.
 * @param {ArrayBuffer} buffer - Content of the blank file
 * @param {string} fileType - text, sheet or slide
 * @param {string} templateId - Id of the template
 * @param {Function} t - Translation function
 * @returns {Uint8Array} Content of the new file
 */
export const applyOfficeTemplate = (buffer, fileType, templateId, t) => {
  const entries = unzipSync(new Uint8Array(buffer))
  return zipSync(APPLY_BY_TYPE[fileType](entries, templateId, t))
}

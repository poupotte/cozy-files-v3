// Starting points of a new board, on the model of the VK Board (Mail.ru)
// templates. Each one is described as Excalidraw element skeletons, turned
// into real elements by convertToExcalidrawElements, so labels are bound to
// their shape and arrows to the shapes they link.
// - id: value of the template search param of the create route
// - makeSkeleton: elements of the template, from the translated labels

const STICKY_YELLOW = '#ffec99'
const STICKY_GREEN = '#b2f2bb'
const STICKY_RED = '#ffc9c9'
const STICKY_BLUE = '#a5d8ff'
const STICKY_VIOLET = '#d0bfff'
// A label takes the stroke color of its frame: give it the default one of
// Excalidraw when the frame has none.
const TEXT_COLOR = '#1e1e1e'

const sticky = (x, y, text, color) => ({
  type: 'rectangle',
  x,
  y,
  width: 180,
  height: 100,
  backgroundColor: color,
  fillStyle: 'solid',
  strokeColor: 'transparent',
  roundness: { type: 3 },
  label: { text, fontSize: 16, strokeColor: TEXT_COLOR }
})

// A label in an invisible frame rather than a free text: the frame sets its
// width, so it is not cut when the drawing font is not loaded yet.
const title = (x, y, text, fontSize = 28, width = 200) => ({
  type: 'rectangle',
  x,
  y,
  width,
  height: fontSize * 1.6,
  strokeColor: 'transparent',
  label: { text, fontSize, textAlign: 'left', strokeColor: TEXT_COLOR }
})

const box = (id, x, y, text, extra = {}) => ({
  id,
  type: 'rectangle',
  x,
  y,
  width: 200,
  height: 80,
  roundness: { type: 3 },
  label: { text, fontSize: 18 },
  ...extra
})

// Arrow from one point to another: the binding alone does not move its end
// to the shape it is bound to.
const arrow = ([x, y], [endX, endY], startId, endId) => ({
  type: 'arrow',
  x,
  y,
  width: endX - x,
  height: endY - y,
  start: { id: startId },
  end: { id: endId }
})

const makeMindMap = t => {
  const branches = [
    { id: 'b1', x: -360, y: -200, color: STICKY_BLUE },
    { id: 'b2', x: 360, y: -200, color: STICKY_GREEN },
    { id: 'b3', x: -360, y: 200, color: STICKY_YELLOW },
    { id: 'b4', x: 360, y: 200, color: STICKY_VIOLET }
  ]
  return [
    {
      id: 'center',
      type: 'ellipse',
      x: -130,
      y: -60,
      width: 260,
      height: 120,
      backgroundColor: STICKY_RED,
      fillStyle: 'solid',
      label: { text: t('BoardHome.templates.mindmap.center'), fontSize: 22 }
    },
    ...branches.map(({ id, x, y, color }, index) =>
      box(
        id,
        x - 100,
        y - 40,
        t(`BoardHome.templates.mindmap.idea`, { n: index + 1 }),
        {
          backgroundColor: color,
          fillStyle: 'solid'
        }
      )
    ),
    // From the edge of the central idea to the side of the branch facing it
    ...branches.map(({ id, x, y }) =>
      arrow(
        [Math.sign(x) * 110, Math.sign(y) * 35],
        [x - Math.sign(x) * 100, y - Math.sign(y) * 20],
        'center',
        id
      )
    )
  ]
}

const makeWorkflow = t => {
  const steps = ['start', 'step1', 'step2', 'end']
  return [
    ...steps.map((step, index) =>
      step === 'start' || step === 'end'
        ? {
            id: step,
            type: 'ellipse',
            x: index * 300,
            y: 0,
            width: 200,
            height: 80,
            backgroundColor: step === 'start' ? STICKY_GREEN : STICKY_RED,
            fillStyle: 'solid',
            label: {
              text: t(`BoardHome.templates.workflow.${step}`),
              fontSize: 18
            }
          }
        : box(step, index * 300, 0, t(`BoardHome.templates.workflow.${step}`), {
            backgroundColor: STICKY_BLUE,
            fillStyle: 'solid'
          })
    ),
    ...steps
      .slice(1)
      .map((step, index) =>
        arrow(
          [index * 300 + 200, 40],
          [index * 300 + 300, 40],
          steps[index],
          step
        )
      )
  ]
}

const makeColumns = (t, prefix, columns) =>
  columns.flatMap(({ key, color, notes }, column) => {
    const x = column * 240
    return [
      {
        type: 'rectangle',
        x: x - 20,
        y: -20,
        width: 220,
        height: 120 + notes * 120,
        backgroundColor: '#f8f9fa',
        fillStyle: 'solid',
        strokeColor: '#ced4da',
        roundness: { type: 3 }
      },
      title(x, 0, t(`BoardHome.templates.${prefix}.${key}`), 20, 180),
      ...Array.from({ length: notes }, (_, index) =>
        sticky(x, 60 + index * 120, '', color)
      )
    ]
  })

const makeRetro = t => [
  title(-20, -90, t('BoardHome.templates.retro.title'), 28, 700),
  ...makeColumns(t, 'retro', [
    { key: 'went_well', color: STICKY_GREEN, notes: 3 },
    { key: 'to_improve', color: STICKY_RED, notes: 3 },
    { key: 'actions', color: STICKY_YELLOW, notes: 3 }
  ])
]

const makeKanban = t => [
  title(-20, -90, t('BoardHome.templates.kanban.title'), 28, 700),
  ...makeColumns(t, 'kanban', [
    { key: 'todo', color: STICKY_YELLOW, notes: 3 },
    { key: 'doing', color: STICKY_BLUE, notes: 2 },
    { key: 'done', color: STICKY_GREEN, notes: 1 }
  ])
]

export const BOARD_TEMPLATES = [
  { id: 'mindmap', makeSkeleton: makeMindMap },
  { id: 'workflow', makeSkeleton: makeWorkflow },
  { id: 'retro', makeSkeleton: makeRetro },
  { id: 'kanban', makeSkeleton: makeKanban }
]

export const getBoardTemplate = templateId =>
  BOARD_TEMPLATES.find(({ id }) => id === templateId) ?? null

// The editor opens a new board at the origin, under its toolbar: move the
// template so its top left corner shows below it.
const TEMPLATE_ORIGIN = { x: 80, y: 140 }

const moveToOrigin = skeleton => {
  const minX = Math.min(...skeleton.map(({ x }) => x))
  const minY = Math.min(...skeleton.map(({ y }) => y))
  return skeleton.map(element => ({
    ...element,
    x: element.x - minX + TEMPLATE_ORIGIN.x,
    y: element.y - minY + TEMPLATE_ORIGIN.y
  }))
}

// Space Excalidraw keeps between a frame and its label
const LABEL_PADDING = 5

// Labels are measured with the font of the page, the drawing font is not
// loaded on the create route: once the drawing font shows, a label wider than
// measured is cut. Give each label the whole width of its frame instead.
const widenLabels = elements => {
  const byId = new Map(elements.map(element => [element.id, element]))
  return elements.map(element => {
    const container =
      element.type === 'text' && element.containerId
        ? byId.get(element.containerId)
        : null
    if (!container) return element
    return {
      ...element,
      x: container.x + LABEL_PADDING,
      width: container.width - LABEL_PADDING * 2
    }
  })
}

/**
 * Elements of a template, ready to be saved in a scene.
 *
 * @param {object} template - One of BOARD_TEMPLATES
 * @param {Function} t - Translation function
 * @returns {Promise<object[]>} Excalidraw elements
 */
export const makeTemplateElements = async (template, t) => {
  await import('@/modules/views/Excalidraw/setupAssetPath')
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')
  return widenLabels(
    convertToExcalidrawElements(moveToOrigin(template.makeSkeleton(t)), {
      regenerateIds: true
    })
  )
}

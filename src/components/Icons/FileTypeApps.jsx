// Bar icons and names of the file type pages (/type/:fileType). The icons are
// the ones of the Home entrypoints declared in manifest.webapp.
import React from 'react'

function SvgDocApp(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path
        fill="#0076ED"
        d="M8.4 0A6.4 6.4 0 0 0 2 6.4v19.2A6.4 6.4 0 0 0 8.4 32h16a6.4 6.4 0 0 0 6.4-6.4V10.4L20.4 0c-4.013 0-4 0 0 0h-12Z"
      />
      <rect width={16} height={2.909} x={8} y={10} fill="#fff" rx={1.455} />
      <rect width={16} height={2.909} x={8} y={15.909} fill="#fff" rx={1.455} />
      <rect width={16} height={2.909} x={8} y={21.818} fill="#fff" rx={1.455} />
      <path
        fill="#0068D2"
        d="M30.8 10.8 20 0v5.586c0 2.88 2.257 5.214 5.04 5.214h5.76Z"
      />
    </svg>
  )
}

function SvgSpreadsheetApp(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path
        fill="#0D9E30"
        d="M8.4 0A6.4 6.4 0 0 0 2 6.4v19.2A6.4 6.4 0 0 0 8.4 32h16a6.4 6.4 0 0 0 6.4-6.4V10.4L20.4 0c-4.013 0-4 0 0 0h-12Z"
      />
      <rect width={6.857} height={6.857} x={8} y={10} fill="#fff" rx={0.457} />
      <rect
        width={6.857}
        height={6.857}
        x={8}
        y={19.143}
        fill="#fff"
        rx={0.457}
      />
      <rect
        width={6.857}
        height={6.857}
        x={17.143}
        y={19.143}
        fill="#fff"
        rx={0.457}
      />
      <rect
        width={6.857}
        height={6.857}
        x={17.143}
        y={10}
        fill="#fff"
        rx={0.457}
      />
      <path
        fill="#008420"
        d="M30.8 10.8 20 0v5.586c0 2.88 2.257 5.214 5.04 5.214h5.76Z"
      />
    </svg>
  )
}

function SvgPresentationApp(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path
        fill="#FF9500"
        d="M8.4 0A6.4 6.4 0 0 0 2 6.4v19.2A6.4 6.4 0 0 0 8.4 32h16a6.4 6.4 0 0 0 6.4-6.4V10.4L20.4 0c-4.013 0-4 0 0 0h-12Z"
      />
      <path
        fill="#DF6310"
        d="M30.8 10.8 20 0v5.586c0 2.88 2.257 5.214 5.04 5.214h5.76Z"
      />
      <path
        fill="#fff"
        d="M15.422 11.157a7.422 7.422 0 1 0 7.421 7.421h-7.421v-7.421Z"
      />
      <path fill="#fff" d="M16.578 10v7.422H24A7.422 7.422 0 0 0 16.578 10Z" />
    </svg>
  )
}

// The bar renders the app name as an icon next to "Twake", 22px high like
// DriveText. Plain text keeps the names readable without outlined glyphs.
const makeAppText = (name, fromColor, toColor) => {
  function AppText({ className, style }) {
    return (
      <span
        className={className}
        style={{
          ...style,
          display: 'inline-block',
          height: 22,
          fontSize: 30,
          fontWeight: 700,
          lineHeight: '22px',
          // The gradient is clipped to the text but only painted in the box:
          // extend the box under the baseline so descenders (the p of
          // Spreadsheet) stay visible, without moving the name.
          boxSizing: 'content-box',
          paddingBottom: 8,
          marginBottom: -8,
          whiteSpace: 'nowrap',
          backgroundImage: `linear-gradient(${fromColor}, ${toColor})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
      >
        {name}
      </span>
    )
  }
  AppText.displayName = `AppText(${name})`
  return AppText
}

export const DocApp = SvgDocApp
export const DocAppText = makeAppText('Doc', '#0076ED', '#0068D2')
export const SpreadsheetApp = SvgSpreadsheetApp
export const SpreadsheetAppText = makeAppText(
  'Spreadsheet',
  '#0D9E30',
  '#008420'
)
export const PresentationApp = SvgPresentationApp
export const PresentationAppText = makeAppText(
  'Presentation',
  '#FF9500',
  '#DF6310'
)

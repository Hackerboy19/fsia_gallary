const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
}

export function ChevronLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  )
}

export function ChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="m9.5 5 7 7-7 7" />
    </svg>
  )
}

export function Close(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function Expand(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
    </svg>
  )
}

export function Pin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

export function Crown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5 6.8 12 12 5l5.2 7L21 8.5 19.2 18H4.8L3 8.5Z" />
    </svg>
  )
}

export function Verified(props) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6L4 15.4l1-2.5-1-2.5 2.2-1.6.9-2.6 2.7.2L12 3Z" />
      <path d="m9.2 12.2 1.9 1.9 3.7-3.9" />
    </svg>
  )
}

export function Camera(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.5A2 2 0 0 1 5 6.5h1.8l1.2-2h8l1.2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </svg>
  )
}

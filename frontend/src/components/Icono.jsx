const shapes = {
  dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.4" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.4" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.4" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.4" /></>,
  patients: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7" r="3.5" /><path d="M17 11a3.5 3.5 0 0 0 0-7m3 16v-1.5a3.5 3.5 0 0 0-2.5-3.35" /></>,
  appointments: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4m9-4v4M3.5 9.5h17m-12 4h2m3 0h2m-7 3.5h2m3 0h2" /></>,
  records: <><path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20V5a1.5 1.5 0 0 1 2-1.5Z" /><path d="M14 3.5v5h5M8 12h7m-7 3.5h7" /></>,
  doctors: <><path d="M8 3.5v4m8-4v4M8 7.5h8v4a5 5 0 0 1-10 0v-4m5 9v4m-4 0h8" /><path d="M5 3.5v2m14-2v2" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1.3A4.7 4.7 0 0 1 7.7 14h2.6a4.7 4.7 0 0 1 4.7 4.7V20" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6m2 3.2a4.7 4.7 0 0 1 3 4.4V20" /></>,
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M4 20a8 8 0 0 1 16 0" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  logout: <><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" /><path d="M14 16l4-4-4-4m4 4H9" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  chevron: <path d="m8 10 4 4 4-4" />,
  arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 9h18m-12 4h2m3 0h2m-7 4h2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  edit: <><path d="m15 5 4 4M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" /></>,
  pause: <><path d="M8 5v14m8-14v14" /></>,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  sol: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  luna: <path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.8 8.8 0 1 0 20.2 15.3Z" />,
  destellos: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.1L12 19l-2-5.9L4 11l6-2.2L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 2l.7 1.7L7.5 4.5l-1.8.7L5 7l-.7-1.8L2.5 4.5l1.8-.8L5 2Z" /></>,
  corazon: <path d="M20.8 8.8c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.3Z" />,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
}

export default function Icono({ name, size = 18, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {shapes[name] ?? shapes.dashboard}
    </svg>
  )
}

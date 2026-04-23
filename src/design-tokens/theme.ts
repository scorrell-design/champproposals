export const tokens = {
  colors: {
    surfaceBase:       '#0F0B2E',
    surfaceElevated:   '#1A1548',
    surfaceGlass:      'rgba(255, 255, 255, 0.08)',
    surfaceCard:       '#FFFFFF',
    surfaceAccentGlow: 'radial-gradient(ellipse at 50% 40%, rgba(255, 107, 53, 0.25) 0%, transparent 60%)',

    borderGlass:       'rgba(255, 255, 255, 0.14)',
    borderCard:        'rgba(15, 11, 46, 0.08)',
    borderStrong:      'rgba(15, 11, 46, 0.18)',

    textPrimary:       '#0F0B2E',
    textSecondary:     '#4A4560',
    textTertiary:      '#8A85A0',
    textOnDark:        '#FFFFFF',
    textOnDarkMuted:   'rgba(255, 255, 255, 0.72)',

    brandBlue:         '#2E8BE8',
    brandBlueDeep:     '#1E5A9E',
    brandBlueBright:   '#3B82F6',
    brandOrange:       '#FF6B35',
    brandOrangeDeep:   '#E04E1A',
    brandYellow:       '#FFC93C',

    accent:            '#3B82F6',
    accentHover:       '#2563EB',
    accentActive:      '#1D4ED8',
    accentSoft:        'rgba(59, 130, 246, 0.12)',

    success:           '#10B981',
    warning:           '#F59E0B',
    error:             '#EF4444',
    info:              '#3B82F6',

    meshBlob1:         'rgba(46, 139, 232, 0.35)',
    meshBlob2:         'rgba(255, 107, 53, 0.22)',
    meshBlob3:         'rgba(30, 90, 158, 0.28)',

    light: {
      surfaceBase:     '#F7F8FC',
      surfaceGlass:    'rgba(255, 255, 255, 0.85)',
      borderGlass:     'rgba(15, 11, 46, 0.08)',
      textPrimary:     '#0F0B2E',
      textSecondary:   '#4A4560',
      textTertiary:    '#8A85A0',
      accent:          '#2E8BE8',
    },
  },

  fonts: {
    body: '"Inter", system-ui, -apple-system, sans-serif',
    mono: '"DM Mono", "SF Mono", monospace',
  },

  radii: {
    input:          '12px',
    cardPrimary:    '24px',
    cardSecondary:  '18px',
    pill:           '999px',
    segmented:      '14px',
  },

  spacing: {
    sectionPadding: '24px',
    inputGroupGap: '16px',
    cardGridGap: '12px',
    labelToInput: '4px',
  },
} as const;

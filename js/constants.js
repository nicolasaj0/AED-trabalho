const VERTEX_RADIUS = 20;

const COLORS = {
  vertex: {
    normal:   '#4B5563',
    source:   '#059669',
    target:   '#DC2626',
    path:     '#EF4444',
    explored: '#60A5FA',
  },
  edge: {
    normal: '#9CA3AF',
    path:   '#EF4444',   // vermelho vivo — visível sobre qualquer fundo
  },
  background: '#F3F4F6',
  grid:       '#E5E7EB',
};

const MODES = {
  PAN:           'PAN',
  ADD_VERTEX:    'ADD_VERTEX',
  ADD_EDGE:      'ADD_EDGE',
  SELECT_SOURCE: 'SELECT_SOURCE',
  SELECT_TARGET: 'SELECT_TARGET',
  DELETE:        'DELETE',
};

const ARROW_SIZE       = 14;
const EDGE_WIDTH       = 1;
const PATH_EDGE_WIDTH  = 5;
const FONT_SIZE        = 13;
const WEIGHT_FONT_SIZE = 11;
const MIN_ZOOM         = 0.05;
const MAX_ZOOM         = 15;
const ZOOM_FACTOR      = 1.15;

const KQL_KEYWORDS = [
  'where', 'project', 'extend', 'summarize', 'join', 'union', 'parse', 'evaluate',
  'take', 'limit', 'top', 'sort', 'order', 'by', 'asc', 'desc', 'distinct', 'count',
  'sum', 'avg', 'min', 'max', 'make_list', 'make_set', 'mv-expand', 'serialize',
  'let', 'set', 'alias', 'restrict', 'access', 'pattern', 'declare', 'query_parameters',
  'with', 'materialize', 'range', 'facet', 'filter', 'search', 'find', 'fork',
  'lookup', 'getschema', 'invoke', 'external_data', 'consume', 'sample', 'sample-distinct',
  'as', 'on', 'and', 'or', 'not', 'in', 'has', 'contains', 'startswith', 'endswith',
  'matches', 'regex', 'between', 'ago', 'now', 'datetime', 'timespan', 'bin', 'floor',
  'render', 'timechart', 'barchart', 'piechart', 'columnchart', 'areachart', 'linechart'
]

const KQL_FUNCTIONS = [
  'count', 'dcount', 'countif', 'dcountif', 'sum', 'sumif', 'avg', 'avgif',
  'min', 'minif', 'max', 'maxif', 'percentile', 'variance', 'stdev',
  'strcat', 'strlen', 'substring', 'tolower', 'toupper', 'trim', 'split',
  'parse_json', 'parse_xml', 'parse_url', 'parse_path', 'extract', 'extract_all',
  'tostring', 'toint', 'tolong', 'todouble', 'todatetime', 'totimespan', 'tobool',
  'isnull', 'isempty', 'isnotnull', 'isnotempty', 'iff', 'case', 'coalesce',
  'format_datetime', 'format_timespan', 'startofday', 'startofweek', 'startofmonth',
  'endofday', 'endofweek', 'endofmonth', 'getyear', 'getmonth', 'dayofweek',
  'pack', 'pack_all', 'bag_keys', 'bag_merge', 'todynamic', 'treepath'
]

interface IHighlightToken {
  text: string
  type: 'keyword' | 'function' | 'operator' | 'string' | 'number' | 'comment' | 'table' | 'default'
}

export const tokenizeKql = (query: string): IHighlightToken[] => {
  const tokens: IHighlightToken[] = []
  const lines = query.split('\n')

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      tokens.push({ text: '\n', type: 'default' })
    }

    if (line.trim().startsWith('//')) {
      tokens.push({ text: line, type: 'comment' })
      return
    }

    const parts = line.split(/(\s+|[|(),=<>!+\-*/\[\]])/g)
    let isFirstWord = true

    parts.forEach((part) => {
      if (!part) return

      if (/^\s+$/.test(part)) {
        tokens.push({ text: part, type: 'default' })
        return
      }

      const lowerPart = part.toLowerCase()

      if (part === '|') {
        tokens.push({ text: part, type: 'operator' })
        isFirstWord = true
        return
      }

      if (['=', '==', '!=', '<', '>', '<=', '>=', '+', '-', '*', '/', '(', ')', '[', ']', ','].includes(part)) {
        tokens.push({ text: part, type: 'operator' })
        return
      }

      if (/^["'].*["']$/.test(part) || /^["']/.test(part)) {
        tokens.push({ text: part, type: 'string' })
        return
      }

      if (/^\d+[hdms]?$/.test(part) || /^\d+\.\d+$/.test(part)) {
        tokens.push({ text: part, type: 'number' })
        return
      }

      if (KQL_KEYWORDS.includes(lowerPart)) {
        tokens.push({ text: part, type: 'keyword' })
        isFirstWord = false
        return
      }

      if (KQL_FUNCTIONS.includes(lowerPart) || /\w+\s*\(/.test(part)) {
        tokens.push({ text: part, type: 'function' })
        return
      }

      if (isFirstWord && /^[A-Z][a-zA-Z0-9_]*$/.test(part)) {
        tokens.push({ text: part, type: 'table' })
        isFirstWord = false
        return
      }

      tokens.push({ text: part, type: 'default' })
      isFirstWord = false
    })
  })

  return tokens
}

export const getTokenColor = (type: IHighlightToken['type'], isDark: boolean): string => {
  const colors = isDark
    ? {
        keyword: '#569cd6',
        function: '#dcdcaa',
        operator: '#d4d4d4',
        string: '#ce9178',
        number: '#b5cea8',
        comment: '#6a9955',
        table: '#4ec9b0',
        default: '#9cdcfe',
      }
    : {
        keyword: '#0000ff',
        function: '#795e26',
        operator: '#000000',
        string: '#a31515',
        number: '#098658',
        comment: '#008000',
        table: '#267f99',
        default: '#001080',
      }

  return colors[type]
}

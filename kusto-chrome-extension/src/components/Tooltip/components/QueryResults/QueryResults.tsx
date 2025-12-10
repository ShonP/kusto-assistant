import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Database } from 'lucide-react'
import {
  ResultsContainer,
  ResultsHeader,
  ResultsTitle,
  RowCount,
  TableWrapper,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from './QueryResults.style'
import type { IQueryResultsProps } from './QueryResults.types'

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export const QueryResults: FC<IQueryResultsProps> = ({ queryResult }) => {
  const { t } = useTranslation()
  const { columns, rows, rowCount } = queryResult

  const displayRows = rows.slice(0, 50)
  const visibleColumns = columns.slice(0, 6)

  return (
    <ResultsContainer>
      <ResultsHeader>
        <ResultsTitle>
          <Database size={12} />
          {t('tooltip.queryResults')}
        </ResultsTitle>
        <RowCount>
          {t('tooltip.showingRows', { 
            showing: displayRows.length, 
            total: rowCount 
          })}
        </RowCount>
      </ResultsHeader>
      <TableWrapper>
        <Table>
          <TableHeader>
            <tr>
              {visibleColumns.map((col) => (
                <TableHeaderCell key={col.name}>{col.name}</TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {displayRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {visibleColumns.map((col) => (
                  <TableCell key={col.name} title={formatCellValue(row[col.name])}>
                    {formatCellValue(row[col.name])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </ResultsContainer>
  )
}

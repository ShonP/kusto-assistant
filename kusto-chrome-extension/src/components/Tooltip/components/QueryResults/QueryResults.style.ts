import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  animation: ${fadeIn} 0.2s ease-out;
`

export const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const ResultsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
`

export const RowCount = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

export const TableWrapper = styled.div`
  max-height: 200px;
  overflow: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSize.xs};
`

export const TableHeader = styled.thead`
  position: sticky;
  inset-block-start: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  z-index: 1;
`

export const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  text-align: start;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  border-block-end: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`

export const TableBody = styled.tbody`
  background-color: ${({ theme }) => theme.colors.background};
`

export const TableRow = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:not(:last-child) {
    border-block-end: 1px solid ${({ theme }) => theme.colors.border};
  }
`

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

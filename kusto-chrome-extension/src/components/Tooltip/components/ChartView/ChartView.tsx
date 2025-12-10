import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import {
  ChartContainer,
  ChartHeader,
  ChartTitle,
  BarChartContainer,
  BarWrapper,
  Bar,
  BarLabel,
  BarValue,
  PieChartContainer,
  PieChart,
  PieLegend,
  LegendItem,
  LegendColor,
  LegendLabel,
  LegendValue,
  LineChartContainer,
  LineChartSvg,
  LineChartPath,
  LineChartArea,
  LineChartDot,
  LineChartLabels,
  LineChartLabel,
} from './ChartView.style'
import type { IChartViewProps } from './ChartView.types'

const CHART_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
]

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const BarChartView: FC<IChartViewProps> = ({ chartData }) => {
  const { labels, values } = chartData
  const maxValue = Math.max(...values)
  const displayData = labels.slice(0, 8).map((label, i) => ({
    label,
    value: values[i],
    height: maxValue > 0 ? (values[i] / maxValue) * 100 : 0,
  }))

  return (
    <BarChartContainer>
      {displayData.map((item, index) => (
        <BarWrapper key={index}>
          <BarValue>{formatNumber(item.value)}</BarValue>
          <Bar $height={item.height} $delay={index * 50} />
          <BarLabel title={item.label}>{item.label}</BarLabel>
        </BarWrapper>
      ))}
    </BarChartContainer>
  )
}

const LineChartView: FC<IChartViewProps> = ({ chartData }) => {
  const { labels, values } = chartData
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue || 1
  const padding = 10
  const width = 280
  const height = 80

  const points = values.map((val, i) => ({
    x: padding + (i / (values.length - 1 || 1)) * (width - padding * 2),
    y: padding + (1 - (val - minValue) / range) * (height - padding * 2),
    value: val,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height} L ${padding} ${height} Z`

  const firstLabel = labels[0] || ''
  const lastLabel = labels[labels.length - 1] || ''

  return (
    <LineChartContainer>
      <LineChartSvg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <LineChartArea d={areaPath} />
        <LineChartPath d={linePath} />
        {points.map((p, i) => (
          <LineChartDot key={i} cx={p.x} cy={p.y} r={3} />
        ))}
      </LineChartSvg>
      <LineChartLabels>
        <LineChartLabel>{firstLabel}</LineChartLabel>
        <LineChartLabel>{formatNumber(maxValue)} max</LineChartLabel>
        <LineChartLabel>{lastLabel}</LineChartLabel>
      </LineChartLabels>
    </LineChartContainer>
  )
}

const PieChartView: FC<IChartViewProps> = ({ chartData }) => {
  const { labels, values } = chartData
  const total = values.reduce((a, b) => a + b, 0)
  
  const displayData = labels.slice(0, 6).map((label, i) => ({
    label,
    value: values[i],
    percentage: total > 0 ? (values[i] / total) * 100 : 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  let currentAngle = 0
  const gradientParts = displayData.map((item) => {
    const start = currentAngle
    currentAngle += (item.percentage / 100) * 360
    return `${item.color} ${start}deg ${currentAngle}deg`
  })

  return (
    <PieChartContainer>
      <PieChart $gradient={gradientParts.join(', ')} />
      <PieLegend>
        {displayData.map((item, index) => (
          <LegendItem key={index}>
            <LegendColor $color={item.color} />
            <LegendLabel title={item.label}>{item.label}</LegendLabel>
            <LegendValue>{item.percentage.toFixed(1)}%</LegendValue>
          </LegendItem>
        ))}
      </PieLegend>
    </PieChartContainer>
  )
}

const getChartConfig = (chartType: string) => {
  switch (chartType) {
    case 'pie':
      return { Icon: PieChartIcon, Component: PieChartView }
    case 'line':
      return { Icon: TrendingUp, Component: LineChartView }
    default:
      return { Icon: BarChart3, Component: BarChartView }
  }
}

export const ChartView: FC<IChartViewProps> = ({ chartData }) => {
  const { t } = useTranslation()
  const { chartType, title } = chartData

  const { Icon: ChartIcon, Component: ChartComponent } = getChartConfig(chartType)

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartIcon size={12} />
        {t('tooltip.visualization')}
        {title && <ChartTitle>— {title}</ChartTitle>}
      </ChartHeader>
      <ChartComponent chartData={chartData} />
    </ChartContainer>
  )
}

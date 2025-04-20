// Types pour les composants Recharts

export interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: any
    dataKey: string
    fill: string
    color: string
    stroke?: string
  }>
  label?: string | number
  separator?: string
  formatter?: (value: any, name: string, props: any) => React.ReactNode
  labelFormatter?: (label: string | number) => React.ReactNode
  itemStyle?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
}

export interface PieChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      name: string
      value: number
      percentage: number
      fill: string
      dataKey: string
    }
    dataKey: string
    fill: string
    color: string
  }>
}

export interface ActiveShapeProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: {
    name: string
    value: number
    percentage: number
  }
  percent: number
  value: number
  index: number
}

export interface ChartEntry {
  date: string
  [key: string]: string | number
}

export interface PieChartEntry {
  name: string
  value: number
  percentage: number
}

// Type pour l'événement au survol d'un secteur de PieChart
export interface PieChartMouseEvent {
  sector: {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
    startAngle: number
    endAngle: number
  }
  name: string
  value: number
}

import React, { PropTypes } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Text,
  Sector,
} from 'recharts'

const OTHER_BUCKET = 'Other'

const renderPieLabel = (section, terms, otherIsSelected, bucketKey) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
    fill,
  } = section
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const r0 = 15
  const r1 = 10
  const r2 = 20
  const x0 = cx + (innerRadius + r0) * cos
  const y0 = cy + (innerRadius + r0) * sin
  const sx = cx + (outerRadius + r1) * cos
  const sy = cy + (outerRadius + r1) * sin
  const mx = cx + (outerRadius + r2) * cos
  const my = cy + (outerRadius + r2) * sin
  const ox = 5
  const ex = mx + (cos >= 0 ? 1 : -1) * ox
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <svg>
      <svg>
        {percent > 0.05 && (
          <text
            x={x0}
            y={y0}
            textAnchor="middle"
            className="PieChart-pct"
            dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        )}
        {percent > 0.025 &&
          terms.indexOf(name) < 0 &&
          !(name === OTHER_BUCKET && otherIsSelected) && (
            <svg>
              <text
                x={ex}
                y={ey}
                textAnchor={textAnchor}
                className="PieChart-label"
                dominantBaseline="central">
                {bucketKey ? bucketKey(name) : name}
              </text>
              <path
                d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                stroke={fill}
                fill="none"
              />
            </svg>
          )}
      </svg>
    </svg>
  )
}

const renderActivePieSectionShape = section => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    name,
  } = section
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const r0 = 10
  const r1 = 20
  const ox = 5
  const sx = cx + (outerRadius + r0) * cos
  const sy = cy + (outerRadius + r0) * sin
  const mx = cx + (outerRadius + r1) * cos
  const my = cy + (outerRadius + r1) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * ox
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        className="PieChart-label active"
        dominantBaseline="central">
        {name}
      </text>
    </g>
  )
}

const PieChartWrapper = props => {
  const {
    field,
    COLORS,
    data,
    activeIndex,
    animate,
    terms,
    otherIsSelected,
    bucketKey,
  } = props
  return (
    <div className="PieChart">
      <ResponsiveContainer>
        <PieChart width={300} height={300}>
          <Pie
            innerRadius={30}
            outerRadius={60}
            paddingAngle={0}
            isAnimationActive={animate}
            animationBegin={100}
            animationDuration={500}
            activeIndex={activeIndex}
            activeShape={renderActivePieSectionShape}
            label={section =>
              renderPieLabel(section, terms, otherIsSelected, bucketKey)
            }
            labelLine={false}
            data={data}
            onClick={props.onSelectPieSection}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
            <Tooltip />
          </Pie>
          <Text>{field}</Text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

PieChartWrapper.propTypes = {
  field: PropTypes.string,
  COLORS: PropTypes.arrayOf(PropTypes.string),
  animate: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
  activeIndex: PropTypes.arrayOf(PropTypes.number),
  terms: PropTypes.arrayOf(PropTypes.string),
  otherIsSelected: PropTypes.bool,
  onSelectPieSection: PropTypes.func,
  bucketKey: PropTypes.func,
}

export default PieChartWrapper

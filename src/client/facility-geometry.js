export const FACILITY_GEOMETRY = Object.freeze({
  stroke: 1,
  corner: 1,
  sideDepth: 2,
  sideOpening: 10,
  sideInner: 6,
  topOpening: 50,
  topInner: 40,
  topDepth: 10 / 3,
})

function number(value) {
  return Number(value.toFixed(3)).toString()
}

function point(x, y) {
  return `${number(x)} ${number(y)}`
}

export function createFacilityPath({ width, height, topNotch = false } = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 2 || height <= FACILITY_GEOMETRY.sideOpening + 2) return ''

  const halfStroke = FACILITY_GEOMETRY.stroke / 2
  const left = halfStroke
  const right = width - halfStroke
  const top = halfStroke
  const bottom = height - halfStroke
  const centerX = width / 2
  const centerY = height / 2
  const points = [point(left + FACILITY_GEOMETRY.corner, top)]

  if (topNotch && width >= FACILITY_GEOMETRY.topOpening + FACILITY_GEOMETRY.corner * 2 + FACILITY_GEOMETRY.stroke) {
    points.push(
      point(centerX - FACILITY_GEOMETRY.topOpening / 2, top),
      point(centerX - FACILITY_GEOMETRY.topInner / 2, top + FACILITY_GEOMETRY.topDepth),
      point(centerX + FACILITY_GEOMETRY.topInner / 2, top + FACILITY_GEOMETRY.topDepth),
      point(centerX + FACILITY_GEOMETRY.topOpening / 2, top),
    )
  }

  points.push(
    point(right - FACILITY_GEOMETRY.corner, top),
    point(right, top + FACILITY_GEOMETRY.corner),
    point(right, centerY - FACILITY_GEOMETRY.sideOpening / 2),
    point(right - FACILITY_GEOMETRY.sideDepth, centerY - FACILITY_GEOMETRY.sideInner / 2),
    point(right - FACILITY_GEOMETRY.sideDepth, centerY + FACILITY_GEOMETRY.sideInner / 2),
    point(right, centerY + FACILITY_GEOMETRY.sideOpening / 2),
    point(right, bottom - FACILITY_GEOMETRY.corner),
    point(right - FACILITY_GEOMETRY.corner, bottom),
    point(left + FACILITY_GEOMETRY.corner, bottom),
    point(left, bottom - FACILITY_GEOMETRY.corner),
    point(left, centerY + FACILITY_GEOMETRY.sideOpening / 2),
    point(left + FACILITY_GEOMETRY.sideDepth, centerY + FACILITY_GEOMETRY.sideInner / 2),
    point(left + FACILITY_GEOMETRY.sideDepth, centerY - FACILITY_GEOMETRY.sideInner / 2),
    point(left, centerY - FACILITY_GEOMETRY.sideOpening / 2),
    point(left, top + FACILITY_GEOMETRY.corner),
  )

  return `M ${points.join(' L ')} Z`
}

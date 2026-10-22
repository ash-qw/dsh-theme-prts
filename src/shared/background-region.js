// Coordinates are fractions of the oriented, stored image.
export function validBackgroundRegion(region) {
  return region === null || (region && typeof region === 'object' && !Array.isArray(region)
    && ['x','y','width','height'].every(key => Number.isFinite(region[key]))
    && region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0
    && region.x + region.width <= 1.000001 && region.y + region.height <= 1.000001)
}
export function backgroundPlacement(imageWidth, imageHeight, width, height, region = null) {
  if (![imageWidth,imageHeight,width,height].every(v => Number.isFinite(v) && v > 0)) return {x:0,y:0,width:0,height:0,clipped:false}
  const scale = Math.max(width / imageWidth, height / imageHeight)
  const w = imageWidth * scale, h = imageHeight * scale
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v))
  const axis = (size, viewport, start, length, vertical = false) => {
    const centered = (viewport-size)/2
    if (!region) return centered
    if (length*size > viewport) return clamp(vertical ? -start*size : viewport/2-(start+length/2)*size,viewport-size,0)
    return clamp(centered, Math.max(viewport-size,-start*size), Math.min(0,viewport-(start+length)*size))
  }
  return {x:axis(w,width,region?.x,region?.width),y:axis(h,height,region?.y,region?.height,true),width:w,height:h,
    clipped:Boolean(region && (region.width*w > width+.01 || region.height*h > height+.01))}
}

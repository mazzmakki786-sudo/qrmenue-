let _id = 0

export function uid(name: string) {
  _id++
  return `${name}-${_id}`
}

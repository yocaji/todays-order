import { describe, it, expect } from 'vitest'
import { parseParticipants } from '../parseParticipants'

describe('parseParticipants', () => {
  it('カンマ区切りで分割される', () => {
    const result = parseParticipants('Alice,Bob,Charlie,David')
    expect(result).toEqual(['Alice', 'Bob', 'Charlie', 'David'])
  })

  it('各要素の前後空白がトリムされる', () => {
    const result = parseParticipants(' Alice , Bob , Charlie , David ')
    expect(result).toEqual(['Alice', 'Bob', 'Charlie', 'David'])
  })

  it('空文字列が除外される', () => {
    const result = parseParticipants('Alice,,Bob, ,Charlie')
    expect(result).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('undefinedの場合は空配列を返す', () => {
    const result = parseParticipants(undefined)
    expect(result).toEqual([])
  })

  it('空文字列の場合は空配列を返す', () => {
    const result = parseParticipants('')
    expect(result).toEqual([])
  })

  it('スペースのみの参加者は除外される', () => {
    const result = parseParticipants('Alice, ,Bob, Charlie ,,David')
    expect(result).toEqual(['Alice', 'Bob', 'Charlie', 'David'])
  })
})

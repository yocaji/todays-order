import { describe, it, expect } from 'vitest'
import { shuffle } from '../shuffle'

describe('shuffle (Fisher-Yates)', () => {
  it('入力配列と出力配列の長さが同じ', () => {
    const input = ['Alice', 'Bob', 'Charlie', 'David']
    const result = shuffle(input)
    expect(result).toHaveLength(input.length)
  })

  it('入力配列の全要素が出力配列に含まれる', () => {
    const input = ['Alice', 'Bob', 'Charlie', 'David']
    const result = shuffle(input)
    expect(result.sort()).toEqual(input.sort())
  })

  it('元の配列は変更されない（イミュータブル）', () => {
    const input = ['Alice', 'Bob', 'Charlie', 'David']
    const originalCopy = [...input]
    shuffle(input)
    expect(input).toEqual(originalCopy)
  })

  it('空配列の場合は空配列を返す', () => {
    const result = shuffle([])
    expect(result).toEqual([])
  })

  it('1要素の場合はその要素を返す', () => {
    const result = shuffle(['Alice'])
    expect(result).toEqual(['Alice'])
  })

  it('複数回実行で異なる順序が生成されうる（決定論的でない）', () => {
    const input = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']
    const results = new Set<string>()
    
    // 100回シャッフルして、少なくとも2つ以上の異なる結果が出ることを確認
    for (let i = 0; i < 100; i++) {
      results.add(JSON.stringify(shuffle(input)))
    }
    
    expect(results.size).toBeGreaterThan(1)
  })
})

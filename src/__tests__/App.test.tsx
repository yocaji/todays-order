import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

// 環境変数のモック
const mockEnv = (participants: string | undefined) => {
  vi.stubEnv('VITE_PARTICIPANTS', participants as string)
}

describe('App', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  describe('参加者の読み込み', () => {
    it('タイトル「今日の順番」が表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('今日の順番')
    })

    it('参加者一覧が表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByText('参加者: Alice / Bob / Charlie / David')).toBeInTheDocument()
    })

    it('「順番を決める」ボタンが表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByRole('button', { name: '順番を決める' })).toBeInTheDocument()
    })

    it('環境変数が設定されている場合、ボタンが活性化されている', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByRole('button', { name: '順番を決める' })).not.toBeDisabled()
    })
  })

  describe('環境変数未設定時', () => {
    it('エラーメッセージが表示される', () => {
      mockEnv(undefined)
      render(<App />)
      expect(screen.getByText('環境変数 VITE_PARTICIPANTS が設定されていません。')).toBeInTheDocument()
    })

    it('ボタンが非活性である', () => {
      mockEnv(undefined)
      render(<App />)
      expect(screen.getByRole('button', { name: '順番を決める' })).toBeDisabled()
    })
  })

  describe('空文字の場合', () => {
    it('エラーメッセージが表示される', () => {
      mockEnv('')
      render(<App />)
      expect(screen.getByText('環境変数 VITE_PARTICIPANTS が設定されていません。')).toBeInTheDocument()
    })

    it('ボタンが非活性である', () => {
      mockEnv('')
      render(<App />)
      expect(screen.getByRole('button', { name: '順番を決める' })).toBeDisabled()
    })
  })

  describe('シャッフル機能', () => {
    it('初期状態では「まだ順番が決まっていません。」と表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByText('まだ順番が決まっていません。')).toBeInTheDocument()
    })

    it('ボタンクリック後に「今日の発表順:」と表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      fireEvent.click(screen.getByRole('button', { name: '順番を決める' }))
      
      expect(screen.getByText('今日の発表順:')).toBeInTheDocument()
    })

    it('ボタンクリック後に全参加者が番号付きリストで表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      fireEvent.click(screen.getByRole('button', { name: '順番を決める' }))
      
      const list = screen.getByRole('list')
      expect(list.tagName).toBe('OL')
      
      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(4)
      
      const names = items.map(item => item.textContent)
      expect(names.sort()).toEqual(['Alice', 'Bob', 'Charlie', 'David'].sort())
    })

    it('複数回シャッフルできる', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      const button = screen.getByRole('button', { name: '順番を決める' })
      
      fireEvent.click(button)
      const firstResult = screen.getAllByRole('listitem').map(item => item.textContent)
      
      fireEvent.click(button)
      const secondResult = screen.getAllByRole('listitem').map(item => item.textContent)
      
      // 結果が存在することを確認（順序は異なる可能性がある）
      expect(firstResult).toHaveLength(4)
      expect(secondResult).toHaveLength(4)
    })
  })
})

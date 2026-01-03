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

    it('各参加者に「出席」ボタンが表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getAllByRole('button', { name: '出席' })).toHaveLength(4)
    })

    it('「順番を決める」ボタンが表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByRole('button', { name: '順番を決める' })).toBeInTheDocument()
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

  describe('出席登録機能', () => {
    it('初期状態では全員が未出席で「出席者: 0人」と表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByText('出席者: 0人')).toBeInTheDocument()
    })

    it('初期状態では順番を決めるボタンが非活性', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByRole('button', { name: '順番を決める' })).toBeDisabled()
    })

    it('出席ボタンをクリックすると出席状態になる', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      const aliceAttendButton = screen.getAllByRole('button', { name: '出席' })[0]
      fireEvent.click(aliceAttendButton)
      
      expect(screen.getByText('出席者: 1人')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '✓ 出席' })).toBeInTheDocument()
    })

    it('出席状態のボタンを再クリックすると未出席になる', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      const aliceAttendButton = screen.getAllByRole('button', { name: '出席' })[0]
      fireEvent.click(aliceAttendButton)
      
      const aliceAttendedButton = screen.getByRole('button', { name: '✓ 出席' })
      fireEvent.click(aliceAttendedButton)
      
      expect(screen.getByText('出席者: 0人')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '✓ 出席' })).not.toBeInTheDocument()
    })

    it('出席者がいると順番を決めるボタンが活性化される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      const aliceAttendButton = screen.getAllByRole('button', { name: '出席' })[0]
      fireEvent.click(aliceAttendButton)
      
      expect(screen.getByRole('button', { name: '順番を決める' })).not.toBeDisabled()
    })
  })

  describe('シャッフル機能', () => {
    it('初期状態では「まだ順番が決まっていません。」と表示される', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      expect(screen.getByText('まだ順番が決まっていません。')).toBeInTheDocument()
    })

    it('出席者のみがシャッフル対象になる', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      // AliceとBobを出席状態にする
      const attendButtons = screen.getAllByRole('button', { name: '出席' })
      fireEvent.click(attendButtons[0]) // Alice
      fireEvent.click(attendButtons[1]) // Bob
      
      fireEvent.click(screen.getByRole('button', { name: '順番を決める' }))
      
      expect(screen.getByText('今日の発表順:')).toBeInTheDocument()
      
      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(2)
      
      const names = items.map(item => item.textContent)
      expect(names.sort()).toEqual(['Alice', 'Bob'].sort())
    })

    it('複数回シャッフルできる', () => {
      mockEnv('Alice,Bob,Charlie,David')
      render(<App />)
      
      // 全員出席にする
      const attendButtons = screen.getAllByRole('button', { name: '出席' })
      attendButtons.forEach(btn => fireEvent.click(btn))
      
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

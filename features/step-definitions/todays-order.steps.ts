import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

// 環境変数が設定された状態でページを開く（デフォルトの.env.localを使用）
Given('環境変数VITE_PARTICIPANTSに{string}が設定されている', async ({ page }) => {
  // .env.localに設定された値を使用するため、特別な処理は不要
  // このステップは前提条件の文書化として機能
})

Given('参加者{string}でページを開いている', async ({ page }) => {
  await page.goto('/')
})

Given('「まだ順番が決まっていません。」と表示されている', async ({ page }) => {
  await expect(page.getByText('まだ順番が決まっていません。')).toBeVisible()
})

Given('シャッフル結果が表示されている状態', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '順番を決める' }).click()
  await expect(page.getByText('今日の発表順:')).toBeVisible()
})

When('ページを開く', async ({ page }) => {
  await page.goto('/')
})

When('「順番を決める」ボタンをクリックする', async ({ page }) => {
  await page.getByRole('button', { name: '順番を決める' }).click()
})

When('「順番を決める」ボタンを再度クリックする', async ({ page }) => {
  await page.getByRole('button', { name: '順番を決める' }).click()
})

// 正規表現を使用してスラッシュを含むテキストをマッチ
Then(/^「参加者: Alice \/ Bob \/ Charlie \/ David」と表示される$/, async ({ page }) => {
  await expect(page.getByText('参加者: Alice / Bob / Charlie / David')).toBeVisible()
})

Then('「順番を決める」ボタンが活性化されている', async ({ page }) => {
  await expect(page.getByRole('button', { name: '順番を決める' })).toBeEnabled()
})

Then('「今日の発表順:」と表示される', async ({ page }) => {
  await expect(page.getByText('今日の発表順:')).toBeVisible()
})

Then('4人の名前が番号付きリストで表示される', async ({ page }) => {
  const list = page.locator('ol')
  await expect(list).toBeVisible()
  
  const items = page.locator('ol > li')
  await expect(items).toHaveCount(4)
  
  // 全参加者が含まれていることを確認
  const names = ['Alice', 'Bob', 'Charlie', 'David']
  for (const name of names) {
    await expect(page.locator('ol').getByText(name)).toBeVisible()
  }
})

Then('新しい順番で結果が更新される', async ({ page }) => {
  // 結果が表示されていることを確認
  await expect(page.getByText('今日の発表順:')).toBeVisible()
  const items = page.locator('ol > li')
  await expect(items).toHaveCount(4)
})

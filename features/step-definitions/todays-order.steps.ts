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
  // AliceとBobを出席状態にする
  await page.locator('.attendance-row').filter({ hasText: 'Alice' }).getByRole('button').click()
  await page.locator('.attendance-row').filter({ hasText: 'Bob' }).getByRole('button').click()
  await page.getByRole('button', { name: '順番を決める' }).click()
  await expect(page.getByText('今日の発表順:')).toBeVisible()
})

Given('Aliceが出席状態である', async ({ page }) => {
  await page.goto('/')
  await page.locator('.attendance-row').filter({ hasText: 'Alice' }).getByRole('button').click()
})

Given('AliceとBobが出席状態である', async ({ page }) => {
  await page.goto('/')
  await page.locator('.attendance-row').filter({ hasText: 'Alice' }).getByRole('button').click()
  await page.locator('.attendance-row').filter({ hasText: 'Bob' }).getByRole('button').click()
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

When('Aliceの「出席」ボタンをクリックする', async ({ page }) => {
  await page.locator('.attendance-row').filter({ hasText: 'Alice' }).getByRole('button').click()
})

// 正規表現を使用してスラッシュを含むテキストをマッチ
Then(/^「参加者: Alice \/ Bob \/ Charlie \/ David」と表示される$/, async ({ page }) => {
  await expect(page.getByText('参加者: Alice / Bob / Charlie / David')).toBeVisible()
})

Then('各参加者に「出席」ボタンが表示されている', async ({ page }) => {
  const attendanceButtons = page.locator('.attendance-btn')
  await expect(attendanceButtons).toHaveCount(4)
})

Then('「出席者: {int}人」と表示される', async ({ page }, count: number) => {
  await expect(page.getByText(`出席者: ${count}人`)).toBeVisible()
})

Then('「順番を決める」ボタンが活性化されている', async ({ page }) => {
  await expect(page.getByRole('button', { name: '順番を決める' })).toBeEnabled()
})

Then('「順番を決める」ボタンが非活性である', async ({ page }) => {
  await expect(page.getByRole('button', { name: '順番を決める' })).toBeDisabled()
})

Then('Aliceの出席ボタンが出席状態になる', async ({ page }) => {
  const aliceRow = page.locator('.attendance-row').filter({ hasText: 'Alice' })
  await expect(aliceRow.getByRole('button')).toHaveText('✓ 出席')
  await expect(aliceRow.getByRole('button')).toHaveClass(/attended/)
})

Then('Aliceの出席ボタンが未出席状態になる', async ({ page }) => {
  const aliceRow = page.locator('.attendance-row').filter({ hasText: 'Alice' })
  await expect(aliceRow.getByRole('button')).toHaveText('出席')
  await expect(aliceRow.getByRole('button')).not.toHaveClass(/attended/)
})

Then('「今日の発表順:」と表示される', async ({ page }) => {
  await expect(page.getByText('今日の発表順:')).toBeVisible()
})

Then('{int}人の名前が番号付きリストで表示される', async ({ page }, count: number) => {
  const list = page.locator('ol')
  await expect(list).toBeVisible()
  
  const items = page.locator('ol > li')
  await expect(items).toHaveCount(count)
})

Then('リストにはAliceとBobのみが含まれる', async ({ page }) => {
  const items = page.locator('ol > li')
  const texts = await items.allTextContents()
  expect(texts.sort()).toEqual(['Alice', 'Bob'].sort())
})

Then('新しい順番で結果が更新される', async ({ page }) => {
  // 結果が表示されていることを確認
  await expect(page.getByText('今日の発表順:')).toBeVisible()
  const items = page.locator('ol > li')
  await expect(items).toHaveCount(2)
})

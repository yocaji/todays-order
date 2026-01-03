/**
 * 環境変数からカンマ区切りの参加者名をパースする
 * - 先頭と末尾の空白をトリム
 * - 空文字列は除外
 */
export function parseParticipants(value: string | undefined): readonly string[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
}

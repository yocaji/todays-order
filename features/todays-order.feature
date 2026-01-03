Feature: 今日の順番アプリ

  # 注: 環境変数の動的変更が必要なシナリオは単体テストでカバー
  # E2Eテストでは.env.localの設定（Alice,Bob,Charlie,David）を使用

  Scenario: 環境変数から参加者を正常に読み込む
    Given 環境変数VITE_PARTICIPANTSに"Alice,Bob,Charlie,David"が設定されている
    When ページを開く
    Then 「参加者: Alice / Bob / Charlie / David」と表示される
    And 「順番を決める」ボタンが活性化されている

  Scenario: ボタンクリックで順番をシャッフルする
    Given 参加者"Alice,Bob,Charlie,David"でページを開いている
    And 「まだ順番が決まっていません。」と表示されている
    When 「順番を決める」ボタンをクリックする
    Then 「今日の発表順:」と表示される
    And 4人の名前が番号付きリストで表示される

  Scenario: 複数回シャッフルできる
    Given シャッフル結果が表示されている状態
    When 「順番を決める」ボタンを再度クリックする
    Then 新しい順番で結果が更新される

  # 以下のシナリオは環境変数の動的変更が必要なため、単体テストでカバー
  # - VITE_PARTICIPANTS未設定時にエラーメッセージを表示
  # - 空文字やスペースのみの参加者を除外する
  # - 参加者が空の場合ボタンが押せない

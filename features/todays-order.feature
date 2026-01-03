Feature: 今日の順番アプリ

  # 注: 環境変数の動的変更が必要なシナリオは単体テストでカバー
  # E2Eテストでは.env.localの設定（Alice,Bob,Charlie,David）を使用

  Scenario: 環境変数から参加者を正常に読み込む
    Given 環境変数VITE_PARTICIPANTSに"Alice,Bob,Charlie,David"が設定されている
    When ページを開く
    Then 「参加者: Alice / Bob / Charlie / David」と表示される
    And 各参加者に「出席」ボタンが表示されている

  Scenario: 初期状態では全員が未出席で順番を決めるボタンが非活性
    Given 参加者"Alice,Bob,Charlie,David"でページを開いている
    Then 「出席者: 0人」と表示される
    And 「順番を決める」ボタンが非活性である

  Scenario: 出席ボタンをクリックすると出席状態になる
    Given 参加者"Alice,Bob,Charlie,David"でページを開いている
    When Aliceの「出席」ボタンをクリックする
    Then Aliceの出席ボタンが出席状態になる
    And 「出席者: 1人」と表示される
    And 「順番を決める」ボタンが活性化されている

  Scenario: 出席状態のボタンを再クリックすると未出席になる
    Given Aliceが出席状態である
    When Aliceの「出席」ボタンをクリックする
    Then Aliceの出席ボタンが未出席状態になる
    And 「出席者: 0人」と表示される

  Scenario: 出席者のみがシャッフル対象になる
    Given AliceとBobが出席状態である
    And 「まだ順番が決まっていません。」と表示されている
    When 「順番を決める」ボタンをクリックする
    Then 「今日の発表順:」と表示される
    And 2人の名前が番号付きリストで表示される
    And リストにはAliceとBobのみが含まれる

  Scenario: 複数回シャッフルできる
    Given シャッフル結果が表示されている状態
    When 「順番を決める」ボタンを再度クリックする
    Then 新しい順番で結果が更新される

  # 以下のシナリオは環境変数の動的変更が必要なため、単体テストでカバー
  # - VITE_PARTICIPANTS未設定時にエラーメッセージを表示
  # - 空文字やスペースのみの参加者を除外する
  # - 参加者が空の場合ボタンが押せない

Feature: 今日の順番アプリ

  Scenario: 環境変数から参加者を正常に読み込む
    Given 環境変数VITE_PARTICIPANTSに"Alice,Bob,Charlie,David"が設定されている
    When ページを開く
    Then 「参加者: Alice / Bob / Charlie / David」と表示される
    And 「順番を決める」ボタンが活性化されている

  Scenario: VITE_PARTICIPANTS未設定時にエラーメッセージを表示
    Given 環境変数VITE_PARTICIPANTSが未設定である
    When ページを開く
    Then 「環境変数 VITE_PARTICIPANTS が設定されていません。」とエラー表示される
    And 「順番を決める」ボタンが非活性である

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

  Scenario: 空文字やスペースのみの参加者を除外する
    Given 環境変数VITE_PARTICIPANTSに"Alice, ,Bob, Charlie ,,David"が設定されている
    When ページを開く
    Then 「参加者: Alice / Bob / Charlie / David」と表示される

  Scenario: 参加者が空の場合ボタンが押せない
    Given 環境変数VITE_PARTICIPANTSが空文字である
    When ページを開く
    Then 「順番を決める」ボタンがdisabled属性を持つ

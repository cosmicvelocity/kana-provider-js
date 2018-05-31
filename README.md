# kana-provider
テキスト入力要素への入力に対して IME の変換を検出し、変換テキストのカナを提供します。

同様のライブラリに jquery.autoKana がありますが、タイマーを利用して変換状況を検出しているのに対して、こちらはキー入力のイベントをベースにしてカナの抽出を行っている違いがあります。

テキスト入力時のキーストロークに基づいてカナを抽出するため、
クリップボードのペースト動作や予測変換に対しては正常にカナを生成することができません。

また、ブラウザの種類・バージョンごとに細かい挙動の違いがあるため、
確実にカナが得られるわけではありません。その点ご注意ください。

## 仕組み
input type="text" や textarea で変換時の内容を得る場合、keyup, input, compositionupdate イベントなどで変換中の入力内容を得ることができます。

例えば、「東京都」の場合、下記のような順番で入力内容が取れます。
※ローマ字入力の場合。

- ｔ
- と
- とう
- とうｋ
- とうｋｙ
- とうきょ
- とうきょう
- とうきょうｔ
- とうきょうと
- 東京都

この場合、最後にひらがなで入力された「とうきょうと」がカナと想定できるため、これをカナとして取得しています。カナ入力の場合も同様です。
これが各ブラウザ・バージョンごとに入力内容が取れるイベントが異なったり、変換中の編集に対しての扱いが異なるため、ブラウザごとの実装を用意して吸収する形をとっています。

現在、対応できているものは下記のような操作です。

- 変換結果のカナを取得
- 文節変換を踏まえたカナの取得  
  「とうきょう」「東京」「と」「都」といった感じに、変換後の確定キーを押さずに次の分を入力した場合。
- 変換中にテキストを編集した場合に結果が崩れない  
  「とうきょうと」と入力した後で、変換モード中に「とう」を削除して「京都」としたような場合。
- 予測変換が発生した可能性がある事の検出（ブラウザによる）

## インストール
npm を使っている場合は、下記のように導入できます。

```
npm i cosmicvelocity-kana-provider
```

## 使い方

```javascript
import KanaProviderFactory from 'cosmicvelocity-kana-provider';

document.addEventListener('DOMContentLoaded', function () {
    var nameElement = document.getElementById('name');
    var kanaElement = document.getElementById('kana');
    var provider = KanaProviderFactory.getProvider(nameElement, {debug: true});

    provider
        .on('error', function (type, message) {
            console.log('error', type, message);
        })
        .on('clear', function () {
            kanaElement.value = '';
        })
        .on('update', function (kana) {
            kanaElement.value = kanaElement.value + kana;
        });
});
```

## KanaProviderFactory
各ブラウザごとに適した KanaProvider の実装を提供します。

### メソッド
KanaProviderFactory が提供するメソッドは下記のとおり。

#### getProvider()
ブラウザごとに適した KanaProvider を実装したオブジェクトを返します。

##### パラメーター
- **element (HtmlInputElement)**:
    入力を監視する要素
- **[options={}] ({})**:
    オプション

##### オプション
- **kanaPattern=/[\u3041-\u3093\u30fc]/ (RegExp)**:
    入力テキストに対して、カナとして判定するパターンを表します。
- **katakanaPattern=/[\u3041-\u3093\u309d\u309e]/ (RegExp)**:
    カタカナ変換オプションを指定する場合、変換の対象とするひらがなのパターンを表します。
- **onCleared=true (boolean)**:
    clear イベントを発生させる場合は true, それ以外は false を指定します。
- **debug=false (boolean)**:
    デバッグログを出力する場合は true, それ以外は false を指定します。
- **stopOnError=true (boolean)**:
    変換中にカナを得られないようなエラーが発生した場合、update イベントを発生させたくない時は true を指定します。
- **toKatakana=true (boolean)**:
    update 時に得られるカナをカタカタに変換して得る場合は true, それ以外は false を指定します。

## KanaProvider
変換の確定を検出し、カナを提供します。

### メソッド
KanaProvider が提供するメソッドは下記のとおり。

#### on(event, listener)
イベントハンドラを設定します。

##### パラメーター
- **event (string)**:
    イベント名
- **listener (Function)**:
    イベントハンドラ

### イベント
KanaProvider が提供するイベントは下記のとおり。

#### update(kana)
変換が確定した際に発生します。

##### パラメーター
- **kana (string)**: 変換時に確定した内容に対応するカナ。

#### clear()
対象の入力項目がクリアされた場合に発生します。

#### error(type, message)
カナの取得が困難になった際などにエラーを通知します。

##### パラメーター
- **type (string)**: エラータイプ。
- **message (string)**: エラーに対する説明。

## License
Apache 2.0

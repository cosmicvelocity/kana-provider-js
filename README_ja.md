# kana-provider
テキスト入力に対して IME の変換を検出して変換テキストのカナを提供します。

テキスト入力時のキーストロークに基づいてカナを抽出するため、
クリップボードのペースト動作や予測変換については正常にカナを生成することができません。

また、ブラウザの種類・バージョンごとに細かい挙動の違いがあるため、
確実にカナが得られるわけではありません。その点ご注意ください。

## インストール
npm を使っている場合は、下記のように導入できます。

    npm i cosmicvelocity-kana-provider

## 使い方

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

## オプション
KanaProviderFactory.getProvider で指定できるオプションは下記のとおり。

- **kanaPattern** (RegExp)
    入力テキストに対して、カナとして判定するパターンを表します。

- **katakanaPattern** (RegExp)
    カタカナ変換オプションを指定する場合、変換の対象とするひらがなのパターンを表します。

- **onCleared** (boolean)
    clear イベントを発生させる場合は true, それ以外は false を指定します。

- **debug** (boolean)
    デバッグログを出力する場合は true, それ以外は false を指定します。

- **stopOnError** (boolean)
    変換中にカナを得られないようなエラーが発生した場合、update イベントを発生させたくない時は true を指定します。

- **toKatakana** (boolean)
    update 時に得られるカナをカタカタに変換して得る場合は true, それ以外は false を指定します。

## イベント
KanaProvider が提供するイベントは下記のとおり。

- **update**:
    変換が確定した際に発生します。

    kana: 変換時に確定した内容に対応するカナ。

- **clear**
    対象の入力項目がクリアされた場合に発生します。

- **error**
    カナの取得が困難になった際などにエラーを通知します。

    type: エラータイプ。
    message: エラーに対する説明。

## License
Apache 2.0

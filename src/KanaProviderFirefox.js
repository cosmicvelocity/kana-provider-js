/*
 * (c) Kouichi Machida <k-machida@aideo.co.jp>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import KeystrokeKanaProvider from './KeystrokeKanaProvider';

/**
 * Firefox の仕様に対応した KanaProvider の実装。
 * 
 * 文節の変換時も compositionend イベントが取れる。
 * 変換中の削除時は keyup でキーコードの取得ができないため、
 * 変換中の文字が減少した場合は変換文字列が削除されたと判断して履歴更新を行います。
 *
 * 確認バージョン
 * Firefox Quantum 60.0.2
 *
 * 変換中テキストの取得:
 *  - compositionupdate イベント
 * 変換中テキストの削除:
 *  - compositionupdate イベント中、変換中テキストの減少、かつカナ以外の文字が含まれていない
 * 変換中テキストの文節の確定:
 *  - compositionend イベント
 * 変換の確定:
 *  - compositionend イベント
 * 予測入力:
 *  - 検出できない
 * 全角スペース:
 *  - compositionupdate, compositionend イベントが連続で発生する。この時 data には全角スペースが入る。
 *  - keydown は発生しない。
 *  - keyup イベントが key = , keyCode = 32 になってしまうためこれらでは検出できない。
 *  - input イベントが data = undefined, isComposing = true で発生する。
 */
export default class KanaProviderFirefox extends KeystrokeKanaProvider
{

    /**
     * オブジェクトを初期化します。
     * 
     * @param {HTMLElement} element 対象の要素。
     * @param {{}} options オプション設定。
     */
    constructor(element, options = {}) {
        super(element, options);

        this._element.addEventListener('click', (evt) => {
            !this._options.debug || console.log(`${evt.type}: value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('focus', (evt) => {
            !this._options.debug || console.log(`${evt.type}: value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('keyup', (evt) => {
            !this._options.debug || console.log(`${evt.type}: key = ${evt.key}, keyCode = ${evt.keyCode}, charCode = ${evt.charCode}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);

            const value = evt.target.value;
            const keyCode = evt.keyCode;

            // 入力キーごとに処理。
            switch (keyCode) {
                case 8:
                    // 入力欄が空にされた。
                    if (value.length <= 0) {
                        // 念のため履歴をクリア。
                        this._clearHistories();

                        // clear イベントを発生させます。
                        this._fireClear();
                    }

                    break;
                default:
                    break;
            }
        });
        this._element.addEventListener('keydown', (evt) => {
            !this._options.debug || console.log(`${evt.type}: key = ${evt.key}, keyCode = ${evt.keyCode}, charCode = ${evt.charCode}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('compositionupdate', (evt) => {
            !this._options.debug || console.log(`${evt.type}: data = ${evt.data}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);

            // 全角スペースを許可する設定かチェック。
            if (this._options.allowSpace && this._options.spacePattern.test(evt.data)) {
                this._pushHistory(evt.data);
            } else {
                this._compositionUpdate(evt.data);
            }
        });
        this._element.addEventListener('compositionend', (evt) => {
            !this._options.debug || console.log(`${evt.type}: data = ${evt.data}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);

            // 履歴を確定します。
            this._confirmHistory();
        });
        this._element.addEventListener('input', (evt) => {
            !this._options.debug || console.log(`${evt.type}: inputType = ${evt.inputType}, data = ${evt.data}, isComposing = ${evt.isComposing}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
    }

    /**
     * 変換中のテキストを処理します。
     * 
     * @param {string} composting 変換中のテキスト。
     */
    _compositionUpdate(composting) {
        // 後ろからひらがなの部分をカナ入力値として取得します。
        const latestKana = this._getLatestKana(composting);

        // カナ入力値が存在しているか確認します。
        if (0 < latestKana.length) {
            // 履歴の最後の内容を取得します。
            const historyKana = (0 < this._histories.length) ? this._histories[this._histories.length - 1] : '';

            // 最後の履歴を異なる内容かチェック。
            if (historyKana !== latestKana) {
                // 最後の履歴から現在の値が短くなっているかチェック。
                if (latestKana.length < historyKana.length) {
                    // 履歴を加工します。
                    this._removeHistory(latestKana);
                } else {
                    // 履歴を積む。
                    this._pushHistory(latestKana);
                }
            }
        }
    }

}

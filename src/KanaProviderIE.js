/*
 * (c) Kouichi Machida <k-machida@aideo.co.jp>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import KeystrokeKanaProvider from './KeystrokeKanaProvider';

/**
 * IE の仕様に対応した KanaProvider の実装。
 * 
 * IE では変換中も keyup が発生するので、keyup から取得した入力文字の履歴を基準にふりがなを抽出します。
 *
 * 確認バージョン
 * Internet Explorer 11.48.17134.0
 *
 * 変換中テキストの取得:
 *  - keyup イベント中、入力キーが Backspace, Tab, Enter 以外の場合
 * 変換中テキストの削除:
 *  - keyup イベント中、入力キーが Backspace の場合
 * 変換中テキストの文節の確定:
 *  - keyup イベントで取得された入力文字の履歴から判断
 * 変換の確定:
 *  - keyup イベント中、入力キーが Enter の場合
 * 予測入力:
 *  - keyup イベント中、入力キーが Tab だった場合に予測入力が行われたと仮定
 * 全角スペース:
 *  - compositionupdate イベントが発生せず、compositionend が単独で発生する。
 *  - keydown イベント中、key = Spacebar, keyCode = 229, getModifierState('Shift') で検出可。
 *    ただし、Shift キーを判定に使うと MSIME などで通常スペースを全角スペースに設定している場合判定できないため、
 *    最後の入力が全角スペースかどうかなどで判別する。
 *  - keyup イベント中では変換モード以外での入力と区別ができないため、 keydown 時のみ検出できる。
 */
export default class KanaProviderIE extends KeystrokeKanaProvider {

    /**
     * オブジェクトを初期化します。
     * 
     * @param {HTMLElement} element 対象の要素。
     * @param {{}} options オプション設定。
     */
    constructor(element, options = {}) {
        super(element, options);

        this._editing = '';

        this._element.addEventListener('click', (evt) => {
            !this._options.debug || console.log(`${evt.type}: value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('focus', (evt) => {
            !this._options.debug || console.log(`${evt.type}: value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);

            // フォーカス時の値を取ります。
            this._editing = this._element.value;
        });
        this._element.addEventListener('keyup', (evt) => {
            !this._options.debug || console.log(`${evt.type}: key = ${evt.key}, keyCode = ${evt.keyCode}, charCode = ${evt.charCode}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);

            const value = evt.target.value;
            const keyCode = evt.keyCode;

            // 入力キーごとに処理。
            switch (keyCode) {
                case 8: {
                    if (0 < value.length) {
                        // カナを取得します。
                        const latestKana = this._getCompostingKana();

                        // 履歴を加工します。
                        this._removeHistory(latestKana);
                    } else {
                        // 念のため履歴をクリア。
                        this._clearHistories();

                        // clear イベントを発生させます。
                        this._fireClear();
                    }

                    break;
                }
                case 9: {
                    // エラー発生時に処理を停止する場合、停止フラグを立てる。
                    this._stopped = this._options.stopOnError;

                    // このタイミングでタブが来ている場合、予測入力が行われた可能性がある。
                    this._fireError('predictive-conversion', '予測入力が使用された可能性があります。');

                    break;
                }
                case 13: {
                    // 履歴を確定します。
                    this._confirmHistory();

                    break;
                }
                default: {
                    const value = evt.target.value;
                    const isFullWideSpace =
                        this._options.allowSpace && // スペースを許可する設定かチェック。
                        (evt.keyCode === 32 && evt.key === 'Spacebar') && // 押下したキーがスペース。
                        (0 < value.length && this._options.spacePattern.test(value[value.length - 1])); // 最後の入力がスペース。

                    if (isFullWideSpace) {
                        this._pushHistory(value[value.length - 1]);
                    } else {
                        // カナを取得します。
                        const latestKana = this._getCompostingKana();

                        // 履歴に積みます。
                        this._pushHistory(latestKana);
                    }

                    break;
                }
            }
        });
        this._element.addEventListener('keydown', (evt) => {
            !this._options.debug || console.log(`${evt.type}: key = ${evt.key}, keyCode = ${evt.keyCode}, charCode = ${evt.charCode}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('compositionupdate', (evt) => {
            !this._options.debug || console.log(`${evt.type}: data = ${evt.data}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('compositionend', (evt) => {
            !this._options.debug || console.log(`${evt.type}: data = ${evt.data}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
        this._element.addEventListener('input', (evt) => {
            !this._options.debug || console.log(`${evt.type}: inputType = ${evt.inputType}, data = ${evt.data}, isComposing = ${evt.isComposing}, value = ${evt.target.value}, historyies: ${this._histories.map(h => '"' + h + '"').join(",")}`);
        });
    }

    /**
     * 変換中のカナを取得します。
     * 
     * @returns {string} 変換中のカナ。
     */
    _getCompostingKana() {
        // 既存の入力値と差分を取って未確定テキストを取得します。
        const composting = this._element.value
            .split('')
            .filter((ch, i) => ch !== this._editing[i])
            .join('');

        // カナを取得します。
        const latestKana = this._getLatestKana(composting);

        return latestKana;
    }

}

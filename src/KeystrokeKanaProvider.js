/*
 * (c) Kouichi Machida <k-machida@aideo.co.jp>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import KanaProvider from './KanaProvider';

/**
 * キーストロークからカナを検出する KanaProvider の基本的な実装を提供します。
 */
export default class KeystrokeKanaProvider extends KanaProvider {

    /**
     * オブジェクトを初期化します。
     * 
     * @param {HTMLElement} element 対象の要素。
     * @param {{}} options オプション設定。
     */
    constructor(element, options = {}) {
        super(element, options);

        this._stopped = false;
        this._histories = [];
    }

    /**
     * 履歴をクリアします。
     */
    _clearHistories() {
        this._histories = [];
        this._stopped = false;
    }

    /**
     * 履歴の内容から変換テキストを確定します。
     */
    _confirmHistory() {
        // 停止フラグが立っていなければ update イベントを発行。
        if (!this._stopped) {
            // 履歴を調査し、文字数が急に減少している箇所を途中で変換が発生した箇所としてカナに追加します。
            // 例えば、ストロークが
            // [
            //   "と",
            //   "とう",
            //   "とうきょ",
            //   "とうきょう",
            //   "とうきょうと",
            //   "と",
            //   "とっきょ",
            //   "とっきょきょ",
            //   "とっきょきょか",
            //   "とっきょきょかきょ",
            //   "とっきょきょかきょく"
            // ]
            // となっていた場合、"とうきょうと" が文節変換が行われた可能性があるので、それを抽出します。
            // 最後の "とっきょきょかきょく" は常に有効なので抽出します。
            let maxLength = 0;
            const kanaParts = [];

            for (let index = 0; index < this._histories.length; index++) {
                const ch = this._histories[index];

                if (maxLength < ch.length) {
                    maxLength = ch.length;
                } else if (ch.length < maxLength) {
                    kanaParts.push(this._histories[index - 1]);
                    maxLength = 0;
                }
            }

            // 最後のものは常に追加します。
            kanaParts.push(this._histories[this._histories.length - 1]);

            // update イベントを発生させます。
            this._fireUpdate(kanaParts.join(''));
        }

        // 履歴をクリアします。
        this._clearHistories();
    }

    /**
     * 指定された文字列から、最後のカナ部分を最新の入力として取得します。
     * 
     * @param {string} s 対象のテキスト。
     * @returns {string} 最後のカナ入力部分。カナの部分が無い場合は 0 バイト文字列。
     */
    _getLatestKana(s) {
        // 後ろからひらがなの部分をカナ入力値として取得します。
        const kanaArray = [];
        
        s.split('')
            .reverse()
            .forEach(ch => {
                if (!this._options.kanaPattern.test(ch)) {
                    return false;
                }

                kanaArray.push(ch);
            });

        if (0 < kanaArray.length) {
            return kanaArray.reverse().join('');
        } else {
            return '';
        }
    }

    /**
     * 履歴に積みます。
     * 
     * 履歴の最新の値が指定した内容と同じ場合、履歴には積みません。
     * 
     * @param {string} composting 履歴に積むテキスト。
     * @returns {boolean} 履歴に積まれた場合 true, それ以外は false 。
     */
    _pushHistory(composting) {
        if ((0 < composting.length) && (this._histories[this._histories.length - 1] !== composting)) {
            this._histories.push(composting);

            return true;
        } else {
            return false;
        }
    }

    /**
     * 履歴を現在の入力値が最新になるように削除します。
     * 
     * @param {string} composting 対象のテキスト。
     */
    _removeHistory(composting) {
        // 履歴に現在の内容に該当するものがあるか探す。
        const index = this._histories.lastIndexOf(composting);

        if (0 <= index) {
            // 見つかった場合、以降の履歴を削除する。
            this._histories = this._histories.slice(0, index + 1);
        } else {
            // とりあえず履歴を削る。
            this._histories.pop();

            if (0 < composting.length) {
                // 最後の履歴を改変する。
                this._histories[this._histories.length - 1] = composting;
            }
        }
    }

}

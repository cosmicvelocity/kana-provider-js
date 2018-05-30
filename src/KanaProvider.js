/*
 * (c) Kouichi Machida <k-machida@aideo.co.jp>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import EventEmitter from './EventEmitter';

/**
 * KanaProvider のベースクラス。
 */
export default class KanaProvider extends EventEmitter
{

    /**
     * デフォルト設定を表します。
     */
    static defaultOptions = {

        /**
         * カナとして扱うパターン。
         */
        kanaPattern: /[\u3041-\u3093\u30fc]/,

        /**
         * カタカナ変換を行うパターン。
         */
        katakanaPattern: /[\u3041-\u3093\u309d\u309e]/,

        /**
         * clear イベントを生成するかどうか。
         */
        onCleared: true,

        /**
         * デバッグログの出力を行うかどうか。
         */
        debug: false,

        /**
         * 検出エラーの発生時、update イベントを生成するかどうか。
         */
        stopOnError: false,

        /**
         * update イベント時、カナをカタカナに変換するかどうか。
         */
        toKatakana: true

    };

    /**
     * オブジェクトを初期化します。
     * 
     * @param {HTMLElement} element 対象の要素。
     * @param {{}} options オプション設定。
     */
    constructor(element, options = {}) {
        super();

        this._options = Object.assign({}, KanaProvider.defaultOptions, options);
        this._element = element;
    }

    /**
     * clear イベントを発生させます。
     */
    _fireClear() {
        if (this._options.onCleared) {
            this.emit('clear');
        }
    }

    /**
     * error イベントを発生させます。
     * 
     * @param {string} type エラータイプ。
     * @param {string} message エラーメッセージ。
     */
    _fireError(type, message) {
        this.emit('error', type, message);
    }

    /**
     * update イベントを発生させます。
     * 
     * @param {string} kana 入力されたカナ。
     */
    _fireUpdate(kana) {
        const data = 
            this._options.toKatakana ?
                kana.split('').map(
                    (ch) => {
                        if (this._options.katakanaPattern.test(ch)) {
                            return String.fromCharCode(ch.charCodeAt() + 96);
                        } else {
                            return ch;
                        }
                    })
                    .join('') :
                kana;

        this.emit('update', data);
    }

}

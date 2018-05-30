/*
 * (c) Kouichi Machida <k-machida@aideo.co.jp>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

/**
 * 簡単な EventEmitter 。
 */
export default class EventEmitter {

    /**
     * EventEmitter を初期化します。
     */
    constructor() {
        this._eventListeners = {};
    }

    /**
     * イベントを発行します。
     *
     * @param {string} event イベント名
     * @param {...} args イベントのパラメーター
     */
    emit(event, ...args) {
        if (typeof this._eventListeners[event] === 'object') {
            const listeners = this._eventListeners[event].slice();
            const length = listeners.length;

            for (let i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    /**
     * イベントにリスナーを登録します。
     *
     * @param {string} event イベント名
     * @param {Function} listener リスナー
     * @return {EventEmitter} このオブジェクト
     */
    on(event, listener) {
        if (typeof this._eventListeners[event] !== 'object') {
            this._eventListeners[event] = [];
        }

        this._eventListeners[event].push(listener);

        return this;
    }

    /**
     * イベントからリスナーを削除します。
     *
     * @param {string} event イベント名
     * @param {Function} listener リスナー
     * @return {EventEmitter} このオブジェクト
     */
    removeListener(event, listener) {
        if (typeof this._eventListeners[event] === 'object') {
            const index = this._eventListeners[event].indexOf(this._eventListeners[event], listener);

            if (index > -1) {
                this._eventListeners[event].splice(index, 1);
            }
        }

        return this;
    }

}

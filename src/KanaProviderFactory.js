/*
 * (c) Kouichi Machida <k-machida@aideo.co.jp>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import KanaProvider from './KanaProvider';
import KanaProviderWebkit from './KanaProviderWebkit';
import KanaProviderEdge from './KanaProviderEdge';
import KanaProviderIE from './KanaProviderIE';
import KanaProviderFirefox from './KanaProviderFirefox';
import KanaProviderNull from './KanaProviderNull';

/**
 * 動作環境に適した KanaProvider 実装を生成する機能を提供します。
 */
export default class KanaProviderFactory {

    /**
     * デフォルトオプションを表します。
     */
    static defaultOptions = {

        /**
         * デバッグログを出力するかどうか。
         */
        debug: true

    };

    /**
     * 対象の要素に適用する KanaProvider を取得します。
     * 
     * @param {HTMLElement} element 対象の要素。
     * @param {{}} options オプション設定。
     * @return {KanaProvider} KanaProvider オブジェクト。
     */
    static getProvider(element, options) {
        const normalizeOptions = Object.assign({}, KanaProviderFactory.defaultOptions, options);
        const ua = navigator.userAgent.toLowerCase();

        !normalizeOptions.debug || console.log(`userAgent: ${ua}`);

        // ブラウザの種別を取得します。
        const isIE = (0 <= ua.indexOf('msie')) && (ua.indexOf('opera') < 0);
        const isIE11 = (0 <= ua.indexOf('trident/7'));
        const isEdge = (0 <= ua.indexOf('edge'));
        const isFirefox = (0 <= ua.indexOf('firefox'));
        const isChrome = (0 <= ua.indexOf("chrome")) && (ua.indexOf("opr") < 0) && !isEdge;
        const isSafari = (0 <= ua.indexOf('safari')) && (ua.indexOf('chrome') < 0);
        const isOpera = (0 <= ua.indexOf('opera'));
        const isIPhone = (0 <= ua.indexOf('iphone'));
        const isIPad = (0 <= ua.indexOf('ipad'));
        const isIOS = isIPhone || isIPad;
        const isAndroid = (0 <= ua.indexOf('android'));

        // 各プロバイダを初期化します。
        let provider;

        if (isChrome || isSafari || isOpera || isIOS || isAndroid) {
            provider = new KanaProviderWebkit(element, options);
        } else if (isEdge) {
            provider = new KanaProviderEdge(element, options);
        } else if (isIE11) {
            provider = new KanaProviderIE(element, options);
        } else if (isFirefox) {
            provider = new KanaProviderFirefox(element, options);
        } else {
            provider = new KanaProviderNull(element, options);
        }

        !normalizeOptions.debug || console.log(`provider class: ${provider.constructor.name}`);

        return provider;
    }

}

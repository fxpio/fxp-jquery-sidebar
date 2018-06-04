/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {POSITION_RIGHT} from "../sidebar";
import {triggerEvent} from "./events";

let nativeScrollWidth = null;

/**
 * Get the width of native scrollbar.
 *
 * @returns {Number}
 */
export function getNativeScrollWidth() {
    let sbDiv = document.createElement("div"),
        size;
    sbDiv.style.width = '100px';
    sbDiv.style.height = '100px';
    sbDiv.style.overflow = 'scroll';
    sbDiv.style.position = 'absolute';
    sbDiv.style.top = '-9999px';
    document.body.appendChild(sbDiv);
    size = sbDiv.offsetWidth - sbDiv.clientWidth;
    document.body.removeChild(sbDiv);

    return size;
}

/**
 * Check if is a mobile device.
 *
 * @returns {boolean}
 *
 * @private
 */
export function mobileCheck() {
    if (null === nativeScrollWidth) {
        nativeScrollWidth = getNativeScrollWidth();
    }

    return 0 === nativeScrollWidth;
}

/**
 * Init the scroller instance.
 *
 * @param {Sidebar} self The sidebar instance
 *
 * @private
 */
export function initScroller(self) {
    let options = {
        scrollbarInverse: POSITION_RIGHT === self.options.position
    };

    if ($.fn.scroller && self.options.useScroller) {
        self.$element.scroller($.extend({}, options, self.options.scroller));
        self.$element.on('scrolling.fxp.scroller.fxp.sidebar', null, self, resetScrolling);
    }
}

/**
 * Destroy the hammer scroll configuration.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function destroyScroller(self) {
    if ($.fn.scroller && self.options.useScroller) {
        self.$element.scroller('destroy');
        self.$element.off('scrolling.fxp.scroller.fxp.sidebar', resetScrolling);
    }
}

/**
 * Lock the scroll of body.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function lockBodyScroll(self) {
    let bodyPad = parseInt((self.$body.css('padding-right') || 0), 10),
        hasScrollbar = self.$body.get(0).scrollHeight > document.documentElement.clientHeight &&
            'hidden' !== self.$body.css('overflow-y');

    if (hasScrollbar) {
        self.originalBodyPad = document.body.style.paddingRight || '';
        self.originalBodyOverflowY = document.body.style.overflowY || '';

        self.$body.css({
            'padding-right': (bodyPad + self.nativeScrollWidth) + 'px',
            'overflow-y': 'hidden'
        });

        triggerEvent('lock-body-scroll', self, self.nativeScrollWidth);
    }
}

/**
 * Unlock the scroll of body.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function unlockBodyScroll(self) {
    if (null !== self.originalBodyPad || null !== self.originalBodyOverflowY) {
        self.$body.css({
            'padding-right': self.originalBodyPad,
            'overflow-y': self.originalBodyOverflowY
        });

        self.originalBodyPad = null;
        self.originalBodyOverflowY = null;
        triggerEvent('unlock-body-scroll', self, self.nativeScrollWidth);
    }
}

/**
 * Reset the scrolling locker.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 *
 * @private
 */
function resetScrolling(event) {
    let self = event.data;

    self.resetScrolling = window.setTimeout(function () {
        self.resetScrolling = null;
    }, self.options.resetScrollDelay * 1000);
}

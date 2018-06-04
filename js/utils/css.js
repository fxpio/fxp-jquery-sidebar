/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global CSSMatrix*/
/*global WebKitCSSMatrix*/
/*global MSCSSMatrix*/

/**
 * Changes the css transition configuration on target element.
 *
 * @param {jQuery} $target    The element to edited
 * @param {string} transition The css transition configuration of target
 */
export function changeTransition($target, transition) {
    $target.css('-webkit-transition', transition);
    $target.css('transition', transition);
}

/**
 * Changes the css transform configuration on target element.
 *
 * @param {jQuery} $target   The element to edited
 * @param {string} transform The css transform configuration of target
 */
export function changeTransform($target, transform) {
    $target.css('-webkit-transform', transform);
    $target.css('transform', transform);
}

/**
 * Translate the jquery element with Translate 3D CSS.
 *
 * @param {jQuery } $target The jquery element
 * @param {Number}  delta   The delta of translate
 */
export function changeTranslate($target, delta) {
    let trans = delta + 'px, 0px, 0px';

    changeTransform($target, 'translate3d(' + trans + ')');
}

/**
 * Get the horizontal position of target element.
 *
 * @param {jQuery} $target The jquery target
 *
 * @return {number}
 */
export function getTargetPosition($target) {
    let transformCss = $target.css('transform'),
        transform = {e: 0, f: 0},
        reMatrix,
        match;

    if (transformCss) {
        if ('function' === typeof CSSMatrix) {
            transform = new CSSMatrix(transformCss);

        } else if ('function' === typeof WebKitCSSMatrix) {
            transform = new WebKitCSSMatrix(transformCss);

        } else if ('function' === typeof MSCSSMatrix) {
            transform = new MSCSSMatrix(transformCss);

        } else {
            reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
            match = transformCss.match(reMatrix);

            if (match) {
                transform.e = parseInt(match[1], 10);
                transform.f = parseInt(match[2], 10);
            }
        }
    }

    return transform.e;
}

/**
 * Checks if the window width is wider than the minimum width defined in
 * options.
 *
 * @param {Sidebar} self The sidebar instance
 *
 * @returns {boolean}
 */
export function isOverMinWidth(self) {
    let $window = $(window),
        windowWidth = $window.innerWidth();

    if (self.$body.height() > $window.innerHeight()) {
        windowWidth += self.nativeScrollWidth;
    }

    return windowWidth >= self.options.minLockWidth;
}

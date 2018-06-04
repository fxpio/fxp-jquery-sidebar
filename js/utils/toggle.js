/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Action to detach toggle button.
 *
 * @param {Sidebar} self    The sidebar instance
 * @param {jQuery}  $toggle The toggle
 */
export function doDetachToggle(self, $toggle) {
    $toggle
        .off('mouseover.fxp.sidebar' + self.guid, $.proxy(self.open, self))
        .off(self.eventType + '.fxp.sidebar' + self.guid, self.toggle)
        .removeClass(self.options.classLocked + '-toggle')
        .removeClass(self.options.classForceOpen + '-toggle')
        .removeClass(self.options.classOpen + '-toggle');

    if (!self.enabled) {
        $toggle.removeClass('disabled');
    }
}

/**
 * Add css classname in toggle buttons.
 *
 * @param {Sidebar} self      The sidebar instance
 * @param {String}  classname The css classname
 */
export function addClassToggles(self, classname) {
    self.$toggles.each(function (index, $toggle) {
        $toggle.addClass(classname);
    });
}

/**
 * Add css classname in toggle buttons.
 *
 * @param {Sidebar} self      The sidebar instance
 * @param {String}  classname The css classname
 */
export function removeClassToggles(self, classname) {
    self.$toggles.each(function (index, $toggle) {
        $toggle.removeClass(classname);
    });
}

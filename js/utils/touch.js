/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {isOverMinWidth, getTargetPosition, changeTransition, changeTranslate, changeTransform} from "./css";
import {triggerEvent} from "./events";
import {lockBodyScroll, unlockBodyScroll} from "./scrollbar";
import {cleanCloseDelay} from "./actions";
import {FORCE_TOGGLE, FORCE_TOGGLE_ALWAYS, POSITION_LEFT, POSITION_RIGHT} from "./const";
import {addClassToggles, removeClassToggles} from "./toggle";

/**
 * Trigger the opened or closed event when the transition is finished.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 */
export function onEndTransition(event) {
    let self = event.data,
        action = event.data.isOpen() ? 'opened' : 'closed';

    if (event.target !== self.$element.get(0)) {
        return;
    }

    if (event.data.isOpen()) {
        addClassToggles(self, self.options.classOpen + '-toggle');

        if ($.fn.scroller && self.options.useScroller) {
            self.$element.scroller('resizeScrollbar');
        }

        $('a:visible:first', self.$toggles.get(0).parent()).focus();
    } else {
        removeClassToggles(self, self.options.classOpen + '-toggle');

        if ($.fn.scroller && self.options.useScroller) {
            self.$element.scroller('resizeScrollbar');
        }
    }

    if (self.isLocked()) {
        if (!isOverMinWidth(self) && self.isOpen()) {
            lockBodyScroll(self);
        } else {
            unlockBodyScroll(self);
        }
    }

    triggerEvent(action, self);
}

/**
 * Action of "on drag" hammer event.
 *
 * @param {Sidebar} self  The sidebar instance
 * @param {object}  event The hammer event
 *
 * @typedef {Number} event.deltaX The hammer delta X
 * @typedef {Number} event.deltaY The hammer delta Y
 */
export function onDrag(self, event) {
    let delta;

    if (null !== self.resetScrolling || event.target === self.$obfuscator.get(0)) {
        return;
    }

    // drag start
    if (null === self.dragDirection) {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
            return;
        }

        self.mouseDragEnd = null;
        self.dragDirection = event.direction;
        self.$element.css('user-select', 'none');
        cleanCloseDelay(self);
    }

    // drag
    if (-1 === $.inArray(self.dragDirection, [Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT]) ||
        (self.options.locked && isOverMinWidth(self) && self.isOpen())) {
        return;
    }

    event.preventDefault();

    if (null === self.dragStartPosition) {
        self.dragStartPosition = getTargetPosition(self.$element);
    }

    delta = Math.round(self.dragStartPosition + event.deltaX);

    if ((POSITION_LEFT === self.getPosition() && delta > 0) ||
        (POSITION_RIGHT === self.getPosition() && delta < 0)) {
        delta = 0;
    }

    self.$element.addClass(self.options.classOnDragging);
    changeTransition(self.$element, 'none');
    changeTranslate(self.$element, delta);
}

/**
 * Action of "on drag end" hammer event.
 *
 * @param {Sidebar} self  The sidebar instance
 * @param {object}  event The hammer event
 *
 *
 * @typedef {Number} event.deltaX    The hammer delta X
 * @typedef {Number} event.direction The hammer direction const
 */
export function onDragEnd(self, event) {
    let closeGesture = Hammer.DIRECTION_LEFT,
        openGesture  = Hammer.DIRECTION_RIGHT;

    if (null !== self.resetScrolling || event.target === self.$obfuscator.get(0)) {
        return;
    }

    self.dragStartPosition = null;
    event.preventDefault();

    if (self.fixDragClick && -1 !== $.inArray(event.srcEvent.type, ['pointerup', 'mouseup'])) {
        self.mouseDragEnd = true;
    }

    self.$element.removeClass(self.options.classOnDragging);
    self.$element.css('user-select', '');
    changeTransition(self.$element, '');
    changeTransform(self.$element, '');

    if (Math.abs(event.deltaX) <= (self.$element.innerWidth() / 4)) {
        self.dragDirection = null;
        self.$toggles.focus();

        return;
    }

    if (POSITION_RIGHT === self.getPosition()) {
        closeGesture = Hammer.DIRECTION_RIGHT;
        openGesture = Hammer.DIRECTION_LEFT;
    }

    if (self.isOpen() && closeGesture === self.dragDirection) {
        self.forceClose();

    } else if (openGesture === self.dragDirection) {
        self.mouseDragEnd = null;

        if (self.isOpen() && isOverMinWidth(self) &&
            $.inArray(self.options.forceToggle, [FORCE_TOGGLE, FORCE_TOGGLE_ALWAYS]) >= 0) {
            self.forceOpen();

        } else if (isOverMinWidth(self) && FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
            self.forceOpen();

        } else {
            self.open();
        }
    }

    self.dragDirection = null;
}

/**
 * Init the hammer instance.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function initHammer(self) {
    if (!self.options.draggable || typeof Hammer !== 'function') {
        return;
    }

    self.$swipe = $('<div id="sidebar-swipe' + self.guid + '" class="fxp-sidebar-swipe"></div>');
    self.$element.after(self.$swipe);

    self.hammer = new Hammer(self.$wrapper.get(0), $.extend(true, {}, self.options.hammer));

    self.hammer.get('swipe').set({ enable: false });
    self.hammer.get('tap').set({ enable: false });

    self.hammer.on('panstart', function (event) {
        onDrag(self, event);
    });
    self.hammer.on('pan', function (event) {
        onDrag(self, event);
    });
    self.hammer.on('panend', function (event) {
        onDragEnd(self, event);
    });

    self.$wrapper.on('mousedown.fxp.sidebar', null, self, onItemMouseDown);
    self.$wrapper.on('click.fxp.sidebar', null, self, onItemClick);

    if (self.options.clickableSwipe) {
        self.$swipe
            .on('click.fxp.sidebar' + self.guid, null, self, swipeClick)
            .on('mouseenter.fxp.sidebar' + self.guid, null, self, swipeMouseEnter)
            .on('mouseleave.fxp.sidebar' + self.guid, null, self, swipeMouseLeave)
        ;
    }
}

/**
 * Destroy the hammer configuration.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function destroyHammer(self) {
    if (!self.options.draggable || typeof Hammer !== 'function') {
        return;
    }

    if (self.options.clickableSwipe) {
        self.$swipe
            .off('click.fxp.sidebar' + self.guid, swipeClick)
            .off('mouseenter.fxp.sidebar' + self.guid, swipeMouseEnter)
            .off('mouseleave.fxp.sidebar' + self.guid, swipeMouseLeave)
        ;
    }

    self.$wrapper.off('mousedown.fxp.sidebar', onItemMouseDown);
    self.$wrapper.off('click.fxp.sidebar', onItemClick);
    self.$swipe.remove();
    self.hammer.destroy();

    delete self.$swipe;
    delete self.hammer;
}



/**
 * Action on swipe is clicked.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 *
 * @private
 */
function swipeClick(event) {
    swipeMouseLeave(event);
    event.data.toggle(event);
}

/**
 * Action when mouse enter on sur swipe.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 *
 * @private
 */
function swipeMouseEnter(event) {
    event.data.$swipe.addClass('mouse-hover');
}

/**
 * Action when mouse leave on sur swipe.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 *
 * @private
 */
function swipeMouseLeave(event) {
    event.data.$swipe.removeClass('mouse-hover');
}

/**
 * Action on item mouse down.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 */
function onItemMouseDown(event) {
    event.preventDefault();
}

/**
 * Action on item click.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 */
function onItemClick(event) {
    let self = event.data;

    if (true === self.mouseDragEnd) {
        event.preventDefault();
        cleanCloseDelay(self);
        self.mouseDragEnd = null;
    }
}

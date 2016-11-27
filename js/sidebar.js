/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global define*/
/*global jQuery*/
/*global window*/
/*global navigator*/
/*global document*/
/*global CSSMatrix*/
/*global WebKitCSSMatrix*/
/*global MSCSSMatrix*/
/*global Hammer*/
/*global Sidebar*/

/**
 * @param {jQuery} $
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var nativeScrollWidth = null;

    /**
     * Get the width of native scrollbar.
     *
     * @returns {Number}
     */
    function getNativeScrollWidth() {
        var sbDiv = document.createElement("div"),
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
    function mobileCheck() {
        if (null === nativeScrollWidth) {
            nativeScrollWidth = getNativeScrollWidth();
        }

        return 0 === nativeScrollWidth;
    }

    /**
     * Add browser prefix on event name for jquery.
     *
     * @param {String} name        The event name
     * @param {String} [namespace] The namespace of jquery event
     *
     * @returns {String}
     *
     * @private
     */
    function prefixedEvent(name, namespace) {
        var pfx = ['webkit', 'moz', 'ms', 'o', ''],
            names = '';

        for (var p = 0; p < pfx.length; p++) {
            if (!pfx[p]) {
                name = name.toLowerCase();
            }

            names += ' ' + pfx[p] + name;

            if (undefined !== namespace) {
                names += '.' + namespace;
            }
        }

        return names;
    }

    /**
     * Trigger the event.
     *
     * @param {String}  type   The event type
     * @param {Sidebar} self   The sidebar instance
     * @param {*}       [data] The data
     *
     * @private
     */
    function triggerEvent(type, self, data) {
        $.event.trigger({
            type: 'sidebar:' + type + '.st.sidebar',
            sidebar: self,
            eventData: data,
            time: new Date()
        });
    }

    /**
     * Changes the css transition configuration on target element.
     *
     * @param {jQuery} $target    The element to edited
     * @param {string} transition The css transition configuration of target
     *
     * @private
     */
    function changeTransition($target, transition) {
        $target.css('-webkit-transition', transition);
        $target.css('transition', transition);
    }

    /**
     * Changes the css transform configuration on target element.
     *
     * @param {jQuery} $target   The element to edited
     * @param {string} transform The css transform configuration of target
     *
     * @private
     */
    function changeTransform($target, transform) {
        $target.css('-webkit-transform', transform);
        $target.css('transform', transform);
    }

    /**
     * Translate the jquery element with Translate 3D CSS.
     *
     * @param {jQuery } $target The jquery element
     * @param {Number}  delta   The delta of translate
     */
    function changeTranslate($target, delta) {
        var trans = delta + 'px, 0px, 0px';

        changeTransform($target, 'translate3d(' + trans + ')');
    }

    /**
     * Get the horizontal position of target element.
     *
     * @param {jQuery} $target The jquery target
     *
     * @return {number}
     *
     * @private
     */
    function getTargetPosition($target) {
        var transformCss = $target.css('transform'),
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
     * Binding actions of keyboard.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function keyboardAction(event) {
        if (!(event instanceof jQuery.Event)) {
            return;
        }

        if (event.data.options.disabledKeyboard) {
            return;
        }

        var self = event.data,
            kbe = self.options.keyboardEvent;

        if (event.shiftKey === kbe.shiftKey &&
                event.ctrlKey  === kbe.ctrlKey &&
                event.altKey   === kbe.altKey &&
                event.keyCode  === kbe.keyCode) {
            self.toggle(event);
        }
    }

    /**
     * Checks if the window width is wider than the minimum width defined in
     * options.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @returns {boolean}
     *
     * @private
     */
    function isOverMinWidth(self) {
        var $window = $(window),
            windowWidth = $window.innerWidth();

        if (self.$body.height() > $window.innerHeight()) {
            windowWidth += self.nativeScrollWidth;
        }

        return windowWidth >= self.options.minLockWidth;
    }

    /**
     * Close the sidebar since external action.
     *
     * @param {Event} event The event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function closeExternal(event) {
        var self = event.data;

        event.stopPropagation();
        event.preventDefault();

        if (isOverMinWidth(self)) {
            self.close();

        } else {
            self.forceClose();
        }
    }

    /**
     * Clean the close delay.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function cleanCloseDelay(self) {
        if (null !== self.closeDelay) {
            window.clearTimeout(self.closeDelay);
            self.closeDelay = null;
        }
    }

    /**
     * Close the sidebar when an item is selected.
     *
     * @param {Event} event The event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function closeOnSelect(event) {
        var self = event.data;

        if (self.options.closeOnSelectDelay > 0) {
            self.closeDelay = window.setTimeout(function () {
                self.close();
            }, self.options.closeOnSelectDelay * 1000);
        } else {
            self.close();
        }
    }

    /**
     * Lock the scroll of body.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function lockBodyScroll(self) {
        var bodyPad = parseInt((self.$body.css('padding-right') || 0), 10),
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
     *
     * @private
     */
    function unlockBodyScroll(self) {
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
        var self = event.data;

        self.resetScrolling = window.setTimeout(function () {
            self.resetScrolling = null;
        }, self.options.resetScrollDelay * 1000);
    }

    /**
     * Close the sidebar or reopen the locked sidebar on window resize event.
     *
     * @param {Event} event The event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function onResizeWindow(event) {
        var self = event.data,
            isForceOpened = false,
            isOver = isOverMinWidth(self);

        changeTransition(self.$element, 'none');

        if (isOver && self.isLocked()) {
            self.forceOpen();
            unlockBodyScroll(self);
            isForceOpened = true;
        }

        if (undefined === self.resizeDelay) {
            self.resizeDelay = window.setTimeout(function () {
                delete self.resizeDelay;
                changeTransition(self.$element, '');

                if (!isForceOpened && self.isLocked()) {
                    if (!isOver && self.isOpen()) {
                        lockBodyScroll(self);
                    } else {
                        unlockBodyScroll(self);
                    }
                }
            }, 500);
        }
    }

    /**
     * Trigger the opened or closed event when the transition is finished.
     *
     * @param {Event} event The event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function onEndTransition(event) {
        var self = event.data,
            action = event.data.isOpen() ? 'opened' : 'closed';

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
     * Action of "on drag start" hammer event.
     *
     * @param {Sidebar} self  The sidebar instance
     * @param {object}  event The hammer event
     *
     * @typedef {Number} event.direction The hammer direction const
     *
     * @private
     */
    function onDragStart(self, event) {
        if (null !== self.resetScrolling) {
            return;
        }

        self.dragDirection = event.direction;
        self.$element.css('user-select', 'none');
        cleanCloseDelay(self);
    }

    /**
     * Action of "on drag" hammer event.
     *
     * @param {Sidebar} self  The sidebar instance
     * @param {object}  event The hammer event
     *
     * @typedef {Number} event.deltaX The hammer delta X
     *
     * @private
     */
    function onDrag(self, event) {
        var delta;

        if (null !== self.resetScrolling || event.target === self.$obfuscator.get(0)) {
            return;
        }

        if (-1 === $.inArray(self.dragDirection, [Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT]) ||
                (self.options.locked && isOverMinWidth(self))) {
            return;
        }

        event.preventDefault();

        if (null === self.dragStartPosition) {
            self.dragStartPosition = getTargetPosition(self.$element);
        }

        delta = Math.round(self.dragStartPosition + event.deltaX);

        if ((Sidebar.POSITION_LEFT === self.getPosition() && delta > 0) ||
                (Sidebar.POSITION_RIGHT === self.getPosition() && delta < 0)) {
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
     *
     * @private
     */
    function onDragEnd(self, event) {
        var closeGesture = Hammer.DIRECTION_LEFT,
            openGesture  = Hammer.DIRECTION_RIGHT;

        if (null !== self.resetScrolling || event.target === self.$obfuscator.get(0)) {
            return;
        }

        self.dragStartPosition = null;

        event.preventDefault();

        if ('mouse' === event.pointerType) {
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

        if (Sidebar.POSITION_RIGHT === self.getPosition()) {
            closeGesture = Hammer.DIRECTION_RIGHT;
            openGesture = Hammer.DIRECTION_LEFT;
        }

        if (self.isOpen() && closeGesture === self.dragDirection) {
            self.forceClose();

        } else if (openGesture === self.dragDirection) {
            if (self.isOpen() && isOverMinWidth(self) &&
                    $.inArray(self.options.forceToggle, [Sidebar.FORCE_TOGGLE, Sidebar.FORCE_TOGGLE_ALWAYS]) >= 0) {
                self.forceOpen();

            } else if (isOverMinWidth(self) && Sidebar.FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
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
     *
     * @private
     */
    function initHammer(self) {
        if (!self.options.draggable || typeof Hammer !== 'function') {
            return;
        }

        self.$swipe = $('<div id="sidebar-swipe' + self.guid + '" class="sidebar-swipe"></div>');
        self.$element.after(self.$swipe);

        self.hammer = new Hammer(self.$wrapper.get(0), $.extend(true, {}, self.options.hammer));

        self.hammer.get('swipe').set({ enable: false });
        self.hammer.get('tap').set({ enable: false });

        self.hammer.on('panstart', function (event) {
            onDragStart(self, event);
        });
        self.hammer.on('pan', function (event) {
            onDrag(self, event);
        });
        self.hammer.on('panend', function (event) {
            onDragEnd(self, event);
        });
    }

    /**
     * Destroy the hammer configuration.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function destroyHammer(self) {
        if (!self.options.draggable || typeof Hammer !== 'function') {
            return;
        }

        self.$swipe.remove();
        self.hammer.destroy();

        delete self.$swipe;
        delete self.hammer;
    }

    /**
     * Init the scroller instance.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function initScroller(self) {
        var options = {
            scrollbarInverse: Sidebar.POSITION_RIGHT === self.options.position
        };

        if ($.fn.scroller && self.options.useScroller) {
            self.$element.scroller($.extend({}, options, self.options.scroller));
            self.$element.on('scrolling.st.scroller.st.sidebar', null, self, resetScrolling);
        }
    }

    /**
     * Destroy the hammer scroll configuration.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function destroyScroller(self) {
        if ($.fn.scroller && self.options.useScroller) {
            self.$element.scroller('destroy');
            self.$element.off('scrolling.st.scroller.st.sidebar', resetScrolling);
        }
    }

    /**
     * Action to detach toggle button.
     *
     * @param {Sidebar} self    The sidebar instance
     * @param {jQuery}  $toggle The toggle
     *
     * @this Sidebar
     */
    function doDetachToggle(self, $toggle) {
        $toggle
            .off('mouseover.st.sidebar' + self.guid, $.proxy(Sidebar.prototype.open, self))
            .off(self.eventType + '.st.sidebar' + self.guid, Sidebar.prototype.toggle)
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
     *
     * @this Sidebar
     */
    function addClassToggles(self, classname) {
        self.$toggles.each(function (index, $toggle) {
            $toggle.addClass(classname);
        });
    }

    /**
     * Add css classname in toggle buttons.
     *
     * @param {Sidebar} self      The sidebar instance
     * @param {String}  classname The css classname
     *
     * @this Sidebar
     */
    function removeClassToggles(self, classname) {
        self.$toggles.each(function (index, $toggle) {
            $toggle.removeClass(classname);
        });
    }

    // SIDEBAR CLASS DEFINITION
    // ========================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @this Sidebar
     */
    var Sidebar = function (element, options) {
        var isOver;

        this.guid = jQuery.guid;
        this.options = $.extend(true, {}, Sidebar.DEFAULTS, options);
        this.eventType = 'click';
        this.nativeScrollWidth = getNativeScrollWidth();
        this.$element = $(element);
        this.$toggles = $([]);
        this.$wrapper = $('<div class="' + this.options.classWrapper + '"></div>');
        this.$container = $('> .' + this.options.classContainer, this.$element.parent());
        this.$swipe = null;
        this.$obfuscator = $('<div class="' + this.options.classObfuscator + '"></div>');
        this.$body = $('body');
        this.enabled = !this.$element.hasClass('sidebar-disabled');
        this.hammer = null;
        this.dragStartPosition = null;
        this.mouseDragEnd = null;
        this.dragDirection = null;
        this.closeDelay = null;
        this.resetScrolling = null;
        this.originalBodyPad = null;
        this.originalBodyOverflowY = null;

        this.$element.before(this.$wrapper);
        this.$wrapper.append(this.$element);
        this.$wrapper.append(this.$obfuscator);
        this.$element.attr('data-sidebar', 'true');

        if (null !== this.options.toggleId) {
            this.attachToggle('#' + this.options.toggleId);
        }

        if (undefined !== this.options.scrollerStickyHeader) {
            this.options.scroller.scrollerStickyHeader = this.options.scrollerStickyHeader;
            delete this.options.scrollerStickyHeader;
        }

        if (undefined !== this.options.scrollerScrollbar) {
            this.options.scroller.scrollbar = this.options.scrollerScrollbar;
            delete this.options.scrollerScrollbar;
        }

        if (this.$element.hasClass(this.options.classLocked)) {
            this.options.locked = true;
        }

        if (Sidebar.POSITION_RIGHT !== this.options.position) {
            this.options.position = Sidebar.POSITION_LEFT;

        } else {
            this.$element.addClass('sidebar-right');
        }

        if (this.$element.hasClass('sidebar-right')) {
            this.options.position = Sidebar.POSITION_RIGHT;
        }

        if (this.options.position === Sidebar.POSITION_RIGHT) {
            this.options.keyboardEvent.shiftKey = true;
        }

        if (!this.enabled) {
            this.$element
                .removeClass(this.options.classLocked)
                .removeClass(this.options.classForceOpen)
                .removeClass(this.options.classOpen)
                .removeClass(this.options.classOpen + '-init');
        }

        if (this.options.locked) {
            this.options.forceToggle = Sidebar.FORCE_TOGGLE_ALWAYS;
            changeTransition(this.$element, 'none');

            if (this.enabled) {
                this.$element
                    .addClass(this.options.classLocked)
                    .addClass(this.options.classForceOpen)
                    .addClass(this.options.classOpen + '-init');

                this.$container.addClass('container-force-open-' + this.options.position);
            }
        }

        isOver = isOverMinWidth(this);

        $(window).on('keyup.st.sidebar' + this.guid, null, this, keyboardAction);
        $(window).on('resize.st.sidebar' + this.guid, null, this, onResizeWindow);

        if (this.$element.hasClass(this.options.classOpen + '-init')) {
            if (isOver) {
                this.$element.addClass(this.options.classOpen);

            } else {
                this.$element.removeClass(this.options.classOpen);
            }

            this.$element.removeClass(this.options.classOpen + '-init');
        }

        if (this.$element.hasClass(this.options.classOpen) && !isOver) {
            lockBodyScroll(this);
        } else {
            unlockBodyScroll(this);
        }

        if (this.options.closeOnSelect) {
            this.$element.on(this.eventType + '.st.sidebar' + this.guid, this.options.itemSelector, this, closeOnSelect);
        }

        this.$element.on(prefixedEvent('TransitionEnd', '.st.sidebar' + this.guid), null, this, onEndTransition);
        this.$obfuscator.on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);

        initScroller(this);
        initHammer(this);
        changeTransition(this.$element, '');

        this.$element.addClass('sidebar-ready');
        triggerEvent('ready', this);
    },
        old;

    /**
     * Defaults options.
     *
     * @type {object}
     */
    Sidebar.DEFAULTS = {
        classWrapper:       'sidebar-wrapper',
        classContainer:     'container-main',
        classOpen:          'sidebar-open',
        classLocked:        'sidebar-locked',
        classForceOpen:     'sidebar-force-open',
        classOnDragging:    'sidebar-dragging',
        classObfuscator:     'sidebar-obfuscator',
        forceToggle:        Sidebar.FORCE_TOGGLE_NO,
        locked:             false,
        position:           Sidebar.POSITION_LEFT,
        minLockWidth:       992,
        toggleId:           null,
        toggleOpenOnHover:  false,
        draggable:          true,
        closeOnSelect:      true,
        closeOnSelectDelay: 0.5,
        resetScrollDelay:   0.3,
        itemSelector:       '.sidebar-menu a',
        useScroller:        true,
        scrollerScrollbar:  undefined,
        scroller:           {
            contentSelector: '.sidebar-menu',
            scrollerStickyHeader: true,
            stickyOptions: {
                selector: '> .sidebar-menu > .sidebar-group > span'
            }
        },
        hammer:             {},
        disabledKeyboard:   false,
        keyboardEvent:      {
            ctrlKey:  true,
            shiftKey: false,
            altKey:   true,
            keyCode:  'S'.charCodeAt(0)
        }
    };

    /**
     * Left position.
     *
     * @type {string}
     */
    Sidebar.POSITION_LEFT  = 'left';

    /**
     * Right position.
     *
     * @type {string}
     */
    Sidebar.POSITION_RIGHT = 'right';

    /**
     * Not force toggle.
     *
     * @type {boolean}
     */
    Sidebar.FORCE_TOGGLE_NO = false;

    /**
     * Force toggle.
     *
     * @type {boolean}
     */
    Sidebar.FORCE_TOGGLE = true;

    /**
     * Always force toggle.
     *
     * @type {string}
     */
    Sidebar.FORCE_TOGGLE_ALWAYS = 'always';

    /**
     * Get sidebar position.
     *
     * @returns {string} The position (left or right)
     *
     * @this Sidebar
     */
    Sidebar.prototype.getPosition = function () {
        return this.options.position;
    };

    /**
     * Checks if sidebar is locked (always open).
     *
     * @returns {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isLocked = function () {
        return this.options.locked;
    };

    /**
     * Checks if sidebar is locked (always open).
     *
     * @returns {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isOpen = function () {
        return this.$element.hasClass(this.options.classOpen);
    };

    /**
     * Checks if sidebar is fully opened.
     *
     * @return {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isFullyOpened = function () {
        return this.$element.hasClass(this.options.classForceOpen);
    };

    /**
     * Checks if sidebar is closable.
     *
     * @return {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isClosable = function () {
        return this.enabled && this.isOpen() && !isOverMinWidth(this);
    };

    /**
     * Force open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceOpen = function () {
        if (!this.enabled || (this.isOpen() && this.isFullyOpened())) {
            return;
        }

        cleanCloseDelay(this);
        this.$element.addClass(this.options.classForceOpen);
        this.$container.addClass('container-force-open-' + this.options.position);
        addClassToggles(this, this.options.classForceOpen + '-toggle');

        triggerEvent('force-open', this);
        this.open();
    };

    /**
     * Force close the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceClose = function () {
        if (!this.enabled || !this.isOpen() || (this.isLocked() && isOverMinWidth(this))) {
            return;
        }

        cleanCloseDelay(this);
        removeClassToggles(this, this.options.classForceOpen + '-toggle');
        this.$container.removeClass('container-force-open-' + this.options.position);
        this.$element.removeClass(this.options.classForceOpen);

        triggerEvent('force-close', this);
        this.close();
    };

    /**
     * Open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.open = function () {
        if (!this.enabled || this.isOpen()) {
            return;
        }

        triggerEvent('open', this);
        cleanCloseDelay(this);
        $('[data-sidebar=true]').sidebar('forceClose');
        this.$element.addClass(this.options.classOpen);
    };

    /**
     * Close open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.close = function () {
        if (!this.enabled || !this.isOpen() || (this.isFullyOpened() && isOverMinWidth(this))) {
            return;
        }

        triggerEvent('close', this);
        cleanCloseDelay(this);
        this.$element.removeClass(this.options.classOpen);
    };

    /**
     * Toggle the sidebar ("close, "open", "force open").
     *
     * @param {jQuery.Event|Event} [event]
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @this Sidebar
     */
    Sidebar.prototype.toggle = function (event) {
        var self = (undefined !== event) ? event.data : this;

        if (!self.enabled) {
            return;
        }

        if (undefined !== event) {
            event.stopPropagation();
            event.preventDefault();
        }

        triggerEvent('toggle', this);

        if (self.isOpen()) {
            if (self.isFullyOpened()) {
                self.forceClose();

            } else if (isOverMinWidth(self) && $.inArray(self.options.forceToggle, [true, Sidebar.FORCE_TOGGLE_ALWAYS]) >= 0) {
                self.forceOpen();

            } else {
                self.close();
            }

        } else if (isOverMinWidth(self) && Sidebar.FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
            self.forceOpen();

        } else {
            self.open();
        }
    };

    /**
     * Refresh the scroller.
     *
     * @this Sidebar
     */
    Sidebar.prototype.refresh = function () {
        triggerEvent('refresh', this);

        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('refresh');
        }
    };

    /**
     * Attach a toggle button.
     *
     * @param {string|element|object|jQuery} $toggle
     *
     * @this Sidebar
     */
    Sidebar.prototype.attachToggle = function ($toggle) {
        $toggle = $($toggle);

        if (!this.enabled) {
            $toggle.addClass('disabled');
        }

        if (this.isLocked()) {
            $toggle.addClass(this.options.classLocked + '-toggle');
        } else {
            $toggle.removeClass(this.options.classLocked + '-toggle');
        }

        if (this.isFullyOpened()) {
            $toggle.addClass(this.options.classForceOpen + '-toggle');
        } else {
            $toggle.removeClass(this.options.classForceOpen + '-toggle');
        }

        if (this.isOpen()) {
            $toggle.addClass(this.options.classOpen + '-toggle');
        } else {
            $toggle.removeClass(this.options.classOpen + '-toggle');
        }

        $toggle.on(this.eventType + '.st.sidebar' + this.guid, null, this, Sidebar.prototype.toggle);

        if (!mobileCheck() && this.options.toggleOpenOnHover) {
            $toggle.on('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
        }

        this.$toggles.push($toggle);
    };

    /**
     * Detach a toggle button.
     *
     * @param {string|element|object|jQuery} $toggle
     *
     * @this Sidebar
     */
    Sidebar.prototype.detachToggle = function ($toggle) {
        var size = this.$toggles.length,
            i;

        $toggle = $($toggle);

        for (i = 0; i < size; ++i) {
            if (this.$toggles[i][0] === $toggle[0]) {
                doDetachToggle(this, this.$toggles[i]);
                this.$toggles.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Detach a toggle button.
     *
     * @this Sidebar
     */
    Sidebar.prototype.detachToggles = function () {
        var size = this.$toggles.length,
            i;

        for (i = 0; i < size; ++i) {
            doDetachToggle(this, this.$toggles[i]);
        }

        this.$toggles.splice(0, size);
    };

    /**
     * Checks if sidebar is enabled.
     *
     * @returns {boolean}
     *
     * @this Sidebar
     */
    Sidebar.prototype.isEnabled = function () {
        return this.enabled;
    };

    /**
     * Disable the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.disable = function () {
        var prevIsLocked = this.isLocked();

        if (!this.enabled) {
            return;
        }

        triggerEvent('disable', this);
        this.options.locked = false;
        this.forceClose();
        this.options.locked = prevIsLocked;
        this.$element.addClass('sidebar-disabled');
        addClassToggles(this, 'disabled');

        if (this.isLocked()) {
            addClassToggles(this, this.options.classLocked + '-toggle-disabled');
        }

        this.enabled = false;
    };

    /**
     * Enable the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.enable = function () {
        if (this.enabled) {
            return;
        }

        triggerEvent('enable', this);
        this.enabled = true;
        this.$element.removeClass('sidebar-disabled');

        if (isOverMinWidth(this) && Sidebar.FORCE_TOGGLE_ALWAYS === this.options.forceToggle) {
            this.forceOpen();
        }

        removeClassToggles(this, 'disabled');

        if (this.isLocked()) {
            removeClassToggles(this, this.options.classLocked + '-toggle-disabled');
        }
    };

    /**
     * Destroy instance.
     *
     * @this Sidebar
     */
    Sidebar.prototype.destroy = function () {
        cleanCloseDelay(this);
        this.detachToggles();
        this.forceClose();
        $(window).off('keyup.st.sidebar' + this.guid, keyboardAction);
        $(window).off('resize.st.sidebar' + this.guid, onResizeWindow);
        this.$element.off(this.eventType + '.st.sidebar' + this.guid, this.options.itemSelector, closeOnSelect);
        this.$element.off(prefixedEvent('TransitionEnd', '.st.sidebar' + this.guid), onEndTransition);
        this.$obfuscator.off(this.eventType + '.st.sidebar' + this.guid, closeExternal);

        destroyHammer(this);
        destroyScroller(this);
        unlockBodyScroll(this);

        this.$wrapper.before(this.$element);
        this.$wrapper.remove();

        this.$element.removeClass('sidebar-ready');
        this.$element.removeData('st.sidebar');

        delete this.guid;
        delete this.options;
        delete this.eventType;
        delete this.nativeScrollWidth;
        delete this.$element;
        delete this.$wrapper;
        delete this.$obfuscator;
        delete this.$swipe;
        delete this.$container;
        delete this.$toggles;
        delete this.$body;
        delete this.dragStartPosition;
        delete this.mouseDragEnd;
        delete this.dragDirection;
        delete this.closeDelay;
        delete this.resetScrolling;
        delete this.originalBodyPad;
        delete this.originalBodyOverflowY;
    };


    // SIDEBAR PLUGIN DEFINITION
    // =========================

    function Plugin(option, value) {
        var ret;

        this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.sidebar'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                data = new Sidebar(this, options);
                $this.data('st.sidebar', data);
            }

            if (typeof option === 'string') {
                ret = data[option](value);
            }
        });

        return undefined === ret ? this : ret;
    }

    old = $.fn.sidebar;

    $.fn.sidebar             = Plugin;
    $.fn.sidebar.Constructor = Sidebar;


    // SIDEBAR NO CONFLICT
    // ===================

    $.fn.sidebar.noConflict = function () {
        $.fn.sidebar = old;

        return this;
    };


    // SIDEBAR DATA-API
    // ================

    $(window).on('load', function () {
        $('[data-sidebar="true"]').each(function () {
            var $this = $(this);
            Plugin.call($this, $this.data());
        });
    });

}));

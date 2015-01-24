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
 *
 * @typedef {object}           define.amd                The require AMD
 * @typedef {jQuery|undefined} Sidebar.$swipe            The swipe element
 * @typedef {Hammer|undefined} Sidebar.hammer            The hammer
 * @typedef {Number|undefined} Sidebar.dragStartPosition The drag start position
 * @typedef {Number|undefined} Sidebar.dragDirection     The hammer direction on drag start
 *
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'sonatra-hammer-scroll'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    /**
     * Check if is a mobile device.
     *
     * @returns {boolean}
     *
     * @private
     */
    function mobileCheck() {
        return Boolean(navigator.userAgent.match(/Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i));
    }

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
     * Binding actions of mouse over swipe element.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function preventMouseOver(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Binding actions of click on tag A in wrapper.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function preventClick(event) {
        if (event.originalEvent.type === 'click') {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Binding actions of keyboard.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     *
     * @private
     */
    function keyboardAction(event) {
        if (!event instanceof jQuery.Event || event.data.options.disabledKeyboard) {
            return;
        }

        var self = event.data,
            kbe = self.options.keyboardEvent;

        if (event.shiftKey === kbe.shiftKey
                && event.ctrlKey  === kbe.ctrlKey
                && event.altKey   === kbe.altKey
                && event.keyCode  === kbe.keyCode) {
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

        if ($('body').height() > $window.innerHeight()) {
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
        var self = event.data,
            $target = $(event.currentTarget.activeElement),
            $directTarget = $(event.target),
            isOver = isOverMinWidth(self);

        if ((self.isLocked() && isOver) ||
                $target.hasClass(self.options.classWrapper) ||
                $directTarget.hasClass(self.options.classWrapper) ||
                $target.hasClass('sidebar-swipe') ||
                $directTarget.hasClass('sidebar-swipe') ||
                $target.parents('.' + self.options.classWrapper).size() > 0 ||
                $directTarget.parents('.' + self.options.classWrapper).size() > 0) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if (isOver) {
            self.close();

        } else {
            self.forceClose();
        }
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
        var self = event.data;

        changeTransition(self.$wrapper, 'none');

        if (isOverMinWidth(self) && self.isLocked()) {
            self.forceOpen();

            return;
        }

        closeExternal(event);

        if (undefined === self.resizeDelay) {
            self.resizeDelay = setTimeout(function () {
                delete self.resizeDelay;
                changeTransition(self.$wrapper, '');
            }, 500);
        }
    }

    /**
     * Init the hammer scroll instance.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function initHammerScroll(self) {
        var options = {
                autoConfig:         false,
                useScroll:          self.options.useScroll,
                nativeScroll:       self.options.nativeScroll,
                forceNativeScroll:  mobileCheck() ? true : self.options.forceNativeScroll,
                scrollbar:          !mobileCheck(),
                hammerStickyHeader: self.options.hammerStickyHeader,
                scrollbarInverse:   Sidebar.POSITION_RIGHT === self.options.position
            };

        self.$wrapper.hammerScroll($.extend({}, options, self.options.hammerScroll));
    }

    /**
     * Destroy the hammer scroll configuration.
     *
     * @param {Sidebar} self The sidebar instance
     *
     * @private
     */
    function destroyHammerScroll(self) {
        self.$wrapper.hammerScroll('destroy');
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
        self.dragDirection = event.direction;
        self.$wrapper.css('user-select', 'none');
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

        if (-1 === $.inArray(self.dragDirection, [Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT]) ||
                self.options.locked && isOverMinWidth(self)) {
            return;
        }

        event.preventDefault();

        if (undefined === self.dragStartPosition) {
            self.dragStartPosition = getTargetPosition(self.$wrapper);
        }

        delta = Math.round(self.dragStartPosition + event.deltaX);

        if ((Sidebar.POSITION_LEFT === self.getPosition() && delta > 0) ||
                (Sidebar.POSITION_RIGHT === self.getPosition() && delta < 0)) {
            delta = 0;
        }

        self.$wrapper.addClass(self.options.classOnDragging);
        changeTransition(self.$wrapper, 'none');
        changeTranslate(self.$wrapper, delta);
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

        delete self.dragStartPosition;

        event.preventDefault();

        self.$wrapper.removeClass(self.options.classOnDragging);
        self.$wrapper.css('user-select', '');
        changeTransition(self.$wrapper, '');
        changeTransform(self.$wrapper, '');

        if (Math.abs(event.deltaX) <= (self.$wrapper.innerWidth() / 4)) {
            delete self.dragDirection;

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

        delete self.dragDirection;
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
        self.$swipe.appendTo(self.$element);
        self.$swipe.on('mouseover.st.sidebar' + self.guid, preventMouseOver);

        self.hammer = new Hammer(self.$element.get(0), $.extend(true, {}, self.options.hammer));
        self.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
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

        self.$wrapper.on('click.st.sidebar dragstart.st.sidebar drag.st.sidebar dragend.st.sidebar', 'a', null, preventClick);
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
        self.$swipe.off('mouseover.st.sidebar' + self.guid, preventMouseOver);

        self.$wrapper.off('click.st.sidebar dragstart.st.sidebar drag.st.sidebar dragend.st.sidebar', 'a', preventClick);

        self.hammer.destroy();

        delete self.$swipe;
        delete self.hammer;
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
                this.guid      = jQuery.guid;
        this.options   = $.extend(true, {}, Sidebar.DEFAULTS, options);
        this.eventType = mobileCheck() ? 'touchstart' : 'click';
        this.nativeScrollWidth = getNativeScrollWidth();
        this.$element  = $(element);
        this.$toggle   = $('.' + this.options.classToggle, this.$element);
        this.$wrapper  = $('.' + this.options.classWrapper, this.$element);
        this.$element.attr('data-sidebar', 'true');

        var $findToggle;

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

        if (this.options.locked) {
            this.options.forceToggle = 'always';
            changeTransition(this.$element, 'none');
            changeTransition(this.$wrapper, 'none');
            this.$element
                .addClass(this.options.classLocked)
                .addClass(this.options.classForceOpen);
            this.$wrapper.addClass(this.options.classOpen + '-init');
        }

        if (null !== this.options.toggleId) {
            $findToggle = $('#' + this.options.toggleId);

            if (1 === $findToggle.size()) {
                this.$toggle.remove();
                this.$toggle = $findToggle;
            }

        } else {
            this.$element.addClass('sidebar-togglable');
        }

        if (!mobileCheck() && this.options.openOnHover && null === this.options.toggleId) {
            this.$element.on('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
            this.$element.on('mouseout.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.close, this));
        }

        this.$toggle.on(this.eventType + '.st.sidebar' + this.guid, null, this, Sidebar.prototype.toggle);
        $(window).on('keyup.st.sidebar' + this.guid, null, this, keyboardAction);
        $(window).on('resize.st.sidebar' + this.guid, null, this, onResizeWindow);

        if (this.$wrapper.hasClass(this.options.classOpen + '-init')) {
            if (isOverMinWidth(this)) {
                this.$wrapper.addClass(this.options.classOpen);

            } else {
                this.$wrapper.removeClass(this.options.classOpen);
            }

            this.$wrapper.removeClass(this.options.classOpen + '-init');
        }

        if (this.$wrapper.hasClass(this.options.classOpen)) {
            $(document).on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);
        }

        initHammerScroll(this);
        initHammer(this);
        changeTransition(this.$element, '');
        changeTransition(this.$wrapper, '');
        this.$wrapper.addClass('sidebar-ready');
    },
        old;

    /**
     * Defaults options.
     *
     * @type {object}
     */
    Sidebar.DEFAULTS = {
        classToggle:        'sidebar-toggle',
        classWrapper:       'sidebar-wrapper',
        classOpen:          'sidebar-open',
        classLocked:        'sidebar-locked',
        classForceOpen:     'sidebar-force-open',
        classOnDragging:    'sidebar-dragging',
        openOnHover:        false,
        forceToggle:        Sidebar.FORCE_TOGGLE_NO,
        locked:             false,
        position:           Sidebar.POSITION_LEFT,
        minLockWidth:       992,
        toggleId:           null,
        draggable:          true,
        useScroll:          false,
        nativeScroll:       false,
        forceNativeScroll:  false,
        hammerStickyHeader: true,
        hammerScroll:       {},
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
        return this.$wrapper.hasClass(this.options.classOpen);
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
     * Force open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceOpen = function () {
        if (this.isOpen() && this.isFullyOpened()) {
            return;
        }

        this.$element.addClass(this.options.classForceOpen);
        this.open();
        this.$toggle.removeClass(this.options.classToggle + '-opened');
    };

    /**
     * Force close the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceClose = function () {
        if (!this.isOpen() || (this.isLocked() && isOverMinWidth(this))) {
            return;
        }

        this.$element.removeClass(this.options.classForceOpen);
        this.close();
    };

    /**
     * Open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.open = function () {
        if (this.isOpen()) {
            return;
        }

        $('[data-sidebar=true]').sidebar('forceClose');
        this.$wrapper.addClass(this.options.classOpen);
        this.$toggle.addClass(this.options.classToggle + '-opened');
        this.$wrapper.hammerScroll('resizeScroll');
        $(document).on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);
    };

    /**
     * Close open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.close = function () {
        if (!this.isOpen() || (this.isFullyOpened() && isOverMinWidth(this))) {
            return;
        }

        this.$wrapper.removeClass(this.options.classOpen);
        this.$toggle.removeClass(this.options.classToggle + '-opened');
        $(document).off(this.eventType + '.st.sidebar' + this.guid, closeExternal);
        this.$wrapper.hammerScroll('resizeScroll');
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
        var self = (undefined !== event) ? event.data : this,
            $target,
            $parents;

        if (event) {
            $target = $(event.target);
            $parents = $target.parents('.' + self.options.classWrapper);
            event.stopPropagation();

            if ($target.hasClass(self.options.classToggle) || $target.parents('.' + self.options.classToggle).size() > 0) {
                event.preventDefault();
            }

            if ($parents.size() > 0 || $target.hasClass('sidebar-swipe')) {
                return;
            }
        }

        if (self.isOpen()) {
            if (self.isFullyOpened()) {
                self.forceClose();

            } else if (isOverMinWidth(self) && $.inArray(self.options.forceToggle, [true, 'always']) >= 0) {
                self.forceOpen();

            } else {
                self.close();
            }

        } else if (isOverMinWidth(self) && 'always' === self.options.forceToggle) {
            self.forceOpen();

        } else {
            self.open();
        }
    };

    /**
     * Destroy instance.
     *
     * @this Sidebar
     */
    Sidebar.prototype.destroy = function () {
        if (!mobileCheck()) {
            this.$element.off('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
            this.$element.off('mouseout.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.close, this));
        }

        $(document).off(this.eventType + '.st.sidebar' + this.guid, closeExternal);
        $(window).off('resize.st.sidebar' + this.guid, onResizeWindow);
        this.$toggle.off(this.eventType + '.st.sidebar' + this.guid, Sidebar.prototype.toggle);
        $(window).off('keyup.st.sidebar' + this.guid, keyboardAction);
        destroyHammer(this);
        destroyHammerScroll(this);

        this.$wrapper.removeClass('sidebar-ready');
        this.$element.removeData('st.sidebar');
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
                $this.data('st.sidebar', (data = new Sidebar(this, options)));
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

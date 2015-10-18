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
            data: data,
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
                $directTarget.parents('.' + self.options.classWrapper).size() > 0 ||
                true === self.mouseDragEnd) {
            self.mouseDragEnd = null;
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

        changeTransition(self.$element, 'none');

        if (isOverMinWidth(self) && self.isLocked()) {
            self.forceOpen();

            return;
        }

        if (undefined === self.resizeDelay) {
            self.resizeDelay = window.setTimeout(function () {
                delete self.resizeDelay;
                changeTransition(self.$element, '');
            }, 500);
        }
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
        self.$element.css('user-select', 'none');
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

        if (!(/iPad|iPhone|iPod/.test(navigator.userAgent)) && !((/Firefox/.test(navigator.userAgent) && /Tablet|Phone/.test(navigator.userAgent)))) {
            self.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        }

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
        this.guid = jQuery.guid;
        this.options = $.extend(true, {}, Sidebar.DEFAULTS, options);
        this.eventType = mobileCheck() ? 'touchstart' : 'click';
        this.nativeScrollWidth = getNativeScrollWidth();
        this.$element = $(element);
        this.$toggles = $([]);
        this.$wrapper = $('<div class="' + this.options.classWrapper + '"></div>');
        this.$container = $('> .' + this.options.classContainer, this.$element.parent());
        this.$swipe = null;
        this.enabled = !this.$element.hasClass('sidebar-disabled');
        this.hammer = null;
        this.dragStartPosition = null;
        this.mouseDragEnd = null;
        this.dragDirection = null;

        this.$element.before(this.$wrapper);
        this.$wrapper.append(this.$element);
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

        $(window).on('keyup.st.sidebar' + this.guid, null, this, keyboardAction);
        $(window).on('resize.st.sidebar' + this.guid, null, this, onResizeWindow);

        if (this.$element.hasClass(this.options.classOpen + '-init')) {
            if (isOverMinWidth(this)) {
                this.$element.addClass(this.options.classOpen);

            } else {
                this.$element.removeClass(this.options.classOpen);
            }

            this.$element.removeClass(this.options.classOpen + '-init');
        }

        if (this.$element.hasClass(this.options.classOpen)) {
            $(document).on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);
        }

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
        forceToggle:        Sidebar.FORCE_TOGGLE_NO,
        locked:             false,
        position:           Sidebar.POSITION_LEFT,
        minLockWidth:       992,
        toggleId:           null,
        toggleOpenOnHover:  false,
        draggable:          true,
        useScroller:        true,
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
     * Force open the sidebar.
     *
     * @this Sidebar
     */
    Sidebar.prototype.forceOpen = function () {
        if (!this.enabled || (this.isOpen() && this.isFullyOpened())) {
            return;
        }

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

        $('[data-sidebar=true]').sidebar('forceClose');

        addClassToggles(this, this.options.classOpen + '-toggle');
        this.$element.addClass(this.options.classOpen);
        $(document).on(this.eventType + '.st.sidebar' + this.guid, null, this, closeExternal);

        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('resizeScrollbar');
        }

        triggerEvent('open', this);
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

        removeClassToggles(this, this.options.classOpen + '-toggle');
        this.$element.removeClass(this.options.classOpen);
        $(document).off(this.eventType + '.st.sidebar' + this.guid, closeExternal);

        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('resizeScrollbar');
        }

        triggerEvent('close', this);
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

        triggerEvent('toggle', this);
    };

    /**
     * Refresh the scroller.
     *
     * @this Sidebar
     */
    Sidebar.prototype.refresh = function () {
        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('refresh');
        }

        triggerEvent('refresh', this);
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

        this.options.locked = false;
        this.forceClose();
        this.options.locked = prevIsLocked;
        this.$element.addClass('sidebar-disabled');
        addClassToggles(this, 'disabled');

        if (this.isLocked()) {
            addClassToggles(this, this.options.classLocked + '-toggle-disabled');
        }

        this.enabled = false;

        triggerEvent('disable', this);
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

        this.enabled = true;
        this.$element.removeClass('sidebar-disabled');

        if (isOverMinWidth(this) && Sidebar.FORCE_TOGGLE_ALWAYS === this.options.forceToggle) {
            this.forceOpen();
        }

        removeClassToggles(this, 'disabled');

        if (this.isLocked()) {
            removeClassToggles(this, this.options.classLocked + '-toggle-disabled');
        }

        triggerEvent('enable', this);
    };

    /**
     * Destroy instance.
     *
     * @this Sidebar
     */
    Sidebar.prototype.destroy = function () {
        this.detachToggles();
        this.forceClose();
        $(window).off('keyup.st.sidebar' + this.guid, keyboardAction);
        $(window).off('resize.st.sidebar' + this.guid, onResizeWindow);
        $(document).off(this.eventType + '.st.sidebar' + this.guid, closeExternal);

        destroyHammer(this);
        destroyScroller(this);

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
        delete this.$container;
        delete this.$toggles;
        delete this.dragStartPosition;
        delete this.mouseDragEnd;
        delete this.dragDirection;
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

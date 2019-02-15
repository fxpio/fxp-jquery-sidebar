/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pluginify from '@fxp/jquery-pluginify';
import BasePlugin from '@fxp/jquery-pluginify/js/plugin';
import $ from 'jquery';
import {FORCE_TOGGLE, FORCE_TOGGLE_ALWAYS, FORCE_TOGGLE_NO, POSITION_LEFT, POSITION_RIGHT} from "./utils/const";
import {changeTransition, isOverMinWidth} from "./utils/css";
import {initWithLocalStorage, setLocalStorage} from "./utils/storage";
import {onResizeWindow} from "./utils/window";
import {prefixedEvent, triggerEvent} from "./utils/events";
import {keyboardAction, closeExternal, closeOnSelect, cleanCloseDelay} from "./utils/actions";
import {destroyHammer, initHammer, onEndTransition} from "./utils/touch";
import {addClassToggles, removeClassToggles, doDetachToggle} from "./utils/toggle";
import {
    getNativeScrollWidth,
    mobileCheck,
    initScroller,
    destroyScroller,
    lockBodyScroll,
    unlockBodyScroll
} from "./utils/scrollbar";

/**
 * Sidebar class.
 */
export default class Sidebar extends BasePlugin
{
    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    constructor(element, options = {}) {
        super(element, options);

        let self = this,
            isOver,
            ua = navigator.userAgent.toLowerCase();

        this.eventType = 'click';
        this.nativeScrollWidth = getNativeScrollWidth();
        this.$toggles = $([]);
        this.$wrapper = $('<div class="' + this.options.classWrapper + '"></div>');
        this.$container = $('> .' + this.options.classContainer, this.$element.parent());
        this.$swipe = null;
        this.$obfuscator = $('<div class="' + this.options.classObfuscator + (this.options.showObfuscator ? ' show' : '') + '"></div>');
        this.$body = $('body');
        this.enabled = !this.$element.hasClass('sidebar-disabled');
        this.mini = this.$element.hasClass('sidebar-mini');
        this.fullLocked = this.$element.hasClass(this.options.classFullLocked);
        this.hammer = null;
        this.dragStartPosition = null;
        this.mouseDragEnd = null;
        this.dragDirection = null;
        this.closeDelay = null;
        this.resetScrolling = null;
        this.originalBodyPad = null;
        this.originalBodyOverflowY = null;
        this.fixDragClick = ua.indexOf('firefox') > -1 || ua.indexOf('edge') > -1 || ua.indexOf('msie') > -1;

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

        if (POSITION_RIGHT !== this.options.position) {
            this.options.position = POSITION_LEFT;

        } else {
            this.$element.addClass('sidebar-right');
        }

        if (this.$element.hasClass('sidebar-right')) {
            this.options.position = POSITION_RIGHT;
        }

        if (this.options.position === POSITION_RIGHT) {
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
            this.options.forceToggle = FORCE_TOGGLE_ALWAYS;
            changeTransition(this.$element, 'none');

            if (this.enabled) {
                this.$element
                    .addClass(this.options.classLocked)
                    .addClass(this.options.classForceOpen)
                    .addClass(this.options.classOpen + '-init');

                this.$container.addClass('container-force-open-' + this.options.position);
            }
        }

        if (this.mini) {
            this.$container.addClass('container-mini-' + this.options.position);
        }

        if (this.fullLocked) {
            this.$container.addClass('container-full-locked');
        }

        isOver = isOverMinWidth(this);

        $(window).on('keyup.fxp.sidebar' + this.guid, null, this, keyboardAction);
        $(window).on('resize.fxp.sidebar' + this.guid, null, this, onResizeWindow);

        if (this.$element.hasClass(this.options.classOpen + '-init')) {
            if (isOver) {
                this.$element.addClass(this.options.classOpen);

            } else {
                this.$element
                    .removeClass(this.options.classOpen)
                    .removeClass(this.options.classForceOpen)
                ;
            }

            this.$element.removeClass(this.options.classOpen + '-init');
        }

        if (this.$element.hasClass(this.options.classOpen) && !isOver) {
            lockBodyScroll(this);
        } else {
            unlockBodyScroll(this);
        }

        if (this.options.closeOnSelect) {
            this.$element.on(this.eventType + '.fxp.sidebar' + this.guid, this.options.itemSelector, this, closeOnSelect);
        }

        this.$element.on(prefixedEvent('TransitionEnd', '.fxp.sidebar' + this.guid), null, this, onEndTransition);
        this.$obfuscator.on(this.eventType + '.fxp.sidebar' + this.guid, null, this, closeExternal);

        initScroller(this);
        initHammer(this);
        initWithLocalStorage(this);

        window.setTimeout(function () {
            changeTransition(self.$element, '');
            self.$element.addClass('sidebar-ready');
            triggerEvent('ready', self);
        }, 0);
    }

    /**
     * Get sidebar position.
     *
     * @returns {string} The position (left or right)
     */
    getPosition() {
        return this.options.position;
    }

    /**
     * Checks if sidebar is locked (always open).
     *
     * @returns {boolean}
     */
    isLocked() {
        return this.options.locked;
    }

    /**
     * Checks if sidebar is locked (always open).
     *
     * @returns {boolean}
     */
    isOpen() {
        return this.$element.hasClass(this.options.classOpen);
    }

    /**
     * Checks if sidebar is fully opened.
     *
     * @return {boolean}
     */
    isFullyOpened() {
        return this.$element.hasClass(this.options.classForceOpen);
    }

    /**
     * Checks if sidebar is closable.
     *
     * @return {boolean}
     */
    isClosable() {
        return this.enabled && this.isOpen() && !isOverMinWidth(this);
    }

    /**
     * Force open the sidebar.
     */
    forceOpen() {
        if (!this.enabled || (this.isOpen() && this.isFullyOpened())) {
            return;
        }

        cleanCloseDelay(this);
        this.$element.addClass(this.options.classForceOpen);
        this.$container.addClass('container-force-open-' + this.options.position);
        addClassToggles(this, this.options.classForceOpen + '-toggle');

        triggerEvent('force-open', this);
        this.open();
    }

    /**
     * Force close the sidebar.
     */
    forceClose() {
        if (!this.enabled || !this.isOpen() || (this.isLocked() && isOverMinWidth(this))) {
            return;
        }

        cleanCloseDelay(this);
        removeClassToggles(this, this.options.classForceOpen + '-toggle');
        this.$container.removeClass('container-force-open-' + this.options.position);
        this.$element.removeClass(this.options.classForceOpen);

        triggerEvent('force-close', this);
        this.close();
    }

    /**
     * Open the sidebar.
     */
    open() {
        if (!this.enabled || this.isOpen()) {
            return;
        }

        triggerEvent('open', this);
        cleanCloseDelay(this);
        $('[data-sidebar=true]').sidebar('forceClose');
        this.$element.addClass(this.options.classOpen);
    }

    /**
     * Close open the sidebar.
     *
     * @this Sidebar
     */
    close() {
        if (!this.enabled || !this.isOpen() || (this.isFullyOpened() && isOverMinWidth(this))) {
            return;
        }

        triggerEvent('close', this);
        cleanCloseDelay(this);
        this.$element.removeClass(this.options.classOpen);
    }

    /**
     * Toggle the sidebar ("close, "open", "force open").
     *
     * @param {jQuery.Event|Event} [event]
     *
     * @typedef {Sidebar} Event.data The sidebar instance
     */
    toggle(event) {
        let self = (undefined !== event) ? event.data : this;

        if (!self.enabled) {
            return;
        }

        if (undefined !== event) {
            event.stopPropagation();
            event.preventDefault();
        }

        triggerEvent('toggle', this);

        if (self.options.toggleOnClick) {
            self.options.locked = !self.options.locked;
            setLocalStorage(self, self.options.storageLockedKey, self.options.locked);
        }

        if (self.isOpen()) {
            if (self.isFullyOpened()) {
                self.forceClose();

            } else if (isOverMinWidth(self) && $.inArray(self.options.forceToggle, [FORCE_TOGGLE, FORCE_TOGGLE_ALWAYS]) >= 0) {
                self.forceOpen();

            } else {
                self.close();
            }

        } else if (isOverMinWidth(self) && FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
            self.forceOpen();

        } else {
            self.open();
        }
    }

    /**
     * Refresh the scroller.
     */
    refresh() {
        triggerEvent('refresh', this);

        if ($.fn.scroller && this.options.useScroller) {
            this.$element.scroller('refresh');
        }
    }

    /**
     * Attach a toggle button.
     *
     * @param {string|HTMLElement|object|jQuery} $toggle
     */
    attachToggle($toggle) {
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

        $toggle.on(this.eventType + '.fxp.sidebar' + this.guid, null, this, this.toggle);

        if (!mobileCheck() && this.options.toggleOpenOnHover) {
            $toggle.on('mouseover.fxp.sidebar' + this.guid, $.proxy(this.open, this));
        }

        this.$toggles.push($toggle);
    }

    /**
     * Detach a toggle button.
     *
     * @param {string|HTMLElement|object|jQuery} $toggle
     */
    detachToggle($toggle) {
        let size = this.$toggles.length,
            i;

        $toggle = $($toggle);

        for (i = 0; i < size; ++i) {
            if (this.$toggles[i][0] === $toggle[0]) {
                doDetachToggle(this, this.$toggles[i]);
                this.$toggles.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Detach a toggle button.
     */
    detachToggles() {
        let size = this.$toggles.length,
            i;

        for (i = 0; i < size; ++i) {
            doDetachToggle(this, this.$toggles[i]);
        }

        this.$toggles.splice(0, size);
    }

    /**
     * Checks if sidebar is enabled.
     *
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Disable the sidebar.
     */
    disable() {
        let prevIsLocked = this.isLocked();

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
    }

    /**
     * Enable the sidebar.
     */
    enable() {
        if (this.enabled) {
            return;
        }

        triggerEvent('enable', this);
        this.enabled = true;
        this.$element.removeClass('sidebar-disabled');

        if (isOverMinWidth(this) && FORCE_TOGGLE_ALWAYS === this.options.forceToggle) {
            this.forceOpen();
        }

        removeClassToggles(this, 'disabled');

        if (this.isLocked()) {
            removeClassToggles(this, this.options.classLocked + '-toggle-disabled');
        }
    }

    /**
     * Destroy the instance.
     */
    destroy() {
        cleanCloseDelay(this);
        this.detachToggles();
        this.forceClose();
        this.$container.removeClass('container-mini-' + this.options.position);
        this.$container.removeClass('container-full-locked');
        $(window).off('keyup.fxp.sidebar' + this.guid, keyboardAction);
        $(window).off('resize.fxp.sidebar' + this.guid, onResizeWindow);
        this.$element.off(this.eventType + '.fxp.sidebar' + this.guid, this.options.itemSelector, closeOnSelect);
        this.$element.off(prefixedEvent('TransitionEnd', '.fxp.sidebar' + this.guid), onEndTransition);
        this.$obfuscator.off(this.eventType + '.fxp.sidebar' + this.guid, closeExternal);

        destroyHammer(this);
        destroyScroller(this);
        unlockBodyScroll(this);

        this.$wrapper.before(this.$element);
        this.$wrapper.remove();

        this.$element.removeClass('sidebar-ready');

        super.destroy();
    }
}



/**
 * Defaults options.
 */
Sidebar.defaultOptions = {
    classWrapper:       'sidebar-wrapper',
    classContainer:     'container-main',
    classOpen:          'sidebar-open',
    classLocked:        'sidebar-locked',
    classFullLocked:    'sidebar-full-locked',
    classForceOpen:     'sidebar-force-open',
    classOnDragging:    'sidebar-dragging',
    classObfuscator:     'sidebar-obfuscator',
    forceToggle:        FORCE_TOGGLE_NO,
    locked:             false,
    position:           POSITION_LEFT,
    minLockWidth:       992,
    toggleId:           null,
    toggleOpenOnHover:  false,
    toggleOnClick:      false,
    saveConfig:         false,
    storageLockedKey:   'fxp/sidebar/locked',
    clickableSwipe:     false,
    draggable:          true,
    closeOnSelect:      true,
    closeOnSelectDelay: 0.5,
    resetScrollDelay:   0.3,
    itemSelector:       '.sidebar-menu a',
    showObfuscator:     true,
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

pluginify('sidebar', 'fxp.sidebar', Sidebar, true, '[data-sidebar="true"]');

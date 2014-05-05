/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global jQuery*/
/*global window*/
/*global document*/
/*global CSSMatrix*/
/*global WebKitCSSMatrix*/
/*global MSCSSMatrix*/
/*global Hammer*/
/*global CustomEvent*/

/**
 * @param {jQuery} $
 *
 * @typedef {NavScroll} NavScroll
 */
(function ($) {
    'use strict';

    /**
     * Get the vertical position of target element.
     *
     * @param {jQuery} $target
     *
     * @returns {number}
     *
     * @private
     */
    function getPosition($target) {
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
     * Limits the horizontal value with top or right wrapper position (with or
     * without the max bounce).
     *
     * @param {NavScroll} self      The nav scroll instance
     * @param {Event}     event
     * @param {number}    maxBounce
     * @param {boolean}   [inertia]
     *
     * @returns {number} The limited horizontal value
     *
     * @private
     */
    function limitHorizontalValue(self, event, maxBounce, inertia) {
        var wrapperWidth,
            height,
            maxScroll,
            horizontal,
            inertiaVal,
            dragStartPosition = 'dragStartPosition';

        if (undefined === self.dragStartPosition) {
            self[dragStartPosition] = getPosition(self.$content);
        }

        wrapperWidth = self.$element.innerWidth();
        height = self.$content.outerWidth();
        maxScroll = height - wrapperWidth + maxBounce;
        horizontal = -Math.round(event.gesture.deltaX + self.dragStartPosition);

        // inertia
        if (inertia) {
            inertiaVal = -event.gesture.deltaX * event.gesture.velocityX * (1 + self.options.inertiaVelocity);
            horizontal = Math.round(horizontal + inertiaVal);
        }

        // top bounce
        if (horizontal < -maxBounce) {
            horizontal = -maxBounce;

        // right bounce with scroll
        } else if (height > wrapperWidth) {
            if (horizontal > maxScroll) {
                horizontal = maxScroll;
            }

        // right bounce without scroll
        } else {
            if (0 === maxBounce) {
                horizontal = 0;

            } else if (horizontal > maxBounce) {
                horizontal = maxBounce;
            }
        }

        return horizontal;
    }

    /**
     * Action on mouse drag end for block click action.
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function onDragEndClick(event) {
        event.preventDefault();
        event.stopPropagation();
        $(event.target).off('click.st.navscroll', onDragEndClick);
    }

    /**
     * Changes the css transition configuration on target element.
     *
     * @param {NavScroll} self         The nav scroll instance
     * @param {jQuery}    $target      The element to edited
     * @param {string}    [transition] The css transition configuration of target
     *
     * @private
     */
    function changeTransition(self, $target, transition) {
        if (undefined === transition) {
            transition = 'transform ' + self.options.inertiaDuration + 's';

            if (null !== self.options.inertiaFunction) {
                transition += ' ' + self.options.inertiaFunction;
            }
        }

        if ('' === transition) {
            $target.css('-webkit-transition', transition);
            $target.css('transition', transition);
        }

        $target.get(0).style['-webkit-transition'] = 'none' === transition ? transition : '-webkit-' + transition;
        $target.get(0).style.transition = transition;
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
     * Refreshes the left and right indicator, depending of the presence of
     * items.
     *
     * @param {NavScroll} self The nav scroll instance
     *
     * @private
     */
    function refreshIndicator(self) {
        var wrapperPosition = parseInt(self.$element.position().left, 10),
            position = parseInt(self.$content.position().left, 10) - wrapperPosition,
            rightPosition = position + self.$content.outerWidth(),
            maxRight = self.$element.innerWidth();

        if (position < 0) {
            self.$element.addClass('nav-scrollable-has-previous');

        } else {
            self.$element.removeClass('nav-scrollable-has-previous');
        }

        if (rightPosition > maxRight) {
            self.$element.addClass('nav-scrollable-has-next');

        } else {
            self.$element.removeClass('nav-scrollable-has-next');
        }

        if (undefined !== self.$dropdownToggle) {
            self.$dropdownToggle.dropdown('toggle');
        }
    }

    /**
     * Action on mouse scroll event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @private
     */
    function onMouseScroll(event) {
        var self = event.data,
            position = -getPosition(self.$content),
            wrapperWidth = self.$element.innerWidth(),
            contentWidth = self.$content.outerWidth(),
            delta = (event.originalEvent.type === 'DOMMouseScroll' ?
                    event.originalEvent.detail * -40 :
                    event.originalEvent.wheelDelta);

        if (!(delta > 0 && position <= 0) && !(delta <= 0 && (contentWidth - position) <= wrapperWidth)) {
            event.stopPropagation();
            event.preventDefault();
        }

        position -= delta;
        position = Math.max(position, 0);

        if (self.$content.outerWidth() <= self.$element.innerWidth()) {
            position = 0;

        } else if ((contentWidth - position) < wrapperWidth) {
            position = contentWidth - wrapperWidth;
        }

        changeTransition(self, self.$content, 'none');
        changeTransform(self.$content, 'translate3d(' + -position + 'px, 0px, 0px)');
        refreshIndicator(self);
    }

    /**
     * Prevent scroll event (blocks the scroll on the tab keyboard event with
     * the item is outside the wrapper).
     *
     * @param {jQuery.Event|Event} event
     *
     * @private
     */
    function preventScroll(event) {
        $(event.target).eq(0).scrollLeft(0);
    }

    /**
     * Action on hide dropdown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @private
     */
    function onHideDropdown(event) {
        var self = event.data;

        if (undefined === self.$dropdownMenu) {
            return;
        }

        self.$dropdownRestoreMenu.after(self.$dropdownMenu);
        self.$dropdownRestoreMenu.remove();
        self.$dropdownMenu.removeClass('dropdown-nav-scrollable');
        self.$dropdownMenu.removeAttr('data-dropdown-restore-id');
        self.$dropdownMenu.css('left', '');
        self.$dropdownMenu.css('top', '');

        delete self.$dropdownToggle;
        delete self.$dropdownMenu;
        delete self.$dropdownRestoreMenu;
    }

    /**
     * Action on show dropdown event.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @private
     */
    function onShowDropdown(event) {
        var self = event.data,
            ddId = 'dropdown-menu-original-' + self.guid;

        if (undefined !== self.$dropdownMenu) {
            onHideDropdown(event);
        }

        self.$dropdownToggle = $('> .dropdown-toggle', event.target);
        self.$dropdownMenu = $('> .dropdown-menu', event.target);
        self.$dropdownMenu.attr('data-dropdown-restore-id', ddId);
        self.$dropdownRestoreMenu = $('<div class="dropdown-menu-restore-position"></div>');
        self.$dropdownRestoreMenu.attr('data-dropdown-restore-for', ddId);
        self.$dropdownMenu.after(self.$dropdownRestoreMenu);
        self.$dropdownMenu.addClass('dropdown-nav-scrollable');
        self.$dropdownMenu.css('left', Math.max(0, $(event.target).position().left));

        if (!self.$dropdownMenu.parent().hasClass('navbar')) {
            self.$dropdownMenu.css('top', $(event.target).position().top + $(event.target).outerHeight());
        }

        self.$element.before(self.$dropdownMenu);
    }

    /**
     * Refresh the indicator on end of scroll inertia transition.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @private
     */
    function dragTransitionEnd(event) {
        var self = event.data;

        self.$content.off('transitionend msTransitionEnd oTransitionEnd', dragTransitionEnd);
        refreshIndicator(self);
    }

    // NAV SCROLL CLASS DEFINITION
    // ===========================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @this NavScroll
     */
    var NavScroll = function (element, options) {
        this.guid       = jQuery.guid;
        this.options    = $.extend({}, NavScroll.DEFAULTS, options);
        this.$element   = $(element);
        this.$content   = $('.' + this.options.classNav, this.$element);

        this.$element.on('DOMMouseScroll mousewheel', null, this, onMouseScroll);
        this.$element.on('show.bs.dropdown.st.nav-scroll', null, this, onShowDropdown);
        this.$element.on('hide.bs.dropdown.st.nav-scroll', null, this, onHideDropdown);
        this.$element.on('scroll.st.nav-scroll', preventScroll);
        $(window).on('resize.st.navscroll' + this.guid, null, this, this.resizeScroll);

        refreshIndicator(this);

        this.hammer = new Hammer(this.$element.get(0), {
            tap: false,
            transform: false,
            release: false,
            hold: false,
            swipe: false,
            drag_block_horizontal: true,
            drag_lock_to_axis: true,
            drag_min_distance: 3
        })

            .on('drag', this.onDrag)
            .on('dragend', this.onDragEnd);
    },
        old;

    /**
     * Defaults options.
     *
     * @type {object}
     */
    NavScroll.DEFAULTS = {
        classNav:        'nav',
        maxBounce:       100,
        inertiaVelocity: 0.7,
        inertiaDuration: 0.2,
        inertiaFunction: 'ease'
    };

    /**
     * On drag action.
     *
     * @param {Event} event The hammer event
     *
     * @typedef {object} Event.gesture The hammer object event
     *
     * @this Element
     */
    NavScroll.prototype.onDrag = function (event) {
        /* @type NavScroll */
        var self = $(this).data('st.navscroll'),
            horizontal;

        if (Hammer.DIRECTION_LEFT === event.gesture.direction || Hammer.DIRECTION_RIGHT === event.gesture.direction) {
            horizontal = limitHorizontalValue(self, event, self.options.maxBounce);

            changeTransition(self, self.$content, 'none');
            changeTransform(self.$content, 'translate3d(' + -horizontal + 'px, 0px, 0px)');
            refreshIndicator(self);
        }
    };

    /**
     * On drag end action.
     *
     * @param {Event} event The hammer event
     *
     * @typedef {object} Event.gesture The hammer object event
     *
     * @this Element
     */
    NavScroll.prototype.onDragEnd = function (event) {
        /* @type NavScroll */
        var self = $(this).data('st.navscroll'),
            horizontal,
            dragStartPosition = 'dragStartPosition';

        changeTransition(self, self.$content);

        if (Hammer.DIRECTION_LEFT === event.gesture.direction || Hammer.DIRECTION_RIGHT === event.gesture.direction) {
            horizontal = limitHorizontalValue(self, event, 0, true);

            self.$content.on('transitionend msTransitionEnd oTransitionEnd', null, self, dragTransitionEnd);
            changeTransform(self.$content, 'translate3d(' + -horizontal + 'px, 0px, 0px)');
        }

        $(event.target).on('click.st.navscroll', onDragEndClick);
        refreshIndicator(self);

        delete self[dragStartPosition];
    };

    /**
     * Resizes the scoll content.
     * Moves the content on side if the side content is above of side wrapper.
     *
     * @param {jQuery.Event|Event} [event]
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @this NavScroll|window
     */
    NavScroll.prototype.resizeScroll = function (event) {
        var self = (undefined !== event) ? event.data : this,
            position = self.$content.position().left,
            rightPosition,
            maxRight;

        if (position >= 0) {
            changeTransition(self, self.$content, 'none');
            changeTransform(self.$content, 'translate3d(0px, 0px, 0px)');
            refreshIndicator(self);

            return;
        }

        rightPosition = position + self.$content.outerWidth();
        maxRight = self.$element.innerWidth();

        if (rightPosition < maxRight) {
            position += maxRight - rightPosition;

            changeTransition(self, self.$content, 'none');
            changeTransform(self.$content, 'translate3d(' + position + 'px, 0px, 0px)');
            refreshIndicator(self);
        }
    };

    /**
     * Destroy instance.
     *
     * @this NavScroll
     */
    NavScroll.prototype.destroy = function () {
        var event = new CustomEvent('destroy');
        event.data = this;
        onHideDropdown(event);
        this.$element.off('DOMMouseScroll mousewheel', onMouseScroll);
        this.$element.off('show.bs.dropdown.st.nav-scroll', onShowDropdown);
        this.$element.off('hide.bs.dropdown.st.nav-scroll', onHideDropdown);
        this.$element.off('scroll.st.nav-scroll', preventScroll);
        this.$element.removeData('st.navscroll');
        $(window).off('resize.st.navscroll' + this.guid, this.resizeScroll);
    };


    // NAV SCROLL PLUGIN DEFINITION
    // ============================

    function Plugin(option, value) {
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.navscroll'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.navscroll', (data = new NavScroll(this, options)));
            }

            if (typeof option === 'string') {
                data[option](value);
            }
        });
    }

    old = $.fn.navScroll;

    $.fn.navScroll             = Plugin;
    $.fn.navScroll.Constructor = NavScroll;


    // NAV SCROLL NO CONFLICT
    // ======================

    $.fn.navScroll.noConflict = function () {
        $.fn.navScroll = old;

        return this;
    };


    // NAV SCROLL DATA-API
    // ===================

    $(window).on('load', function () {
        $('[data-nav-scroll="true"]').each(function () {
            var $this = $(this);
            Plugin.call($this, $this.data());
        });
    });

}(jQuery));

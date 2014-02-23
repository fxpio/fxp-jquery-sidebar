/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

+function ($) {
    'use strict';

    // HAMMER SCROLL CLASS DEFINITION
    // ==============================

    /**
     * @constructor
     *
     * @param htmlString|Element|Array|jQuery element
     * @param Array                           options
     *
     * @this
     */
    var HammerScroll = function (element, options) {
        this.guid     = jQuery.guid;
        this.options  = $.extend({}, HammerScroll.DEFAULTS, options);
        this.$element = $(element);

        if (this.options.hammerStickyHeader && $.fn.stickyheader) {
            this.stickyHeader = this.$element.stickyheader().data('st.stickyheader');
        }

        this.$element.css('overflow-y', 'hidden');
        this.$content = wrapContent.apply(this);

        if (null != this.$element.css('right')) {
            this.$element.css('right', 0);
        }

        if (!this.options.useScroll) {
            $(window).on('resize.st.hammerscroll' + this.guid, $.proxy(this.resizeScroll, this));
        }

        if (this.options.scrollbar) {
            this.$scrollbar = generateScrollbar.apply(this);
            this.resizeScrollbar();

            $(window).on('resize.st.hammerscroll-bar' + this.guid, $.proxy(this.resizeScrollbar, this));
        }

        this.$element.on('DOMMouseScroll mousewheel', $.proxy(onMouseScroll, this));

        if (!this.options.eventDelegated) {
            this.hammer = new Hammer(this.$element.get(0), {
                tap: false,
                transform: false,
                release: false,
                hold: false,
                swipe: false,
                drag_block_vertical: true,
                drag_lock_to_axis: true,
                drag_min_distance: 3
            })

            .on('drag', $.proxy(this.onDrag, this))
            .on('dragend', $.proxy(this.onDragEnd, this));
        }
    };

    /**
     * Defaults options.
     *
     * @type Array
     */
    HammerScroll.DEFAULTS = {
        contentWrapperClass: 'hammer-scroll-content',
        maxBounce:           100,
        eventDelegated:      false,
        hammerStickyHeader:  false,
        inertiaVelocity:     0.7,
        inertiaDuration:     0.2,
        inertiaFunction:     'ease',
        scrollbar:           true,
        scrollbarInverse:    false,
        useScroll:           false
    };

    /**
     * On drag action.
     * 
     * @param Event event The hammer event
     */
    HammerScroll.prototype.onDrag = function (event) {
        if ('up' == event.gesture.direction || 'down' == event.gesture.direction) {
            if (this.options.useScroll) {
                var vertical = $.proxy(limitVerticalValue, this)(event, 0);

                this.$element.scrollTop(vertical);
                $.proxy(refreshScrollbarPosition, this)(false, this.$element.scrollTop());

            } else {
                var vertical = $.proxy(limitVerticalValue, this)(event, this.options.maxBounce);

                $.proxy(changeTransition, this)(this.$content, 'none');
                $.proxy(changeTransform, this)(this.$content, 'translate3d(0px, ' + -vertical + 'px, 0px)');
                $.proxy(refreshScrollbarPosition, this)(false, -vertical);
            }

            if (undefined != this.stickyHeader) {
                this.stickyHeader.checkPosition();
            }
        }
    };

    /**
     * On drag end action.
     * 
     * @param Event event The hammer event
     */
    HammerScroll.prototype.onDragEnd = function (event) {
        if (this.options.useScroll) {
            if ('up' == event.gesture.direction || 'down' == event.gesture.direction) {
                var vertical = $.proxy(limitVerticalValue, this)(event, 0, true);

                this.$element.animate({
                    scrollTop: vertical
                }, this.options.inertiaDuration * 1000, $.proxy(dragTransitionEnd, this));

                $.proxy(refreshScrollbarPosition, this)(true, vertical);
            }

        } else {
            $.proxy(changeTransition, this)(this.$content);

            if ('up' == event.gesture.direction || 'down' == event.gesture.direction) {
                var vertical = $.proxy(limitVerticalValue, this)(event, 0, true);

                this.$content.on('transitionend msTransitionEnd oTransitionEnd', $.proxy(dragTransitionEnd, this));
                $.proxy(changeTransform, this)(this.$content, 'translate3d(0px, ' + -vertical + 'px, 0px)');
                $.proxy(refreshScrollbarPosition, this)(true, -vertical);
            }
        }

        delete this.dragStartPosition;
    };

    /**
     * Destroy instance.
     *
     * @this
     */
    HammerScroll.prototype.destroy = function () {
        this.$content = unwrapContent.apply(this);
        this.$element.css('overflow-y', '');
        this.$element.off('DOMMouseScroll mousewheel', $.proxy(onMouseScroll, this));
        $(window).off('resize.st.hammerscroll' + this.guid, $.proxy(this.resizeScroll, this));
        $(window).off('resize.st.hammerscroll-bar' + this.guid, $.proxy(this.resizeScrollbar, this));

        if (!this.options.eventDelegated) {
            this.hammer.dispose();
        }

        if (undefined != this.stickyHeader) {
            this.stickyHeader.destroy();
        }

        this.$element.removeData('st.hammerscroll');
    };

    /**
     * Resizes the scoll content.
     * Moves the content on bottom if the bottom content is above of bottom
     * wrapper.
     *
     * @this
     */
    HammerScroll.prototype.resizeScroll = function () {
        if (this.options.useScroll) {
            return;
        }

        var position = this.$content.position()['top'];

        if (position >= 0) {
            $.proxy(changeTransition, this)(this.$content, 'none');
            $.proxy(changeTransform, this)(this.$content, 'translate3d(0px, 0px, 0px)');

            return;
        }

        var bottomPosition = position + this.$content.outerHeight();
        var maxBottom = this.$element.innerHeight();

        if (bottomPosition < maxBottom) {
            position += maxBottom - bottomPosition;

            $.proxy(changeTransition, this)(this.$content, 'none');
            $.proxy(changeTransform, this)(this.$content, 'translate3d(0px, ' + position + 'px, 0px)');
        }
    };

    /**
     * Resizes the scrollbar.
     *
     * @this
     */
    HammerScroll.prototype.resizeScrollbar = function () {
        if (undefined == this.$scrollbar) {
            return;
        }

        var useScroll = this.options.useScroll;
        var wrapperHeight = this.$element.innerHeight();
        var contentHeight = useScroll ? this.$element.get(0).scrollHeight : this.$content.outerHeight();
        var height = Math.round(wrapperHeight * Math.min(wrapperHeight / contentHeight, 1));
        var top = useScroll ? this.$element.scrollTop() : this.$content.position()['top'];

        if (height < wrapperHeight) {
            this.$scrollbar.addClass('hammer-scroll-active');

        } else {
            this.$scrollbar.removeClass('hammer-scroll-active');
        }

        this.$scrollbar.height(height);
        $.proxy(refreshScrollbarPosition, this)(false, top);
    };

    /**
     * Refresh the sticky header on end of scroll inertia transition.
     *
     * @this
     * @private
     */
    function dragTransitionEnd () {
        var top = this.options.useScroll ? this.$element.scrollTop() : this.$content.position()['top'];

        this.$content.off('transitionend msTransitionEnd oTransitionEnd', $.proxy(dragTransitionEnd, this));
        $.proxy(refreshScrollbarPosition, this)(true, top);

        if (undefined != this.stickyHeader) {
            this.stickyHeader.checkPosition();
        }
    }

    /**
     * Limits the vertical value with top or bottom wrapper position (with or
     * without the max bounce).
     *
     * @param Event   event
     * @param Integer maxBounce
     * @param Boolean inertia
     *
     * @return Integer The limited vertical value
     *
     * @this
     * @private
     */
    function limitVerticalValue (event, maxBounce, inertia) {
        var useScroll = this.options.useScroll;

        if (undefined == this.dragStartPosition) {
            this.dragStartPosition = useScroll ? -this.$element.scrollTop() : getPosition(this.$content);
        }

        var wrapperHeight = this.$element.innerHeight();
        var height = useScroll ? this.$element.get(0).scrollHeight : this.$content.outerHeight();
        var maxScroll = height - wrapperHeight + maxBounce;
        var vertical = -Math.round(event.gesture.deltaY + this.dragStartPosition);

        // inertia
        if (inertia) {
            var inertiaVal = -event.gesture.deltaY * event.gesture.velocityY * (1 + this.options.inertiaVelocity);
            vertical = Math.round(vertical + inertiaVal);
        }

        // top bounce
        if (vertical < -maxBounce) {
            vertical = -maxBounce;

        // bottom bounce with scroll
        } else if (height > wrapperHeight) {
            if (vertical > maxScroll) {
                vertical = maxScroll;
            }

        // bottom bounce without scroll
        } else {
            if (0 == maxBounce) {
                vertical = 0;

            } else if (vertical > maxBounce) {
                vertical = maxBounce;
            }
        }

        return vertical;
    }

    /**
     * Wraps the content.
     *
     * @return jQuery The content
     *
     * @this
     * @private
     */
    function wrapContent () {
        var $content = $([
            '<div class="' + this.options.contentWrapperClass + '"></div>'
        ].join(''));

        if (this.options.useScroll) {
            this.$element.before($content);
            $content.append(this.$element);

        } else {
            this.$element.children().each(function () {
                $content.append(this);
            });

            this.$element.append($content);
        }

        return $content;
    }

    /**
     * Unwraps the content.
     *
     * @return null
     *
     * @this
     * @private
     */
    function unwrapContent () {
        var self = this;

        if (this.options.useScroll) {
            this.$content.before(this.$element);

        } else {
            this.$content.children().each(function () {
                self.$element.append(this);
            });
        }

        this.$content.remove();

        return null;
    }

    /**
     * Creates the scrollbar.
     *
     * @return jQuery The scrollbar
     *
     * @this
     * @private
     */
    function generateScrollbar () {
        var $scrollbar = $('<div class="hammer-scrollbar"></div>');

        if (this.options.scrollbarInverse) {
            $scrollbar.addClass('hammer-scroll-inverse');
        }

        if (this.options.useScroll) {
            this.$content.prepend($scrollbar);

        } else {
            this.$element.prepend($scrollbar);
        }

        return $scrollbar;
    }

    /**
     * Refreshs the scrollbar position.
     *
     * @param Boolean usedTransition Used the transition
     * @param Decimal position       The new position of content
     *
     * @return jQuery The content
     *
     * @this
     * @private
     */
    function refreshScrollbarPosition (usedTransition, position) {
        if (undefined == this.$scrollbar) {
            return;
        }

        var useScroll = this.options.useScroll;
        var wrapperHeight = this.$element.innerHeight();
        var contentHeight = useScroll ? this.$element.get(0).scrollHeight : this.$content.outerHeight();
        var percentScroll = (useScroll ? position : -position) / (contentHeight - wrapperHeight);
        var delta = Math.round(percentScroll * (wrapperHeight - this.$scrollbar.outerHeight()));

        $.proxy(changeTransition, this)(this.$scrollbar, usedTransition ? undefined : 'none');
        $.proxy(changeTransform, this)(this.$scrollbar, 'translate3d(0px, ' + delta + 'px, 0px)');
    }

    /**
     * Action on mouse scroll event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onMouseScroll (event) {
        if (this.options.useScroll) {
            var delta = (event.originalEvent.type == 'DOMMouseScroll' ?
                    event.originalEvent.detail * -40 :
                        event.originalEvent.wheelDelta);
            var position = this.$element.scrollTop() - delta;

            event.stopPropagation();
            event.preventDefault();
            this.$element.scrollTop(position);
            $.proxy(refreshScrollbarPosition, this)(false, this.$element.scrollTop());

            if (undefined != this.stickyHeader) {
                this.stickyHeader.checkPosition();
            }

            return;
        }

        var position = -this.$content.position()['top'];
        var wrapperHeight = this.$element.innerHeight();
        var contentHeight = this.$content.outerHeight();
        var delta = (event.originalEvent.type == 'DOMMouseScroll' ?
                event.originalEvent.detail * -40 :
                event.originalEvent.wheelDelta);

        event.stopPropagation();
        event.preventDefault();

        position -= delta;
        position = Math.max(position, 0);

        if (this.$content.outerHeight() <= this.$element.innerHeight()) {
            position = 0;

        } else if ((contentHeight - position) < wrapperHeight) {
            position = contentHeight - wrapperHeight;
        }

        $.proxy(changeTransition, this)(this.$content, 'none');
        $.proxy(changeTransform, this)(this.$content, 'translate3d(0px, ' + -position + 'px, 0px)');
        $.proxy(refreshScrollbarPosition, this)(false, -position);

        if (undefined != this.stickyHeader) {
            this.stickyHeader.checkPosition();
        }
    }

    /**
     * Get the vertical position of target element.
     *
     * @param jQuery $target
     *
     * @return Integer
     *
     * @this
     * @private
     */
    function getPosition ($target) {
        var transformCss = $target.css('transform');
        var transform = {e: 0, f: 0};

        if (transformCss) {
            if ('function' === typeof CSSMatrix) {
                transform = new CSSMatrix(transformCss);

            } else if ('function' === typeof WebKitCSSMatrix) {
                transform = new WebKitCSSMatrix(transformCss);

            } else if ('function' === typeof MSCSSMatrix) {
                transform = new MSCSSMatrix(transformCss);

            } else {
                var reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
                var match = transformCss.match(reMatrix);

                if (match) {
                    transform.e = parseInt(match[1]);
                    transform.f = parseInt(match[2]);
                }
            }
        }

        return transform.f;
    }

    /**
     * Changes the css transition configuration on target element.
     *
     * @param jQuery $target    The element to edited
     * @param String transition The css transition configuration of target
     *
     * @this
     * @private
     */
    function changeTransition ($target, transition) {
        if (undefined == transition) {
            transition = 'transform ' + this.options.inertiaDuration + 's';

            if (null != this.options.inertiaFunction) {
                transition += ' ' + this.options.inertiaFunction;
            }
        }

        if ('' == transition) {
            $target.css('-webkit-transition', transition);
            $target.css('transition', transition);
        }

        $target.get(0).style['-webkit-transition'] = 'none' == transition ? transition : '-webkit-' + transition;
        $target.get(0).style['transition'] = transition;
    }

    /**
     * Changes the css transform configuration on target element.
     *
     * @param jQuery $target   The element to edited
     * @param String transform The css transform configuration of target
     *
     * @this
     * @private
     */
    function changeTransform ($target, transform) {
        $target.css('-webkit-transform', transform);
        $target.css('transform', transform);
    }


    // HAMMER SCROLL PLUGIN DEFINITION
    // ===============================

    var old = $.fn.hammerScroll;

    $.fn.hammerScroll = function (option, _relatedTarget) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('st.hammerscroll');
            var options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.hammerscroll', (data = new HammerScroll(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.hammerScroll.Constructor = HammerScroll;


    // HAMMER SCROLL NO CONFLICT
    // =========================

    $.fn.hammerScroll.noConflict = function () {
        $.fn.hammerScroll = old;

        return this;
    };


    // HAMMER SCROLL DATA-API
    // ======================

    $(window).on('load', function () {
        $('[data-hammer-scroll="true"]').each(function () {
            var $this = $(this);
            $this.hammerScroll($this.data());
        });
    });

}(jQuery);

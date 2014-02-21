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

    var HammerScroll = function (element, options) {
        this.options  = $.extend({}, HammerScroll.DEFAULTS, options);
        this.$element = $(element);

        if (this.options.hammerStickyHeader && $.fn.stickyheader) {
            this.stickyHeader = this.$element.stickyheader().data('st.stickyheader');
        }

        this.$content = wrapContent.apply(this);

        if (null != this.$element.css('right')) {
            this.$element.css('right', 0);
        }

        this.$element.css('overflow-y', 'hidden');
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

    HammerScroll.DEFAULTS = {
        contentWrapperClass: 'hammer-scroll-content',
        maxBounce:           100,
        eventDelegated:      false,
        hammerStickyHeader:  false
    };

    /**
     * On drag action.
     * 
     * @param Event event The hammer event
     */
    HammerScroll.prototype.onDrag = function (event) {
        if (undefined == this.dragStartPosition) {
            this.dragStartPosition = getPosition(this.$content);
        }

        if ('up' == event.gesture.direction || 'down' == event.gesture.direction) {
            var wrapperHeight = this.$element.innerHeight();
            var height = this.$content.outerHeight();
            var maxScroll = height - wrapperHeight + this.options.maxBounce;
            var vertical = -Math.round(event.gesture.deltaY + this.dragStartPosition);

            // top bounce
            if (vertical < -this.options.maxBounce) {
                vertical = -this.options.maxBounce;

            // bottom bounce with scroll
            } else if (height > wrapperHeight) {
                if (vertical > maxScroll) {
                    vertical = maxScroll;
                }

            // bottom bounce without scroll
            } else {
                if (vertical > this.options.maxBounce) {
                    vertical = this.options.maxBounce;
                }
            }

            this.$content.css('-webkit-transition', 'none');
            this.$content.css('transition', 'none');
            this.$content.css('-webkit-transform', 'translate3d(0px, ' + -vertical +'px, 0px)');
            this.$content.css('transform', 'translate3d(0px, ' + -vertical +'px, 0px)');

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
        this.$content.css('-webkit-transition', '');
        this.$content.css('transition', '');

        if ('up' == event.gesture.direction || 'down' == event.gesture.direction) {
            var wrapperHeight = this.$element.innerHeight();
            var height = this.$content.outerHeight();
            var maxScroll = height - wrapperHeight;
            var vertical = -Math.round(event.gesture.deltaY + this.dragStartPosition);

            // top bounce
            if (vertical < 0) {
                vertical = 0;

            // bottom bounce with scroll
            } else if (height > wrapperHeight) {
                if (vertical > maxScroll) {
                    vertical = maxScroll;
                }

            // bottom bounce without scroll
            } else {
                vertical = 0;
            }

            this.$content.css('-webkit-transform', 'translate3d(0px, ' + -vertical +'px, 0px)');
            this.$content.css('transform', 'translate3d(0px, ' + -vertical +'px, 0px)');
        }

        delete this.dragStartPosition;
    };

    HammerScroll.prototype.destroy = function () {
        this.$content = unwrapContent.apply(this);
        this.$element.css('overflow-y', '');
        this.$element.off('DOMMouseScroll mousewheel', $.proxy(onMouseScroll, this));

        if (!this.options.eventDelegated) {
            this.hammer.dispose();
        }

        if (undefined != this.stickyHeader) {
            this.stickyHeader.destroy();
        }
    };

    function wrapContent () {
        var $content = $([
            '<div class="' + this.options.contentWrapperClass + '"></div>'
        ].join(''));

        this.$element.children().each(function () {
            $content.append(this);
        });

        this.$element.append($content);

        return $content;
    }

    function unwrapContent () {
        var self = this;

        this.$content.children().each(function () {
            self.$element.append(this);
        });
        this.$content.remove();

        return null;
    }

    function onMouseScroll (event) {
        var wrapperHeight = this.$element.innerHeight();
        var contentHeight = this.$content.outerHeight();
        var delta = (event.originalEvent.type == 'DOMMouseScroll' ?
                event.originalEvent.detail * -40 :
                event.originalEvent.wheelDelta);

        event.stopPropagation();
        event.preventDefault();

        if (undefined == this.contentPosition) {
            this.contentPosition = getPosition(this.$content);
        }

        this.contentPosition -= delta;
        this.contentPosition = Math.max(this.contentPosition, 0);

        if (this.$content.outerHeight() <= this.$element.innerHeight()) {
            this.contentPosition = 0;

        } else if ((contentHeight - this.contentPosition) < wrapperHeight) {
            this.contentPosition = contentHeight - wrapperHeight;
        }

        this.$content.css('-webkit-transition', 'none');
        this.$content.css('transition', 'none');
        this.$content.css('-webkit-transform', 'translate3d(0px, ' + -this.contentPosition + 'px, 0px)');
        this.$content.css('transform', 'translate3d(0px, ' + -this.contentPosition + 'px, 0px)');

        if (undefined != this.stickyHeader) {
            this.stickyHeader.checkPosition();
        }
    }

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

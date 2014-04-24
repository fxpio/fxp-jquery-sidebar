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
/*global StickyHeader*/

/**
 * @param {jQuery} $
 *
 * @typedef {StickyHeader} StickyHeader
 */
(function ($) {
    'use strict';

    // STICKY HEADER CLASS DEFINITION
    // ==============================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @this StickyHeader
     */
    var StickyHeader = function (element, options) {
        this.guid       = jQuery.guid;
        this.options    = $.extend({}, StickyHeader.DEFAULTS, options);
        this.$element   = $(element);

        this.$element.on('scroll.st.stickyheader', $.proxy(StickyHeader.prototype.checkPosition, this));
        this.checkPosition();
    },
        old;

    /**
     * Defaults options.
     *
     * @type Array
     */
    StickyHeader.DEFAULTS = {
        classSticky: 'sticky-header'
    };

    /**
     * Checks the position of content and refresh the sticky header.
     *
     * @this StickyHeader
     */
    StickyHeader.prototype.checkPosition = function () {
        this.$element.find('> ul > li > span, div > ul > li > span').each($.proxy(function (index, element) {
            var $group = $(element),
                top = $group.position().top,
                $headerFind,
                $nextItemFind,
                $sticky;

            if (top >= 0) {
                this.$element.parent().find('> [data-sticky-index="' + index + '"]').remove();
                $group.removeAttr('data-sticky-ref');

                return;
            }

            $headerFind = this.$element.parent().find('> [data-sticky-index="' + index + '"]');
            $nextItemFind = $group.parent().next().find('> span, > a');

            if (0 === $headerFind.size()) {
                $sticky = $('<div class="' + $group.parent().attr('class') + ' ' + this.options.classSticky + '" data-sticky-index="' + index + '"></div>');
                $sticky.append($group.clone());
                $group.attr('data-sticky-ref', index);
                this.$element.parent().prepend($sticky);

            } else if ($nextItemFind.eq(0).size() > 0 && $nextItemFind.eq(0).position().top <= 0) {
                $headerFind.eq(0).css('display', 'none');

            } else {
                $headerFind.eq(0).css('display', '');
            }
        }, this));
    };

    /**
     * Destroy instance.
     *
     * @this StickyHeader
     */
    StickyHeader.prototype.destroy = function () {
        this.$element.off('scroll.st.stickyheader', $.proxy(StickyHeader.prototype.checkPosition, this));
        this.$element.parent().find('> .' + this.options.classSticky).remove();

        this.$element.removeData('st.stickyheader');
    };


    // STICKY HEADER PLUGIN DEFINITION
    // ===============================

    old = $.fn.stickyHeader;

    $.fn.stickyHeader = function (option, value) {
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.stickyheader'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.stickyheader', (data = new StickyHeader(this, options)));
            }

            if (typeof option === 'string') {
                data[option](value);
            }
        });
    };

    $.fn.stickyHeader.Constructor = StickyHeader;


    // STICKY HEADER NO CONFLICT
    // =========================

    $.fn.stickyHeader.noConflict = function () {
        $.fn.stickyHeader = old;

        return this;
    };


    // STICKY HEADER DATA-API
    // ======================

    $(window).on('load', function () {
        $('[data-sticky-header="true"]').each(function () {
            var $this = $(this);
            $this.stickyHeader($this.data());
        });
    });

}(jQuery));

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

    // STICKY HEADER CLASS DEFINITION
    // ==============================

    var StickyHeader = function (element, options) {
        this.guid       = jQuery.guid;
        this.options    = $.extend({}, StickyHeader.DEFAULTS, options);
        this.$element   = $(element);

        this.$element.on('scroll.st.stickyheader', $.proxy(StickyHeader.prototype.checkPosition, this));
        this.checkPosition();
    };

    StickyHeader.DEFAULTS = {
        classSticky: 'sticky-header'
    };

    StickyHeader.prototype.checkPosition = function () {
        this.$element.find('> ul > li > span').each($.proxy(function(index, element) {
            var $group = $(element);
            var top = $group.position()['top'];

            if (top > 0) {
                this.$element.parent().find('> [data-sticky-index="' + index + '"]').remove();
                $group.removeAttr('data-sticky-ref');

                return;
            }

            var $headerFind = this.$element.parent().find('> [data-sticky-index="' + index + '"]');
            var $nextItemFind = $group.parent().next().find('> span, > a');

            if (0 == $headerFind.size()) {
                var $sticky = $('<div class="' + $group.parent().attr('class') + ' ' + this.options.classSticky + '" data-sticky-index="' + index + '"></div>');
                $sticky.append($group.clone());
                $group.attr('data-sticky-ref', index);
                this.$element.parent().prepend($sticky);

            } else if ($nextItemFind.eq(0).size() > 0 && $nextItemFind.eq(0).position()['top'] <= 0) {
                $headerFind.eq(0).css('display', 'none');

            } else {
                $headerFind.eq(0).css('display', '');
            }
        }, this));
    };

    StickyHeader.prototype.destroy = function () {
        this.$element.off('scroll.st.stickyheader', $.proxy(StickyHeader.prototype.checkPosition, this));
        this.$element.parent().find('> .' + this.options.classSticky).remove();
    };


    // STICKY HEADER PLUGIN DEFINITION
    // ===============================

    var old = $.fn.stickyheader;

    $.fn.stickyheader = function (option, _relatedTarget) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('st.stickyheader');
            var options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.stickyheader', (data = new StickyHeader(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.stickyheader.Constructor = StickyHeader;


    // STICKY HEADER NO CONFLICT
    // =========================

    $.fn.stickyheader.noConflict = function () {
        $.fn.stickyheader = old;

        return this;
    };


    // STICKY HEADER DATA-API
    // ======================

    $(window).on('load', function () {
        $('[data-sticky-header="true"]').each(function () {
            var $this = $(this);
            $this.stickyheader($this.data());
        });
    });

}(jQuery);

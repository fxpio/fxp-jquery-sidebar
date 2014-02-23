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

    // SELECT2 HAMMER SCROLL CLASS DEFINITION
    // ======================================

    /**
     * @constructor
     *
     * @param htmlString|Element|Array|jQuery element
     * @param Array                           options
     *
     * @this
     */
    var Select2HammerScroll = function (element, options) {
        
    };

    /**
     * Defaults options.
     *
     * @type Array
     */
    Select2HammerScroll.DEFAULTS = {
        
    };

    /**
     * Destroy instance.
     *
     * @this
     */
    Select2HammerScroll.prototype.destroy = function () {
        
    };


    // SELECT2 HAMMER SCROLL PLUGIN DEFINITION
    // =======================================

    var old = $.fn.select2HammerScroll;

    $.fn.select2HammerScroll = function (option, _relatedTarget) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('st.select2hammerscroll');
            var options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.select2hammerscroll', (data = new Select2HammerScroll(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.select2HammerScroll.Constructor = Select2HammerScroll;


    // SELECT2 HAMMER SCROLL NO CONFLICT
    // =========================

    $.fn.select2HammerScroll.noConflict = function () {
        $.fn.select2HammerScroll = old;

        return this;
    };


    // SELECT2 HAMMER SCROLL DATA-API
    // ==============================

    $(window).on('load', function () {
        $('[data-select2-hammer-scroll="true"]').each(function () {
            var $this = $(this);
            $this.select2HammerScroll($this.data());
        });
    });

}(jQuery);

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

    // SIDEBAR CLASS DEFINITION
    // ========================

    var Sidebar = function (element, options) {
        this.guid           = jQuery.guid;
        this.options        = $.extend({}, Sidebar.DEFAULTS, options);
        this.$element       = $(element);
        this.$toggle        = $('.' + this.options.classToggle, this.$element);
        this.$wrapper       = $('.' + this.options.classWrapper, this.$element);
        this.eventType      = this.mobileCheck() ? 'touchstart' : 'click';
        this.scrollbarWidth = null;
        this.$element.attr('data-sidebar', 'true');

        if ('right' != this.options.position) {
            this.options.position = 'left';

        } else {
            this.$element.addClass('sidebar-right');
        }

        if (this.$element.hasClass('sidebar-right')) {
            this.options.position = 'right';
        }

        if (this.options.locked) {
            this.options.forceToggle = 'always';
            this.$element.css('-webkit-transition', 'none');
            this.$element.css('transition', 'none');
            this.$wrapper.css('-webkit-transition', 'none');
            this.$wrapper.css('transition', 'none');
            this.$element.addClass(this.options.classLocked);
            this.$element.addClass(this.options.classForceOpen);
            this.$wrapper.addClass(this.options.classOpen + '-init');
        }

        if(!this.mobileCheck() && this.options.openOnHover && null == this.options.toggleId) {
            this.$element.on('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
            this.$element.on('mouseout.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.close, this));
        }

        if (null != this.options.toggleId) {
            this.$toggle.remove();
            this.$toggle = $('#' + this.options.toggleId);

        } else {
            this.$element.addClass('sidebar-togglable');
        }

        this.$toggle.on(this.eventType + '.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.toggle, this));
        $(window).on( 'keyup.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.keyboardAction, this));
        $(window).on('resize.st.sidebar' + this.guid, $.proxy(onResizeWindow, this));

        if (this.$wrapper.hasClass(this.options.classOpen + '-init')) {
            if (isOverMinWidth.apply(this)) {
                this.$wrapper.addClass(this.options.classOpen);

            } else {
                this.$wrapper.removeClass(this.options.classOpen);
            }

            this.$wrapper.removeClass(this.options.classOpen + '-init');
        }

        if (this.$wrapper.hasClass(this.options.classOpen)) {
            $(document).on(this.eventType + '.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.closeExternal, this));
        }

        this.initSwipe();

        this.$element.css('-webkit-transition', '');
        this.$element.css('transition', '');
        this.$wrapper.css('-webkit-transition', '');
        this.$wrapper.css('transition', '');
    };

    Sidebar.DEFAULTS = {
        classToggle:      'sidebar-toggle',
        classWrapper:     'sidebar-wrapper',
        classOpen:        'sidebar-open',
        classLocked:      'sidebar-locked',
        classForceOpen:   'sidebar-force-open',
        classOnDragging:  'sidebar-dragging',
        openOnHover:      false,
        forceToggle:      false,//false, true, 'always'
        locked:           false,
        position:         'left',//left, right
        minLockWidth:     992,
        toggleId:         null,
        disabledKeyboard: false,
        keyboardEvent:    {
            ctrlKey:          true,
            shiftKey:         false,
            altKey:           true,
            keyCode:          'S'.charCodeAt(0)
        }
    };

    Sidebar.prototype.mobileCheck = function () {
        var check = false;

        (function (a) {
            if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
                check = true;
            }

        })(navigator.userAgent || navigator.vendor || window.opera);

        return check;
    };

    Sidebar.prototype.keyboardAction = function(event) {
        if (!event instanceof jQuery.Event || this.options.disabledKeyboard) {
            return;
        }

        var kbe = this.options.keyboardEvent;

        if (       event.shiftKey == kbe.shiftKey
                && event.ctrlKey  == kbe.ctrlKey
                && event.altKey   == kbe.altKey
                && event.keyCode  == kbe.keyCode) {
            this.toggle(event);
        }
    };

    Sidebar.prototype.getPosition = function () {
        return this.options.position;
    };

    Sidebar.prototype.isLocked = function () {
        return this.options.locked;
    };

    Sidebar.prototype.isOpen = function () {
        return this.$wrapper.hasClass(this.options.classOpen);
    };

    Sidebar.prototype.isFullyOpened = function () {
        return this.$element.hasClass(this.options.classForceOpen);
    };

    Sidebar.prototype.forceOpen = function () {
        if (this.isOpen() && this.isFullyOpened()) {
            return;
        }

        this.$element.addClass(this.options.classForceOpen);
        this.open();
    };

    Sidebar.prototype.forceClose = function () {
        if (!this.isOpen() || (this.isLocked() && isOverMinWidth.apply(this))) {
            return;
        }

        this.$element.removeClass(this.options.classForceOpen);
        this.close();
    };

    Sidebar.prototype.closeExternal = function (event) {
        var $target = $(event.currentTarget.activeElement);

        if ($(event.target).parents('.' + this.options.classWrapper).size() > 0 || $target.parents('.' + this.options.classWrapper).size() > 0 || $target.hasClass('sidebar-swipe')) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if (isOverMinWidth.apply(this)) {
            this.close();

        } else {
            this.forceClose();
        }
    };

    Sidebar.prototype.open = function () {
        if (this.isOpen()) {
            return;
        }

        $('[data-sidebar=true]').sidebar('forceClose');
        this.$wrapper.addClass(this.options.classOpen);
        $(document).on(this.eventType + '.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.closeExternal, this));
    };

    Sidebar.prototype.close = function () {
        if (!this.isOpen() || (this.isFullyOpened() && isOverMinWidth.apply(this))) {
            return;
        }

        this.$wrapper.removeClass(this.options.classOpen);
        $(document).off(this.eventType + '.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.closeExternal, this));
    };

    Sidebar.prototype.toggle = function (event) {
        if (event) {
            var $parents = $(event.target).parents('.' + this.options.classWrapper);
            event.stopPropagation();

            if ($(event.target).hasClass(this.options.classToggle) || $(event.target).parents('.' + this.options.classToggle).size() > 0) {
                event.preventDefault();
            }

            if ($parents.size() > 0 || $(event.target).hasClass('sidebar-swipe')) {
                return;
            }
        }

        if (this.isOpen()) {
            if (this.isFullyOpened()) {
                this.forceClose();

            } else if (isOverMinWidth.apply(this) && $.inArray(this.options.forceToggle, [true, 'always']) >= 0) {
                this.forceOpen();

            } else {
                this.close();
            }

        } else if (isOverMinWidth.apply(this) && 'always' == this.options.forceToggle) {
            this.forceOpen();

        } else {
            this.open();
        }
    };

    Sidebar.prototype.destroy = function () {
        if(!this.mobileCheck()) {
            this.$element.off('mouseover.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.open, this));
            this.$element.off('mouseout.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.close, this));
        }

        $(document).off(this.eventType + '.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.closeExternal, this));
        $(window).off('resize.st.sidebar' + this.guid, $.proxy(onResizeWindow, this));
        this.$toggle.off(this.eventType + '.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.toggle, this));
        $(window).off( 'keyup.st.sidebar' + this.guid, $.proxy(Sidebar.prototype.keyboardAction, this));
        this.destroySwipe();
    };

    Sidebar.prototype.initSwipe = function () {
        if (!Hammer) {
            return;
        }

        this.$swipe = $('<div id="sidebar-swipe' + this.guid + '" class="sidebar-swipe"></div>').appendTo(this.$element);
        this.$swipe.on('mouseover', function (event) {
            event.stopPropagation();
            event.preventDefault();
        });

        this.hammer = new Hammer(this.$element[0], {
            tap: false,
            transform: false,
            release: false,
            hold: false,
            swipe: false,
            drag_block_horizontal: true,
            drag_lock_to_axis: true,
            drag_min_distance: 3
        })

        .on('dragstart', $.proxy(function (event) {
            this.dragStartPosition = getWrapperPosition(this.$wrapper);
        }, this))

        .on('drag', $.proxy(function (event) {
            event.stopPropagation();
            event.preventDefault();

            var width = this.$wrapper.outerWidth();
            var horizontal = 0;

            switch (event.gesture.direction) {
                case 'left':
                case 'right':
                    horizontal = Math.round(this.dragStartPosition + event.gesture.deltaX);
                    break;
                default:
                    return;
            }

            if (('left' == this.getPosition() && horizontal > 0) || ('right' == this.getPosition() && horizontal < 0)) {
                horizontal = 0;
            }

            this.$wrapper.addClass(this.options.classOnDragging);
            this.$wrapper.css('-webkit-transition', 'none');
            this.$wrapper.css('transition', 'none');
            this.$wrapper.css('-webkit-transform', 'translate3d(' + horizontal +'px, 0px, 0px)');
            this.$wrapper.css('transform', 'translate3d(' + horizontal +'px, 0px, 0px)');
        }, this))

        .on('dragend', $.proxy(function (event) {
            this.cleanSwipe();

            if (Math.abs(event.gesture.deltaX) <= (this.$wrapper.innerWidth() / 4)) {
                return;
            }

            var closeGesture = 'left';
            var openGesture = 'right';

            if ('right' == this.getPosition()) {
                closeGesture = 'right';
                openGesture = 'left';
            }

            if (this.isOpen() && closeGesture == event.gesture.direction) {
                this.forceClose();

            } else if (openGesture == event.gesture.direction) {
                if (this.isOpen() && isOverMinWidth.apply(this) && $.inArray(this.options.forceToggle, [true, 'always']) >= 0) {
                    this.forceOpen();

                } else if (isOverMinWidth.apply(this) && 'always' == this.options.forceToggle) {
                    this.forceOpen();

                } else {
                    this.open();
                }
            }

            return;

            if (this.isOpen()) {
                if (isOverMinWidth.apply(this) && $.inArray(this.options.forceToggle, [true, 'always']) >= 0) {
                    this.forceOpen();

                } else {
                    this.forceClose();
                }

            } else {
                if (isOverMinWidth.apply(this) && 'always' == this.options.forceToggle) {
                    this.forceOpen();

                } else {
                    this.open();
                }
            }
        }, this));
    };

    function getWrapperPosition ($wrapper) {
        var transform = {e: 0, f: 0};

        if ($wrapper.css('transform')) {
            if ('function' === typeof CSSMatrix) {
                transform = new CSSMatrix($wrapper.css('transform'));

            } else if ('function' === typeof WebKitCSSMatrix) {
                transform = new WebKitCSSMatrix($wrapper.css('transform'));

            } else if ('function' === typeof MSCSSMatrix) {
                transform = new MSCSSMatrix($wrapper.css('transform'));

            } else {
                var reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
                var match = $wrapper.css('transform').match(reMatrix);

                if (match) {
                    transform.e = parseInt(match[1]);
                    transform.f = parseInt(match[2]);
                }
            }
        }

        return transform.e;
    }

    function onResizeWindow (event) {
        if (isOverMinWidth.apply(this) && this.isLocked()) {
            this.forceOpen();

            return;
        }

        this.closeExternal(event);
    }

    function isOverMinWidth (event) {
        var $window = $(window);
        var windowWidth = $window.innerWidth();

        if ($('body').height() > $window.innerHeight()) {
            if (null == this.scrollbarWidth) {
                var widthNoScroll = 100;
                var inner = document.createElement('div');
                var outer = document.createElement('div');
                    outer.style.visibility = 'hidden';
                    outer.style.width = '100px';

                document.body.appendChild(outer);

                widthNoScroll = outer.offsetWidth;
                outer.style.overflow = 'scroll';
                inner.style.width = '100%';
                outer.appendChild(inner);

                this.scrollbarWidth = widthNoScroll - inner.offsetWidth;

                outer.parentNode.removeChild(outer);
            }

            windowWidth += this.scrollbarWidth;
        }

        if (windowWidth >= this.options.minLockWidth) {
            return true;
        }

        return false;
    }

    Sidebar.prototype.cleanSwipe = function () {
        this.$wrapper.removeData('drap-start-position');
        this.$wrapper.css('-webkit-transition', '');
        this.$wrapper.css('transition', '');
        this.$wrapper.css('-webkit-transform', '');
        this.$wrapper.css('transform', '');
        this.$wrapper.removeClass(this.options.classOnDragging);
        delete this.dragStartPosition;
    };

    Sidebar.prototype.destroySwipe = function () {
        if (!Hammer) {
            return;
        }

        this.$swipe.off('mouseover');
        this.$element.remove(this.$swipe);
    };


    // SIDEBAR PLUGIN DEFINITION
    // =========================

    var old = $.fn.sidebar;

    $.fn.sidebar = function (option, _relatedTarget) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('st.sidebar');
            var options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.sidebar', (data = new Sidebar(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

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
            $this.sidebar($this.data());
        });
    });

}(jQuery);

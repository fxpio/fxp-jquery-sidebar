var FxpSidebar = (function (exports, $$1) {
  'use strict';

  $$1 = $$1 && $$1.hasOwnProperty('default') ? $$1['default'] : $$1;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  /**
   * Define the class as Jquery plugin.
   *
   * @param {String}      pluginName  The name of jquery plugin defined in $.fn
   * @param {String}      dataName    The key name of jquery data
   * @param {function}    ClassName   The class name
   * @param {boolean}     [shorthand] Check if the shorthand of jquery plugin must be added
   * @param {String|null} dataApiAttr The DOM data attribute selector name to init the jquery plugin with Data API, NULL to disable
   * @param {String}      removeName  The method name to remove the plugin data
   */

  function pluginify (pluginName, dataName, ClassName) {
    var shorthand = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var dataApiAttr = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var removeName = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'destroy';
    var old = $$1.fn[pluginName];

    $$1.fn[pluginName] = function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var resFunc, resList;
      resList = this.each(function (i, element) {
        var $this = $$1(element),
            data = $this.data(dataName);

        if (!data) {
          data = new ClassName(element, _typeof(options) === 'object' ? options : {});
          $this.data(dataName, data);
        }

        if (typeof options === 'string' && data) {
          if (data[options]) {
            resFunc = data[options].apply(data, args);
            resFunc = resFunc !== data ? resFunc : undefined;
          } else if (data.constructor[options]) {
            resFunc = data.constructor[options].apply(data, args);
            resFunc = resFunc !== data ? resFunc : undefined;
          }

          if (options === removeName) {
            $this.removeData(dataName);
          }
        }
      });
      return 1 === resList.length && undefined !== resFunc ? resFunc : resList;
    };

    $$1.fn[pluginName].Constructor = ClassName; // Shorthand

    if (shorthand) {
      $$1[pluginName] = function (options) {
        return $$1({})[pluginName](options);
      };
    } // No conflict


    $$1.fn[pluginName].noConflict = function () {
      return $$1.fn[pluginName] = old;
    }; // Data API


    if (null !== dataApiAttr) {
      $$1(window).on('load', function () {
        $$1(dataApiAttr).each(function () {
          var $this = $$1(this);
          $$1.fn[pluginName].call($this, $this.data());
        });
      });
    }
  }

  var DEFAULT_OPTIONS = {};
  /**
   * Base class for plugin.
   */

  var BasePlugin =
  /*#__PURE__*/
  function () {
    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    function BasePlugin(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, BasePlugin);

      this.guid = $$1.guid;
      this.options = $$1.extend(true, {}, this.constructor.defaultOptions, options);
      this.$element = $$1(element);
    }
    /**
     * Destroy the instance.
     */


    _createClass(BasePlugin, [{
      key: "destroy",
      value: function destroy() {
        var self = this;
        Object.keys(self).forEach(function (key) {
          delete self[key];
        });
      }
      /**
       * Set the default options.
       * The new values are merged with the existing values.
       *
       * @param {object} options
       */

    }], [{
      key: "defaultOptions",
      set: function set(options) {
        DEFAULT_OPTIONS[this.name] = $$1.extend(true, {}, DEFAULT_OPTIONS[this.name], options);
      }
      /**
       * Get the default options.
       *
       * @return {object}
       */
      ,
      get: function get() {
        if (undefined === DEFAULT_OPTIONS[this.name]) {
          DEFAULT_OPTIONS[this.name] = {};
        }

        return DEFAULT_OPTIONS[this.name];
      }
    }]);

    return BasePlugin;
  }();

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */

  /**
   * Left position.
   */
  var POSITION_LEFT = 'left';
  /**
   * Right position.
   */

  var POSITION_RIGHT = 'right';
  /**
   * Not force toggle.
   */

  var FORCE_TOGGLE_NO = false;
  /**
   * Force toggle.
   */

  var FORCE_TOGGLE = true;
  /**
   * Always force toggle.
   */

  var FORCE_TOGGLE_ALWAYS = 'always';

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */

  /*global CSSMatrix*/

  /*global WebKitCSSMatrix*/

  /*global MSCSSMatrix*/

  /**
   * Changes the css transition configuration on target element.
   *
   * @param {jQuery} $target    The element to edited
   * @param {string} transition The css transition configuration of target
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
   */

  function getTargetPosition($target) {
    var transformCss = $target.css('transform'),
        transform = {
      e: 0,
      f: 0
    },
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
   * Checks if the window width is wider than the minimum width defined in
   * options.
   *
   * @param {Sidebar} self The sidebar instance
   *
   * @returns {boolean}
   */

  function isOverMinWidth(self) {
    var $window = $(window),
        windowWidth = $window.innerWidth();

    if (self.$body.height() > $window.innerHeight()) {
      windowWidth += self.nativeScrollWidth;
    }

    return windowWidth >= self.options.minLockWidth;
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Set the value in local storage.
   *
   * @param {Sidebar}        self  The sidebar instance
   * @param {String}         key   The key
   * @param {String|Boolean} value The value
   */

  function setLocalStorage(self, key, value) {
    if (self.options.saveConfig && 'localStorage' in window) {
      try {
        window.localStorage.setItem(self.$element.prop('id') + '/' + key, value);
      } catch (e) {}
    }
  }
  /**
   * Get the value in local storage.
   *
   * @param {Sidebar}        self           The sidebar instance
   * @param {String}         key            The key
   * @param {String|Boolean} [defaultValue] The default value
   *
   * @return {String|null}
   */

  function getLocalStorage(self, key, defaultValue) {
    var value = undefined === defaultValue ? null : defaultValue,
        itemValue = null;

    if (self.options.saveConfig && 'localStorage' in window) {
      itemValue = window.localStorage.getItem(self.$element.prop('id') + '/' + key);
    }

    return null !== itemValue ? itemValue : value;
  }
  /**
   * Init the sidebar options with the locale storage.
   *
   * @param {Sidebar} self The sidebar instance
   */

  function initWithLocalStorage(self) {
    var storageLocked = getLocalStorage(self, self.options.storageLockedKey);

    if (null !== storageLocked && self.options.toggleOnClick) {
      self.options.locked = storageLocked === 'true';

      if (!self.options.locked) {
        changeTransition(self.$element, 'none');
        self.forceClose();
      }
    }
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Add browser prefix on event name for jquery.
   *
   * @param {String} name        The event name
   * @param {String} [namespace] The namespace of jquery event
   *
   * @returns {String}
   */

  function prefixedEvent(name, namespace) {
    var pfx = ['webkit', 'moz', 'ms', 'o', ''],
        names = '';

    for (var p = 0; p < pfx.length; p++) {
      if (!pfx[p]) {
        name = name.toLowerCase();
      }

      names += ' ' + pfx[p] + name;

      if (undefined !== namespace) {
        names += '.' + namespace;
      }
    }

    return names;
  }
  /**
   * Trigger the event.
   *
   * @param {String}  type   The event type
   * @param {Sidebar} self   The sidebar instance
   * @param {*}       [data] The data
   */

  function triggerEvent(type, self, data) {
    $$1.event.trigger({
      type: 'sidebar:' + type + '.fxp.sidebar',
      sidebar: self,
      eventData: data,
      time: new Date()
    });
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
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
   * Init the scroller instance.
   *
   * @param {Sidebar} self The sidebar instance
   *
   * @private
   */

  function initScroller(self) {
    var options = {
      scrollbarInverse: POSITION_RIGHT === self.options.position
    };

    if ($.fn.scroller && self.options.useScroller) {
      self.$element.scroller($.extend({}, options, self.options.scroller));
      self.$element.on('scrolling.fxp.scroller.fxp.sidebar', null, self, resetScrolling);
    }
  }
  /**
   * Destroy the hammer scroll configuration.
   *
   * @param {Sidebar} self The sidebar instance
   */

  function destroyScroller(self) {
    if ($.fn.scroller && self.options.useScroller) {
      self.$element.scroller('destroy');
      self.$element.off('scrolling.fxp.scroller.fxp.sidebar', resetScrolling);
    }
  }
  /**
   * Lock the scroll of body.
   *
   * @param {Sidebar} self The sidebar instance
   */

  function lockBodyScroll(self) {
    var bodyPad = parseInt(self.$body.css('padding-right') || 0, 10),
        hasScrollbar = self.$body.get(0).scrollHeight > document.documentElement.clientHeight && 'hidden' !== self.$body.css('overflow-y');

    if (hasScrollbar) {
      self.originalBodyPad = document.body.style.paddingRight || '';
      self.originalBodyOverflowY = document.body.style.overflowY || '';
      self.$body.css({
        'padding-right': bodyPad + self.nativeScrollWidth + 'px',
        'overflow-y': 'hidden'
      });
      triggerEvent('lock-body-scroll', self, self.nativeScrollWidth);
    }
  }
  /**
   * Unlock the scroll of body.
   *
   * @param {Sidebar} self The sidebar instance
   */

  function unlockBodyScroll(self) {
    if (null !== self.originalBodyPad || null !== self.originalBodyOverflowY) {
      self.$body.css({
        'padding-right': self.originalBodyPad,
        'overflow-y': self.originalBodyOverflowY
      });
      self.originalBodyPad = null;
      self.originalBodyOverflowY = null;
      triggerEvent('unlock-body-scroll', self, self.nativeScrollWidth);
    }
  }
  /**
   * Reset the scrolling locker.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   *
   * @private
   */

  function resetScrolling(event) {
    var self = event.data;
    self.resetScrolling = window.setTimeout(function () {
      self.resetScrolling = null;
    }, self.options.resetScrollDelay * 1000);
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Close the sidebar or reopen the locked sidebar on window resize event.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   */

  function onResizeWindow(event) {
    var self = event.data,
        isForceOpened = false,
        isOver = isOverMinWidth(self);
    changeTransition(self.$element, 'none');

    if (isOver && self.isLocked()) {
      self.forceOpen();
      unlockBodyScroll(self);
      isForceOpened = true;
    }

    if (undefined === self.resizeDelay) {
      self.resizeDelay = window.setTimeout(function () {
        delete self.resizeDelay;
        changeTransition(self.$element, '');

        if (!isForceOpened && self.isLocked()) {
          if (!isOver && self.isOpen()) {
            lockBodyScroll(self);
          } else {
            unlockBodyScroll(self);
          }
        }
      }, 500);
    }
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Binding actions of keyboard.
   *
   * @param {jQuery.Event|Event} event
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

    if (event.shiftKey === kbe.shiftKey && event.ctrlKey === kbe.ctrlKey && event.altKey === kbe.altKey && event.keyCode === kbe.keyCode) {
      self.toggle(event);
    }
  }
  /**
   * Close the sidebar since external action.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   */

  function closeExternal(event) {
    var self = event.data;
    event.stopPropagation();
    event.preventDefault();

    if (isOverMinWidth(self)) {
      self.close();
    } else {
      self.forceClose();
    }
  }
  /**
   * Close the sidebar when an item is selected.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   */

  function closeOnSelect(event) {
    var self = event.data;

    if (self.options.closeOnSelectDelay > 0) {
      self.closeDelay = window.setTimeout(function () {
        self.close();
      }, self.options.closeOnSelectDelay * 1000);
    } else {
      self.close();
    }
  }
  /**
   * Clean the close delay.
   *
   * @param {Sidebar} self The sidebar instance
   */

  function cleanCloseDelay(self) {
    if (null !== self.closeDelay) {
      window.clearTimeout(self.closeDelay);
      self.closeDelay = null;
    }
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */

  /**
   * Action to detach toggle button.
   *
   * @param {Sidebar} self    The sidebar instance
   * @param {jQuery}  $toggle The toggle
   */
  function doDetachToggle(self, $toggle) {
    $toggle.off('mouseover.fxp.sidebar' + self.guid, $.proxy(self.open, self)).off(self.eventType + '.fxp.sidebar' + self.guid, self.toggle).removeClass(self.options.classLocked + '-toggle').removeClass(self.options.classForceOpen + '-toggle').removeClass(self.options.classOpen + '-toggle');

    if (!self.enabled) {
      $toggle.removeClass('disabled');
    }
  }
  /**
   * Add css classname in toggle buttons.
   *
   * @param {Sidebar} self      The sidebar instance
   * @param {String}  classname The css classname
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
   */

  function removeClassToggles(self, classname) {
    self.$toggles.each(function (index, $toggle) {
      $toggle.removeClass(classname);
    });
  }

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Trigger the opened or closed event when the transition is finished.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   */

  function onEndTransition(event) {
    var self = event.data,
        action = event.data.isOpen() ? 'opened' : 'closed';

    if (event.target !== self.$element.get(0)) {
      return;
    }

    if (event.data.isOpen()) {
      addClassToggles(self, self.options.classOpen + '-toggle');

      if ($.fn.scroller && self.options.useScroller) {
        self.$element.scroller('resizeScrollbar');
      }

      $('a:visible:first', self.$toggles.get(0).parent()).focus();
    } else {
      removeClassToggles(self, self.options.classOpen + '-toggle');

      if ($.fn.scroller && self.options.useScroller) {
        self.$element.scroller('resizeScrollbar');
      }
    }

    if (self.isLocked()) {
      if (!isOverMinWidth(self) && self.isOpen()) {
        lockBodyScroll(self);
      } else {
        unlockBodyScroll(self);
      }
    }

    triggerEvent(action, self);
  }
  /**
   * Action of "on drag" hammer event.
   *
   * @param {Sidebar} self  The sidebar instance
   * @param {object}  event The hammer event
   *
   * @typedef {Number} event.deltaX The hammer delta X
   * @typedef {Number} event.deltaY The hammer delta Y
   */

  function onDrag(self, event) {
    var delta;

    if (null !== self.resetScrolling || event.target === self.$obfuscator.get(0)) {
      return;
    } // drag start


    if (null === self.dragDirection) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      self.mouseDragEnd = null;
      self.dragDirection = event.direction;
      self.$element.css('user-select', 'none');
      cleanCloseDelay(self);
    } // drag


    if (-1 === $.inArray(self.dragDirection, [Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT]) || self.options.locked && isOverMinWidth(self) && self.isOpen()) {
      return;
    }

    event.preventDefault();

    if (null === self.dragStartPosition) {
      self.dragStartPosition = getTargetPosition(self.$element);
    }

    delta = Math.round(self.dragStartPosition + event.deltaX);

    if (POSITION_LEFT === self.getPosition() && delta > 0 || POSITION_RIGHT === self.getPosition() && delta < 0) {
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
   */

  function onDragEnd(self, event) {
    var closeGesture = Hammer.DIRECTION_LEFT,
        openGesture = Hammer.DIRECTION_RIGHT;

    if (null !== self.resetScrolling || event.target === self.$obfuscator.get(0)) {
      return;
    }

    self.dragStartPosition = null;
    event.preventDefault();

    if (self.fixDragClick && -1 !== $.inArray(event.srcEvent.type, ['pointerup', 'mouseup'])) {
      self.mouseDragEnd = true;
    }

    self.$element.removeClass(self.options.classOnDragging);
    self.$element.css('user-select', '');
    changeTransition(self.$element, '');
    changeTransform(self.$element, '');

    if (Math.abs(event.deltaX) <= self.$element.innerWidth() / 4) {
      self.dragDirection = null;
      self.$toggles.focus();
      return;
    }

    if (POSITION_RIGHT === self.getPosition()) {
      closeGesture = Hammer.DIRECTION_RIGHT;
      openGesture = Hammer.DIRECTION_LEFT;
    }

    if (self.isOpen() && closeGesture === self.dragDirection) {
      self.forceClose();
    } else if (openGesture === self.dragDirection) {
      self.mouseDragEnd = null;

      if (self.isOpen() && isOverMinWidth(self) && $.inArray(self.options.forceToggle, [FORCE_TOGGLE, FORCE_TOGGLE_ALWAYS]) >= 0) {
        self.forceOpen();
      } else if (isOverMinWidth(self) && FORCE_TOGGLE_ALWAYS === self.options.forceToggle) {
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
   */

  function initHammer(self) {
    if (!self.options.draggable || typeof Hammer !== 'function') {
      return;
    }

    self.$swipe = $('<div id="sidebar-swipe' + self.guid + '" class="fxp-sidebar-swipe"></div>');
    self.$element.after(self.$swipe);
    self.hammer = new Hammer(self.$wrapper.get(0), $.extend(true, {}, self.options.hammer));
    self.hammer.get('swipe').set({
      enable: false
    });
    self.hammer.get('tap').set({
      enable: false
    });
    self.hammer.on('panstart', function (event) {
      onDrag(self, event);
    });
    self.hammer.on('pan', function (event) {
      onDrag(self, event);
    });
    self.hammer.on('panend', function (event) {
      onDragEnd(self, event);
    });
    self.$wrapper.on('mousedown.fxp.sidebar', null, self, onItemMouseDown);
    self.$wrapper.on('click.fxp.sidebar', null, self, onItemClick);

    if (self.options.clickableSwipe) {
      self.$swipe.on('click.fxp.sidebar' + self.guid, null, self, swipeClick).on('mouseenter.fxp.sidebar' + self.guid, null, self, swipeMouseEnter).on('mouseleave.fxp.sidebar' + self.guid, null, self, swipeMouseLeave);
    }
  }
  /**
   * Destroy the hammer configuration.
   *
   * @param {Sidebar} self The sidebar instance
   */

  function destroyHammer(self) {
    if (!self.options.draggable || typeof Hammer !== 'function') {
      return;
    }

    if (self.options.clickableSwipe) {
      self.$swipe.off('click.fxp.sidebar' + self.guid, swipeClick).off('mouseenter.fxp.sidebar' + self.guid, swipeMouseEnter).off('mouseleave.fxp.sidebar' + self.guid, swipeMouseLeave);
    }

    self.$wrapper.off('mousedown.fxp.sidebar', onItemMouseDown);
    self.$wrapper.off('click.fxp.sidebar', onItemClick);
    self.$swipe.remove();
    self.hammer.destroy();
    delete self.$swipe;
    delete self.hammer;
  }
  /**
   * Action on swipe is clicked.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   *
   * @private
   */

  function swipeClick(event) {
    swipeMouseLeave(event);
    event.data.toggle(event);
  }
  /**
   * Action when mouse enter on sur swipe.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   *
   * @private
   */


  function swipeMouseEnter(event) {
    event.data.$swipe.addClass('mouse-hover');
  }
  /**
   * Action when mouse leave on sur swipe.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   *
   * @private
   */


  function swipeMouseLeave(event) {
    event.data.$swipe.removeClass('mouse-hover');
  }
  /**
   * Action on item mouse down.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   */


  function onItemMouseDown(event) {
    event.preventDefault();
  }
  /**
   * Action on item click.
   *
   * @param {Event} event The event
   *
   * @typedef {Sidebar} Event.data The sidebar instance
   */


  function onItemClick(event) {
    var self = event.data;

    if (true === self.mouseDragEnd) {
      event.preventDefault();
      cleanCloseDelay(self);
      self.mouseDragEnd = null;
    }
  }

  /**
   * Sidebar class.
   */

  var Sidebar =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(Sidebar, _BasePlugin);

    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    function Sidebar(element) {
      var _this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Sidebar);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Sidebar).call(this, element, options));

      var self = _assertThisInitialized(_assertThisInitialized(_this)),
          isOver,
          ua = navigator.userAgent.toLowerCase();

      _this.eventType = 'click';
      _this.nativeScrollWidth = getNativeScrollWidth();
      _this.$toggles = $$1([]);
      _this.$wrapper = $$1('<div class="' + _this.options.classWrapper + '"></div>');
      _this.$container = $$1('> .' + _this.options.classContainer, _this.$element.parent());
      _this.$swipe = null;
      _this.$obfuscator = $$1('<div class="' + _this.options.classObfuscator + (_this.options.showObfuscator ? ' show' : '') + '"></div>');
      _this.$body = $$1('body');
      _this.enabled = !_this.$element.hasClass('fxp-sidebar-disabled');
      _this.mini = _this.$element.hasClass('fxp-sidebar-mini');
      _this.fullLocked = _this.$element.hasClass(_this.options.classFullLocked);
      _this.hammer = null;
      _this.dragStartPosition = null;
      _this.mouseDragEnd = null;
      _this.dragDirection = null;
      _this.closeDelay = null;
      _this.resetScrolling = null;
      _this.originalBodyPad = null;
      _this.originalBodyOverflowY = null;
      _this.fixDragClick = ua.indexOf('firefox') > -1 || ua.indexOf('edge') > -1 || ua.indexOf('msie') > -1;

      _this.$element.before(_this.$wrapper);

      _this.$wrapper.append(_this.$element);

      _this.$wrapper.append(_this.$obfuscator);

      _this.$element.attr('data-sidebar', 'true');

      if (null !== _this.options.toggleId) {
        _this.attachToggle('#' + _this.options.toggleId);
      }

      if (undefined !== _this.options.scrollerStickyHeader) {
        _this.options.scroller.scrollerStickyHeader = _this.options.scrollerStickyHeader;
        delete _this.options.scrollerStickyHeader;
      }

      if (undefined !== _this.options.scrollerScrollbar) {
        _this.options.scroller.scrollbar = _this.options.scrollerScrollbar;
        delete _this.options.scrollerScrollbar;
      }

      if (_this.$element.hasClass(_this.options.classLocked)) {
        _this.options.locked = true;
      }

      if (POSITION_RIGHT !== _this.options.position) {
        _this.options.position = POSITION_LEFT;
      } else {
        _this.$element.addClass('fxp-sidebar-right');
      }

      if (_this.$element.hasClass('fxp-sidebar-right')) {
        _this.options.position = POSITION_RIGHT;
      }

      if (_this.options.position === POSITION_RIGHT) {
        _this.options.keyboardEvent.shiftKey = true;
      }

      if (!_this.enabled) {
        _this.$element.removeClass(_this.options.classLocked).removeClass(_this.options.classForceOpen).removeClass(_this.options.classOpen).removeClass(_this.options.classOpen + '-init');
      }

      if (_this.options.locked) {
        _this.options.forceToggle = FORCE_TOGGLE_ALWAYS;
        changeTransition(_this.$element, 'none');

        if (_this.enabled) {
          _this.$element.addClass(_this.options.classLocked).addClass(_this.options.classForceOpen).addClass(_this.options.classOpen + '-init');

          _this.$container.addClass('container-force-open-' + _this.options.position);
        }
      }

      if (_this.mini) {
        _this.$container.addClass('container-mini-' + _this.options.position);
      }

      if (_this.fullLocked) {
        _this.$container.addClass('container-full-locked');
      }

      isOver = isOverMinWidth(_assertThisInitialized(_assertThisInitialized(_this)));
      $$1(window).on('keyup.fxp.sidebar' + _this.guid, null, _assertThisInitialized(_assertThisInitialized(_this)), keyboardAction);
      $$1(window).on('resize.fxp.sidebar' + _this.guid, null, _assertThisInitialized(_assertThisInitialized(_this)), onResizeWindow);

      if (_this.$element.hasClass(_this.options.classOpen + '-init')) {
        if (isOver) {
          _this.$element.addClass(_this.options.classOpen);
        } else {
          _this.$element.removeClass(_this.options.classOpen).removeClass(_this.options.classForceOpen);
        }

        _this.$element.removeClass(_this.options.classOpen + '-init');
      }

      if (_this.$element.hasClass(_this.options.classOpen) && !isOver) {
        lockBodyScroll(_assertThisInitialized(_assertThisInitialized(_this)));
      } else {
        unlockBodyScroll(_assertThisInitialized(_assertThisInitialized(_this)));
      }

      if (_this.options.closeOnSelect) {
        _this.$element.on(_this.eventType + '.fxp.sidebar' + _this.guid, _this.options.itemSelector, _assertThisInitialized(_assertThisInitialized(_this)), closeOnSelect);
      }

      _this.$element.on(prefixedEvent('TransitionEnd', '.fxp.sidebar' + _this.guid), null, _assertThisInitialized(_assertThisInitialized(_this)), onEndTransition);

      _this.$obfuscator.on(_this.eventType + '.fxp.sidebar' + _this.guid, null, _assertThisInitialized(_assertThisInitialized(_this)), closeExternal);

      initScroller(_assertThisInitialized(_assertThisInitialized(_this)));
      initHammer(_assertThisInitialized(_assertThisInitialized(_this)));
      initWithLocalStorage(_assertThisInitialized(_assertThisInitialized(_this)));
      window.setTimeout(function () {
        changeTransition(self.$element, '');
        self.$element.addClass('fxp-sidebar-ready');
        triggerEvent('ready', self);
      }, 0);
      return _this;
    }
    /**
     * Get sidebar position.
     *
     * @returns {string} The position (left or right)
     */


    _createClass(Sidebar, [{
      key: "getPosition",
      value: function getPosition() {
        return this.options.position;
      }
      /**
       * Checks if sidebar is locked (always open).
       *
       * @returns {boolean}
       */

    }, {
      key: "isLocked",
      value: function isLocked() {
        return this.options.locked;
      }
      /**
       * Checks if sidebar is locked (always open).
       *
       * @returns {boolean}
       */

    }, {
      key: "isOpen",
      value: function isOpen() {
        return this.$element.hasClass(this.options.classOpen);
      }
      /**
       * Checks if sidebar is fully opened.
       *
       * @return {boolean}
       */

    }, {
      key: "isFullyOpened",
      value: function isFullyOpened() {
        return this.$element.hasClass(this.options.classForceOpen);
      }
      /**
       * Checks if sidebar is closable.
       *
       * @return {boolean}
       */

    }, {
      key: "isClosable",
      value: function isClosable() {
        return this.enabled && this.isOpen() && !isOverMinWidth(this);
      }
      /**
       * Force open the sidebar.
       */

    }, {
      key: "forceOpen",
      value: function forceOpen() {
        if (!this.enabled || this.isOpen() && this.isFullyOpened()) {
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

    }, {
      key: "forceClose",
      value: function forceClose() {
        if (!this.enabled || !this.isOpen() || this.isLocked() && isOverMinWidth(this)) {
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

    }, {
      key: "open",
      value: function open() {
        if (!this.enabled || this.isOpen()) {
          return;
        }

        triggerEvent('open', this);
        cleanCloseDelay(this);
        $$1('[data-sidebar=true]').sidebar('forceClose');
        this.$element.addClass(this.options.classOpen);
      }
      /**
       * Close open the sidebar.
       *
       * @this Sidebar
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.enabled || !this.isOpen() || this.isFullyOpened() && isOverMinWidth(this)) {
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

    }, {
      key: "toggle",
      value: function toggle(event) {
        var self = undefined !== event ? event.data : this;

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
          } else if (isOverMinWidth(self) && $$1.inArray(self.options.forceToggle, [FORCE_TOGGLE, FORCE_TOGGLE_ALWAYS]) >= 0) {
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

    }, {
      key: "refresh",
      value: function refresh() {
        triggerEvent('refresh', this);

        if ($$1.fn.scroller && this.options.useScroller) {
          this.$element.scroller('refresh');
        }
      }
      /**
       * Attach a toggle button.
       *
       * @param {string|HTMLElement|object|jQuery} $toggle
       */

    }, {
      key: "attachToggle",
      value: function attachToggle($toggle) {
        $toggle = $$1($toggle);

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
          $toggle.on('mouseover.fxp.sidebar' + this.guid, $$1.proxy(this.open, this));
        }

        this.$toggles.push($toggle);
      }
      /**
       * Detach a toggle button.
       *
       * @param {string|HTMLElement|object|jQuery} $toggle
       */

    }, {
      key: "detachToggle",
      value: function detachToggle($toggle) {
        var size = this.$toggles.length,
            i;
        $toggle = $$1($toggle);

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

    }, {
      key: "detachToggles",
      value: function detachToggles() {
        var size = this.$toggles.length,
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

    }, {
      key: "isEnabled",
      value: function isEnabled() {
        return this.enabled;
      }
      /**
       * Disable the sidebar.
       */

    }, {
      key: "disable",
      value: function disable() {
        var prevIsLocked = this.isLocked();

        if (!this.enabled) {
          return;
        }

        triggerEvent('disable', this);
        this.options.locked = false;
        this.forceClose();
        this.options.locked = prevIsLocked;
        this.$element.addClass('fxp-sidebar-disabled');
        addClassToggles(this, 'disabled');

        if (this.isLocked()) {
          addClassToggles(this, this.options.classLocked + '-toggle-disabled');
        }

        this.enabled = false;
      }
      /**
       * Enable the sidebar.
       */

    }, {
      key: "enable",
      value: function enable() {
        if (this.enabled) {
          return;
        }

        triggerEvent('enable', this);
        this.enabled = true;
        this.$element.removeClass('fxp-sidebar-disabled');

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

    }, {
      key: "destroy",
      value: function destroy() {
        cleanCloseDelay(this);
        this.detachToggles();
        this.forceClose();
        this.$container.removeClass('container-mini-' + this.options.position);
        this.$container.removeClass('container-full-locked');
        $$1(window).off('keyup.fxp.sidebar' + this.guid, keyboardAction);
        $$1(window).off('resize.fxp.sidebar' + this.guid, onResizeWindow);
        this.$element.off(this.eventType + '.fxp.sidebar' + this.guid, this.options.itemSelector, closeOnSelect);
        this.$element.off(prefixedEvent('TransitionEnd', '.fxp.sidebar' + this.guid), onEndTransition);
        this.$obfuscator.off(this.eventType + '.fxp.sidebar' + this.guid, closeExternal);
        destroyHammer(this);
        destroyScroller(this);
        unlockBodyScroll(this);
        this.$wrapper.before(this.$element);
        this.$wrapper.remove();
        this.$element.removeClass('fxp-sidebar-ready');

        _get(_getPrototypeOf(Sidebar.prototype), "destroy", this).call(this);
      }
    }]);

    return Sidebar;
  }(BasePlugin);
  Sidebar.defaultOptions = {
    classWrapper: 'fxp-sidebar-wrapper',
    classContainer: 'container-main',
    classOpen: 'fxp-sidebar-open',
    classLocked: 'fxp-sidebar-locked',
    classFullLocked: 'fxp-sidebar-full-locked',
    classForceOpen: 'fxp-sidebar-force-open',
    classOnDragging: 'fxp-sidebar-dragging',
    classObfuscator: 'fxp-sidebar-obfuscator',
    forceToggle: FORCE_TOGGLE_NO,
    locked: false,
    position: POSITION_LEFT,
    minLockWidth: 992,
    toggleId: null,
    toggleOpenOnHover: false,
    toggleOnClick: false,
    saveConfig: false,
    storageLockedKey: 'fxp/sidebar/locked',
    clickableSwipe: false,
    draggable: true,
    closeOnSelect: true,
    closeOnSelectDelay: 0.5,
    resetScrollDelay: 0.3,
    itemSelector: '.fxp-sidebar-menu a',
    showObfuscator: true,
    useScroller: true,
    scrollerScrollbar: undefined,
    scroller: {
      contentSelector: '.fxp-sidebar-menu',
      scrollerStickyHeader: true,
      stickyOptions: {
        selector: '> .fxp-sidebar-menu > .fxp-sidebar-group > span'
      }
    },
    hammer: {},
    disabledKeyboard: false,
    keyboardEvent: {
      ctrlKey: true,
      shiftKey: false,
      altKey: true,
      keyCode: 'S'.charCodeAt(0)
    }
  };
  pluginify('sidebar', 'fxp.sidebar', Sidebar, true, '[data-sidebar="true"]');

  exports.default = Sidebar;

  return exports;

}({}, jQuery));

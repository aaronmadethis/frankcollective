(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var Waypoint = require('../../../node_modules/waypoints/lib/noframework.waypoints');

var use_classlist = false;

if (Modernizr.touchevents) {
  console.log('The test touchevents passed!', Modernizr.touchevents);
} else {
  console.log('The test touchevents faild!', Modernizr.touchevents);
}

if (Modernizr.classlist) {
  use_classlist = true;
}

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

var frankjs = {
  init: function init() {
    console.log('frankjs started');
  },
  scrolljack: function scrolljack(el) {
    var wrapper = el;
    var triggers = Array.prototype.slice.call(wrapper.querySelectorAll('.js-scroll-trigger'));
    var parent = frankutils.addwaypoint(wrapper, wrapper, ['js-active'], '80%');
    triggers.forEach(function (el, i) {
      var trigger = new window.Waypoint({
        element: el,
        handler: function handler(direction) {
          var current, deactivate, slideClass;

          if (direction == 'down') {
            // animate in trigger
            // animate out trigger - 1
            current = i + 1;
            deactivate = deactivateClasses(current, triggers.length);
            slideClass = 'js-slide__n' + current;
            deactivate.push('js-up');
          }

          if (direction == 'up') {
            // animate in trigger - 1
            // animate out trigger
            current = i;
            deactivate = deactivateClasses(current, triggers.length);
            slideClass = 'js-slide__n' + current;
            deactivate.push('js-down');
          }

          frankutils.removeClass(wrapper, deactivate);
          frankutils.addClass(wrapper, [slideClass, 'js-' + direction]);
        },
        offset: 'bottom-in-view'
      });
    });

    var deactivateClasses = function deactivateClasses(current, total) {
      var classNames = [];

      for (var index = 0; index < total; index++) {
        if (current != index + 1) {
          classNames.push('js-slide__n' + (index + 1));
        }
      }

      return classNames;
    };
  }
};
var frankutils = {
  addwaypoint: function addwaypoint(el) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['js-active'];
    var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '0';
    var container = !parent ? el : parent;
    return new window.Waypoint({
      element: el,
      handler: function handler(direction) {
        frankutils.addClass(container, className);
      },
      offset: offset
    });
  },
  addClass: function addClass(el) {
    var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['js-active'];
    className = Array.isArray(className) ? className : [className];

    if (el.classList) {
      className.forEach(function (name) {
        el.classList.add(name);
      });
    } else {
      className.forEach(function (name) {
        el.className += ' ' + name;
      });
    }
  },
  removeClass: function removeClass(el) {
    var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['js-active'];
    className = Array.isArray(className) ? className : [className];

    if (el.classList) {
      className.forEach(function (name) {
        el.classList.remove(name);
      });
    } else {
      className.forEach(function (name) {
        el.className = el.className.replace(new RegExp('(^|\\b)' + name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      });
    }
  }
};

function frankinit() {
  frankjs.init();
  frankjs.scrolljack(document.querySelectorAll('.js-scrolljack-init')[0]);
}

ready(frankinit);

},{"../../../node_modules/waypoints/lib/noframework.waypoints":2}],2:[function(require,module,exports){
/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function() {
  'use strict'

  var keyCounter = 0
  var allWaypoints = {}

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor')
    }
    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor')
    }
    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor')
    }

    this.key = 'waypoint-' + keyCounter
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options)
    this.element = this.options.element
    this.adapter = new Waypoint.Adapter(this.element)
    this.callback = options.handler
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
    this.enabled = this.options.enabled
    this.triggerPoint = null
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    })
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context)

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset]
    }
    this.group.add(this)
    this.context.add(this)
    allWaypoints[this.key] = this
    keyCounter += 1
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function(direction) {
    this.group.queueTrigger(this, direction)
  }

  /* Private */
  Waypoint.prototype.trigger = function(args) {
    if (!this.enabled) {
      return
    }
    if (this.callback) {
      this.callback.apply(this, args)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function() {
    this.context.remove(this)
    this.group.remove(this)
    delete allWaypoints[this.key]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function() {
    this.enabled = false
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function() {
    this.context.refresh()
    this.enabled = true
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function() {
    return this.group.next(this)
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function() {
    return this.group.previous(this)
  }

  /* Private */
  Waypoint.invokeAll = function(method) {
    var allWaypointsArray = []
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey])
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function() {
    Waypoint.invokeAll('destroy')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function() {
    Waypoint.invokeAll('disable')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function() {
    Waypoint.Context.refreshAll()
    for (var waypointKey in allWaypoints) {
      allWaypoints[waypointKey].enabled = true
    }
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function() {
    Waypoint.Context.refreshAll()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function() {
    return document.documentElement.clientWidth
  }

  Waypoint.adapters = []

  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  }

  Waypoint.offsetAliases = {
    'bottom-in-view': function() {
      return this.context.innerHeight() - this.adapter.outerHeight()
    },
    'right-in-view': function() {
      return this.context.innerWidth() - this.adapter.outerWidth()
    }
  }

  window.Waypoint = Waypoint
}())
;(function() {
  'use strict'

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  var keyCounter = 0
  var contexts = {}
  var Waypoint = window.Waypoint
  var oldWindowLoad = window.onload

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
    this.element = element
    this.Adapter = Waypoint.Adapter
    this.adapter = new this.Adapter(element)
    this.key = 'waypoint-context-' + keyCounter
    this.didScroll = false
    this.didResize = false
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    }
    this.waypoints = {
      vertical: {},
      horizontal: {}
    }

    element.waypointContextKey = this.key
    contexts[element.waypointContextKey] = this
    keyCounter += 1
    if (!Waypoint.windowContext) {
      Waypoint.windowContext = true
      Waypoint.windowContext = new Context(window)
    }

    this.createThrottledScrollHandler()
    this.createThrottledResizeHandler()
  }

  /* Private */
  Context.prototype.add = function(waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical'
    this.waypoints[axis][waypoint.key] = waypoint
    this.refresh()
  }

  /* Private */
  Context.prototype.checkEmpty = function() {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal)
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical)
    var isWindow = this.element == this.element.window
    if (horizontalEmpty && verticalEmpty && !isWindow) {
      this.adapter.off('.waypoints')
      delete contexts[this.key]
    }
  }

  /* Private */
  Context.prototype.createThrottledResizeHandler = function() {
    var self = this

    function resizeHandler() {
      self.handleResize()
      self.didResize = false
    }

    this.adapter.on('resize.waypoints', function() {
      if (!self.didResize) {
        self.didResize = true
        Waypoint.requestAnimationFrame(resizeHandler)
      }
    })
  }

  /* Private */
  Context.prototype.createThrottledScrollHandler = function() {
    var self = this
    function scrollHandler() {
      self.handleScroll()
      self.didScroll = false
    }

    this.adapter.on('scroll.waypoints', function() {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true
        Waypoint.requestAnimationFrame(scrollHandler)
      }
    })
  }

  /* Private */
  Context.prototype.handleResize = function() {
    Waypoint.Context.refreshAll()
  }

  /* Private */
  Context.prototype.handleScroll = function() {
    var triggeredGroups = {}
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      var isForward = axis.newScroll > axis.oldScroll
      var direction = isForward ? axis.forward : axis.backward

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        if (waypoint.triggerPoint === null) {
          continue
        }
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    }
  }

  /* Private */
  Context.prototype.innerHeight = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerHeight()
  }

  /* Private */
  Context.prototype.remove = function(waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key]
    this.checkEmpty()
  }

  /* Private */
  Context.prototype.innerWidth = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerWidth()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function() {
    var allWaypoints = []
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey])
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function() {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window
    /*eslint-enable eqeqeq */
    var contextOffset = isWindow ? undefined : this.adapter.offset()
    var triggeredGroups = {}
    var axes

    this.handleScroll()
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var adjustment = waypoint.options.offset
        var oldTriggerPoint = waypoint.triggerPoint
        var elementOffset = 0
        var freshWaypoint = oldTriggerPoint == null
        var contextModifier, wasBeforeScroll, nowAfterScroll
        var triggeredBackward, triggeredForward

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp]
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint)
        }
        else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment)
          if (waypoint.options.offset.indexOf('%') > - 1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100)
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset
        waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment)
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll
        triggeredBackward = wasBeforeScroll && nowAfterScroll
        triggeredForward = !wasBeforeScroll && !nowAfterScroll

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    Waypoint.requestAnimationFrame(function() {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers()
      }
    })

    return this
  }

  /* Private */
  Context.findOrCreateByElement = function(element) {
    return Context.findByElement(element) || new Context(element)
  }

  /* Private */
  Context.refreshAll = function() {
    for (var contextId in contexts) {
      contexts[contextId].refresh()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function(element) {
    return contexts[element.waypointContextKey]
  }

  window.onload = function() {
    if (oldWindowLoad) {
      oldWindowLoad()
    }
    Context.refreshAll()
  }


  Waypoint.requestAnimationFrame = function(callback) {
    var requestFn = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      requestAnimationFrameShim
    requestFn.call(window, callback)
  }
  Waypoint.Context = Context
}())
;(function() {
  'use strict'

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint
  }

  var groups = {
    vertical: {},
    horizontal: {}
  }
  var Waypoint = window.Waypoint

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
    this.name = options.name
    this.axis = options.axis
    this.id = this.name + '-' + this.axis
    this.waypoints = []
    this.clearTriggerQueues()
    groups[this.axis][this.name] = this
  }

  /* Private */
  Group.prototype.add = function(waypoint) {
    this.waypoints.push(waypoint)
  }

  /* Private */
  Group.prototype.clearTriggerQueues = function() {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    }
  }

  /* Private */
  Group.prototype.flushTriggers = function() {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction]
      var reverse = direction === 'up' || direction === 'left'
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint)
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i]
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction])
        }
      }
    }
    this.clearTriggerQueues()
  }

  /* Private */
  Group.prototype.next = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    var isLast = index === this.waypoints.length - 1
    return isLast ? null : this.waypoints[index + 1]
  }

  /* Private */
  Group.prototype.previous = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    return index ? this.waypoints[index - 1] : null
  }

  /* Private */
  Group.prototype.queueTrigger = function(waypoint, direction) {
    this.triggerQueues[direction].push(waypoint)
  }

  /* Private */
  Group.prototype.remove = function(waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    if (index > -1) {
      this.waypoints.splice(index, 1)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function() {
    return this.waypoints[0]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function() {
    return this.waypoints[this.waypoints.length - 1]
  }

  /* Private */
  Group.findOrCreate = function(options) {
    return groups[options.axis][options.name] || new Group(options)
  }

  Waypoint.Group = Group
}())
;(function() {
  'use strict'

  var Waypoint = window.Waypoint

  function isWindow(element) {
    return element === element.window
  }

  function getWindow(element) {
    if (isWindow(element)) {
      return element
    }
    return element.defaultView
  }

  function NoFrameworkAdapter(element) {
    this.element = element
    this.handlers = {}
  }

  NoFrameworkAdapter.prototype.innerHeight = function() {
    var isWin = isWindow(this.element)
    return isWin ? this.element.innerHeight : this.element.clientHeight
  }

  NoFrameworkAdapter.prototype.innerWidth = function() {
    var isWin = isWindow(this.element)
    return isWin ? this.element.innerWidth : this.element.clientWidth
  }

  NoFrameworkAdapter.prototype.off = function(event, handler) {
    function removeListeners(element, listeners, handler) {
      for (var i = 0, end = listeners.length - 1; i < end; i++) {
        var listener = listeners[i]
        if (!handler || handler === listener) {
          element.removeEventListener(listener)
        }
      }
    }

    var eventParts = event.split('.')
    var eventType = eventParts[0]
    var namespace = eventParts[1]
    var element = this.element

    if (namespace && this.handlers[namespace] && eventType) {
      removeListeners(element, this.handlers[namespace][eventType], handler)
      this.handlers[namespace][eventType] = []
    }
    else if (eventType) {
      for (var ns in this.handlers) {
        removeListeners(element, this.handlers[ns][eventType] || [], handler)
        this.handlers[ns][eventType] = []
      }
    }
    else if (namespace && this.handlers[namespace]) {
      for (var type in this.handlers[namespace]) {
        removeListeners(element, this.handlers[namespace][type], handler)
      }
      this.handlers[namespace] = {}
    }
  }

  /* Adapted from jQuery 1.x offset() */
  NoFrameworkAdapter.prototype.offset = function() {
    if (!this.element.ownerDocument) {
      return null
    }

    var documentElement = this.element.ownerDocument.documentElement
    var win = getWindow(this.element.ownerDocument)
    var rect = {
      top: 0,
      left: 0
    }

    if (this.element.getBoundingClientRect) {
      rect = this.element.getBoundingClientRect()
    }

    return {
      top: rect.top + win.pageYOffset - documentElement.clientTop,
      left: rect.left + win.pageXOffset - documentElement.clientLeft
    }
  }

  NoFrameworkAdapter.prototype.on = function(event, handler) {
    var eventParts = event.split('.')
    var eventType = eventParts[0]
    var namespace = eventParts[1] || '__default'
    var nsHandlers = this.handlers[namespace] = this.handlers[namespace] || {}
    var nsTypeList = nsHandlers[eventType] = nsHandlers[eventType] || []

    nsTypeList.push(handler)
    this.element.addEventListener(eventType, handler)
  }

  NoFrameworkAdapter.prototype.outerHeight = function(includeMargin) {
    var height = this.innerHeight()
    var computedStyle

    if (includeMargin && !isWindow(this.element)) {
      computedStyle = window.getComputedStyle(this.element)
      height += parseInt(computedStyle.marginTop, 10)
      height += parseInt(computedStyle.marginBottom, 10)
    }

    return height
  }

  NoFrameworkAdapter.prototype.outerWidth = function(includeMargin) {
    var width = this.innerWidth()
    var computedStyle

    if (includeMargin && !isWindow(this.element)) {
      computedStyle = window.getComputedStyle(this.element)
      width += parseInt(computedStyle.marginLeft, 10)
      width += parseInt(computedStyle.marginRight, 10)
    }

    return width
  }

  NoFrameworkAdapter.prototype.scrollLeft = function() {
    var win = getWindow(this.element)
    return win ? win.pageXOffset : this.element.scrollLeft
  }

  NoFrameworkAdapter.prototype.scrollTop = function() {
    var win = getWindow(this.element)
    return win ? win.pageYOffset : this.element.scrollTop
  }

  NoFrameworkAdapter.extend = function() {
    var args = Array.prototype.slice.call(arguments)

    function merge(target, obj) {
      if (typeof target === 'object' && typeof obj === 'object') {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            target[key] = obj[key]
          }
        }
      }

      return target
    }

    for (var i = 1, end = args.length; i < end; i++) {
      merge(args[0], args[i])
    }
    return args[0]
  }

  NoFrameworkAdapter.inArray = function(element, array, i) {
    return array == null ? -1 : array.indexOf(element, i)
  }

  NoFrameworkAdapter.isEmptyObject = function(obj) {
    /* eslint no-unused-vars: 0 */
    for (var name in obj) {
      return false
    }
    return true
  }

  Waypoint.adapters.push({
    name: 'noframework',
    Adapter: NoFrameworkAdapter
  })
  Waypoint.Adapter = NoFrameworkAdapter
}())
;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvY3VzdG9tL2FwcC5qcyIsIm5vZGVfbW9kdWxlcy93YXlwb2ludHMvbGliL25vZnJhbWV3b3JrLndheXBvaW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQywyREFBRCxDQUF4Qjs7QUFFQSxJQUFJLGFBQWEsR0FBRyxLQUFwQjs7QUFFQSxJQUFJLFNBQVMsQ0FBQyxXQUFkLEVBQTJCO0FBQ3ZCLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSw4QkFBWixFQUE0QyxTQUFTLENBQUMsV0FBdEQ7QUFDSCxDQUZELE1BRUs7QUFDRCxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksNkJBQVosRUFBMkMsU0FBUyxDQUFDLFdBQXJEO0FBQ0g7O0FBQ0QsSUFBSSxTQUFTLENBQUMsU0FBZCxFQUF5QjtBQUNyQixFQUFBLGFBQWEsR0FBRyxJQUFoQjtBQUNIOztBQUVELFNBQVMsS0FBVCxDQUFlLEVBQWYsRUFBbUI7QUFDZixNQUFJLFFBQVEsQ0FBQyxXQUFULEdBQXVCLFFBQVEsQ0FBQyxVQUFULEtBQXdCLFVBQS9DLEdBQTRELFFBQVEsQ0FBQyxVQUFULEtBQXdCLFNBQXhGLEVBQW1HO0FBQy9GLElBQUEsRUFBRTtBQUNMLEdBRkQsTUFFTztBQUNILElBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxFQUE5QztBQUNIO0FBQ0o7O0FBRUQsSUFBTSxPQUFPLEdBQUc7QUFDWixFQUFBLElBQUksRUFBRSxnQkFBVTtBQUNaLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWjtBQUNILEdBSFc7QUFJWixFQUFBLFVBQVUsRUFBRSxvQkFBUyxFQUFULEVBQVk7QUFDcEIsUUFBSSxPQUFPLEdBQUcsRUFBZDtBQUNBLFFBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFOLENBQWdCLEtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFdheXBvaW50ID0gcmVxdWlyZSgnLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3dheXBvaW50cy9saWIvbm9mcmFtZXdvcmsud2F5cG9pbnRzJyk7XG5cbnZhciB1c2VfY2xhc3NsaXN0ID0gZmFsc2U7XG5cbmlmIChNb2Rlcm5penIudG91Y2hldmVudHMpIHsgXG4gICAgY29uc29sZS5sb2coJ1RoZSB0ZXN0IHRvdWNoZXZlbnRzIHBhc3NlZCEnLCBNb2Rlcm5penIudG91Y2hldmVudHMpO1xufWVsc2V7XG4gICAgY29uc29sZS5sb2coJ1RoZSB0ZXN0IHRvdWNoZXZlbnRzIGZhaWxkIScsIE1vZGVybml6ci50b3VjaGV2ZW50cyk7XG59XG5pZiAoTW9kZXJuaXpyLmNsYXNzbGlzdCkge1xuICAgIHVzZV9jbGFzc2xpc3QgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiByZWFkeShmbikge1xuICAgIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudCA/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiA6IGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiKSB7XG4gICAgICAgIGZuKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcbiAgICB9XG59XG5cbmNvbnN0IGZyYW5ranMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc29sZS5sb2coJ2ZyYW5ranMgc3RhcnRlZCcpO1xuICAgIH0sXG4gICAgc2Nyb2xsamFjazogZnVuY3Rpb24oZWwpe1xuICAgICAgICB2YXIgd3JhcHBlciA9IGVsO1xuICAgICAgICB2YXIgdHJpZ2dlcnMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggd3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCcuanMtc2Nyb2xsLXRyaWdnZXInKSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgcGFyZW50ID0gZnJhbmt1dGlscy5hZGR3YXlwb2ludCh3cmFwcGVyLCB3cmFwcGVyLCBbJ2pzLWFjdGl2ZSddLCAnODAlJyApO1xuXG4gICAgICAgIHRyaWdnZXJzLmZvckVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XG4gICAgICAgICAgICBsZXQgdHJpZ2dlciA9IG5ldyB3aW5kb3cuV2F5cG9pbnQoe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsLFxuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudCwgZGVhY3RpdmF0ZSwgc2xpZGVDbGFzc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gJ2Rvd24nKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuaW1hdGUgaW4gdHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5pbWF0ZSBvdXQgdHJpZ2dlciAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSAoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVhY3RpdmF0ZSA9IGRlYWN0aXZhdGVDbGFzc2VzKGN1cnJlbnQsIHRyaWdnZXJzLmxlbmd0aCk7ICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlQ2xhc3MgPSAnanMtc2xpZGVfX24nICsgY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWN0aXZhdGUucHVzaCgnanMtdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihkaXJlY3Rpb24gPT0gJ3VwJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmltYXRlIGluIHRyaWdnZXIgLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmltYXRlIG91dCB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWN0aXZhdGUgPSBkZWFjdGl2YXRlQ2xhc3NlcyhjdXJyZW50LCB0cmlnZ2Vycy5sZW5ndGgpOyAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZUNsYXNzID0gJ2pzLXNsaWRlX19uJyArIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFjdGl2YXRlLnB1c2goJ2pzLWRvd24nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZnJhbmt1dGlscy5yZW1vdmVDbGFzcyh3cmFwcGVyLCBkZWFjdGl2YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgZnJhbmt1dGlscy5hZGRDbGFzcyh3cmFwcGVyLCBbc2xpZGVDbGFzcywgJ2pzLScgKyBkaXJlY3Rpb25dICk7XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9mZnNldDogJ2JvdHRvbS1pbi12aWV3J1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGRlYWN0aXZhdGVDbGFzc2VzID0gZnVuY3Rpb24oY3VycmVudCwgdG90YWwpe1xuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0b3RhbDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICE9IChpbmRleCArIDEpICkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzLnB1c2goICdqcy1zbGlkZV9fbicgKyAoaW5kZXggKyAxKSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjbGFzc05hbWVzO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jb25zdCBmcmFua3V0aWxzID0ge1xuICAgIGFkZHdheXBvaW50OiBmdW5jdGlvbihlbCwgcGFyZW50ID0gZmFsc2UsIGNsYXNzTmFtZSA9IFsnanMtYWN0aXZlJ10sIG9mZnNldCA9ICcwJyl7XG4gICAgICAgIGxldCBjb250YWluZXIgPSAhcGFyZW50ID8gZWwgOiBwYXJlbnQ7XG5cbiAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3cuV2F5cG9pbnQoe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsLFxuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBmcmFua3V0aWxzLmFkZENsYXNzKGNvbnRhaW5lciwgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9mZnNldDogb2Zmc2V0XG4gICAgICAgICAgICB9KVxuICAgIH0sXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUgPSAgWydqcy1hY3RpdmUnXSl7XG4gICAgICAgIGNsYXNzTmFtZSA9IEFycmF5LmlzQXJyYXkoY2xhc3NOYW1lKSA/IGNsYXNzTmFtZSA6IFtjbGFzc05hbWVdO1xuICAgICAgICBpZiAoZWwuY2xhc3NMaXN0KXtcbiAgICAgICAgICAgIGNsYXNzTmFtZS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNsYXNzTmFtZS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIG5hbWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUgPSBbJ2pzLWFjdGl2ZSddKXtcbiAgICAgICAgY2xhc3NOYW1lID0gQXJyYXkuaXNBcnJheShjbGFzc05hbWUpID8gY2xhc3NOYW1lIDogW2NsYXNzTmFtZV07XG4gICAgICAgIGlmIChlbC5jbGFzc0xpc3Qpe1xuICAgICAgICAgICAgY2xhc3NOYW1lLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY2xhc3NOYW1lLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgbmFtZS5zcGxpdCgnICcpLmpvaW4oJ3wnKSArICcoXFxcXGJ8JCknLCAnZ2knKSwgJyAnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmcmFua2luaXQoKXtcbiAgICBmcmFua2pzLmluaXQoKTtcbiAgICBmcmFua2pzLnNjcm9sbGphY2soIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zY3JvbGxqYWNrLWluaXQnKVswXSApO1xufVxuXG5yZWFkeShmcmFua2luaXQpOyIsIi8qIVxuV2F5cG9pbnRzIC0gNC4wLjFcbkNvcHlyaWdodCDCqSAyMDExLTIwMTYgQ2FsZWIgVHJvdWdodG9uXG5MaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5odHRwczovL2dpdGh1Yi5jb20vaW1ha2V3ZWJ0aGluZ3Mvd2F5cG9pbnRzL2Jsb2IvbWFzdGVyL2xpY2Vuc2VzLnR4dFxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBhbGxXYXlwb2ludHMgPSB7fVxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS93YXlwb2ludCAqL1xuICBmdW5jdGlvbiBXYXlwb2ludChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG9wdGlvbnMgcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yJylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudCBvcHRpb24gcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yJylcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLmhhbmRsZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaGFuZGxlciBvcHRpb24gcGFzc2VkIHRvIFdheXBvaW50IGNvbnN0cnVjdG9yJylcbiAgICB9XG5cbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC0nICsga2V5Q291bnRlclxuICAgIHRoaXMub3B0aW9ucyA9IFdheXBvaW50LkFkYXB0ZXIuZXh0ZW5kKHt9LCBXYXlwb2ludC5kZWZhdWx0cywgb3B0aW9ucylcbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZWxlbWVudFxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyBXYXlwb2ludC5BZGFwdGVyKHRoaXMuZWxlbWVudClcbiAgICB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5oYW5kbGVyXG4gICAgdGhpcy5heGlzID0gdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy5lbmFibGVkID0gdGhpcy5vcHRpb25zLmVuYWJsZWRcbiAgICB0aGlzLnRyaWdnZXJQb2ludCA9IG51bGxcbiAgICB0aGlzLmdyb3VwID0gV2F5cG9pbnQuR3JvdXAuZmluZE9yQ3JlYXRlKHtcbiAgICAgIG5hbWU6IHRoaXMub3B0aW9ucy5ncm91cCxcbiAgICAgIGF4aXM6IHRoaXMuYXhpc1xuICAgIH0pXG4gICAgdGhpcy5jb250ZXh0ID0gV2F5cG9pbnQuQ29udGV4dC5maW5kT3JDcmVhdGVCeUVsZW1lbnQodGhpcy5vcHRpb25zLmNvbnRleHQpXG5cbiAgICBpZiAoV2F5cG9pbnQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XSkge1xuICAgICAgdGhpcy5vcHRpb25zLm9mZnNldCA9IFdheXBvaW50Lm9mZnNldEFsaWFzZXNbdGhpcy5vcHRpb25zLm9mZnNldF1cbiAgICB9XG4gICAgdGhpcy5ncm91cC5hZGQodGhpcylcbiAgICB0aGlzLmNvbnRleHQuYWRkKHRoaXMpXG4gICAgYWxsV2F5cG9pbnRzW3RoaXMua2V5XSA9IHRoaXNcbiAgICBrZXlDb3VudGVyICs9IDFcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnF1ZXVlVHJpZ2dlciA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgIHRoaXMuZ3JvdXAucXVldWVUcmlnZ2VyKHRoaXMsIGRpcmVjdGlvbilcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5jYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGVzdHJveSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGV4dC5yZW1vdmUodGhpcylcbiAgICB0aGlzLmdyb3VwLnJlbW92ZSh0aGlzKVxuICAgIGRlbGV0ZSBhbGxXYXlwb2ludHNbdGhpcy5rZXldXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rpc2FibGUgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2VuYWJsZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250ZXh0LnJlZnJlc2goKVxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9uZXh0ICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXAubmV4dCh0aGlzKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9wcmV2aW91cyAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cC5wcmV2aW91cyh0aGlzKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5pbnZva2VBbGwgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICB2YXIgYWxsV2F5cG9pbnRzQXJyYXkgPSBbXVxuICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIGFsbFdheXBvaW50cykge1xuICAgICAgYWxsV2F5cG9pbnRzQXJyYXkucHVzaChhbGxXYXlwb2ludHNbd2F5cG9pbnRLZXldKVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYWxsV2F5cG9pbnRzQXJyYXkubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIGFsbFdheXBvaW50c0FycmF5W2ldW21ldGhvZF0oKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGVzdHJveS1hbGwgKi9cbiAgV2F5cG9pbnQuZGVzdHJveUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50Lmludm9rZUFsbCgnZGVzdHJveScpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2Rpc2FibGUtYWxsICovXG4gIFdheXBvaW50LmRpc2FibGVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5pbnZva2VBbGwoJ2Rpc2FibGUnKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9lbmFibGUtYWxsICovXG4gIFdheXBvaW50LmVuYWJsZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50LkNvbnRleHQucmVmcmVzaEFsbCgpXG4gICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gYWxsV2F5cG9pbnRzKSB7XG4gICAgICBhbGxXYXlwb2ludHNbd2F5cG9pbnRLZXldLmVuYWJsZWQgPSB0cnVlXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3JlZnJlc2gtYWxsICovXG4gIFdheXBvaW50LnJlZnJlc2hBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS92aWV3cG9ydC1oZWlnaHQgKi9cbiAgV2F5cG9pbnQudmlld3BvcnRIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtd2lkdGggKi9cbiAgV2F5cG9pbnQudmlld3BvcnRXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgfVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzID0gW11cblxuICBXYXlwb2ludC5kZWZhdWx0cyA9IHtcbiAgICBjb250ZXh0OiB3aW5kb3csXG4gICAgY29udGludW91czogdHJ1ZSxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGdyb3VwOiAnZGVmYXVsdCcsXG4gICAgaG9yaXpvbnRhbDogZmFsc2UsXG4gICAgb2Zmc2V0OiAwXG4gIH1cblxuICBXYXlwb2ludC5vZmZzZXRBbGlhc2VzID0ge1xuICAgICdib3R0b20taW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lckhlaWdodCgpIC0gdGhpcy5hZGFwdGVyLm91dGVySGVpZ2h0KClcbiAgICB9LFxuICAgICdyaWdodC1pbi12aWV3JzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmlubmVyV2lkdGgoKSAtIHRoaXMuYWRhcHRlci5vdXRlcldpZHRoKClcbiAgICB9XG4gIH1cblxuICB3aW5kb3cuV2F5cG9pbnQgPSBXYXlwb2ludFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZnVuY3Rpb24gcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2hpbShjYWxsYmFjaykge1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApXG4gIH1cblxuICB2YXIga2V5Q291bnRlciA9IDBcbiAgdmFyIGNvbnRleHRzID0ge31cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG4gIHZhciBvbGRXaW5kb3dMb2FkID0gd2luZG93Lm9ubG9hZFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0ICovXG4gIGZ1bmN0aW9uIENvbnRleHQoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcbiAgICB0aGlzLkFkYXB0ZXIgPSBXYXlwb2ludC5BZGFwdGVyXG4gICAgdGhpcy5hZGFwdGVyID0gbmV3IHRoaXMuQWRhcHRlcihlbGVtZW50KVxuICAgIHRoaXMua2V5ID0gJ3dheXBvaW50LWNvbnRleHQtJyArIGtleUNvdW50ZXJcbiAgICB0aGlzLmRpZFNjcm9sbCA9IGZhbHNlXG4gICAgdGhpcy5kaWRSZXNpemUgPSBmYWxzZVxuICAgIHRoaXMub2xkU2Nyb2xsID0ge1xuICAgICAgeDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgIHk6IHRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKVxuICAgIH1cbiAgICB0aGlzLndheXBvaW50cyA9IHtcbiAgICAgIHZlcnRpY2FsOiB7fSxcbiAgICAgIGhvcml6b250YWw6IHt9XG4gICAgfVxuXG4gICAgZWxlbWVudC53YXlwb2ludENvbnRleHRLZXkgPSB0aGlzLmtleVxuICAgIGNvbnRleHRzW2VsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5XSA9IHRoaXNcbiAgICBrZXlDb3VudGVyICs9IDFcbiAgICBpZiAoIVdheXBvaW50LndpbmRvd0NvbnRleHQpIHtcbiAgICAgIFdheXBvaW50LndpbmRvd0NvbnRleHQgPSB0cnVlXG4gICAgICBXYXlwb2ludC53aW5kb3dDb250ZXh0ID0gbmV3IENvbnRleHQod2luZG93KVxuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkU2Nyb2xsSGFuZGxlcigpXG4gICAgdGhpcy5jcmVhdGVUaHJvdHRsZWRSZXNpemVIYW5kbGVyKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB2YXIgYXhpcyA9IHdheXBvaW50Lm9wdGlvbnMuaG9yaXpvbnRhbCA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcbiAgICB0aGlzLndheXBvaW50c1theGlzXVt3YXlwb2ludC5rZXldID0gd2F5cG9pbnRcbiAgICB0aGlzLnJlZnJlc2goKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jaGVja0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhvcml6b250YWxFbXB0eSA9IHRoaXMuQWRhcHRlci5pc0VtcHR5T2JqZWN0KHRoaXMud2F5cG9pbnRzLmhvcml6b250YWwpXG4gICAgdmFyIHZlcnRpY2FsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy52ZXJ0aWNhbClcbiAgICB2YXIgaXNXaW5kb3cgPSB0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvd1xuICAgIGlmIChob3Jpem9udGFsRW1wdHkgJiYgdmVydGljYWxFbXB0eSAmJiAhaXNXaW5kb3cpIHtcbiAgICAgIHRoaXMuYWRhcHRlci5vZmYoJy53YXlwb2ludHMnKVxuICAgICAgZGVsZXRlIGNvbnRleHRzW3RoaXMua2V5XVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgZnVuY3Rpb24gcmVzaXplSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlUmVzaXplKClcbiAgICAgIHNlbGYuZGlkUmVzaXplID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Jlc2l6ZS53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRSZXNpemUpIHtcbiAgICAgICAgc2VsZi5kaWRSZXNpemUgPSB0cnVlXG4gICAgICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNpemVIYW5kbGVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBmdW5jdGlvbiBzY3JvbGxIYW5kbGVyKCkge1xuICAgICAgc2VsZi5oYW5kbGVTY3JvbGwoKVxuICAgICAgc2VsZi5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuYWRhcHRlci5vbignc2Nyb2xsLndheXBvaW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLmRpZFNjcm9sbCB8fCBXYXlwb2ludC5pc1RvdWNoKSB7XG4gICAgICAgIHNlbGYuZGlkU2Nyb2xsID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5oYW5kbGVSZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBXYXlwb2ludC5Db250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5oYW5kbGVTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlcyA9IHtcbiAgICAgIGhvcml6b250YWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsTGVmdCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLngsXG4gICAgICAgIGZvcndhcmQ6ICdyaWdodCcsXG4gICAgICAgIGJhY2t3YXJkOiAnbGVmdCdcbiAgICAgIH0sXG4gICAgICB2ZXJ0aWNhbDoge1xuICAgICAgICBuZXdTY3JvbGw6IHRoaXMuYWRhcHRlci5zY3JvbGxUb3AoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYXhpc0tleSBpbiBheGVzKSB7XG4gICAgICB2YXIgYXhpcyA9IGF4ZXNbYXhpc0tleV1cbiAgICAgIHZhciBpc0ZvcndhcmQgPSBheGlzLm5ld1Njcm9sbCA+IGF4aXMub2xkU2Nyb2xsXG4gICAgICB2YXIgZGlyZWN0aW9uID0gaXNGb3J3YXJkID8gYXhpcy5mb3J3YXJkIDogYXhpcy5iYWNrd2FyZFxuXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgaWYgKHdheXBvaW50LnRyaWdnZXJQb2ludCA9PT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHdhc0JlZm9yZVRyaWdnZXJQb2ludCA9IGF4aXMub2xkU2Nyb2xsIDwgd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBub3dBZnRlclRyaWdnZXJQb2ludCA9IGF4aXMubmV3U2Nyb2xsID49IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgY3Jvc3NlZEZvcndhcmQgPSB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgJiYgbm93QWZ0ZXJUcmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRCYWNrd2FyZCA9ICF3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgJiYgIW5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIGlmIChjcm9zc2VkRm9yd2FyZCB8fCBjcm9zc2VkQmFja3dhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoZGlyZWN0aW9uKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgZ3JvdXBLZXkgaW4gdHJpZ2dlcmVkR3JvdXBzKSB7XG4gICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgIH1cblxuICAgIHRoaXMub2xkU2Nyb2xsID0ge1xuICAgICAgeDogYXhlcy5ob3Jpem9udGFsLm5ld1Njcm9sbCxcbiAgICAgIHk6IGF4ZXMudmVydGljYWwubmV3U2Nyb2xsXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5pbm5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRIZWlnaHQoKVxuICAgIH1cbiAgICAvKmVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5pbm5lckhlaWdodCgpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgZGVsZXRlIHRoaXMud2F5cG9pbnRzW3dheXBvaW50LmF4aXNdW3dheXBvaW50LmtleV1cbiAgICB0aGlzLmNoZWNrRW1wdHkoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5pbm5lcldpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgICBpZiAodGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3cpIHtcbiAgICAgIHJldHVybiBXYXlwb2ludC52aWV3cG9ydFdpZHRoKClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJXaWR0aCgpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZGVzdHJveSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFsbFdheXBvaW50cyA9IFtdXG4gICAgZm9yICh2YXIgYXhpcyBpbiB0aGlzLndheXBvaW50cykge1xuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc10pIHtcbiAgICAgICAgYWxsV2F5cG9pbnRzLnB1c2godGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnRLZXldKVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gYWxsV2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBhbGxXYXlwb2ludHNbaV0uZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LXJlZnJlc2ggKi9cbiAgQ29udGV4dC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgdmFyIGlzV2luZG93ID0gdGhpcy5lbGVtZW50ID09IHRoaXMuZWxlbWVudC53aW5kb3dcbiAgICAvKmVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgdmFyIGNvbnRleHRPZmZzZXQgPSBpc1dpbmRvdyA/IHVuZGVmaW5lZCA6IHRoaXMuYWRhcHRlci5vZmZzZXQoKVxuICAgIHZhciB0cmlnZ2VyZWRHcm91cHMgPSB7fVxuICAgIHZhciBheGVzXG5cbiAgICB0aGlzLmhhbmRsZVNjcm9sbCgpXG4gICAgYXhlcyA9IHtcbiAgICAgIGhvcml6b250YWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC5sZWZ0LFxuICAgICAgICBjb250ZXh0U2Nyb2xsOiBpc1dpbmRvdyA/IDAgOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBjb250ZXh0RGltZW5zaW9uOiB0aGlzLmlubmVyV2lkdGgoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnLFxuICAgICAgICBvZmZzZXRQcm9wOiAnbGVmdCdcbiAgICAgIH0sXG4gICAgICB2ZXJ0aWNhbDoge1xuICAgICAgICBjb250ZXh0T2Zmc2V0OiBpc1dpbmRvdyA/IDAgOiBjb250ZXh0T2Zmc2V0LnRvcCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lckhlaWdodCgpLFxuICAgICAgICBvbGRTY3JvbGw6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGZvcndhcmQ6ICdkb3duJyxcbiAgICAgICAgYmFja3dhcmQ6ICd1cCcsXG4gICAgICAgIG9mZnNldFByb3A6ICd0b3AnXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYXhpc0tleSBpbiBheGVzKSB7XG4gICAgICB2YXIgYXhpcyA9IGF4ZXNbYXhpc0tleV1cbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNLZXldKSB7XG4gICAgICAgIHZhciB3YXlwb2ludCA9IHRoaXMud2F5cG9pbnRzW2F4aXNLZXldW3dheXBvaW50S2V5XVxuICAgICAgICB2YXIgYWRqdXN0bWVudCA9IHdheXBvaW50Lm9wdGlvbnMub2Zmc2V0XG4gICAgICAgIHZhciBvbGRUcmlnZ2VyUG9pbnQgPSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGVsZW1lbnRPZmZzZXQgPSAwXG4gICAgICAgIHZhciBmcmVzaFdheXBvaW50ID0gb2xkVHJpZ2dlclBvaW50ID09IG51bGxcbiAgICAgICAgdmFyIGNvbnRleHRNb2RpZmllciwgd2FzQmVmb3JlU2Nyb2xsLCBub3dBZnRlclNjcm9sbFxuICAgICAgICB2YXIgdHJpZ2dlcmVkQmFja3dhcmQsIHRyaWdnZXJlZEZvcndhcmRcblxuICAgICAgICBpZiAod2F5cG9pbnQuZWxlbWVudCAhPT0gd2F5cG9pbnQuZWxlbWVudC53aW5kb3cpIHtcbiAgICAgICAgICBlbGVtZW50T2Zmc2V0ID0gd2F5cG9pbnQuYWRhcHRlci5vZmZzZXQoKVtheGlzLm9mZnNldFByb3BdXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBhZGp1c3RtZW50ID0gYWRqdXN0bWVudC5hcHBseSh3YXlwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgYWRqdXN0bWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBhZGp1c3RtZW50ID0gcGFyc2VGbG9hdChhZGp1c3RtZW50KVxuICAgICAgICAgIGlmICh3YXlwb2ludC5vcHRpb25zLm9mZnNldC5pbmRleE9mKCclJykgPiAtIDEpIHtcbiAgICAgICAgICAgIGFkanVzdG1lbnQgPSBNYXRoLmNlaWwoYXhpcy5jb250ZXh0RGltZW5zaW9uICogYWRqdXN0bWVudCAvIDEwMClcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0TW9kaWZpZXIgPSBheGlzLmNvbnRleHRTY3JvbGwgLSBheGlzLmNvbnRleHRPZmZzZXRcbiAgICAgICAgd2F5cG9pbnQudHJpZ2dlclBvaW50ID0gTWF0aC5mbG9vcihlbGVtZW50T2Zmc2V0ICsgY29udGV4dE1vZGlmaWVyIC0gYWRqdXN0bWVudClcbiAgICAgICAgd2FzQmVmb3JlU2Nyb2xsID0gb2xkVHJpZ2dlclBvaW50IDwgYXhpcy5vbGRTY3JvbGxcbiAgICAgICAgbm93QWZ0ZXJTY3JvbGwgPSB3YXlwb2ludC50cmlnZ2VyUG9pbnQgPj0gYXhpcy5vbGRTY3JvbGxcbiAgICAgICAgdHJpZ2dlcmVkQmFja3dhcmQgPSB3YXNCZWZvcmVTY3JvbGwgJiYgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdHJpZ2dlcmVkRm9yd2FyZCA9ICF3YXNCZWZvcmVTY3JvbGwgJiYgIW5vd0FmdGVyU2Nyb2xsXG5cbiAgICAgICAgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuYmFja3dhcmQpXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWZyZXNoV2F5cG9pbnQgJiYgdHJpZ2dlcmVkRm9yd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmZvcndhcmQpXG4gICAgICAgICAgdHJpZ2dlcmVkR3JvdXBzW3dheXBvaW50Lmdyb3VwLmlkXSA9IHdheXBvaW50Lmdyb3VwXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZnJlc2hXYXlwb2ludCAmJiBheGlzLm9sZFNjcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgZ3JvdXBLZXkgaW4gdHJpZ2dlcmVkR3JvdXBzKSB7XG4gICAgICAgIHRyaWdnZXJlZEdyb3Vwc1tncm91cEtleV0uZmx1c2hUcmlnZ2VycygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQuZmluZE9yQ3JlYXRlQnlFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiBDb250ZXh0LmZpbmRCeUVsZW1lbnQoZWxlbWVudCkgfHwgbmV3IENvbnRleHQoZWxlbWVudClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgY29udGV4dElkIGluIGNvbnRleHRzKSB7XG4gICAgICBjb250ZXh0c1tjb250ZXh0SWRdLnJlZnJlc2goKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1maW5kLWJ5LWVsZW1lbnQgKi9cbiAgQ29udGV4dC5maW5kQnlFbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV1cbiAgfVxuXG4gIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAob2xkV2luZG93TG9hZCkge1xuICAgICAgb2xkV2luZG93TG9hZCgpXG4gICAgfVxuICAgIENvbnRleHQucmVmcmVzaEFsbCgpXG4gIH1cblxuXG4gIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcXVlc3RGbiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW1cbiAgICByZXF1ZXN0Rm4uY2FsbCh3aW5kb3csIGNhbGxiYWNrKVxuICB9XG4gIFdheXBvaW50LkNvbnRleHQgPSBDb250ZXh0XG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICBmdW5jdGlvbiBieVRyaWdnZXJQb2ludChhLCBiKSB7XG4gICAgcmV0dXJuIGEudHJpZ2dlclBvaW50IC0gYi50cmlnZ2VyUG9pbnRcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ5UmV2ZXJzZVRyaWdnZXJQb2ludChhLCBiKSB7XG4gICAgcmV0dXJuIGIudHJpZ2dlclBvaW50IC0gYS50cmlnZ2VyUG9pbnRcbiAgfVxuXG4gIHZhciBncm91cHMgPSB7XG4gICAgdmVydGljYWw6IHt9LFxuICAgIGhvcml6b250YWw6IHt9XG4gIH1cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2dyb3VwICovXG4gIGZ1bmN0aW9uIEdyb3VwKG9wdGlvbnMpIHtcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWVcbiAgICB0aGlzLmF4aXMgPSBvcHRpb25zLmF4aXNcbiAgICB0aGlzLmlkID0gdGhpcy5uYW1lICsgJy0nICsgdGhpcy5heGlzXG4gICAgdGhpcy53YXlwb2ludHMgPSBbXVxuICAgIHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKClcbiAgICBncm91cHNbdGhpcy5heGlzXVt0aGlzLm5hbWVdID0gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5wdXNoKHdheXBvaW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuY2xlYXJUcmlnZ2VyUXVldWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50cmlnZ2VyUXVldWVzID0ge1xuICAgICAgdXA6IFtdLFxuICAgICAgZG93bjogW10sXG4gICAgICBsZWZ0OiBbXSxcbiAgICAgIHJpZ2h0OiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLmZsdXNoVHJpZ2dlcnMgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBkaXJlY3Rpb24gaW4gdGhpcy50cmlnZ2VyUXVldWVzKSB7XG4gICAgICB2YXIgd2F5cG9pbnRzID0gdGhpcy50cmlnZ2VyUXVldWVzW2RpcmVjdGlvbl1cbiAgICAgIHZhciByZXZlcnNlID0gZGlyZWN0aW9uID09PSAndXAnIHx8IGRpcmVjdGlvbiA9PT0gJ2xlZnQnXG4gICAgICB3YXlwb2ludHMuc29ydChyZXZlcnNlID8gYnlSZXZlcnNlVHJpZ2dlclBvaW50IDogYnlUcmlnZ2VyUG9pbnQpXG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gd2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSArPSAxKSB7XG4gICAgICAgIHZhciB3YXlwb2ludCA9IHdheXBvaW50c1tpXVxuICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5jb250aW51b3VzIHx8IGkgPT09IHdheXBvaW50cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgd2F5cG9pbnQudHJpZ2dlcihbZGlyZWN0aW9uXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNsZWFyVHJpZ2dlclF1ZXVlcygpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5zb3J0KGJ5VHJpZ2dlclBvaW50KVxuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgdmFyIGlzTGFzdCA9IGluZGV4ID09PSB0aGlzLndheXBvaW50cy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGlzTGFzdCA/IG51bGwgOiB0aGlzLndheXBvaW50c1tpbmRleCArIDFdXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdGhpcy53YXlwb2ludHMuc29ydChieVRyaWdnZXJQb2ludClcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIHJldHVybiBpbmRleCA/IHRoaXMud2F5cG9pbnRzW2luZGV4IC0gMV0gOiBudWxsXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5xdWV1ZVRyaWdnZXIgPSBmdW5jdGlvbih3YXlwb2ludCwgZGlyZWN0aW9uKSB7XG4gICAgdGhpcy50cmlnZ2VyUXVldWVzW2RpcmVjdGlvbl0ucHVzaCh3YXlwb2ludClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy53YXlwb2ludHMuc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZmlyc3QgKi9cbiAgR3JvdXAucHJvdG90eXBlLmZpcnN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMud2F5cG9pbnRzWzBdXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2xhc3QgKi9cbiAgR3JvdXAucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy53YXlwb2ludHNbdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHJldHVybiBncm91cHNbb3B0aW9ucy5heGlzXVtvcHRpb25zLm5hbWVdIHx8IG5ldyBHcm91cChvcHRpb25zKVxuICB9XG5cbiAgV2F5cG9pbnQuR3JvdXAgPSBHcm91cFxufSgpKVxuOyhmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgdmFyIFdheXBvaW50ID0gd2luZG93LldheXBvaW50XG5cbiAgZnVuY3Rpb24gaXNXaW5kb3coZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50ID09PSBlbGVtZW50LndpbmRvd1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0V2luZG93KGVsZW1lbnQpIHtcbiAgICBpZiAoaXNXaW5kb3coZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBlbGVtZW50XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50LmRlZmF1bHRWaWV3XG4gIH1cblxuICBmdW5jdGlvbiBOb0ZyYW1ld29ya0FkYXB0ZXIoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcbiAgICB0aGlzLmhhbmRsZXJzID0ge31cbiAgfVxuXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXNXaW4gPSBpc1dpbmRvdyh0aGlzLmVsZW1lbnQpXG4gICAgcmV0dXJuIGlzV2luID8gdGhpcy5lbGVtZW50LmlubmVySGVpZ2h0IDogdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodFxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5pbm5lcldpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlzV2luID0gaXNXaW5kb3codGhpcy5lbGVtZW50KVxuICAgIHJldHVybiBpc1dpbiA/IHRoaXMuZWxlbWVudC5pbm5lcldpZHRoIDogdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoXG4gIH1cblxuICBOb0ZyYW1ld29ya0FkYXB0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGVsZW1lbnQsIGxpc3RlbmVycywgaGFuZGxlcikge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgICAgIGlmICghaGFuZGxlciB8fCBoYW5kbGVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBldmVudFBhcnRzID0gZXZlbnQuc3BsaXQoJy4nKVxuICAgIHZhciBldmVudFR5cGUgPSBldmVudFBhcnRzWzBdXG4gICAgdmFyIG5hbWVzcGFjZSA9IGV2ZW50UGFydHNbMV1cbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudFxuXG4gICAgaWYgKG5hbWVzcGFjZSAmJiB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV0gJiYgZXZlbnRUeXBlKSB7XG4gICAgICByZW1vdmVMaXN0ZW5lcnMoZWxlbWVudCwgdGhpcy5oYW5kbGVyc1tuYW1lc3BhY2VdW2V2ZW50VHlwZV0sIGhhbmRsZXIpXG4gICAgICB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV1bZXZlbnRUeXBlXSA9IFtdXG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50VHlwZSkge1xuICAgICAgZm9yICh2YXIgbnMgaW4gdGhpcy5oYW5kbGVycykge1xuICAgICAgICByZW1vdmVMaXN0ZW5lcnMoZWxlbWVudCwgdGhpcy5oYW5kbGVyc1tuc11bZXZlbnRUeXBlXSB8fCBbXSwgaGFuZGxlcilcbiAgICAgICAgdGhpcy5oYW5kbGVyc1tuc11bZXZlbnRUeXBlXSA9IFtdXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG5hbWVzcGFjZSAmJiB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV0pIHtcbiAgICAgIGZvciAodmFyIHR5cGUgaW4gdGhpcy5oYW5kbGVyc1tuYW1lc3BhY2VdKSB7XG4gICAgICAgIHJlbW92ZUxpc3RlbmVycyhlbGVtZW50LCB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV1bdHlwZV0sIGhhbmRsZXIpXG4gICAgICB9XG4gICAgICB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV0gPSB7fVxuICAgIH1cbiAgfVxuXG4gIC8qIEFkYXB0ZWQgZnJvbSBqUXVlcnkgMS54IG9mZnNldCgpICovXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQub3duZXJEb2N1bWVudCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICB2YXIgZG9jdW1lbnRFbGVtZW50ID0gdGhpcy5lbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gICAgdmFyIHdpbiA9IGdldFdpbmRvdyh0aGlzLmVsZW1lbnQub3duZXJEb2N1bWVudClcbiAgICB2YXIgcmVjdCA9IHtcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IDBcbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCkge1xuICAgICAgcmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b3A6IHJlY3QudG9wICsgd2luLnBhZ2VZT2Zmc2V0IC0gZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcCxcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpbi5wYWdlWE9mZnNldCAtIGRvY3VtZW50RWxlbWVudC5jbGllbnRMZWZ0XG4gICAgfVxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgdmFyIGV2ZW50UGFydHMgPSBldmVudC5zcGxpdCgnLicpXG4gICAgdmFyIGV2ZW50VHlwZSA9IGV2ZW50UGFydHNbMF1cbiAgICB2YXIgbmFtZXNwYWNlID0gZXZlbnRQYXJ0c1sxXSB8fCAnX19kZWZhdWx0J1xuICAgIHZhciBuc0hhbmRsZXJzID0gdGhpcy5oYW5kbGVyc1tuYW1lc3BhY2VdID0gdGhpcy5oYW5kbGVyc1tuYW1lc3BhY2VdIHx8IHt9XG4gICAgdmFyIG5zVHlwZUxpc3QgPSBuc0hhbmRsZXJzW2V2ZW50VHlwZV0gPSBuc0hhbmRsZXJzW2V2ZW50VHlwZV0gfHwgW11cblxuICAgIG5zVHlwZUxpc3QucHVzaChoYW5kbGVyKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgfVxuXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5wcm90b3R5cGUub3V0ZXJIZWlnaHQgPSBmdW5jdGlvbihpbmNsdWRlTWFyZ2luKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaW5uZXJIZWlnaHQoKVxuICAgIHZhciBjb21wdXRlZFN0eWxlXG5cbiAgICBpZiAoaW5jbHVkZU1hcmdpbiAmJiAhaXNXaW5kb3codGhpcy5lbGVtZW50KSkge1xuICAgICAgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClcbiAgICAgIGhlaWdodCArPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCwgMTApXG4gICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Cb3R0b20sIDEwKVxuICAgIH1cblxuICAgIHJldHVybiBoZWlnaHRcbiAgfVxuXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5wcm90b3R5cGUub3V0ZXJXaWR0aCA9IGZ1bmN0aW9uKGluY2x1ZGVNYXJnaW4pIHtcbiAgICB2YXIgd2lkdGggPSB0aGlzLmlubmVyV2lkdGgoKVxuICAgIHZhciBjb21wdXRlZFN0eWxlXG5cbiAgICBpZiAoaW5jbHVkZU1hcmdpbiAmJiAhaXNXaW5kb3codGhpcy5lbGVtZW50KSkge1xuICAgICAgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClcbiAgICAgIHdpZHRoICs9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCwgMTApXG4gICAgICB3aWR0aCArPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblJpZ2h0LCAxMClcbiAgICB9XG5cbiAgICByZXR1cm4gd2lkdGhcbiAgfVxuXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5wcm90b3R5cGUuc2Nyb2xsTGVmdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3aW4gPSBnZXRXaW5kb3codGhpcy5lbGVtZW50KVxuICAgIHJldHVybiB3aW4gPyB3aW4ucGFnZVhPZmZzZXQgOiB0aGlzLmVsZW1lbnQuc2Nyb2xsTGVmdFxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5zY3JvbGxUb3AgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgd2luID0gZ2V0V2luZG93KHRoaXMuZWxlbWVudClcbiAgICByZXR1cm4gd2luID8gd2luLnBhZ2VZT2Zmc2V0IDogdGhpcy5lbGVtZW50LnNjcm9sbFRvcFxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLmV4dGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuXG4gICAgZnVuY3Rpb24gbWVyZ2UodGFyZ2V0LCBvYmopIHtcbiAgICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IG9ialtrZXldXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMSwgZW5kID0gYXJncy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgbWVyZ2UoYXJnc1swXSwgYXJnc1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3NbMF1cbiAgfVxuXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5pbkFycmF5ID0gZnVuY3Rpb24oZWxlbWVudCwgYXJyYXksIGkpIHtcbiAgICByZXR1cm4gYXJyYXkgPT0gbnVsbCA/IC0xIDogYXJyYXkuaW5kZXhPZihlbGVtZW50LCBpKVxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLmlzRW1wdHlPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICAvKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IDAgKi9cbiAgICBmb3IgKHZhciBuYW1lIGluIG9iaikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBXYXlwb2ludC5hZGFwdGVycy5wdXNoKHtcbiAgICBuYW1lOiAnbm9mcmFtZXdvcmsnLFxuICAgIEFkYXB0ZXI6IE5vRnJhbWV3b3JrQWRhcHRlclxuICB9KVxuICBXYXlwb2ludC5BZGFwdGVyID0gTm9GcmFtZXdvcmtBZGFwdGVyXG59KCkpXG47Il19

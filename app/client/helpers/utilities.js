var util = DEPNES.namespace('client.helpers.utilities');

$.fn.isAfter = function (sel) {
  return this.prevAll(sel).length !== 0;
};
$.fn.isBefore = function (sel) {
  return this.nextAll(sel).length !== 0;
};

util.textWidth = function () {
  var html_org = $(this).html(),
      html_calc = '<span>' + html_org + '</span>';

  $(this).html(html_calc);

  var width = $(this).find('span:first').width();

  $(this).html(html_org);

  return width;
};

util.preventDefault = function (event) {
  var e = event || window.event;
  if(e.preventDefault) {
    e.preventDefault();
  }
  e.returnValue = false;
};

util.stopPropagation = function (event) {
  var e = event || window.event;
  if(e.stopPropagation) {
    e.stopPropagation();
  }
  e.cancelBubble = true;
};

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        util.preventDefault(e);
        return false;
    }
}

util.disableScroll = function () {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', util.preventDefault, false);
  window.onwheel = util.preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = util.preventDefault; // older browsers, IE
  window.ontouchmove  = util.preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

util.enableScroll = function () {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', util.preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}

px = function (number) {
  return number + 'px';
};

string = function (nonStringType) {
  return nonStringType + '';
};

offset = function ($object, side) {
  return parseInt($object.css(side), 10);
};

margin = function ($object, side) {
  return parseInt($object.css('margin-' + side), 10);
};

util.width = function ($object) {
  return parseInt($object.css('width'), 10);
};

util.viewportH = function () {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
};

util.stripHTML = function (html) {
  return html.replace(/<\/?[^>]+(>|$)/g, "").replace(/\r?\n|\r/g, '').replace(/\s/g, '');
};

util.HTMLToArray = function (html) {
  var d = document.createElement('div');
  d.innerHTML = html;
  var children = d.children;
  return children;
};

/**
 * skylark-utils-dom - An Elegant HTML5 DOM utility Library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./dom","./langx"],function(e,n){"use strict";var t,r,i=n.hoster.browser,o={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},s=null,l="",a="",c={},u={},m=/^(Webkit|webkit|O|Moz|moz|ms)(.*)$/,w=window.document,d=w.createElement("div"),F=d.webkitMatchesSelector||d.mozMatchesSelector||d.oMatchesSelector||d.matchesSelector,z=d.requestFullscreen||d.webkitRequestFullscreen||d.mozRequestFullScreen||d.msRequestFullscreen,S=(w.exitFullscreen||w.webkitCancelFullScreen||w.mozCancelFullScreen||w.msExitFullscreen,d.style);for(var b in S){var f=b.match(r||m);if(f){r||(t=f[1],r=new RegExp("^("+t+")(.*)$"),t,l="-"+t.toLowerCase()+"-",a=t.toLowerCase()),c[n.lowerFirst(f[2])]=b;var h=n.dasherize(f[2]);u[h]=l+h,o[b]&&(s=o[b])}}return s||void 0!==S.transition&&(s=o.transition),n.mixin(i,{css3PropPrefix:l,isIE:!!/msie/i.exec(window.navigator.userAgent),normalizeStyleProperty:function(e){return c[e]||e},normalizeCssProperty:function(e){return u[e]||e},normalizeCssEvent:function(e){return a?a+e:e.toLowerCase()},matchesSelector:F,requestFullScreen:z,exitFullscreen:z,location:function(){return window.location},support:{}}),s&&(i.support.transition={end:s}),d=null,e.browser=i});
//# sourceMappingURL=sourcemaps/browser.js.map

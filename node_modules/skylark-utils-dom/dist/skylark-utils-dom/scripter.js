/**
 * skylark-utils-dom - An Elegant HTML5 DOM utility Library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./dom","./langx","./noder","./finder"],function(e,a,r,t){var l=document.getElementsByTagName("head")[0],n={},o={},d=0;function c(){return c}return a.mixin(c,{loadJavaScript:function(e,a,r){var t=n[e];if(t||(t=n[e]={state:0,loadedCallbacks:[],errorCallbacks:[]}),t.loadedCallbacks.push(a),t.errorCallbacks.push(r),1===t.state)t.node.onload();else if(-1===t.state)t.node.onerror();else{var c=t.node=document.createElement("script"),s=t.id=d++;c.type="text/javascript",c.async=!1,c.defer=!1,startTime=(new Date).getTime(),l.appendChild(c),c.onload=function(){t.state=1;for(var e=t.loadedCallbacks,a=e.length;a--;)e[a]();t.loadedCallbacks=[],t.errorCallbacks=[]},c.onerror=function(){t.state=-1;for(var e=t.errorCallbacks,a=e.length;a--;)e[a]();t.loadedCallbacks=[],t.errorCallbacks=[]},c.src=e,o[s]=c}return t.id},deleteJavaScript:function(e){var a=o[e];if(a){var t=a.src;r.remove(a),delete o[e],delete n[t]}}}),e.scripter=c});
//# sourceMappingURL=sourcemaps/scripter.js.map

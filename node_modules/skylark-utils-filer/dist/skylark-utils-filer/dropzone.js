/**
 * skylark-utils-filer - The filer features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.1
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/arrays","skylark-langx/Deferred","skylark-utils-dom/styler","skylark-utils-dom/eventer","./filer","./webentry"],function(e,r,a,n,t,s){return t.dropzone=function(r,t){var d=(t=t||{}).hoverClass||"dropzone",f=t.dropped,i=0;return n.on(r,"dragenter",function(e){e.dataTransfer&&e.dataTransfer.types.indexOf("Files")>-1&&(n.stop(e),i++,a.addClass(r,d))}),n.on(r,"dragover",function(e){e.dataTransfer&&e.dataTransfer.types.indexOf("Files")>-1&&n.stop(e)}),n.on(r,"dragleave",function(e){e.dataTransfer&&e.dataTransfer.types.indexOf("Files")>-1&&0==--i&&a.removeClass(r,d)}),n.on(r,"drop",function(t){if(t.dataTransfer&&t.dataTransfer.types.indexOf("Files")>-1&&(a.removeClass(r,d),n.stop(t),f)){var i=t.dataTransfer.items;i&&i.length&&(i[0].webkitGetAsEntry||i[0].getAsEntry)?s.all(e.map(i,function(e){return e.webkitGetAsEntry?e.webkitGetAsEntry():e.getAsEntry()})).then(f):f(t.dataTransfer.files)}}),this}});
//# sourceMappingURL=sourcemaps/dropzone.js.map

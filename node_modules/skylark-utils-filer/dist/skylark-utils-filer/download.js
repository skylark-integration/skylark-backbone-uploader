/**
 * skylark-utils-filer - The filer features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.1
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./filer"],function(e){return e.downlad=function(e,t){if(window.navigator.msSaveBlob)types.isString(e)&&(e=dataURItoBlob(e)),window.navigator.msSaveBlob(e,t);else{var n=document.createElement("a");e instanceof Blob&&(e=URL.createObjectURL(e)),n.href=e,n.setAttribute("download",t||"noname"),n.dispatchEvent(new CustomEvent("click"))}}});
//# sourceMappingURL=sourcemaps/download.js.map

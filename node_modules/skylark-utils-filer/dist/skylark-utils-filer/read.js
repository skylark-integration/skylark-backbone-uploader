/**
 * skylark-utils-filer - The filer features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.1
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/Deferred","./filer"],function(r,e){return e.read=e.readFile=function(e,a){a=a||{};var t=new r,n=new FileReader;return n.onload=function(r){t.resolve(r.target.result)},n.onerror=function(r){var e=r.target.error.code;2===e?alert("please don't open this page using protocol fill:///"):alert("error code: "+e)},a.asArrayBuffer?n.readAsArrayBuffer(e):a.asDataUrl?n.readAsDataURL(e):a.asText?n.readAsText(e):n.readAsArrayBuffer(e),t.promise}});
//# sourceMappingURL=sourcemaps/read.js.map

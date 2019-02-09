/**
 * skylark-utils-filer - The filer features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.1
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/arrays","skylark-langx/Deferred","./filer"],function(e,n,r){var t=Array.prototype.concat,i=function(){function r(e,r){var t=new n,a=function(e){t.reject(e)};if(r=r||"",e.isFile)e.file(function(e){e.relativePath=r,t.resolve(e)},a);else if(e.isDirectory){e.createReader().readEntries(function(n){i(n,r+e.name+"/").then(function(e){t.resolve(e)}).catch(a)},a)}else t.resolve([]);return t.promise}function i(i,a){return n.all(e.map(i,function(e){return r(e,a)})).then(function(){return t.apply([],arguments)})}return{one:r,all:i}}();return r.webentry=i});
//# sourceMappingURL=sourcemaps/webentry.js.map

/**
 * skylark-utils-filer - The filer features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.1
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./filer"],function(e){var t,i=1/0;return e.select=function(e){var n=(e=e||{}).directory||!1,l=e.multiple||!1,r=e.picked;if(!t){var c=t=document.createElement("input");function o(e){for(var t=e.length;t--;)e[t].size>i&&e.splice(t,1);r(e)}c.type="file",c.style.position="fixed",c.style.left=0,c.style.top=0,c.style.opacity=.001,document.body.appendChild(c),c.onchange=function(e){var t=e.target.webkitEntries||e.target.entries;t&&t.length?webentry.all(t).then(function(e){o(e)}):o(Array.prototype.slice.call(e.target.files)),c.value=""}}t.multiple=l,t.webkitdirectory=n,t.click()}});
//# sourceMappingURL=sourcemaps/select.js.map

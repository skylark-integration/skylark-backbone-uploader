/**
 * skylark-utils-dom - An Elegant HTML5 DOM utility Library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./dom","./langx","./browser","./datax","./styler"],function(a,n,t,r,o){var i=t.normalizeCssProperty("transform");function e(a,n){return a>0&&a>-n?n:a<0&&a<n?-n:0}function f(a,n){var t,r,e,f,c,u=(t=n.radian,r=n.y,e=n.x,f=Math.cos(t),c=Math.sin(t),{M11:f*r,M12:-c*e,M21:c*r,M22:f*e});o.css(a,i,"matrix("+u.M11.toFixed(16)+","+u.M21.toFixed(16)+","+u.M12.toFixed(16)+","+u.M22.toFixed(16)+", 0, 0)")}function c(a,n){if(!n)return(n=r.data(a,"transform")||{}).radian=n.radian||0,n.x=n.x||1,n.y=n.y||1,n.zoom=n.zoom||1,n;r.data(a,"transform",n)}var u={vertical:function(a){a.radian=Math.PI-a.radian,a.y*=-1},horizontal:function(a){a.radian=Math.PI-a.radian,a.x*=-1},rotate:function(a,n){a.radian=n*Math.PI/180},left:function(a){a.radian-=Math.PI/2},right:function(a){a.radian+=Math.PI/2},scale:function(a,n){var t=e(a.y,n),r=e(a.x,n);t&&r&&(a.y+=t,a.x+=r)},zoomin:function(a){u.scale(a,.1)},zoomout:function(a){u.scale(a,-.1)}};function s(){return s}return["vertical","horizontal","rotate","left","right","scale","zoom","zoomin","zoomout"].forEach(function(a){var t;s[a]=(t=u[a],function(){var a=n.makeArray(arguments),r=a.shift(),o=c(r);a.unshift(o),t.apply(this,a),f(r,o),c(r,o)})}),n.mixin(s,{reset:function(a){var n={x:1,y:1,radian:0};f(a,n),c(a,n)}}),a.transforms=s});
//# sourceMappingURL=sourcemaps/transforms.js.map

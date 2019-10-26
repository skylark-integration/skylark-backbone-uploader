/**
 * skylark-backbone-uploader - The backbone file upload manager use skylark-backbone
 * @author 
 * @version v0.9.0
 * @link 
 * @license MIT
 */
define(["skylark-backbone"],function(e){e.TemplateManager={templates:{},baseUrl:"/templates/{name}",loadings:new Array,currentViews:{},queues:{},set:function(e,t){this.templates[e]=t;var n=this.queues[e];if(n)for(var i=0;i<n.length;i++)n[i].dfd.resolveWith(n[i].context,[t]);this.queues[e]=new Array},notLoading:function(e){var t=this.loadings.indexOf(e);if(-1!=t){var n=this.loadings.slice(t+1||this.loadings.length);return this.loadings.length=t<0?this.loadings.length+t:t,this.loadings.push.apply(this,n)}},get:function(t,n){if(null==t)throw"Template name must be defined";var i=$.Deferred();if(this.templates[t])i.resolveWith(n,[this.templates[t]]);else if(this.queues[t]||(this.queues[t]=new Array),this.queues[t].push({dfd:i,context:n}),-1==this.loadings.indexOf(t)){this.loadings.push(t);var a=e.TemplateManager.baseUrl.replace("{name}",t);$.get(a,function(n){var i=_.template(n);e.TemplateManager.notLoading(t),e.TemplateManager.set(t,i)}).error(function(){e.TemplateManager.notLoading(t)})}return i.promise()}},e.DeferedView=e.View.extend({templateName:null,container:null,loadedCountDown:1,deferedRender:function(t){this.templateName,e.TemplateManager.get(this.templateName,this).then(function(e){this.template=e,this.render(),this.isLoaded(!0),void 0!=t&&"function"==typeof t&&t()});return this},getHelpers:function(){return{displaySize:function(e){if(0==e)return"0 B";var t=parseInt(Math.floor(Math.log(e)/Math.log(1024)));return(e/Math.pow(1024,t)).toFixed(2)+" "+["B","KB","MB","GB","TB"][t]},displayDate:function(e){return new Date(e).toLocaleString()}}},renderTo:function(t,n){return e.TemplateManager.currentViews[t]&&e.TemplateManager.currentViews[t].close(),e.TemplateManager.currentViews[t]=this,this.isLoaded(!1),$(t).html(this.deferedRender(n).el),this},isLoaded:function(e){return void 0!=e&&(this.loadedCountDown+=e?-1:1,this.loadedCountDown>0?$(this.el).addClass("loading"):$(this.el).removeClass("loading")),0==this.loadedCountDown},close:function(){"function"==typeof this.onPreClose&&this.onPreClose(),this.remove(),this.unbind(),"function"==typeof this.onClose&&this.onClose()}})});
//# sourceMappingURL=sourcemaps/defered-view-loader.js.map

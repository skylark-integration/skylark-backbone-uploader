/**
 * skylark-backbone-uploader - The backbone file upload manager use skylark-backbone
 * @author 
 * @version v0.9.0
 * @link 
 * @license MIT
 */
!function(e,t){var i=t.define,s=t.require,n="function"==typeof i&&i.amd,o=!n&&"undefined"!=typeof exports;if(!n&&!i){var r={};i=t.define=function(e,t,i){"function"==typeof i?(r[e]={factory:i,deps:t.map(function(t){return function(e,t){if("."!==e[0])return e;var i=t.split("/"),s=e.split("/");i.pop();for(var n=0;n<s.length;n++)"."!=s[n]&&(".."==s[n]?i.pop():i.push(s[n]));return i.join("/")}(t,e)}),resolved:!1,exports:null},s(e)):r[e]={factory:null,resolved:!0,exports:i}},s=t.require=function(e){if(!r.hasOwnProperty(e))throw new Error("Module "+e+" has not been defined");var i=r[e];if(!i.resolved){var n=[];i.deps.forEach(function(e){n.push(s(e))}),i.exports=i.factory.apply(t,n)||null,i.resolved=!0}return i.exports}}if(!i)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(e,t){e("skylark-backbone-uploader/defered-view-loader",["skylark-backbone"],function(e){e.TemplateManager={templates:{},baseUrl:"/templates/{name}",loadings:new Array,currentViews:{},queues:{},set:function(e,t){this.templates[e]=t;var i=this.queues[e];if(i)for(var s=0;s<i.length;s++)i[s].dfd.resolveWith(i[s].context,[t]);this.queues[e]=new Array},notLoading:function(e){var t=this.loadings.indexOf(e);if(-1!=t){var i=this.loadings.slice(t+1||this.loadings.length);return this.loadings.length=t<0?this.loadings.length+t:t,this.loadings.push.apply(this,i)}},get:function(t,i){if(null==t)throw"Template name must be defined";var s=$.Deferred();if(this.templates[t])s.resolveWith(i,[this.templates[t]]);else if(this.queues[t]||(this.queues[t]=new Array),this.queues[t].push({dfd:s,context:i}),-1==this.loadings.indexOf(t)){this.loadings.push(t);var n=e.TemplateManager.baseUrl.replace("{name}",t);$.get(n,function(i){var s=_.template(i);e.TemplateManager.notLoading(t),e.TemplateManager.set(t,s)}).error(function(){e.TemplateManager.notLoading(t)})}return s.promise()}},e.DeferedView=e.View.extend({templateName:null,container:null,loadedCountDown:1,deferedRender:function(t){this.templateName,e.TemplateManager.get(this.templateName,this).then(function(e){this.template=e,this.render(),this.isLoaded(!0),void 0!=t&&"function"==typeof t&&t()});return this},getHelpers:function(){return{displaySize:function(e){if(0==e)return"0 B";var t=parseInt(Math.floor(Math.log(e)/Math.log(1024)));return(e/Math.pow(1024,t)).toFixed(2)+" "+["B","KB","MB","GB","TB"][t]},displayDate:function(e){return new Date(e).toLocaleString()}}},renderTo:function(t,i){return e.TemplateManager.currentViews[t]&&e.TemplateManager.currentViews[t].close(),e.TemplateManager.currentViews[t]=this,this.isLoaded(!1),$(t).html(this.deferedRender(i).el),this},isLoaded:function(e){return void 0!=e&&(this.loadedCountDown+=e?-1:1,this.loadedCountDown>0?$(this.el).addClass("loading"):$(this.el).removeClass("loading")),0==this.loadedCountDown},close:function(){"function"==typeof this.onPreClose&&this.onPreClose(),this.remove(),this.unbind(),"function"==typeof this.onClose&&this.onClose()}})}),e("skylark-backbone-uploader/upload",["skylark-langx/types","skylark-langx/objects","skylark-langx/arrays","skylark-langx/Deferred","skylark-langx/Xhr"],function(e,t,i,s,n){return function(i){var o=t.mixin({contentRange:null,paramName:void 0,singleFileUploads:!0,limitMultiFileUploads:void 0,limitMultiFileUploadSize:void 0,limitMultiFileUploadSizeOverhead:512,sequentialUploads:!1,limitConcurrentUploads:void 0,multipart:!0,maxChunkSize:void 0,uploadedBytes:void 0,recalculateProgress:!0,progressInterval:100,bitrateInterval:500,autoUpload:!0,messages:{uploadedBytes:"Uploaded bytes exceed file size"},i18n:function(e,i){return e=this.messages[e]||e.toString(),i&&t.each(i,function(t,i){e=e.replace("{"+t+"}",i)}),e},formData:function(e){return e.serializeArray()},add:function(e,t){if(e.isDefaultPrevented())return!1;(t.autoUpload||!1!==t.autoUpload&&$(this).fileupload("option","autoUpload"))&&t.process().done(function(){t.submit()})},processData:!1,contentType:!1,cache:!1},i),r=function(){var e=Blob.prototype.slice||Blob.prototype.webkitSlice||Blob.prototype.mozSlice;return e.apply(this,arguments)},a=function(e){return n.request(e.url,e)};function l(i){var s,n=i.files[0],o=i.multipart,r="array"===e.type(i.paramName)?i.paramName[0]:i.paramName;i.headers=t.mixin({},i.headers),i.contentRange&&(i.headers["Content-Range"]=i.contentRange),o?(s=new FormData,i.blob?s.append(r,i.blob,n.name):t.each(i.files,function(t,n){s.append("array"===e.type(i.paramName)&&i.paramName[t]||r,n,n.uploadName||n.name)}),i.data=s):(i.headers["Content-Disposition"]='attachment; filename="'+encodeURI(n.name)+'"',i.contentType=n.type||"application/octet-stream",i.data=i.blob||n),i.blob=null}function d(e,i){e.uploadedBytes=e.uploadedBytes||0;var n,o,d=e.files[0],p=d.size,u=e.uploadedBytes,h=e.maxChunkSize||p,c=r,f=new s,g=f.promise;return!(!c||!(u||h<p)||e.data)&&(!!i||(u>=p?(d.error=e.i18n("uploadedBytes"),this._getXHRPromise(!1,e.context,[null,"error",d.error])):(o=function(){var i=t.mixin({},e),s=i._progress.loaded;i.blob=c.call(d,u,u+h,d.type),i.chunkSize=i.blob.size,i.contentRange="bytes "+u+"-"+(u+i.chunkSize-1)+"/"+p,l(i),n=a(i).done(function(t,n,r){u=function(e){var t=e.getResponseHeader("Range"),i=t&&t.split("-"),s=i&&i.length>1&&parseInt(i[1],10);return s&&s+1}(r)||u+i.chunkSize,s+i.chunkSize-i._progress.loaded&&f.progress({lengthComputable:!0,loaded:u-i.uploadedBytes,total:u-i.uploadedBytes}),e.uploadedBytes=i.uploadedBytes=u,i.result=t,i.textStatus=n,i.jqXHR=r,u<p?o():f.resolveWith(i.context,[t,n,r])}).fail(function(e,t,s){i.jqXHR=e,i.textStatus=t,i.errorThrown=s,f.rejectWith(i.context,[e,t,s])})},g.abort=function(){return n.abort()},o(),g)))}p=o,p.type=p.type||"POST",d(p,!0)||p.data||l(p),o._bitrateTimer=new function(){this.timestamp=Date.now?Date.now():(new Date).getTime(),this.loaded=0,this.bitrate=0,this.getBitrate=function(e,t,i){var s=e-this.timestamp;return(!this.bitrate||!i||s>i)&&(this.bitrate=(t-this.loaded)*(1e3/s)*8,this.loaded=t,this.timestamp=e),this.bitrate}};var p;var u=d(o)||a(o);return u.options=o,u}}),e("skylark-backbone-uploader/uploader",["skylark-langx/langx","skylark-domx-eventer","skylark-domx-query","skylark-domx-files/dropzone","skylark-domx-files/pastezone","skylark-domx-files/picker","./upload"],function(e,t,i,s,n,o,r){"use strict";var a=e.Deferred,l=e.Evented.inherit({options:{dropZone:i(document),pasteZone:i(document),picker:void 0,paramName:void 0,singleFileUploads:!0,limitMultiFileUploads:void 0,limitMultiFileUploadSize:void 0,limitMultiFileUploadSizeOverhead:512,sequentialUploads:!1,limitConcurrentUploads:void 0,postMessage:void 0,multipart:!0,maxChunkSize:void 0,uploadedBytes:void 0,recalculateProgress:!0,progressInterval:100,bitrateInterval:500,autoUpload:!1,messages:{uploadedBytes:"Uploaded bytes exceed file size"},i18n:function(t,i){return t=this.messages[t]||t.toString(),i&&e.each(i,function(e,i){t=t.replace("{"+e+"}",i)}),t},formData:function(e){return e.serializeArray()},add:function(e,t){if(e.isDefaultPrevented())return!1;(t.autoUpload||!1!==t.autoUpload&&i(this).fileupload("instance").option("autoUpload"))&&t.process().done(function(){t.submit()})},processData:!1,contentType:!1,cache:!1},_specialOptions:["picker","dropZone","pasteZone","multipart","filesContainer","uploadTemplateId","downloadTemplateId"],_BitrateTimer:function(){this.timestamp=Date.now?Date.now():(new Date).getTime(),this.loaded=0,this.bitrate=0,this.getBitrate=function(e,t,i){var s=e-this.timestamp;return(!this.bitrate||!i||s>i)&&(this.bitrate=(t-this.loaded)*(1e3/s)*8,this.loaded=t,this.timestamp=e),this.bitrate}},_getTotal:function(t){var i=0;return e.each(t,function(e,t){i+=t.size||1}),i},_initProgressObject:function(t){var i={loaded:0,total:0,bitrate:0};t._progress?e.extend(t._progress,i):t._progress=i},_initResponseObject:function(e){var t;if(e._response)for(t in e._response)e._response.hasOwnProperty(t)&&delete e._response[t];else e._response={}},_onProgress:function(e,i){if(e.lengthComputable){var s,n=Date.now?Date.now():(new Date).getTime();if(i._time&&i.progressInterval&&n-i._time<i.progressInterval&&e.loaded!==e.total)return;i._time=n,s=Math.floor(e.loaded/e.total*(i.chunkSize||i._progress.total))+(i.uploadedBytes||0),this._progress.loaded+=s-i._progress.loaded,this._progress.bitrate=this._bitrateTimer.getBitrate(n,this._progress.loaded,i.bitrateInterval),i._progress.loaded=i.loaded=s,i._progress.bitrate=i.bitrate=i._bitrateTimer.getBitrate(n,s,i.bitrateInterval),this._trigger("progress",t.create("progress",{delegatedEvent:e}),i),this._trigger("progressall",t.create("progressall",{delegatedEvent:e}),this._progress)}},_getParamName:function(t){i(t.picker);var s=t.paramName;return e.isArray(s)||(s=[s]),s},_getDeferredState:function(e){return e.state?e.state():e.isResolved()?"resolved":e.isRejected()?"rejected":"pending"},_enhancePromise:function(e){return e.success=e.done,e.error=e.fail,e.complete=e.always,e},_getXHRPromise:function(e,t,i){var s=new a,n=s.promise;return t=t||this.options.context||n,!0===e?s.resolveWith(t,i):!1===e&&s.rejectWith(t,i),n.abort=s.promise,this._enhancePromise(n)},_addConvenienceMethods:function(e,i){var s=this,n=function(e){return(new a).resolveWith(s,e).promise};i.process=function(e,t){return(e||t)&&(i._processQueue=this._processQueue=(this._processQueue||n([this])).pipe(function(){return i.errorThrown?(new a).rejectWith(s,[i]).promise:n(arguments)}).pipe(e,t)),this._processQueue||n([this])},i.submit=function(){return"pending"!==this.state()&&(i.jqXHR=this.jqXHR=!1!==s._trigger("submit",t.create("submit",{delegatedEvent:e}),this)&&s._onSend(e,this)),this.jqXHR||s._getXHRPromise()},i.abort=function(){return this.jqXHR?this.jqXHR.abort():(this.errorThrown="abort",s._trigger("fail",null,this),s._getXHRPromise(!1))},i.state=function(){return this.jqXHR?s._getDeferredState(this.jqXHR):this._processQueue?s._getDeferredState(this._processQueue):void 0},i.processing=function(){return!this.jqXHR&&this._processQueue&&"pending"===s._getDeferredState(this._processQueue)},i.progress=function(){return this._progress},i.response=function(){return this._response}},_beforeSend:function(e,t){0===this._active&&(this._trigger("start"),this._bitrateTimer=new this._BitrateTimer,this._progress.loaded=this._progress.total=0,this._progress.bitrate=0),this._initResponseObject(t),this._initProgressObject(t),t._progress.loaded=t.loaded=t.uploadedBytes||0,t._progress.total=t.total=this._getTotal(t.files)||1,t._progress.bitrate=t.bitrate=0,this._active+=1,this._progress.loaded+=t.loaded,this._progress.total+=t.total},_onDone:function(e,i,s,n){var o=n._progress.total,r=n._response;n._progress.loaded<o&&this._onProgress(t.create("progress",{lengthComputable:!0,loaded:o,total:o}),n),r.result=n.result=e,r.textStatus=n.textStatus=i,r.jqXHR=n.jqXHR=s,this._trigger("done",null,n)},_onFail:function(e,t,i,s){var n=s._response;s.recalculateProgress&&(this._progress.loaded-=s._progress.loaded,this._progress.total-=s._progress.total),n.jqXHR=s.jqXHR=e,n.textStatus=s.textStatus=t,n.errorThrown=s.errorThrown=i,this._trigger("fail",null,s)},_trigger:function(e,i,s){var n=t.proxy(i);return n.type=e,n.data=s,this.trigger(n,s)},_onAlways:function(e,t,i,s){this._trigger("always",null,s)},_onSend:function(e,t){t.submit||this._addConvenienceMethods(e,t);var i,s=this;return this._beforeSend(e,t),s._sending+=1,t.url=s.options.url,t.dataType=s.options.dataType,t.xhrFields=s.options.xhrFields,(i=r(t)).progress(function(e){s._onProgress(e,i.options)}).done(function(e,t){s._onDone(e,t,i,i.options)}).fail(function(e,t){s._onFail(i,t,e,i.options)}).always(function(){s._sending-=1,s._active-=1,s._trigger("stop")}),i},_onAdd:function(i,s){var n,o,r,a,l=this,d=!0,p=e.extend({},this.options,s),u=s.files,h=u.length,c=p.limitMultiFileUploads,f=p.limitMultiFileUploadSize,g=p.limitMultiFileUploadSizeOverhead,m=0,_=this._getParamName(p),v=0;if(!f||h&&void 0!==u[0].size||(f=void 0),p.singleFileUploads||c||f)if(p.singleFileUploads||f||!c)if(!p.singleFileUploads&&f)for(r=[],n=[],a=0;a<h;a+=1)m+=u[a].size+g,(a+1===h||m+u[a+1].size+g>f||c&&a+1-v>=c)&&(r.push(u.slice(v,a+1)),(o=_.slice(v,a+1)).length||(o=_),n.push(o),v=a+1,m=0);else n=_;else for(r=[],n=[],a=0;a<h;a+=c)r.push(u.slice(a,a+c)),(o=_.slice(a,a+c)).length||(o=_),n.push(o);else r=[u],n=[_];return s.originalFiles=u,e.each(r||u,function(o,a){var p=e.extend({},s);return p.files=r?a:[a],p.paramName=n[o],l._initResponseObject(p),l._initProgressObject(p),l._addConvenienceMethods(i,p),d=l._trigger("add",t.create("add",{delegatedEvent:i}),p)}),d},_initEventHandlers:function(){var e=this;s(this.options.dropZone[0],{dropped:function(t){var i={};i.files=t,e._onAdd(null,i)}}),n(this.options.pasteZone[0],{pasted:function(t){var i={};i.files=t,e._onAdd(null,i)}}),o(this.options.picker[0],{multiple:!0,picked:function(t){var i={};i.files=t,e._onAdd(null,i)}})},_destroyEventHandlers:function(){},_setOption:function(t,i){var s=-1!==e.inArray(t,this._specialOptions);s&&this._destroyEventHandlers(),this._super(t,i),s&&(this._initSpecialOptions(),this._initEventHandlers())},_initSpecialOptions:function(){var e=this.options;e.picker&&(e.picker instanceof i||(e.picker=i(e.picker,this._elm))),e.dropZone&&(e.dropZone instanceof i||(e.dropZone=i(e.dropZone,this._elm))),e.pasteZone&&(e.pasteZone instanceof i||(e.pasteZone=i(e.pasteZone,this._elm)))},_getRegExp:function(e){var t=e.split("/"),i=t.pop();return t.shift(),new RegExp(t.join("/"),i)},_isRegExpOption:function(t,i){return"url"!==t&&"string"===e.type(i)&&/^\/.*\/[igm]{0,3}$/.test(i)},_construct:function(t,i){this._elm=t,this.options=e.mixin({},this.options,i),this._initSpecialOptions(),this._slots=[],this._sequence=this._getXHRPromise(!0),this._sending=this._active=0,this._initProgressObject(this),this._initEventHandlers()},active:function(){return this._active},progress:function(){return this._progress},add:function(t){t&&!this.options.disabled&&(t.files=e.makeArray(t.files),this._onAdd(null,t))},send:function(t){return t&&!this.options.disabled&&(t.files=e.makeArray(t.files),t.files.length)?this._onSend(null,t):this._getXHRPromise(!1,t&&t.context)}});return function(t,i){var s=new l(t,i);return s.on("all",function(t,n){var o=t.type;e.isFunction(i[o])&&i[o].call(s._elm,t,n)}),s}}),e("skylark-backbone-uploader/upload-manager",["skylark-backbone","./uploader","./defered-view-loader"],function(e,t){e.UploadManager=e.DeferedView.extend({defaults:{templates:{main:"/templates/upload-manager.main.default",file:"/templates/upload-manager.file.default"},uploadUrl:"/upload",autoUpload:!1,fileUploadId:"fileupload",startUploadsId:"start-uploads-button",cancelUploadsId:"cancel-uploads-button",dataType:"json"},file_id:0,className:"upload-manager",initialize:function(t){this.options=$.extend(this.defaults,t),this.templateName=this.options.templates.main,this.files=new e.UploadManager.FileCollection,this.bindLocal()},bindLocal:function(){var e=this;this.on("fileadd",function(t){e.files.add(t),e.renderFile(t)}).on("fileprogress",function(e,t){e.progress(t)}).on("filefail",function(e,t){e.fail(t)}).on("filedone",function(e,t){e.done(t.result)}),this.files.on("all",this.update,this)},renderFile:function(t){var i=new e.UploadManager.FileView($.extend(this.options,{model:t}));$("#file-list",self.el).append(i.deferedRender().el)},update:function(){var e=$("#"+this.options.cancelUploadsId+", #"+this.options.startUploadsId,this.el),t=$("#file-list .no-data",this.el);this.files.length>0?(e.removeClass("hidden"),t.addClass("hidden")):(e.addClass("hidden"),t.removeClass("hidden"))},bindProcessEvents:function(){},render:function(){var i=this;$(this.el).html(this.template()),this.update();var s=$(".fileinput-button",this.el),i=this;this.uploadProcess=t(this.el,{dataType:this.options.dataType,url:this.options.uploadUrl,formData:this.options.formData,autoUpload:this.options.autoUpload,singleFileUploads:!0,picker:s,add:function(t,s){s.uploadManagerFiles=[],$.each(s.files,function(t,n){n.id=i.file_id++;var o=new e.UploadManager.File({data:n,processor:s});s.uploadManagerFiles.push(o),i.trigger("fileadd",o)})},progress:function(e,t){$.each(t.uploadManagerFiles,function(e,s){i.trigger("fileprogress",s,t)})},fail:function(e,t){$.each(t.uploadManagerFiles,function(e,s){var n="Unknown error";"string"==typeof t.errorThrown?n=t.errorThrown:"object"==typeof t.errorThrown?n=t.errorThrown.message:t.result&&(n=t.result.error?t.result.error:t.result.files&&t.result.files[e]&&t.result.files[e].error?t.result.files[e].error:"Unknown remote error"),i.trigger("filefail",s,n)})},done:function(e,t){$.each(t.uploadManagerFiles,function(e,s){i.trigger("filedone",s,t)})}}),this.bindProcessEvents(),$("#"+this.options.cancelUploadsId,this.el).click(function(){for(;i.files.length;)i.files.at(0).cancel()}),$("#"+this.options.startUploadsId,this.el).click(function(){i.files.each(function(e){e.start()})}),$.each(this.files,function(e,t){i.renderFile(t)})}},{File:e.Model.extend({state:"pending",start:function(){this.isPending()&&(this.get("processor").submit(),this.state="running",this.trigger("filestarted",this))},cancel:function(){this.get("processor").abort(),this.destroy(),this.state="canceled",this.trigger("filecanceled",this)},progress:function(e){this.trigger("fileprogress",this.get("processor").progress())},fail:function(e){this.state="error",this.trigger("filefailed",e)},done:function(e){this.state="error",this.trigger("filedone",e)},isPending:function(){return"pending"==this.getState()},isRunning:function(){return"running"==this.getState()},isDone:function(){return"done"==this.getState()},isError:function(){return"error"==this.getState()||"canceled"==this.getState},getState:function(){return this.state}}),FileCollection:e.Collection.extend({model:this.File}),FileView:e.DeferedView.extend({className:"upload-manager-file row",initialize:function(e){this.templateName=e.templates.file,this.processUploadMsg=e.processUploadMsg,this.doneMsg=e.doneMsg,this.model.on("destroy",this.close,this),this.model.on("fileprogress",this.updateProgress,this),this.model.on("filefailed",this.hasFailed,this),this.model.on("filedone",this.hasDone,this),this.model.on("all",this.update,this)},render:function(){$(this.el).html(this.template(this.computeData())),this.bindEvents(),this.update()},updateProgress:function(e){var t=parseInt(e.loaded/e.total*100,10),i=this.getHelpers().displaySize(e.loaded)+" of "+this.getHelpers().displaySize(e.total);t>=100&&this.processUploadMsg&&(i=this.processUploadMsg),$(".progress",this.el).find(".bar").css("width",t+"%").parent().find(".progress-label").html(i)},hasFailed:function(e){$(".message",this.el).html('<i class="icon-error"></i> '+e)},hasDone:function(e){$(".message",this.el).html('<i class="icon-success"></i> '+(this.doneMsg||"Uploaded"))},update:function(){var e=$(".size, #btn-cancel",this.el),t=$(".progress, #btn-cancel",this.el),i=$(".message, #btn-clear",this.el);this.model.isPending()?(t.add(i).addClass("hidden"),e.removeClass("hidden")):this.model.isRunning()?(e.add(i).addClass("hidden"),t.removeClass("hidden")):(this.model.isDone()||this.model.isError())&&(e.add(t).addClass("hidden"),i.removeClass("hidden"))},bindEvents:function(){var e=this;$("#btn-cancel",this.el).click(function(){e.model.cancel(),e.collection.remove(e.model)}),$("#btn-clear",this.el).click(function(){e.model.destroy(),e.collection.remove(e.model)})},computeData:function(){return $.extend(this.getHelpers(),this.model.get("data"))}})})}),e("skylark-backbone-uploader/main",["skylark-backbone","./defered-view-loader","./upload-manager"],function(e){return e}),e("skylark-backbone-uploader",["skylark-backbone-uploader/main"],function(e){return e})}(i),!n){var a=s("skylark-langx/skylark");o?module.exports=a:t.skylarkjs=a}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-backbone-uploader.js.map
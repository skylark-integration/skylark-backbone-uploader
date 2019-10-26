/**
 * skylark-backbone-uploader - The backbone file upload manager use skylark-backbone
 * @author 
 * @version v0.9.0
 * @link 
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

/**
 * Backbone.js defered view loader
 *
 * @author Samuel ROZE
 * @link sroze.io
 * @link github.com/sroze
 */
define('skylark-backbone-uploader/defered-view-loader',[
    "skylark-backbone"
],function(Backbone) {
    /**
     * TemplateManager object provides an async template loading and caching
     * system.
     * 
     */
    Backbone.TemplateManager = {
        // Already loaded templates
        templates: {},
        
        // Base loading template URL
        baseUrl: '/templates/{name}',
        
        // Templates that are currently loading
        loadings: new Array(),
        
        // Save current rendered views
        currentViews: {},
        
        // Waiting defereds
        queues: {},
        
        set: function (name, data) {
            this.templates[name] = data;
            
            // Resolve queues
            var queue = this.queues[name];
            if (queue) {
                for (var i = 0; i < queue.length; i++) {
                    queue[i].dfd.resolveWith(queue[i].context, [data]);
                }
            }
            this.queues[name] = new Array();
        },
        
        notLoading: function (name) {
            var index = this.loadings.indexOf(name);
            if (index != -1) {
                var rest = this.loadings.slice(index + 1 || this.loadings.length);
                this.loadings.length = index < 0 ? this.loadings.length + index : index;
                return this.loadings.push.apply(this, rest);
            }
        },
        
        get: function(name, context) 
        {
            if (name == null) {
                throw "Template name must be defined";
            }
            
            var dfd = $.Deferred();
            
            // If the template is already loaded, resolve immediately
            if (this.templates[name]) {
                dfd.resolveWith(context, [this.templates[name]]);
            } else {
                // Add this request to queue
                if (!this.queues[name]) {
                    this.queues[name] = new Array();
                }
                this.queues[name].push({dfd: dfd, context: context});
                
                // Is this template loading ?
                if (this.loadings.indexOf(name) == -1) {
                    this.loadings.push(name);
                    
                    // Compute template URL
                    var url = Backbone.TemplateManager.baseUrl.replace('{name}', name);
                
                    // Start template loading
                    $.get(url, function (data) {
                        // Compute template
                        var template = _.template(data);
                        
                        // Save template in "cache"
                        Backbone.TemplateManager.notLoading(name);
                        Backbone.TemplateManager.set(name, template);
                    }).error(function(){
                        Backbone.TemplateManager.notLoading(name);
                    });
                }
            }
            
            return dfd.promise();
        }
    };

    /**
     * Lmc.View improves the backbone model view, with async template
     * loading for instance.
     * 
     */
    Backbone.DeferedView = Backbone.View.extend({
        templateName: null,
        container: null,
        loadedCountDown: 1,
        
        deferedRender: function(event) {
            // Fetch the template from the TemplateManager and when complete 
            // call the normal render method
            var tn = this.templateName;
            //var render = $.when(
            //    Backbone.TemplateManager.get(this.templateName, this)
            //).then(function(resultTemplate){
            var render = Backbone.TemplateManager.get(this.templateName, this).
                then(function(resultTemplate){
                this.template = resultTemplate;
                this.render();
                this.isLoaded(true);
                
                if (event != undefined && typeof event == "function") {
                    event();
                }
            });

            return this;
        },
        
        getHelpers: function () {
            return {
                displaySize: function (bytes) {
                    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                    if (bytes == 0) return '0 B';
                    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
                },
                displayDate: function (timestamp) {
                    return new Date(timestamp).toLocaleString();
                }
            }
        },
        
        renderTo: function (container, event) {
            if (Backbone.TemplateManager.currentViews[container]){
                Backbone.TemplateManager.currentViews[container].close();
            }
            
            Backbone.TemplateManager.currentViews[container] = this;
            this.isLoaded(false);
            
            $(container).html(this.deferedRender(event).el);
            
            return this;
        },
        
        isLoaded: function (loaded) {
            if (loaded != undefined) {
                this.loadedCountDown += (loaded ? -1 : 1);
                if (this.loadedCountDown > 0) {
                    $(this.el).addClass('loading');
                } else {
                    $(this.el).removeClass('loading');
                }
            }
            
            return this.loadedCountDown == 0;
        },
        
        close: function() {
            if (typeof this.onPreClose == "function") {
                this.onPreClose();
            }
            this.remove();
            this.unbind();
            if (typeof this.onClose == "function") {
                this.onClose();
            }
        }
    });
});
define('skylark-backbone-uploader/upload',[
    "skylark-langx/types",
    "skylark-langx/objects",
    "skylark-langx/arrays",
    "skylark-langx/Deferred",
    "skylark-langx/Xhr"
],function(types, objects, arrays, Deferred,Xhr){

    function upload(params) {
        var xoptions = objects.mixin({
            contentRange: null, //

            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,
            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function(message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    objects.each(context, function(key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function(form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function(e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false &&
                        $(this).fileupload('option', 'autoUpload'))) {
                    data.process().done(function() {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        }, params);

        var blobSlice = function() {
                var slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;
                return slice.apply(this, arguments);
            },
            ajax = function(data) {
                return Xhr.request(data.url, data);
            };

        function initDataSettings(o) {
            o.type = o.type || "POST";

            if (!chunkedUpload(o, true)) {
                if (!o.data) {
                    initXHRData(o);
                }
                //initProgressListener(o);
            }
        }

        function initXHRData(o) {
            var that = this,
                formData,
                file = o.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = o.multipart,
                paramName = types.type(o.paramName) === 'array' ?
                o.paramName[0] : o.paramName;

            o.headers = objects.mixin({}, o.headers);
            if (o.contentRange) {
                o.headers['Content-Range'] = o.contentRange;
            }
            if (!multipart) {
                o.headers['Content-Disposition'] = 'attachment; filename="' +
                    encodeURI(file.name) + '"';
                o.contentType = file.type || 'application/octet-stream';
                o.data = o.blob || file;
            } else {
                formData = new FormData();
                if (o.blob) {
                    formData.append(paramName, o.blob, file.name);
                } else {
                    objects.each(o.files, function(index, file) {
                        // This check allows the tests to run with
                        // dummy objects:
                        formData.append(
                            (types.type(o.paramName) === 'array' &&
                                o.paramName[index]) || paramName,
                            file,
                            file.uploadName || file.name
                        );
                    });
                }
                o.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            o.blob = null;
        }

        function getTotal(files) {
            var total = 0;
            objects.each(files, function(index, file) {
                total += file.size || 1;
            });
            return total;
        }

        function getUploadedBytes(jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 &&
                parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        }

        function initProgressObject(obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                objects.mixin(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        }

        function BitrateTimer() {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function(now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        }

        function chunkedUpload(options, testOnly) {
            options.uploadedBytes = options.uploadedBytes || 0;
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes,
                mcs = options.maxChunkSize || fs,
                slice = blobSlice,
                dfd = new Deferred(),
                promise = dfd.promise,
                jqXHR,
                upload;
            if (!(slice && (ub || mcs < fs)) ||
                options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = options.i18n('uploadedBytes');
                return this._getXHRPromise(
                    false,
                    options.context, [null, 'error', file.error]
                );
            }
            // The chunk upload method:
            upload = function() {
                // Clone the options object for each chunk upload:
                var o = objects.mixin({}, options),
                    currentLoaded = o._progress.loaded;
                o.blob = slice.call(
                    file,
                    ub,
                    ub + mcs,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                o.chunkSize = o.blob.size;
                // Expose the chunk bytes position range:
                o.contentRange = 'bytes ' + ub + '-' +
                    (ub + o.chunkSize - 1) + '/' + fs;
                // Process the upload data (the blob and potential form data):
                initXHRData(o);
                // Add progress listeners for this chunk upload:
                //initProgressListener(o);
                jqXHR = ajax(o).done(function(result, textStatus, jqXHR) {
                        ub = getUploadedBytes(jqXHR) ||
                            (ub + o.chunkSize);
                        // Create a progress event if no final progress event
                        // with loaded equaling total has been triggered
                        // for this chunk:
                        if (currentLoaded + o.chunkSize - o._progress.loaded) {
                            dfd.progress({
                                lengthComputable: true,
                                loaded: ub - o.uploadedBytes,
                                total: ub - o.uploadedBytes
                            });
                        }
                        options.uploadedBytes = o.uploadedBytes = ub;
                        o.result = result;
                        o.textStatus = textStatus;
                        o.jqXHR = jqXHR;
                        //that._trigger('chunkdone', null, o);
                        //that._trigger('chunkalways', null, o);
                        if (ub < fs) {
                            // File upload not yet complete,
                            // continue with the next chunk:
                            upload();
                        } else {
                            dfd.resolveWith(
                                o.context, [result, textStatus, jqXHR]
                            );
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        o.jqXHR = jqXHR;
                        o.textStatus = textStatus;
                        o.errorThrown = errorThrown;
                        //that._trigger('chunkfail', null, o);
                        //that._trigger('chunkalways', null, o);
                        dfd.rejectWith(
                            o.context, [jqXHR, textStatus, errorThrown]
                        );
                    });
            };
            //this._enhancePromise(promise);
            promise.abort = function() {
                return jqXHR.abort();
            };
            upload();
            return promise;
        }

        initDataSettings(xoptions);

        xoptions._bitrateTimer = new BitrateTimer();

        var jqXhr = chunkedUpload(xoptions) || ajax(xoptions);

        jqXhr.options = xoptions;

        return jqXhr;
    }

    return upload;  
});
define('skylark-backbone-uploader/uploader',[
    "skylark-langx/langx",
    "skylark-domx-eventer",
    "skylark-domx-query",
    "skylark-domx-files/dropzone",
    "skylark-domx-files/pastezone",
    "skylark-domx-files/picker",
    "./upload"
],function (langx,eventer,$,dropzone,pastezone,picker,upload) {
    'use strict';

    var Deferred = langx.Deferred;


    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.

    var FileUploader = langx.Evented.inherit( {

        options: {
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),

            // The paste target element(s), by the default the complete document.
            // Set to null to disable paste support:
            pasteZone: $(document),

            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            picker: undefined,


            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,

            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,

            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,

            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
 
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
 
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
 
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
 
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
 
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
 
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
 
            // By default, uploads are started automatically when adding files:
            autoUpload: false,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    langx.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false && $(this).fileupload("instance").option('autoUpload') )) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require reinitializing event listeners and/or
        // special initialization code:
        _specialOptions: [
            'picker',
            'dropZone',
            'pasteZone',
            'multipart',
            'filesContainer',
            'uploadTemplateId',
            'downloadTemplateId'            
        ],

        _BitrateTimer: function () {
            this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _getTotal: function (files) {
            var total = 0;
            langx.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                langx.extend(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        },

        _initResponseObject: function (obj) {
            var prop;
            if (obj._response) {
                for (prop in obj._response) {
                    if (obj._response.hasOwnProperty(prop)) {
                        delete obj._response[prop];
                    }
                }
            } else {
                obj._response = {};
            }
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(
                    e.loaded / e.total * (data.chunkSize || data._progress.total)
                ) + (data.uploadedBytes || 0);
                // Add the difference from the previously loaded state
                // to the global loaded counter:
                this._progress.loaded += (loaded - data._progress.loaded);
                this._progress.bitrate = this._bitrateTimer.getBitrate(
                    now,
                    this._progress.loaded,
                    data.bitrateInterval
                );
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger(
                    'progress',
                    eventer.create('progress', {delegatedEvent: e}),
                    data
                );
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger(
                    'progressall',
                    eventer.create('progressall', {delegatedEvent: e}),
                    this._progress
                );
            }
        },

        _getParamName: function (options) {
            var picker = $(options.picker),
                paramName = options.paramName;
            //if (!paramName) {
            //    paramName = [fileInput.prop('name') || 'files[]'];
            // } else if (!langx.isArray(paramName)) {

            if (!langx.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },


        // jQuery 1.6 doesn't provide .state(),
        // while jQuery 1.8+ removed .isRejected() and .isResolved():
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = new Deferred(),
                promise = dfd.promise;
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Adds convenience methods to the data callback argument:
        _addConvenienceMethods: function (e, data) {
            var that = this,
                getPromise = function (args) {
                    return new Deferred().resolveWith(that, args).promise;
                };
            data.process = function (resolveFunc, rejectFunc) {
                if (resolveFunc || rejectFunc) {
                    data._processQueue = this._processQueue =
                        (this._processQueue || getPromise([this])).pipe(
                            function () {
                                if (data.errorThrown) {
                                    return new Deferred()
                                        .rejectWith(that, [data]).promise;
                                }
                                return getPromise(arguments);
                            }
                        ).pipe(resolveFunc, rejectFunc);
                }
                return this._processQueue || getPromise([this]);
            };
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR =
                        (that._trigger(
                            'submit',
                            eventer.create('submit', {delegatedEvent: e}),
                            this
                        ) !== false) && that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                this.errorThrown = 'abort';
                that._trigger('fail', null, this);
                return that._getXHRPromise(false);
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
                if (this._processQueue) {
                    return that._getDeferredState(this._processQueue);
                }
            };
            data.processing = function () {
                return !this.jqXHR && this._processQueue && that
                    ._getDeferredState(this._processQueue) === 'pending';
            };
            data.progress = function () {
                return this._progress;
            };
            data.response = function () {
                return this._response;
            };
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
                // Reset the global progress values:
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            // Make sure the container objects for the .response() and
            // .progress() methods on the data object are available
            // and reset to their initial state:
            this._initResponseObject(data);
            this._initProgressObject(data);
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            // Initialize the global progress values:
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            var total = options._progress.total,
                response = options._response;
            if (options._progress.loaded < total) {
                // Create a progress event if no final progress event
                // with loaded equaling total has been triggered:
                this._onProgress(eventer.create('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            response.result = options.result = result;
            response.textStatus = options.textStatus = textStatus;
            response.jqXHR = options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            var response = options._response;
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
            response.jqXHR = options.jqXHR = jqXHR;
            response.textStatus = options.textStatus = textStatus;
            response.errorThrown = options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
        },

        _trigger : function(type,event,data) {
            var e = eventer.proxy(event);
            e.type = type;
            e.data =data;
            return this.trigger(e,data);
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._trigger('always', null, options);
        },

        _onSend: function (e, data) {
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this,
                jqXHR,
                aborted,
                slot,
                pipe,
                send = function () {
                    that._sending += 1;
                    data.url = that.options.url;
                    data.dataType = that.options.dataType;
                    data.xhrFields = that.options.xhrFields;

                    jqXHR = upload(data);

                    jqXHR.progress(function(e){
                        //var oe = e.originalEvent;
                        // Make sure the progress event properties get copied over:
                        //e.lengthComputable = oe.lengthComputable;
                        //e.loaded = oe.loaded;
                        //e.total = oe.total;
                        that._onProgress(e, jqXHR.options);

                    }).done(function (result, textStatus) {
                        that._onDone(result, textStatus, jqXHR, jqXHR.options);
                    }).fail(function (e, textStatus) {
                        that._onFail(jqXHR, textStatus,e, jqXHR.options);
                    }).always(function () {
                        that._sending -= 1;
                        that._active -= 1;
                        that._trigger('stop');
                    });
                    return jqXHR;
                };
            this._beforeSend(e, data);

            return send();
        },
        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = langx.extend({}, this.options, data),
                files = data.files,
                filesLength = files.length,
                limit = options.limitMultiFileUploads,
                limitSize = options.limitMultiFileUploadSize,
                overhead = options.limitMultiFileUploadSizeOverhead,
                batchSize = 0,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i,
                j = 0;
            if (limitSize && (!filesLength || files[0].size === undefined)) {
                limitSize = undefined;
            }
            if (!(options.singleFileUploads || limit || limitSize)) {
                fileSet = [files];
                paramNameSet = [paramName];
            } else if (!(options.singleFileUploads || limitSize) && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i += limit) {
                    fileSet.push(files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else if (!options.singleFileUploads && limitSize) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i = i + 1) {
                    batchSize += files[i].size + overhead;
                    if (i + 1 === filesLength ||
                            ((batchSize + files[i + 1].size + overhead) > limitSize) ||
                            (limit && i + 1 - j >= limit)) {
                        fileSet.push(files.slice(j, i + 1));
                        paramNameSlice = paramName.slice(j, i + 1);
                        if (!paramNameSlice.length) {
                            paramNameSlice = paramName;
                        }
                        paramNameSet.push(paramNameSlice);
                        j = i + 1;
                        batchSize = 0;
                    }
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = files;
            langx.each(fileSet || files, function (index, element) {
                var newData = langx.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initResponseObject(newData);
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger(
                    'add',
                    eventer.create('add', {delegatedEvent: e}),
                    newData
                );
                return result;
            });
            return result;
        },

        _initEventHandlers: function () {
            var that = this;

            dropzone(this.options.dropZone[0],{
                dropped : function (files) {
                    var data = {};
                    data.files = files;
                    that._onAdd(null, data);
                }
            });

            pastezone(this.options.pasteZone[0],{
                pasted : function (files) {
                    var data = {};
                    data.files = files;
                    that._onAdd(null, data);
                }
            });

            picker(this.options.picker[0],{
                multiple: true,
                picked : function (files) {
                    var data = {};
                    data.files = files;
                    that._onAdd(null, data);
                }
            });
        },

        _destroyEventHandlers: function () {
            //this._off(this.options.dropZone, 'dragover drop');
            //this._off(this.options.pasteZone, 'paste');
            //this._off(this.options.picker, 'change');
        },

        _setOption: function (key, value) {
            var reinit = langx.inArray(key, this._specialOptions) !== -1;
            if (reinit) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (reinit) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            //if (options.fileInput === undefined) {
            //    //options.fileInput = this.element.is('input[type="file"]') ?
            //    //        this.element : this.element.find('input[type="file"]');
            //    options.fileInput = this.element.find('.fileinput-button');
            
            if (options.picker) {
                if (!(options.picker instanceof $)) {
                    options.picker = $(options.picker,this._elm);
                }                
            }

            if (options.dropZone) {
                if (!(options.dropZone instanceof $)) {
                    options.dropZone = $(options.dropZone,this._elm);
                }
            }

            if (options.pasteZone) {
                if (!(options.pasteZone instanceof $)) {
                    options.pasteZone = $(options.pasteZone,this._elm);
                }                
            }
        },

        _getRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _isRegExpOption: function (key, value) {
            return key !== 'url' && langx.type(value) === 'string' &&
                /^\/.*\/[igm]{0,3}$/.test(value);
        },

        _construct: function (elm,options) {
            this._elm = elm;
            this.options = langx.mixin({},this.options,options);
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },

        // This method is exposed to the widget API and allows to query
        // the number of active uploads:
        active: function () {
            return this._active;
        },

        // This method is exposed to the widget API and allows to query
        // the widget upload progress.
        // It returns an object with loaded, total and bitrate properties
        // for the running uploads:
        progress: function () {
            return this._progress;
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            data.files = langx.makeArray(data.files);
            this._onAdd(null, data);
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                data.files = langx.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });


    function uploader(elm,options) {
        var fuInst = new FileUploader(elm,options);
        fuInst.on("all",function(evt,data){
            var typ = evt.type;
            if (langx.isFunction(options[typ])) {
                options[typ].call(fuInst._elm,evt,data);
            }
        });
        return fuInst;
    }

    return uploader;

});


define('skylark-backbone-uploader/upload-manager',[
    "skylark-backbone",
    "./uploader",
    "./defered-view-loader"
],function(Backbone,uploader) {
/**
 * Backbone Upload Manager v1.0.0
 *
 * Copyright (c) 2013 Samuel ROZE
 *
 * License and more information at:
 * http://github.com/sroze/backbone-upload-manager
 */

    Backbone.UploadManager = Backbone.DeferedView.extend({
        /**
         * Default options, that will be merged with the passed.
         *
         */
        defaults: {
            templates: {
                main: '/templates/upload-manager.main.default',
                file: '/templates/upload-manager.file.default'
            },
            uploadUrl: '/upload',
            autoUpload: false,
            fileUploadId: 'fileupload',
            startUploadsId: 'start-uploads-button',
            cancelUploadsId: 'cancel-uploads-button',
            dataType: 'json'
        },

        /**
         * An integer used to track the files by a unique
         * identifier.
         *
         */
        file_id: 0,

        /**
         * View container class.
         *
         */
        className: 'upload-manager',

        /**
         * Initialize upload manager options
         *
         */
        initialize: function (options)
        {
            // Merge options
            this.options = $.extend(this.defaults, options);

            // Update template name
            this.templateName = this.options.templates.main;

            // Create the file list
            this.files = new Backbone.UploadManager.FileCollection();

            // Create the file-upload wrapper
            /*
            this.uploadProcess = $('<input id="' + this.options.fileUploadId + '" type="file" name="files[]" multiple="multiple">').fileupload({
                dataType: this.options.dataType,
                url: this.options.uploadUrl,
                formData: this.options.formData,
                autoUpload: this.options.autoUpload,
                singleFileUploads: true
            });

            // Add upload process events handlers
            this.bindProcessEvents();
            */

            // Add local events handlers
            this.bindLocal();
        },

        /**
         * Bind local events.
         *
         */
        bindLocal: function ()
        {
            var self = this;
            this.on('fileadd', function (file) {
                // Add it to current list
                self.files.add(file);

                // Create the view
                self.renderFile(file);
            }).on('fileprogress', function (file, progress) {
                file.progress(progress);
            }).on('filefail', function (file, error) {
                file.fail(error);
            }).on('filedone', function (file, data) {
                file.done(data.result);
            });

            // When collection changes
            this.files.on('all', this.update, this);
        },

        /**
         * Render a file.
         *
         */
        renderFile: function (file)
        {
            var file_view = new Backbone.UploadManager.FileView($.extend(this.options, {model: file}));
            $('#file-list', self.el).append(file_view.deferedRender().el);
        },

        /**
         * Update the view without full rendering.
         *
         */
        update: function ()
        {
            var with_files_elements = $('#' + this.options.cancelUploadsId + ', #' + this.options.startUploadsId, this.el);
            var without_files_elements = $('#file-list .no-data', this.el);
            if (this.files.length > 0) {
                with_files_elements.removeClass('hidden');
                without_files_elements.addClass('hidden');
            } else {
                with_files_elements.addClass('hidden');
                without_files_elements.removeClass('hidden');
            }
        },

        /**
         * Bind events on the upload processor.
         *
         */
        bindProcessEvents: function ()
        {
        },

        /**
         * Render the main part of upload manager.
         *
         */
        render: function () {
            var self = this;
            $(this.el).html(this.template());

            // Update view
            this.update();

            // Add add files handler
            var input = $('.fileinput-button', this.el), self = this;

            this.uploadProcess =  uploader(this.el,{  //$.$(this.el).fileupload({
                dataType: this.options.dataType,
                url: this.options.uploadUrl,
                formData: this.options.formData,
                autoUpload: this.options.autoUpload,
                singleFileUploads: true,
                picker : input,

                'add' : function (e, data) {
                    // Create an array in which the file objects
                    // will be stored.
                    data.uploadManagerFiles = [];

                    // A file is added, process for each file.
                    // Note: every times, the data.files array length is 1 because
                    //       of "singleFileUploads" option.
                    $.each(data.files, function (index, file_data) {
                        // Create the file object
                        file_data.id = self.file_id++;
                        var file = new Backbone.UploadManager.File({
                            data: file_data,
                            processor: data
                        });

                        // Add file in data
                        data.uploadManagerFiles.push(file);

                        // Trigger event
                        self.trigger('fileadd', file);
                    });
                },

                'progress' : function (e, data) {
                    $.each(data.uploadManagerFiles, function (index, file) {
                        self.trigger('fileprogress', file, data);
                    });
                },

                'fail' : function (e, data) {
                    $.each(data.uploadManagerFiles, function (index, file) {
                        var error = "Unknown error";
                        if (typeof data.errorThrown == "string") {
                            error = data.errorThrown;
                        } else if (typeof data.errorThrown == "object") {
                            error = data.errorThrown.message;
                        } else if (data.result) {
                            if (data.result.error) {
                                error = data.result.error;
                            } else if (data.result.files && data.result.files[index] && data.result.files[index].error) {
                                error = data.result.files[index].error;
                            } else {
                                error = "Unknown remote error";
                            }
                        }

                        self.trigger('filefail', file, error);
                    });
                },

                'done' : function (e, data) {
                    $.each(data.uploadManagerFiles, function (index, file) {
                        self.trigger('filedone', file, data);
                    });
                }

            });

            // Add upload process events handlers
            this.bindProcessEvents();

            /*
            input.on('change', function (){
                self.uploadProcess.fileupload('add', {
                    fileInput: $(this)
                });
            });
            */

            // Add cancel all handler
            $('#' + this.options.cancelUploadsId, this.el).click(function(){
                while (self.files.length) {
                    self.files.at(0).cancel();
                }
            });

            // Add start uploads handler
            $('#' + this.options.startUploadsId, this.el).click(function(){
                self.files.each(function(file){
                    file.start();
                });
            });

            // Render current files
            $.each(this.files, function (i, file) {
                self.renderFile(file);
            });
        }
    }, {
        /**
         * This model represents a file.
         *
         */
        File: Backbone.Model.extend({
            state: "pending",

            /**
             * Start upload.
             *
             */
            start: function ()
            {
                if (this.isPending()) {
                    this.get('processor').submit();
                    this.state = "running";

                    // Dispatch event
                    this.trigger('filestarted', this);
                }
            },

            /**
             * Cancel a file upload.
             *
             */
            cancel: function ()
            {
                this.get('processor').abort();
                this.destroy();

                // Dispatch event
                this.state = "canceled";
                this.trigger('filecanceled', this);
            },

            /**
             * Notify file that progress updated.
             *
             */
            progress: function (data)
            {
                // Dispatch event
                this.trigger('fileprogress', this.get('processor').progress());
            },

            /**
             * Notify file that upload failed.
             *
             */
            fail: function (error)
            {
                // Dispatch event
                this.state = "error";
                this.trigger('filefailed', error);
            },

            /**
             * Notify file that upload is done.
             *
             */
            done: function (result)
            {
                // Dispatch event
                this.state = "error";
                this.trigger('filedone', result);
            },

            /**
             * Is this file pending to be uploaded ?
             *
             */
            isPending: function ()
            {
                return this.getState() == "pending";
            },

            /**
             * Is this file currently uploading ?
             *
             */
            isRunning: function ()
            {
                return this.getState() == "running";
            },

            /**
             * Is this file uploaded ?
             *
             */
            isDone: function ()
            {
                return this.getState() == "done";
            },

            /**
             * Is this upload in error ?
             *
             */
            isError: function ()
            {
                return this.getState() == "error" || this.getState == "canceled";
            },

            /**
             * Get the file state.
             *
             */
            getState: function ()
            {
                return this.state;
            }
        }),

        /**
         * This is a file collection, used to manage the selected
         * and processing files.
         *
         */
        FileCollection: Backbone.Collection.extend({
            model: this.File
        }),

        /**
         * A file view, which is the view that manage a single file
         * process in the upload manager.
         *
         */
        FileView: Backbone.DeferedView.extend({
            className: 'upload-manager-file row',

            initialize: function (options) {
                this.templateName = options.templates.file;
                this.processUploadMsg = options.processUploadMsg;
                this.doneMsg = options.doneMsg;

                // Bind model events
                this.model.on('destroy', this.close, this);
                this.model.on('fileprogress', this.updateProgress, this);
                this.model.on('filefailed', this.hasFailed, this);
                this.model.on('filedone', this.hasDone, this);

                // In each case, update view
                this.model.on('all', this.update, this);
            },

            /**
             * Render the file item view.
             *
             */
            render: function ()
            {
                $(this.el).html(this.template(this.computeData()));

                // Bind events
                this.bindEvents();

                // Update elements
                this.update();
            },

            /**
             * Update upload progress.
             *
             */
            updateProgress: function (progress)
            {
                var percent = parseInt(progress.loaded / progress.total * 100, 10);
                var progressHTML = this.getHelpers().displaySize(progress.loaded)+' of '+this.getHelpers().displaySize(progress.total);
                if (percent >= 100 && this.processUploadMsg) { progressHTML = this.processUploadMsg; }

                $('.progress', this.el)
                    .find('.bar')
                    .css('width', percent+'%')
                    .parent()
                    .find('.progress-label')
                    .html(progressHTML);
            },

            /**
             * File upload has failed.
             *
             */
            hasFailed: function (error)
            {
                $('.message', this.el).html('<i class="icon-error"></i> '+error);
            },

            /**
             * File upload is done.
             *
             */
            hasDone: function (result)
            {
                $('.message', this.el).html('<i class="icon-success"></i> ' + (this.doneMsg || 'Uploaded'));
            },

            /**
             * Update view without complete rendering.
             *
             */
            update: function ()
            {
                var when_pending = $('.size, #btn-cancel', this.el),
                    when_running = $('.progress, #btn-cancel', this.el),
                    when_done = $('.message, #btn-clear', this.el);

                if (this.model.isPending()) {
                    when_running.add(when_done).addClass('hidden');
                    when_pending.removeClass('hidden');
                } else if (this.model.isRunning()) {
                    when_pending.add(when_done).addClass('hidden');
                    when_running.removeClass('hidden');
                } else if (this.model.isDone() || this.model.isError()) {
                    when_pending.add(when_running).addClass('hidden');
                    when_done.removeClass('hidden');
                }
            },

            /**
             * Bind local elements events.
             *
             */
            bindEvents: function ()
            {
                var self = this;

                // DOM events
                $('#btn-cancel', this.el).click(function(){
                    self.model.cancel();
                    self.collection.remove(self.model);
                });
                $('#btn-clear', this.el).click(function(){
                    self.model.destroy();
                    self.collection.remove(self.model);
                });
            },

            /**
             * Compute data to be passed to the view.
             *
             */
            computeData: function ()
            {
                return $.extend(this.getHelpers(), this.model.get('data'));
            }
        })
    });
});

define('skylark-backbone-uploader/main',[
	"skylark-backbone",
	"./defered-view-loader",
	"./upload-manager"
],function(Backbone){
	return Backbone
});
define('skylark-backbone-uploader', ['skylark-backbone-uploader/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-backbone-uploader.js.map

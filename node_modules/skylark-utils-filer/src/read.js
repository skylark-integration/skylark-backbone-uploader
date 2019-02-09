define([
    "skylark-langx/Deferred",
    "./filer"
],function(Deferred, filer){

    function readFile(file, params) {
        params = params || {};
        var d = new Deferred,
            reader = new FileReader();

        reader.onload = function(evt) {
            d.resolve(evt.target.result);
        };
        reader.onerror = function(e) {
            var code = e.target.error.code;
            if (code === 2) {
                alert('please don\'t open this page using protocol fill:///');
            } else {
                alert('error code: ' + code);
            }
        };

        if (params.asArrayBuffer) {
            reader.readAsArrayBuffer(file);
        } else if (params.asDataUrl) {
            reader.readAsDataURL(file);
        } else if (params.asText) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }

        return d.promise;
    }

    return filer.read = filer.readFile = readFile;
    
});

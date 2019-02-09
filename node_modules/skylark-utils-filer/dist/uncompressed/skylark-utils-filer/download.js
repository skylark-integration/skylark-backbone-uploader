define([
    "./filer"
],function(filer){

    function downloadFile(data, name) {
        if (window.navigator.msSaveBlob) {
            if (types.isString(data)) {
                data = dataURItoBlob(data);
            }
            window.navigator.msSaveBlob(data, name);
        } else {
            var a = document.createElement('a');
            if (data instanceof Blob) {
                data = URL.createObjectURL(data);
            }
            a.href = data;
            a.setAttribute('download', name || 'noname');
            a.dispatchEvent(new CustomEvent('click'));
        }
    }

    return filer.downlad = downloadFile;

});

define([
    "skylark-langx/objects",
    "skylark-utils-dom/eventer",
    "./filer"
],function(objects, eventer, filer){
    function pastezone(elm, params) {
        params = params || {};
        var hoverClass = params.hoverClass || "pastezone",
            pastedCallback = params.pasted;

        eventer.on(elm, "paste", function(e) {
            var items = e.originalEvent && e.originalEvent.clipboardData &&
                e.originalEvent.clipboardData.items,
                files = [];
            if (items && items.length) {
                objects.each(items, function(index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                });
            }
            if (pastedCallback && files.length) {
                pastedCallback(files);
            }
        });

        return this;
    }

    return filer.pastezone = pastezone;

});

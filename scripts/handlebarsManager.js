// Description: compiles and stores handlebars templates for multiple uses
// Usage: hbMan.getTemplate("name of template script node")(dataObject)   // returns rendered html
(function (exports) {
    var templates = []; // stores template objects

    exports.getTemplate = function (name, noEscape) {
        var tmp = templates.filter(function (t) { return t.name == name });
        if (tmp.length == 1)
            return tmp[0].template;
        else {
            if (typeof (noEscape) == "undefined")
                noEscape = false;
            var src = document.getElementById(name).innerHTML;
            tmp = { name: name };
            tmp.template = Handlebars.compile(src, { noEscape: noEscape });
            templates.push(tmp);
            return tmp.template;
        }
    };


    //    exports.debug = function () {
    //        return templates;
    //    };
})(this.hbMan = {});
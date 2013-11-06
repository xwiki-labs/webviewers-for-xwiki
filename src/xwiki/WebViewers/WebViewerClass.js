var XWiki = require('xwiki-tools');
module.exports = function(doc) {
    doc.setTitle("WebViewer Class");
    doc.setContent("{{info}}This class is used for representing WebViewer documents.{{/info}}");
    doc.setClass(new XWiki.model.BaseObj(doc.getWeb() + '.' + doc.getName()).instance().json['class']);
};

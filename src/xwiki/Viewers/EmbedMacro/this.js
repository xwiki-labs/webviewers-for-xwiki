XWikiDoc(function (doc, XWiki) {
    var WikiMacroParameterClass = XWiki.model.classes.WikiMacroParameterClass;
    doc.setTitle("WebViewer Embed Macro");

    doc.addXObject(WikiMacroParameterClass.create().setName("tar").setMandatory(true));
    doc.addXObject(WikiMacroParameterClass.create().setName("as").setMandatory(false));
    doc.addXObject(WikiMacroParameterClass.create().setName("height").setMandatory(false));
    doc.addXObject(WikiMacroParameterClass.create().setName("width").setMandatory(false));
    doc.addXObject(WikiMacroParameterClass.create().setName("params").setMandatory(false));
});

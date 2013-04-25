import java.util.zip.ZipInputStream;
import java.io.StringWriter;
import org.apache.commons.io.IOUtils;
import groovy.json.JsonSlurper;

String getPkg(doc, attach, ctx) {
    def zis = new ZipInputStream(
        doc.getAttachment(attach).getAttachment().getContentInputStream(ctx.getContext()));
    def entry;
    while ((entry = zis.getNextEntry()) != null) {
        def entryName = entry.getName();
        if (!"package.json".equals(entryName)) { continue; }
        def writer = new StringWriter();
        IOUtils.copy(zis, writer, "UTF-8");
        return writer.toString();
    }
    return null;
}

String doZip(xcontext, doc, fileName, mime, action) {
    def j = new JsonSlurper().parseText(getPkg(doc, fileName, xcontext));
    def mt = j.get('resilience').get('mimeTypes');
    def out = "";
    for (Object k : mt.keySet()) {
        if (mime.equals(k) && mt.get(k).contains(action)) { return true; }
    }
    return false;
}

public String run(Object xcontext, Object doc, String mimeType, String action) {
    out = '';
    for (Object o : doc.getAttachmentList()) {
        if (!o.getFilename().endsWith('.zip')) { continue; }
        //try {
            if (doZip(xcontext, doc, o.getFilename(), mimeType, action)) {
                return doc.getAttachmentURL(o.getFilename()) + "/index.html";
            }
        //} catch (e) { out += e; }
    }
    return out;
}

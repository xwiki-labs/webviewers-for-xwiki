/* -*- Mode: java; tab-width: 4; indent-tabs-mode: nil; -*- */
import java.util.zip.ZipInputStream;
import java.util.HashMap;
import java.io.StringWriter;
import org.apache.commons.io.IOUtils;
import groovy.json.JsonSlurper;
import java.util.Collections;
import java.net.URLDecoder;
import java.util.List;
import java.util.ArrayList;

import org.xwiki.observation.ObservationManager;
import org.xwiki.observation.EventListener;
import org.xwiki.bridge.event.DocumentUpdatedEvent;
import org.xwiki.bridge.event.DocumentCreatedEvent;
import org.xwiki.bridge.event.DocumentDeletedEvent;
import org.xwiki.observation.event.Event;
import com.xpn.xwiki.api.XWiki;
import com.xpn.xwiki.web.Utils;
import com.xpn.xwiki.api.Context;
import com.xpn.xwiki.doc.XWikiDocument;
import com.xpn.xwiki.objects.BaseObject;

class AttachEventListener implements EventListener
{
    // don't do this.
    static AttachEventListener INSTANCE = new AttachEventListener();

    Map actionMappings;

    boolean firstRun;

    String getName() {
        return "WebViewerListener";
    }

    List<Event> getEvents() {
        return (new ArrayList<Event>() {{
            add(new DocumentUpdatedEvent());
            add(new DocumentCreatedEvent());
            add(new DocumentDeletedEvent());
        }});
    }

    void onEvent(Event event, Object source, Object data) {
        XWikiDocument doc = (XWikiDocument) source;
        if (doc.getObject("Viewers.ViewersClass") != null) {
            this.check(new Context(data), true);
        }
    }

    private String getPkg(doc, attach, ctx) {
        def zis = new ZipInputStream(
            doc.getAttachment(attach).getAttachment().getContentInputStream(ctx.getContext()));
        def entry;
        while ((entry = zis.getNextEntry()) != null) {
            def entryName = entry.getName();
            if (!"webviewer.json".equals(entryName)) { continue; }
            def writer = new StringWriter();
            IOUtils.copy(zis, writer, "UTF-8");
            return writer.toString();
        }
        return null;
    }

    private Map doZip(xcontext, doc, fileName, out) {
        def j = new JsonSlurper().parseText(getPkg(doc, fileName, xcontext));
        def actions = j.get("actions");
        def main = j.get("main");
        if (!main) { main = "index.html"; }
        for (Object action : actions.keySet()) {
            for (Object fileType : actions.get(action)) {
                def hm = out.get(fileType);
                if (!hm) {
                    hm = new HashMap();
                    out.put(fileType, hm);
                }
                hm.put(action, URLDecoder.decode(doc.getAttachmentURL(fileName), "UTF-8") + "/" + main);
            }
        }
        return out;
    }

    Map check(xcontext, force) {
        if (this.actionMappings != null) {
            if (!force) { return this.actionMappings; }
        }
        def xc = xcontext.getContext();
        def xwiki = new XWiki(xc.getWiki(), xc);
        def names = xwiki.searchDocuments(", BaseObject as obj where "
                                        + "obj.className = 'Viewers.ViewersClass' "
                                        + "and obj.name = doc.fullName");
        def am = new HashMap();
        // workaround for http://jira.xwiki.org/browse/XWIKI-9718
        boolean noPersist = false;
        for (Object name : names) {
            def doc = xwiki.getDocument(name);
            for (Object o : doc.getAttachmentList()) {
                if (!o.getFilename().endsWith(".zip")) { continue; }
                try {
                    doZip(xcontext, doc, o.getFilename(), am);
                } catch (e) { }
            }
            if (doc.getAttachmentList().size() == 0) {
                noPersist = true;
            }
        }
        if (!noPersist) {
            this.actionMappings = Collections.unmodifiableMap(am);
        } else {
            this.actionMappings = null;
        }

        if (this.firstRun) {
            this.firstRun = false;
            Utils.getComponent(ObservationManager.class).removeListener(getName());
            Utils.getComponent(ObservationManager.class).addListener(AttachEventListener.INSTANCE);
        }

        return Collections.unmodifiableMap(am);
    }
}

public Map run(xcontext) {
    return AttachEventListener.INSTANCE.check(xcontext, false);
}

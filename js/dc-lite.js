/* dc-lite: rendert ein <template> mit {{holes}}, <sc-if> und <sc-for> über Preact.
   Kleine, eigene Laufzeit für die statische Version von allesodernetz.de. */
(function () {
  var h = preact.h;
  var HOLE_ALL = /^\s*\{\{([^}]+)\}\}\s*$/;
  var HOLE = /\{\{([^}]+)\}\}/g;

  function look(p, sc) {
    p = p.trim();
    if (p === 'true') return true;
    if (p === 'false') return false;
    if (p === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(p)) return +p;
    var parts = p.split('.');
    var v = sc[parts[0]];
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function val(str, sc) {
    var m = str.match(HOLE_ALL);
    if (m) return look(m[1], sc);
    return str.replace(HOLE, function (_, p) { var v = look(p, sc); return v == null ? '' : String(v); });
  }

  function compile(node) {
    if (node.nodeType === 3) return { t: 'text', v: node.nodeValue, dyn: node.nodeValue.indexOf('{{') >= 0 };
    if (node.nodeType !== 1) return null;
    var tag = node.tagName.toLowerCase() === node.tagName.toLowerCase() && node.namespaceURI === 'http://www.w3.org/1999/xhtml' ? node.tagName.toLowerCase() : node.tagName;
    var kids = [];
    for (var c = node.firstChild; c; c = c.nextSibling) { var k = compile(c); if (k) kids.push(k); }
    if (tag === 'sc-if') return { t: 'if', v: node.getAttribute('value') || '', kids: kids };
    if (tag === 'sc-for') return { t: 'for', list: node.getAttribute('list') || '', as: node.getAttribute('as') || 'item', kids: kids };
    var attrs = [];
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name.indexOf('hint-') === 0) continue;
      attrs.push([a.name, a.value]);
    }
    return { t: 'el', tag: tag, attrs: attrs, kids: kids };
  }

  function renderList(nodes, sc) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = renderNode(nodes[i], sc);
      if (Array.isArray(r)) out.push.apply(out, r); else if (r != null) out.push(r);
    }
    return out;
  }
  function renderNode(n, sc) {
    if (n.t === 'text') return n.dyn ? (function (v) { return v == null ? '' : String(v); })(val(n.v, sc)) : n.v;
    if (n.t === 'if') return val(n.v, sc) ? renderList(n.kids, sc) : null;
    if (n.t === 'for') {
      var list = val(n.list, sc) || [];
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var s2 = Object.create(sc); s2[n.as] = list[i]; s2.$index = i;
        out.push.apply(out, renderList(n.kids, s2));
      }
      return out;
    }
    var props = {};
    for (var j = 0; j < n.attrs.length; j++) {
      var name = n.attrs[j][0], raw = n.attrs[j][1];
      var v = raw.indexOf('{{') >= 0 ? val(raw, sc) : raw;
      if (name === 'ref') { if (typeof v === 'function') props.ref = v; continue; }
      if (name.indexOf('on') === 0 && name.length > 2) { if (typeof v === 'function') props[name] = v; continue; }
      if (v === false || v == null) continue;
      props[name] = v;
    }
    return h.apply(null, [n.tag, props].concat(renderList(n.kids, sc)));
  }

  var tplNodes = null;
  window.DCLogic = class extends preact.Component {
    render() { return h(preact.Fragment, null, renderList(tplNodes, this.renderVals())); }
  };
  window.dcMount = function (Component, tplEl, target) {
    tplNodes = [];
    for (var c = tplEl.content.firstChild; c; c = c.nextSibling) { var k = compile(c); if (k) tplNodes.push(k); }
    preact.render(h(Component, {}), target);
  };
})();

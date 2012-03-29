/* Copyright © 2011 by Neil Jenkins. Licensed under the MIT license. */(function(a){"use strict";var b=!a.createTreeWalker;window.ie===9&&(b=!0),b||function(){var c=a.createElement("div"),d=a.createTextNode("");c.appendChild(d);var e=c.cloneNode(!0),f=c.cloneNode(!0),g=c.cloneNode(!0),h=a.createTreeWalker(c,1,function(a){return 1},!1);c.appendChild(e),c.appendChild(f),c.appendChild(g),h.currentNode=g,h.previousNode()!==f&&(b=!0)}();if(!b)return;var c={1:1,2:2,3:4,8:128,9:256,11:1024},d=1,e=function(a,b,c){this.root=this.currentNode=a,this.nodeType=b,this.filter=c};e.prototype.nextNode=function(){var a=this.currentNode,b=this.root,e=this.nodeType,f=this.filter,g;for(;;){g=a.firstChild;while(!g&&a){if(a===b)break;g=a.nextSibling,g||(a=a.parentNode)}if(!g)return null;if(c[g.nodeType]&e&&f(g)===d)return this.currentNode=g,g;a=g}},e.prototype.previousNode=function(){var a=this.currentNode,b=this.root,e=this.nodeType,f=this.filter,g;for(;;){if(a===b)return null;g=a.previousSibling;if(g)while(a=g.lastChild)g=a;else g=a.parentNode;if(!g)return null;if(c[g.nodeType]&e&&f(g)===d)return this.currentNode=g,g;a=g}},a.createTreeWalker=function(a,b,c){return new e(a,b,c)}})(document),function(){"use strict";var a=function(a,b){var c=a.length,d,e;while(c--){d=a[c].prototype;for(e in b)d[e]=b[e]}},b=function(a,b){var c=a.length;while(c--)if(!b(a[c]))return!1;return!0},c=function(){return!1},d=function(){return!0},e=/^(?:A(?:BBR|CRONYM)?|B(?:R|D[IO])?|C(?:ITE|ODE)|D(?:FN|EL)|EM|HR|I(?:NPUT|MG|NS)?|KBD|Q|R(?:P|T|UBY)|S(?:U[BP]|PAN|TRONG|AMP)|U)$/,f={BR:1,IMG:1,INPUT:1},g=function(a,b){var c=b.parentNode;return c&&c.replaceChild(a,b),a},h=1,i=3,j=1,k=1,l=3,m=function(a){return a.isBlock()?k:l},n=!!window.opera||!!window.ie;a(window.Node?[Node]:[Text,Element,HTMLDocument],{isInline:c,isBlock:c,isContainer:c,getPath:function(){var a=this.parentNode;return a?a.getPath():""},detach:function(){var a=this.parentNode;return a&&a.removeChild(this),this},replaceWith:function(a){return g(a,this),this},replaces:function(a){return g(this,a),this},nearest:function(a,b){var c=this.parentNode;return c?c.nearest(a,b):null},getPreviousBlock:function(){var a=this.ownerDocument,b=a.createTreeWalker(a.body,j,m,!1);return b.currentNode=this,b.previousNode()},getNextBlock:function(){var a=this.ownerDocument,b=a.createTreeWalker(a.body,j,m,!1);return b.currentNode=this,b.nextNode()},split:function(a,b){return a},mergeContainers:function(){}}),a([Text],{isLeaf:d,isInline:d,getLength:function(){return this.length},isLike:function(a){return a.nodeType===i},split:function(a,b){var c=this;return c===b?a:c.parentNode.split(c.splitText(a),b)}}),a([Element],{isLeaf:function(){return!!f[this.nodeName]},isInline:function(){return e.test(this.nodeName)},isBlock:function(){return!this.isInline()&&b(this.childNodes,function(a){return a.isInline()})},isContainer:function(){return!this.isInline()&&!this.isBlock()},getLength:function(){return this.childNodes.length},getPath:function(){var a=this.nodeName;if(a==="BODY")return a;var b=this.parentNode.getPath(),c=this.id,d=this.className.trim();return b+=">"+a,c&&(b+="#"+c),d&&(d=d.split(/\s\s*/),d.sort(),b+=".",b+=d.join(".")),b},wraps:function(a){return g(this,a).appendChild(a),this},empty:function(){var a=this.ownerDocument.createDocumentFragment(),b=this.childNodes.length;while(b--)a.appendChild(this.firstChild);return a},is:function(a,b){if(this.nodeName!==a)return!1;var c;for(c in b)if(this.getAttribute(c)!==b[c])return!1;return!0},nearest:function(a,b){var c=this;do if(c.is(a,b))return c;while((c=c.parentNode)&&c.nodeType===h);return null},isLike:function(a){return a.nodeType===h&&a.nodeName===this.nodeName&&a.className===this.className&&a.style.cssText===this.style.cssText},mergeInlines:function(a){var b=this.childNodes,c=b.length,d=[],e,g,j;while(c--){e=b[c],g=c&&b[c-1];if(c&&e.isInline()&&e.isLike(g)&&!f[e.nodeName])a.startContainer===e&&(a.startContainer=g,a.startOffset+=g.getLength()),a.endContainer===e&&(a.endContainer=g,a.endOffset+=g.getLength()),a.startContainer===this&&(a.startOffset>c?a.startOffset-=1:a.startOffset===c&&(a.startContainer=g,a.startOffset=g.getLength())),a.endContainer===this&&(a.endOffset>c?a.endOffset-=1:a.endOffset===c&&(a.endContainer=g,a.endOffset=g.getLength())),e.detach(),e.nodeType===i?g.appendData(e.data):d.push(e.empty());else if(e.nodeType===h){j=d.length;while(j--)e.appendChild(d.pop());e.mergeInlines(a)}}},mergeWithBlock:function(a,b){var c=this,d=a,e,f,g;while(d.parentNode.childNodes.length===1)d=d.parentNode;d.detach(),f=c.childNodes.length,e=c.lastChild,e&&e.nodeName==="BR"&&(c.removeChild(e),f-=1),g={startContainer:c,startOffset:f,endContainer:c,endOffset:f},c.appendChild(a.empty()),c.mergeInlines(g),b.setStart(g.startContainer,g.startOffset),b.collapse(!0),window.opera&&(e=c.lastChild)&&e.nodeName==="BR"&&c.removeChild(e)},mergeContainers:function(){var a=this.previousSibling,b=this.firstChild;a&&a.isLike(this)&&a.isContainer()&&(a.appendChild(this.detach().empty()),b&&b.mergeContainers())},split:function(a,b){var c=this;typeof a=="number"&&(a=a<c.childNodes.length?c.childNodes[a]:null);if(c===b)return a;var d=c.parentNode,e=c.cloneNode(!1),f;while(a)f=a.nextSibling,e.appendChild(a),a=f;return c.fixCursor(),e.fixCursor(),(f=c.nextSibling)?d.insertBefore(e,f):d.appendChild(e),d.split(e,b)},fixCursor:function(){var a=this,b=a.ownerDocument,c,d;a.nodeName==="BODY"&&(!(d=a.firstChild)||d.nodeName==="BR")&&(c=b.createElement("DIV"),d?a.replaceChild(c,d):a.appendChild(c),a=c,c=null);if(a.isInline())a.firstChild||(c=b.createTextNode(""));else if(n){while(!a.isLeaf()){d=a.firstChild;if(!d){c=b.createTextNode("");break}a=d}a.isLeaf()&&(a.nodeType!==i?a.parentNode.insertBefore(b.createTextNode(""),a):/^ +$/.test(a.data)&&(a.data=""))}else if(!a.querySelector("BR")){c=b.createElement("BR");while((d=a.lastElementChild)&&!d.isInline())a=d}return c&&a.appendChild(c),this}});if(function(){var a=document.createElement("div"),b=document.createTextNode("12");return a.appendChild(b),b.splitText(2),a.childNodes.length!==2}())Text.prototype.splitText=function(a){var b=this.ownerDocument.createTextNode(this.data.slice(a)),c=this.nextSibling,d=this.parentNode,e=this.length-a;return c?d.insertBefore(b,c):d.appendChild(b),e&&this.deleteData(a,e),b}}(),function(){"use strict";var a=function(a,b){var c;for(c in b)a[c]=b[c]},b=Array.prototype.indexOf,c=1,d=3,e=4,f=1,g=0,h=1,i=2,j=3,k=function(a,b){var d=a.childNodes;while(b&&a.nodeType===c)a=d[b-1],d=a.childNodes,b=d.length;return a},l=function(a,b){if(a.nodeType===c){var d=a.childNodes;if(b<d.length)a=d[b];else{while(a&&!a.nextSibling)a=a.parentNode;a&&(a=a.nextSibling)}}return a};a(Range.prototype,{forEachTextNode:function(a){var b=this.cloneRange();b.moveBoundariesDownTree();var c=b.startContainer,d=b.endContainer,g=b.commonAncestorContainer,h=g.ownerDocument.createTreeWalker(g,e,function(a){return f},!1),i=h.currentNode=c;while(!a(i,b)&&i!==d&&(i=h.nextNode()));},getTextContent:function(){var a="";return this.forEachTextNode(function(b,c){var d=b.data;d&&/\S/.test(d)&&(b===c.endContainer&&(d=d.slice(0,c.endOffset)),b===c.startContainer&&(d=d.slice(c.startOffset)),a+=d)}),a},_insertNode:function(a){var c=this.startContainer,e=this.startOffset,f=this.endContainer,g=this.endOffset,h,i,j,k;return c.nodeType===d?(h=c.parentNode,i=h.childNodes,e===c.length?e=b.call(i,c)+1:(e&&(k=c.splitText(e),f===c?(g-=e,f=k):f===h&&(g+=1),c=k),e=b.call(i,c)),c=h):i=c.childNodes,j=i.length,e===j?c.appendChild(a):c.insertBefore(a,i[e]),c===f&&(g+=i.length-j),this.setStart(c,e),this.setEnd(f,g),this},_extractContents:function(a){var c=this.startContainer,e=this.startOffset,f=this.endContainer,g=this.endOffset;a||(a=this.commonAncestorContainer),a.nodeType===d&&(a=a.parentNode);var h=f.split(g,a),i=c.split(e,a),j=a.ownerDocument.createDocumentFragment(),k;while(i!==h)k=i.nextSibling,j.appendChild(i),i=k;return this.setStart(a,h?b.call(a.childNodes,h):a.childNodes.length),this.collapse(!0),a.fixCursor(),j},_deleteContents:function(){this.moveBoundariesUpTree(),this._extractContents();var a=this.getStartBlock(),b=this.getEndBlock();a&&b&&a!==b&&a.mergeWithBlock(b,this),a&&a.fixCursor();var c=this.endContainer.ownerDocument.body,e=c.firstChild;if(!e||e.nodeName==="BR")c.fixCursor(),this.selectNodeContents(c.firstChild);var f=this.collapsed;return this.moveBoundariesDownTree(),f&&this.collapse(this.startContainer.nodeType===d),this},insertTreeFragment:function(a){var b=!0,d=a.childNodes,e=d.length;while(e--)if(!d[e].isInline()){b=!1;break}this.collapsed||this._deleteContents(),this.moveBoundariesDownTree();if(b)this._insertNode(a),this.collapse(!1);else{var f=this.startContainer.split(this.startOffset,this.startContainer.ownerDocument.body),g=f.previousSibling,h=g,i=h.childNodes.length,j=f,k=0,l=f.parentNode,m,n;while((m=h.lastChild)&&m.nodeType===c&&m.nodeName!=="BR")h=m,i=h.childNodes.length;while((m=j.firstChild)&&m.nodeType===c&&m.nodeName!=="BR")j=m;while((m=a.firstChild)&&m.isInline())h.appendChild(m);while((m=a.lastChild)&&m.isInline())j.insertBefore(m,j.firstChild),k+=1;n=a;while(n=n.getNextBlock())n.fixCursor();l.insertBefore(a,f),f.mergeContainers(),g.nextSibling.mergeContainers(),f===j&&!j.textContent&&(j=j.previousSibling,k=j.getLength(),l.removeChild(f)),g===h&&!h.textContent&&(h=h.nextSibling,i=0,l.removeChild(g)),this.setStart(h,i),this.setEnd(j,k),this.moveBoundariesDownTree()}},containsNode:function(a,b){var c=this,d=a.ownerDocument.createRange();d.selectNode(a);if(b){var e=c.compareBoundaryPoints(j,d)>-1,f=c.compareBoundaryPoints(h,d)<1;return!e&&!f}var k=c.compareBoundaryPoints(g,d)<1,l=c.compareBoundaryPoints(i,d)>-1;return k&&l},moveBoundariesDownTree:function(){var a=this.startContainer,b=this.startOffset,c=this.endContainer,e=this.endOffset,f;while(a.nodeType!==d){f=a.childNodes[b];if(!f||f.nodeName==="BR")break;a=f,b=0}if(e)while(c.nodeType!==d){f=c.childNodes[e-1];if(!f||f.nodeName==="BR")break;c=f,e=c.getLength()}else while(c.nodeType!==d){f=c.firstChild;if(!f||f.nodeName==="BR")break;c=f}return this.collapsed?(this.setStart(c,e),this.setEnd(a,b)):(this.setStart(a,b),this.setEnd(c,e)),this},moveBoundariesUpTree:function(a){var c=this.startContainer,d=this.startOffset,e=this.endContainer,f=this.endOffset,g;a||(a=this.commonAncestorContainer);while(c!==a&&!d)g=c.parentNode,d=b.call(g.childNodes,c),c=g;while(e!==a&&f===e.getLength())g=e.parentNode,f=b.call(g.childNodes,e)+1,e=g;return this.setStart(c,d),this.setEnd(e,f),this},getStartBlock:function(){var a=this.startContainer,b;return a.isInline()?b=a.getPreviousBlock():a.isBlock()?b=a:(b=k(a,this.startOffset),b=b.getNextBlock()),b&&this.containsNode(b,!0)?b:null},getEndBlock:function(){var a=this.endContainer,b,c;if(a.isInline())b=a.getPreviousBlock();else if(a.isBlock())b=a;else{b=l(a,this.endOffset);if(!b){b=a.ownerDocument.body;while(c=b.lastChild)b=c}b=b.getPreviousBlock()}return b&&this.containsNode(b,!0)?b:null},startsAtBlockBoundary:function(){var a=this.startContainer,c=this.startOffset,d,e;while(a.isInline()){if(c)return!1;d=a.parentNode,c=b.call(d.childNodes,a),a=d}while(c&&(e=a.childNodes[c-1])&&(e.data===""||e.nodeName==="BR"))c-=1;return!c},endsAtBlockBoundary:function(){var a=this.endContainer,c=this.endOffset,d=a.getLength(),e,f;while(a.isInline()){if(c!==d)return!1;e=a.parentNode,c=b.call(e.childNodes,a)+1,a=e,d=a.childNodes.length}while(c<d&&(f=a.childNodes[c])&&(f.data===""||f.nodeName==="BR"))c+=1;return c===d},expandToBlockBoundaries:function(){var a=this.getStartBlock(),c=this.getEndBlock(),d;return a&&c&&(d=a.parentNode,this.setStart(d,b.call(d.childNodes,a)),d=c.parentNode,this.setEnd(d,b.call(d.childNodes,c)+1)),this}})}(),function(a){"use strict";var b=2,c=1,d=3,e=4,f=1,g=1,h=3,i=a.defaultView,j=a.body,k=!!i.opera,l=!!i.ie,m=/Gecko\//.test(navigator.userAgent),n=/iP(?:ad|hone|od)/.test(navigator.userAgent),o=l||k,p=function(b,c,d){var e=a.createElement(b),f,g,h;c instanceof Array&&(d=c,c=null);if(c)for(f in c)e.setAttribute(f,c[f]);if(d)for(g=0,h=d.length;g<h;g+=1)e.appendChild(d[g]);return e},q={},r={cut:1,paste:1,focus:1,blur:1,pathChange:1,select:1,input:1,undoStateChange:1},s=function(a,b){var c=q[a],d,e;if(c){typeof b!="object"&&(b={data:b}),b.type!==a&&(b.type=a),d=c.length;while(d--)e=c[d],e.handleEvent?e.handleEvent(b):e(b)}},t=function(a){s(a.type,a)},u=function(b,c){var d=q[b];d||(d=q[b]=[],r[b]||a.addEventListener(b,t,!1)),d.push(c)},v=function(b,c){var d=q[b],e;if(d){e=d.length;while(e--)d[e]===c&&d.splice(e,1);d.length||(delete q[b],r[b]||a.removeEventListener(b,t,!1))}},w=function(b,c,d,e){if(b instanceof Range)return b.cloneRange();var f=a.createRange();return f.setStart(b,c),d?f.setEnd(d,e):f.setEnd(b,c),f},x=i.getSelection(),y=null,z=function(){return x.rangeCount&&(y=x.getRangeAt(0).cloneRange()),y};i.ie&&i.addEventListener("beforedeactivate",z,!0);var A,B,C="",D=function(a,b){var c=a.startContainer,d=a.endContainer,e;if(b||c!==A||d!==B)A=c,B=d,e=c&&d?c===d?d.getPath():"(selection)":"",C!==e&&(C=e,s("pathChange",e));c!==d&&s("select")},E=function(){D(z())};u("keyup",E),u("mouseup",E);var F=function(a){a&&(n&&i.focus(),x.removeAllRanges(),x.addRange(a))},G=function(){m&&j.focus(),i.focus()},H=function(){i.blur()};i.addEventListener("focus",t,!1),i.addEventListener("blur",t,!1);var I=function(){return j.innerHTML},J=function(a){var b=j;b.innerHTML=a;do b.fixCursor();while(b=b.getNextBlock())},K=function(a,b){b||(b=z()),b.collapse(!0),b._insertNode(a),b.setStartAfter(a),F(b),D(b)},L="ss-"+Date.now()+"-"+Math.random(),M="es-"+Date.now()+"-"+Math.random(),N=function(a){var c=p("INPUT",{id:L,type:"hidden"}),d=p("INPUT",{id:M,type:"hidden"}),e;a._insertNode(c),a.collapse(!1),a._insertNode(d),c.compareDocumentPosition(d)&b&&(c.id=M,d.id=L,e=c,c=d,d=e),a.setStartAfter(c),a.setEndBefore(d)},O=Array.prototype.indexOf,P=function(b){var c=a.getElementById(L),d=a.getElementById(M);if(c&&d){var e=c.parentNode,f=d.parentNode,g={startContainer:e,endContainer:f,startOffset:O.call(e.childNodes,c),endOffset:O.call(f.childNodes,d)};e===f&&(g.endOffset-=1),c.detach(),d.detach(),e.mergeInlines(g),e!==f&&f.mergeInlines(g),b||(b=a.createRange()),b.setStart(g.startContainer,g.startOffset),b.setEnd(g.endContainer,g.endOffset),b.collapsed||b.moveBoundariesDownTree()}return b},Q,R,S,T,U=function(){T&&(T=!1,s("undoStateChange",{canUndo:!0,canRedo:!1})),s("input")};u("keyup",function(a){var b=a.keyCode;if(!a.ctrlKey&&!a.metaKey&&!a.altKey&&(b<16||b>20)&&(b<33||b>45)){var c=j.firstChild;c.nodeName==="P"&&(N(z()),c.replaceWith(p("DIV",[c.empty()])),F(P())),U()}});var V=function(a){T||(Q+=1,Q<S&&(R.length=S=Q),a&&N(a),R[Q]=I(),S+=1,T=!0)},W=function(){if(Q!==0||!T){V(z()),Q-=1,J(R[Q]);var a=P();a&&F(a),T=!0,s("undoStateChange",{canUndo:Q!==0,canRedo:!0}),s("input")}},X=function(){if(Q+1<S&&T){Q+=1,J(R[Q]);var a=P();a&&F(a),s("undoStateChange",{canUndo:!0,canRedo:Q+1<S}),s("input")}},Y=function(b,c,f){b=b.toUpperCase(),c||(c={});if(!f&&!(f=z()))return!1;var i=f.commonAncestorContainer,j,k;if(i.nearest(b,c))return!0;if(i.nodeType===d)return!1;j=a.createTreeWalker(i,e,function(a){return f.containsNode(a,!0)?g:h},!1);var l=!1;while(k=j.nextNode()){if(!k.nearest(b,c))return!1;l=!0}return l},Z=function(b,c,f){if(f.collapsed){var i=p(b,c).fixCursor();f._insertNode(i),f.selectNodeContents(i)}else{var j=a.createTreeWalker(f.commonAncestorContainer,e,function(a){return f.containsNode(a,!0)?g:h},!1),k,l,m=0,n=0,o=j.currentNode=f.startContainer,q;o.nodeType!==d&&(o=j.nextNode());do q=!o.nearest(b,c),o===f.endContainer&&(q&&o.length>f.endOffset?o.splitText(f.endOffset):n=f.endOffset),o===f.startContainer&&(q&&f.startOffset?o=o.splitText(f.startOffset):m=f.startOffset),q&&(p(b,c).wraps(o),n=o.length),l=o,k||(k=l);while(o=j.nextNode());f=w(k,m,l,n)}return f},$=function(b,c,e,f){N(e),e.collapsed&&e._insertNode(a.createTextNode(""));var g=e.commonAncestorContainer;while(g.isInline())g=g.parentNode;var h=e.startContainer,i=e.startOffset,j=e.endContainer,k=e.endOffset,l=[],m=function p(a,b){if(e.containsNode(a,!1))return;var c=a.nodeType===d,f,g;if(!e.containsNode(a,!0)){a.nodeName!=="INPUT"&&(!c||a.data)&&l.push([b,a]);return}if(c)a===j&&k!==a.length&&l.push([b,a.splitText(k)]),a===h&&i&&(a.splitText(i),l.push([b,a]));else for(f=a.firstChild;f;f=g)g=f.nextSibling,p(f,b)},n=Array.prototype.filter.call(g.getElementsByTagName(b),function(a){return e.containsNode(a,!0)&&a.is(b,c)});f||n.forEach(function(a){m(a,a)}),l.forEach(function(a){a[0].cloneNode(!1).wraps(a[1])}),n.forEach(function(a){a.replaceWith(a.empty())}),e=P();var o={startContainer:e.startContainer,startOffset:e.startOffset,endContainer:e.endContainer,endOffset:e.endOffset};return g.mergeInlines(o),e.setStart(o.startContainer,o.startOffset),e.setEnd(o.endContainer,o.endOffset),e},_=function(a,b,c,d){if(!c&&!(c=z()))return;V(c),P(c),b&&(c=$(b.tag.toUpperCase(),b.attributes||{},c,d)),a&&(c=Z(a.tag.toUpperCase(),a.attributes||{},c)),F(c),D(c,!0),U()},ba=function(a,b,c){if(!c&&!(c=z()))return;b&&(V(c),P(c));var d=c.getStartBlock(),e=c.getEndBlock();if(d&&e)for(;;){if(a(d)||d===e)break;d=d.getNextBlock()}b&&(F(c),D(c,!0),U())},bb=function(a,b){if(!b&&!(b=z()))return;k||j.setAttribute("contenteditable","false"),T?N(b):V(b),b.expandToBlockBoundaries(),b.moveBoundariesUpTree(j);var c=b._extractContents(j);b._insertNode(a(c)),b.endOffset<b.endContainer.childNodes.length&&b.endContainer.childNodes[b.endOffset].mergeContainers(),b.startContainer.childNodes[b.startOffset].mergeContainers(),k||j.setAttribute("contenteditable","true"),F(P()),D(b,!0),U()},bc=function(a){return p("BLOCKQUOTE",[a])},bd=function(a){var b=a.querySelectorAll("blockquote");return Array.prototype.filter.call(b,function(a){return!a.parentNode.nearest("BLOCKQUOTE")}).forEach(function(a){a.replaceWith(a.empty())}),a},be=function(a){var b=a.querySelectorAll("blockquote"),c=b.length,d;while(c--)d=b[c],d.replaceWith(d.empty());return a},bf=function bC(a,b){var c,d,e,f,g,h;for(c=0,d=a.length;c<d;c+=1)e=a[c],f=e.nodeName,e.isBlock()?f!=="LI"&&(h=p("LI",[e.empty()]),e.parentNode.nodeName===b?e.replaceWith(h):(g=e.previousSibling)&&g.nodeName===b?(g.appendChild(h),e.detach(),c-=1,d-=1):e.replaceWith(p(b,[h]))):e.isContainer()&&(f!==b&&/^[DOU]L$/.test(f)?e.replaceWith(p(b,[e.empty()])):bC(e.childNodes,b))},bg=function(a){return bf(a.childNodes,"UL"),a},bh=function(a){return bf(a.childNodes,"OL"),a},bi=function(a){var b=a.querySelectorAll("UL, OL");return Array.prototype.filter.call(b,function(a){return!a.parentNode.nearest("UL")&&!a.parentNode.nearest("OL")}).forEach(function(a){var b=a.empty(),c=b.childNodes,d=c.length,e;while(d--)e=c[d],e.nodeName==="LI"&&b.replaceChild(p("DIV",[e.empty()]),e);a.replaceWith(b)}),a},bj={DIV:"DIV",PRE:"DIV",H1:"DIV",H2:"DIV",H3:"DIV",H4:"DIV",H5:"DIV",H6:"DIV",P:"DIV",DT:"DD",DD:"DT",LI:"LI"},bk=function(a,b,c){var d=bj[a.nodeName],e=b.split(c,a.parentNode);return e.nodeName!==d&&(a=p(d),a.replaces(e).appendChild(e.empty()),e=a),e},bl=/\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\([^\s()<>]+\))+(?:\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])|(?:[\w\-.%+]+@(?:[\w\-]+\.)+[A-Z]{2,4}))/i,bm=function(a){var b=a.ownerDocument,c=b.createTreeWalker(a,e,function(a){return a.nearest("A")?h:g},!1),d,f,i,j,k,l,m;while(d=c.nextNode()){f=d.data.split(bl),j=f.length;if(j>1){l=d.parentNode,m=d.nextSibling;for(i=0;i<j;i+=1)k=f[i],i?(i%2?(d=b.createElement("A"),d.textContent=k,d.href=/@/.test(k)?"mailto:"+k:/^https?:/.test(k)?k:"http://"+k):d=b.createTextNode(k),m?l.insertBefore(d,m):l.appendChild(d)):d.data=k;c.currentNode=d}}},bn=/^A(?:DDRESS|RTICLE|SIDE)|BLOCKQUOTE|CAPTION|D(?:[DLT]|IV)|F(?:IGURE|OOTER)|H[1-6]|HEADER|L(?:ABEL|EGEND|I)|O(?:L|UTPUT)|P(?:RE)?|SECTION|T(?:ABLE|BODY|D|FOOT|H|HEAD|R)|UL$/,bo={color:{regexp:/\S/,replace:function(a){return p("SPAN",{"class":"colour",style:"color:"+a})}},fontWeight:{regexp:/^bold/i,replace:function(){return p("B")}},fontStyle:{regexp:/^italic/i,replace:function(){return p("I")}},fontFamily:{regexp:/\S/,replace:function(a){return p("SPAN",{"class":"font",style:"font-family:"+a})}},fontSize:{regexp:/\S/,replace:function(a){return p("SPAN",{"class":"size",style:"font-size:"+a})}}},bp={SPAN:function(a,b){var c=a.style,d,e,f,g,h,i;for(d in bo)e=bo[d],f=c[d],f&&e.regexp.test(f)&&(i=e.replace(f),g&&g.appendChild(i),g=i,h||(h=i));return h&&(g.appendChild(a.empty()),b.replaceChild(h,a)),g||a},STRONG:function(a,b){var c=p("B");return b.replaceChild(c,a),c.appendChild(a.empty()),c},EM:function(a,b){var c=p("I");return b.replaceChild(c,a),c.appendChild(a.empty()),c},TT:function(a,b){var c=p("SPAN",{"class":"font",style:'font-family:menlo,consolas,"courier new",monospace'});return b.replaceChild(c,a),c.appendChild(a.empty()),c}},bq=function(a,b){var e=a.childNodes,f,g,h,i,j,k,l;for(f=0,g=e.length;f<g;f+=1){h=e[f],i=h.nodeName,j=h.nodeType,k=bp[i];if(j===c){l=h.childNodes.length;if(k)h=k(h,a);else if(!bn.test(i)&&!h.isInline()){f-=1,g+=l-1,a.replaceChild(h.empty(),h);continue}!b&&h.style.cssText&&h.removeAttribute("style"),l&&bq(h,b)}else if(j!==d||!/\S/.test(h.data))a.removeChild(h),f-=1,g-=1}return a},br=function(a,b){var c=a.childNodes,d=null,e,f,g,h;for(e=0,f=c.length;e<f;e+=1){g=c[e],h=g.nodeName==="BR";if(!h&&g.isInline())d||(d=p(b)),d.appendChild(g),e-=1,f-=1;else if(h||d)d||(d=p(b)),d.fixCursor(),h?a.replaceChild(d,g):(a.insertBefore(d,g),e+=1,f+=1),d=null}return d&&a.appendChild(d.fixCursor()),a},bs=function(a){var b=a.querySelectorAll("BR"),c=b.length,d,e,f,g,h;while(c--){d=b[c],e=d.parentNode;if(!e)continue;if(d.nextSibling&&d.previousSibling){while(e.isInline())e=e.parentNode;e.isBlock()?bj[e.nodeName]&&(bk(e,d.parentNode,d),d.detach()):br(e,"DIV")}else d.detach()}},bt=function(){j.fixCursor()};a.addEventListener(l?"beforecut":"cut",function(){var a=z();V(a),P(a),setTimeout(bt,0)},!1);var bu=!1;a.addEventListener(l?"beforepaste":"paste",function(){if(bu)return;bu=!0;var a=z(),b=a.startContainer,c=a.startOffset,d=a.endContainer,e=a.endOffset,f=p("DIV",{style:"position: absolute; overflow: hidden;top: -100px; left: -100px; width: 1px; height: 1px;"});j.appendChild(f),a.selectNodeContents(f),F(a),setTimeout(function(){var a=f.detach().empty(),g=a.firstChild,h=w(b,c,d,e);if(g){g===a.lastChild&&g.nodeName==="DIV"&&a.replaceChild(g.empty(),g),a.normalize(),bm(a),bq(a,!1),bs(a);var i=a;while(i=i.getNextBlock())i.fixCursor();h.insertTreeFragment(a),U(),h.collapse(!1)}F(h),D(h,!0),bu=!1},0)},!1);var bv={8:"backspace",9:"tab",13:"enter",32:"space",46:"delete"},bw=function(a){return function(b){b.preventDefault(),a()}},bx=function(a){return function(b){b.preventDefault();var c=z();Y(a,null,c)?_(null,{tag:a},c):_({tag:a},null,c)}},by={enter:function(b){b.preventDefault();var e=z();if(!e)return;V(e),P(e),e.collapsed||e._deleteContents();var f=e.getStartBlock(),g=f?f.nodeName:"DIV",h=bj[g],i;if(!f){e._insertNode(p("BR")),e.collapse(!1),F(e),D(e,!0),U();return}var l=e.startContainer,m=e.startOffset,n;if(!h){if(l===f){l=m?l.childNodes[m-1]:null,m=0;if(l){l.nodeName==="BR"?l=l.nextSibling:m=l.getLength();if(!l||l.nodeName==="BR")n=p("DIV").fixCursor(),l?f.replaceChild(n,l):f.appendChild(n),l=n}}br(f,"DIV"),h="DIV",l||(l=f.firstChild),e.setStart(l,m),e.setEnd(l,m),f=e.getStartBlock()}if(!f.textContent){if(f.nearest("UL")||f.nearest("OL"))return bb(bi,e);if(f.nearest("BLOCKQUOTE"))return bb(be,e)}i=bk(f,l,m);while(i.nodeType===c){var o=i.firstChild,q;if(i.nodeName==="A"){i.replaceWith(i.empty()),i=o;continue}while(o&&o.nodeType===d&&!o.data){q=o.nextSibling;if(!q||q.nodeName==="BR")break;o.detach(),o=q}if(!o||o.nodeName==="BR"||o.nodeType===d&&!k)break;i=o}F(w(i,0)),D(e,!0),i.nodeType===d&&(i=i.parentNode),i.offsetTop+i.offsetHeight>(a.documentElement.scrollTop||j.scrollTop)+j.offsetHeight&&i.scrollIntoView(!1),U()},backspace:function(a){var b=z();if(!b.collapsed)a.preventDefault(),b._deleteContents(),F(b),D(b,!0);else if(b.startsAtBlockBoundary()){a.preventDefault();var c=b.getStartBlock(),d=c.getPreviousBlock();if(d){d.mergeWithBlock(c,b),c=d.parentNode;while(c&&!c.nextSibling)c=c.parentNode;c&&(c=c.nextSibling)&&c.mergeContainers(),F(b)}else{if(c.nearest("UL")||c.nearest("OL"))return bb(bi,b);if(c.nearest("BLOCKQUOTE"))return bb(bd,b);F(b),D(b,!0)}}},"delete":function(a){var b=z();if(!b.collapsed)a.preventDefault(),b._deleteContents(),F(b),D(b,!0);else if(b.endsAtBlockBoundary()){a.preventDefault();var c=b.getStartBlock(),d=c.getNextBlock();if(d){c.mergeWithBlock(d,b),d=c.parentNode;while(d&&!d.nextSibling)d=d.parentNode;d&&(d=d.nextSibling)&&d.mergeContainers(),F(b),D(b,!0)}}},space:function(){var a=z();V(a),P(a),F(a)},"ctrl-b":bx("B"),"ctrl-i":bx("I"),"ctrl-u":bx("U"),"ctrl-y":bw(X),"ctrl-z":bw(W),"ctrl-shift-z":bw(X)};u("keydown",function(a){var b=a.keyCode||a.which,c=bv[b]||String.fromCharCode(b).toLowerCase(),d="";111<b&&b<124&&(c="f"+(b-111)),a.altKey&&(d+="alt-");if(a.ctrlKey||a.metaKey)d+="ctrl-";a.shiftKey&&(d+="shift-"),c=d+c,by[c]&&by[c](a)});var bz=/<style[^>]*>([\s\S]*?)<\/style>/gi,bA=function(a){return function(){return a.apply(null,arguments),this}},bB=function(a,b,c){return function(){return a(b,c),G(),this}};i.editor={addEventListener:bA(u),removeEventListener:bA(v),focus:bA(G),blur:bA(H),getDocument:function(){return a},addStyles:function(b){if(b){var c=p("STYLE",{type:"text/css"});c.appendChild(a.createTextNode(b)),a.documentElement.firstChild.appendChild(c)}return this},getHTML:function(){var a=[],b,c,d,e;if(o){b=j;while(b=b.getNextBlock())!b.textContent&&!b.querySelector("BR")&&(c=p("BR"),b.appendChild(c),a.push(c))}d=I();if(o){e=a.length;while(e--)a[e].detach()}return d},setHTML:function(b){var c=a.createDocumentFragment(),d=p("DIV"),e;d.innerHTML=b,c.appendChild(d.empty()),bq(c,!0),bs(c),br(c,"DIV");var f=c;while(f=f.getNextBlock())f.fixCursor();while(e=j.lastChild)j.removeChild(e);j.appendChild(c),j.fixCursor(),Q=-1,R=[],S=0,T=!1;var g=w(j.firstChild,0);return V(g),F(P(g)),D(g,!0),this},getSelectedText:function(){return z().getTextContent()},insertImage:function(a){var b=p("IMG",{src:a});return K(b),b},getPath:function(){return C},getSelection:z,setSelection:bA(F),undo:bA(W),redo:bA(X),hasFormat:Y,changeFormat:bA(_),bold:bB(_,{tag:"B"}),italic:bB(_,{tag:"I"}),underline:bB(_,{tag:"U"}),removeBold:bB(_,null,{tag:"B"}),removeItalic:bB(_,null,{tag:"I"}),removeUnderline:bB(_,null,{tag:"U"}),makeLink:function(b){b=encodeURI(b);var c=z();if(c.collapsed){var d=b.indexOf(":")+1;if(d)while(b[d]==="/")d+=1;c._insertNode(a.createTextNode(b.slice(d)))}return _({tag:"A",attributes:{href:b}},{tag:"A"},c),G(),this},removeLink:function(){return _(null,{tag:"A"},z(),!0),G(),this},setFontFace:function(a){return _({tag:"SPAN",attributes:{"class":"font",style:"font-family: "+a+", sans-serif;"}},{tag:"SPAN",attributes:{"class":"font"}}),G(),this},setFontSize:function(a){return _({tag:"SPAN",attributes:{"class":"size",style:"font-size: "+(typeof a=="number"?a+"px":a)}},{tag:"SPAN",attributes:{"class":"size"}}),G(),this},setTextColour:function(a){return _({tag:"SPAN",attributes:{"class":"colour",style:"color: "+a}},{tag:"SPAN",attributes:{"class":"colour"}}),G(),this},setHighlightColour:function(a){return _({tag:"SPAN",attributes:{"class":"highlight",style:"background-color: "+a}},{tag:"SPAN",attributes:{"class":"highlight"}}),G(),this},setTextAlignment:function(a){return ba(function(b){b.className="align-"+a,b.style.textAlign=a},!0),G(),this},forEachBlock:bA(ba),modifyBlocks:bA(bb),incQuoteLevel:bB(bb,bc),decQuoteLevel:bB(bb,bd),makeUnorderedList:bB(bb,bg),makeOrderedList:bB(bb,bh),removeList:bB(bb,bi)},j.setAttribute("contenteditable","true"),i.editor.setHTML(""),i.onEditorLoad&&(i.onEditorLoad(i.editor),delete i.onEditorLoad)}(document);
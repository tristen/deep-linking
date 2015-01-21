;(function(global) {

var DeepLinking = function(el) {
  this.init(el);
};

DeepLinking.prototype = {
  init: function(el) {
    this.tagSelectors = [];

    for (var i = 0; i < el.length; i++) {
      if (this.tagInclusion(el[i].nodeName)) this.tagSelectors.push(el[i]);
    }

    // Class names
    this.classActive = 'em-active';
    this.classInfo = 'em-info';
    this.classSelectedTag = 'selected-tag';
    this.classActiveTag = 'active-tag';

    this.pl = false; // Tag List
    this.p = false; // Tag Anchor
    this.h = false; // Highlighted tags

    this.addCSS();
    this.readHash();
  },

  tagInclusion: function(node) {
    var pass = ['P', 'LI', 'BLOCKQUOTE', 'CODE', 'PRE', 'STRONG', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    return pass.indexOf(node) >= 0;
  },

  addCSS: function() {
    var st = document.createElement('style');
    st.setAttribute('type', 'text/css');
    var stStr = '.' + this.classSelectedTag + ' { background: #F2F4F5; }' + '@-webkit-keyframes backgroundFade{ 0%{background:#FFF0B3;} 100%{background:transparent;}} @-moz-keyframes backgroundFade{ 0%{background:#FFF0B3;} 100%{background:transparent;}} @-ms-keyframes backgroundFade{ 0%{background:#FFF0B3;} 100%{background:transparent;}} @keyframes backgroundFade{ 0%{background:#FFF0B3;} 100%{background:transparent;}} .' + this.classActiveTag + ' { background-color: transparent; -webkit-animation:backgroundFade 5s; -moz-animation:backgroundFade 5s; -ms-animation:backgroundFade 5s; animation:backgroundFade 5s;}';
    try {
      st.innerHTML = stStr; // The sensible way
    } catch(e) {
      st.styleSheet.cssText = stStr; // IE's way
    }
    document.getElementsByTagName('head')[0].appendChild(st);
  },

  readHash: function() {
    // Read and interpret the URL hash
    var lh = decodeURI(location.hash);
    var findp = lh.match(/\[([^[\]]*)\]/);
    var p  = (findp && findp.length > 0) ? findp[1] : false;

    this.p = p;
    this.goAnchor(p);
    this.highlightMatch();
  },

  tagList: function() {
    // Build a list of Paragrphs, keys, and add meta-data to each Tag in DOM, saves list for later re-use
    if (this.pl && this.pl.list.length > 0) {
      return this.pl;
    }
    var instance = this;
    var list = [];
    var keys = [];
    var c = 0;

    for (var p = 0; p < this.tagSelectors.length; p++) {
      var pr = this.tagSelectors[p];
      if ((pr.innerText || pr.textContent || '').length>0) {
        var k = instance.createKey(pr);
        list.push(pr);
        keys.push(k);
        pr.setAttribute('data-key', k); // Unique Key
        pr.setAttribute('data-num', c); // Order
        this.addEvent(pr, 'click', function(e) {
          if (e.currentTarget.nodeName && instance.tagInclusion(e.currentTarget.nodeName)) {
            instance.tagClick(e);
          }
        });
        c++;
      }
    }

    this.pl = { list: list, keys: keys };
    return this.pl;
  },

  tagClick: function(e) {

    //Remove any active tag if there is one.
    var activeEl = document.querySelector('.' + this.classActiveTag);
    if (activeEl) this.removeClass(activeEl, this.classActiveTag);

    var change = false;
    var target = e.currentTarget;

    if (target) {
      if (!this.hasClass(target, this.classSelectedTag)) {
        this.updateTag(target);
        change = true;
      }
    }
    this.updateURLHash(change);
  },

  updateTag: function(pr) {
    this.p = pr.getAttribute('data-key');
    var selected = document.querySelector('.' + this.classSelectedTag);
    if (selected) this.removeClass(selected, this.classSelectedTag);
    this.addClass(pr, this.classSelectedTag);
  },

  updateURLHash: function(change) {
    var key, nSent, hash;
    // Scan the Tags, note selections, highlights and update the URL with the new Hash
    if (change) {
      var h = 'h[',
          paras = document.querySelectorAll('.emReady'),
          pLen  = paras.length;

      for (var p = 0; p < pLen; p++) {
        key = paras[p].getAttribute('data-key');
        if (nSent !== sLen) {
          for (var s = 0; s < sLen; s++) {
            h += ',' + spans[s].getAttribute('data-num');
          }
        }
      }

      var anchor = ((this.p) ? '[' + this.p + '],' : '');
      hash = (anchor + (h.replace('h[,', 'h[') + ']')).replace(',h[]', '');
    } else {
      var selected = document.querySelector('.' + this.classSelectedTag);
      this.removeClass(selected, this.classSelectedTag);
      hash = '_';
    }
    location.hash = hash;
  },

  createKey: function(p) {
    // From a Tag, generate a Key
    var key = '',
        len = 6,
        txt = (p.innerText || p.textContent || '').replace(/[^a-z\. ]+/gi, ''),
        lines, first, last, k, max;

    if (txt && txt.length>1) {
      lines = this.getSentences(txt);
      if (lines.length>0) {
        first = this.cleanArray(lines[0].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
        last = this.cleanArray(lines[lines.length-1].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
        k = first.concat(last);

        max = (k.length > len) ? len : k.length;
        for (var i = 0; i < max; i++) {
          key += k[i].substring(0, 1);
        }
      }
    }
    return key;
  },

  findKey: function(key) {
    // From a list of Keys, locate the Key and corresponding Tag
    var pl = this.tagList(),
        ln = pl.keys.length,
        ix = false,
        el = false,
        ls, le;

    for (var i = 0; i < ln; i++) {
      if (key === pl.keys[i]) { // Direct Match
          return { index: i, elm: pl.list[i] };
      } else { // Look for 1st closest Match
        if (!ix) {
          ls = this.lev(key.slice(0, 3), pl.keys[i].slice(0, 3));
          le = this.lev(key.slice(-3)  , pl.keys[i].slice(-3));
          if ((ls+le) < 3) {
            ix = i;
            el = pl.list[i];
          }
        }
      }
    }
    return { index: ix, elm: el };
  },

  goAnchor: function(p) {
    // Move view to top of a given Tag
    if (!p) return;
    var pg = (isNaN(p)) ? this.findKey(p).elm : (this.tagList().list[p-1] || false);
    var self = this;

    if (pg) {
      setTimeout(function() {
        window.scrollTo(0, self.offset(pg).top);
      }, 500);
    }
  },

  highlightMatch: function() {
    var para, key, isActive;
    var hasSpan = document.querySelectorAll('span.' + this.classInfo);
    if (hasSpan.length === 0) {
      var pl  = this.tagList();
      var len = pl.list.length;
      for (var i = 0; i < len; i++) {
        para = pl.list[i] || false;
        if (para) {
          key = pl.keys[i];
          isActive = (key === this.p) ? para.className = this.classActiveTag : '';
        }
      }
    }
  },

  getSentences: function(el) {
    // Break a tag into Sentences, bearing in mind that the "." is not the definitive way to do so
    var html    = (typeof el === 'string') ? el : el.innerHTML,
        mrsList = 'Mr,Ms,Mrs,Miss,Msr,Dr,Gov,Pres,Sen,Prof,Gen,Rep,St,Messrs,Col,Sr,Jf,Ph,Sgt,Mgr,Fr,Rev,No,Jr,Snr',
        topList = 'A,B,C,D,E,F,G,H,I,J,K,L,M,m,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,etc,oz,cf,viz,sc,ca,Ave,St',
        geoList = 'Calif,Mass,Penn,AK,AL,AR,AS,AZ,CA,CO,CT,DC,DE,FL,FM,GA,GU,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MH,MI,MN,MO,MP,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,PW,RI,SC,SD,TN,TX,UT,VA,VI,VT,WA,WI,WV,WY,AE,AA,AP,NYC,GB,IRL,IE,UK,GB,FR',
        numList = '0,1,2,3,4,5,6,7,8,9',
        webList = 'aero,asia,biz,cat,com,coop,edu,gov,info,int,jobs,mil,mobi,museum,name,net,org,pro,tel,travel,xxx',
        extList = 'www',
        d       = '__DOT__',

    list = (topList + ',' + geoList + ',' + numList + ',' + extList).split(','),
    len  = list.length,
    i, lines;

    for (i=0;i<len;i++) {
      html = html.replace(new RegExp((' ' + list[i] + '\\.'), 'g'), (' ' + list[i] + d));
    }

    list = (mrsList + ',' + numList).split(',');
    len  = list.length;
    for (i = 0; i < len; i++) {
      html = html.replace(new RegExp((list[i] + '\\.'), 'g'), (list[i]+d));
    }

    list = (webList).split(',');
    len  = list.length;
    for (i=0;i<len;i++) {
      html = html.replace(new RegExp(('\\.' + list[i]), 'g'), (d+list[i]));
    }

    lines = this.cleanArray(html.split('. '));
    return lines;
  },

  lev: function(a, b) {
    // Get the Levenshtein distance - a measure of difference between two sequences
    // Based on http://andrew.hedges.name/experiments/levenshtein/levenshtein.js
    var m = a.length,
        n = b.length,
        r = [],
        o;

        r[0] = [];

    if (m < n) { c = a; a = b; b = c; o = m; m = n; n = o; }
    for (var c = 0; c < n+1; c++) { r[0][c] = c; }
    for (var i = 1; i < m+1; i++) {
      r[i] = [];
      r[i][0] = i;
      for (var j = 1; j < n+1; j++) {
        r[i][j] = this.smallest(r[i-1][j]+1, r[i][j-1]+1, r[i-1][j-1]+((a.charAt(i-1)===b.charAt(j-1))? 0 : 1));
      }
    }
    return r[m][n];
  },

  smallest: function(x,y,z) {
    // Return the smallest of two values
    if (x < y && x < z) { return x; }
    if (y < x && y < z) { return y; }
    return z;
  },

  cleanArray: function(a){
    // Remove empty items from an array
    var n = [];
    for (var i = 0; i < a.length; i++){
      if (a[i] && a[i].replace(/ /g,'').length > 0){ n.push(a[i]); }
    }
    return n;
  },

  // Browser utils
  addEvent: function(object, event, method) {
    if (object.attachEvent) {
      object['e' + event + method] = method;
      object[event + method] = function() {
        object['e' + event + method](window.event);
      };
      object.attachEvent('on' + event, object[event + method]);
    } else {
    object.addEventListener(event, method, false);
    }
  },

  hasClass: function(el, className) {
    if (el.classList) {
      el.classList.contains(className);
    } else {
      new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
  },

  removeClass: function(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  },

  addClass: function(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  },

  offset: function(el) {
    var rect = el.getBoundingClientRect();
    var docTop = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    var docLeft = (document.documentElement || document.body.parentNode || document.body).scrollLeft;
    return {
      top: rect.top + docTop,
      left: rect.left + docLeft
    };
  }
};

global.DeepLinking = DeepLinking;
if (typeof module !== 'undefined' && module.exports) module.exports = DeepLinking;

})(this);

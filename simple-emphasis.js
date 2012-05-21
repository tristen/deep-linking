/*  --------------------------------------------------

    Emphasis
    by Michael Donohoe (@donohoe)
    https://github.com/NYTimes/Emphasis
    http://open.blogs.nytimes.com/2011/01/11/emphasis-update-and-source

    - - - - - - - - - -

    Modifications by tristen (@fallsemo)
    https://github.com/tristen/simple-emphasis

    NOTE * Requires jQuery

    - - - - - - - - - -

    Copyright (C) 2011 The New York Times (http://www.nytimes.com)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

    -------------------------------------------------- */

!function(context) {

  var Emphasis = function(el) {
    this.init(el);
  };

  Emphasis.prototype = {
    init: function(selector) {
      this.paraSelctors           = selector;

      // Class names
      this.classActive            = 'em-active';
      this.classInfo              = 'em-info';
      this.classSelectedParagraph = 'selected-paragraph';
      this.classActiveParagraph   = 'active-paragraph';

      this.pl = false; // Paragraph List
      this.p  = false; // Paragraph Anchor
      this.h  = false; // Highlighted paragraphs

      this.addCSS();
      this.readHash();
    },

    addCSS: function() {
      var st = document.createElement('style');
      st.setAttribute('type', 'text/css');
      var stStr = 'p.' + this.classSelectedParagraph + ' { display: block; position: relative; background: #F2F4F5; }' + '@-webkit-keyframes backgroundFade{ 0%{background:#FFF0B3;} 100%{background:transparent;}} p.' + this.classActiveParagraph + ' { display: block; position: relative; background-color: transparent; -webkit-animation:backgroundFade 5s; }';
      try {
        // try the sensible way
        st.innerHTML = stStr;
      } catch(e) {
        // IE's way
        st.styleSheet.cssText = stStr;
      }
      document.getElementsByTagName('head')[0].appendChild(st);
    },

    readHash: function() {
      // Read and interpret the URL hash
      var lh = decodeURI(location.hash),
          p  = false,
          a, i, findp, findh, hi, key, pos;

      findp = lh.match(/p\[([^[\]]*)\]/);
      findh = lh.match(/h\[([^[\]]*)\]/);

      p  = (findp && findp.length>0) ? findp[1] : false;
      hi = (findh && findh.length>0) ? findh[1] : false;

      if (hi) {
        hi = hi.match(/[a-zA-Z]+(,[0-9]+)*/g);
        for (i = 0; i < hi.length; i++) {
          a   = hi[i].split(',');
          key = a[0];
          pos = this.findKey(key).index;
        }
      }
      this.p = p;
      this.goAnchor(p);
      this.highlightMatch();
    },

    paragraphList: function() {
      // Build a list of Paragrphs, keys, and add meta-data to each Paragraph in DOM, saves list for later re-use
      if (this.pl && this.pl.list.length > 0) {
        return this.pl;
      }
      var instance = this,
          list = [],
          keys = [],
          c = 0,
          len  = this.paraSelctors.length,
          p, pr, k;

      for (p=0; p<len; p++) {
        pr = this.paraSelctors[p];
        if ((pr.innerText || pr.textContent || '').length>0) {
          k = instance.createKey(pr);
          list.push(pr);
          keys.push(k);
          pr.setAttribute('data-key', k); // Unique Key
          pr.setAttribute('data-num', c); // Order
          this.addEvent(pr, 'click', function(e) {
            instance.paragraphClick(e);
          });
          c++;
        }
      }

      this.pl = { list: list, keys: keys };
      return this.pl;
    },

    paragraphClick: function(e) {

      //Remove any active paragraph if there is one.
      $('p.' + this.classActiveParagraph).removeClass(this.classActiveParagraph);

      var change = false,
          pr = (e.currentTarget.nodeName === 'P') ? e.currentTarget : false, // Paragraph
          an = (e.target.nodeName === 'A')        ? e.target        : false; // Anchor

      if (pr || an) {
        if (!$(pr).hasClass(this.classSelectedParagraph)) {
          this.updateParagraph(pr);
          change = true;
        }
      }
      this.updateURLHash(change);
    },

    paragraphInfo: function(mode) {
      // Toggle anchor links next to Paragraphs
      // Add an active link to paragraphs if one exists
      var hasSpan, pl, len, i, para, key, isActive, spans;
        hasSpan = $('span.' + this.classInfo);
        if (hasSpan.length === 0) {
          pl  = this.paragraphList();
          len = pl.list.length;
          for (i=0; i<len; i++) {
            para = pl.list[i] || false;
            if (para) {
              key        = pl.keys[i];
              isActive   = (key === this.p) ? para.className = this.classActiveParagraph : '';
            }
          }
        }
    },

    updateParagraph: function(pr) {
      this.p = pr.getAttribute('data-key');
      $('p.' + this.classSelectedParagraph).removeClass(this.classSelectedParagraph);
      $(pr).addClass(this.classSelectedParagraph);
    },

    updateURLHash: function(change) {
      // Scan the Paragraphs, note selections, highlights and update the URL with the new Hash
      if (change) {
        var h = 'h[',
            paras = $('p.emReady'),
            pLen  = paras.length,
            p, key, nSent, anchor, hash,s;

        for (p=0; p < pLen; p++) {
          key = paras[p].getAttribute('data-key');
          if (nSent!==sLen) {
            for (s=0; s<sLen; s++) {
              h += ',' + spans[s].getAttribute('data-num');
            }
          }
        }

        anchor    = ((this.p) ? 'p[' + this.p + '],' : '');
        hash      = (anchor + (h.replace('h[,', 'h[') + ']')).replace(',h[]', '');
      } else {
        $('p.' + this.classSelectedParagraph).removeClass(this.classSelectedParagraph);
        hash = '_';
      }
      location.hash = hash;
    },

    createKey: function(p) {
      // From a Paragraph, generate a Key
      var key = '',
          len = 6,
          txt = (p.innerText || p.textContent || '').replace(/[^a-z\. ]+/gi, ''),
          lines, first, last, k, max, i;

      if (txt && txt.length>1) {
        lines = this.getSentences(txt);
        if (lines.length>0) {
          first = this.cleanArray(lines[0].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
          last  = this.cleanArray(lines[lines.length-1].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
          k     = first.concat(last);

          max = (k.length>len) ? len : k.length;
          for (i=0; i<max; i++) {
            key += k[i].substring(0, 1);
          }
        }
      }
      return key;
    },

    findKey: function(key) {
      // From a list of Keys, locate the Key and corresponding Paragraph
      var pl = this.paragraphList(),
          ln = pl.keys.length,
          ix = false,
          el = false,
          i, ls, le;

      for (i=0;i<ln;i++) {
        if (key===pl.keys[i]) { // Direct Match
            return { index: i, elm: pl.list[i] };
        } else { // Look for 1st closest Match
          if (!ix) {
            ls = this.lev(key.slice(0, 3), pl.keys[i].slice(0, 3));
            le = this.lev(key.slice(-3)  , pl.keys[i].slice(-3));
            if ((ls+le)<3) {
              ix = i;
              el = pl.list[i];
            }
          }
        }
      }
      return { index: ix, elm: el };
    },

    goAnchor: function(p) {
      // Move view to top of a given Paragraph
      if (!p) { return; }
      var pg = (isNaN(p)) ? this.findKey(p).elm : (this.paragraphList().list[p-1] || false);

      if (pg) {
        setTimeout(function(){
          $(window).scrollTop($(pg).offset().top);
        }, 500);
      }
    },

    highlightMatch: function() {
      var hasSpan, pl, len, i, para, key, isActive;
      hasSpan = $('span.' + this.classInfo);
      if (hasSpan.length === 0) {
        pl  = this.paragraphList();
        len = pl.list.length;
        for (i=0; i<len; i++) {
          para = pl.list[i] || false;
          if (para) {
            key        = pl.keys[i];
            isActive   = (key === this.p) ? para.className = this.classActiveParagraph : '';
          }
        }
      }
    },

    getSentences: function(el) {
      // Break a Paragraph into Sentences, bearing in mind that the "." is not the definitive way to do so
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

    ordinal: function(n) {
      // http://en.wikipedia.org/wiki/Ordinal_number
      var sfx = ['th','st','nd','rd'],
          val = n%100;
      return n + (sfx[(val-20)%10] || sfx[val] || sfx[0]);
    },

    lev: function(a, b) {
      // Get the Levenshtein distance - a measure of difference between two sequences
      // Based on http://andrew.hedges.name/experiments/levenshtein/levenshtein.js
      var m = a.length,
          n = b.length,
          r = [],
          c, o, i, j;

          r[0] = [];

      if (m < n) { c = a; a = b; b = c; o = m; m = n; n = o; }
      for (c = 0; c < n+1; c++) { r[0][c] = c; }
      for (i = 1; i < m+1; i++) {
        r[i] = [];
        r[i][0] = i;
        for (j=1; j<n+1; j++) {
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

    rtrim: function(txt) {
      // Trim whitespace from right of string
      return txt.replace(/\s+$/, '');
    },

    cleanArray: function(a){
      // Remove empty items from an array
      var n = [], i;
      for (i=0; i<a.length; i++){
        if (a[i] && a[i].replace(/ /g,'').length > 0){ n.push(a[i]); }
      }
      return n;
    },
    addEvent: function(object, event, method) {
      if (object.attachEvent) {
        object['e' + event + method] = method;
        object[event + method] = function(){object['e' + event + method](window.event);}
        object.attachEvent('on' + event, object[event + method]);
      } else {
      object.addEventListener(event, method, false);
      }
    }
  };
  context['Emphasis'] = Emphasis;
}(this);

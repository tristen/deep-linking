##Simple Emphasis
Simple Emphasis is a stripped down version of the Dynamic Deep-Linking and Highlighting UI, [Emphasis](https://github.com/NYTimes/Emphasis).

### What's Different?

- Only paragraphs are linked.
- Emphasis turned on by default 
- Paragraphs toggle on and off a unique generated hash
- A modified UI

### Quick Usage

``` js
$(function () {
  var content = document.getElementsByTagName('p');
  new Emphasis(content);
});
```

### Dependencies

- jQuery

### Demo

[http://tristen.github.com/demo/simple-emphasis](http://tristen.github.com/demo/simple-emphasis)

###Thanks!
To Michael Donohoe [(@donohoe)](twitter.com/#!/donohoe) and the Nytimes [@timesopen](https://twitter.com/#!/timesopen)

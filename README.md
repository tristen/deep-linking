##Simple Emphasis
Simple Emphasis is a stripped down version of the Dynamic Deep-Linking and Highlighting UI, [Emphasis](https://github.com/NYTimes/Emphasis).

### What's Different?

- Only paragraphs are linked.
- Toggled on by a single <kbd>shift</kbd> key press 
- Paragraphs toggle on and off a unique generated hash
- A modified UI

### Assumptions

You need to specify what p tags you would like to target. The minified version of the code and source assumes `div.content p` you can edit the source to suit your needs from the line:

    `this.paraSelctors = $('.content p');`

### Dependencies

- jQuery

### Demo

[http://tristen.github.com/simple-emphasis](http://tristen.github.com/simple-emphasis)


###Thanks!
To Michael Donohoe [(@donohoe)](twitter.com/#!/donohoe) and the Nytimes [@timesopen](https://twitter.com/#!/timesopen)
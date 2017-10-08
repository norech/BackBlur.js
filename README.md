# BackBlur.js — A fast and easy-to-use blurred background system
A fast and easy-to-use background blur system

## How to import
First, you must download the JS files found in the `dist/` folder and include them in `<head>` tags.

### Production
Use this when you care about the speed and not about debugging.

```html
<script src="backblur.min.js"></script>
```

### Developement
Use this when you care about debugging.

```html
<script src="backblur.js"></script>
```

## Example usage
```js
var myblur = new BackBlur({
    selector: ".backblur", // string | Element | Element[]
    background_color: 'rgba(255, 255, 255, 0.65)', // string
    apply_zindex: true // boolean
    blur_radius: 15, // number
    tmp_prefix: '__BACKBLUR', // string
    cache: true // boolean
});
```

## How to contribute
### Requirement

For Windows, you have to download and install [git](https://git-scm.com/downloads) and [NodeJS](https://nodejs.org/en/download/).

OS X users should install [Homebrew](http://brew.sh/). Once Homebrew is installed, run `brew install git` to install git, and `brew install node` to install Node.js.

Linux/BSD users should use their appropriate package managers to install git and Node.js, or build from source if you swing that way.
Easy-peasy.

### Build your own BackBlur.js
Before doing commands below, register Gulp as a global package using the command below:
```
npm install -g gulp
```

Now, clone a copy of the main BackBlur.js git repo by running:
```
git clone https://github.com/Norech/BackBlur.js.git
```
After that, you just need to go in the BackBlur.js directory and run the build script:
```
cd BackBlur.js && npm run init
```

After all, you will be able to use Gulp commands to build JS files easily by doing:

```
gulp
```

### Build after watching files

If you want to automatically build when a file is changed, you can simply do:

```
gulp watch
```

*Gulp will not generate .min.js files if you use this command.*
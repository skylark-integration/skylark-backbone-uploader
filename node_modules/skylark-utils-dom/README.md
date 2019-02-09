# skylark-utils-dom
An Universal HTML5 DOM Utility Library, Powerful and Concise.

## Features

- Powerful  
The skylark-utils-dom library provides a comprehensive dom utility functions, let you to develop a HTML5 applications more simpler and more able to focus on the application logic itself.
- Concise  
The skylark-utils library pursues a high modularity and high reusability，and was written to be straightforward and easy to read. Naturally, when the bug occurs, the program will be easier to debug. 

base api
-------------
- browser  
This module defines some APIs about brower compatibility.
- css  
This module defines some APIs about stylesheet and rule.
- scripter  
This module defines some APIs wrapping script load and unload.

node level api
----------------
- datax  
This module defines some APIs wrapping DOM attribute and property.
- dnd  
This module defines some APIs wrapping DOM drag and drop.
- eventer  
This module defines some APIs wrapping DOM event.
- filer  
This module defines some APIs wrapping local file reand and write.
- finder  
This module defines some APIs wrapping dom query.
- fx  
This module defines some APIs wrapping DOM transition and animation.
- geom  
This module defines some APIs wrapping DOM geometry.
- noder  
This module defines some APIs wrapping DOM construction.
- styler  
This module defines some APIs wrapping dom style and class.

visual element api
-------------------
- velm  
This module implemented VisuleElement type for wrapping a visual dom node.  
VisualElment provides a number of methods encapsulated from the basic utility module function and supports chain calls.

query api
-------------
- query   
This module provides a similar jquery api,  [skykark-jquery](https://github.com/skylarkjs/skylark-jquery) based on this module provides an API that is fully compatible with [jquery](https://jquery.com/), and the code is simpler and more productive.

## Dependences
| Project | Status | Description |
|---------|--------|-------------|
| [skylark-langx](https://github.com/skylarkjs/skylark-langx)   | v0.9.0 | Javascript language extension library |

##  Different builds
|  | build | Description |
|---------|--------|-------------|
| full | skylark-utils-dom-all.js | included skylark-langx |
| only utils | skylark-utils-dom.js | not included skylark-langx |
| full （development） | uncompressed/skylark-utils-dom-all.js | included skylark-langx |
| only utils （development）| uncompressed/skylark-utils-dom.js | not included skylark-langx |

## Installation
You can get the latest version in many different ways:

- Downloading [a ZIP file from master](https://github.com/skylarkutils/skylark-utils-dom/archive/master.zip)
- Cloning using Git: `git clone https://github.com/skylarkutils/skylark-utils-dom.git`
- Installing via NPM: `npm install https://github.com/skylarkutils/skylark-utils-dom.git#master --save`


## Usage

- Using the skylark-utils-dom library for a AMD module.  
```js
require({
  'paths': {
     'skylark-utils-dom': '{location}/skylark-utils-dom-all' 
  }
}, ['skylark-utils-dom'], function(dom) {
   dom.styler.css(elm,"color","blue");
});
```

- Using the skylark-utils-dom library for a global object named skylarkjs.  
```js
<script type="text/javascript" src="{location}/skylark-utils-dom-all.js"></script>
<script>
   skylarkjs.styler.css(elm,"color","blue");
</script>
```

- Using the skylark-utils-dom library for a AMD package.  
```js
require({
  'packages': [
    { 'name': 'skylark-utils-dom', 'location': '{location}/skylark-utils-dom/' }
  ]
}, ['skylark-utils-dom/styler'], function(styler) {
   styler.css(elm,"color","blue");
});
```

## API Document
skyalrk.js application framwork contains the above modules, so the module API documentation can refer to sklark.js's api doc.

- http://www.skylarkjs.org/api

## Examples
Please access the following site for the execution of each example program under the "/examples" directory.

- http://www.skylarkjs.org/examples
- http://examples.skylarkjs.org/skylark-utils/

## Building 

- Ensure that Node.js is installed.
- Run npm install https://github.com/skylarkjs/skylark-bundle-cli.git -g to ensure sbundle is installed.
- Run npm install to ensure the required dependencies are installed.
- Run npm run build. The builds will be placed in the dist/ directory.

## License

Released under the [MIT](http://opensource.org/licenses/MIT)

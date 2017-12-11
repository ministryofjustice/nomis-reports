/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(2);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list, options);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list, options) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove, transformResult;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    transformResult = options.transform(obj.css);
	    
	    if (transformResult) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = transformResult;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css. 
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n.example-highlight-grid .grid-row {\n  background: #bfc1c3; }\n\n.example-highlight-grid .column-highlight {\n  background: #dee0e2;\n  width: 100%; }\n\n.visuallyhidden {\n  position: absolute;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  height: 1px;\n  width: 1px;\n  margin: -1px;\n  padding: 0;\n  border: 0; }\n\n.js-enabled .js-hidden {\n  display: none; }\n\n/* Borrowed from http://meyerweb.com/eric/tools/css/reset/ */\ndiv, span,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark {\n  border: none;\n  margin: 0;\n  padding: 0; }\n\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ninput, textarea,\ntable, caption, tbody, tfoot, thead, tr, th, td {\n  font-size: inherit;\n  font-family: inherit;\n  line-height: inherit;\n  font-weight: normal; }\n\nmain {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25;\n  -webkit-font-smoothing: antialiased; }\n  @media (min-width: 641px) {\n    main {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\n.font-xxlarge {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 53px;\n  line-height: 1.03774; }\n  @media (min-width: 641px) {\n    .font-xxlarge {\n      font-size: 80px;\n      line-height: 1; } }\n\n.font-xlarge {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 32px;\n  line-height: 1.09375; }\n  @media (min-width: 641px) {\n    .font-xlarge {\n      font-size: 48px;\n      line-height: 1.04167; } }\n\n.font-large {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 24px;\n  line-height: 1.04167; }\n  @media (min-width: 641px) {\n    .font-large {\n      font-size: 36px;\n      line-height: 1.11111; } }\n\n.font-medium {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 18px;\n  line-height: 1.2; }\n  @media (min-width: 641px) {\n    .font-medium {\n      font-size: 24px;\n      line-height: 1.25; } }\n\n.font-small {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25; }\n  @media (min-width: 641px) {\n    .font-small {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\n.font-xsmall {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 14px;\n  line-height: 1.14286; }\n  @media (min-width: 641px) {\n    .font-xsmall {\n      font-size: 16px;\n      line-height: 1.25; } }\n\n.bold-xxlarge {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 53px;\n  line-height: 1.03774; }\n  @media (min-width: 641px) {\n    .bold-xxlarge {\n      font-size: 80px;\n      line-height: 1; } }\n\n.bold-xlarge {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 32px;\n  line-height: 1.09375; }\n  @media (min-width: 641px) {\n    .bold-xlarge {\n      font-size: 48px;\n      line-height: 1.04167; } }\n\n.bold-large {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 24px;\n  line-height: 1.04167; }\n  @media (min-width: 641px) {\n    .bold-large {\n      font-size: 36px;\n      line-height: 1.11111; } }\n\n.bold-medium {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 18px;\n  line-height: 1.2; }\n  @media (min-width: 641px) {\n    .bold-medium {\n      font-size: 24px;\n      line-height: 1.25; } }\n\n.bold-small {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25; }\n  @media (min-width: 641px) {\n    .bold-small {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\n.bold-xsmall {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 14px;\n  line-height: 1.14286; }\n  @media (min-width: 641px) {\n    .bold-xsmall {\n      font-size: 16px;\n      line-height: 1.25; } }\n\n.heading-xlarge {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 32px;\n  line-height: 1.09375;\n  margin-top: 0.46875em;\n  margin-bottom: 0.9375em; }\n  @media (min-width: 641px) {\n    .heading-xlarge {\n      font-size: 48px;\n      line-height: 1.04167; } }\n  @media (min-width: 641px) {\n    .heading-xlarge {\n      margin-top: 0.625em;\n      margin-bottom: 1.25em; } }\n  .heading-xlarge .heading-secondary {\n    font-family: \"nta\", Arial, sans-serif;\n    font-weight: 400;\n    text-transform: none;\n    font-size: 20px;\n    line-height: 1.11111;\n    display: block;\n    padding-top: 8px;\n    padding-bottom: 7px;\n    display: block;\n    color: #6f777b; }\n    @media (min-width: 641px) {\n      .heading-xlarge .heading-secondary {\n        font-size: 27px;\n        line-height: 1.11111; } }\n    @media (min-width: 641px) {\n      .heading-xlarge .heading-secondary {\n        padding-top: 4px;\n        padding-bottom: 6px; } }\n\n.heading-large {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 24px;\n  line-height: 1.04167;\n  margin-top: 1.04167em;\n  margin-bottom: 0.41667em; }\n  @media (min-width: 641px) {\n    .heading-large {\n      font-size: 36px;\n      line-height: 1.11111; } }\n  @media (min-width: 641px) {\n    .heading-large {\n      margin-top: 1.25em;\n      margin-bottom: 0.55556em; } }\n  .heading-large .heading-secondary {\n    font-family: \"nta\", Arial, sans-serif;\n    font-weight: 400;\n    text-transform: none;\n    font-size: 18px;\n    line-height: 1.2;\n    display: block;\n    padding-top: 9px;\n    padding-bottom: 6px;\n    display: block;\n    color: #6f777b; }\n    @media (min-width: 641px) {\n      .heading-large .heading-secondary {\n        font-size: 24px;\n        line-height: 1.25; } }\n    @media (min-width: 641px) {\n      .heading-large .heading-secondary {\n        padding-top: 6px;\n        padding-bottom: 4px; } }\n\n.heading-medium {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 18px;\n  line-height: 1.2;\n  margin-top: 1.25em;\n  margin-bottom: 0.5em; }\n  @media (min-width: 641px) {\n    .heading-medium {\n      font-size: 24px;\n      line-height: 1.25; } }\n  @media (min-width: 641px) {\n    .heading-medium {\n      margin-top: 1.875em;\n      margin-bottom: 0.83333em; } }\n\n.heading-small {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25;\n  margin-top: 0.625em;\n  margin-bottom: 0.3125em; }\n  @media (min-width: 641px) {\n    .heading-small {\n      font-size: 19px;\n      line-height: 1.31579; } }\n  @media (min-width: 641px) {\n    .heading-small {\n      margin-top: 1.05263em; } }\n\np {\n  margin-top: 0.3125em;\n  margin-bottom: 1.25em; }\n  @media (min-width: 641px) {\n    p {\n      margin-top: 0.26316em;\n      margin-bottom: 1.05263em; } }\n\n.lede {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 18px;\n  line-height: 1.2; }\n  @media (min-width: 641px) {\n    .lede {\n      font-size: 24px;\n      line-height: 1.25; } }\n\n.text {\n  max-width: 30em; }\n\n.text-secondary {\n  color: #6f777b; }\n\n.link {\n  color: #005ea5;\n  text-decoration: underline; }\n\n.link:visited {\n  color: #4c2c92; }\n\n.link:hover {\n  color: #2b8cc4; }\n\n.link:active {\n  color: #005ea5; }\n\n.link-back {\n  display: -moz-inline-stack;\n  display: inline-block;\n  position: relative;\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 14px;\n  line-height: 1.14286;\n  margin-top: 15px;\n  margin-bottom: 15px;\n  padding-left: 14px;\n  color: #0b0c0c;\n  text-decoration: none;\n  border-bottom: 1px solid #0b0c0c; }\n  @media (min-width: 641px) {\n    .link-back {\n      font-size: 16px;\n      line-height: 1.25; } }\n  .link-back:link, .link-back:visited, .link-back:hover, .link-back:active {\n    color: #0b0c0c; }\n  .link-back::before {\n    content: '';\n    display: block;\n    width: 0;\n    height: 0;\n    border-top: 5px solid transparent;\n    border-right: 6px solid #0b0c0c;\n    border-bottom: 5px solid transparent;\n    position: absolute;\n    left: 0;\n    top: 50%;\n    margin-top: -6px; }\n\n@-moz-document url-prefix() {\n  .link-back::before {\n    border-top: 5px dotted rgba(255, 0, 0, 0);\n    border-bottom: 5px dotted rgba(255, 0, 0, 0); } }\n\n.code {\n  color: black;\n  text-shadow: 0 1px white;\n  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;\n  font-size: 14px;\n  direction: ltr;\n  text-align: left;\n  white-space: pre;\n  word-spacing: normal;\n  word-break: normal;\n  line-height: 1.5;\n  -moz-tab-size: 4;\n  -o-tab-size: 4;\n  tab-size: 4;\n  -webkit-hyphens: none;\n  -moz-hyphens: none;\n  -ms-hyphens: none;\n  hyphens: none;\n  color: #0b0c0c;\n  background-color: #f8f8f8;\n  border: 1px solid #bfc1c3;\n  padding: 4px 4px 2px 4px; }\n\nhr {\n  display: block;\n  background: #bfc1c3;\n  border: 0;\n  height: 1px;\n  margin-top: 30px;\n  margin-bottom: 30px;\n  padding: 0; }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n#content {\n  max-width: 960px;\n  margin: 0 15px; }\n  @media (min-width: 641px) {\n    #content {\n      margin: 0 30px; } }\n  @media (min-width: 1020px) {\n    #content {\n      margin: 0 auto; } }\n\n.grid-row, #global-breadcrumb {\n  margin: 0 -15px; }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n.example-highlight-grid .grid-row {\n  background: #bfc1c3; }\n\n.example-highlight-grid .column-highlight {\n  background: #dee0e2;\n  width: 100%; }\n\n.visuallyhidden {\n  position: absolute;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  height: 1px;\n  width: 1px;\n  margin: -1px;\n  padding: 0;\n  border: 0; }\n\n.js-enabled .js-hidden {\n  display: none; }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n#content {\n  max-width: 960px;\n  margin: 0 15px; }\n  @media (min-width: 641px) {\n    #content {\n      margin: 0 30px; } }\n  @media (min-width: 1020px) {\n    #content {\n      margin: 0 auto; } }\n\n.grid-row, #global-breadcrumb {\n  margin: 0 -15px; }\n\n#content {\n  padding-bottom: 30px; }\n  @media (min-width: 769px) {\n    #content {\n      padding-bottom: 90px; } }\n\n.phase-banner {\n  padding: 10px 0 8px;\n  border-bottom: 1px solid #bfc1c3; }\n  @media (min-width: 641px) {\n    .phase-banner {\n      padding-bottom: 10px; } }\n  .phase-banner p {\n    display: table;\n    margin: 0;\n    color: #000;\n    font-family: \"nta\", Arial, sans-serif;\n    font-weight: 400;\n    text-transform: none;\n    font-size: 14px;\n    line-height: 1.14286; }\n    @media (min-width: 641px) {\n      .phase-banner p {\n        font-size: 16px;\n        line-height: 1.25; } }\n  .phase-banner .phase-tag {\n    display: -moz-inline-stack;\n    display: inline-block;\n    margin: 0 8px 0 0;\n    padding: 2px 5px 0;\n    font-family: \"nta\", Arial, sans-serif;\n    font-weight: 700;\n    text-transform: none;\n    font-size: 14px;\n    line-height: 1.14286;\n    text-transform: uppercase;\n    letter-spacing: 1px;\n    text-decoration: none;\n    color: #fff;\n    background-color: #005ea5; }\n    @media (min-width: 641px) {\n      .phase-banner .phase-tag {\n        font-size: 16px;\n        line-height: 1.25; } }\n  .phase-banner span {\n    display: table-cell;\n    vertical-align: baseline; }\n\n.column-quarter {\n  padding: 0 15px;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n  @media (min-width: 641px) {\n    .column-quarter {\n      float: left;\n      width: 25%; } }\n\n.column-half {\n  padding: 0 15px;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n  @media (min-width: 641px) {\n    .column-half {\n      float: left;\n      width: 50%; } }\n\n.column-third {\n  padding: 0 15px;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n  @media (min-width: 641px) {\n    .column-third {\n      float: left;\n      width: 33.33333%; } }\n\n.column-two-thirds {\n  padding: 0 15px;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n  @media (min-width: 641px) {\n    .column-two-thirds {\n      float: left;\n      width: 66.66667%; } }\n\n#global-breadcrumb ol {\n  padding: 0 15px;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  padding-top: 0.75em;\n  padding-bottom: 0.75em; }\n  @media (min-width: 641px) {\n    #global-breadcrumb ol {\n      float: left;\n      width: 100%; } }\n  #global-breadcrumb ol li {\n    font-family: \"nta\", Arial, sans-serif;\n    font-weight: 400;\n    text-transform: none;\n    font-size: 14px;\n    line-height: 1.14286;\n    float: left;\n    background-image: url(\"/public/images/separator.png\");\n    background-position: 100% 50%;\n    background-repeat: no-repeat;\n    list-style: none;\n    margin-right: 0.5em;\n    margin-bottom: 0.4em;\n    margin-left: 0;\n    padding-right: 1em; }\n    @media (min-width: 641px) {\n      #global-breadcrumb ol li {\n        font-size: 16px;\n        line-height: 1.25; } }\n    @media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 20 / 10), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {\n      #global-breadcrumb ol li {\n        background-image: url(\"/public/images/separator-2x.png\");\n        background-size: 6px 11px; } }\n    #global-breadcrumb ol li a {\n      color: #0b0c0c; }\n    #global-breadcrumb ol li strong {\n      font-weight: normal; }\n    #global-breadcrumb ol li:last-child {\n      background-image: none;\n      margin-right: 0; }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n.example-highlight-grid .grid-row {\n  background: #bfc1c3; }\n\n.example-highlight-grid .column-highlight {\n  background: #dee0e2;\n  width: 100%; }\n\n.visuallyhidden {\n  position: absolute;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  height: 1px;\n  width: 1px;\n  margin: -1px;\n  padding: 0;\n  border: 0; }\n\n.js-enabled .js-hidden {\n  display: none; }\n\nfieldset {\n  width: 100%; }\n\ntextarea {\n  display: block; }\n\n.form-group {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  float: left;\n  width: 100%;\n  margin-bottom: 15px; }\n  @media (min-width: 641px) {\n    .form-group {\n      margin-bottom: 30px; } }\n\n.form-group-related {\n  margin-bottom: 10px; }\n  @media (min-width: 641px) {\n    .form-group-related {\n      margin-bottom: 20px; } }\n\n.form-group-compound {\n  margin-bottom: 10px; }\n\n.form-label,\n.form-label-bold {\n  display: block;\n  color: #0b0c0c; }\n\n.form-label {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25; }\n  @media (min-width: 641px) {\n    .form-label {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\n.form-label-bold {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25; }\n  @media (min-width: 641px) {\n    .form-label-bold {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\nlegend .form-label,\nlegend .form-label-bold {\n  padding-bottom: 7px; }\n\n.error legend .form-label,\n.error legend .form-label-bold {\n  padding-bottom: 0; }\n\n.form-block {\n  float: left;\n  width: 100%;\n  margin-top: -5px;\n  margin-bottom: 5px; }\n  @media (min-width: 641px) {\n    .form-block {\n      margin-top: 0;\n      margin-bottom: 10px; } }\n\n.form-hint {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25;\n  display: block;\n  color: #6f777b;\n  font-weight: normal;\n  margin-bottom: 5px; }\n  @media (min-width: 641px) {\n    .form-hint {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\n.form-control {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25;\n  width: 100%;\n  padding: 4px;\n  background-color: #fff;\n  border: 2px solid #6f777b; }\n  @media (min-width: 641px) {\n    .form-control {\n      font-size: 19px;\n      line-height: 1.31579; } }\n  @media (min-width: 641px) {\n    .form-control {\n      width: 50%; } }\n\n.form-radio {\n  display: block;\n  margin: 10px 0; }\n  .form-radio input {\n    vertical-align: middle;\n    margin: -4px 5px 0 0; }\n\n.form-checkbox {\n  display: block;\n  margin: 15px 0; }\n  .form-checkbox input {\n    vertical-align: middle;\n    margin: -2px 5px 0 0; }\n\n.form-control-3-4 {\n  width: 100%; }\n  @media (min-width: 641px) {\n    .form-control-3-4 {\n      width: 75%; } }\n\n.form-control-2-3 {\n  width: 100%; }\n  @media (min-width: 641px) {\n    .form-control-2-3 {\n      width: 66.66%; } }\n\n.form-control-1-2 {\n  width: 100%; }\n  @media (min-width: 641px) {\n    .form-control-1-2 {\n      width: 50%; } }\n\n.form-control-1-3 {\n  width: 100%; }\n  @media (min-width: 641px) {\n    .form-control-1-3 {\n      width: 33.33%; } }\n\n.form-control-1-4 {\n  width: 100%; }\n  @media (min-width: 641px) {\n    .form-control-1-4 {\n      width: 25%; } }\n\n.form-control-1-8 {\n  width: 100%; }\n  @media (min-width: 641px) {\n    .form-control-1-8 {\n      width: 12.5%; } }\n\n.error {\n  margin-right: 15px; }\n  .error .error-message {\n    color: #b10e1e;\n    font-weight: bold; }\n  .error .form-control {\n    border: 4px solid #b10e1e; }\n  .error .form-hint {\n    margin-bottom: 0; }\n\n.error,\n.error-summary {\n  border-left: 4px solid #b10e1e;\n  padding-left: 10px; }\n  @media (min-width: 641px) {\n    .error,\n    .error-summary {\n      border-left: 5px solid #b10e1e;\n      padding-left: 15px; } }\n\n.error-message {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 400;\n  text-transform: none;\n  font-size: 16px;\n  line-height: 1.25;\n  display: block;\n  clear: both;\n  margin: 0;\n  padding: 5px 0 7px 0; }\n  @media (min-width: 641px) {\n    .error-message {\n      font-size: 19px;\n      line-height: 1.31579; } }\n\n.error-summary {\n  border: 4px solid #b10e1e;\n  margin-top: 15px;\n  margin-bottom: 15px;\n  padding: 15px 10px; }\n  @media (min-width: 641px) {\n    .error-summary {\n      border: 5px solid #b10e1e;\n      margin-top: 30px;\n      margin-bottom: 30px;\n      padding: 20px 15px 15px 15px; } }\n  .error-summary:focus {\n    outline: 3px solid #ffbf47; }\n  .error-summary .error-summary-heading {\n    margin-top: 0; }\n  .error-summary p {\n    margin-bottom: 10px; }\n  .error-summary .error-summary-list {\n    padding-left: 0; }\n    @media (min-width: 641px) {\n      .error-summary .error-summary-list li {\n        margin-bottom: 5px; } }\n    .error-summary .error-summary-list a {\n      color: #b10e1e;\n      font-weight: bold;\n      text-decoration: underline; }\n\ninput::-webkit-outer-spin-button,\ninput::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0; }\n\ninput[type=number] {\n  -moz-appearance: textfield; }\n\n.form-date .form-group {\n  float: left;\n  width: 50px;\n  margin-right: 20px;\n  margin-bottom: 0;\n  clear: none; }\n  .form-date .form-group label {\n    display: block;\n    margin-bottom: 5px; }\n  .form-date .form-group input {\n    width: 100%; }\n\n.form-date .form-group-year {\n  width: 70px; }\n\n.block-label {\n  display: block;\n  float: none;\n  clear: left;\n  position: relative;\n  background: #dee0e2;\n  border: 1px solid #dee0e2;\n  padding: 18px 30px 15px 54px;\n  margin-bottom: 10px;\n  cursor: pointer; }\n  @media (min-width: 641px) {\n    .block-label {\n      float: left; } }\n  .block-label input {\n    position: absolute;\n    top: 15px;\n    left: 15px;\n    cursor: pointer;\n    margin: 0;\n    width: 29px;\n    height: 29px; }\n  .block-label:hover {\n    border-color: #0b0c0c; }\n\n.block-label:last-child {\n  margin-bottom: 0; }\n\n.inline .block-label {\n  clear: none;\n  margin-right: 10px; }\n\n.js-enabled label.selected {\n  background: #fff;\n  border-color: #0b0c0c; }\n\n.js-enabled label.focused {\n  outline: 3px solid #ffbf47; }\n\n.js-enabled .focused input:focus {\n  outline: none; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n  width: 100%; }\n  table th,\n  table td {\n    font-family: \"nta\", Arial, sans-serif;\n    font-weight: 400;\n    text-transform: none;\n    font-size: 14px;\n    line-height: 1.14286;\n    padding: 0.75em 1.25em 0.5625em 0;\n    text-align: left;\n    color: #0b0c0c;\n    border-bottom: 1px solid #bfc1c3; }\n    @media (min-width: 641px) {\n      table th,\n      table td {\n        font-size: 16px;\n        line-height: 1.25; } }\n  table th {\n    font-weight: 700; }\n    table th.numeric {\n      text-align: right; }\n  table td.numeric {\n    font-family: \"ntatabularnumbers\", \"nta\", Arial, sans-serif;\n    font-weight: 400;\n    text-transform: none;\n    font-size: 14px;\n    line-height: 1.14286;\n    text-align: right; }\n    @media (min-width: 641px) {\n      table td.numeric {\n        font-size: 16px;\n        line-height: 1.25; } }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n.button {\n  background-color: #00823b;\n  position: relative;\n  display: -moz-inline-stack;\n  display: inline-block;\n  padding: .526315em .789473em .263157em;\n  border: none;\n  -webkit-border-radius: 0;\n  -moz-border-radius: 0;\n  border-radius: 0;\n  outline: 1px solid transparent;\n  outline-offset: -1px;\n  -webkit-appearance: none;\n  -webkit-box-shadow: 0 2px 0 #003618;\n  -moz-box-shadow: 0 2px 0 #003618;\n  box-shadow: 0 2px 0 #003618;\n  font-size: 1em;\n  line-height: 1.25;\n  text-decoration: none;\n  -webkit-font-smoothing: antialiased;\n  cursor: pointer;\n  color: #fff;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  margin: 0 15px 15px 0;\n  padding: 0.52632em 0.78947em 0.26316em 0.78947em;\n  vertical-align: top; }\n  .button:visited {\n    background-color: #00823b; }\n  .button:hover, .button:focus {\n    background-color: #00692f; }\n  .button:active {\n    top: 2px;\n    -webkit-box-shadow: 0 0 0 #00823b;\n    -moz-box-shadow: 0 0 0 #00823b;\n    box-shadow: 0 0 0 #00823b; }\n  .button.disabled, .button[disabled=\"disabled\"], .button[disabled] {\n    zoom: 1;\n    filter: alpha(opacity=50);\n    opacity: 0.5; }\n    .button.disabled:hover, .button[disabled=\"disabled\"]:hover, .button[disabled]:hover {\n      cursor: default;\n      background-color: #00823b; }\n    .button.disabled:active, .button[disabled=\"disabled\"]:active, .button[disabled]:active {\n      top: 0;\n      -webkit-box-shadow: 0 2px 0 #003618;\n      -moz-box-shadow: 0 2px 0 #003618;\n      box-shadow: 0 2px 0 #003618; }\n  .button:link, .button:hover, .button:focus, .button:visited {\n    color: #fff; }\n  .button:before {\n    content: \"\";\n    height: 110%;\n    width: 100%;\n    display: block;\n    background: transparent;\n    position: absolute;\n    top: 0;\n    left: 0; }\n  .button:active:before {\n    top: -10%;\n    height: 120%; }\n  @media (max-width: 640px) {\n    .button {\n      width: 100%; } }\n\n.button::-moz-focus-inner {\n  border: 0;\n  padding: 0; }\n\n.button:focus {\n  outline: 3px solid #ffbf47; }\n\n.button[disabled=\"disabled\"] {\n  background: #00823b; }\n\n.button[disabled=\"disabled\"]:focus {\n  outline: none; }\n\n.button-start,\n.button-get-started {\n  font-family: \"nta\", Arial, sans-serif;\n  font-weight: 700;\n  text-transform: none;\n  font-size: 18px;\n  line-height: 1.2;\n  background-image: url(\"/public/images/icons/icon-pointer.png\");\n  background-repeat: no-repeat;\n  background-position: 100% 50%;\n  padding: 0.36842em 2.15789em 0.21053em 0.84211em; }\n  @media (min-width: 641px) {\n    .button-start,\n    .button-get-started {\n      font-size: 24px;\n      line-height: 1.25; } }\n  @media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 20 / 10), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {\n    .button-start,\n    .button-get-started {\n      background-image: url(\"/public/images/icons/icon-pointer-2x.png\");\n      background-size: 30px 19px; } }\n\ndetails {\n  display: block; }\n  details summary {\n    display: inline-block;\n    color: #005ea5;\n    cursor: pointer;\n    position: relative;\n    margin-bottom: 0.26316em; }\n    details summary:hover {\n      color: #2b8cc4; }\n    details summary:focus {\n      outline: 3px solid #ffbf47; }\n  details .summary {\n    text-decoration: underline; }\n  details .arrow {\n    margin-right: .35em;\n    font-style: normal; }\n\nul,\nol {\n  list-style-type: none;\n  padding: 0; }\n\n.list-bullet {\n  list-style-type: disc;\n  padding-left: 20px; }\n\n.list-number {\n  list-style-type: decimal;\n  padding-left: 20px; }\n\n.list-bullet,\n.list-number {\n  margin-top: 5px;\n  margin-bottom: 20px; }\n\n.list-bullet li,\n.list-number li {\n  margin-bottom: 5px; }\n\n.grid-row:after, #global-breadcrumb:after, #content:after, fieldset:after, .form-group:after, .form-block:after, .panel-indent:after {\n  content: \"\";\n  display: block;\n  clear: both; }\n\n.example-highlight-grid .grid-row {\n  background: #bfc1c3; }\n\n.example-highlight-grid .column-highlight {\n  background: #dee0e2;\n  width: 100%; }\n\n.visuallyhidden {\n  position: absolute;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  height: 1px;\n  width: 1px;\n  margin: -1px;\n  padding: 0;\n  border: 0; }\n\n.js-enabled .js-hidden {\n  display: none; }\n\n.panel-indent {\n  clear: both;\n  border-left: 5px solid #bfc1c3;\n  padding: 0.78947em;\n  margin-bottom: 0.78947em; }\n  .panel-indent :first-child {\n    margin-top: 0; }\n  .panel-indent :only-child,\n  .panel-indent :last-child {\n    margin-bottom: 0; }\n\n.panel-indent-info {\n  border-left-width: 10px; }\n\n.form-group .panel-indent {\n  padding-bottom: 0; }\n\n.govuk-box-highlight {\n  margin: 1em 0 1em 0;\n  padding: 2em 0 1em 0;\n  color: #fff;\n  background: #28a197;\n  text-align: center; }\n\n/*\n  Layout stuff.\n*/\nhtml, body {\n  height: 100%;\n  margin: 0px;\n  padding: 0px;\n  overflow: hidden; }\n\n#content {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  margin-bottom: 0;\n  padding-bottom: 0;\n  max-width: none;\n  overflow: hidden;\n  background-color: #28a197;\n  margin: 0 auto; }\n  #content.phase-backlog {\n    background-color: #2e358b; }\n  #content.phase-discovery {\n    background-color: #912b88; }\n  #content.phase-alpha {\n    background-color: #d53880; }\n  #content.phase-beta {\n    background-color: #f47738; }\n  #content.phase-live {\n    background-color: #85994b; }\n\n#display {\n  position: absolute;\n  left: 50%;\n  top: 0;\n  transform: translate(-50%, 120px);\n  font-size: 42px;\n  color: white;\n  text-align: center;\n  width: 100%;\n  max-width: 960px;\n  margin: 0 auto; }\n\n/*\n  Header elements\n*/\n.top-left, .top-right {\n  position: absolute;\n  top: 30px;\n  color: white; }\n\n.top-left {\n  left: 30px;\n  font-size: 32px; }\n\n.top-right {\n  right: 30px; }\n\n/*\n  Typography\n*/\n.small-caps {\n  text-transform: uppercase;\n  letter-spacing: 0.25em;\n  font-weight: 700; }\n\n.name {\n  font-size: 64px;\n  font-weight: 700;\n  margin-bottom: 20px; }\n\n.desc {\n  font-size: 32px; }\n\n.theme {\n  font-size: 24px; }\n\n.location {\n  font-size: 24px;\n  margin-bottom: 10px;\n  padding-bottom: 30px; }\n  .location:after {\n    content: '';\n    display: block;\n    width: 33%;\n    margin-left: 50%;\n    transform: translate(-50%, 0);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.42);\n    margin-top: 30px; }\n\n.phase-box {\n  position: absolute;\n  right: 30px;\n  bottom: 30px;\n  padding: 10px 20px;\n  text-align: right;\n  color: white; }\n\n.phase {\n  margin: 0;\n  font-size: 36px; }\n\n.phase-date {\n  font-size: 14px;\n  margin-bottom: 0; }\n\n/*\n  Timer element\n*/\n.timer {\n  position: absolute;\n  left: 0;\n  bottom: 10px;\n  background-color: #1e7871;\n  width: 0%;\n  height: 10px; }\n\n/*\n  Key stuff\n*/\n.count {\n  color: white;\n  padding-left: 5px; }\n\n.key {\n  position: absolute;\n  left: 30px;\n  bottom: 30px;\n  width: 200px; }\n\n.key-block {\n  float: left;\n  margin: 5px 5px; }\n  .key-block a {\n    display: block;\n    width: 20px;\n    height: 20px;\n    background-color: rgba(0, 0, 0, 0.42); }\n  .key-block.chosen a {\n    background-color: rgba(255, 255, 255, 0.62); }\n\n.txt-right {\n  text-align: right; }\n\n.small {\n  font-size: 14px; }\n", ""]);

// exports


/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(0)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js??ref--0-2!./display.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js??ref--0-2!./display.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ })
/******/ ]);
/*! (c) 2017 Andrea Giammarchi (ISC) */
var EventTarget=function(){"use strict";var t="object"==typeof global?global:self,e=[].findIndex||function(t,e){for(var n=this.length;n--;)if(t.call(e,this[n]))return n;return n},n=Object.defineProperty,r="__event-target__"+Math.random(),i=t.WeakMap||function(){return{get:function(t){return t[r]},set:function(t,e){n(t,r,{configurable:!0,value:e})}}},a=t.EventTarget;try{new a}catch(o){a=function(){function t(){}function r(t){var e=t.options;e&&e.once&&u.call(t.target,this.type,t.listener,t.options),"function"==typeof t.listener?t.listener.call(t.target,this):t.listener.handleEvent(this)}function a(t){return this===t.listener}function o(t,n,r){var i=f(this),o=i[t]||(i[t]=[]);e.call(o,a,n)<0&&o.push({target:this,listener:n,options:r})}function c(t){var e=f(this),n=e[t.type];return n&&(h(t,{currentTarget:this,target:this}),n.forEach(r,t),delete t.currentTarget,delete t.target),!0}function u(t,n,r){var i=f(this),o=i[t];if(o){var c=e.call(o,a,n);-1<c&&o.splice(c,1)}}function l(){}var s=new i,f=function(t){return s.get(t)||v(t)},v=function(t){var e=new l;return s.set(t,e),e},h=function(t,e){for(var r in e)n(t,r,{configurable:!0,value:e[r]})};return h(t.prototype,{addEventListener:o,dispatchEvent:c,removeEventListener:u}),l.prototype=Object.create(null),t}()}return a}();
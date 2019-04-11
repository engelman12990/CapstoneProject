// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"map.js":[function(require,module,exports) {
mapboxgl.accessToken = 'pk.eyJ1IjoibWFjYW5pY2EiLCJhIjoiY2p0cDkyY3J6MDI4MTN5cGx0dXhtNXpyaCJ9.3OVQDTl8MJQ2HkywQgSV5w';
mapboxgl.Marker(); // This adds the map to your page

var map = new mapboxgl.Map({
  // container id specified in the HTML
  'container': 'map',
  // style URL
  'style': 'mapbox://styles/mapbox/light-v10',
  // initial position in [lon, lat] format
  'center': [-98.5, 39.50],
  // initial zoom
  'zoom': 2.00
}); // when the map loads, add the source of parks on the map & the sidebar

map.on('load', function (e) {
  // Add the data to your map as a layer
  map.addSource('places', {
    'type': 'geojson',
    'data': parks
  });
  buildLocationList(parks);
}); // currentFeature= placeholder for something we will pass in later

function flyToStore(currentFeature) {
  map.flyTo({
    'center': currentFeature.geometry.coordinates,
    'zoom': 6
  });
}

function buildLocationList(data) {
  // Select the listing container in the HTML and append a div
  // with the class 'item' for each park
  var listings = document.getElementById('listings'); // Iterate through the list of parks

  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i]; // Shorten data.feature.properties to `prop` so we're not
    // writing this long form over and over again.

    var prop = currentFeature.properties;
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = 'listing-' + i; // Create a new link with the class 'title' for each park
    // and fill it with the park info
    // creates an a tag and puts it inside the listing div

    var link = listing.appendChild(document.createElement('a')); // the # creates a link that goes nowhere - just for the map to use

    link.href = '#';
    link.className = 'title';
    link.dataPosition = i; // inside of the a tag will contain the display name

    link.innerHTML = prop.displayName; // Add an event listener for the links in the sidebar listing

    link.addEventListener('click', function (e) {
      // Update the currentFeature to the park associated with the clicked link
      var clickedListing = data.features[this.dataPosition]; // 1. Fly to the point associated with the clicked link

      flyToStore(clickedListing); // 2. Close all other popups and display popup for clicked park

      createPopUp(clickedListing); // 3. Highlight listing in sidebar (and remove highlight for all other listings)

      var activeItem = document.getElementsByClassName('active');

      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }

      if (this.parentNode) {
        this.parentNode.classList.add('active');
      }
    }); // Create a new div with the class 'details' for each park
    // and fill it with the city and phone number

    var details = listing.appendChild(document.createElement('div')); // populating the div with info about the park

    if (prop.city) {
      details.innerHTML += prop.city + ', ' + prop.state;
    }

    if (prop.maxRvSize) {
      details.innerHTML += '<br>Max Size Limit: ' + '<span class="maxaRvSize">' + prop.maxRvSize + '</span>' + ' Feet';
    }

    if (prop.phone) {
      details.innerHTML += '<br>Phone: ' + prop.phoneFormatted;
    }

    parks.features.forEach(function (marker) {
      // Create a div element for the marker
      var el = document.createElement('div'); // Add a class called 'marker' to each div

      el.className = 'marker';
      el.addEventListener('click', function (e) {
        var activeItem = document.getElementsByClassName('active'); // 1. Fly to the point

        flyToStore(marker); // 2. Close all other popups and display popup for clicked park

        createPopUp(marker); // 3. Highlight listing in sidebar (and remove highlight for all other listings)

        e.stopPropagation();

        if (activeItem[0]) {
          // if there is one that is already active, it will remove it as being active
          activeItem[0].classList.remove('active');
        }

        var listing = document.getElementById('listing-' + i);

        if (listing) {
          listing.classList.add('active');
        }
      }); // By default the image for the custom marker will be anchored
      // by its center.
      // Create the custom markers, set their position, and add to map

      new mapboxgl.Marker(el, {
        'offset': [0, -23]
      }).setLngLat(marker.geometry.coordinates).addTo(map);
    });
  }
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup'); // Check if there is already a popup on the map and if so, remove it

  if (popUps[0]) {
    popUps[0].remove();
  } // mapboxg1.Popup = mapbox function to create a pop up


  var popup = new mapboxgl.Popup({
    'closeOnClick': true
  }).setLngLat(currentFeature.geometry.coordinates).setHTML('<h3>Park Information</h3>' + '<h4>' + currentFeature.properties.displayName + '<br>' + currentFeature.properties.city + ', ' + currentFeature.properties.state + '<br>Max RV Size: ' + currentFeature.properties.maxRvSize + ' feet' + '<br>Phone:' + currentFeature.properties.phoneFormatted + '</h4>').addTo(map);
} // This will let you use the .remove() function later on


if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

function maxSize() {
  var input = document.getElementById('RigSize').value;
  var inputInt = parseInt(input, 10);
  var i; // maxSize is grabbing all the elements inside of the ID 'listings' and then grabbing the spans that
  // have a class of maxaRvSize which should hold all the max RV sizes for the parks, sorting the RV sizes
  // future feature - sort marker icon

  var maxSize = document.getElementById('listings').querySelectorAll('.maxaRvSize');

  for (i = 0; i < maxSize.length; i++) {
    // to evaluate nums instead of strings, parseInt
    var maxInt = parseInt(maxSize[i].innerHTML, 10);

    if (maxInt >= inputInt || input === '' || isNaN(input)) {
      maxSize[i].parentNode.parentNode.style.display = 'block';
    } else {
      maxSize[i].parentNode.parentNode.style.display = 'none';
    }
  }
}

var searchInput = document.getElementById('RigSize');
searchInput.addEventListener('keydown', function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});
var findPark = document.getElementById('findPark'); // when you click the button, it runs the maxSize function

findPark.addEventListener('click', function (event) {
  maxSize();
});
},{}],"../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62418" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","map.js"], null)
//# sourceMappingURL=/map.27237bf4.map
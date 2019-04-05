mapboxgl.accessToken = 'pk.eyJ1IjoibWFjYW5pY2EiLCJhIjoiY2p0cDkyY3J6MDI4MTN5cGx0dXhtNXpyaCJ9.3OVQDTl8MJQ2HkywQgSV5w';
mapboxgl.Marker();
// This adds the map to your page
var map = new mapboxgl.Map({
    // container id specified in the HTML
    'container': 'map',
    // style URL
    'style': 'mapbox://styles/mapbox/light-v10',
    // initial position in [lon, lat] format
    'center': [ -77.034084, 38.909671 ],
    // initial zoom
    'zoom': 2.75
});


map.on('load', function(e){
    // Add the data to your map as a layer
    map.addSource('places', {
        'type': 'geojson',
        'data': parks
    });
    buildLocationList(parks);
});


function flyToStore(currentFeature){
    map.flyTo({
        'center': currentFeature.geometry.coordinates,
        'zoom': 6
    });
}

function buildLocationList(data){
    // Select the listing container in the HTML and append a div
    // with the class 'item' for each store
    var listings = document.getElementById('listings');

   
    // Iterate through the list of parks
    for(i = 0; i < data.features.length; i++){
        var currentFeature = data.features[i];

     
        // Shorten data.feature.properties to `prop` so we're not
        // writing this long form over and over again.
        var prop = currentFeature.properties;

        var listing = listings.appendChild(document.createElement('div'));

        listing.className = 'item';
        listing.id = 'listing-' + i;

        // Create a new link with the class 'title' for each store
        // and fill it with the store address
        var link = listing.appendChild(document.createElement('a'));

        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.displayName;
        // Add an event listener for the links in the sidebar listing
        link.addEventListener('click', function(e){
            // Update the currentFeature to the store associated with the clicked link
            var clickedListing = data.features[this.dataPosition];
            // 1. Fly to the point associated with the clicked link

            flyToStore(clickedListing);
            // 2. Close all other popups and display popup for clicked store
            createPopUp(clickedListing);
            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');

            if(activeItem[0]){
                activeItem[0].classList.remove('active');
            }
            if(this.parentNode){
                this.parentNode.classList.add('active');
            }
        });

        // Create a new div with the class 'details' for each store
        // and fill it with the city and phone number
        var details = listing.appendChild(document.createElement('div'));

        if(prop.maxRvSize){
            details.innerHTML += 'Max Size Limit: ' + '<span class="maxaRvSize">' + prop.maxRvSize + '</span>' + ' Feet';
        }
        if(prop.phone){
            details.innerHTML += '<br>Phone: ' + prop.phoneFormatted;
        }

        parks.features.forEach(function(marker){
            // Create a div element for the marker
            var el = document.createElement('div');
            // Add a class called 'marker' to each div

            el.className = 'marker';
            el.addEventListener('click', function(e){
                var activeItem = document.getElementsByClassName('active');
                // 1. Fly to the point

                flyToStore(marker);
                // 2. Close all other popups and display popup for clicked store
                createPopUp(marker);
                // 3. Highlight listing in sidebar (and remove highlight for all other listings)
                e.stopPropagation();
                if(activeItem[0]){
                    activeItem[0].classList.remove('active');
                }
                var listing = document.getElementById('listing-' + i);

               
                if(listing){
                    listing.classList.add('active');
                }
            });
            // By default the image for your custom marker will be anchored
            // by its center. Adjust the position accordingly
            // Create the custom markers, set their position, and add to map
            new mapboxgl.Marker(el, { 'offset': [ 0, -23 ] })
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
        });
    }
}

function createPopUp(currentFeature){
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it

    if(popUps[0]){
        popUps[0].remove();
    }

    var popup = new mapboxgl.Popup({ 'closeOnClick': false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h3>Park Information</h3>' +
      '<h4>' + currentFeature.properties.displayName + '<br>Max RV Size: ' + currentFeature.properties.maxRvSize + ' feet' + '<br>Phone:' + currentFeature.properties.phoneFormatted + '</h4>')
        .addTo(map);
}

// This will let you use the .remove() function later on
if(!('remove' in Element.prototype)){
    Element.prototype.remove = function(){
        if(this.parentNode){
            this.parentNode.removeChild(this);
        }
    };
}

function maxSize(){
    var input = document.getElementById('RigSize').value;
    var inputInt = parseInt(input, 10);

    var i;
    var maxSize = document.getElementById('listings').querySelectorAll('.maxaRvSize');

    for(i = 0; i < maxSize.length; i++){
        var maxInt = parseInt(maxSize[i].innerHTML, 10);

        if(maxInt >= inputInt || input === '' || isNaN(input)){
            maxSize[i].parentNode.parentNode.style.display = 'block';
        }
        else{
            maxSize[i].parentNode.parentNode.style.display = 'none';
        }
    }
}

var searchInput = document.getElementById('RigSize');

searchInput.addEventListener('keydown', function(event){
    if(event.keyCode === 13){
        event.preventDefault();
    }
});

var findPark = document.getElementById('findPark');

findPark.addEventListener('click', function(event){
    maxSize();
});
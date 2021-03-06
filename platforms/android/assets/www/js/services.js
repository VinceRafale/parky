angular.module('parky.services', ['firebase'])

.factory('Auth', ['$rootScope', '$location', 'angularFireAuth', function($rootScope, $location, angularFireAuth){

  var ref = new Firebase('https://parkyy.firebaseio.com');    
  angularFireAuth.initialize(ref, {
    scope: $rootScope,
    name: 'user',
    path: '/',
    callback: function(err, user){
      if (err) $rootScope.error = err;
      else if (user){
         $location.path('/map');
      }
    }
  });

  return {
    login: function(email, password){
      return angularFireAuth.login('password', {
        email: email,
        password: password
      });
    },

    logout: function(){
      return angularFireAuth.logout();
    },

    signup: function(email, password){
      angularFireAuth.createUser(email, password, function(err, user){
        if (err) $rootScope.error = err;
      });
    }
  }
}])

.service('Location', function($rootScope, $q){

  var watchId;

  this.getLocation = function(){
    var defer = $q.defer();

    console.log('getting location');
    navigator.geolocation.getCurrentPosition(
      function(position) {
        console.log('get location success');
        defer.resolve(position);
      },
      function(error) {
        console.log('get location fail');
        defer.reject(error);
      },
      { enableHighAccuracy: true, timeout: 3000 }
    );

    return defer.promise;
  };

  
  this.startTracking = function(){
    watchId = navigator.geolocation.watchPosition(
      function(pos){
        $rootScope.$broadcast("locationChange", {
          coords: pos.coords
        });
      },
      function(error){
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
  }

})

.service('Map', function(){

  var _map;
  var userMarker;

  this.setMap = function(map){
    _map = map;
  };

  this.getMap = function(){
    return _map;
  }

  this.setUserLocation = function(lat, lon){
    userMarker = new google.maps.Marker({
      clickable: false,
      position: new google.maps.LatLng(lat, lon), 
      icon: {
        url: 'http://maps.gstatic.com/mapfiles/mobile/mobileimgs1.png',
        size: new google.maps.Size(22, 22),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,11) 
      },
      map: _map,
    });
    this.currentCoords = {latitude: lat, longitude: lon};
  }

  this.updateUserLocation = function(lat, lon){
    if (!_map) return;
    userMarker = new google.maps.Marker({
      clickable: false,
      position: new google.maps.LatLng(lat, lon), 
      icon: {
        url: 'http://maps.gstatic.com/mapfiles/mobile/mobileimgs1.png',
        size: new google.maps.Size(22, 22),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,11) 
      },
      map: _map,
    }); 
    this.currentCoords = {latitude: lat, longitude: lon};
  }

})

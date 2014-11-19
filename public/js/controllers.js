/**
 * Created by jeremyt on 10/10/14.
 */

nbrAppControllers.controller("NavCtrl", function ($scope, $location, $timeout, $mdSidenav, NbrService, NbrUtils) {

        /*
            scope variables
         */
        $scope.menuSelectedIndex = 0;
        $scope.menuButtonObject = [
            {label: 'Main', target: '#/', disabled: false},
            {label: 'Multihero', target: '#/hero', disabled: false},
            {label: 'President finder', target: '#/where', disabled: false},
            {label: 'About', target: '#/about', disabled: true}
        ];
        $scope.allseasons = [];
        $scope.currentSeason = null;

        initNav();
        function initNav() {
            /*
                let's get all seasons and current season at the top level controller
             */
            var d = new Date();
            var thisyear = d.getFullYear();

            console.log('--> this year: '+thisyear);
            var allseasonsPromise = NbrService.getAllSeasons();
            allseasonsPromise.success(function(data) {
                console.log('--> number of seasons: '+data.length);

                /*
                    seasons get ordered from newest to oldest
                 */
                $scope.allseasons = data.sort(NbrUtils.sortSeasonArray).reverse();
                $scope.currentSeason = $scope.allseasons[0];

                console.log('--> current season: '+$scope.currentSeason.label);
            });

        };

        /*
            listener for menu change events
         */
        $scope.$on('MENU_CHANGED', function (event, ind) {
            $scope.menuSelectedIndex = ind;
        });

        /*
            toggle open side-menu
        */
        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };

        $scope.close = function() {
            $mdSidenav('left').close();
        };
    }
);


nbrAppControllers.controller("MainCtrl", function ($scope, $rootScope, $location, $window, $timeout, $mdSidenav, NbrService, NbrUtils) {

        /*
            on activate, fires MENU_CHANGED with correct index
         */
        $rootScope.$broadcast('MENU_CHANGED', 0);

        /*
            scope variables
         */
        $scope.footerText = "main";
        $scope.racers = [];
        $scope.competitions = [];

        /*
            trophy color based on position
         */
        $scope.getTrophyColor = function(position) {
            return NbrUtils.getTrophyColor(position);
        };

        /*
            return correct class if competition date is over
         */
        $scope.getCompetitionStatus = function(dateString) {
            var momentDate = moment(dateString);
            var momentNow = moment();

            if(momentNow.diff(momentDate) > 0) {
                return 'competitionCompleted';
            }
            else {
                return '';
            }
        };

        /*
            navigate to hero page
         */
        $scope.gotoHero = function() {
            $window.location.href = $scope.menuButtonObject[1].target;
        };

        /*
            return a pretty date
         */
        $scope.getFormattedDate = function(dateString) {
            return NbrUtils.prettyFormatFullDate(dateString);
        };

        initMain();
        function initMain() {

            var heroPromise = NbrService.getHeroWithSeasonId($scope.currentSeason._id);
            heroPromise.success(function(data) {
                console.log('--> this years hero: '+data._id);
                $scope.competitions = (data.competitions).sort(NbrUtils.sortCompetitionArray);
                console.log('--> nbr competitions : '+$scope.competitions.length);
            });

            var podiumPromise = NbrService.getRacerPodiumWithSeasonId($scope.currentSeason._id);
            podiumPromise.success(function(data) {
                $scope.racers = data;
            });

        };
    }
);

nbrAppControllers.controller("HeroCtrl", function ($scope, $rootScope, $location, $timeout, $mdSidenav, NbrService, NbrUtils) {
        /*
            on activate, fires MENU_CHANGED with correct index
         */
        $rootScope.$broadcast('MENU_CHANGED', 1);

        /*
            scope variables
         */
        $scope.footerText = "hero";
        $scope.selectedIndex = 0;
        $scope.racers = [];
        $scope.lastSelectedRacer = {};
        $scope.selectedUserResults = [];

        /*
         trophy color based on position
         */
        $scope.getTrophyColor = function(position) {
            return NbrUtils.getTrophyColor(position);
        };

        /*
            refresh the racers based on the tab clicked
         */
        $scope.announceSelected = function(ind) {
            initHero(ind);
        };

        /*
            return correct class for racer
         */
        $scope.getRacerStyle = function(racer) {
            if(racer.selected) {
                return 'racerItemSelect';
            }
            else {
                return 'racerItem';
            }
        };

        /*
            sets the current selected racer (unsets previous one)
         */
        $scope.changeSelected = function(racer) {
            $scope.lastSelectedRacer.selected = false;
            $scope.lastSelectedRacer = racer;
            $scope.lastSelectedRacer.selected = true;
            getRacerResults($scope.lastSelectedRacer);
        };


        function getRacerResults(racer) {
            var resultsServicePromises = [];

            racer.results.forEach(function(result) {
                resultsServicePromises.push(getResultObject(result))
            });

            Promise.all(resultsServicePromises).then(function(resultsArray) {
                console.log('--> successfully retrieved: '+resultsArray.length+' results');
                $scope.selectedUserResults = resultsArray.sort(NbrUtils.sortCompetitionArray);;
                $scope.$apply();
            }).catch(function(err) {
                console.log('heros all promise error: '+err);
            });
        };

        function getResultObject(result) {
            return new Promise(function(resolve, reject) {

                var service = NbrService.getResultWithId(result);
                service.success(function(retrievedResult) {
                    resolve(retrievedResult);
                });
                service.error(function(err) {
                    reject(err);
                });
            })
        };

        /*
            return a pretty date
         */
        $scope.getFormattedDate = function(dateString) {
            return NbrUtils.prettyFormatFullDate(dateString);
        };

        $scope.getFormattedTime = function(t) {
            var d = moment.duration(t, 'milliseconds');
            var hours = String(Math.floor(d.asHours()));
            var mins = String(Math.floor(d.asMinutes()) - hours * 60);
            var secs = String(Math.floor(d.asSeconds()) - hours * 60 - mins * 60);

            if(hours.length == 1 ) {
                hours = '0'+hours;
            }

            if(mins.length == 1) {
                mins = '0'+mins;
            }

            if(secs.length == 1) {
                secs = '0'+secs;
            }

            return hours + ":" + mins + ":" + secs ;
        };

        initHero($scope.selectedIndex);
        function initHero(ind) {

            var heroPromise = NbrService.getRacersWithSeasonId($scope.allseasons[ind]._id);
            heroPromise.success(function(data) {
                $scope.racers = data;
                console.log('--> nbr racers : '+$scope.racers.length);
            });

        };
    }
);

nbrAppControllers.controller("WhereCtrl", function ($scope, $rootScope, $window, $location, $timeout, $mdSidenav, NbrService, NbrUtils) {
    /*
     on activate, fires MENU_CHANGED with correct index
     */
    $rootScope.$broadcast('MENU_CHANGED', 2);

    /*
        variables
     */
    $scope.isRacerPresident = false;
    $scope.lastUpdated = null;
    $scope.distance = 'Calculating ...';

    var presMarker = null;
    var presIcon = 'img/pres.png';
    var presPos = null;
    var presInfowindow = new google.maps.InfoWindow();

    var racerMarker = null;
    var racerPos = new google.maps.LatLng(0,0);
    var racerInfowindow = new google.maps.InfoWindow();
    var gmap = null;
    var pollInterval = null;

    var geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    $scope.$on('mapInitialized', placeRelevantPOIsOnMap);

    //check for URL params: http://xxxx/xx?param
    var pars = $location.$$search;
    if(pars.president) {
        console.log('--> I am president');
        $scope.isRacerPresident = true;
    }


    function placeRelevantPOIsOnMap(event, map) {
        console.log('--> map initialised');
        gmap = map;
        /*
            let's place at least the president
         */
        NbrService.getPresidentCoordinates().success(function(data) {
            $scope.lastUpdated = moment(data.dat).fromNow();
            presPos = new google.maps.LatLng(data.lat, data.long);
            presMarker = new google.maps.Marker({position: presPos, map: gmap, icon: presIcon});
            google.maps.event.addListener(presMarker, 'click', (function(presMarker) {
                return function() {
                    presInfowindow.setContent('President');
                    presInfowindow.open(gmap, presMarker);
                }
            })(presMarker));

            /*
                if I am a simple racer, let's place a marker for me too
             */
            if(!$scope.isRacerPresident) {
                console.log('--> I am racer');
                racerMarker = new google.maps.Marker({position: racerPos, map: map});
                google.maps.event.addListener(racerMarker, 'click', (function(racerMarker) {
                    return function() {
                        racerInfowindow.setContent('Me');
                        racerInfowindow.open(gmap, racerMarker);
                    }
                })(racerMarker));
            }

            startTracking();
        });
    };

    function startTracking() {

        console.log('--> startTracking');
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log('--> starting getCurrentPosition');
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            if($scope.isRacerPresident) {              //if url contains param 'president'
                updatePresidentCoords(position.coords.latitude, position.coords.longitude, pos);
            }
            else {
                racerMarker.setPosition(pos);
                pollInterval = setInterval(getPresidentCoords, 15000);
            }
        }, showError, geoOptions);

        navigator.geolocation.watchPosition(function(position) {
            console.log('--> starting watchPosition');
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            if($scope.isRacerPresident) {              //if url contains param 'president'
                updatePresidentCoords(position.coords.latitude, position.coords.longitude, pos);
            }
            else {
                racerMarker.setPosition(pos);
                fitAllIn();
            }

        }, showError);

        function showError(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    console.log('--> User denied the request for Geolocation.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log('--> Location information is unavailable.');
                    break;
                case error.TIMEOUT:
                    console.log('--> The request to get user location timed out.');
                    break;
                case error.UNKNOWN_ERROR:
                    console.log('--> An unknown error occurred.');
                    break;
            }

            /*
                This is a bit of a fix. Case when switching back and forth between the "where" page, it happens that the geolocation does initialise correctly. After a timeout of
                10 sec, the page will be reloaded, thus forcing a geolocation init. Not pretty, but does the trick.
             */
            $window.location.reload();
        };
    };


    function fitAllIn() {
        var bounds = new google.maps.LatLngBounds();

        if (presMarker != null && racerMarker != null) {
            bounds.extend(presMarker.getPosition());
            bounds.extend(racerMarker.getPosition());
            gmap.fitBounds(bounds);

            $scope.distance = Math.floor(google.maps.geometry.spherical.computeDistanceBetween(presMarker.getPosition(), racerMarker.getPosition()));
        }
        else if(presMarker != null) {
            gmap.panTo(presMarker.getPosition());
        }
        else if(racerMarker != null) {
            gmap.panTo(racerMarker.getPosition());
        }
    };

    function getPresidentCoords() {
        console.log('--> fetching president position');
        NbrService.getPresidentCoordinates().success(function(data) {
            $scope.lastUpdated = moment(data.dat).fromNow();
            presPos = new google.maps.LatLng(data.lat, data.long);
            presMarker.setPosition(presPos);
            fitAllIn();
        });
    };

    function updatePresidentCoords(la, lo, pos) {
        console.log('--> updating president position');
        NbrService.updatePresidentCoordinates({lat: la, long: lo}).success(function() {
            presMarker.setPosition(pos);
            gmap.panTo(pos);
        });
    };
});
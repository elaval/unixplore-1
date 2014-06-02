'use strict';
/**
* @ngdoc object
* @name ngAnimate
* @description
*/
angular
  .module('fondecytApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'tide-angular',
    'underscore',
    'd3service'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/areas.html',
        controller: 'AreasController',
        controllerAs: 'controller'
      })
      .when('/areas', {
        templateUrl: 'views/areas.html',
        controller: 'AreasController',
        controllerAs: 'controller'
      })
      .otherwise({
        redirectTo: '/'
      });
  });


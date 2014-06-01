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
        templateUrl: 'views/carreras.html',
        controller: 'CarrerasController',
        controllerAs: 'carreras'
      })
      .when('/carreras', {
        templateUrl: 'views/carreras.html',
        controller: 'CarrerasController',
        controllerAs: 'carreras'
      })
      .when('/cursos', {
        templateUrl: 'views/cursos.html',
        controller: 'CursosController',
        controllerAs: 'cursos'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

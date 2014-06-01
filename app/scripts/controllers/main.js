'use strict';
/**
 * @ngdoc overview
 * @name fondecytApp.module
 * @description
 * PUC Fondecyt data explorer.
 * Allows to explroe data from careers and courses, relating grades with use of digital platforms. 
 *
 */
angular.module('fondecytApp');

angular.module('fondecytApp')
.controller('HeaderController',function($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
});

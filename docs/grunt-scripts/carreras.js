'use strict';
/* jshint undef: true, unused: true */
/* global angular */




/**
 * @ngdoc controller
 * @name fondecytApp.controller:CarrerasController
 * @requires $scope
 * @requires fondecytApp.CarrerasDataService
 *
 * @property {array} colorOptions Array with options for colorAttributes
 * @property {string} colorAttribute Selected color attribute
 * @property {array} data Array with student data for the selected career & semester
 * @property {int} n Number of students in the selected data array
 * @property {int} maxCarreras Maximum number of carreras to be displayed when filtraTopCarreras is true
 * @property {array} semestres Array with the semesters options to be chosen
 * @property {string} selectedSemestre Selected semester for data selection
 * @property {string} psuValido Flag to select only data values with a valid psu score (prom_paa>0)
 * @property {string} loading Flag to show a "loading" message when its value is true
 * @description
 *
 * Controller for Carreras explorer
 *
 */
angular.module('fondecytApp')
.controller('CarrerasController', ['$scope','CarrerasDataService',function ($scope, dataService) {

  this.tooltipMessage = function(d) {
    var msg = '';
    msg += 'Genero: ' + d.genero + '<br>';
    msg += 'Dependencia: ' + d.dependencia + '<br>';
    msg += 'Actividades Aleph: '+d['actividades_aleph'] +'<br>';
    msg += 'Actividades EZProxy: '+d.actividades_ezproxy +'<br>';
    msg += 'Actividades Sakai: '+d.actividades_sakai +'<br>';
    msg += 'Promedio notas: '+d.prom_notas +'<br>';
    msg += 'Promedio PSU: '+d.prom_paa +'<br>';


    return msg;
  };

  // Opciones para categorización pro colores
  this.colorOptions = ['genero', 'dependencia', 'ano_ficha'];
  this.colorAttribute = 'genero';

  // Opciones de semestres
  this.semestres = ['2012 (I)','2012 (II)','2013 (I)'];
  this.selectedSemestre = '2013 (I)';


  // Data records (one record per student) & number of records
  this.allData = [];
  this.data = [];

  // Número de estudiantes en el data set
  this.n = null;

  // Cantidad de carreras para seleccionar (aquellas con más estudiantes)
  this.maxCarreras = 25;

  // Flag para filtrar carreras más numerosas
  this.filtraTopCarreras = true;

  // Lista de carreras
  this.carreras = [];

  // Filtrar datos por PSU
  this.psuValido = false;

  // Loading data - when true, display a message
  this.loading = false;
  
  /**
  * @ngdoc function
  * @name fondecytApp.CarrerasController:updateCarreras
  * @methodOf fondecytApp.controller:CarrerasController
  * @description 
  * Updates the list of valid careers to be displayed (this.carreras) acording to the option this.filtraTopCarreras.
  * If this.filtraTopCarreras is true, it will select a maximum of this.maxCarreras, if not it will display all careers. 
  * 
  * Once updated, will assign the first career to this.selectedCarrera.
  */
  this.updateCarreras = function() {
    var maxCarreras =  this.filtraTopCarreras ? this.maxCarreras : "";
    this.loading = true;
    dataService.carreras(maxCarreras).then(function(carreras) {
      this.loading = false;
      this.carreras = carreras;
      this.selectedCarrera = this.carreras[0].name;
      this.updateStudentData();
    }.bind(this));
  };

  
  /**
  * @ngdoc function
  * @name fondecytApp.CarrerasController:updateStudentData
  * @methodOf fondecytApp.controller:CarrerasController
  * @description 
  * Updates data for the selected carrera & semestre 
  */
  this.updateStudentData = function() {
    this.loading = true;
    dataService.estudiantesPorCarrera({'semestre': this.selectedSemestre, 'carrera': this.selectedCarrera, 'psuValido':this.psuValido}).then(function(data) {
      this.loading = false;
      this.allData = data;
      this.data = data;
      this.n = this.data.length;
    }.bind(this));
  };


  // Initial loading of carreras & student data
  this.updateCarreras();


}]);


/**
 * @ngdoc service
 * @name fondecytApp.CarrerasDataService
 * @requires $q
 * @requires d3
 * @requires _
 *
 * @description
 * Manages data corresponidng to carreras at PUC
 *
 */
angular.module('fondecytApp')
.service('CarrerasDataService',['$q', 'd3', '_',function($q, d3,_) {

  // Directory with data files
  var datadir = './data/';

  // File location of carreras catalogue (one record per career) 
  var carrerasurl = datadir+'carreras.txt';

  // Directory where each career individual file is located 
  var estudiantesPorCarreraDataDir = datadir+"carreras/";
  
  // Dictionary that holds, for each career, an array with the records for each student in that career
  var carrerasData = {};
  var estudiantesPorCarreraData = {};

  // Dictionary that willl hold each career's basic info (name, num. records & filename)
  var carreras = {};

  /**
   * Ensures that the carreras catalogue is loaded (file with each carrer's name, number of records and individual filenam).
   * Returns a promise which is resolved when the data is loaded
   */
  function init() {
    // Use promise to deliver the async result
    var deferred = $q.defer();

    // Check if it os already loaded
    if (_.keys(carreras).length>0) {
      deferred.resolve();
    } else {
      // Load data file and build a dictionary - carreras - with each carrera and it's corresponding record  
      d3.tsv(carrerasurl, function(error, data) {
        _.each(data, function(d) {
          carreras[d.carrera]=d;
        });
        deferred.resolve();
      });
    }

    return deferred.promise;
  };

  /**
   * Startup filter to allow only valid data records for students data
   */ 
  var startupFilter = function(data) {
    var filteredData = data;
    //filteredData = _.filter(filteredData, function(d) {return d.prom_paa >0;});

    return filteredData;
  };

  /**
   * @ngdoc function
   * @name fondecytApp.CarrerasDataService:carreras
   * @methodOf fondecytApp.CarrerasDataService
   * @param {int} maxCarreras Máximum number of data items to return (select the top with more associated records)
   * @returns {promise} promise that would return data arary with carerras
   *
   * @description
   * Return a promise that will deliver the array with carreras.
   * Select the top number of carreras (maxCarreras) according to the number of records per carrera.  If maxCarreras is undefined, selects all records 
   *
   */
  this.carreras = function(maxCarreras) {
    // Use promise to deliver the async result
    var deferred = $q.defer();

    init().then(function() {
      var nombresCarreras = _.keys(carreras);

      var top = [];

      // Select a mximum number of carreras if defined
      if (maxCarreras) {
        top = _.first(_.sortBy(nombresCarreras, function(d) {return -carreras[d].n;}), maxCarreras).sort();
      } else {
        top = nombresCarreras.sort();
      }

      var output = _.map(top, function(d) {
        return {name:d, size:carreras[d].n};
      });
      deferred.resolve(output);
    });
    
    return deferred.promise;
  };

  /**
   * @ngdoc function
   * @name fondecytApp.CarrerasDataService:estudiantesPorCarrera
   * @methodOf fondecytApp.CarrerasDataService
   * @param {objet} filter Specification of carrera & semetre for which data is required
   * @param {string} filter.carrera Carrera for wich data is required
   * @param {string} filter.semestre Semester (period) for wich data is required
   * @returns {promise} promise that would return data arary with data
   *
   * @description
   * Returns an array with data corresponding to students from a given career & semester
   *
   */
  this.estudiantesPorCarrera = function(filter) {
    var deferred = $q.defer();

    var carrera = filter.carrera ? filter.carrera : '';
    var semestre = filter.semestre ? filter.semestre : '2013 (I)';
    var psuValido = filter.psuValido ? filter.psuValido : false;

    init().then(function() {
      var carreraFile = carreras[carrera].filename;
      var filteredData = [];

      // Chek if the datafile has already been loades
      if (estudiantesPorCarreraData[carrera]) {
        // Fiter data for the corresponding semester only
        filteredData = _.filter(estudiantesPorCarreraData[carrera], function(d) {return d.semestre===semestre;});

        if (psuValido) {
          filteredData = _.filter(filteredData, function(d) {
            return +d.prom_paa>0;
          });
        }

        deferred.resolve(filteredData);
      } else {
        // Load data file  
        var datafile = estudiantesPorCarreraDataDir+carreraFile;
        d3.tsv(datafile, function(error, data) {
          estudiantesPorCarreraData[carrera] = startupFilter(data);

          // Fiter data for the corresponding semester only
          filteredData = _.filter(estudiantesPorCarreraData[carrera], function(d) {return d.semestre===semestre;});
          
          if (psuValido) {
            filteredData = _.filter(filteredData, function(d) {return +d.prom_paa>0;});
          }

          deferred.resolve(filteredData);
        });
      }
    });

    return deferred.promise;
  };
  
}]);




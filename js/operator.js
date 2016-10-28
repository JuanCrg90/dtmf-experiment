var img = {};

generateImage = function(img) {

  // Encontrar el table donde se pintatá la imagen.
  // Crear una table de height * width
  // Denormalizar el vector
  // añadir una celda a la tabla por cada elemento del vector (la celda debe llevar un color de fondo)

  console.log('HOLA GENERATE IMAGE');

  var grid = document.getElementById('dtmf-image');
  grid.innerHTML = '';
  var fragment = document.createDocumentFragment();

  //img.width = 24;
  //img.height = 7;
  //img.data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,7,7,7,7,0,0,11,11,11,11,0,0,15,15,15,15,0,0,3,0,0,0,0,0,7,0,0,0,0,0,11,0,0,0,0,0,15,0,0,15,0,0,3,3,3,0,0,0,7,7,7,0,0,0,11,11,11,0,0,0,15,15,15,15,0,0,3,0,0,0,0,0,7,0,0,0,0,0,11,0,0,0,0,0,15,0,0,0,0,0,3,0,0,0,0,0,7,7,7,7,0,0,11,11,11,11,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  var height = img.height;
  var width = img.width;

  var trow = ''

  for(var y = 0; y < height; y++) {
    var row = document.createElement('tr');

    for(var x = 0; x < width; x++) {
      var cell = document.createElement('td');
      //var element =Math.floor( (img.data[y* width + x] - 1 ) * (255/8) ) || 0;
      var element =Math.floor( (img.data[x* height + y] - 1 ) * (255/8) ) || 0;
      //var element = img.data[y* width + x] || 0;
      cell.innerHTML = ".";
      cell.style.backgroundColor= 'rgb('+element+','+element+','+element+')';
      //cell.style.backgroundColor= 'rgb(100,100,100)';
      row.appendChild(cell);


      trow+=element + ' ';

    }
    fragment.appendChild(row);
    trow+="\n";
  }

  grid.appendChild(fragment);
  console.log(trow)


};

angular.module('dtmf')
  .factory('OperatorSvc', function ($rootScope, DialerSvc) {
    var freqs = [].concat(DialerSvc.rows, DialerSvc.cols);

    var bands = _.map(freqs, function (freq) {
      return new Band(freq, 50);
    });

    var ear = new Ear({
      bands: bands,
      samples: 2048,
      threshold: -60,
      decay: 5
    });

    img.flagCounter = 0;
    img.width = '';
    img.height = '';
    img.data = [];



    var lastPressed = '', currentPressed = '', listening = false;

    ear.callback = function (freqs) {
      //console.log(freq1, freq2);


      if (freqs === null) {
        // This allows two of the same number to be dialed consecutively
        lastPressed = '';
        return;
      } else {
        // Split into row and column frequencies
        var rows = {}, cols = {};
        _.forEach(freqs, function (amp, freq) {
          freq = parseInt(freq);
          var rowIndex = DialerSvc.rows.indexOf(freq), colIndex = DialerSvc.cols.indexOf(freq);

          if (rowIndex !== -1) {
            rows[rowIndex] = amp;
          } else if (colIndex !== -1) {
            cols[colIndex] = amp;
          }
        });

        // Sort by amplitude and key and array of rows and column indices (from frequencies above)
        var sorter = function (amp) {
          return amp;
        };
        var wrapper = _(rows).pairs().sortBy(sorter).pluck(0);
        cols = wrapper.plant(cols).value();
        rows = wrapper.value();

        // Get the loudest of the frequencies
        // Object keys are strings, convert to int
        var row = parseInt(rows[0]),
          col = parseInt(cols[0]);

        currentPressed = DialerSvc.pad[row][col];
      }

      //console.log(currentPressed, currentPressed)

      if (lastPressed !== currentPressed) {
        // New button pressed
        if (listening && currentPressed) {
          $rootScope.$broadcast('received', currentPressed);
        }
        lastPressed = currentPressed;

      }
    };

    return {
      setListening: function (newValue) {
        listening = newValue;
      },
      getListening: function () {
        return listening;
      }

    };
  })
  .controller('OperatorCtrl', function ($rootScope, $scope, OperatorSvc) {
    $scope.received = '';

    OperatorSvc.setListening(true);

    $rootScope.$on('received', function (e, key) {
      $scope.$apply(function () {
        $scope.received += key;

        if(key == '#') {
          console.log("Terminado");
          console.log(img);
          generateImage(img);
        }

        if(key == '*') {
          img.flagCounter += 1;
        }

        if(img.flagCounter == 1) {
          img.height += (key == '*' ? '' : key);
        }

        if(img.flagCounter == 2) {
          img.width += (key == '*' ? '' : key);
        }

        if(img.flagCounter == 3 && key != '#') {
          if(key != '*'){
            img.data.push(key);
          }
        }

      });
    });

    $rootScope.$on('reset', function (e, key) {
      $scope.received = '';
    });
  });

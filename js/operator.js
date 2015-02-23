angular.module('dtmf')
    .factory('OperatorSvc', function ($rootScope, DialerSvc) {
        var freqs = [].concat(DialerSvc.rows, DialerSvc.cols);

        var bands = _.map(freqs, function (freq) {
            return new Band(freq, 50);
        });

        var ear = new Ear({
            bands: bands,
            samples: 1024,
            threshold: -50,
            decay: 10
        });

        var lastPressed = '', currentPressed = '', listening = false;

        ear.callback = function (freq1, freq2) {
            //console.log(freq1, freq2);

            if (freq1 === undefined) {
                // This allows two of the same number to be dialed consecutively
                lastPressed = '';
                return;
            } else {
                var row = DialerSvc.rows.indexOf(freq1),
                    col = DialerSvc.cols.indexOf(freq2);

                if (col == -1 || row == -1) {
                    return;
                }
                //console.log(row, col);

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
            });
        });
    });
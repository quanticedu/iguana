'use strict';

angular.module('Iguana')
    .factory('Iguana.Serializers', [

        function() {

            return {
                instanceMixin: {
                    asJson: function() {
                        return angular.fromJson(angular.toJson(this));
                    },

                    toJson: function() {
                        return angular.toJson(this);
                    }
                }
            };

        }
    ]);
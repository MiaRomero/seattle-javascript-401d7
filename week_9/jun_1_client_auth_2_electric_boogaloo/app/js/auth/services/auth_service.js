var baseUrl = require('../../config').baseUrl;

module.exports = function(app) {
  app.factory('cfAuth', ['$http', '$q', function($http, $q) {
    // AUTH_EXP: explain what each of these functions are accomplishing and
    // what data we're storing in this service.

    return {
      // This function clears both the token and username properties on the
      // controller that is calling it.  It clears the default $http token
      // header so any future requests will not use the previously saved token.
      // Clears the token from local storage.
      removeToken: function() {
        this.token = null;
        this.username = null;
        $http.defaults.headers.common.token = null;
        window.localStorage.token = '';
      },
      // This function sets the default $http header to send the saved token
      // with every future request.  Also saves the token to local storage.
      saveToken: function(token) {
        this.token = token;
        $http.defaults.headers.common.token = token;
        window.localStorage.token = token;
        return token;
      },

      // Returns the token property on the cfAuth object or if that does not exist,
      // retrieves the token from local storage and passes it to the saveToken function,
      // which in turn sets the token property on the cfAuth object and the $http headers.
      // Then returns this.token.
      getToken: function() {
        this.token || this.saveToken(window.localStorage.token);
        return this.token;
      },

      // Returns a promise containing the current username.  The current username
      // is either already set as this.username, which in that case it is just returned,
      // or if it is not, a GET request is made to /api/profile to retrieve the
      // username.  Also checks to confirm a token is present.
      getUsername: function() {
        return $q(function(resolve, reject) {
          if (this.username) return resolve(this.username);
          if (!this.getToken()) return reject(new Error('no authtoken'));

          $http.get(baseUrl + '/api/profile')
            .then((res) => {
              this.username = res.data.username;
              resolve(res.data.username);
            }, reject);
        }.bind(this));
      }
    }
  }]);
};

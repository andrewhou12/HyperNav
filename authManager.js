const Store = require('electron-store').default;
const store = new Store();

function saveAuthToken(token) {
  store.set('authToken', token);
}

function getAuthToken() {
  return store.get('authToken');
}

function clearAuthToken() {
  store.delete('authToken');
}

module.exports = { saveAuthToken, getAuthToken, clearAuthToken };
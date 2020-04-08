export const namespace = 'keys';

export const Status = {
  INIT: 'INIT',
  LOADED: 'LOADED',
  LOADING: 'LOADING'
}

export const FETCH_KEYS = `${namespace}/FETCH_KEYS`;
export const FETCH_KEYS_SUCCESS = `${namespace}/FETCH_KEYS_SUCCESS`;
export const FETCH_KEYS_FAILED = `${namespace}/FETCH_KEYS_FAILED`;

export const CREATE_KEY = `${namespace}/CREATE_KEY`;
export const DELETE_KEY = `${namespace}/DELETE_KEY`;
export const CREATE_KEY_SAGA = `${namespace}/CREATE_KEY_SAGA`;
export const UPDATE_KEY_SAGA = `${namespace}/UPDATE_KEY_SAGA`;
export const DELETE_KEY_SAGA = `${namespace}/DELETE_KEY_SAGA`;

export const SET_KEYS = `${namespace}/SET_KEYS`;

export const updateKeySaga = (key = {}) => ({
  type: UPDATE_KEY_SAGA,
  payload: {
    key
  }
})

export const deleteKeySaga = (keyId = {}) => ({
  type: DELETE_KEY_SAGA,
  payload: {
    keyId
  }
})

export const deleteKey = (keyId) => ({
  type: DELETE_KEY,
  payload: {
    keyId
  }
})
export const createKeySaga = (key = {}) => ({
  type: CREATE_KEY_SAGA,
  payload: {
    key
  }
})

export const createKey = (key = {}) => ({
  type: CREATE_KEY,
  payload: {
    key
  }
})

export const setKeys = (keys = []) => ({
  type: SET_KEYS,
  payload: {
    keys
  }
})


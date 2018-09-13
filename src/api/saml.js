import axios from 'axios'
import * as utils from './utils.js'

export default {
  getOptions: () => {
    return axios
      .get('/saml/options')
      .then(response => {
        return response.data
      })
      .catch(utils.handleError)
  },
}

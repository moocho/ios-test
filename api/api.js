const axios = require('axios')

const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';

const makeRequestApi = (url, method, data) => {        
      return  axios({
        url: url,
        method: method,
        headers: {'content-type': 'application-json'},
        data: JSON.stringify(data)
      }) 
      .then(_data => {          
        if (_data.errors) {                       
            return (_data.errors[0].message)
        }else{                                
            return (_data.data)
        }        
      })
      .catch(err => {          
        if (err.response && err.response.data) return (err.response.data)
        return({ message: 'Unknown error' })      
  });
}
  

const get = (url, data) => makeRequestApi(url, GET, data);
const post = (url, data) => makeRequestApi(url, POST, data);
const put = (url, data) => makeRequestApi(url, PUT, data);
const remove = (url, data) => makeRequestApi(url, DELETE, data);

module.exports =  {
  makeRequestApi,
  get,
  post,
  put,
  remove
}

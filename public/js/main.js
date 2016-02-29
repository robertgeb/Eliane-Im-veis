var Router = (function(window) {

  var _path = window.location.hash
  var routes = []


  function setPath() {
    _path = window.location.hash
  }

  function pubCreateRoute (path, callback) {
    routes[path] = callback
  }

  function pubLogPath () {
    console.log(window.location.hash);
  }

  function pubRunRoute () {
    setPath()
    try {
      routes['/'+_path]()
    } catch (e) {
      console.log(e)
    }
  }

  return {
    get: pubCreateRoute,
    route: pubRunRoute
  }
})(window);

var View = (function(window, document) {

  var contentData = {}

  var elements = {
    content: document.getElementById('content'),
    loader: document.getElementById('loader'),
  }

  function createConstructAlert () {
    let elem = document.createElement('div')
    elem.id = 'alert'
    elem.textContent = 'Site em construção'
    let body = document.getElementsByTagName('body')
    body[0].appendChild(elem)
  }

  function createGalery () {
    elements.galery = document.createElement('div')
    elements.galery.id = 'galery'
  }

  function insertGaleryItems () {
    for (var i = 0; i < contentData.data.length; i++) {
      let fig = document.createElement('figure')
      fig.classList.add('gl-img')
      let caption = document.createElement('figcaption')
      let price = document.createElement('h3')
      let parag = document.createElement('p')
      price.textContent = 'R$ '+ contentData.data[i].valor
      console.log(contentData.data[i]);
      parag.textContent = contentData.data[i].desc
      caption.appendChild(price)
      caption.appendChild(parag)
      fig.appendChild(contentData.data[i].images[0])
      fig.appendChild(caption)
      elements.galery.appendChild(fig)
    }
  }

  function pubEndLoad (data) {
    contentData = data
    insertGaleryItems()
    elements.content.appendChild(elements.galery)
    elements.galery.style.opacity = '0';
    elements.content.removeChild(elements.loader)
    elements.galery.style.transition = 'opacity 0.51s';
    setTimeout(function () {
      elements.galery.style.opacity = '1';
    }, 200);

  }

  function pubWrite (data) {
    console.log(contentEl.textContent);
    contentEl.textContent = data
  }

  function pubRenderPage (page) {
    if (page === 'home') {
      createConstructAlert()
      createGalery()
    }
  }

  function pubRemoveNetlifyIcon() {
    let scriptElem = document.querySelectorAll('script')
    let aElem = scriptElem.nextElementSibling
    try {
      aElem.parentNode.removeChild(aElem)
    } catch (e) {
      console.log(e)
    } finally {

    }
  }

  return {
    endLoad: pubEndLoad,
    write: pubWrite,
    render: pubRenderPage,
    removeNetlify: pubRemoveNetlifyIcon
  }
})(window, document);

var Client = (function() {

  var LoadFinish = () => {
    console.log('fim');
  }

  function loadImage (src, onload) {
    var img = new Image()
    img.onload = onload
    img.src = src
  }

  function pubRequestContent (file, callback) {
    let request = new XMLHttpRequest()
    request.addEventListener('load', function() {
      let response = this.response
      callback(JSON.parse(response))
    })
    request.open('GET', 'contents/'+file)
    request.send(this.response)
  }

  function loadManager (expected, onload) {
    var count = expected
    var data = []
    var loadCheck = setInterval(function () {
      if (count === 0) {
        clearInterval(loadCheck)
        onload(data)
      }
    }, 200)
    return function (resp) {
      count--
      data.push(resp)
    }
  }

  function requestContentById(id, callback) {
    let request = new XMLHttpRequest()
    request.addEventListener('load', function(e) {
      let resp = this.response
      var imgsToLoad = resp.images
      var checkLoad = loadManager(imgsToLoad.length, (data) => {
        resp.images = data
        callback(null, resp)
      })
      for (var i = 0; i < imgsToLoad.length; i++) {
        loadImage(imgsToLoad[i], (evt) => {
          checkLoad(evt.target)
        })
      }
    })

    request.addEventListener('error', (e) => {
      console.log('erro'+ e);
      callback(e)
    })

    request.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        var percentComplete = e.loaded / e.total;
        // console.log(percentComplete);
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    })
    console.log(id);
    request.open('GET', 'contents/'+id+'.json?'+new Date().getTime())
    request.responseType = 'json'
    request.send()
  }

  function pubRequestAll (callback) {
    let request = new XMLHttpRequest()
    request.addEventListener('load', function(e) {
      let response = this.response
      console.log(response);
      response.data = []
      var checkLoad = loadManager(response.venda.length, (data) => {
        response.data = data
        callback(null, response)
        LoadFinish(response)
      })
      for (var i = 0; i < response.venda.length; i++) {
        requestContentById(response.venda[i], (err, data) => {
          checkLoad(data)
        })
      }
    })

    request.addEventListener('error', (e) => {
      console.log('erro'+ e);
      callback(e)
    })

    request.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        var percentComplete = e.loaded / e.total;
        // console.log(percentComplete);
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    })
    request.open('GET', 'contents/list.json?'+new Date().getTime())
    request.responseType = 'json'
    request.send()
  }

  function pubSetLoadFinishCallback (cb) {
    LoadFinish = cb
  }

  return {
    load: pubRequestContent,
    loadAll: pubRequestAll,
    onLoad: pubSetLoadFinishCallback
  }
})();

window.onload = function () {
  View.removeNetlify()

  Router.get('/', function() {
    Client.onLoad(View.endLoad)
    Client.loadAll((err, data) => {
      if (err) {
        console.log(err)
      }
    })
    View.render('home')
  })

  Router.get('/#chou', function () {
    View.write('Chou')
  })

  Router.get('/#favoravel', function () {
    Client.load('0001/info.json', function (data) {
      console.log(data);
    })
  })

  Router.route()
}

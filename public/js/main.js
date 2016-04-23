'use strict'

/**
 * 			Modulo de controle de rotas
 */
var Router = (function(window) {

  const _URL = 'localhost:8080'
  var _path = window.location.hash
  var routes = []

  /**
   * Atualiza a variavel com o caminho
   * @return {NULL}
   */
  function getCurrentPath() {
    _path = window.location.hash
  }

  /**
   * Cria uma rota para a aplicação
   * @param  {String}   path     Caminho para a rota
   * @param  {Function} callback Executador da rota
   */
  function pubCreateRoute (path, callback) {
    routes[path] = callback
  }

  /**
   * Requisita a rota
   * @return {[type]} [description]
   */
  function pubRunRoute () {
    getCurrentPath()
    if (_path.match(/#venda-[0-9]+/)) {

    }
    try {
      routes['/'+_path]()
    } catch (e) {
      console.log(e);
      View.write('Erro 404 <br> Página não encontrada')
    }
  }

  /**
   * Simula uma requisição HTTP e requisita a rota
   * @param  {String} page URI, caminho da requisição
   */
  function pubRedirectTo (page) {
    window.location.href = 'http://' + _URL + '/#' + page
    this.route()
  }

  return {
    get: pubCreateRoute,
    goTo: pubRedirectTo,
    route: pubRunRoute
  }
})(window);


/**
 * 		Modulo de controle da View
 */
var View = (function(window, document) {

  /**
   * Dados recebidos
   * @type {Object}
   */
  let _contentData = {}

  /**
   * Elementos DOM para serem manipulados
   * @type {Object}
   */
  let _elements = {
    content: document.getElementById('content')
  }

  var _showPage = () => {
    console.log('chou');
  }

  /**
   * Cria aviso "Em construção"
   * @return {NULL}
   */
  function createConstructAlert () {
    let elem = document.createElement('div')
    elem.id = 'alert'
    elem.textContent = 'Site em construção'
    let body = document.getElementsByTagName('body')
    body[0].appendChild(elem)
  }

  /**
   * Gera div para a galeria de imóveis
   * que irá receber os dados
   * @return {NULL}
   */
  function createGalery () {
    _elements.galery = document.createElement('div')
    _elements.galery.id = 'galery'
  }

  /**
   * Insere os itens da galeria recebidos
   * @return {NULL}
   */
  function insertItemsOnGalery () {
    for (var i = 0; i < _contentData.length; i++) {
      let fig = document.createElement('figure')
      fig.classList.add('gl-img')
      fig.onclick = (function(id) {
        return () => {
          Router.goTo('imovel-' + id)
        }
      })(_contentData[i].id);
      let caption = document.createElement('figcaption')
      let price = document.createElement('h3')
      let parag = document.createElement('p')
      price.textContent = 'R$ '+ _contentData[i].valor
      parag.textContent = _contentData[i].desc
      fig.appendChild(_contentData[i].images[0])
      fig.appendChild(caption)
      caption.appendChild(price)
      caption.appendChild(parag)
      _elements.galery.appendChild(fig)
    }
  }

  function createImovelPage () {
    let wrapper = document.createElement('div')
    wrapper.id = 'imov'
    let list = document.createElement('ul')
    wrapper.appendChild(list)
    wrapper.style.opacity = 0
    _elements.toContent = wrapper
  }

  function insertImovelImages (id) {
    let imovel = _contentData[id-1]
    for (let i = 0; i < imovel.images.length; i++) {
      
    }
  }

  /**
   * Monitora e retorna o progresso dos carregamentos
   * @param  {Number}   expected  Tamanho do carregamento
   * @return {Function}           Função para checar o progresso
   */
  function pubStartLoading (expected) {
    let loader = document.createElement('div')
    let bar = document.createElement('div')
    bar.id = 'bar'
    loader.id = 'loader'
    loader.appendChild(bar)
    _elements.loader = loader
    _elements.loadbar = bar
    _elements.content.innerHTML = ''
    _elements.content.appendChild(loader)
    let tot = expected
    let part = 100/tot
    let progress = 0
    let load = setInterval(function () {
      if (progress >= 98) {
        _elements.loader.style.opacity = 0
        setTimeout(_showPage, 400);
        clearInterval(load)
      }
      // progress += part
      bar.style.width = progress + '%'
    }, 100)

    return (porcent) => {
      if (porcent) {
        progress += part*porcent
      }else {
        progress += part
      }
    }
  }

  /**
   * Recebe os dados e termina o processo de loading
   * @param  {Object} data Dados de conteudo recebidos
   * @return {NULL}
   */
  function pubSetContent (data) {
    _contentData = data
  }

  /**
   * Escreve no corpo da página
   * @param  {String} data Conteudo a ser escrito
   * @return {NULL}
   */
  function pubWrite (data) {
    _elements.content.innerHTML = data
  }

  /**
   * Renderiza a página passada por parametro
   * @param  {String} page Nome da página
   * @return {NULL}
   */
  function pubRenderPage (page) {
    switch (page) {
      case 'home':
        createGalery()
        _showPage = () => {
          insertItemsOnGalery()
          _elements.content.appendChild(_elements.galery)
          _elements.galery.style.opacity = '0';
          _elements.content.removeChild(_elements.loader)
          _elements.galery.style.transition = 'opacity 0.5s';
          setTimeout(function () {
            _elements.galery.style.opacity = '1';
          }, 200);
        }
        break
      case 'imovel':
        createImovelPage()
        _showPage = () => {
          let contentId = _elements.toContent.id
          insertImovelImages(contentId)
          _elements.content.innerHTML = _elements.toContent.outerHTML
          setTimeout(function () {
            document.getElementById(contentId).style.opacity = 1
          }, 300);
        }
        break
      case 'erro404':
        this.write('Erro 404 <br> Não encontramos o conteudo requisitado.')
        break
      default:
        this.write('Erro 404 <br> Não encontramos o conteudo requisitado.')
    }
  }

  function pubRemoveNetlifyIcon() {
    let body = document.getElementsByTagName('body')[0]
    let aElem = scriptElem.nextElementSibling
    try {
      aElem.parentNode.removeChild(aElem)
    } catch (e) {
      console.log(e)
    } finally {

    }
  }

  return {
    loadManager: pubStartLoading,
    setContent: pubSetContent,
    write: pubWrite,
    render: pubRenderPage,
    removeNetlify: pubRemoveNetlifyIcon
  }
})(window, document);


/**
 *		Modulo de controle dos dados
 */
var Client = (function() {

  let _dataCache = []

  /**
   * Carrega uma imagem e configura um callback
   * @param  {String} src    Endereço da imagem
   * @param  {Function} onload Executada quando termina o download
   */
  function loadImage (src, onload) {
    var img = new Image()
    img.onload = onload
    img.src = src
  }

  /**
   * Controla carregamentos assincronos simultaneos
   * @param  {Number} expected    Numero total de carregamentos
   * @param  {Function} onload    Callback para o termino de todos os carregamentos
   * @return {Function}           Confirma o fim de um carregamento
   */
  function loadManager (expected, onload) {
    let count = expected
    let data = []
    let loadCheck = setInterval(function () {
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

  function pubRequestSiteData (callback) {
    let request = new XMLHttpRequest()
    let randomNumber = new Date().getTime()

    request.addEventListener('load', onLoad)

    request.addEventListener('error', (err) => { callback(err)  })

    request.open('GET', 'contents/imoveis.json?' + randomNumber)
    request.responseType = 'json'
    request.send()

    function onLoad (evt) {
      let resp = evt.target.response
      for (let i = 0; i < resp.length; i++) {
        _dataCache.push(resp[i])
      }
      callback(null, _dataCache)
    }
  }

  function pubLoadCoverImages (checkProg, callback) {
    let length = _dataCache.length
    if (length) {
      let checkLoad = loadManager(length, () => {
        callback(null, _dataCache)
      })
      for (let i = 0; i < _dataCache.length; i++) {
        loadImage('contents/'+((_dataCache[i].id < 10)?('0'+_dataCache[i].id):_dataCache[i].id)+'/'+_dataCache[i].images[0]+'.jpg', (evt) => {
          _dataCache[i].images[0] = evt.target
          checkLoad(evt.target)
          checkProg(1/(length))
        })
      }
    }
    else {
      callback('Dados em falta')
    }
  }

  function pubLoadItemImages (id, checkProg, callback) {
    let item = _dataCache[id-1]
    let qtdImgs = item.images.length
    let checkLoad = loadManager(qtdImgs, () => {
      _dataCache[id-1] = item
      callback(null, _dataCache)
    })
    for (var i = 0; i < qtdImgs; i++) {
      if(typeof item.images[i] != 'string'){
        checkLoad(null)
        checkProg(1/qtdImgs)
        continue
      }
      loadImage('contents/'+((item.id < 10)?('0'+item.id):item.id)+'/'+item.images[i]+'.jpg', (evt) => {
        item.images[i] = evt.target
        checkLoad(evt.target)
        checkProg(1/qtdImgs)
      })
    }
  }

  return {
    getMainData: pubRequestSiteData,
    getItemImages: pubLoadItemImages,
    getCoverImages: pubLoadCoverImages
  }
})();

window.onhashchange = () => {
  try {
    Router.route()
  } catch (e) {
    console.log(e)
  }
}

window.onload = () => {

  Client.getMainData((err, data) => {
    if (err) {
      console.log(err)
      View.render('erro404')
      return
    }

    for (let i = 0; i < data.length; i++) {
      let id = data[i].id
      Router.get('/#imovel-' + id, () => {

        let checkProg = View.loadManager(1)
        View.render('imovel')

        Client.getItemImages(id, checkProg, (err, data) => {
          if (err) {
            console.log(err)
            View.render('erro404')
            return
          }

          View.setContent(data)
        })
      })
    }

    Router.route()
  })

  Router.get('/', () => {

    View.render('home')
    let checkProg = View.loadManager(1)
    Client.getCoverImages(checkProg, (err, data) => {
      if (err) {
        console.log(err)
        View.render('erro404')
        return
      }
      View.setContent(data)
    })

  })
}

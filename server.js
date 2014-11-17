//setup Dependencies
var express = require('express')
    , mongoose = require('mongoose')
    , fs = require('fs')
    , gm = require("gm")
    , im = gm.subClass({ imageMagick: true })
    , port = (process.env.PORT || 9092);

//Setup Express
var server = express();
server.set('views', __dirname + '/views');
server.set('view options', { layout: false });
server.use(express.bodyParser());
server.use(express.cookieParser());
server.use(express.session({ secret: Date() }))
server.use(express.static(__dirname + '/static'));
server.listen(port);

//DB connection
// PRODUCTION //mongoose.connect('mongodb://retec-admin:q1w2e3r4@ds027789.mongolab.com:27789/retec');
mongoose.connect('mongodb://developer:admin1@ds059908.mongolab.com:59908/reted-dev');
var models = require('./models');

server.locals = { 
                  title : 'RETEC CMS'
                  ,description: ''
                  ,author: ''
                  ,analyticssiteid: 'XXXXXXX'
                  ,blog: false
                  ,gallery: false
                  ,message: null
                }

///////////////////////////////////////////
//              Log In                   //
///////////////////////////////////////////

server.get('/', function(req,res){
  res.render('index.jade', { 
              title : server.locals.title + ' - Log In'
            }
  );
});

server.post('/', function (req, res) {
  var post = req.body;
  if (post.usuario === 'retec-admin' && post.password === 'q1w2e3r4') {
    req.session.user_id = 'retec-admin';
    res.redirect('/banners');
  } else if (post.usuario === 'retec-client' && post.password === 'q1w2e3r4') {
    req.session.user_id = 'retec-client';
    res.redirect('/archivos');
  } else {
    res.send('Bad user/pass');
  }
});

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.redirect('/');
  } else {
    next();
  }
}

server.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/');
});      

///////////////////////////////////////////
//              Banners                  //
///////////////////////////////////////////

// GET: Banners
server.get('/banners', checkAuth, function(req,res){
  var query = models.Banner.find();
  query.sort('date_to').execFind(function (err, banners) {
    if(err === null){
      res.render('banners.jade', { 
                  title : server.locals.title + ' - Banners',
                  banners : banners,
                  activeNav : 'banners',
                  session: req.session.user_id
                }
      );
    }
  });
});

// POST: Banner
server.post('/banners', function(req,res){
  console.log('POST to Banners');
  //new Banner
  var banner = new models.Banner(req.body);
  // cheking files
  banner.imagen = req.files.imagen.originalFilename;
  // saving files
  fs.readFile(req.files.imagen.path, function (err, data) {
    // ...
    var newPath = __dirname + "/static/images/banners/" + banner.imagen;
    fs.writeFile(newPath, data, function (err) {
      //console.log(err);
    });
  });
  banner.save(function(err){
    if(err === null){
      var query = models.Banner.find();
      query.sort('date_to').execFind(function (err, banners) {
        res.render('banners.jade', 
          { 
            title : server.locals.title + ' - Banners',
            banners : banners,
            activeNav : 'banners',
            message: 'Se creo el Banner con exito.',
            session: req.session.user_id
        });
      });
    };
  });
});

// POST: Banner - DELETE
server.post('/banners/del', function(req,res){
  console.log('POST to DELETE Banner');
  return models.Banner.findById(req.body.id, function (err, banner) {
    if (!banner){
      return res.render('banners.jade', {message : 'No se pudo borrar!',session: req.session.user_id}); 
    }
    return banner.remove(function (err) {
      if (!err) {
        // removed!
        res.redirect(301, '/banners')
      } else {
        // NOT removed!
        console.log(err);
        res.render('banners.jade', {message : 'Error! - {id: ' + id + '}',session: req.session.user_id});
      }
    });
  });
});

///////////////////////////////////////////
//              Locales                  //
///////////////////////////////////////////

///////////////// GET /////////////////////
server.get('/locales', checkAuth, function(req,res){
  return models.Local.findById(req.query.id, function (err, local_edit) {
    // FEEDBACK Messages
    var message = ''; var messageType = '';
    if (req.cookies.message != 'undefined') {
      message = req.cookies.message;
      messageType = req.cookies.messageType;
    }
    
    var query = models.Local.find();
    query.sort('provincia').execFind(function (err, locales) {
      if(err === null){
        if(local_edit === undefined || local_edit === null) local_edit = '';
        res.render('locales.jade', { 
                    title : server.locals.title + ' - Locales',
                    locales : locales,
                    localedit : local_edit,
                    message : message,
                    messageType : messageType,
                    activeNav : 'locales',
                    session: req.session.user_id
                  }
        );
      }
    });
  });
});
///////////////// POST /////////////////////
server.post('/locales', function(req,res){
  console.log(req.body);
  console.log('está logueando:/n');
  console.log(req.body.action)
  if (req.body.action == "update") {
    models.Local.findById(req.body.id, function(err, local){
      if(!err){
        local.nombre = req.body.nombre;
        local.direccion = req.body.direccion;
        local.direccion_2 = req.body.direccion_2;
        local.provincia = req.body.provincia;
        local.localidad = req.body.localidad.toLowerCase();;
        local.date_from = req.body.date_from;
        local.date_to = req.body.date_to;
        local.email = req.body.email;
        local.telefono = req.body.telefono;
        local.url = req.body.url;
        // Imagen mas abajo ...
        checkFoto(local);
        checkLogo(local);
        save(local, 'Se guardaron los cambios en "'+local.nombre+'".', 'success');
      }
    });

  }else{
    var local = new models.Local(req.body);
    checkFoto(local);
    checkLogo(local);
    save(local, 'Se creó con exito el local "'+local.nombre+'".', 'success');
  }

  function checkFoto (local) {
    console.log(local)
    if(req.files.foto.originalFilename) {
      local.foto = req.files.foto.originalFilename;
      console.log('req.files.foto = true');
      fs.readFile(req.files.foto.path, function (err, data) {
        var newPath = __dirname + "/static/images/locales/fotos/" + local.foto;
        fs.writeFile(newPath, data, function (err) {
            // Resize
            im(newPath)
            .resize(326, null)
            .noProfile()
            .write(newPath, function (err) {
              if (!err) console.log(' hooray! ');
            });
        });
      });
    }
  }
  function checkLogo (local) {
    if(req.files.logo.originalFilename) {
      local.logo = req.files.logo.originalFilename;
      // Upload
      fs.readFile(req.files.logo.path, function (err, data) {
        var newPath = __dirname + "/static/images/locales/logos/" + local.logo;
        fs.writeFile(newPath, data, function (err) {
            // Resize
            im(newPath)
            .resize(null, null)
            .noProfile()
            .write(newPath, function (err) {
              if (!err) console.log(' hooray! ');
            });
        });
      });
    }
  }
  function save (local, message, messageType) {
    local.save(function(err){
      if(err === null){
        //console.log('Pill.Save error:' + err);
        res.cookie('message', message, { expires: new Date(Date.now() + 5000), httpOnly: true });
        res.cookie('messageType', messageType, { expires: new Date(Date.now() + 5000), httpOnly: true });
        res.redirect(301, '/locales');
      };
    });
  }
});

///////////////// DELETE /////////////////////
server.post('/locales/del', function(req,res){
  console.log('POST to DELETE Locales');
  return models.Local.findById(req.body.id, function (err, local) {
    if (!local){
      return res.render('locales.jade', {message : 'No se pudo borrar!', session: req.session.user_id}); 
    }
    return local.remove(function (err) {
      if (!err) {
        // removed!
        res.redirect(301, '/locales')
      } else {
        // NOT removed!
        console.log(err);
        res.render('locales.jade', {message : 'Error! - {id: ' + id + '}',session: req.session.user_id});
      }
    });
  });
});

///////////////////////////////////////////
//              Archivos                 //
///////////////////////////////////////////

// GET: Archivos
server.get('/archivos', checkAuth, function(req,res){
  var query = models.Archivo.find();
  query.sort('date_to').execFind(function (err, archivos) {
    if(err === null){
      var query2 = models.Carpeta.find();
      query2.sort('name').execFind(function (err, carpetas){
        if(err === null){
          console.log(carpetas);
          res.render('archivos.jade', { 
                      title : server.locals.title + ' - Archivos',
                      archivos : archivos,
                      carpetas : carpetas,
                      activeNav : 'archivos',
                      session: req.session.user_id
                    }
          );
        }
      }); 
    }
  });
});

// POST: Archivo
server.post('/archivos', function(req,res){
  //new Archivo
  var archivo = new models.Archivo(req.body);
  // cheking files
  archivo.file = req.files.file.originalFilename;
  // saving files
  fs.readFile(req.files.file.path, function (err, data) {
    // ...
    var newPath = __dirname + "/static/uploaded/" + archivo.file;
    fs.writeFile(newPath, data, function (err) {
      //console.log(err);
      save(archivo, 'Se subió con exito el archivo "'+archivo.nombre+'".', 'success');
    });
  });

  function save (archivo, message, messageType) {
    archivo.save(function(err){
      if(err === null){
        res.cookie('message', message, { expires: new Date(Date.now() + 5000), httpOnly: true });
        res.cookie('messageType', messageType, { expires: new Date(Date.now() + 5000), httpOnly: true });
        res.redirect(301, '/archivos');
      };
    });
  }
});

// POST: Archivo - DELETE
server.post('/archivos/del', function(req,res){
  console.log('POST to DELETE Archivo');
  return models.Archivo.findById(req.body.id, function (err, archivo) {
    if (!archivo){
      return res.render('archivos.jade', {message : 'No se pudo borrar!', session: req.session.user_id});
    }
    return archivo.remove(function (err) {
      if (!err) {
        // removed!
        res.redirect(301, '/archivos')
      } else {
        // NOT removed!
        console.log(err);
        res.render('archivos.jade', {message : 'Error! - {id: ' + id + '}',session: req.session.user_id});
      }
    });
  });
});


///////////////////////////////////////////
//                APIS                   //
///////////////////////////////////////////

server.get('/getBanners', function(req,res){
  console.log('getBanners')
  var query = models.Banner.find();
  query.sort('date_to').execFind(function (err, banners) {
    console.log(err);
    if(err === null){
      res.send(req.query.callback + "(" + JSON.stringify(banners) + ");");
    }
  });
});

server.get('/getLocales', function(req,res){
  console.log('getLocales')
  var query = models.Local.find();
  query.sort({provincia: 1, localidad: 1, nombre: 1}).execFind(function (err, locales) {
    console.log(err);
    if(err === null){
      res.send(req.query.callback + "(" + JSON.stringify(locales) + ");");
    }
  });
});

///////////////////////////////////////////
//                500 404                //
///////////////////////////////////////////

//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

console.log('Listening on http://0.0.0.0:' + port );

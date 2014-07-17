//setup Dependencies
var express = require('express')
    , mongoose = require('mongoose')
    , fs = require('fs')
    , port = (process.env.PORT || 9091);

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
mongoose.connect('mongodb://retec-admin:q1w2e3r4@ds027789.mongolab.com:27789/retec');
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
  console.log(req.session);
  res.render('index.jade', { 
              title : server.locals.title + ' - Log In'
            }
  );
});

server.post('/', function (req, res) {
  var post = req.body;
  console.log(req.body);
  if (post.usuario === 'retec-admin' && post.password === 'q1w2e3r4') {
    req.session.user_id = 'retec-admin';
    res.redirect('/banners');
  } else {
    res.send('Bad user/pass');
  }
});

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
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
                  activeNav : 'banners'
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
  banner.imagen = req.files.foto.originalFilename;
  // saving files
  fs.readFile(req.files.foto.path, function (err, data) {
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
            message: 'Se creo el Banner con exito.'
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
      return res.render('banners.jade', {message : 'No se pudo borrar!'}); 
    }
    return banner.remove(function (err) {
      if (!err) {
        // removed!
        res.redirect(301, '/banners')
      } else {
        // NOT removed!
        console.log(err);
        res.render('banners.jade', {message : 'Error! - {id: ' + id + '}'});
      }
    });
  });
});

///////////////////////////////////////////
//              Locales                  //
///////////////////////////////////////////

// GET: Locales
server.get('/locales', checkAuth, function(req,res){
  var query = models.Local.find();
  query.sort('date_to').execFind(function (err, locales) {
    console.log(locales);
    if(err === null){
      res.render('locales.jade', { 
                  title : server.locals.title + ' - Locales',
                  locales : locales,
                  activeNav : 'locales'
                }
      );
    }
  });
});
// POST: Locales
server.post('/locales', function(req,res){
  console.log('POST to Locales');
  var local = new models.Local(req.body);
  // cheking LOGO
  local.logo = req.files.logo.originalFilename;
  // saving LOGO
  fs.readFile(req.files.logo.path, function (err, data) {
    // ...
    var newPath = __dirname + "/static/images/locales/" + local.logo;
    fs.writeFile(newPath, data, function (err) {
      //console.log(err);
    });
  });

  // cheking FOTO
  local.foto = req.files.foto.originalFilename;
  // saving FOTO
  fs.readFile(req.files.foto.path, function (err, data) {
    // ...
    var newPath = __dirname + "/static/images/locales/" + local.foto;
    fs.writeFile(newPath, data, function (err) {
      //console.log(err);
    });
  });

  local.save(function(err){
    if(err === null){
      var query = models.Local.find();
      query.sort('date_to').execFind(function (err, locales) {
        res.render('locales.jade', 
          { 
            title : server.locals.title + ' - Locales',
            locales : locales,
            activeNav : 'locales',
            message: 'Se creo el Local con exito.'
        });
      });
    };
  });
});
// POST: Locales - DELETE
server.post('/locales/del', function(req,res){
  console.log('POST to DELETE Locales');
  return models.Local.findById(req.body.id, function (err, local) {
    if (!local){
      return res.render('locales.jade', {message : 'No se pudo borrar!'}); 
    }
    return local.remove(function (err) {
      if (!err) {
        // removed!
        res.redirect(301, '/locales')
      } else {
        // NOT removed!
        console.log(err);
        res.render('locales.jade', {message : 'Error! - {id: ' + id + '}'});
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
      res.render('archivos.jade', { 
                  title : server.locals.title + ' - Archivos',
                  archivos : archivos,
                  activeNav : 'archivos'
                }
      );
    }
  });
});
// POST: Archivo
server.post('/archivos', function(req,res){
  console.log('POST to Archivos');
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
    });
  });
  archivo.save(function(err){
    if(err === null){
      var query = models.Archivo.find();
      query.sort('date_to').execFind(function (err, archivos) {
        res.render('archivos.jade', 
          { 
            title : server.locals.title + ' - archivos',
            archivos : archivos,
            activeNav : 'archivos',
            message: 'Se creo el Archivo con exito.'
        });
      });
    };
  });
});

// POST: Archivo - DELETE
server.post('/archivos/del', function(req,res){
  console.log('POST to DELETE Archivo');
  return models.Archivo.findById(req.body.id, function (err, archivo) {
    if (!archivo){
      return res.render('archivos.jade', {message : 'No se pudo borrar!'});
    }
    return archivo.remove(function (err) {
      if (!err) {
        // removed!
        res.redirect(301, '/archivos')
      } else {
        // NOT removed!
        console.log(err);
        res.render('archivos.jade', {message : 'Error! - {id: ' + id + '}'});
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
      res.send(banners);
    }
  });
});

// // POST: Banner/del
// server.post('/banner/del', function(req,res){
//   return models.Banner.findById(req.body.id, function (err, banner) {
//     if (!banner){
//       return res.render('banners.jade', {message : 'No se pudo borrar!'}); 
//     }
//     return show.remove(function (err) {
//       if (!err) {
//         // removed!
//         return res.render('banners.jade', {message : 'Banner borrado!'});
//         console.log("removed");
//       } else {
//         res.render('banners.jade', {message : 'Error! - {id: ' + id + '}'});
//         // NOT removed!
//         console.log(err);
//       }
//     });
//   });
// });


// // SHOWS
// server.get('/shows', function(req,res){
//   var query = models.Show.find();
//   query.sort('date').execFind(function (err, shows) {
//     if(err === null){
//       res.render('shows.jade', { 
//                   title : 'VIDRIO - Shows',
//                   shows : shows,
//                   activeNav : 'shows'
//                 }
//       );
//     }
//   });
// });

// // HOME
// server.get('/', function(req,res){
//   models.Show.find({$query: {}, $orderby: { date : 1 } }, function (err, shows) {
//     if(err === null){
//       res.render('index.jade', {
//                   title : 'VIDRIO Trip Instrumental',
//                   activeNav : 'home',
//                   shows : shows,
//                   blog : true
//                 }
//       );
//     }
//   });
// });

// // VIDEOS
// server.get('/videos', function(req,res){
//   res.render('videos.jade', {
//               title : 'VIDRIO - Videos',
//               activeNav : 'videos'
//             }
//   );
// });

// //ALBUMS
// server.get('/albums', function(req,res){
//   res.render('albums.jade', {
//               title : 'VIDRIO - Albums',
//               activeNav : 'albums'
//             }
//   );
// });

// //PHOTOS
// server.get('/photos', function(req,res){
//   res.render('photos.jade', {
//               title : 'VIDRIO - Fotos',
//               activeNav : 'fotos',
//               gallery: true
//             }
//   );
// });

// //BIO
// server.get('/bio', function(req,res){
//   res.render('bio.jade', {
//               title : 'VIDRIO - Bio',
//               activeNav : 'bio'
//             }
//   );
// });

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

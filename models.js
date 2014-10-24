var mongoose = require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var localSchema = new Schema({
    nombre		: String
  , direccion	: String
  , direccion_2	: String
  , provincia	: String
  , localidad : String
  , date_from	: String
  , date_to		: String
  , email     : String
  , telefono	: String
  , logo      : String
  , foto      : String
  , url       : String
});

var bannerSchema = new Schema({
    nombre		: String
  , date_from	: String
  , date_to		: String
  , imagen		: String
  , link  		: String
});

var archivoSchema = new Schema({
    nombre      : String
  , date_from   : String
  , date_to     : String
  , file        : String
});

exports.Local = mongoose.model('Local', localSchema);
exports.Banner = mongoose.model('Banner', bannerSchema);
exports.Archivo = mongoose.model('Archivo', archivoSchema);
var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var conString = require(path.join(__dirname, '../', '../', 'RFID-Tdd2/models/database.js'));


router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

router.get('/Ingreso', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'ingresoPersona.html'));
});
router.get('/Consultar', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'consultar.html'));
});
router.get('/Eliminar', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'eliminar.html'));
});

router.get('/Analisis', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'AnalisisDatos.html'));
});


module.exports = router;

  //post que envía la información del nuevo usuario
  router.post('/api/v1/RFID/createPerson', function(req, res){
    var results = [];
      var data = {
        doc_id: req.body.doc_id,
        nombre: req.body.nombre,
        genero: req.body.genero,
        correo: req.body.correo,
        programa: req.body.programa,
        tel: req.body.tel,
        cel: req.body.cel,
        cod_tarjeta: req.body.cod_tarjeta,
        cod_universidad: req.body.cod_universidad
      };

    pg.connect(conString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }
      var query = client.query({
        text: "select ingresar_persona($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        values: [data.doc_id, data.nombre, data.genero, data.correo, data.tel, data.cel, data.cod_tarjeta, data.cod_universidad, data.programa]
      });

        query.on('row', function(row) {
          results.push(row);
        });

        query.on('error', function(error){
          if(error.code == 23505){
              return res.status(501).json({ success: false, message: 'No se puede guardar por clave duplicada'});
          }if(error.code == 23502){
              return res.status(502).json({ success: false, message: 'No se puede guardar por valor nulo en obligatorio'});
          }if(error.code == 23503){
              return res.status(503).json({ success: false, message: 'No se puede guardar por violación de llave foránea'});
          }
        });

        query.on('end', function() {
          done();
          return res.json(results);
        });
      });
    });


    //post que envía el documento de identidad para "eliminar" la persona
    router.post('/api/v1/RFID/deletePerson', function(req, res){
      var results =[];
      var data = {
        doc_id: req.body.doc_id
      };
      pg.connect(conString, function(err, client, done) {
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        var query = client.query({
          text: "select eliminarpersona($1)",
          values: [data.doc_id]
        });

        query.on('row', function(row) {
          results.push(row);
        });

        query.on('error', function(error){
          if(error.code == 42883){
              return res.status(504).json({ success: false, message: 'No puede eliminar si no existe parámetro'});
          }
        });

        query.on('end', function() {
          done();
          return res.json(results);
        });
      });
    });


  //post que envía el doc_id para realizar la consulta de los datos de la persona
    router.post('/api/v1/RFID/getPerson', function(req, res) {
    var results = [];
    var data = {
      doc_id: req.body.doc_id
    };

      pg.connect(conString, function(err, client, done) {
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        var query = client.query({
          text: "Select * FROM consultar_persona($1)",
          values: [data.doc_id]
        });

          query.on('row', function(row, result) {
            result.addRow(row);
            results = result.rows[0];
            //console.log(result.rows[0]);
          });

          query.on('error', function(error) {
            if(error.code == 42883){
                return res.status(504).json({ success: false, message: 'No puede consultar si no existe parámetro'});
            }
          });

          query.on('end', function() {
            done();
            //console.log(res.json(results));
            return res.json(results);
          });
      });
    });


    //post que envía el doc_id de la peronsa para consultar los registros asociados a la persona
    router.post('/api/v1/RFID/getInOut',function(req,res){
      var results = [];
      var data = {
        doc_id: req.body.doc_id};

        pg.connect(conString, function(err, client, done) {
          if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
          }
          var query = client.query({
            text: "SELECT * FROM consultar_registros($1);",
            values: [data.doc_id]});

          query.on('row', function(row) {
            results.push(row);
            console.log(results);
          });

          query.on('error', function(error) {
            if(error.code == 42883){
                return res.status(504).json({ success: false, message: 'No puede consultar si no existe parámetro'});
            }
          });

          query.on('end', function() {
            done();
            return res.json(results);
          });
        });
    });

    //Post que envía el mes y el programa para consultar las "Entradas" de los usuarios
    router.post('/api/v1/RFID/showPeople',function(req,res){
      var results = [];
      var data = {
        cod_programa: req.body.cod_programa,
        mes: req.body.mes
      };
      pg.connect(conString, function(err, client, done) {
         if(err) {
            done();
            console.log(err);
         }
         var query = client.query({
           text: "SELECT * FROM consultar_per_programaxmes($1,$2);",
           values: [data.cod_programa, data.mes]
         });
         query.on('row', function(row) {
            results.push(row);
            console.log(results);
         });
         query.on('end', function() {
            done();
            return res.json(results);
        });
      });
  });

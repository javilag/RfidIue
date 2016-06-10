var chai = require ('chai'); // modulo chai
var chaiHttp = require ('chai-http'); // modulo chai-http para hacer peticiones.
var expect = require("chai").expect;
var app = require('../app');



chai.use(chaiHttp);

describe('API persona: ', function(){

    it('Que se agregue una nueva persona y sea exitoso', function(done){
      chai.request(app).post('/api/v1/RFID/createPerson').send({
        "doc_id":'000000',
        "nombre":'prueba-test',
        "genero":'test',
        "correo":'prueba-test@prueba-test',
        "tel":'0000000',
        "cel":'0000000000',
        "cod_tarjeta":'0000',
        "cod_universidad":'000000',
        "programa":'001'
      }).end(function(error, res){
          expect(res.statusCode).to.be.equal(200);
          expect(error).to.be.equal(null);
          expect(res).to.be.an('object');
        done();
      });
    });


    it('Que no se agregue la persona por clave duplicada', function(done){
      chai.request(app).post('/api/v1/RFID/createPerson').send({
        "doc_id":'000000',
        "nombre":'prueba-test',
        "genero":'test',
        "correo":'prueba-test@prueba-test',
        "tel":'0000000',
        "cel":'0000000000',
        "cod_tarjeta":'0000',
        "cod_universidad":'000000',
        "programa":'001'
      }).end(function(error, res){
          expect(res).to.be.an('object');
          expect(res.statusCode).to.be.equal(501);
        done();
      });
    });


    it('Que no se agregue la persona por campo obligatorio en null', function(done){
      chai.request(app).post('/api/v1/RFID/createPerson').send({
        "nombre":'prueba-test',
        "genero":'test',
        "correo":'prueba-test@prueba-test',
        "tel":'0000000',
        "cel":'0000000000',
        "cod_tarjeta":'1000',
        "cod_universidad":'00000',
        "programa":'001'
      }).end(function(error, res){
          expect(res).to.be.an('object');
          expect(res.statusCode).to.be.equal(502);
        done();
      });
    });


    it('Que no se agregue la persona por violación de clave foránea', function(done){
      chai.request(app).post('/api/v1/RFID/createPerson').send({
        "doc_id":'900000',
        "nombre":'prueba-test',
        "genero":'test',
        "correo":'prueba-test@prueba-test',
        "tel":'0000000',
        "cel":'0000000000',
        "cod_tarjeta":'9000',
        "cod_universidad":'900000',
        "programa":'000'
      }).end(function(error, res){
          expect(res).to.be.an('object');
          expect(res.statusCode).to.be.equal(503);
        done();
      });
    });


  it('Que se consulte la persona y sea exitoso', function(done){
    chai.request(app).post('/api/v1/RFID/getPerson').send({
      "doc_id":'000000'
    }).end(function(error, res){
        expect(res.statusCode).to.be.equal(200);
        expect(error).to.be.equal(null);
        expect(res).to.be.an('object');
        expect(res.body.rdoc_id).to.equal('000000');
        expect(res.body.rnombre).to.equal('prueba-test');
        expect(res.body.rgenero).to.equal('test');
        expect(res.body.rcorreo).to.equal('prueba-test@prueba-test');
        expect(res.body.rprograma).to.equal('Ingeniería de Sistemas');
        expect(res.body.rtel).to.equal('0000000');
        expect(res.body.rcel).to.equal('0000000000');
        expect(res.body.rcod_tarjeta).to.equal('0000');
        expect(res.body.rcod_universidad).to.equal('000000');
      done();
    });
  });


//Se necesitan varios registros en registro_en_sa para poder ejecutar esta prueba (Por eso el 1037638826)
  it('Que se consulten los registros de una persona y sea exitoso', function(done){
    chai.request(app).post('/api/v1/RFID/getInOut').send({
      "doc_id":'1037638826'
    }).end(function(error, res){
        expect(res.statusCode).to.be.equal(200);
        expect(error).to.be.equal(null);
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.have.property('rfecha');
        expect(res.body[0]).to.have.property('rhora');
        expect(res.body[0]).to.have.property('rtipo');
        expect(res.body[0]).to.have.property('rid_programa');
      done();
    });
  });


//Se necesitan varias "Entradas" en registro_en_sa para poder ejecutar esta prueba (que la persona de prueba entre almenos una vez).
//Además, cuando se ejecute la prueba, se deberá modificar el mes al numero de mes actual (si es enero 01, diciembre 12).
  it('Que se consulten las personas que ingresaron por programa en un mes y sea exitoso', function(done){
    chai.request(app).post('/api/v1/RFID/showPeople').send({
      cod_programa: '002',
      mes: '06'
    }).end(function(error, res){
      expect(res.statusCode).to.be.equal(200);
      expect(error).to.be.equal(null);
      expect(res).to.be.an('object');
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('rdoc_id');
      expect(res.body[0]).to.have.property('rnombre');
      expect(res.body[0]).to.have.property('rcod_universidad');
      expect(res.body[0]).to.have.property('rprograma');
      expect(res.body[0]).to.have.property('rfecha');
      expect(res.body[0]).to.have.property('rhora');
      done();
    });
  });


  //Se necesitan varias "Entradas" en registro_en_sa para poder ejecutar esta prueba (que la persona de prueba entre almenos una vez).
  //Además, cuando se ejecute la prueba, se deberá modificar el mes al numero de mes actual (si es enero 01, diciembre 12).
    it('Que se consulten las personas que ingresaron por programa en un mes y no encuentre nada', function(done){
      chai.request(app).post('/api/v1/RFID/showPeople').send({
        cod_programa: '000',
        mes: '06'
      }).end(function(error, res){
        expect(res.statusCode).to.be.equal(200);
        expect(error).to.be.equal(null);
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.be.equal(undefined);
        expect(res.body[0]).to.be.equal(undefined);
        expect(res.body[0]).to.be.equal(undefined);
        expect(res.body[0]).to.be.equal(undefined);
        expect(res.body[0]).to.be.equal(undefined);
        expect(res.body[0]).to.be.equal(undefined);
        done();
      });
    });


  it('Que se elimine una persona y sea exitoso', function(done){
    chai.request(app).post('/api/v1/RFID/deletePerson').send({
      "doc_id":'000000'
    }).end(function(error, res){
        expect(res.statusCode).to.be.equal(200);
        expect(error).to.be.equal(null);
        expect(res).to.be.an('object');
      done();
    });
  });


  it('Que se consulte la persona y no exista', function(done){
    chai.request(app).post('/api/v1/RFID/getPerson').send({
      "doc_id":'000000'
    }).end(function(error, res){
        expect(res.statusCode).to.be.equal(200);
        expect(error).to.be.equal(null);
        expect(res).to.be.an('object');
        expect(res.body.rdoc_id).to.equal(undefined);
        expect(res.body.rnombre).to.equal(undefined);
        expect(res.body.rgenero).to.equal(undefined);
        expect(res.body.rcorreo).to.equal(undefined);
        expect(res.body.rprograma).to.equal(undefined);
        expect(res.body.rtel).to.equal(undefined);
        expect(res.body.rcel).to.equal(undefined);
        expect(res.body.rcod_tarjeta).to.equal(undefined);
        expect(res.body.rcod_universidad).to.equal(undefined);
      done();
    });
  });
});

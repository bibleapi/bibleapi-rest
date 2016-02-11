process.env.NODE_ENV = 'test';

var server = require('../restify');

var chai = require('chai');
var chaiHttp = require('chai-http');

var should = chai.should();
chai.use(chaiHttp);

describe('Passages', function() {
  it('should list 1 verse on calling fetchBcv', function(done) {
    chai.request(server)
      .get('/api/v1.0/Gen1:1')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('verses');
        res.body.should.have.property('text');
        res.body.verses[0].book.should.equal(1);
        res.body.verses[0].chapter.should.equal(1);
        res.body.verses[0].verse.should.equal(1);
        done();
    });
  });

  it('should list 2 verses on calling fetchRange', function(done) {
    chai.request(server)
      .get('/api/v1.0/Gen1:1-2')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('verses');
        res.body.should.have.property('text');
        res.body.should.have.property('verses').with.length(2);
        // 1st verse
        res.body.verses[0].book.should.equal(1);
        res.body.verses[0].chapter.should.equal(1);
        res.body.verses[0].verse.should.equal(1);
        // 2nd verse
        res.body.verses[1].book.should.equal(1);
        res.body.verses[1].chapter.should.equal(1);
        res.body.verses[1].verse.should.equal(2);
        done();
    });
  });

});

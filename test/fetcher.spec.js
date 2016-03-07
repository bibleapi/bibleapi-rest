//var sinon = require('sinon');

const bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
const bcv = new bcv_parser;
var fetcher = require('../server/fetcher');

var chai = require('chai');
var should = chai.should();

describe('fetchBcv', function() {
  it('should get an empty object from fetchBcv', function(done) {
    var passage = 'Gen';
    var entity = bcv.parse(passage).entities[0];
    fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
      result.should.be.a('array');
      result.should.have.length(0);
      done();
    });
  });

  it('should get a chapter object from fetchBcv', function(done) {
    var passage = 'Gen1';
    var entity = bcv.parse(passage).entities[0];
    fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].should.have.property('chapter');
      result[0].chapter.should.equal(1);
      done();
    });
  });

  it('should get a verse object from fetchBcv', function(done) {
    var passage = 'Gen1:1';
    var entity = bcv.parse(passage).entities[0];
    fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].should.have.property('chapter');
      result[0].chapter.should.equal(1);
      result[0].should.have.property('verse');
      result[0].verse.should.equal(1);
      done();
    });
  });
});

describe('fetchRange', function() {
  it('should get a book object from fetchRange', function(done) {
    var passage = 'Gen;Ps';
    var entity = bcv.parse(passage).entities[0];

    entity.passages.should.have.length(2);

    fetcher.fetchRange(entity.passages[0], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
    });

    fetcher.fetchRange(entity.passages[1], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Ps');
    });

    done();
  });

  it('should get a chapter object from fetchRange', function(done) {
    var passage = 'Gen1;Ps1';
    var entity = bcv.parse(passage).entities[0];

    entity.passages.should.have.length(2);

    fetcher.fetchRange(entity.passages[0], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].chapter.should.equal(1);
    });

    fetcher.fetchRange(entity.passages[1], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Ps');
      result[0].chapter.should.equal(1);
    });

    done();
  });

  it('should get a verse object from fetchRange', function(done) {
    var passage = 'Gen1:2;Ps1:3';
    var entity = bcv.parse(passage).entities[0];

    entity.passages.should.have.length(2);

    fetcher.fetchRange(entity.passages[0], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].chapter.should.equal(1);
      //result[0].verse.should.equal(2);
    });

    fetcher.fetchRange(entity.passages[1], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Ps');
      result[0].chapter.should.equal(1);
      //result[0].verse.should.equal(3);
    });

    done();
  });
});

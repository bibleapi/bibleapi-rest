//var sinon = require('sinon');

const bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
const bcv = new bcv_parser;
var fetcher = require('../../server/v1/fetcher');

var chai = require('chai');
var should = chai.should();

describe.skip('fetchBcv', function() {
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

describe.skip('fetchRange', function() {
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
      result[0].verse.$gte.should.equal(2);
      result[0].verse.$lte.should.equal(2);
    });

    fetcher.fetchRange(entity.passages[1], function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Ps');
      result[0].chapter.should.equal(1);
      result[0].verse.$gte.should.equal(3);
      result[0].verse.$lte.should.equal(3);
    });

    done();
  });

  it('should get a passage object from fetchRange', function (done) {
    var passage = 'Gen1:2-7;Ps1:3-6';
    var entity = bcv.parse(passage).entities[0];

    entity.passages.should.have.length(2);

    fetcher.fetchRange(entity.passages[0], function (err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].chapter.should.equal(1);
      result[0].verse.$gte.should.equal(2);
      result[0].verse.$lte.should.equal(7);
    });

    fetcher.fetchRange(entity.passages[1], function (err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Ps');
      result[0].chapter.should.equal(1);
      result[0].verse.$gte.should.equal(3);
      result[0].verse.$lte.should.equal(6);
    });

    done();
  });

  it('should get a passage object from fetchRange, if the passage is "Gen1:2-33;Ps1:3-8"', function (done) {
    var passage = 'Gen1:2-33;Ps1:3-8';
    var entity = bcv.parse(passage).entities[0];

    entity.passages.should.have.length(2);

    fetcher.fetchRange(entity.passages[0], function (err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].chapter.should.equal(1);
      result[0].verse.$gte.should.equal(2);
      result[0].verse.$lte.should.equal(31);
    });

    fetcher.fetchRange(entity.passages[1], function (err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Ps');
      result[0].chapter.should.equal(1);
      result[0].verse.$gte.should.equal(3);
      result[0].verse.$lte.should.equal(6);
    });

    done();
  });

  it('should get a passage object from fetchRange, if the passage contains few chapters', function (done) {
    var passage = 'Gen1-2;Ps2-3';
    var entity = bcv.parse(passage).entities[0];

    entity.passages.should.have.length(2);

    fetcher.fetchRange(entity.passages[0], function (err, result) {
      result.should.be.a('array');
      result[0].$or[0].should.have.property('bookRef');
      result[0].$or[0].bookRef.should.equal('Gen');
      result[0].$or[0].chapter.should.equal(1);
      result[0].$or[0].verse.$gte.should.equal(1);
      result[0].$or[0].verse.$lte.should.equal(31);

      result[0].$or[1].should.have.property('bookRef');
      result[0].$or[1].bookRef.should.equal('Gen');
      result[0].$or[1].chapter.should.equal(2);
      result[0].$or[1].verse.$gte.should.equal(1);
      result[0].$or[1].verse.$lte.should.equal(25);
    });

    fetcher.fetchRange(entity.passages[1], function (err, result) {
      result.should.be.a('array');
      result[0].$or[0].should.have.property('bookRef');
      result[0].$or[0].bookRef.should.equal('Ps');
      result[0].$or[0].chapter.should.equal(2);
      result[0].$or[0].verse.$gte.should.equal(1);
      result[0].$or[0].verse.$lte.should.equal(12);

      result[0].$or[1].should.have.property('bookRef');
      result[0].$or[1].bookRef.should.equal('Ps');
      result[0].$or[1].chapter.should.equal(3);
      result[0].$or[1].verse.$gte.should.equal(1);
      result[0].$or[1].verse.$lte.should.equal(8);
    });

    done();
  });
});

describe.skip('fetchTranslation', function() {
  it('should get a single translation', function(done) {
    var passage = 'Gen1:1;ASV';
    var entity = bcv.parse(passage).entities[0];
    fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
      result.should.be.a('array');
      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].should.have.property('chapter');
      result[0].chapter.should.equal(1);
      result[0].should.have.property('verse');
      result[0].verse.should.equal(1);
      result[0].should.have.property('tran');
      result[0].tran.should.equal("ASV");
    });

    done();
  });

  it('should get a both translation', function(done) {
    var passage = 'Gen1:1;ASV;KJV';
    var entity = bcv.parse(passage).entities[0];


    fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
      result.should.be.a('array');

      result[0].should.have.property('bookRef');
      result[0].bookRef.should.equal('Gen');
      result[0].should.have.property('chapter');
      result[0].chapter.should.equal(1);
      result[0].should.have.property('verse');
      result[0].verse.should.equal(1);
      result[0].should.have.property('tran');
      result[0].tran.should.equal("ASV");
    });

    fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
      result.should.be.a('array');

      result[1].should.have.property('bookRef');
      result[1].bookRef.should.equal('Gen');
      result[1].should.have.property('chapter');
      result[1].chapter.should.equal(1);
      result[1].should.have.property('verse');
      result[1].verse.should.equal(1);
      result[1].should.have.property('tran');
      result[1].tran.should.equal("KJV");
    });
    done();
  });
});


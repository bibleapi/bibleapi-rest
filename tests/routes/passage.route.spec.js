import chai from 'chai';
import server from '../mocks/server.mock';

const expect = chai.expect;

describe.only('GET /', () => {

  describe('200', () => {

    it('should return json', (done) => {
      server.get('/api/Gen 1:1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.type).to.eql('application/json');
          done();
        });
    });

    xit('should return the API version', (done) => {
      server.get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

  });

});
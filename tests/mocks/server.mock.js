import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server/server';

chai.use(chaiHttp);
export default chai.request(server);
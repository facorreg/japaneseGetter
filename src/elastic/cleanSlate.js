import deleteIndex from './deleteIndex';

const cleanSlate = (client) => deleteIndex(client, 'tatoeba');

export default cleanSlate;

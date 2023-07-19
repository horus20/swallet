export default class Account {
  keys;

  constructor(alias, secret) {
    this.alias = alias;
    this.secret = secret;
    this.keys = [];
  }

  addKey(newKey) {
    this.keys.push(newKey)
  }
}

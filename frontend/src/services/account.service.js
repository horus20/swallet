import axios from 'axios';
import authHeader from './auth-header';
import { API_URL } from "@/const";
import Vue from 'vue';
import Account from "@/models/account";
import { ethers } from "ethers";

const CryptoJS = require("crypto-js");

class AccountService {
  getAccounts() {
    return axios.get(API_URL + 'accounts', { headers: authHeader() });
  }

  async newAccount(newAccount) {
    const wallet = ethers.Wallet.createRandom();
    const secret = CryptoJS.SHA256(Vue.config.phone + newAccount.alias + newAccount.secret).toString();

    return axios.post(API_URL + 'accounts', {
      alias: newAccount.alias,
      secret,
      key: wallet.address,
    },
    { headers: authHeader() })
    .then(response => {
      if (response.status === 201) {
        this.storeNewKey(wallet);
      }
    });
  }

  async newOp(account, op) {
    return axios.post(API_URL + 'accounts/' + account.id + '/ops', {
      op,
    },
    { headers: authHeader() })
    .then(response => {
      if (response.status === 201) {
        // console.log(response);
        const opEn = response.data;

        return axios.post(API_URL + 'accounts/' + account.id + '/ops/' + opEn.id + '/confirm',
          {},
          { headers: authHeader() })
          .then(response => {
            if (response.status === 201) {
              // console.log('DONE');
            }
            return opEn;
          })
      }
    });
  }

  async restoreAccount(restoreAccount, account) {
    const wallet = ethers.Wallet.createRandom();
    const secret = CryptoJS.SHA256(Vue.config.phone + restoreAccount.alias + restoreAccount.secret).toString();

    return axios.post(API_URL + 'accounts/' + account.id + '/keys', {
      secret,
      key: wallet.address,
    },
    { headers: authHeader() })
    .then(response => {
      if (response.status === 201) {
        return this.storeNewKey(wallet);
      }
    });
  }

  getKeyForAccount(account) {
    let keys = JSON.parse(localStorage.getItem('keys'));
    if (!keys) {
      keys = {};
    }
    let encryptedPrivateKey = null;

    for (let i=0; i < Object.keys(account.keys).length; i++){
      const addressKey = Object.keys(keys).find(key =>
        key.toLowerCase() === account.keys[i].key.toLowerCase() &&
          account.keys[i].status === 'DONE'
      );
      encryptedPrivateKey = keys[addressKey];
      if (encryptedPrivateKey != null) {
        break;
      }
    }

    return encryptedPrivateKey;
  }

  storeNewKey(wallet) {
    const privateKey = wallet.privateKey;
    // todo: change privateKey storing to store struct
    const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, Vue.config.password).toString();

    let keys = JSON.parse(localStorage.getItem('keys'));
    if (!keys) {
      keys = {};
    }
    keys[wallet.address] = encryptedPrivateKey;
    localStorage.setItem('keys', JSON.stringify(keys));
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new AccountService();

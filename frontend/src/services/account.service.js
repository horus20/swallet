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
    const secret = CryptoJS.SHA256(Vue.config.phone + newAccount.alias + newAccount.alias);

    return axios.post(API_URL + 'accounts', {
      alias: newAccount.alias,
      secret,
      key: wallet.address,
    },
    { headers: authHeader() })
    .then(response => {
      if (response.status === 201) {
        const privateKey = wallet.privateKey;
        const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, Vue.config.password).toString();
        newAccount.addKey(encryptedPrivateKey);

        let accounts = JSON.parse(localStorage.getItem('accounts'));
        if (!accounts) {
          accounts = [];
        }
        accounts.push(newAccount);
        localStorage.setItem('accounts', JSON.stringify(accounts));
      }
    });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new AccountService();

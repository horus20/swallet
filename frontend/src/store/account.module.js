import AccountService from '../services/account.service';

const accounts = JSON.parse(localStorage.getItem('accounts'));
const initialState = accounts
  ? { accounts }
  : { accounts: [] };

export const account = {
  namespaced: true,
  state: initialState,
  actions: {
    newAccount({ commit }, newAccount) {
      return AccountService.newAccount(newAccount).then(
        account => {
          commit('accountSuccess', account);
          return Promise.resolve(account);
        },
        error => {
          commit('accountFailure');
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    accountSuccess(state, account) {
      state.accounts.push(account);
    },
    accountFailure(state) {
      console.log(state);
    },
  }
};

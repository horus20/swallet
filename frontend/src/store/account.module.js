import AccountService from '../services/account.service';

// const keys = JSON.parse(localStorage.getItem('keys'));
const initialState = { accounts: [] };

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
    restore({ commit }, data) {
      return AccountService.restoreAccount(data.restoreAccount, data.account);
    }
  },
  mutations: {
    accountSuccess(state, account) {
      state.accounts.push(account);
    },
    accountFailure(state) {
      // console.log(state);
    },
  }
};

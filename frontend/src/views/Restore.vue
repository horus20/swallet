<template>
  <div class="col-md-12">
    <div class="card card-container">
      <h5 class="card-title">Восстановление доступа</h5>
      <form name="form" @submit.prevent="handleRestore">
        <div class="form-group">
          <label for="alias">Публичное имя</label>
          <input
            v-model="account.alias"
            v-validate="'required'"
            type="text"
            class="form-control"
            name="alias"
            disabled
          />
        </div>
        <div class="form-group">
          <label for="secret">Секретное слово</label>
          <input
            v-model="account.secret"
            v-validate="'required'"
            type="secret"
            class="form-control"
            name="secret"
          />
          <small id="secretHelp" class="form-text text-muted">Секретное слово необходимо для восстановления доступа</small>
          <div
            v-if="errors.has('secret')"
            class="alert alert-danger"
            role="alert"
          >Секретное слово обязателено!</div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary btn-block" :disabled="loading">
            <span v-show="loading" class="spinner-border spinner-border-sm"></span>
            <span>Восстановить</span>
          </button>
        </div>
        <div class="form-group">
          <div v-if="message" class="alert alert-danger" role="alert">{{message}}</div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Account from "@/models/account";
import Vue from "vue";

export default {
  name: 'Restore',
  data() {
    const account = this.$route.params.account;

    return {
      account: new Account(
        account.alias,
        ''
      ),
      loading: false,
      message: '',
      accountEntity: account,
    };
  },
  computed: {
  },
  created() {
  },
  methods: {
    handleRestore() {
      this.loading = true;
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          this.loading = false;
          return;
        }

        if (this.account.alias && this.account.secret) {
          this.$store.dispatch('account/restore', {
            restoreAccount: this.account,
            account: this.accountEntity,
          }).then(
            (key) => {
              this.$router.push({
                name: 'home',
                params: {
                  key,
                  status: 'success',
                  successMessage: 'Ключи успешно отправлены, доступ будет восстановлен в течении пары минут',
                }
              });
            },
            error => {
              this.loading = false;
              this.message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            }
          );
        }
      });
    }
  }
};
</script>

<style scoped>
label {
  display: block;
  margin-top: 10px;
}

.card-container.card {
  max-width: 350px !important;
  padding: 40px 40px;
}

.card {
  background-color: #f7f7f7;
  padding: 20px 25px 30px;
  margin: 0 auto 25px;
  margin-top: 50px;
  -moz-border-radius: 2px;
  -webkit-border-radius: 2px;
  border-radius: 2px;
  -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
}

.profile-img-card {
  width: 96px;
  height: 96px;
  margin: 0 auto 10px;
  display: block;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
}
</style>

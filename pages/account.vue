<template>
  <v-container fluid>
    <v-row
      align="center"
      justify="center"
    >
      <v-col class="col-xs-12 col-sm-7 col-md-5">
        <v-alert
          v-if="errorMessage"
          dense
          outlined
          type="error"
        >
          {{ errorMessage }}
        </v-alert>
        <v-alert
          v-if="successMessage"
          dense
          outlined
          type="success"
        >
          {{ successMessage }}
        </v-alert>
        <v-form
          v-if="!login"
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-card>
            <v-card-title class="headline">
              {{ title }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="username"
                label="Username"
                outlined
                required
                :rules="[v => !!v || 'Username is required']"
              />
              <v-text-field
                v-model="password"
                label="Password"
                outlined
                type="password"
                required
                :rules="[v => !!v || 'Password is required']"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn block :disabled="username == '' || password == ''" @click="doLogin">
                Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
        <v-card v-else>
          <v-card-title class="headline">
            {{ title }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="nik"
              label="NIK"
              outlined
              readonly
            />
            <v-text-field
              v-model="name"
              label="Name"
              outlined
              readonly
            />
            <v-text-field
              v-model="email"
              label="Email"
              outlined
              readonly
            />
            <!-- <v-text-field
              v-model="login"
              label="Login Status"
              outlined
              readonly
            /> -->
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn block @click="doLogout">
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-overlay :value="loading">
          <v-progress-circular indeterminate />
        </v-overlay>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      valid: false,
      login: !!this.$store.state.token,
      title: 'Account',
      username: '',
      name: this.$store.state.name,
      email: this.$store.state.email,
      nik: this.$store.state.nik,
      password: '',
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  mounted () {
    this.$store.commit('setTitle', this.title)
    if (this.login) {
      if (this.$store.state.nik === '') {
        this.getUserInfo()
      }
    }
  },
  methods: {
    doLogin () {
      this.$refs.form.validate()
      if (this.valid) {
        this.loading = true
        const auth = {
          username: this.username,
          password: this.password
        }

        this.$store.dispatch('doLogin', auth).then((response) => {
          if (response.status) {
            this.username = ''
            this.password = ''
            this.errorMessage = ''
            this.successMessage = response.message
            this.getUserInfo()
          } else {
            this.errorMessage = response.message
            this.successMessage = ''
          }
          this.login = !!this.$store.state.token
          this.loading = false
        })
      }
    },
    doLogout () {
      this.loading = true

      this.$store.dispatch('doLogout').then((response) => {
        if (response.status) {
          this.errorMessage = ''
          this.successMessage = response.message
        } else {
          this.errorMessage = response.message
          this.successMessage = ''
        }
        this.login = !!this.$store.state.token
        this.loading = false
      })
    },
    getUserInfo () {
      this.loading = true
      this.$store.dispatch('getUserInfo').then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error unknown'
        } else {
          this.name = response.resultdata[0].name
          this.email = response.resultdata[0].email
          this.nik = response.resultdata[0].nik
          this.getHistoryAttendance()
        }
        this.loading = false
      })
    },
    getHistoryAttendance () {
      this.loading = true
      this.$store.dispatch('getHistoryAttendance').then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error getHistoryAttendance unknown'
        } else {
          this.$store.commit('setModelDevice', response.resultdata[0])
        }
        this.loading = false
      })
    }
  }
}
</script>

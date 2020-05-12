<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <div class="text-center mt-7">
        <logo />
      </div>
      <v-card min-width="600" class="mt-7">
        <v-card-title class="headline">
          Attendance Apps
        </v-card-title>
        <v-card-text>
          <p>
            Go to Account to Login!
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            nuxt
            to="/account"
          >
            Continue to Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  data () {
    return {
      title: 'Welcome'
    }
  },
  mounted () {
    this.$store.commit('setTitle', this.title)
  }
}
</script>

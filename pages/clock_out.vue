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
      <v-alert
        v-if="clocked_out"
        dense
        outlined
        type="warning"
        max-width="400"
        width="400"
      >
        You have clocked out today!
      </v-alert>
      <v-alert
        v-if="errorMessage"
        dense
        outlined
        type="error"
        max-width="400"
        width="400"
      >
        {{ errorMessage }}
      </v-alert>
      <v-alert
        v-if="successMessage"
        dense
        outlined
        type="success"
        max-width="400"
        width="400"
      >
        {{ successMessage }}
      </v-alert>
      <v-alert
        v-if="!login"
        dense
        outlined
        type="error"
        max-width="400"
        width="400"
      >
        You should login first!
      </v-alert>
      <v-card v-else min-width="400" max-width="400">
        <v-card-title class="headline">
          {{ title }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="employee_id"
            label="Employee ID"
            outlined
          />
          <v-text-field
            v-model="name"
            label="Name"
            outlined
          />
          <v-textarea
            v-model="description"
            outlined
            label="Description"
          />
          <v-select
            v-model="selectedBranch"
            :items="branch"
            label="Branch"
            outlined
            @change="calculateDistance"
          />
          <v-text-field
            v-model="deviceId"
            label="Device Id"
            outlined
          />
          <v-text-field
            v-model="deviceModel"
            label="Device Model"
            outlined
          />
          <v-divider class="mb-6" />

          <v-dialog v-model="dialog" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn dark class="mb-6" block v-on="on">
                Change Location Manually
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Change Location Manually</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-lazy>
                        <div id="map-wrap" style="height: 400px; width: 100%;">
                          <client-only>
                            <l-map :zoom="18" :center="[latitudeTemp, longitudeTemp]" @click="addMarker">
                              <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <l-marker :lat-lng="[latitudeTemp, longitudeTemp]" />
                            </l-map>
                          </client-only>
                        </div>
                      </v-lazy>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" text @click="cancelLatLng">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="setLatLng">
                  Set
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-text-field
            v-model="latitude"
            label="Latitude"
            outlined
          />
          <v-text-field
            v-model="longitude"
            label="Longitude"
            outlined
          />
          <v-text-field
            v-model="location"
            label="Location"
            outlined
          />
          <v-text-field
            v-model="distance"
            label="Distance"
            outlined
          />
          <v-divider class="mb-6" />
          <v-text-field
            v-model="time"
            label="Clocked at"
            outlined
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            block
            @click.stop="clockOutButton = true"
          >
            {{ title }}
          </v-btn>

          <v-dialog
            v-model="clockOutButton"
            max-width="350"
          >
            <v-card>
              <v-card-title class="headline">
                Are you sure want to submit {{ title }}?
              </v-card-title>

              <v-card-text>
                <v-alert
                  v-if="clocked_out"
                  dense
                  outlined
                  type="warning"
                >
                  You have clocked out today!
                </v-alert>
                Click "Submit" to send `{{ title }} Data` to server.
              </v-card-text>

              <v-card-actions>
                <v-spacer />

                <v-btn
                  text
                  @click="clockOutButton = false"
                >
                  Cancel
                </v-btn>

                <v-btn
                  text
                  @click="insertAttendance"
                >
                  Submit
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-actions>
      </v-card>
      <v-overlay :value="loading">
        <v-progress-circular indeterminate />
      </v-overlay>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      employee_id: this.$store.state.nik,
      name: this.$store.state.name,
      description: null,
      longitude: '-0.09',
      latitude: '51.505',
      location: null,
      time: '00:00:00',
      title: 'Clock Out',
      login: !!this.$store.state.token,
      clocked_out: false,
      dialog: false,
      longitudeTemp: '-0.09',
      latitudeTemp: '51.505',
      loading: false,
      errorMessage: null,
      branch: [{ value: '0', text: 'null' }],
      selectedBranch: '0',
      clockOutButton: false,
      distance: 0,
      deviceId: this.$store.state.forca_deviceid,
      deviceModel: this.$store.state.forca_devicemodel,
      successMessage: ''
    }
  },
  mounted () {
    if (this.login) {
      window.setInterval(() => {
        this.time = this.getTime()
      }, 1000)
    }
  },
  created () {
    if (this.login) {
      if (!('geolocation' in navigator)) {
        this.errorMessage = 'Geolocation is not available.'
        return
      }

      this.getHistoryAttendance()

      this.getBranch()

      this.loading = true
      // get position
      navigator.geolocation.getCurrentPosition((pos) => {
        this.latitude = pos.coords.latitude
        this.longitude = pos.coords.longitude
        this.latitudeTemp = this.latitude
        this.longitudeTemp = this.longitude
        this.getLocation()
      }, (err) => {
        this.loading = false
        this.errorMessage = err.message
      })
    }
  },
  methods: {
    addMarker (event) {
      this.latitudeTemp = event.latlng.lat
      this.longitudeTemp = event.latlng.lng
    },
    setLatLng () {
      this.loading = true
      this.latitude = this.latitudeTemp
      this.longitude = this.longitudeTemp
      this.dialog = false
      this.getLocation()
      this.calculateDistance()
    },
    cancelLatLng () {
      this.latitudeTemp = this.latitude
      this.longitudeTemp = this.longitude
      this.dialog = false
    },
    async getLocation () {
      this.loading = true
      const token = '1c500e7e39a92b'
      const location = await this.$axios.$get(`https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${this.latitude}&lon=${this.longitude}&format=json`)
      this.location = location.display_name
      this.loading = false
    },
    getBranch () {
      this.loading = true
      this.$store.dispatch('getBranch').then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error getBranch unknown'
        } else {
          this.branch = []
          for (const resultdata of response.resultdata) {
            this.branch.push({
              value: resultdata.forca_branch_id,
              text: resultdata.name,
              latitude: resultdata.latitude,
              longitude: resultdata.longitude
            })
          }
          this.selectedBranch = null
          this.calculateDistance()
        }
        this.loading = false
      })
    },
    getTime () {
      const date = new Date()
      const h = ('0' + (date.getHours())).slice(-2)
      const m = ('0' + (date.getMinutes())).slice(-2)
      const s = ('0' + (date.getSeconds())).slice(-2)
      return `${h}:${m}:${s}`
    },
    getDate () {
      const date = new Date()
      const y = date.getFullYear()
      const m = ('0' + (date.getMonth() + 1)).slice(-2)
      const d = ('0' + (date.getDate())).slice(-2)
      return `${y}-${m}-${d}`
    },
    getHistoryAttendance () {
      this.loading = true
      const historyData = {
        date_from: this.getDate(),
        date_to: this.getDate(),
        status: 'out'
      }
      this.$store.dispatch('getHistoryAttendance', historyData).then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error getHistoryAttendance unknown'
        } else if (response.resultdata[0].forca_attendance_id == null) {
          this.clocked_out = false
        } else {
          this.clocked_out = true
        }
        this.loading = false
      })
    },
    insertAttendance () {
      this.loading = true
      const attendanceData = {
        nik: this.employee_id,
        name: this.name,
        status: 'out',
        imageurl: '',
        latitude: this.latitude,
        longitude: this.longitude,
        forca_distance: this.distance,
        forca_branch_id: this.selectedBranch ?? '0',
        forca_deviceid: this.deviceId,
        forca_devicemodel: this.deviceModel,
        description: this.description,
        forca_location: this.location
      }
      this.$store.dispatch('insertAttendance', attendanceData).then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error insertAttendance unknown'
        } else {
          this.successMessage = response.message
          this.getHistoryAttendance()
          this.clockOutButton = false
          this.$vuetify.goTo(0)
        }
        this.loading = false
      })
    },
    rad (x) {
      return x * Math.PI / 180
    },
    getDistance (p1, p2) {
      const R = 6378137
      const dLat = this.rad(p2.lat - p1.lat)
      const dLong = this.rad(p2.lng - p1.lng)
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c
      return d
    },
    calculateDistance () {
      const selectedBranch = this.selectedBranch
      if (selectedBranch == null) {
        this.distance = '50.00'
        return
      }
      const selectedBranchIndex = this.branch.findIndex(x => x.value === selectedBranch)
      const branch = this.branch[selectedBranchIndex]
      const p2 = {
        lat: branch.latitude,
        lng: branch.longitude
      }
      const p1 = {
        lat: this.latitude,
        lng: this.longitude
      }
      this.distance = Math.round(this.getDistance(p1, p2) * 100) / 100
    }
  }
}
</script>

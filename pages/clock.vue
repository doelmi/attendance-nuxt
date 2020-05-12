<template>
  <v-container fluid>
    <v-row
      align="center"
      justify="center"
    >
      <v-col class="col-xs-12 col-sm-8 col-md-6">
        <v-alert
          v-if="clocked"
          dense
          outlined
          type="warning"
        >
          You have clocked {{ title.type }} today!
        </v-alert>
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
        <v-alert
          v-if="!login"
          dense
          outlined
          type="error"
        >
          You should login first!
        </v-alert>
        <v-card v-else>
          <v-card-title class="headline" @change="getHistoryAttendance">
            {{ title.title }}
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
            <v-divider />
            <v-row align="center">
              <v-col align="center">
                <v-tooltip top>
                  <template v-slot:activator="tooltip">
                    <v-btn text icon v-on="tooltip.on" @click="getUserLocation">
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                  <span>Refresh User Location</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="tooltip">
                    <v-btn text icon v-on="tooltip.on" @click="dialog = true">
                      <v-icon>mdi-crosshairs-gps</v-icon>
                    </v-btn>
                  </template>
                  <span>Change Location Manually</span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-dialog v-model="dialog" max-width="600px">
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
                  <v-btn text @click="cancelLatLng">
                    Cancel
                  </v-btn>
                  <v-btn text @click="setLatLng">
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
              @click.stop="clockInButton = true"
            >
              {{ title.title }}
            </v-btn>

            <v-dialog
              v-model="clockInButton"
              max-width="350"
            >
              <v-card>
                <v-card-title class="headline">
                  Are you sure want to submit {{ title.title }}?
                </v-card-title>

                <v-card-text>
                  <v-alert
                    v-if="clocked"
                    dense
                    outlined
                    type="warning"
                  >
                    You have clocked {{ title.type }} today!
                  </v-alert>
                  Click "Submit" to send `{{ title.title }} Data` to server.
                </v-card-text>

                <v-card-actions>
                  <v-spacer />

                  <v-btn
                    text
                    @click="clockInButton = false"
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
      </v-col>
    </v-row>
  </v-container>
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
      time: this.getTime(),
      login: !!this.$store.state.token,
      clocked: false,
      dialog: false,
      longitudeTemp: '-0.09',
      latitudeTemp: '51.505',
      loading: false,
      errorMessage: null,
      branch: [{ value: '0', text: 'null' }],
      selectedBranch: '0',
      clockInButton: false,
      distance: 0,
      deviceId: this.$store.state.forca_deviceid,
      deviceModel: this.$store.state.forca_devicemodel,
      successMessage: ''
    }
  },
  computed: {
    title () {
      let title = 'Clock'
      let type = 'in'
      const h = this.time.split(':')[0]
      if (h >= 3 && h < 15) {
        title = 'Clock In'
        type = 'in'
      } else if ((h >= 15 && h < 24) || (h >= 0 && h < 3)) {
        title = 'Clock Out'
        type = 'out'
      }
      return { title, type }
    }
  },
  mounted () {
    this.$store.commit('setTitle', this.title.title)
    if (this.login) {
      window.setInterval(() => {
        this.time = this.getTime()
      }, 1000)
    }
  },
  created () {
    if (this.login) {
      this.getUserLocation()
      this.getHistoryAttendance()
      this.getBranch()
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
        status: this.title.type
      }
      this.$store.dispatch('getHistoryAttendance', historyData).then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error getHistoryAttendance unknown'
        } else if (response.resultdata[0].forca_attendance_id == null) {
          this.clocked = false
        } else {
          this.clocked = true
        }
        this.loading = false
      })
    },
    insertAttendance () {
      this.loading = true
      const attendanceData = {
        nik: this.employee_id,
        name: this.name,
        status: this.title.type,
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
          this.clockInButton = false
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
    },
    getUserLocation () {
      if (!('geolocation' in navigator)) {
        this.errorMessage = 'Geolocation is not available.'
        return
      }

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
      }, { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true })
    }
  }
}
</script>

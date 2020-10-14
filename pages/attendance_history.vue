<template>
  <v-container fluid>
    <v-row
      align="center"
      justify="center"
    >
      <v-col class="col-xs-12 col-sm-8 col-md-6">
        <v-alert
          v-if="errorMessage"
          dense
          outlined
          type="error"
        >
          {{ errorMessage }}
        </v-alert>
        <v-alert
          v-if="!login"
          dense
          outlined
          type="error"
        >
          You should login first!
        </v-alert>
        <v-card
          v-else
          class="mx-auto"
        >
          <v-card-title class="headline">
            {{ title }}
          </v-card-title>
          <v-list two-line>
            <template v-for="(item, index) in items">
              <v-list-item :key="item.id" @click.stop="openDetailAH(index)">
                <template>
                  <v-list-item-avatar>
                    <v-icon v-text="item.icon" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.title" />
                    <v-list-item-subtitle v-text="item.headline" />
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-list-item-action-text v-text="item.action" />
                  </v-list-item-action>
                </template>
              </v-list-item>

              <v-divider
                v-if="index + 1 < items.length"
                :key="index"
              />
            </template>
          </v-list>
        </v-card>
        <v-dialog
          v-model="modalAH"
          width="350"
          max-width="100%"
          scrollable
        >
          <v-card>
            <v-card-title class="headline">
              {{ title }} Detail
            </v-card-title>

            <v-card-text class="pt-5" style="height: 400px;">
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
                v-model="date"
                label="Date"
                outlined
                readonly
              />
              <v-text-field
                v-model="type"
                label="Type"
                outlined
                readonly
              />
              <v-text-field
                v-model="imageUrl"
                label="Image URL"
                outlined
                readonly
              />
              <v-text-field
                v-model="description"
                label="Description"
                outlined
                readonly
              />
              <v-text-field
                v-model="location"
                label="Location"
                outlined
                readonly
              />
              <v-text-field
                v-model="latLng"
                label="Lat Lng"
                outlined
                readonly
              />
              <v-text-field
                v-model="branch"
                label="Branch"
                outlined
                readonly
              />
              <v-text-field
                v-model="distance"
                label="Distance"
                outlined
                readonly
              />
              <v-text-field
                v-model="deviceId"
                label="Device ID"
                outlined
                readonly
              />
              <v-text-field
                v-model="deviceModel"
                label="Device Model"
                outlined
                readonly
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                @click="modalAH = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
      title: 'Attendance History',
      modalAH: false,
      items: [],
      login: !!this.$store.state.token,
      loading: false,
      errorMessage: null,
      nik: '',
      name: '',
      date: '',
      type: '',
      imageUrl: '',
      description: '',
      location: '',
      latLng: '',
      branch: '',
      distance: '',
      deviceId: '',
      deviceModel: ''
    }
  },
  mounted () {
    this.$store.commit('setTitle', this.title)
    if (this.login) {

    }
  },
  created () {
    if (this.login) {
      this.getHistoryAttendance()
    }
  },
  methods: {
    getHistoryAttendance () {
      this.loading = true
      this.$store.dispatch('getHistoryAttendance').then((response) => {
        if (!response || response.codestatus === 'E') {
          this.errorMessage = response ? response.message : 'Error getHistoryAttendance unknown'
        } else {
          this.items = []
          for (const result of response.resultdata) {
            this.items.push({
              id: result.forca_attendance_id,
              action: result.datedoc,
              headline: result.branch_name ?? 'null',
              title: result.status === 'in' ? 'Clock In' : 'Clock Out',
              icon: result.status === 'in' ? 'mdi-account-arrow-left' : 'mdi-account-arrow-right',

              nik: result.nik,
              name: result.name,
              imageUrl: result.url,
              latLng: `${result.latitude}, ${result.longitude}`,
              description: result.description,
              location: result.forca_location,
              distance: result.forca_distance,
              deviceId: result.forca_deviceid,
              deviceModel: result.forca_devicemodel
            })
          }
        }
        this.loading = false
      })
    },
    openDetailAH (index) {
      this.modalAH = true

      const detail = this.items[index]

      this.nik = detail.nik
      this.name = detail.name
      this.date = detail.action
      this.type = detail.title
      this.imageUrl = detail.imageUrl
      this.description = detail.description
      this.location = detail.location
      this.latLng = detail.latLng
      this.branch = detail.headline ?? 'null'
      this.distance = detail.distance
      this.deviceId = detail.deviceId
      this.deviceModel = detail.deviceModel
    }
  }
}
</script>

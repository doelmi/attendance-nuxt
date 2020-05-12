import Vuex from 'vuex'
// const bodyParser = require('body-parser')

const createStore = () => {
  return new Vuex.Store({
    state: {
      counter: localStorage.getItem('state.counter'),
      ad_user_id: localStorage.getItem('state.ad_user_id'),
      ad_user_name: localStorage.getItem('state.ad_user_name'),
      ad_client_id: localStorage.getItem('state.ad_client_id'),
      ad_client_name: localStorage.getItem('state.ad_client_name'),
      forca_person_id: localStorage.getItem('state.forca_person_id'),
      forca_deviceid: localStorage.getItem('state.forca_deviceid'),
      ad_org_id: localStorage.getItem('state.ad_org_id'),
      ad_role_id: localStorage.getItem('state.ad_role_id'),
      salesrep_ID: localStorage.getItem('state.salesrep_ID'),
      m_warehouse_ID: localStorage.getItem('state.m_warehouse_ID'),
      token: localStorage.getItem('state.token'),
      nik: localStorage.getItem('state.nik'),
      name: localStorage.getItem('state.name'),
      email: localStorage.getItem('state.email'),
      forca_devicemodel: localStorage.getItem('state.forca_devicemodel'),
      appTitle: localStorage.getItem('state.appTitle') || 'Welcome'
    },
    mutations: {
      setTitle (state, title) {
        state.appTitle = title
        localStorage.setItem('state.appTitle', state.appTitle)
      },
      increment (state) {
        state.counter++
        localStorage.setItem('state.counter', state.counter)
      },
      setLoginData (state, loginData) {
        state.ad_user_id = loginData ? loginData.ad_user_id : ''
        state.ad_user_name = loginData ? loginData.ad_user_name : ''
        state.ad_client_id = loginData ? loginData.ad_client_id : ''
        state.ad_client_name = loginData ? loginData.ad_client_name : ''
        state.forca_person_id = loginData ? loginData.forca_person_id : ''
        state.forca_deviceid = loginData ? loginData.forca_deviceid : ''
        state.ad_org_id = loginData ? loginData.ad_org_id : ''
        state.ad_role_id = loginData ? loginData.ad_role_id : ''
        state.salesrep_ID = loginData ? loginData.salesrep_ID : ''
        state.m_warehouse_ID = loginData ? loginData.m_warehouse_ID : ''
        state.token = loginData ? loginData.token : ''
        localStorage.setItem('state.ad_user_id', state.ad_user_id)
        localStorage.setItem('state.ad_user_name', state.ad_user_name)
        localStorage.setItem('state.ad_client_id', state.ad_client_id)
        localStorage.setItem('state.ad_client_name', state.ad_client_name)
        localStorage.setItem('state.forca_person_id', state.forca_person_id)
        localStorage.setItem('state.forca_deviceid', state.forca_deviceid)
        localStorage.setItem('state.ad_org_id', state.ad_org_id)
        localStorage.setItem('state.ad_role_id', state.ad_role_id)
        localStorage.setItem('state.salesrep_ID', state.salesrep_ID)
        localStorage.setItem('state.m_warehouse_ID', state.m_warehouse_ID)
        localStorage.setItem('state.token', state.token)
      },
      setUserInfo (state, userInfo) {
        state.nik = userInfo ? userInfo.nik : ''
        state.name = userInfo ? userInfo.name : ''
        state.email = userInfo ? userInfo.email : ''
        localStorage.setItem('state.nik', state.nik)
        localStorage.setItem('state.name', state.name)
        localStorage.setItem('state.email', state.email)
      },
      setModelDevice (state, historyData) {
        state.forca_devicemodel = historyData ? historyData.forca_devicemodel : ''
        localStorage.setItem('state.forca_devicemodel', state.forca_devicemodel)
      },
      deleteStateValue (state) {
        const except = ['appTitle']
        for (const s in state) {
          if (!except.includes(s)) {
            state[s] = null
            localStorage.removeItem(`state.${s}`)
          }
        }
      }
    },
    actions: {
      doLogin ({ commit, state }, auth) {
        const body = {
          username: auth.username,
          password: auth.password
        }
        const request = {
          url: 'https://erp.sisi.id/api/ws/authentication/v1/login',
          body,
          headers: ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded'],
          method: 'POST',
          ssl: true
        }
        return this.$axios.post('https://api.attendance.doelmi.id/index.php?callApi=1&title=login', request).then((response) => {
          response = response.data.data
          if (response && response.codestatus === 'E') {
            commit('setLoginData', null)
            return { status: false, message: response.message }
          } else {
            commit('setLoginData', response.resultdata)
            return { status: true, message: response.message }
          }
        })
      },
      doLogout ({ commit, state }) {
        const body = {}
        const request = {
          url: 'https://erp.sisi.id/api/ws/authentication/v1/logout',
          body,
          headers: ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded', `Forca-Token: ${state.token}`],
          method: 'POST',
          ssl: true
        }
        return this.$axios.post('https://api.attendance.doelmi.id/index.php?callApi=1&title=logout', request).then((response) => {
          response = response.data.data
          if (response && response.codestatus === 'E') {
            return { status: false, message: response.message }
          } else {
            commit('deleteStateValue')
            return { status: true, message: response.message }
          }
        })
      },
      getUserInfo ({ commit, state }) {
        const body = {
          ad_user_id: state.ad_user_id
        }
        const request = {
          url: 'https://erp.sisi.id/api/ws/transaction/v1/getUserInfo',
          body,
          headers: ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded', `Forca-Token: ${state.token}`],
          method: 'POST',
          ssl: true
        }
        return this.$axios.post('https://api.attendance.doelmi.id/index.php?callApi=1&title=getUserInfo', request).then((response) => {
          response = response.data.data
          commit('setUserInfo', response.resultdata[0])
          return response
        }).catch((err) => {
          console.log('AXIOS ERROR: ', err)
        })
      },
      getBranch ({ commit, state }) {
        const body = {
          ad_user_id: state.ad_user_id
        }
        const request = {
          url: 'https://erp.sisi.id/api/ws/transaction/v1/getLocation',
          body,
          headers: ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded', `Forca-Token: ${state.token}`],
          method: 'POST',
          ssl: true
        }
        return this.$axios.post('https://api.attendance.doelmi.id/index.php?callApi=1&title=getLocation', request).then((response) => {
          return response.data.data
        }).catch((err) => {
          console.log('AXIOS ERROR: ', err)
        })
      },
      getHistoryAttendance ({ commit, state }, historyData) {
        let body = {
          NIK: state.nik
        }
        if (historyData) {
          body = {
            NIK: state.nik,
            'Date From': historyData.date_from,
            'Date To': historyData.date_to,
            Status: historyData.status
          }
        }
        const request = {
          url: 'https://erp.sisi.id/api/ws/transaction/v1/getAttendanceHistory',
          body,
          headers: ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded', `Forca-Token: ${state.token}`],
          method: 'POST',
          ssl: true
        }
        return this.$axios.post('https://api.attendance.doelmi.id/index.php?callApi=1&title=getAttendanceHistory', request).then((response) => {
          return response.data.data
        }).catch((err) => {
          console.log('AXIOS ERROR: ', err)
        })
      },
      insertAttendance ({ commit, state }, attendanceData) {
        const body = attendanceData
        const request = {
          url: 'https://erp.sisi.id/api/ws/transaction/v1/insertAttendance',
          body,
          headers: ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded', `Forca-Token: ${state.token}`],
          method: 'POST',
          ssl: true
        }
        return this.$axios.post('https://api.attendance.doelmi.id/index.php?callApi=1&title=insertAttendance', request).then((response) => {
          return response.data.data
        }).catch((err) => {
          console.log('AXIOS ERROR: ', err)
        })
      }
    }
  })
}

export default createStore

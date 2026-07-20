export default {
  namespaced: true,

  state: () => ({
    tickets: [],
    ticketsData: [],
    maxCustomCapacity: null,
    maxExtraPeople: null,
    globalSpots: 0,
    pendingPreselectedTickets: [],
  }),

  getters: {
    getMaxCustomCapacity(state) {
      return state.maxCustomCapacity
    },

    getMaxExtraPeople(state) {
      return state.maxExtraPeople
    },

    getTicketNumber: (state) => (id) => {
      return state.ticketsData.find((t) => t.id === id).persons
    },

    getTicketsSum(state) {
      let persons = 0
      state.ticketsData.forEach((t) => {
        persons += t.persons
      })

      return persons
    },

    getTicketsData(state) {
      return state.ticketsData
    },

    getEventGlobalSpots(state) {
      return state.globalSpots
    },

    getAllData(state) {
      return {
        tickets: state.tickets,
        ticketsData: state.ticketsData,
        maxCustomCapacity: state.maxCustomCapacity,
        maxExtraPeople: state.maxExtraPeople,
        globalSpots: state.globalSpots,
      }
    },
  },

  mutations: {
    setTickets(state, payload) {
      state.tickets = payload
      payload.forEach((item) => {
        if (item.enabled) {
          let obj = {
            spots: item.spots,
            sold: item.sold,
            persons: 0,
            price: item.dateRangePrice != null ? item.dateRangePrice : item.price,
            name: item.name,
            id: item.id,
            eventTicketId: item.id,
            waiting: item.waiting,
            waitingListSpots: item.waitingListSpots,
          }
          state.ticketsData.push(obj)
        }
      })
    },

    setMaxCustomCapacity(state, payload) {
      state.maxCustomCapacity = payload
    },

    setReduceMaxExtraPeople(state, payload) {
      state.maxExtraPeople = state.maxExtraPeople + 1 - payload
    },

    setMaxExtraPeople(state, payload) {
      state.maxExtraPeople = payload
    },

    setTicketNumber(state, payload) {
      state.ticketsData.forEach((t) => {
        if (t.id === payload.id) t.persons = parseInt(payload.numb)
      })
    },

    setEventGlobalSpots(state, payload) {
      state.globalSpots += payload
    },

    setPendingPreselectedTickets(state, payload) {
      state.pendingPreselectedTickets = Array.isArray(payload) ? payload : []
    },

    applyPendingPreselectedTickets(state, payload) {
      if (!state.pendingPreselectedTickets.length || !state.ticketsData.length) {
        return
      }

      const waitingMode = !!(payload && payload.waitingMode)
      const sharedWaitingSpotsLeft =
        payload && typeof payload.sharedWaitingSpotsLeft === 'number'
          ? Math.max(0, payload.sharedWaitingSpotsLeft)
          : null
      const useSharedWaitingCap = waitingMode && !!state.maxCustomCapacity && sharedWaitingSpotsLeft !== null
      const pendingById = {}

      state.pendingPreselectedTickets.forEach((ticket) => {
        const id = parseInt(ticket.id)
        const quantity = parseInt(ticket.quantity)
        if (!isNaN(id) && !isNaN(quantity) && quantity > 0) {
          pendingById[id] = quantity
        }
      })

      let selectedTotal = 0
      let remainingShared = useSharedWaitingCap ? sharedWaitingSpotsLeft : null

      state.ticketsData.forEach((ticket) => {
        const wanted = ticket.id in pendingById ? pendingById[ticket.id] : 0
        const maxAllowed = useSharedWaitingCap
          ? remainingShared
          : waitingMode
            ? Math.max(0, (ticket.waitingListSpots || 0) - (ticket.waiting || 0))
            : Math.max(0, (ticket.spots || 0) - (ticket.sold || 0))

        ticket.persons = Math.max(0, Math.min(wanted, maxAllowed))
        selectedTotal += ticket.persons

        if (useSharedWaitingCap) {
          remainingShared = Math.max(0, remainingShared - ticket.persons)
        }
      })

      state.globalSpots = selectedTotal
      state.pendingPreselectedTickets = []
    },

    setAllData(state, payload) {
      state.tickets = payload.tickets
      state.ticketsData = payload.ticketsData
      state.maxCustomCapacity = payload.maxCustomCapacity
      state.maxExtraPeople = payload.maxExtraPeople
      state.globalSpots = payload.globalSpots
      state.pendingPreselectedTickets = []
    },
  },

  actions: {
    resetCustomTickets({ commit }) {
      commit('setAllData', {
        tickets: [],
        ticketsData: [],
        maxCustomCapacity: null,
        maxExtraPeople: null,
        globalSpots: 0,
      })
    },
  },
}

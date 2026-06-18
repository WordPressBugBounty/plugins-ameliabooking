function useDisableAuthorizationHeader () {
  return 'ameliaBooking' in window &&
    'cabinet' in window['ameliaBooking'] &&
    'disableAuthorizationHeader' in window['ameliaBooking']['cabinet'] &&
    window['ameliaBooking']['cabinet']['disableAuthorizationHeader']
}

export {
  useDisableAuthorizationHeader,
}

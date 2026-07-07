function useLicence() {
  return {
    isLite: true,
    isStarter: false,
    isBasic: false,
    isPro: false,
    isDeveloper:
      window.wpAmeliaSettings.activation.licence === 'Developer' ||
      window.wpAmeliaSettings.activation.licence === '',
  }
}

export { useLicence }

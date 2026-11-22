// What kind of screen are we on? Used to steer phone users to the home-screen app before they sign up.
const ua = navigator.userAgent
export const ios = /iPhone|iPad|iPod/.test(ua)
export const android = /Android/.test(ua)
export const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
export const phoneBrowser = (ios || android) && !installed

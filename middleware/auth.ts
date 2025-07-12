export default defineNuxtRouteMiddleware((ctx) => {

  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${ctx.path}`)
  }
})

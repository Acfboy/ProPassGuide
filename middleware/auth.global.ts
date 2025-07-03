export default defineNuxtRouteMiddleware((ctx) => {

  const { loggedIn } = useUserSession()

  if (ctx.path.startsWith("/edit") && !loggedIn.value) {
    return navigateTo('/login')
  }
})

export default defineNuxtRouteMiddleware((ctx) => {
    const { loggedIn, session } = useUserSession();
    if (!loggedIn.value) {
        return navigateTo(`/login?redirect=${ctx.path}`);
    }

    const validateUser = SessionUserSchema.safeParse(session.value?.user);
    if (!validateUser.success || !validateUser.data.admin)
        throw createError({ statusCode: 401, message: "无权限" });
});

<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12" md="5" lg="4" xl="4">
                <v-card title="登录">
                    <v-card-text>
                        <v-form v-model="valid" @submit.prevent>
                            <v-text-field v-model="mail" :rules="mailRule" label="邮箱" />
                            <v-text-field v-model="pwd" :rules="pwdRule" label="密码" type="password" />
                            <div class="d-flex justify-space-between">
                                <p class="text-red-darken-1">
                                    {{ prompt }}
                                </p>
                                <div>
                                    <span>还没有账号？</span>
                                    <a href="/signup">立即注册</a>
                                </div>
                            </div>
                        </v-form>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn color="primary" :disabled="!valid" @click="login">
                            登录
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { validateEmail, validateEmailDomain, validatePwd } from '~/utils/validation';

const mail = ref("");
const pwd = ref("");
const valid = ref(false);
const prompt = ref(" ");

const mailRule = [
    validateEmail,
    validateEmailDomain,
];

const pwdRule = [
    validatePwd
];

const { fetch: refreshSession } = useUserSession()

const login = async () => {
    prompt.value = " ";
    try {
        const res = await $fetch('/api/login', {
            method: 'POST',
            body: {
                email: mail.value,
                password: pwd.value,
            }
        })
        if (res.status == "ok") {
            await refreshSession();
            const router = useRouter();
            if (window.history.state.back)
                router.go(-1);
            else
                router.replace({ path: '/' })
        } else {
            prompt.value = res.message;
        }
    }
    catch (e) {
        console.log(JSON.stringify(e));
    };
};
</script>

<style>
a {
    text-decoration: none;
}
</style>
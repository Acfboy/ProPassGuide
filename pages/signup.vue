<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12" md="5" lg="4" xl="4">
                <v-card title="注册">
                    <v-card-text class="ma-2">
                        <v-form v-model="valid" @submit.prevent>
                            <v-text-field 
                                v-model:error="mailError" v-model="formData.email"
                                :rules="[validateEmail, validateEmailDomain]" label="邮箱" variant="underlined" />
                            <v-text-field 
                                v-model="formData.captcha" label="邮件验证码" variant="underlined"
                                :rules="[validateCapt]">
                                <template #append>
                                    <v-btn 
                                        :disabled="formData.email.length == 0 || mailError || sended"
                                        @click="sendCaptcha">
                                        {{ !sended ? "获取验证码" : `已发送(${timer})` }}
                                    </v-btn>
                                </template>
                            </v-text-field>
                            <v-text-field 
                                v-model="formData.password" :rules="[validatePwd]" label="密码" type="password"
                                variant="underlined" />
                            <v-text-field 
                                v-model="pwdAgain" :rules="[samePwd]" label="重复密码" type="password"
                                variant="underlined" />
                            <div class="d-flex justify-space-between">
                                <p class="text-red-darken-1">
                                    {{ prompt }}
                                </p>
                                <div>
                                    <span>已经有账号了？</span>
                                    <a href="/login">立即登录</a>
                                </div>
                            </div>
                        </v-form>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn 
                            color="primary" :disabled="!valid || !formData.captcha.length || !pwdAgain.length"
                            @click="signUp">
                            注册
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { validateCapt, validatePwd } from '~/utils/validation';

const valid = ref(false);
const mailError = ref(false);
const pwdAgain = ref("");
const sended = ref(false);
const CAPTCHA_TIME_GAP = 10;
const timer = ref(CAPTCHA_TIME_GAP);
const prompt = ref("");

const formData = ref({
    password: "",
    email: "",
    captcha: "",
});

const sendCaptcha = async () => {
    await $fetch("/api/captcha", {
        method: "POST",
        body: {
            email: formData.value.email,
        }
    })

    sended.value = true;
    const intervalId = setInterval(() => {
        timer.value -= 1;
        if (timer.value == 0) {
            sended.value = false;
            timer.value = CAPTCHA_TIME_GAP;
            clearInterval(intervalId);
        }
    }, 1000);
};

const signUp = async () => {
    prompt.value = " ";
    try {
        const res = await $fetch('/api/signup', {
            method: 'POST',
            body: formData.value
        });
        if (res.status == "ok") {
            const router = useRouter();
            router.replace({ path: '/login' })
        } else {
            prompt.value = res.message;
        }
    }
    catch (e) {
        console.log(JSON.stringify(e));
    };
};

const samePwd = (v: string): boolean | string => {
    if (v === formData.value.password)
        return true;
    else
        return "两次密码不一致";
}

</script>
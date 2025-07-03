/**
 * 验证邮箱地址格式是否合法
 * @param email - 待验证的邮箱地址
 * @returns 合法返回 true，不合法返回原因。用于表 vuetify 的表单验证。
 */
export function validateEmail(email: string): boolean | string {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
        return "邮箱地址不能为空";
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length > 254) {
        return "邮箱地址长度不能超过254个字符";
    }

    if (!emailRegex.test(trimmedEmail)) {
        return "邮箱地址格式不正确";
    }

    if (trimmedEmail.includes("..")) {
        return "邮箱地址中不能连续出现点号";
    }

    const atIndex = trimmedEmail.indexOf("@");
    if (atIndex === 0 || atIndex === trimmedEmail.length - 1) {
        return "@符号前后必须有字符";
    }

    return true;
}

/**
 * 验证邮箱是不是以指定的后缀结尾
 * @param email 邮箱地址
 * @returns 合法返回 true，不合法返回原因。
 */
export function validateEmailDomain(email: string): boolean | string {
    const trimmedEmail = email.trim();
    const config = useRuntimeConfig();
    const domain = config.public.requiredEmailDomain;
    if (domain.length != 0 && !trimmedEmail.endsWith(domain))
        return "请使用指定的邮箱注册";
    return true;
}


export function validatePwd(v: string): boolean | string {
    if (v.length < 8) return "密码至少长八位";
    return true;
}

export function validateCapt(v: string): boolean | string {
    if (v.length != 6) return "请输入六位验证码";
    return true;
}


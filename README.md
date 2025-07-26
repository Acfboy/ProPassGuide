# 专业通关指南

## 动机

现有的专业指南方案如[浙大图灵班学习指南](https://zju-turing.github.io/TuringCourses/)使用 mkdocs，不方便其它专业背景的同学部署和使用。我们试图制作一个方便使用的类似文档系统，支持由培养计划、课表导入课程安排、验证学校邮箱登录、修改指南、提交选课评价等。

## 部署

将以下内容保存至 `docker-compose.yml`

```yml
version: '3'

services:
  nuxt-app:
    image: acfboy/pro-pass-guide:latest  
    container_name: pro-pass-guide
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
    environment:
      - NUXT_PUBLIC_SITE_TITLE=兰州大学专业通关指南
      - NUXT_PUBLIC_SITE_SUBTITLE=面向全校同学的专业学习经验总结分享平台。凭学校邮箱可注册并提交你的贡献。
      - NUXT_MONGO_DB_URL=mongodb://mongo:27017/
      - NUXT_PUBLIC_REQUIRED_EMAIL_DOMAIN=限制域名后缀
      - NUXT_SESSION_PASSWORD=随机串
      - NUXT_MAIL_PASSWORD=邮件 smtp 密码
      - NUXT_MAIL_HOST=邮件验证码 smtp 地址
      - NUXT_MAIL_USER=邮件账号
      - NUXT_MAIL_HOSTNAME=邮件验证码名字
      - NUXT_UPLOAD_DIR=/app/uploads
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:latest
    container_name: mongo
    volumes:
      - ./mongo-data:/data/db
    ports:
      - "27017:27017"
    restart: always
```

然后在目录下运行 

```bash
docker compose up
```

访问 localhost:3000 即可看到首页。

## 贡献

项目采用 Nuxt.js 框架，Vuetify 作为 UI 框架。欢迎任何形式的贡献。
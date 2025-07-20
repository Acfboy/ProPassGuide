<template>
  <div class="d-flex">
    <v-menu v-if="schoolMajors" open-on-hover offset-y :close-on-content-click="false" attach="body">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" append-icon="mdi-chevron-down">选择专业</v-btn>
      </template>
      <v-card>
        <v-card-text class="overflow-auto-x" style="width: 60em">
          <v-row>
            <v-col v-for="j in 3" :key="j">
              <v-expansion-panels variant="accordion" flat width="20em">
                <v-expansion-panel
                  v-for="i in Math.min(Math.floor((schoolMajors.length + 2) / 3), schoolMajors.length - Math.floor((schoolMajors.length + 2) / 3) * (j - 1))"
                  :key="i" max-width="20em"
                  :title="schoolMajors[i - 1 + (j - 1) * Math.floor((schoolMajors.length + 2) / 3)][0]">
                  <v-expansion-panel-text>
                    <v-list-item
                      v-for="m in schoolMajors[i - 1 + (j - 1) * Math.floor((schoolMajors.length + 2) / 3)][1]"
                      :key="m.major_id" :title="m.name" density="compact" :to="`/docs/${m.major_id}`">
                      <template #prepend>
                        <v-icon>mdi-book-education-outline</v-icon>
                      </template>
                    </v-list-item>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-btn variant="text" class="ml-6" to="/docs/0/0" :active="false">简介</v-btn>
    <div class="top-tabs-searchbar ml-6">
      <SearchBar />
    </div>
  </div>

  <v-divider vertical />

  <div>
    <v-btn v-if="!loggedIn" class="ml-2 mr-2" append-icon="mdi-loggin"
      @click="navigateTo(`/login?redirect=${$route.path}`)">登录</v-btn>
    <v-menu v-else open-on-hover>
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="ml-2 mr-2" append-icon="mdi-chevron-down">操作</v-btn>
      </template>
      <v-list density="compact">
        <v-list-item prepend-icon="mdi-account" title="个人中心" to="/user" />
        <v-list-item prepend-icon="mdi-book-edit" title="编辑" to="/edit" />
        <v-list-item v-if="(user as { admin: boolean }).admin" prepend-icon="mdi-check-underline" title="审核"
          to="/review" />
        <v-list-item prepend-icon="mdi-logout" title="登出" @click="clear" />
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '~/components/SearchBar.vue';

const { loggedIn, user, clear } = useUserSession();

const requestFetch = useRequestFetch();
/**
 * 获得各个学院下的专业
 */
const { data: schoolMajors } = await useAsyncData("majors-topbar", () =>
  requestFetch<Major[]>("/api/majors", {
    method: "GET",
    query: {
      accepted: true
    }
  }).then((res) => {
    const schoolMajors = new Map<string, Major[]>();
    res.forEach((major) => {
      if (!major.major_id)
        return;
      if (!(schoolMajors.has(major.school)))
        schoolMajors.set(major.school, [major]);
      else
        schoolMajors.get(major.school)?.push(major);
    });
    return schoolMajors.entries().toArray();
  })
)

</script>

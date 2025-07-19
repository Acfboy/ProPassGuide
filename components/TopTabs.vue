<template>
  <div class="top-tabs-menu d-flex align-center">


    <v-menu v-if="schoolMajors" open-on-hover offset-y :close-on-content-click="false" attach="body" :z-index="2500">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text">选择专业</v-btn>
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
                    <!-- <v-list density="compact"> -->
                      <v-list-item
                        v-for="m in schoolMajors[i - 1 + (j - 1) * Math.floor((schoolMajors.length + 2) / 3)][1]"
                        :key="m.major_id" :title="m.name" density="compact" :to="`/docs/${m.major_id}`">
                      <template #prepend>
                        <v-icon>mdi-book-education-outline</v-icon>
                      </template>
                      </v-list-item>
                    <!-- </v-list> -->
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card-text>
        <!-- {{ schoolMajors.length }} -->
      </v-card>
      <!-- <div class="menu-list-wide" v-if="schoolMajors">
        <div class="schools-grid-2col">
          <div class="schools-col">
            <div v-for="[school, majors] in leftSchools" :key="school" class="school-cell">
              <div class="school-title-row" @click="setOpenGroup('left', school)">
                <span class="school-title">{{ school }}</span>
                <v-icon v-if="openGroupLeft === school" class="ml-1">mdi-chevron-down</v-icon>
                <v-icon v-else class="ml-1">mdi-chevron-right</v-icon>
              </div>
              <transition name="fade">
                <div v-if="openGroupLeft === school" class="majors-grid">
                  <div v-for="item in majors" :key="item.major_id" class="major-cell major-link" @click.stop="goToDoc(item)">
                    <span class="major-title">{{ item.name }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <div class="schools-col">
            <div v-for="[school, majors] in rightSchools" :key="school" class="school-cell">
              <div class="school-title-row" @click="setOpenGroup('right', school)">
                <span class="school-title">{{ school }}</span>
                <v-icon v-if="openGroupRight === school" class="ml-1">mdi-chevron-down</v-icon>
                <v-icon v-else class="ml-1">mdi-chevron-right</v-icon>
              </div>
              <transition name="fade">
                <div v-if="openGroupRight === school" class="majors-grid">
                  <div v-for="item in majors" :key="item.major_id" class="major-cell major-link" @click.stop="goToDoc(item)">
                    <span class="major-title">{{ item.name }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div> -->
    </v-menu>

    <v-btn variant="text" class="ml-6">快速上手</v-btn>

    <div class="top-tabs-searchbar ml-6">
      <SearchBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '~/components/SearchBar.vue';

const requestFetch = useRequestFetch();
/**
 * 获得各个学院下的专业
 */
const { data: schoolMajors } = await useAsyncData("majors", () =>
  requestFetch<Major[]>("/api/majors", {
    method: "GET",
    query: {
      accepted: true
    }
  }).then((res) => {
    const schoolMajors = new Map<string, Major[]>();
    res.forEach((major) => {
      if (!(schoolMajors.has(major.school)))
        schoolMajors.set(major.school, [major]);
      else
        schoolMajors.get(major.school)?.push(major);
    });
    return schoolMajors.entries().toArray();
  })
)

</script>

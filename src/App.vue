<template>
    <Transition>
        <div
            class="absolute top-0 left-0 flex justify-center items-center w-full h-screen bg-splash-100 text-white text-2xl font-bold z-10"
            v-if="showSplashScreen"
        >
            <div class="text-center">
                <img class="w-[15rem] pulse" src="/assets/dusty_splash.png" />
                <div class="heart-rate w-[15rem]">
                    <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        x="0px"
                        y="0px"
                        width="150px"
                        height="73px"
                        viewBox="0 0 150 73"
                        enable-background="new 0 0 150 73"
                        xml:space="preserve"
                    >
                        <polyline
                            fill="none"
                            stroke="#453A39"
                            stroke-width="3"
                            stroke-miterlimit="10"
                            points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,
              63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"
                        />
                    </svg>
                    <div class="fade-in"></div>
                    <div class="fade-out"></div>
                </div>
            </div>
        </div>
    </Transition>
    <router-view v-show="!showSplashScreen" v-slot="{ Component }">
        <component :is="Component" />
    </router-view>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";

const title = ref("Dusty");
const showSplashScreen = ref(false);

onBeforeMount(async () => {
    if (
        window.location.pathname === "/chat" ||
        window.location.pathname === "/settings"
    ) {
        showSplashScreen.value = true;
        await new Promise((resolve) => setTimeout(resolve, 1800));
        showSplashScreen.value = false;
    }
});
</script>

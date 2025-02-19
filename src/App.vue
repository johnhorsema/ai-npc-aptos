<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" />
    </router-view>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
</script>

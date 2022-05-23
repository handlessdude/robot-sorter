<script setup lang="ts">
import { useInputsStore } from "@/stores/inputs";
import { ref } from "vue";
const inputs = useInputsStore();
const myCanvas = ref(null);
</script>

<template>
  <div class="board">
    <canvas id="outputCanvas" ref="myCanvas"></canvas>
  </div>
</template>

<style scoped lang="scss"></style>

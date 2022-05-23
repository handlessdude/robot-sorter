<script setup lang="ts">
import { useInputsStore } from "@/stores/inputs";
const inputs = useInputsStore();
</script>

<template>
  <div class="inputs-form">
    <input type="number" v-model="inputs.lineVelocity" />
    <input type="number" v-model="inputs.activityR" />
    <input type="number" v-model="inputs.driveMaxVelocity" />
    <input type="number" v-model="inputs.bearingMaxVelocity" />
    <input type="number" v-model="inputs.manipulatorCount" />
  </div>
</template>

<style scoped></style>

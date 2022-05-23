<script setup lang="ts">
import NavHeader from "./components/NavHeader.vue";
import InputsForm from "./components/InputsForm.vue";
import MyCanvas from "./components/MyCanvas.vue";

//
//
import { useInputsStore } from "@/stores/inputs";
const inputs = useInputsStore();
//
</script>

<template>
  <NavHeader />

  <main>
    <MyCanvas />
    <InputsForm />
  </main>
</template>

<style>
@import "./assets/base.css";
</style>

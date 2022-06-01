<script setup lang="ts">
import ModalWindow from "@/components/ModalWindow.vue";
import { ref } from "vue";
const showModal = ref(false);
const toggleModal = () => (showModal.value = !showModal.value);
</script>

<template>
  <header class="header">
    <div class="info">
      <h1 class="header--title">ROBOT SORTER</h1>
    </div>
    <div class="controls">
      <h3 @click="toggleModal" class="focusable">Help</h3>
    </div>
  </header>
  <ModalWindow v-bind="{ showModal, toggleModal }">
    <h2>Instructions</h2>
    <li>Select objects items will appear on lines</li>
    <li>Press "PICK MANIPULATORS" button and click on white space to place them, to delete them click again, Press "STOP PICKING" in the end</li>
    <li>Press "PICK BINS" button and click on white space, to delete them click again, Press "STOP PICKING" in the end</li>
    <li>One bin appears for each item in the order on the screen</li>
    <li>To regulate speed of procesess use forms</li>
  </ModalWindow>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  height: 5rem;
  background: linear-gradient(
    90deg,
    var(--header-color) 1.18%,
    var(--header-color2) 100%
  );
  color: white;
  padding: 0.5rem 1.5rem 0.5rem 1.5rem;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
}

.header--image {
  height: 100%;
  margin-right: 6px;
}

.header--title {
  font-size: 1.5rem;
  //margin-right: auto;
}

.info {
  margin-right: auto;
  display: flex;
  align-items: center;

  .btn {
    margin-left: 1rem;
    height: 50%;
  }
}
</style>

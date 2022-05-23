<script setup lang="ts"></script>

<template>
  <header class="header">
    <div class="controls">
      <h1 class="header--title">ROBOT SORTER</h1>
    </div>
  </header>
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

.controls {
  margin-right: auto;
  display: flex;
  align-items: center;

  .btn {
    margin-left: 1rem;
    height: 50%;
  }
}
</style>

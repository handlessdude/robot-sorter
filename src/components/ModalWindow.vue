<script setup lang="ts">
const props = defineProps<{
  showModal: boolean;
  toggleModal: () => void;
  customClass?: string;
}>();
</script>

<template>
  <transition name="modal-animation">
    <div v-show="props.showModal" @click.self="props.toggleModal" class="modal">
      <transition name="modal-animation-inner">
        <div v-show="props.showModal" class="modal-inner">
          <!-- Modal Content -->
          <slot />
          <button @click="props.toggleModal" type="button" class="btn">
            Close
          </button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background-color: rgba(255, 255, 255, 0.089);
  .modal-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--dark-gray);
    position: relative;

    // max-width: 640px;
    // width: 80%;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background: #fff;
    padding: 1rem;
    .btn {
      padding: 20px 30px;
      border: none;
      background-color: crimson;
      cursor: pointer;
    }
  }
}

.modal-animation-enter-active,
.modal-animation-leave-active {
  transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.modal-animation-enter-from,
.modal-animation-leave-to {
  opacity: 0;
}
.modal-animation-inner-enter-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02) 0.15s;
}
.modal-animation-inner-leave-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.modal-animation-inner-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.modal-animation-inner-leave-to {
  transform: scale(0.8);
}
</style>

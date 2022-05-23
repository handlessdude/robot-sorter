<script setup lang="ts">
import { useInputsStore } from "@/stores/inputs";
const inputs = useInputsStore();
</script>

<template>
  <div class="inputs-form">
    <div class="card num-inputs">
      <input type="number" v-model="inputs.lineVelocity" />
      <input type="number" v-model="inputs.activityR" />
      <input type="number" v-model="inputs.driveMaxVelocity" />
      <input type="number" v-model="inputs.bearingMaxVelocity" />
      <input type="number" v-model="inputs.manipulatorCount" />
    </div>

    <div class="items-checked">
      <input
        type="checkbox"
        id="bottle"
        value="bottle"
        v-model="inputs.items"
      />
      <label for="bottle">Bottle</label>

      <input type="checkbox" id="cup" value="cup" v-model="inputs.items" />
      <label for="cup">Сup</label>

      <input
        type="checkbox"
        id="banana"
        value="banana"
        v-model="inputs.items"
      />
      <label for="banana">Banana</label>

      <input type="checkbox" id="apple" value="apple" v-model="inputs.items" />
      <label for="apple">Apple</label>

      <input type="checkbox" id="pizza" value="pizza" v-model="inputs.items" />
      <label for="pizza">Pizza</label>

      <input type="checkbox" id="cake" value="cake" v-model="inputs.items" />
      <label for="cake">Cake</label>

      <input type="checkbox" id="clock" value="clock" v-model="inputs.items" />
      <label for="clock">Clock</label>
    </div>
  </div>
</template>

<style scoped lang="scss">
.num-inputs {
  display: flex;
  flex-direction: column;
}
.items-checked {
  display: grid;
  grid-template: 40px 40px / 1fr 1fr;
}
</style>

<script setup lang="ts">
import { useInputsStore } from "@/stores/inputs";
import { useWorldState } from "@/stores/worldState";
const inputs = useInputsStore();
const worldState = useWorldState();
</script>

<template>
  <div class="inputs-overlay">
    <div class="inputs-form card">
      <!-- <h3>{{ inputs.items }}</h3> -->
      <!-- <h3>{{ worldState.traffic }}</h3> -->
      <h4>Please enter parameters of the manipulation system:</h4>
      <div class="num-inputs">
        <input
          type="number"
          id="lineVelocity"
          min="0"
          step="any"
          v-model="inputs.lineVelocity"
        />
        <label for="lineVelocity">Line velocity</label>

        <input
          type="number"
          id="activityR"
          min="0"
          step="any"
          v-model="inputs.activityR"
        />
        <label for="activityR">Radius of manipulator activity</label>

        <input
          type="number"
          id="driveMaxVelocity"
          min="0"
          step="any"
          v-model="inputs.driveMaxVelocity"
        />
        <label for="driveMaxVelocity">Drive max velocity</label>

        <input
          type="number"
          id="bearingMaxVelocity"
          min="0"
          step="any"
          v-model="inputs.bearingMaxVelocity"
        />
        <label for="bearingMaxVelocity">Bearing max velocity</label>

        <input
          type="number"
          id="manipulatorCount"
          min="1"
          step="1"
          v-model="inputs.manipulatorCount"
        />
        <label for="manipulatorCount">Manipulator count</label>
      </div>

      <h4>Please select items to put on the line:</h4>
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
          id="donut"
          value="donut"
          v-model="inputs.items"
        />
        <label for="donut">Donut</label>

        <input
          type="checkbox"
          id="banana"
          value="banana"
          v-model="inputs.items"
        />
        <label for="banana">Banana</label>

        <input
          type="checkbox"
          id="apple"
          value="apple"
          v-model="inputs.items"
        />
        <label for="apple">Apple</label>

        <input
          type="checkbox"
          id="pizza"
          value="pizza"
          v-model="inputs.items"
        />
        <label for="pizza">Pizza</label>

        <input type="checkbox" id="cake" value="cake" v-model="inputs.items" />
        <label for="cake">Cake</label>

        <input
          type="checkbox"
          id="clock"
          value="clock"
          v-model="inputs.items"
        />
        <label for="clock">Clock</label>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inputs-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}
.inputs-form.card {
  padding: 0 1.5rem 0 1.5rem;
}
.num-inputs {
  display: grid;
  grid-template: 40px 40px 40px 40px 40px / 100px 1fr;
  grid-gap: 1rem;
  label {
    margin-left: 1rem;
  }
}
.items-checked {
  width: 100%;
  display: grid;
  grid-template: 40px 40px / 20px 1fr 20px 1fr 20px 1fr 20px 1fr;
}
</style>

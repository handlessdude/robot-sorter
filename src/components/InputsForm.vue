<script setup lang="ts">
import { useInputsState } from "@/stores/inputsState";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { ref, watch, type Ref } from "vue";
const inputs = useInputsState();
let worldCanvas: HTMLCanvasElement;

enum InputMode {
  MANIPS = "manips",
  BINS = "bins",
  NONE = "none",
}
/*ну простите за костыль мне надоело делать ифы*/
watch(
  () => inputs.binsLen,
  () => {
    if (inputs.binsLen === inputs.data.items.length) {
      inputMode.value = InputMode.NONE;
    }
  }
);
const inputMode: Ref<InputMode> = ref(InputMode.NONE);
const toggleInputMode = (mode: InputMode) => {
  if (inputMode.value === InputMode.NONE) {
    worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;
    worldCanvas.addEventListener("click", placeEntity, false);
    inputMode.value = mode;
    return;
  }
  if (inputMode.value === mode) {
    inputMode.value = InputMode.NONE;
    worldCanvas.removeEventListener("click", placeEntity);
    return;
  }
};

function placeEntity(event: MouseEvent) {
  const canvasLeft = worldCanvas.offsetLeft + worldCanvas.clientLeft,
    canvasTop = worldCanvas.offsetTop + worldCanvas.clientTop;
  const x = event.pageX - canvasLeft;
  const y = event.pageY - canvasTop - worldConstants.HEADER_OFFSET;
  if (inputMode.value === InputMode.MANIPS) {
    inputs.pushNewManip(x, y);
    return;
  }
  if (inputMode.value === InputMode.BINS) {
    inputs.pushNewBin(x, y);
  }
}
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
          :disabled="inputs.submitted"
          v-model="inputs.data.lineVelocity"
        />
        <label for="lineVelocity">Line velocity</label>

        <input
          type="number"
          id="activityR"
          min="0"
          step="any"
          :disabled="inputs.submitted"
          v-model="inputs.data.activityR"
        />
        <label for="activityR">Radius of manipulator activity</label>

        <input
          type="number"
          id="driveMaxVelocity"
          min="0"
          step="any"
          :disabled="inputs.submitted"
          v-model="inputs.data.driveMaxVelocity"
        />
        <label for="driveMaxVelocity">Drive max velocity</label>

        <input
          type="number"
          id="bearingMaxVelocity"
          min="0"
          step="any"
          :disabled="inputs.submitted"
          v-model="inputs.data.bearingMaxVelocity"
        />
        <label for="bearingMaxVelocity">Bearing max velocity</label>

        <input
          type="number"
          id="manipulatorCount"
          min="1"
          step="1"
          :disabled="inputs.submitted"
          v-model="inputs.data.manipulatorCount"
        />
        <label for="manipulatorCount">Manipulator count</label>
      </div>

      <h4>Please select items to put on the line:</h4>
      <div class="items-checked">
        <input
          type="checkbox"
          id="bottle"
          value="bottle"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="bottle">Bottle</label>

        <input
          type="checkbox"
          id="cup"
          value="cup"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="cup">Сup</label>

        <input
          type="checkbox"
          id="donut"
          value="donut"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="donut">Donut</label>

        <input
          type="checkbox"
          id="banana"
          value="banana"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="banana">Banana</label>

        <input
          type="checkbox"
          id="apple"
          value="apple"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="apple">Apple</label>

        <input
          type="checkbox"
          id="pizza"
          value="pizza"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="pizza">Pizza</label>

        <input
          type="checkbox"
          id="cake"
          value="cake"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="cake">Cake</label>

        <input
          type="checkbox"
          id="clock"
          value="clock"
          :disabled="inputs.submitted"
          v-model="inputs.data.items"
        />
        <label for="clock">Clock</label>
      </div>

      <div class="control-btns">
        <button
          id="manips"
          class="btn picking manips"
          :disabled="inputs.submitted || inputMode === InputMode.BINS"
          @click="() => toggleInputMode(InputMode.MANIPS)"
        >
          {{
            inputMode === InputMode.MANIPS
              ? "Stop picking"
              : "Pick manipulators"
          }}
        </button>
        <button
          id="bins"
          class="btn picking bins"
          :disabled="
            inputs.submitted ||
            inputMode === InputMode.MANIPS ||
            !inputs.nextTypeToPlaceBin //если нет бескорзинных типов предметов
          "
          @click="() => toggleInputMode(InputMode.BINS)"
        >
          {{ inputMode === InputMode.BINS ? "Stop picking" : "Pick bins" }}
        </button>
      </div>

      <hr
        style="
          margin: 1.5rem 0 1.5rem 0;
          height: 1px;
          borderwidth: 0;
          color: #ccc;
          backgroundcolor: #ccc;
          width: 100%;
        "
      />

      <div class="control-btns">
        <!-- || !inputs.isValid -->
        <button
          class="btn"
          :disabled="inputs.submitted"
          @click="inputs.startSimulation"
        >
          Start simulation
        </button>
        <button
          class="btn stop"
          :disabled="!inputs.submitted"
          @click="inputs.endSimulation"
        >
          End simulation
        </button>
      </div>
      <small v-if="!inputs.isValid && !inputs.errorEmpty">{{
        inputs.error
      }}</small>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inputs-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;
}
.inputs-form.card {
  padding: 0 1.3rem 1.3rem 1.3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  small {
    margin-top: 1rem;
  }
}
.num-inputs {
  width: 100%;
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

.control-btns {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<script setup lang="ts">
import { useInputsState } from "@/stores/inputsState";
import { useLineState } from "@/stores/lineState";
import { useTrafficState } from "@/stores/trafficState";
import { useWorldState } from "@/stores/worldState";

import { drawConstants } from "@/stupidConstants/drawConstants";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { distance } from "@/utils/utils";
import { ref, watch, type Ref } from "vue";
const inputs = useInputsState();
const lineState = useLineState();
const trafficState = useTrafficState();
const worldState = useWorldState();
let worldCanvas: HTMLCanvasElement;

enum InputMode {
  MANIPS = "manips",
  BINS = "bins",
  NONE = "none",
}
watch(
  () => inputs.data.items.length,
  () => {
    //console.log(inputs.data.bins);
    // inputs.data.bins.forEach((bin) =>
    //   console.log(bin.itemType, inputs.data.items.includes(bin.itemType))
    // );
    inputs.data.bins = inputs.data.bins.filter((bin) => {
      //console.log(bin.itemType, inputs.data.items.includes(bin.itemType));
      return inputs.data.items.includes(bin.itemType);
    });
  }
);
watch(
  () => [inputs.data.bins.length, inputs.data.manipulators.length],
  () => {
    if (!worldCanvas) {
      return;
    }
    const ctx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, worldCanvas.width, worldCanvas.height);
    worldState.drawWorld(ctx);

    // if (inputs.binsCount === inputs.data.items.length) {
    //   inputMode.value = InputMode.NONE;
    // }
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
  const y =
    event.pageY - canvasTop - drawConstants.CANVAS_SETTINGS.HEADER_OFFSET;

  if (inputMode.value === InputMode.MANIPS) {
    //if user clicks on existing manip, we remove it
    let found_manip = inputs.data.manipulators.find((manip) => {
      const dist = distance(manip.coordinates, { x, y });
      return dist <= manip.size_radius;
    });
    if (found_manip) {
      inputs.removeManip(found_manip.id);
      return;
    }

    //check whether user is trying to place new manip on the line
    if (
      x >=
        lineState.line.left -
          drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
          drawConstants.LINE_WIDTH &&
      x <=
        lineState.line.right +
          drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
          drawConstants.LINE_WIDTH
    )
      return;

    //check whether user is trying to place new manip outside canvas
    if (
      x <=
        drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
          drawConstants.LINE_WIDTH ||
      x >=
        drawConstants.CANVAS_SETTINGS.WORLD_CANVAS_WIDTH -
          drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
          drawConstants.LINE_WIDTH ||
      y <=
        drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
          drawConstants.LINE_WIDTH ||
      y >=
        window.innerHeight -
          drawConstants.CANVAS_SETTINGS.HEADER_OFFSET -
          drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
          drawConstants.LINE_WIDTH
    )
      return;

    //check whether new manip might overlap any other manips and bins
    //look for manips
    found_manip = inputs.data.manipulators.find((manip) => {
      const dist = distance(manip.coordinates, { x, y });
      return dist <= 2 * manip.size_radius + drawConstants.LINE_WIDTH;
    });
    if (found_manip) return;

    //look for bins
    let found_bin = inputs.data.bins.find((bin) => {
      let left_x_limit =
        bin.coordinates.x -
        drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
        drawConstants.LINE_WIDTH;
      let right_x_limit =
        bin.coordinates.x +
        worldConstants.BIN_SIZE.WIDTH +
        drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
        drawConstants.LINE_WIDTH;
      let up_y_limit =
        bin.coordinates.y -
        drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
        drawConstants.LINE_WIDTH;
      let down_y_limit =
        bin.coordinates.y +
        worldConstants.BIN_SIZE.HEIGHT +
        drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
        drawConstants.LINE_WIDTH;
      return (
        x >= left_x_limit &&
        x <= right_x_limit &&
        y >= up_y_limit &&
        y <= down_y_limit
      );
    });
    if (found_bin) return;

    //place new manip
    inputs.pushNewManip(x, y);
    return;
  }

  if (inputMode.value === InputMode.BINS) {
    //if user click on existing bin, we remove it
    let found_bin = inputs.data.bins.find((bin) => {
      let dist1 = x - bin.coordinates.x;
      let dist2 = y - bin.coordinates.y;
      return (
        dist1 >= 0 && dist1 <= bin.width && dist2 >= 0 && dist2 <= bin.height
      );
    });
    if (found_bin) {
      inputs.removeBin(found_bin.id);
      return;
    }

    //check whether user is trying to place bin on the line
    if (
      x >=
        lineState.line.left -
          worldConstants.BIN_SIZE.WIDTH -
          drawConstants.LINE_WIDTH &&
      x <= lineState.line.right + drawConstants.LINE_WIDTH
    )
      return;

    //check whether user is trying to place new manip outside canvas
    if (
      x <= drawConstants.LINE_WIDTH ||
      x >=
        drawConstants.CANVAS_SETTINGS.WORLD_CANVAS_WIDTH -
          worldConstants.BIN_SIZE.WIDTH -
          drawConstants.LINE_WIDTH ||
      y <= drawConstants.LINE_WIDTH ||
      y >=
        window.innerHeight -
          drawConstants.CANVAS_SETTINGS.HEADER_OFFSET -
          worldConstants.BIN_SIZE.HEIGHT -
          drawConstants.LINE_WIDTH
    )
      return;

    //check whether new bin might overlap any other bins and manips
    //look for bins
    found_bin = inputs.data.bins.find((bin) => {
      let left_x_limit =
        bin.coordinates.x -
        worldConstants.BIN_SIZE.WIDTH -
        drawConstants.LINE_WIDTH;
      let right_x_limit =
        bin.coordinates.x +
        worldConstants.BIN_SIZE.WIDTH +
        drawConstants.LINE_WIDTH;
      let up_y_limit =
        bin.coordinates.y -
        worldConstants.BIN_SIZE.HEIGHT -
        drawConstants.LINE_WIDTH;
      let down_y_limit =
        bin.coordinates.y +
        worldConstants.BIN_SIZE.HEIGHT +
        drawConstants.LINE_WIDTH;
      return (
        x >= left_x_limit &&
        x <= right_x_limit &&
        y >= up_y_limit &&
        y <= down_y_limit
      );
    });
    if (found_bin) return;

    //look for manips
    let left_x_limit =
      x -
      drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
      drawConstants.LINE_WIDTH;
    let right_x_limit =
      x +
      worldConstants.BIN_SIZE.WIDTH +
      drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
      drawConstants.LINE_WIDTH;
    let up_y_limit =
      y -
      drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS -
      drawConstants.LINE_WIDTH;
    let down_y_limit =
      y +
      worldConstants.BIN_SIZE.HEIGHT +
      drawConstants.MANIP_SETTINGS.MANIP_SIZE_RADIUS +
      drawConstants.LINE_WIDTH;
    let found_manip = inputs.data.manipulators.find((manip) => {
      return (
        manip.coordinates.x >= left_x_limit &&
        manip.coordinates.x <= right_x_limit &&
        manip.coordinates.y >= up_y_limit &&
        manip.coordinates.y <= down_y_limit
      );
    });
    if (found_manip) return;

    //place new bin
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
          max="1"
          step="0.1"
          :disabled="inputs.submitted"
          v-model="inputs.data.driveMaxVelocity"
        />
        <label for="driveMaxVelocity">Drive max velocity</label>

        <input
          type="number"
          id="bearingMaxVelocity"
          min="0"
          max="6.28"
          step="0.1"
          :disabled="inputs.submitted"
          v-model="inputs.data.bearingMaxVelocity"
        />
        <label for="bearingMaxVelocity">Bearing max velocity</label>
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
            inputs.data.items.length === 0
            //|| !inputs.nextTypeToPlaceBin //если нет бескорзинных типов предметов
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
  grid-template: 40px 40px 40px 40px / 100px 1fr;
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

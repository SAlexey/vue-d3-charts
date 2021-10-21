<template lang="pug">
.dv3-container
  .dv3-figure
    svg(ref="svg")
      g.plot(ref="plot")
        g.canvas(ref="canvas")
        g.xAxis(ref="xAxis")
        text.xLabel(ref="xLabel")
        g.yAxis(ref="yAxis")
        text.yLabel(ref="xLabel")
</template>
<script lang="ts">
import { defineComponent, onMounted, PropType } from "vue";
import { PlotProps, Margin, doPlot } from "@/plot";

const DEFAULT: PlotProps = {
  width: 250,
  height: 150,
  margin: { left: 40, top: 20, right: 20, bottom: 60 },
};

export default defineComponent({
  props: {
    height: { type: Number, default: () => DEFAULT.height },
    width: { type: Number, default: () => DEFAULT.width },
    margin: {
      type: Object as PropType<Margin>,
      default: () => DEFAULT.margin,
    },
  },
  setup(props: PlotProps) {
    const { container, fit } = doPlot(props);
    onMounted(() => {
      console.debug("mounting");
      fit.call(container, props);
    });
    return { ...container };
  },
});
</script>

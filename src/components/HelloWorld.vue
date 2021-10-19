<template lang="pug">
.text-center Histogram Plot 
histogram-plot()
.text-center SPC Plot
spc-plot(ref="spc" :xValue="(d)=>d.x" :yValue="(d)=>d.y" :data="data" :title="title" subtitle="Target Response" yLabel="Response" xLabel="Date")
button(@click="()=>{spc.updateSeries(generateData(Math.round(Math.random()*100)), false); title='Something'}") generate
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import HistogramPlot from "@/components/HistogramPlot.vue";
import SPCPlot from "@/components/SPCPlot.vue";

function generateData(n: number) {
  return Array(n)
    .fill(1)
    .map((d, i) => ({ x: i, y: Math.random() }));
}
export default defineComponent({
  components: {
    "spc-plot": SPCPlot,
    "histogram-plot": HistogramPlot,
  },
  setup() {
    const spc = ref(null);
    const data = ref(generateData(20));
    const title = ref("Boscalid");
    return { data, generateData, spc, title };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>

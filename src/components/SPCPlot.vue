<template lang="pug">
.plot-container
  .plot-title {{ title }}
  .plot-subtitle {{ subtitle }}
  svg.figure(:height="outerHeight" :width="outerWidth")
      g.main(:transform="`translate(${margin.left}, ${margin.top})`")
          g.yAxis(ref="yAxis")
          text.yLabel(v-if="yLabel" :transform="`translate(-45, ${outerHeight / 2}) rotate(-90)`" text-anchor="center") {{yLabel}}
          g.xAxis(ref="xAxis", :transform="`translate(0, ${height})`")
          text.xLabel(v-if="xLabel" :transform="`translate(${outerWidth / 2 - 50}, ${outerHeight - 25})`" text-anchor="center") {{xLabel}}
          g(ref="canvas")
  .plot-caption(v-if="caption") {{ caption }}
  .tooltip(v-show="tooltip.show" :style="{left: tooltip.x+ 'px', top: tooltip.y + 'px'}")
    .tooltip-title(v-if="tooltip.title") {{tooltip.title}}
    .tooltip-subtitle(v-if="tooltip.subtitle") {{tooltip.subtitle}}
    .tooltip-text(v-if="tooltip.text") {{tooltip.text}}
      
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  onMounted,
  reactive,
  watch,
} from "vue";
import { map, random, toNumber, round } from "lodash";
import {
  select,
  scaleLinear,
  axisBottom,
  axisLeft,
  mean,
  min,
  max,
  deviation,
  selectAll,
  BaseType,
} from "d3";
type ValueType = number | string;
type DatumType = Record<string, ValueType>;
type ValueGetter = (
  datum: DatumType,
  i?: number,
  data?: DatumType[]
) => number | string | Date;

const MARKER = "circle";

export default defineComponent({
  props: {
    height: { type: Number, default: () => 400 },
    width: { type: Number, default: () => 400 },
    data: { type: Array as PropType<DatumType[]>, default: () => [] },
    xValue: {
      type: Function as PropType<ValueGetter>,
      default: () => (d: number, i: number) => toNumber(i),
    },
    yValue: {
      type: Function as PropType<ValueGetter>,
      default: () => (d: number) => toNumber(d),
    },
    xLabel: String,
    yLabel: String,
    title: String,
    subtitle: String,
    caption: String,
    margin: {
      type: Object as PropType<{
        left: number;
        top: number;
        right: number;
        bottom: number;
      }>,
      default: () => ({ left: 60, top: 15, right: 15, bottom: 60 }),
    },
  },
  methods: {
    updateSeries(data: DatumType[], append: boolean) {
      if (!append) {
        this.series = data;
      } else {
        this.series = this.series.concat(data);
      }
    },
  },
  setup(props) {
    const canvas = ref<SVGGElement | null>(null);
    const xAxis = ref<SVGGElement | null>(null);
    const yAxis = ref<SVGGElement | null>(null);
    const outerWidth = props.width + props.margin.left + props.margin.right;
    const outerHeight = props.height + props.margin.top + props.margin.bottom;

    const x = scaleLinear([0, props.width]);
    const y = scaleLinear([props.height, 0]);

    const tooltip = reactive({
      x: 0,
      y: 0,
      show: false,
      text: "",
      title: "",
      subtitle: "",
    });

    const series = ref<DatumType[]>(props.data)

    watch(series, () => {
      draw(series.value);
    });

    function onMouseEnter(e: MouseEvent, d: DatumType) {
      selectAll(MARKER).attr("fill-opacity", 0.5);
      tooltip.show = true;
      tooltip.x = e.clientX + 10;
      tooltip.y = e.clientY + 10;
      tooltip.title = "Data Point";
      tooltip.text = `x: ${d.x} y: ${round(toNumber(d.y), 2)}`;
    }

    function onMouseOver(this: BaseType | SVGCircleElement, e: MouseEvent) {
      select(this).attr("fill-opacity", 1).attr("r", 8);
      tooltip.x = e.clientX + 10;
      tooltip.y = e.clientY + 10;
    }

    function onMouseLeave() {
      selectAll(MARKER).attr("r", 4).attr("fill-opacity", 1);
      tooltip.show = false;
    }

    const draw = (data: DatumType[]) => {
      let xMin, xMax, yMin, yMax;

      const xValue = (d: DatumType) => toNumber(props.xValue(d));
      const yValue = (d: DatumType) => toNumber(props.yValue(d));

      const xProj = (d: DatumType) => x(xValue(d));
      const yProj = (d: DatumType) => y(yValue(d));

      xMin = min(data, xValue) || 0;
      xMax = max(data, xValue) || 1;
      yMin = min(data, yValue) || 0;
      yMax = max(data, yValue) || 1;

      const xPad = (xMax - xMin) * 0.05;
      const yPad = (yMax - yMin) * 0.8;

      xMin -= xPad;
      xMax += xPad;

      yMin -= yPad;
      yMax += yPad;

      const mu = mean(data, yValue) || 0.5;
      const sig = deviation(data, yValue) || 0.125;

      const lines = [
        { y: mu, label: "µ", stroke: "slategray" },
        { y: mu + 1 * sig, label: "µ + 1σ", stroke: "orange" },
        { y: mu - 1 * sig, label: "µ - 1σ", stroke: "orange" },
        { y: mu + 2 * sig, label: "µ + 2σ", stroke: "red" },
        { y: mu - 2 * sig, label: "µ - 2σ", stroke: "red" },
      ];

      const fill = (d: DatumType) => {
        const dist = Math.sqrt((yValue(d) - mu) ** 2) / sig;
        if (dist <= 1) {
          return "green";
        } else if (dist > 1 && dist <= 2.0) {
          return "orange";
        } else {
          return "red";
        }
      };

      x.domain([xMin, xMax]).nice();
      y.domain([yMin, yMax]).nice();

      if (xAxis.value) {
        select(xAxis.value).call(axisBottom(x));
      }

      if (yAxis.value) {
        select(yAxis.value).call(axisLeft(y));
      }

      if (canvas.value) {
        const plot = select(canvas.value);

        plot
          .selectAll("circle")
          .data(data)
          .join("circle")
          .on("mouseenter", onMouseEnter)
          .on("mouseover", onMouseOver)
          .on("mouseleave", onMouseLeave)
          .transition()
          .attr("cx", xProj)
          .attr("cy", yProj)
          .attr("r", 4)
          .attr("fill", fill);

        plot
          .selectAll("line")
          .data(lines)
          .join("line")
          .transition()
          .attr("stroke", (d) => d.stroke)
          .attr("x1", 0)
          .attr("x2", props.width)
          .attr("y1", yProj)
          .attr("y2", yProj);
      }
    };

    onMounted(() => {
      draw(props.data);
    });

    return { outerWidth, outerHeight, canvas, xAxis, yAxis, tooltip, series };
  },
});
</script>
<style lang="scss" scoped>
.plot-container {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.plot-title,
.plot-caption {
  text-align: left;
}

.plot-subtitle {
  color: grey;
  text-align: left;
}
.tooltip {
  padding: 8px;
  border: 2px solid black;
  position: absolute;
  background-color: lightgrey;
}
</style>

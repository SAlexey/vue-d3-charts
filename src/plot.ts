import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import { ScaleContinuousNumeric, scaleLinear } from "d3-scale";
import { Ref, ref } from "vue";

type Data = Iterable<unknown>;

export type Margin = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ContainerProps = {
  width: number;
  height: number;
  margin: Margin;
};

export type FigureProps = ContainerProps & {
  x: { kind: string; domain?: [number, number]; range?: [number, number] };
  y: { kind: string; domain?: [number, number]; range?: [number, number] };
};

export type Container = {
  svg: Ref<SVGElement | null>;
  plot: Ref<SVGGElement | null>;
  canvas: Ref<SVGGElement | null>;
  xAxis: Ref<SVGElement | null>;
  xLabel: Ref<SVGGElement | null>;
  yAxis: Ref<SVGGElement | null>;
  yLabel: Ref<SVGGElement | null>;
};

export interface Figure {
  xScale: ScaleContinuousNumeric<number, number>;
  yScale: ScaleContinuousNumeric<number, number>;

  init: (data: Data[], props: FigureProps) => void;
}

export function doPlot(): {
  container: Container;
  fit: (props: ContainerProps) => void;
} {
  const container: Container = {
    svg: ref<SVGElement | null>(null),
    plot: ref<SVGGElement | null>(null),
    canvas: ref<SVGGElement | null>(null),
    xAxis: ref<SVGElement | null>(null),
    xLabel: ref<SVGGElement | null>(null),
    yAxis: ref<SVGGElement | null>(null),
    yLabel: ref<SVGGElement | null>(null),
  };

  function fit(this: Container, props: ContainerProps) {
    const { height, width, margin } = props;

    const outerHeight = height + margin.top + margin.bottom;
    const outerWidth = width + margin.left + margin.right;

    this.svg.value &&
      select(this.svg.value)
        .attr("width", outerWidth)
        .attr("height", outerHeight);

    this.plot.value &&
      select(this.plot.value).attr(
        "transform",
        `translate(${margin.left}, ${margin.top})`
      );

    this.xAxis.value &&
      select(this.xAxis.value).attr("transform", `translate(0, ${height})`);

    this.xLabel.value &&
      select(this.xLabel.value).attr(
        "transform",
        `translate(0, ${height + 20})`
      );
  }

  return { container, fit };
}

export function doScatter(data: Data, props: FigureProps): Figure {
  const xScale = scaleLinear();
  const yScale = scaleLinear();

  return {
    xScale,
    yScale,
    init: () => {
      null;
    },
  };
}

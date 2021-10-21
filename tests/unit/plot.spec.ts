import { shallowMount } from "@vue/test-utils";
import Plot from "@/components/Plot.vue";
describe("Plot.vue", () => {
  it("should have crucial elements", () => {
    const wrapper = shallowMount(Plot);
    expect(wrapper.find("svg")).toBeTruthy();
    expect(wrapper.find("g.plot")).toBeTruthy();
    expect(wrapper.find("g.canvas")).toBeTruthy();
    expect(wrapper.find("g.xAxis")).toBeTruthy();
    expect(wrapper.find("g.xLabel")).toBeTruthy();
    expect(wrapper.find("g.yAxis")).toBeTruthy();
    expect(wrapper.find("g.yLabel")).toBeTruthy();
  });

  it("should apply dimensions", () => {
    const wrapper = shallowMount(Plot, {
      props: {
        height: 100,
        width: 100,
        margin: { left: 10, top: 10, right: 10, bottom: 10 },
      },
    });

    // check that the height and the width are assigned from props
    const svg = wrapper.find("svg");
    expect(svg.element.getAttribute("height")).toBe("120");
    expect(svg.element.getAttribute("width")).toBe("120");

    // check that the plot is translated
    const plot = wrapper.find("g.plot");
    expect(plot.element.getAttribute("transform")).toBe("translate(10, 10)");

    const xAxis = wrapper.find("g.xAxis")
    expect(xAxis.element.getAttribute("transform")).toBe("translate(0, 100)");

    const xLabel = wrapper.find("text.xLabel")
    expect(xLabel.element.getAttribute("transform")).toBe("tranalate(50, 100)")
  });
});

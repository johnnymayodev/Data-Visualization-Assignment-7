import React, { Component } from "react";
import * as d3 from "d3";

class Child1 extends Component {
  componentDidMount() {
    console.log(this.props.csv_data);
    this.createGraph();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.csv_data !== this.props.csv_data && this.props.csv_data) {
      console.log(this.props.csv_data);
      this.createGraph();
    }
  }

  createGraph() {
    d3.select("#graph").selectAll("*").remove();

    const data = this.props.csv_data;
    if (!data || !data.length) return;

    const margin = { top: 0, right: 0, bottom: 0, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const groupedData = d3.group(data, (d) => d.Month);

    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);

    const yScale = d3
      .scalePoint()
      .domain(["March", "April", "May"])
      .range([margin.top, height - margin.bottom])
      .padding(0.5);

    svg
      .selectAll(".month-label")
      .data([...groupedData.keys()])
      .enter()
      .append("text")
      .attr("class", "month-label")
      .attr("y", (d) => yScale(d))
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", "14px")
      .text((d) => d);

    const tooltip = d3.select("#graph").append("div").attr("class", "tooltip").style("opacity", 0);

    const nodes = data.map((d) => ({
      ...d,
      x: width / 2,
      y: yScale(d.Month),
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(width / 2).strength(0.0125))
      .force("y", d3.forceY((d) => yScale(d.Month)).strength(0.5))
      .force("collide", d3.forceCollide(6))
      .stop();

    for (let i = 0; i < 120; i++) simulation.tick();

    const circles = svg
      .selectAll(".tweet-circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "tweet-circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 4)
      .attr("fill", (d) => sentimentColorScale(d.Sentiment))
      .attr("stroke", "none")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        tooltip.transition().style("opacity", 1);
        tooltip
          .html(d.RawTweet)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().style("opacity", 0);
      })
      .on("click", (event, d) => {
        const selectedNode = d3.select(event.target);
        if (selectedNode.attr("stroke") === "black") {
          selectedNode.attr("stroke", "none");
        } else {
          selectedNode.attr("stroke", "black");
        }
        this.handleTweetSelection(d);
      });

    const controlsGroup = d3
      .select("#graph")
      .append("div")
      .style("position", "absolute")
      .style("top", `${margin.top + 150}px`)
      .style("left", `${margin.left + width + 50}px`);

    const legendWidth = 50;
    const legendHeight = 200;

    const legendSvg = controlsGroup
      .append("svg")
      .attr("width", legendWidth + 50)
      .attr("height", legendHeight);

    const legendGradient = legendSvg.append("defs").append("linearGradient").attr("id", "legendGradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");

    legendGradient.append("stop").attr("offset", "0%").attr("stop-color", "red");
    legendGradient.append("stop").attr("offset", "50%").attr("stop-color", "#ECECEC");
    legendGradient.append("stop").attr("offset", "100%").attr("stop-color", "green");

    legendSvg.append("rect").attr("x", 0).attr("y", 0).attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#legendGradient)");

    legendSvg
      .selectAll(".legend-text")
      .data([-1, 0, 1])
      .enter()
      .append("text")
      .attr("y", (d, i) => i * (legendHeight / 2.125) + 8)
      .attr("x", legendWidth + 25)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text((d) => (d === 0 ? "Neutral" : d < 0 ? "Positive" : "Negative"));

    controlsGroup
      .append("select")
      .attr("id", "colorDropdown")
      .on("change", (event) => {
        const colorBy = event.target.value;
        const colorScale = colorBy === "Sentiment" ? sentimentColorScale : subjectivityColorScale;
        circles.attr("fill", (d) => colorScale(d[colorBy]));
      })
      .selectAll("option")
      .data(["Sentiment", "Subjectivity"])
      .enter()
      .append("option")
      .text((d) => d);

    d3.select("#colorDropdown").property("value", "Sentiment");
  }

  handleTweetSelection(tweet) {
    if (d3.select("#tweet-" + tweet.index).size() > 0) {
      d3.select("#tweet-" + tweet.index).remove();
      return;
    }

    const tweetDetails = d3
      .select("#tweet-details")
      .append("div")
      .attr("class", "tweet-details-container")
      .attr("id", "tweet-" + tweet.index);
    tweetDetails.append("p").style("font-size", "14px").style("line-height", "1.5").style("word-wrap", "break-word").text(tweet.RawTweet);
  }

  render() {
    return (
      <div className="Child1">
        <div id="graph" />
        <div id="legend" />
        <div id="tweet-details" />
      </div>
    );
  }
}

export default Child1;

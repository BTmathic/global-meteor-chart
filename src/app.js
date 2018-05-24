import 'normalize.css/normalize.css';
import './styles/styles.scss';
import * as d3 from 'd3';

fetch('https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json').then((response) => {
  return response.json();
}).then((data) => {
  let margin;
  let width, height;
  let flags = d3.select('#container').append('div');
  let svg = d3.select('#container').append('svg');
  let popup = d3.select('body').append('div');

  const nodes = data.nodes;
  const links = data.links;

  main();

  function main() {
    flags
      .attr('class', 'flags');
    popup
      .attr('class', 'tooltip')
      .style('opacity', 0);

    setSize(data)
    drawGraph(data);
  }
  

  function setSize(data) {
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
    width = 700 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
  }

  function drawGraph(data) {
    let simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d.index))
      .force('collide', d3.forceCollide((d) => d.r + 8).iterations(16))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(0))
      .force('y', d3.forceY(0));

    let link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', 'black')

    let nodes = d3.select('.flags').selectAll('img')
      .data(data.nodes)
      .enter()
      .append('img')
      .attr('src', 'dist/blank.gif')
      .attr('class', (d) => `flag flag-${d.code}`)
      .attr('alt', (d) => `${d.country} flag`)
      .on('mouseover', (d) => mouseover(d))
      .on('mouseout', mouseout)
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    let ticked = function() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
        .style('fill', 'none')
        .style('stroke', '#666')
        .style('stroke-width', '2px');

      nodes
        .style('left', (d) => d.x + 'px')
        .style('top', (d) => d.y + 'px')
    }

    simulation
      .nodes(data.nodes)
      .on('tick', ticked)

    simulation.force('link')
      .links(data.links);

    function dragStarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  function mouseover(d) {
    popup.transition()
      .duration(200)
      .style('opacity', 0.9)
      popup.html(`<div>${d.country}</div>`)
        .style('left', (d3.event.pageX + 5) + 'px')
        .style('top', (d3.event.pageY - 50) + 'px')
  }
  
  function mouseout() {
    popup.transition()
      .duration(500)
      .style('opacity', 0);
  }

});
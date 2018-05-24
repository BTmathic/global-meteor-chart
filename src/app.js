import 'normalize.css/normalize.css';
import './styles/styles.scss';
import * as d3 from 'd3';

function fetchData() {
  let list = [];
  let urls = ['https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', 'https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json'];
  let fetches = [];

  urls.forEach(function(url, i) {
    list.push(
      fetch(url)
        .then(dataWrappedInPromise => dataWrappedInPromise.json())
        .then((data) => {
          fetches[i] = data;
      })
    );
  });

  Promise
    .all(list)
    .then(function () {
      useData(fetches);
    });
}

fetchData();

function useData([meteorData, countryData]) {
  let margin;
  let width, height;
  let minZoom, maxZoom, midX, midY;
  let svg;
  let wholeMap, countries, projection;
  let path;
  let zoom = d3.zoom().on('zoom', zoomed);
  let popup = d3.select('body').append('div');

  main();

  function main() {
    svg = d3.select('#container').append('svg');
    wholeMap = svg.append('g').attr('id', 'map');
    setSize();
    setZoom();
    window.onresize = () => {
      svg
        .attr('width', document.getElementById('container').offsetWidth)
        .attr('height', document.getElementById('container').offsetHeight)
      setZoom()
    };

    countries = wholeMap
      .selectAll('path')
      .data(countryData.features).enter()
      .append('path')
      .attr('d', path)
      .attr('id', (d, i) => 'country' + d.properties.iso_a3)
      .attr('class', 'country')
      .on('mouseover', (d, i) => mouseover(d, i))
      .on('mouseout', mouseout);

    popup
      .attr('class', 'tooltip')
      .style('opacity', 0);

    drawMeteors();
  }

  function setSize() {
    margin = { top: 0, right: 0, bottom: 0, left: 0 };
    width = document.getElementById('container').offsetWidth - margin.left - margin.right;
    height = 0.9*document.getElementById('container').offsetHeight - margin.top - margin.bottom;

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(zoom);

    projection = d3.geoEquirectangular()
      .center([0, 0])
      .scale(width / (2 * Math.PI))
      .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);

    wholeMap
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);
  }

  function setZoom() {
    minZoom = Math.max(
      document.getElementById('container').offsetWidth / width,
      document.getElementById('container').offsetHeight / height
    );
    maxZoom = 20 * minZoom;
    zoom
      .scaleExtent([minZoom, maxZoom])
      .translateExtent([[0, 0], [width, height]]);

    midX = (document.getElementById('container').offsetWidth - minZoom * width) / 2;
    midY = (document.getElementById('container').offsetHeight - minZoom * height) / 2;
    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
  }

  function drawMeteors(meteorData) {

  }

  function zoomed() {
    const zoomTransform = d3.event.transform;
    wholeMap.attr(
      'transform',
      `translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k})`
    )
  }

  function mouseover(d, i) {
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
}
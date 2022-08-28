# Simple Mapper

A tool to create a map based on uploaded background (example: satellite image or floorplan)

## Demo

Screenshot with demo:
![Screenshot from the demo of the application](https://github.com/palprz/simple-mapper/blob/master/github/img/demo.png)

Gif presenting basic functionaliy:
![Gif with simple functionality of the application](https://github.com/palprz/simple-mapper/blob/master/github/img/demo.gif)

## Technologies

- HTML
- SCSS
- Angular 12
- [Konva library](https://konvajs.org/)

## Functionality

- add/modify/remove/move shapes and lines on canvas
- add/remove/move text on canvas
- upload/remove background from canvas
- change the offset for background
- change the size of canvas
- download created data
- upload previously saved data

## Run locally

If you would like to run locally, you should have installed `npm` and `angular` (version 12). 

Below steps to run locally:
- open the root of the `simple-mapper` project
- run in terminal: `npm install`
- after successed above command run: `ng serve`
- open browser with URL `localhost:4200`

### Potential improvements in the future 

- shortcuts (the most obvious will be CTRL+Z)
- split shapes
- duplicate shapes
- draw straight line by following X and/or Y aix
- able to change opacity of the background
- modify existing text
- change colours of shapes/lines/text
- rotate shapes/text
- scale shapes/text
- configurable margin to detect nearby point

### Additional info

[Information icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/information)

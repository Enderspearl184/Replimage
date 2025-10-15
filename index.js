// 16x16 for CubeNet pfps, not a technical limitation
const width = 16
const height = 16

const sharp = require('sharp')
const fs = require('fs')

const scriptTemplate = `local img = {
{PIXELDATA}}

return img[x+(width*y)+1]`

// may be inaccurate im taking these values from a screenshot
const colours = [
    // EMPTY (doesn't have an index as it's used when there's alpha. we must use index + 1 because of our sins though)
    [223,233,245], // WHITE
    [105,177,148], // GREY
    [16,21,23], // BLACK
    [247,170,168], // PEACH
    [212, 104, 154], // PINK
    [120,44,150], // PURPLE
    [232, 53, 98], // RED
    [242, 130, 92], // ORANGE
    [255, 199, 110], // YELLOW
    [136, 196, 77], // LIGHTGREEN
    [63, 158, 89], // GREEN
    [55, 52, 97], // DARKBLUE
    [72, 84, 168], // BLUE
    [113, 153, 217], // LIGHTBLUE
    [158, 82, 82], // BROWN
    [77, 37, 54], // DARKBROWN
]

function getClosestColourId(r,g,b,a) {
    // 0 is transparent
    if (a < 127) {
        return '0'
    }
    let closestDiff = Infinity
    let closestColourIndex = 0

    for (let i = 1; i <= colours.length; i++) {
        let colour = colours[i-1]
        let diff = Math.sqrt(Math.pow(colour[0] - r,2) + Math.pow(colour[1] - g,2) + Math.pow(colour[2] - b,2))
        //console.log(diff)
        if (diff < closestDiff) {
            closestDiff = diff
            closestColourIndex = i
        }
    }
    return closestColourIndex
}

(async function() {
    // Extract raw, unsigned 8-bit RGBA pixel data from JPEG input
    let data = await sharp('image.png')
    .resize(width,height)
    .raw()
    .toBuffer()
    let index = 0;
    let rgb_values = [];


    // make array with the replicube colour codes
    while(index < data.length){

        let red = data[index]
        let green = data[index + 1]
        let blue = data[index + 2]
        let alpha = data[index + 3]


        //console.log(red,green,blue,alpha)
        rgb_values.push(
            getClosestColourId(red,green,blue,alpha)
        );

        index += 4;
    }

    //sharp('image4.png').resize(width,height).pipe(fs.createWriteStream('image2.png'))

    //let str = scriptTemplate.replace("{PIXELDATA}", rgb_values.join(','))

    // format it nicely
    let pixeldata = ''
    let i = 0
    for (let col of rgb_values) {
        i++
        i%=width
        pixeldata+=col.toString().padStart(2,"0") + ','
        if (i==0) {
            pixeldata+='\n'
        }
    }
    let str = scriptTemplate.replace("{PIXELDATA}", pixeldata)

    console.log(`drew ${rgb_values.length} pixels`)

    // output
    fs.writeFileSync('output.lua',str)
})();
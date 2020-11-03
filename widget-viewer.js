// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: file-medical-alt;

const casesByBundeslandApiUrl = 'https://services1.arcgis.com/YfxQKFk1MjjurGb5/arcgis/rest/services/AUSTRIA_COVID19_Cases/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json'

function createSymbol(name, font) {
    let sym = SFSymbol.named(name)
    sym.applyFont(font)
    return sym
}

let widget = await createWidget()

//gradient background
let startColor = new Color("#606c88")
let endColor = new Color("#3f4c6b")
let gradient = new LinearGradient()
gradient.colors = [startColor, endColor]
gradient.locations = [0.5, 1]

widget.backgroundGradient = gradient


if (!config.runsInWidget) {
 await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
    let data, attr, label, incidenceCurrentLocation, casesCurrentLocation, cityNameCurrentLocation, lastUpdateCurrentLocation
    var total = 0
    
    if (!args.widgetParameter){
        cityNameCurrentLocation = "Wien"
    } else {
        cityNameCurrentLocation = args.widgetParameter
    }
    
    const list = new ListWidget()
    
    // fetch data
    data = await new Request(casesByBundeslandApiUrl).loadJSON()

    
    if(!data || !data.features || !data.features.length) {
        const errorList = new ListWidget()
        errorList.addText("Keine Ergebnisse für die Anfrage nach den Neuinfektionen.")
        return errorList
    }
    
    for(var i=0; i < data.features.length; i++){
        total += data.features[i].attributes.zuwachs;
        if(data.features[i].attributes.bundesland == cityNameCurrentLocation) {
            casesCurrentLocation = data.features[i].attributes.zuwachs;
            lastUpdateCurrentLocation = new Date(data.features[i].attributes.datum)
        }
    }
    
    let header = list.addText("🦠 Neuinfektionen ".toUpperCase())
    header.centerAlignText()
    header.font = Font.mediumSystemFont(8)
    
    list.addSpacer()

    let font1 = Font.semiboldSystemFont(18)
    let sym1 = createSymbol("arrow.up", font1)
    
    let horizontalStack1 = list.addStack()
    horizontalStack1.layoutHorizontally()
    horizontalStack1.addSpacer(25)
    horizontalStack1.centerAlignContent()
    
    let wimg1 = horizontalStack1.addImage(sym1.image)
    wimg1.resizable = false
    wimg1.tintColor = Color.red()
    wimg1.imageSize = new Size(22,22)
    wimg1.centerAlignImage()
    
    horizontalStack1.addSpacer(1)
    
    let label1 = horizontalStack1.addText(total.toString())
    label1.font = Font.semiboldSystemFont(22)
    label1.centerAlignText()
    
    
    let country = list.addText("Österreich")
    country.centerAlignText()
    country.font = Font.mediumSystemFont(12)
    country.textColor = new Color("#f2f3f4")
    
    list.addSpacer()
    
    let font2 = Font.systemFont(16)
    let sym2 = createSymbol("arrow.up", font2)
 
    let horizontalStack2 = list.addStack()
    horizontalStack2.layoutHorizontally()
    horizontalStack2.addSpacer(25)
    horizontalStack2.centerAlignContent()
    
    let wimg2 = horizontalStack2.addImage(sym2.image)
    wimg2.resizable = false
    wimg2.tintColor = Color.red()
    wimg2.imageSize = new Size(22,22)
    wimg2.centerAlignImage()
    
    horizontalStack2.addSpacer(1)
    
    let label2 = horizontalStack2.addText(casesCurrentLocation.toString())
    label2.font = Font.systemFont(22)
    label2.centerAlignText()
    
    /*
    label = list.addText("+"+casesCurrentLocation)
    label.font = Font.mediumSystemFont(20)
    label.centerAlignText()
    */

    let city = list.addText(cityNameCurrentLocation)
    city.centerAlignText()
    city.font = Font.mediumSystemFont(12)
    city.textColor = new Color("#f2f3f4")

    
    args.widgetParameter

    list.addSpacer()
    
    const options = { hour: '2-digit', minute: '2-digit' };
    
    let label3 = list.addText("letztes Update: ")
    label3.centerAlignText()
    label3.font = Font.mediumSystemFont(6)  
    
    label3 = list.addText(lastUpdateCurrentLocation.toLocaleDateString(Device.locale().replace("_", "-"), options))

    
    label3.centerAlignText()
    label3.font = Font.mediumSystemFont(6)

 return list
}